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
  // Browser screenshots normally do not scroll through lazy-loaded photos.
  // Explicitly request media to verify the DIKIDI CDN instead of accepting blank cards.
  if(width===390||width===1440){
    await page.evaluate(()=>document.querySelectorAll('a[data-photo-group] img, #team img.staff-portrait').forEach(img=>{img.loading='eager'}));
    await page.waitForFunction(()=>[...document.querySelectorAll('#team img.staff-portrait')].every(img=>img.complete&&img.naturalWidth>0),null,{timeout:25000}).catch(()=>{});
    await page.waitForFunction(()=>[...document.querySelectorAll('#gallery .photo-card img')].every(img=>img.complete),null,{timeout:20000}).catch(()=>{});
  }
  const measures=await page.evaluate(()=>{
   const s=(q)=>[...document.querySelectorAll(q)];
   const rect=(el)=>{const b=el.getBoundingClientRect();return {width:Math.round(b.width),height:Math.round(b.height),right:Math.round(b.right)}};
   return {
    viewport:window.innerWidth,
    documentWidth:document.documentElement.scrollWidth,
    serviceCount:s('#service-list .service').length,
    productCount:s('#product-list .product-card').length,
    staffPortraits:s('#team img.staff-portrait').length,
    loadedStaffPortraits:s('#team img.staff-portrait').filter(img=>img.complete&&img.naturalWidth>0).length,
    sourcePhotos:s('#gallery .photo-card img').length,
    loadedPhotos:s('#gallery .photo-card img').filter(img=>img.complete&&img.naturalWidth>0).length,
    brokenPhotos:s('#gallery .photo-card img').filter(img=>img.complete&&img.naturalWidth===0).length,
    bookingButtons:s('#service-list .booking-link').map(rect),
    primaryButtons:s('button.primary, a.primary').filter(el=>rect(el).width>0).map(rect),
    offlineBanner:s('.catalog-source-note').map(el=>el.textContent),
    font:window.getComputedStyle(document.querySelector('body')).fontFamily,
    skipLinkHidden:(()=>{const el=document.querySelector('.skip-link');return !el||el.getBoundingClientRect().bottom<=0})()
   };
  });
  if(width===390||width===1440){
   const staffPhotos=page.locator('#team .staff-portrait');
   for(let index=0;index<await staffPhotos.count();index++){
     await staffPhotos.nth(index).scrollIntoViewIfNeeded();
     await staffPhotos.nth(index).evaluate(async(img)=>{try{await img.decode()}catch{}});
   }
   await page.locator('#team').screenshot({path:`${out}/team-${width}.png`,animations:'disabled'});
   const photos=page.locator('#gallery .photo-card img');
   for(let index=0;index<await photos.count();index++){
     await photos.nth(index).scrollIntoViewIfNeeded();
     await photos.nth(index).evaluate(async(img)=>{try{await img.decode()}catch{}});
   }
   await page.locator('#gallery').screenshot({path:`${out}/gallery-${width}.png`,animations:'disabled'});
   const allPhotos=page.locator('a[data-photo-group] img');
   await allPhotos.evaluateAll(images=>images.forEach(img=>{img.loading='eager'}));
   for(let n=0;n<await allPhotos.count();n++){await allPhotos.nth(n).evaluate(async img=>{try{await img.decode()}catch{}})}
   const broken=await allPhotos.evaluateAll(images=>images.filter(img=>!img.complete||!img.naturalWidth).map(img=>img.getAttribute('src')));
   assert.deepEqual(broken,[],'Public salon/work/certificate photos must load');
   await page.locator('#gallery a.photo-card').first().click();
   await page.locator('.photo-viewer[open]').waitFor();
   await page.keyboard.press('ArrowRight');
   assert.match(await page.locator('.photo-viewer [data-count]').innerText(),/^2 \/ /);
   await page.keyboard.press('Escape');
   await page.locator('.photo-viewer[open]').waitFor({state:'hidden'});
   await page.screenshot({path:`${out}/gallery-after-close-${width}.png`,animations:'disabled'});
   await page.evaluate(()=>window.scrollTo(0,0));
  }
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
  if((width===390||width===1440)&&measures.staffPortraits!==4)issues.push('Four verified staff portraits must render');
  if((width===390||width===1440)&&measures.loadedStaffPortraits!==4)issues.push('DIKIDI staff portrait images did not load');
  if((width===390||width===1440)&&measures.sourcePhotos!==13)issues.push('Thirteen work photos must be separate from staff portraits');
  if((width===390||width===1440)&&measures.loadedPhotos!==13)issues.push('Some DIKIDI portfolio images did not load');
  if(!measures.skipLinkHidden)issues.push('Skip navigation link overlays content without keyboard focus');
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
