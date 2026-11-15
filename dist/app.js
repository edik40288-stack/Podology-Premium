
'use strict';
const $ = s => document.querySelector(s);
const $$ = s => document.querySelectorAll(s);
const escapeHTML = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const money = n => Number(n).toLocaleString('ru-RU') + ' ₽';

let publicMedia=[],services=[],products=[],category='Все',search='',showAll=false;
const categories=['Все','ПОДОЛОГИЯ','Педикюр и Маникюр ЭСТЕТИКА','Ногтевой Сервис'];
const categoryLabels=['Все услуги','Подология','Эстетический уход','Ногтевой сервис'];
const CRM_BASE=['localhost','127.0.0.1'].includes(location.hostname)?'http://127.0.0.1:8787':'https://podocare-center-crm.rainyplum10.chatgpt.site';
let analyticsSession='';
function track(event,step){try{analyticsSession=analyticsSession||sessionStorage.getItem('podology-analytics-session')||crypto.randomUUID().replace(/-/g,'');sessionStorage.setItem('podology-analytics-session',analyticsSession);navigator.sendBeacon(new URL('/api/analytics',CRM_BASE),new Blob([JSON.stringify({session:analyticsSession,event,step,surface:'website'})],{type:'text/plain'}))}catch{}}
track('page_view');addEventListener('pagehide',()=>track('page_exit'));
function clientPortal(section,param,value){
 let dialog=document.querySelector('#live-client-dialog');
 if(!dialog){dialog=document.createElement('dialog');dialog.id='live-client-dialog';dialog.className='live-client-dialog';dialog.innerHTML='<button type="button" class="primary" aria-label="Закрыть кабинет">Закрыть ×</button><iframe title="Защищённый кабинет клиента"></iframe><p>Если кабинет не открывается, <a target="_blank" rel="noopener">откройте его в отдельном окне</a>.</p>';document.body.append(dialog);dialog.querySelector('button').onclick=()=>dialog.close();dialog.addEventListener('close',()=>dialog.querySelector('iframe').src='about:blank');}
 const url=new URL('/client',CRM_BASE);if(analyticsSession)url.searchParams.set('analyticsSession',analyticsSession);if(param&&value!=null)url.searchParams.set(param,String(value));url.hash=section;
 dialog.querySelector('iframe').src=url.href;dialog.querySelector('a').href=url.href;if(!dialog.open)dialog.showModal();
}
function openBooking(id){track('service_open');clientPortal('services','service',id)}
function openOrder(id){track('product_open');clientPortal('products','product',id)}
function openCabinet(section='overview'){const url=new URL('/client',CRM_BASE);if(analyticsSession)url.searchParams.set('analyticsSession',analyticsSession);url.hash=section;window.location.assign(url.href)}
function openClientProfile(){openCabinet('overview')}
function manageBookings(){openCabinet('visits')}
function closeBooking(){document.querySelector('#booking-dialog')?.close()}
function closeOrder(){document.querySelector('#order-dialog')?.close()}
function selectCategory(c) {
  category = c; search = ''; showAll = false;
  if ($('#search')) $('#search').value = '';
  renderServices();
  const sec = $('#services');
  if (sec) sec.scrollIntoView({behavior: 'smooth'});
  closeNavigation();
}

