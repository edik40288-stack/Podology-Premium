import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';

const js=readFileSync(new URL('../dist/app.js',import.meta.url),'utf8');
const localServices=JSON.parse(readFileSync(new URL('../dist/services.json',import.meta.url),'utf8'));
const localProducts=JSON.parse(readFileSync(new URL('../dist/products.json',import.meta.url),'utf8'));

function makeNode(tag='div'){
  const attrs=new Map(), classes=new Set();
  return {
    tag,innerHTML:'',textContent:'',hidden:false,value:'',href:'',children:[],dataset:{},
    classList:{contains:c=>classes.has(c),add:c=>classes.add(c),remove:c=>classes.delete(c),toggle:c=>classes.has(c)?(classes.delete(c),false):(classes.add(c),true)},
    setAttribute:(k,v)=>attrs.set(k,String(v)),getAttribute:k=>attrs.get(k),
    addEventListener(){},scrollIntoView(){this.scrolled=true},close(){},append(...x){this.children.push(...x)},
    replaceChildren(...x){this.children=x},
    querySelector(){return null},parentNode:{insertBefore(node){node.added=true}}
  };
}
function fixture({api=null,failing=false}={}){
  const nodes=new Map(['#category-tabs','#service-list','#result-count','#show-more','#product-list','#search','#client-account','#main-navigation','.menu','#contacts','#services'].map(sel=>[sel,makeNode()]));
  const navigations=[];
  const document={
    querySelector:sel=>nodes.get(sel)||null,querySelectorAll:()=>[],
    getElementById:()=>null,createElement:tag=>makeNode(tag),
    addEventListener(){}
  };
  const fetch=async(input)=>{
    const url=String(input);
    if(url.includes('/api/catalog')){
      if(failing)throw Error('connection refused');
      return {ok:true,json:async()=>api||{services:[],products:[]}};
    }
    if(url==='services.json')return {ok:true,json:async()=>localServices};
    if(url==='products.json')return {ok:true,json:async()=>localProducts};
    throw Error('Unexpected network request: '+url);
  };
  const context=vm.createContext({
    document,fetch,URL,AbortSignal,Blob,crypto:globalThis.crypto,
    location:{hostname:'example.test'},addEventListener(){},
    sessionStorage:{getItem(){return null},setItem(){}},
    navigator:{sendBeacon(){return true}},
    window:{location:{href:'https://example.test',assign:url=>navigations.push(url)}},
    console
  });
  // The production file invokes an initial load automatically; remove that call to control async timing.
  const init=js.replace(/^loadCatalog\(\);$/m,'');
  assert.notEqual(init,js,'Expected one bootstrapped catalog call');
  vm.runInContext(init,context,{timeout:1500});
  return {context,nodes,navigations,load:()=>vm.runInContext('loadCatalog()',context)};
}

test('website JS parses and static snapshots contain publishable reference rows',()=>{
  assert.doesNotThrow(()=>new vm.Script(js));
  assert.equal(localServices.length,99,'Expected 99 unique services from verified DIKIDI audit');
  assert.ok(localProducts.length>0);
  assert.ok(localServices.every(x=>x.id!=null&&typeof x.name==='string'&&Number.isFinite(x.price)));
});

test('outage falls back to clearly labelled, read-only services/products',async()=>{
  const f=fixture({failing:true});
  await f.load();
  assert.ok(f.nodes.get('#service-list').innerHTML.includes('Уточнить'));
  assert.ok(!f.nodes.get('#service-list').innerHTML.includes('data-service='));
  assert.ok(f.nodes.get('#product-list').innerHTML.includes('Уточнить наличие'));
  assert.ok(!f.nodes.get('#product-list').innerHTML.includes('data-product='));
  assert.equal(vm.runInContext('servicesLive',f.context),false);
  assert.equal(vm.runInContext('productsLive',f.context),false);
  vm.runInContext("openBooking('123')",f.context);
  assert.equal(f.navigations.length,0,'Must not attempt live booking while offline');
  assert.equal(f.nodes.get('#contacts').scrolled,true,'Contacts must be reachable when offline');
});

