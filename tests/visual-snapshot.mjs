import {chromium} from 'playwright';
import {mkdir,writeFile} from 'node:fs/promises';
import assert from 'node:assert/strict';

const BASE=process.env.SITE_PREVIEW_URL||'http://127.0.0.1:4173/';
const out='evidence/visual-preview';
await mkdir(out,{recursive:true});
const browser=await chromium.launch({headless:true});
const evidence=[];
let failed=false;
try{
 for(const width of [320,390,768,1024,1440]){
  const page=await browser.newPage({viewport:{width,height:850},deviceScaleFactor:1,reducedMotion:'reduce'});
  const errors=[];
  page.on('pageerror',err=>errors.push(err.message));
  await page.route('**/api/catalog',route=>route.abort('failed'));
  await page.goto(BASE,{waitUntil:'domcontentloaded',timeout:30000});
  await page.waitForFunction(()=>document.querySelectorAll('#service-list .service').length>0,{timeout:20000});
  const measures=await page.evaluate(()=>{
   const s=(q)=>[...document.querySelectorAll(q)];
   const rect=(el)=>{const b=el.getBoundingClientRect();return {width:Math.round(b.width),height:Math.round(b.height),right:Math.round(b.right)}};
   return {
    viewport:window.innerWidth,
    documentWidth:document.documentElement.scrollWidth,
    serviceCount:s('#service-list .service').length,
    productCount:s('#product-list .product-card').length,
    bookingButtons:s('#service-list .booking-link').map(rect),
    primaryButtons:s('button.primary, a.primary').filter(el=>rect(el).width>0).map(rect),
    offlineBanner:s('.catalog-source-note').map(el=>el.textContent),
    font:window.getComputedStyle(document.querySelector('body')).fontFamily
   };
  });
  await page.screenshot({path:`${out}/site-${width}.png`,fullPage:true,animations:'disabled'});
  if(width<=390){
   const menu=page.locator('button.menu');
   await menu.click();
   assert.equal(await menu.getAttribute('aria-expanded'),'true');
   await page.screenshot({path:`${out}/site-menu-${width}.png`,fullPage:false,animations:'disabled'});
   await page.keyboard.press('Escape');
   assert.equal(await menu.getAttribute('aria-expanded'),'false');
  }
  const issues=[];
  if(measures.documentWidth>width+2)issues.push(`Horizontal overflow +${measures.documentWidth-width}px`);
  if(measures.serviceCount<1)issues.push('Services not rendered after outage');
  if(measures.productCount<1)issues.push('Products not rendered after outage');
  if(measures.bookingButtons.some(x=>x.width<108||x.height<40))issues.push('Catalog action under 108px wide or 40px tall');
  if(errors.length)issues.push('Browser errors: '+errors.join('; '));
  evidence.push({width,...measures,errors,issues});
  if(issues.length)failed=true;
  await page.close();
 }
}finally{
 await writeFile(`${out}/measurements.json`,JSON.stringify(evidence,null,2));
 await browser.close();
}
console.log(JSON.stringify(evidence.map(({width,documentWidth,serviceCount,productCount,issues})=>({width,documentWidth,serviceCount,productCount,issues})),null,2));
if(failed)process.exitCode=1;