function renderServices() {
  let filtered = services.filter(s => (category === 'Все' || s.category === category) && s.name.toLowerCase().includes(search.toLowerCase()));
  let list = showAll ? filtered : filtered.slice(0, 8);
  if ($('#category-tabs')) {
    $('#category-tabs').innerHTML = categories.map((c, i) => `<button type="button" aria-pressed="${c === category ? 'true' : 'false'}" class="${c === category ? 'active' : ''}" onclick="selectCategory('${c}')">${categoryLabels[i]}</button>`).join('');
  }
  if ($('#result-count')) $('#result-count').textContent = 'Найдено: ' + filtered.length;
  if ($('#service-list')) {
    $('#service-list').innerHTML = list.map((s, i) => `
      <article class="service">
        <span class="service-num">${String(i + 1).padStart(2, '0')}</span>
        <div>
          <h3>${escapeHTML(s.name)}</h3>
          <small>${escapeHTML(categoryLabels[categories.indexOf(s.category)] ?? s.category)}</small>
        </div>
        <span class="duration">${escapeHTML(s.duration)} мин</span>
        <span class="price">${s.floating ? 'от ' : ''}${money(s.price)}</span>
        <button class="booking-link" aria-label="Записаться: ${escapeHTML(s.name)}" data-service="${escapeHTML(s.id)}">Записаться <svg class="direction-icon" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 18 18 6M6 6h12v12"/></svg></button>
      </article>
    `).join('') || '<p class="empty">Услуга не найдена. Попробуйте другое название.</p>';
  }
  if ($('#show-more')) {
    $('#show-more').hidden = filtered.length <= 8;
    $('#show-more').setAttribute('aria-expanded',String(showAll));
    $('#show-more').innerHTML = showAll ? 'Свернуть список ↑' : `Показать все ${filtered.length} услуг ↓`;
  }
}

function chooseConsultation() {
  const c = services.find(s => s.name.trim().toUpperCase() === 'КОНСУЛЬТАЦИЯ ПОДОЛОГА' && s.price === 0);
  openBooking(c?.id || services[0]?.id);
}

// Certificates (WEB-17)
const certificateScans={"IMG_8286.PNG": "assets/certificates/nail-house-013.jpg", "IMG_8272.PNG": "assets/certificates/orthonyxia-01100622.jpg", "IMG_8283.PNG": "assets/certificates/plantar-warts-01310522.jpg", "IMG_8284.PNG": "assets/certificates/prosthetics-01301122.jpg", "IMG_8288.PNG": "assets/certificates/onychomycosis-2023.jpg", "IMG_8292.PNG": "assets/certificates/wounds-10100823.jpg", "IMG_8281.PNG": "assets/certificates/podiafarm-pfnn-0823-342.jpg", "IMG_8285.PNG": "assets/certificates/kane-0000972.jpg"};
function openCertificate(src,title){
 const clean=certificateScans[src.split("/").pop()];if(!clean)return;
 $("#certificate-title").textContent=title;const img=document.createElement("img");img.src=clean;img.alt=title;$("#certificate-viewport").replaceChildren(img);
 $("#certificate-source-note").textContent="Оригинальный скан документа об обучении. Даты и содержание сохранены.";$("#certificate-dialog").showModal();
}
function closeCertificate() {
  $('#certificate-dialog').close();
}

const officialPortfolio=[{"kind": "results", "url": "assets/works/manicure-1.jpg", "title": "Маникюр — работа центра, пример 1", "local": true}, {"kind": "results", "url": "assets/works/manicure-2.jpg", "title": "Маникюр — работа центра, пример 2", "local": true}, {"kind": "results", "url": "assets/works/manicure-3.jpg", "title": "Маникюр — работа центра, пример 3", "local": true}, {"kind": "results", "url": "assets/works/manicure-4.jpg", "title": "Маникюр — работа центра, пример 4", "local": true}];
function renderMedia(){
 for(const [kind,selector] of [['interior','.space-section'],['results','#directions']]){
  const section=document.querySelector(selector);if(!section)continue;let gallery=section.querySelector('.real-photo-gallery');if(!gallery){gallery=document.createElement('div');gallery.className='real-photo-gallery';section.append(gallery)}
  gallery.replaceChildren(...[...officialPortfolio,...publicMedia].filter(m=>m.kind===kind).map(m=>{const figure=document.createElement('figure'),img=document.createElement('img'),caption=document.createElement('figcaption');img.src=new URL(m.url,m.local?window.location.href:CRM_BASE);img.alt=m.title;img.loading='lazy';caption.textContent=m.title;figure.append(img,caption);return figure}));
 }
}
function renderProducts() {
  $('#product-list').innerHTML = products.map((p, i) => `
    <article class="product-card">
      <div class="product-visual" role="img" aria-label="${escapeHTML(p.name)}">
        ${publicMedia.some(m=>m.kind==='product'&&m.entity===p.id)?`<img src="${escapeHTML(new URL(publicMedia.find(m=>m.kind==='product'&&m.entity===p.id).url,CRM_BASE).href)}" alt="${escapeHTML(p.name)}" loading="lazy">`:'<div class="bottle">✳</div>'}
        <small>Оригинальный сертифицированный уход</small>
      </div>
      <div class="product-info">
        <div class="eyebrow">ДОМАШНИЙ УХОД / ${String(i + 1).padStart(2, '0')}</div>
        <h3>${escapeHTML(p.name)}</h3>
        <p>Профессиональный уход для домашнего применения. Наличие подтверждается в центре.</p>
        <div class="product-price">
          <b>${money(p.price)}</b>
          <button class="booking-link" data-product="${escapeHTML(p.id)}">Заказать <svg class="direction-icon" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 18 18 6M6 6h12v12"/></svg></button>
        </div>
      </div>
    </article>
  `).join('');
}