test('live booking uses full portal page and retains requested service',async()=>{
  const f=fixture({api:{services:[{id:'s1',name:'Консультация',category:'ПОДОЛОГИЯ',price:1000,duration:30,floating:false}],products:[]}});
  await f.load();
  assert.ok(f.nodes.get('#service-list').innerHTML.includes('data-service="s1"'));
  vm.runInContext("openBooking('s1')",f.context);
  assert.equal(f.navigations.length,1);
  const url=new URL(f.navigations[0]);
  assert.equal(url.pathname,'/client');
  assert.equal(url.hash,'#services');
  assert.equal(url.searchParams.get('service'),'s1');
  assert.ok(!js.includes("document.createElement('iframe')"));
});

test('only confirmed available live products can be ordered',async()=>{
  const f=fixture({api:{services:[],products:[
    {id:'a',name:'Доступный товар',price:1000,confirmed:true,available:3},
    {id:'b',name:'Не в наличии',price:1100,confirmed:true,available:0},
    {id:'c',name:'Не подтверждён',price:1200,confirmed:false,available:5}
  ]}});
  await f.load();
  const content=f.nodes.get('#product-list').innerHTML;
  assert.equal((content.match(/data-product=/g)||[]).length,1);
  assert.ok(content.includes('data-product="a"'));
  assert.ok(!content.includes('data-product="b"'));
  assert.ok(!content.includes('data-product="c"'));
  vm.runInContext("openOrder('a')",f.context);
  assert.equal(new URL(f.navigations[0]).searchParams.get('product'),'a');
});

test('mobile menu toggle and close keep ARIA expanded state in sync',()=>{
  const f=fixture();
  vm.runInContext('toggleNavigation()',f.context);
  assert.equal(f.nodes.get('.menu').getAttribute('aria-expanded'),'true');
  assert.equal(f.nodes.get('#main-navigation').classList.contains('open'),true);
  vm.runInContext('closeNavigation()',f.context);
  assert.equal(f.nodes.get('.menu').getAttribute('aria-expanded'),'false');
});

test('DIKIDI price revisions, four categories and zero-price consultation are consistent',async()=>{
 assert.equal(new Set(localServices.map(x=>String(x.id))).size,99);
 assert.equal(new Set(localServices.map(x=>x.category)).size,4);
 assert.equal(localServices.find(x=>String(x.id)==='19789766').price,5000);
 assert.equal(localServices.find(x=>String(x.id)==='23006065').duration,80);
 assert.equal(localServices.find(x=>String(x.id)==='23005974').duration,100);
 assert.equal(localServices.find(x=>String(x.id)==='local-cito-daily-20261115').price,14000);
 assert.equal(localServices.find(x=>String(x.id)==='local-podology-consult-60-20261115').price,1500);
 assert.equal(localServices.filter(x=>x.price===0).length,1);
 const f=fixture({api:{services:localServices,products:localProducts}});
 await f.load();
 vm.runInContext('chooseConsultation()',f.context);
 assert.equal(new URL(f.navigations[0]).searchParams.get('service'),'22883627','Free consultation ID must remain stable');
});

test('real photo gallery includes only attributed, explicitly provided DIKIDI image URLs',()=>{
 const html=readFileSync(new URL('../dist/index.html',import.meta.url),'utf8');
 const images=[...html.matchAll(/<img[^>]+src="(https:\/\/f2\.dikidi\.ru\/[^"]+)"[^>]*>/g)].map(m=>m[1]);
 assert.equal(images.length,11);
 assert.equal((html.match(/class="dikidi-photo"/g)||[]).length,9,'Nine actual portfolio images, no staff portraits in portfolio');
 assert.equal((html.match(/class="staff-portrait"/g)||[]).length,2,'Two precisely attributed staff portraits');
 assert.ok(html.includes('Елена Малышева')&&html.includes('Стасия'));
 assert.ok(html.includes('Врач-ортопед'));
 assert.ok(!html.includes('Стасия</h3><p>Мастер ногтевого сервиса</p>')); // Cards now have descriptions and roles.

 assert.equal(new Set(images).size,11);
 assert.ok(html.includes('https://dikidi.net/ru/profile/centr_podologii_kucytoj_1711451'));
 assert.ok(html.includes('Стасия'));
 assert.ok(!html.includes('Фотографии и подробные профили дополним позже.'));
 assert.ok(!html.includes('Ежедневно 10:00–21:00'));
});
