'use strict';
const $=s=>document.querySelector(s),escapeHTML=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])),money=n=>Number(n).toLocaleString('ru-RU')+' ₽';
let services=[],products=[],category='Все',search='',showAll=false,catalogLoaded=false;
const categories=['Все','ПОДОЛОГИЯ','Педикюр и Маникюр ЭСТЕТИКА','Ногтевой Сервис'],categoryLabels=['Все услуги','Подология','Эстетический уход','Ногтевой сервис'];
function selectCategory(c){category=c;search='';showAll=false;$('#search').value='';renderServices();$('#services').scrollIntoView({behavior:'smooth'});document.querySelector('nav').classList.remove('open')}
function renderServices(){if(!catalogLoaded)return;let filtered=services.filter(s=>(category==='Все'||s.category===category)&&s.name.toLowerCase().includes(search.toLowerCase())),list=showAll?filtered:filtered.slice(0,8);$('#category-tabs').innerHTML=categories.map((c,i)=>`<button class="${c===category?'active':''}" onclick="selectCategory('${c}')">${categoryLabels[i]}</button>`).join('');$('#result-count').textContent='Найдено: '+filtered.length;const summary=document.querySelector('#services .section-heading p');if(summary)summary.textContent='Выберите услугу. Стоимость и длительность указаны до записи.';$('#service-list').innerHTML=list.map((s,i)=>`<article class="service"><span class="service-num">${String(i+1).padStart(2,'0')}</span><div><h3>${escapeHTML(s.name)}</h3><small>${escapeHTML(categoryLabels[categories.indexOf(s.category)]??s.category)}</small></div><span class="duration">${escapeHTML(s.duration)} мин</span><span class="price">${s.floating?'от ':''}${money(s.price)}</span><a class="booking-link" aria-label="Записаться: ${escapeHTML(s.name)}" href="${escapeHTML(clientUrl('services','service',s.id))}">↗</a></article>`).join('')||'<p class="empty">Услуга не найдена. Попробуйте другое название.</p>';$('#show-more').hidden=filtered.length<=8;$('#show-more').innerHTML=showAll?'Свернуть список ↑':`Показать все ${filtered.length} услуг ↓`}
function chooseConsultation(){const c=services.find(s=>s.name.trim().toUpperCase()==='КОНСУЛЬТАЦИЯ ПОДОЛОГА'&&s.price===0);openBooking(c?.id)}
$('#search').addEventListener('input',e=>{search=e.target.value;showAll=false;renderServices()});
const CRM_BASE=['localhost','127.0.0.1'].includes(location.hostname)?'http://127.0.0.1:8787':'https://podocare-center-crm.rainyplum10.chatgpt.site';
function clientUrl(section,key,id){
  const url=new URL('/client',CRM_BASE);
  url.hash=section;
  if(key&&id!=null)url.searchParams.set(key,String(id));
  return url.href;
}
$('#client-account').href=clientUrl('overview');
function openBooking(id){location.assign(clientUrl('services','service',id))}
if('IntersectionObserver' in window&&!matchMedia('(prefers-reduced-motion: reduce)').matches){document.documentElement.classList.add('js-motion');let observer=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('visible');observer.unobserve(e.target)}}),{threshold:.08});document.querySelectorAll('.reveal').forEach(el=>observer.observe(el))}

function openCertificate(src,title){$('#certificate-image').src=src;$('#certificate-title').textContent=title;$('#certificate-dialog').showModal()}
function closeCertificate(){$('#certificate-dialog').close()}
function renderProducts(){$('#product-list').innerHTML=products.map((p,i)=>`<article class="product-card"><div class="product-visual" role="img" aria-label="Условная иллюстрация упаковки, фотография появится позже"><div class="bottle">✳</div><small>Иллюстрация · фото добавим позже</small></div><div class="product-info"><div class="eyebrow">ДОМАШНИЙ УХОД / ${String(i+1).padStart(2,'0')}</div><h3>${escapeHTML(p.name)}</h3><p>Бренд, состав и объём упаковки уточняются.<br>Наличие подтвердит администратор.</p><div class="product-price"><b>${money(p.price)}</b>${p.available>0?`<a class="booking-link" href="${escapeHTML(clientUrl('products','product',p.id))}">Заказать ↗</a>`:'<span>Наличие уточняется</span>'}</div></div></article>`).join('')}
function manageBookings(){location.assign(clientUrl('visits'))}

function toggleNavigation(){const nav=document.querySelector('nav');const isOpen=nav.classList.toggle('open');const button=document.querySelector('.menu');button.setAttribute('aria-expanded',String(isOpen));button.setAttribute('aria-label',isOpen?'Закрыть меню':'Открыть меню')}
document.querySelectorAll('nav a').forEach(a=>a.addEventListener('click',()=>{document.querySelector('.menu').setAttribute('aria-expanded','false');document.querySelector('.menu').setAttribute('aria-label','Открыть меню')}));
window.addEventListener('resize',()=>{if(window.innerWidth>1100){document.querySelector('nav').classList.remove('open');document.querySelector('.menu').setAttribute('aria-expanded','false')}});

async function loadCatalog(){
  try{
    const response=await fetch(new URL('/api/catalog',CRM_BASE));
    if(!response.ok)throw new Error('Catalog unavailable');
    const data=await response.json();
    if(!Array.isArray(data.services)||!Array.isArray(data.products))throw new Error('Invalid catalog');
    const rank=s=>/первичный прием/i.test(s.name)?-2:/консультация подолога/i.test(s.name)?-1:0;
    services=[...data.services].sort((a,b)=>rank(a)-rank(b)||categories.indexOf(a.category)-categories.indexOf(b.category));
    products=data.products;
    catalogLoaded=true;
    renderServices();
    renderProducts();
    if(!products.length)$('#product-list').innerHTML='<p class="empty">Наличие товаров уточняется. Свяжитесь с центром.</p>';
  }catch{
    $('#service-list').textContent='Каталог услуг недоступен. Свяжитесь с центром по телефону +7 (985) 059-27-77.';
    $('#product-list').textContent='Каталог товаров недоступен. Уточните наличие по телефону центра.';
  }
}
loadCatalog();