function closeNavigation() {
  const nav = document.querySelector('#main-navigation');
  const button = document.querySelector('.menu');
  if (!nav || !nav.classList.contains('open')) return;
  nav.classList.remove('open');
  button?.setAttribute('aria-expanded', 'false');
  button?.setAttribute('aria-label', 'Открыть меню');
}
function toggleNavigation() {
  const nav = document.querySelector('#main-navigation');
  const isOpen = nav.classList.toggle('open');
  const button = document.querySelector('.menu');
  if (button) {
    button.setAttribute('aria-expanded', String(isOpen));
    button.setAttribute('aria-label', isOpen ? 'Закрыть меню' : 'Открыть меню');
  }
}

// Keep expanded mobile navigation and its menu button in sync.
document.querySelector('#main-navigation')?.addEventListener('click', e => {
  if (e.target.closest('a[href^="#"]')) closeNavigation();
});
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeNavigation();
});
document.addEventListener('click', e => {
  if (!e.target.closest('header')) closeNavigation();
});
// Close dialog on backdrop click
['booking-dialog', 'order-dialog', 'profile-dialog', 'certificate-dialog'].forEach(id => {
  const d = document.getElementById(id);
  if (d) {
    d.addEventListener('click', e => {
      if (e.target === d) {
        const r = d.getBoundingClientRect();
        if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) {
          d.close();
        }
      }
    });
  }
});


document.addEventListener('click',e=>{const button=e.target.closest?.('[data-service],[data-product]');if(button?.hasAttribute('data-service'))openBooking(button.dataset.service);else if(button?.hasAttribute('data-product'))openOrder(button.dataset.product)});
// Load live catalog
async function loadCatalog() {
  try {
    const res = await fetch(new URL('/api/catalog', CRM_BASE));
    if (!res.ok) throw new Error();
    const data = await res.json();
    publicMedia=Array.isArray(data.media)?data.media:[];renderMedia();
    if (Array.isArray(data.services) && data.services.length) services = data.services;
    if (Array.isArray(data.products) && data.products.length) products = data.products;
  } catch (e) {
    services=[];products=[];
    renderServices();renderProducts();
    if($('#service-list'))$('#service-list').innerHTML='<p role="alert">Не удалось загрузить актуальный каталог. Повторите загрузку страницы или свяжитесь с центром.</p>';
    if($('#product-list'))$('#product-list').innerHTML='<p role="alert">Каталог товаров временно недоступен.</p>';
    return;
  }

  renderServices();
  renderProducts();
}
$('#search')?.addEventListener('input',e=>{search=e.target.value;renderServices()});
loadCatalog();

renderMedia();

// The complete client cabinet remains a standalone application, as before registration.
const cabinetLink=document.querySelector('#client-account');if(cabinetLink)cabinetLink.href=new URL('/client#overview',CRM_BASE).href;
