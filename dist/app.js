
'use strict';
const $ = s => document.querySelector(s);
const $$ = s => document.querySelectorAll(s);
const escapeHTML = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const money = n => Number(n).toLocaleString('ru-RU') + ' ₽';

let services = [], products = [], staff = [], category = 'Все', search = '', showAll = false, step = 0, b = {}, savedId = null, readError = false;
let basket = {}, order = {name:'', channel:'Telegram', contact:'', delivery:'pickup', address:'', comment:'', ack:false};

const categories = ['Все', 'ПОДОЛОГИЯ', 'Педикюр и Маникюр ЭСТЕТИКА', 'Ногтевой Сервис'];
const categoryLabels = ['Все услуги', 'Подология', 'Эстетический уход', 'Ногтевой сервис'];
const channels = ['Telegram', 'WhatsApp', 'Viber', 'MAX', 'ВКонтакте'];

const CRM_BASE = ['localhost', '127.0.0.1'].includes(location.hostname) ? 'http://127.0.0.1:8787' : 'https://podocare-center-crm.rainyplum10.chatgpt.site';

const today = () => new Intl.DateTimeFormat('sv-SE', {timeZone: 'Europe/Moscow'}).format(new Date());
const clock = m => String(Math.floor(m / 60)).padStart(2, '0') + ':' + String(m % 60).padStart(2, '0');
const dateText = d => new Date(d + 'T12:00:00').toLocaleDateString('ru-RU', {day: 'numeric', month: 'long', weekday: 'long'});
const service = id => services.find(s => s.id === Number(id));

const sum = () => b.ids.reduce((n, id) => n + (service(id)?.price || 0), 0);
const duration = () => b.ids.reduce((n, id) => n + (service(id)?.duration || 0), 0);
const isFloating = () => b.ids.some(id => service(id)?.floating);
const direction = () => b.ids.length ? service(b.ids[0])?.category || 'ПОДОЛОГИЯ' : 'ПОДОЛОГИЯ';

// Client Profile management (WEB-06, WEB-07, WEB-08)
function getClientProfile() {
  try {
    return JSON.parse(localStorage.getItem('kut-client-profile-v1') || 'null');
  } catch (e) {
    return null;
  }
}

function saveClientProfile(profile) {
  try {
    localStorage.setItem('kut-client-profile-v1', JSON.stringify(profile));
  } catch (e) {}
}

function clearClientProfile() {
  localStorage.removeItem('kut-client-profile-v1');
  renderProfile();
}

function openClientProfile() {
  renderProfile();
  const d = $('#profile-dialog');
  if (d && typeof d.showModal === 'function') d.showModal();
}

function renderProfile() {
  const p = getClientProfile();
  const el = $('#profile-content');
  if (!el) return;
  if (!p) {
    el.innerHTML = `
      <div class="notice">Для доступа к истории записей и быстрого оформления подтвердите номер телефона.</div>
      <form onsubmit="handleSendOtp(event)" class="account-form-grid" style="display:flex;flex-direction:column;gap:12px;">
        <label class="field">Номер телефона (РФ / СНГ)
          <input id="otp-phone" type="tel"  placeholder="+7 999 123-45-67" maxlength="20">
        </label>
        <div id="otp-step-code" style="display:none;flex-direction:column;gap:12px;">
          <label class="field">Код из СМС (для теста: 123456)
            <input id="otp-code" type="text" placeholder="123456" maxlength="6">
          </label>
          <label class="field">Ваше имя
            <input id="otp-name" type="text" placeholder="Александр" maxlength="50" >
          </label>
          <button type="button" class="primary" onclick="handleVerifyOtp()">Подтвердить и войти</button>
        </div>
        <button id="otp-send-btn" type="submit" class="primary">Получить код в СМС</button>
        <div id="otp-error" class="error" role="alert"></div>
      </form>
    `;
  } else {
    const list = records().filter(r => r.contact === p.phone || r.contact === p.contact || r.name === p.name);
    el.innerHTML = `
      <div class="account-profile-card" style="padding:16px;background:var(--sand-50,#fbfaf7);border-radius:8px;margin-bottom:16px;">
        <h3 style="margin-top:0;">${escapeHTML(p.name)}</h3>
        <p>Телефон / Контакт: <b>${escapeHTML(p.phone || p.contact)}</b></p>
        <p>Канал связи: <b>${escapeHTML(p.channel || 'Телефон')}</b></p>
        <button onclick="clearClientProfile()" style="font-size:12px;padding:6px 12px;background:none;border:1px solid #ccc;border-radius:4px;cursor:pointer;">Выйти из профиля</button>
      </div>
      <h3>Мои записи</h3>
      <div id="profile-visits-list">
        ${list.length ? list.map(r => `
          <div class="order-item" style="display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid #eee;">
            <div>
              <b>${dateText(r.date)} в ${clock(r.start)}</b><br>
              <small>${r.names.map(escapeHTML).join(', ')} (${r.duration} мин, ${money(r.price)})</small><br>
              <span style="font-size:11px;color:${r.status==='cancelled'?'#999':'#1b5e20'}">${r.status==='cancelled'?'Отменена':'Подтверждена'}</span>
            </div>
            ${canManage(r) ? `
              <div style="display:flex;gap:8px;">
                <button onclick="showReschedule('${r.id}')" style="font-size:11px;padding:4px 8px;">Перенести</button>
                <button onclick="cancelLocalBooking('${r.id}')" style="font-size:11px;padding:4px 8px;color:#c62828;">Отменить</button>
              </div>
            ` : ''}
          </div>
        `).join('') : '<p class="empty">У вас пока нет активных записей.</p>'}
      </div>
    `;
  }
}

function handleSendOtp(e) {
  e.preventDefault();
  const phone = $('#otp-phone').value.trim();
  const d = phone.replace(/\D/g, '');
  if (d.length < 10 || d.length > 15) {
    $('#otp-error').textContent = 'Введите корректный номер телефона (от 10 до 15 цифр).';
    return;
  }
  $('#otp-error').textContent = '';
  $('#otp-phone').disabled = true;
  $('#otp-send-btn').style.display = 'none';
  $('#otp-step-code').style.display = 'flex';
}

function handleVerifyOtp() {
  const code = $('#otp-code').value.trim();
  const name = $('#otp-name').value.trim();
  if (code.length < 4) {
    $('#otp-error').textContent = 'Введите код подтверждения из сообщения.';
    return;
  }
  if (!validName(name)) {
    $('#otp-error').textContent = 'Введите настоящее имя (от 2 до 50 буквенных символов).';
    return;
  }
  const phone = $('#otp-phone').value.trim();
  saveClientProfile({name, phone, contact: phone, channel: 'Телефон'});
  renderProfile();
}

// Validation rules (WEB-09, WEB-10)
function validName(n) {
  if (!n) return false;
  const t = n.trim();
  if (t.length < 2 || t.length > 50) return false;
  // Allow Russian/Latin letters, spaces, hyphens
  return /^[a-zA-Zа-яА-ЯёЁ\s\-]+$/.test(t);
}

function contactLabel(c) {
  return ['WhatsApp', 'Viber', 'Телефон'].includes(c) ? 'Номер телефона' : 'Имя пользователя или ссылка';
}

function contactPlaceholder(c) {
  return ['WhatsApp', 'Viber', 'Телефон'].includes(c) ? '+7 999 123-45-67' : '@username';
}

function validContact(c, v) {
  v = (v || '').trim();
  if (['WhatsApp', 'Viber', 'Телефон'].includes(c)) {
    const d = v.replace(/\D/g, '');
    return /^\+?[\d\s()\-]+$/.test(v) && d.length >= 10 && d.length <= 15;
  }
  if (c === 'Telegram') {
    return /^@?[a-zA-Z0-9_]{3,32}$/.test(v);
  }
  return v.length >= 2 && v.length <= 100 && !/[<>]/.test(v);
}

// Records
function records() {
  try {
    let v = JSON.parse(localStorage.getItem('kut-website-bookings-v1') || '[]');
    return Array.isArray(v) ? v : [];
  } catch (e) {
    readError = true;
    return [];
  }
}

function available(date, start, dur, cat, workerId) {
  if (date < today() || start < 600 || start + dur > 1260) return false;
  if (new Date(date + 'T' + clock(start) + ':00+03:00') <= new Date()) return false;
  return !records().some(r => r.status !== 'cancelled' && r.date === date && (!workerId || r.worker === workerId) && start < r.start + r.duration && start + dur > r.start);
}

function getSlots() {
  let list = [];
  for (let m = 600; m + duration() <= 1260; m += 30) {
    if (available(b.date, m, duration(), direction(), b.worker)) list.push(m);
  }
  return list;
}

function selectCategory(c) {
  category = c; search = ''; showAll = false;
  if ($('#search')) $('#search').value = '';
  renderServices();
  const sec = $('#services');
  if (sec) sec.scrollIntoView({behavior: 'smooth'});
  document.querySelector('nav')?.classList.remove('open');
}

function renderServices() {
  let filtered = services.filter(s => (category === 'Все' || s.category === category) && s.name.toLowerCase().includes(search.toLowerCase()));
  let list = showAll ? filtered : filtered.slice(0, 8);
  if ($('#category-tabs')) {
    $('#category-tabs').innerHTML = categories.map((c, i) => `<button class="${c === category ? 'active' : ''}" onclick="selectCategory('${c}')">${categoryLabels[i]}</button>`).join('');
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
        <button class="booking-link" aria-label="Записаться: ${escapeHTML(s.name)}" onclick="openBooking(${s.id})">Записаться ↗</button>
      </article>
    `).join('') || '<p class="empty">Услуга не найдена. Попробуйте другое название.</p>';
  }
  if ($('#show-more')) {
    $('#show-more').hidden = filtered.length <= 8;
    $('#show-more').innerHTML = showAll ? 'Свернуть список ↑' : `Показать все ${filtered.length} услуг ↓`;
  }
}

function chooseConsultation() {
  const c = services.find(s => s.name.trim().toUpperCase() === 'КОНСУЛЬТАЦИЯ ПОДОЛОГА' && s.price === 0);
  openBooking(c?.id || services[0]?.id);
}

// Booking flow (WEB-06, WEB-08, WEB-09, WEB-10, WEB-11, WEB-12, WEB-13, WEB-15, WEB-16)
function openBooking(id) {
  const profile = getClientProfile();
  b = {
    ids: id ? [Number(id)] : [services[0]?.id || 1],
    worker: '',
    date: today(),
    start: null,
    name: profile?.name || '',
    channel: profile?.channel || 'Telegram',
    contact: profile?.contact || profile?.phone || '',
    comment: '',
    ack: true
  };
  step = id ? 1 : 0;
  renderBooking();
  const d = $('#booking-dialog');
  if (d && typeof d.showModal === 'function') d.showModal();
}

function closeBooking() {
  const d = $('#booking-dialog');
  if (d && typeof d.close === 'function') d.close();
}

function error(t) {
  const el = $('#booking-error');
  if (el) el.textContent = t;
}

function selectedSummary() {
  return `${b.ids.length} услуг · ${duration()} мин · ${isFloating() ? 'от ' : ''}${money(sum())}`;
}

function renderBooking() {
  const names = ['Услуги и специалист', 'Дата и время', 'Контакты', 'Проверка'];
  let html = `<div class="dialog-top"><h2>${step === 4 ? 'Запись оформлена' : 'Запись на приём'}</h2><button class="close" aria-label="Закрыть запись" onclick="closeBooking()">×</button></div>`;
  
  if (step === 4) {
    let r = records().find(x => x.id === savedId) || b;
    html += `
      <div class="success" style="text-align:center;padding:24px 16px;">
        <span style="display:inline-block;width:48px;height:48px;line-height:48px;border-radius:50%;background:#e8f5e9;color:#2e7d32;font-size:24px;margin-bottom:16px;">✓</span>
        <h3>Запись подтверждена!</h3>
        <p><b>${dateText(r.date)}</b> · ${clock(r.start)}–${clock(r.start + r.duration)}</p>
        <p>${r.names.map(escapeHTML).join('<br>')}</p>
        <p>${r.floating ? 'от ' : ''}${money(r.price)} · ${r.duration} мин</p>
        ${r.workerName ? `<p>Специалист: <b>${escapeHTML(r.workerName)}</b></p>` : ''}
        <div class="notice" style="margin:16px 0;text-align:left;">
          Запись сохранена и отправлена администратору центра. Мы свяжемся с вами за день до визита.
        </div>
        <div style="display:flex;flex-direction:column;gap:10px;margin-top:16px;">
          <button class="primary" onclick="addToGoogleCalendar()">Добавить в Google Календарь ↗</button>
          <button class="minor-link" onclick="downloadBookingIcs()">Скачать файл календаря (.ics)</button>
          <button class="minor-link" onclick="openClientProfile()">Мои записи в кабинете</button>
          <a class="text-link" href="https://t.me/podologKUTSYTOY" target="_blank" rel="noopener">Написать нам в Telegram ↗</a>
        </div>
      </div>
    `;
    $('#booking-content').innerHTML = html;
    return;
  }

  html += `<div class="steps">${names.map((n, i) => `<span class="${i === step ? 'current' : ''}">${i + 1}. ${n}</span>`).join('')}</div>`;

  if (step === 0) {
    html += `
      <div class="notice">Выберите услугу и при желании конкретного специалиста центра.</div>
      <label class="field">Специалист
        <select onchange="b.worker=this.value;renderBooking()">
          <option value="">Любой свободный специалист</option>
          <option value="1" ${b.worker==='1'?'selected':''}>Александра Куцытой (Основатель, подолог)</option>
          <option value="2" ${b.worker==='2'?'selected':''}>Григорьевна Седа (Ортопед)</option>
          <option value="3" ${b.worker==='3'?'selected':''}>Елена Малышева (Подолог)</option>
          <option value="4" ${b.worker==='4'?'selected':''}>Юлия (Мастер ногтевого сервиса)</option>
        </select>
      </label>
      <input class="booking-search" placeholder="Поиск услуги…" aria-label="Поиск услуги для записи" oninput="renderBookingServices(this.value)">
      <div id="booking-services" class="booking-list"></div>
    `;
  }

  if (step === 1) {
    html += `
      <div class="notice">Центр открыт ежедневно с 10:00 до 21:00. Выберите удобное время.</div>
      <label class="field">Специалист
        <select onchange="b.worker=this.value;b.start=null;renderBooking()">
          <option value="">Любой свободный специалист</option>
          <option value="1" ${b.worker==='1'?'selected':''}>Александра Куцытой</option>
          <option value="2" ${b.worker==='2'?'selected':''}>Григорьевна Седа</option>
          <option value="3" ${b.worker==='3'?'selected':''}>Елена Малышева</option>
          <option value="4" ${b.worker==='4'?'selected':''}>Юлия</option>
        </select>
      </label>
      <label class="field">Дата визита
        <input type="date" min="${today()}" value="${b.date}" onchange="b.date=this.value;b.start=null;renderBooking()">
      </label>
      <h3 style="font-size:13px;margin:12px 0 6px;">Доступное время визита</h3>
      <div class="slots">${getSlots().map(m => `<button class="slot ${b.start === m ? 'selected' : ''}" onclick="b.start=${m};renderBooking()">${clock(m)}</button>`).join('')}</div>
      ${!getSlots().length ? '<div class="empty">На выбранную дату нет свободного времени. Пожалуйста, укажите другую дату.</div>' : ''}
    `;
  }

  if (step === 2) {
    html += `
      <div class="notice">Укажите контактные данные для подтверждения визита.</div>
      <label class="field">Ваше имя
        <input id="client-name" placeholder="Иван" maxlength="50" autocomplete="name" value="${escapeHTML(b.name)}" oninput="b.name=this.value">
      </label>
      <label class="field">Канал для связи
        <select aria-label="Канал связи" onchange="b.channel=this.value;renderBooking()">
          ${channels.map(c => `<option ${b.channel === c ? 'selected' : ''}>${c}</option>`).join('')}
        </select>
      </label>
      <label class="field">${contactLabel(b.channel)}
        <input id="client-contact" maxlength="100" placeholder="${contactPlaceholder(b.channel)}" value="${escapeHTML(b.contact)}" oninput="b.contact=this.value">
      </label>
      <label class="field">Комментарий или пожелания
        <textarea rows="2" maxlength="500" placeholder="Что беспокоит или важные детали" oninput="b.comment=this.value">${escapeHTML(b.comment)}</textarea>
      </label>
    `;
  }

  if (step === 3) {
    html += `
      <div class="notice">Проверьте выбранные услуги, дату и время перед подтверждением.</div>
      <h3 style="font-size:20px;margin-bottom:4px;">${dateText(b.date)}</h3>
      <p style="margin-top:0;">${clock(b.start)}–${clock(b.start + duration())} · Москва, Петрозаводская, 28 к. 1</p>
      <div style="background:#f9f8f4;padding:12px;border-radius:6px;margin-bottom:12px;">
        <p style="margin:0 0 6px;"><b>Клиент:</b> ${escapeHTML(b.name)}</p>
        <p style="margin:0;"><b>Связь (${escapeHTML(b.channel)}):</b> ${escapeHTML(b.contact)}</p>
      </div>
      ${b.ids.map(id => {
        let s = service(id);
        return `<div class="summary-line"><span>${escapeHTML(s?.name || '')}<small>${s?.duration || 0} мин</small></span><b>${s?.floating ? 'от ' : ''}${money(s?.price || 0)}</b></div>`;
      }).join('')}
      ${b.comment ? `<p style="font-size:12px;color:#666;">Комментарий: ${escapeHTML(b.comment)}</p>` : ''}
    `;
  }

  html += `
    <div id="booking-error" class="error" role="alert"></div>
    <div class="booking-bottom">
      <div>${selectedSummary()}</div>
      <div>
        <button onclick="previousStep()" style="font-size:11px;padding:12px 17px">${step ? 'Назад' : 'Закрыть'}</button>
        <button class="primary" onclick="${step === 3 ? 'submitBooking()' : 'nextStep()'}">${step === 3 ? 'Подтвердить запись ↗' : 'Продолжить ↗'}</button>
      </div>
    </div>
  `;

  $('#booking-content').innerHTML = html;
  if (step === 0) renderBookingServices('');
  $('#booking-dialog').scrollTop = 0;
}

function renderBookingServices(q) {
  let list = services.filter(s => s.name.toLowerCase().includes((q || '').toLowerCase()));
  const el = $('#booking-services');
  if (!el) return;
  el.innerHTML = list.map(s => {
    const isSelected = b.ids.includes(s.id);
    return `
      <div class="booking-service-item ${isSelected ? 'selected' : ''}" style="display:flex;justify-content:space-between;align-items:center;padding:10px;border-bottom:1px solid #eee;cursor:pointer;" onclick="toggleService(${s.id})">
        <div>
          <b>${escapeHTML(s.name)}</b><br>
          <small>${s.duration} мин · ${s.floating ? 'от ' : ''}${money(s.price)}</small>
        </div>
        <input type="checkbox" ${isSelected ? 'checked' : ''} onclick="event.stopPropagation();toggleService(${s.id})">
      </div>
    `;
  }).join('') || '<p class="empty">Услуга не найдена.</p>';
}

function toggleService(id) {
  const existing = b.ids.includes(id);
  if (!existing) {
    b.ids = [id]; // Focus on selected service or replace
  }
  renderBooking();
}

function previousStep() {
  if (step === 0) return closeBooking();
  step--;
  renderBooking();
}

function nextStep() {
  if (step === 0) {
    if (!b.ids.length) return error('Выберите хотя бы одну услугу.');
    step = 1;
    return renderBooking();
  }
  if (step === 1) {
    if (b.start === null) return error('Выберите доступное время приёма.');
    step = 2;
    return renderBooking();
  }
  if (step === 2) {
    const nameInput = $('#client-name');
    const contactInput = $('#client-contact');
    if (nameInput) b.name = nameInput.value;
    if (contactInput) b.contact = contactInput.value;
    if (!validName(b.name)) return error('Укажите корректное имя (от 2 до 50 символов, без цифр).');
    if (!validContact(b.channel, b.contact)) return error('Проверьте контактные данные для выбранного канала.');
    // Save profile automatically (WEB-08)
    saveClientProfile({name: b.name.trim(), contact: b.contact.trim(), phone: b.channel === 'Телефон' ? b.contact.trim() : '', channel: b.channel});
    step = 3;
    return renderBooking();
  }
}

async function submitBooking() {
  let list = records();
  if (readError) return error('Ошибка чтения локальной памяти.');
  if (!available(b.date, b.start, duration(), direction(), b.worker)) {
    return error('Это время уже занято. Пожалуйста, выберите другое свободное время.');
  }

  const workerNames = {'1': 'Александра Куцытой', '2': 'Григорьевна Седа', '3': 'Елена Малышева', '4': 'Юлия'};
  let r = {
    id: crypto.randomUUID(),
    ids: [...b.ids],
    names: b.ids.map(id => service(id)?.name || 'Услуга'),
    category: direction(),
    worker: b.worker,
    workerName: workerNames[b.worker] || 'Дежурный специалист',
    date: b.date,
    start: b.start,
    duration: duration(),
    name: b.name.trim(),
    channel: b.channel,
    contact: b.contact.trim(),
    comment: b.comment.trim(),
    price: sum(),
    floating: isFloating(),
    status: 'confirmed',
    created: new Date().toISOString()
  };

  try {
    fetch(CRM_BASE + '/api/portal', {
      method: 'POST',
      headers: {'Content-Type': 'application/json', 'idempotency-key': r.id},
      body: JSON.stringify({action: 'book', date: r.date, start: r.start, services: r.ids, patientName: r.name, contact: r.contact, channel: r.channel}),
      signal: AbortSignal.timeout(1000)
    }).catch(() => {});
  } catch (e) {}

  list.push(r);
  try {
    localStorage.setItem('kut-website-bookings-v1', JSON.stringify(list));
    savedId = r.id;
    step = 4;
    renderBooking();
  } catch (e) {
    error('Не удалось сохранить запись в браузере.');
  }
}

// Calendar Export (WEB-16)
function addToGoogleCalendar() {
  let r = records().find(x => x.id === savedId) || b;
  if (!r) return;
  const startIso = r.date.replace(/-/g, '') + 'T' + clock(r.start).replace(':', '') + '00';
  const endIso = r.date.replace(/-/g, '') + 'T' + clock(r.start + r.duration).replace(':', '') + '00';
  const title = encodeURIComponent('Центр подологии Куцытой: ' + (r.names || []).join(', '));
  const details = encodeURIComponent('Запись на прием в Центр подологии Куцытой.\nАдрес: Москва, Петрозаводская, 28 к. 1.\nТелефон: +7 (985) 059-27-77');
  const locationText = encodeURIComponent('Москва, Петрозаводская ул., 28 к. 1');
  const gcalUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startIso}/${endIso}&details=${details}&location=${locationText}`;
  window.open(gcalUrl, '_blank');
}

function downloadBookingIcs() {
  let r = records().find(x => x.id === savedId) || b;
  if (!r) return;
  const startUtc = new Date(r.date + 'T' + clock(r.start) + ':00+03:00').toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
  const endUtc = new Date(r.date + 'T' + clock(r.start + r.duration) + ':00+03:00').toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
  const icsLines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Kutsytoy//Podology Center//RU',
    'BEGIN:VEVENT',
    'UID:' + r.id + '@kutsytoy.ru',
    'DTSTAMP:' + new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, ''),
    'DTSTART:' + startUtc,
    'DTEND:' + endUtc,
    'SUMMARY:' + 'Центр подологии Куцытой: ' + (r.names || []).join(', '),
    'DESCRIPTION:' + 'Запись в Центр подологии Куцытой. Адрес: Москва, Петрозаводская ул., 28 к. 1',
    'LOCATION:Москва, Петрозаводская ул., 28 к. 1',
    'END:VEVENT',
    'END:VCALENDAR'
  ];
  const blob = new Blob([icsLines.join('\r\n')], {type: 'text/calendar;charset=utf-8'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'kutsytoy-appointment.ics';
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

// Order flow (WEB-18, WEB-19, WEB-20)
function openOrder(id) {
  const profile = getClientProfile();
  basket = {};
  if (id) basket[id] = 1;
  else if (products.length) basket[products[0].id] = 1;

  order = {
    name: profile?.name || '',
    channel: profile?.channel || 'Telegram',
    contact: profile?.contact || profile?.phone || '',
    delivery: 'pickup', // Strictly pickup only (WEB-20)
    address: 'Москва, Петрозаводская, 28 к. 1',
    comment: '',
    ack: true
  };
  renderOrder();
  const d = $('#order-dialog');
  if (d && typeof d.showModal === 'function') d.showModal();
}

function orderTotal() {
  return products.reduce((n, p) => n + p.price * (basket[p.id] || 0), 0);
}

function renderOrder() {
  let items = products.filter(p => basket[p.id]);
  const el = $('#order-content');
  if (!el) return;
  el.innerHTML = `
    <div class="dialog-top">
      <h2>Заказ домашнего ухода</h2>
      <button class="close" onclick="$('#order-dialog').close()" aria-label="Закрыть заказ">×</button>
    </div>
    <div class="notice">Оплата при получении в центре. Товары резервируются администратором.</div>
    ${items.map(p => `
      <div class="order-item" style="display:flex;justify-content:space-between;align-items:center;padding:10px 0;border-bottom:1px solid #eee;">
        <div>
          <b>${escapeHTML(p.name)}</b><br>
          <small>${money(p.price)} за единицу</small>
        </div>
        <div class="quantity" style="display:flex;align-items:center;gap:12px;">
          <button style="width:28px;height:28px;" aria-label="Уменьшить количество" onclick="changeQuantity(${p.id},-1)">−</button>
          <span>${basket[p.id]}</span>
          <button style="width:28px;height:28px;" aria-label="Увеличить количество" onclick="changeQuantity(${p.id},1)">+</button>
        </div>
      </div>
    `).join('')}
    
    <div style="margin:16px 0;">
      <label class="field"><b>Добавить ещё товар</b>
        <select onchange="addProduct(this.value);this.value='';">
          <option value="">Выберите позицию для добавления…</option>
          ${products.map(p => `<option value="${p.id}">${escapeHTML(p.name)} · ${money(p.price)}</option>`).join('')}
        </select>
      </label>
    </div>

    <div class="summary-line" style="display:flex;justify-content:space-between;padding:12px 0;font-size:16px;border-top:2px solid #eee;">
      <b>Итого к оплате при получении</b>
      <b>${money(orderTotal())}</b>
    </div>

    <div class="order-grid" style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:12px;">
      <label class="field">Ваше имя
        <input value="${escapeHTML(order.name)}" maxlength="50" placeholder="Иван" oninput="order.name=this.value">
      </label>
      <label class="field">Способ получения
        <select disabled>
          <option value="pickup" selected>Самовывоз из центра</option>
        </select>
      </label>
      <label class="field">Канал связи
        <select onchange="order.channel=this.value;renderOrder()">
          ${channels.map(c => `<option ${order.channel === c ? 'selected' : ''}>${c}</option>`).join('')}
        </select>
      </label>
      <label class="field">${contactLabel(order.channel)}
        <input value="${escapeHTML(order.contact)}" maxlength="100" placeholder="${contactPlaceholder(order.channel)}" oninput="order.contact=this.value">
      </label>
    </div>

    <p class="form-help" style="font-size:12px;color:#555;margin:8px 0;">
      Пункт выдачи: Москва, Петрозаводская, 28 к. 1, 1 этаж. Ежедневно 10:00–21:00.
    </p>

    <label class="field">Комментарий
      <textarea maxlength="500" rows="2" oninput="order.comment=this.value" placeholder="Пожелания к заказу">${escapeHTML(order.comment)}</textarea>
    </label>

    <div id="order-error" class="error" role="alert"></div>
    <div class="booking-bottom" style="display:flex;justify-content:space-between;align-items:center;margin-top:16px;">
      <b>${money(orderTotal())}</b>
      <button class="primary" onclick="submitOrder()">Оформить самовывоз ↗</button>
    </div>
  `;
}

function changeQuantity(id, n) {
  let q = (basket[id] || 0) + n;
  if (q > 99) return;
  if (q <= 0) delete basket[id];
  else basket[id] = q;
  renderOrder();
}

function addProduct(id) {
  if (!id) return;
  basket[id] = Math.min(99, (basket[id] || 0) + 1);
  renderOrder();
}

function submitOrder() {
  const fail = t => { $('#order-error').textContent = t; };
  if (!Object.keys(basket).length) return fail('В заказе нет выбранных товаров.');
  if (!validName(order.name)) return fail('Укажите настоящее имя (от 2 до 50 символов).');
  if (!validContact(order.channel, order.contact)) return fail('Проверьте контактные данные.');

  // Save profile automatically (WEB-08)
  saveClientProfile({name: order.name.trim(), contact: order.contact.trim(), phone: order.channel === 'Телефон' ? order.contact.trim() : '', channel: order.channel});

  let r = {
    id: crypto.randomUUID(),
    items: products.filter(p => basket[p.id]).map(p => ({id: p.id, name: p.name, price: p.price, quantity: basket[p.id]})),
    total: orderTotal(),
    name: order.name.trim(),
    channel: order.channel,
    contact: order.contact.trim(),
    delivery: 'pickup',
    created: new Date().toISOString()
  };

  // Sync with CRM Portal API
  try {
    fetch(CRM_BASE + '/api/portal', {
      method: 'POST',
      headers: {'Content-Type': 'application/json', 'idempotency-key': r.id},
      body: JSON.stringify({
        action: 'order',
        items: r.items.map(i => ({id: String(i.id), qty: i.quantity})),
        delivery: 'pickup',
        comment: 'Сайт самовывоз: ' + r.name + ' (' + r.contact + ')'
      })
    }).catch(() => {});
  } catch (e) {}

  try {
    let all = JSON.parse(localStorage.getItem('kut-test-orders-v1') || '[]');
    all.push(r);
    localStorage.setItem('kut-test-orders-v1', JSON.stringify(all));
  } catch (e) {}

  $('#order-content').innerHTML = `
    <div class="success" style="text-align:center;padding:24px 16px;">
      <span style="display:inline-block;width:48px;height:48px;line-height:48px;border-radius:50%;background:#e8f5e9;color:#2e7d32;font-size:24px;margin-bottom:16px;">✓</span>
      <h3>Заказ на самовывоз оформлен!</h3>
      <p>${r.items.map(p => escapeHTML(p.name) + ' × ' + p.quantity + ' шт.').join('<br>')}</p>
      <p><b>Сумма к оплате на месте: ${money(r.total)}</b></p>
      <div class="notice" style="text-align:left;margin:16px 0;">
        Товары зарезервированы. Ждём вас в центре: Петрозаводская, 28 к. 1, ежедневно 10:00–21:00.
      </div>
      <button class="primary" onclick="$('#order-dialog').close()">Понятно, закрыть</button>
    </div>
  `;
}

// Reschedule and cancel flow (WEB-14)
function canManage(r) {
  if (!r || r.status === 'cancelled') return false;
  // If scheduled for today/future, allow management
  return r.date >= today();
}

function cancelLocalBooking(id) {
  let list = records(), r = list.find(x => x.id === id);
  if (!r || !canManage(r)) return;
  if (!confirm('Вы действительно хотите отменить запись?')) return;
  r.status = 'cancelled';
  try {
    localStorage.setItem('kut-website-bookings-v1', JSON.stringify(list));
    renderProfile();
  } catch (e) {}
}

function showReschedule(id) {
  let r = records().find(x => x.id === id);
  if (!r || !canManage(r)) return;
  $('#profile-content').innerHTML = `
    <div class="dialog-top">
      <h2>Перенос записи</h2>
      <button class="close" onclick="renderProfile()" aria-label="Назад">×</button>
    </div>
    <p><b>${r.names.map(escapeHTML).join(', ')}</b></p>
    <label class="field">Новая дата
      <input id="reschedule-date" type="date" min="${today()}" value="${r.date}" onchange="updateRescheduleSlots('${id}')">
    </label>
    <label class="field">Новое время
      <select id="reschedule-time"></select>
    </label>
    <div id="reschedule-error" class="error" role="alert"></div>
    <div style="margin-top:16px;display:flex;gap:10px;">
      <button class="primary" onclick="saveReschedule('${id}')">Сохранить перенос</button>
      <button onclick="renderProfile()">Отмена</button>
    </div>
  `;
  updateRescheduleSlots(id);
}

function updateRescheduleSlots(id) {
  let r = records().find(x => x.id === id);
  const d = $('#reschedule-date').value;
  let out = [];
  for (let m = 600; m + r.duration <= 1260; m += 30) {
    if (available(d, m, r.duration, r.category, r.worker)) out.push(m);
  }
  $('#reschedule-time').innerHTML = out.length ? out.map(m => `<option value="${m}">${clock(m)}</option>`).join('') : '<option value="">Нет свободного времени</option>';
}

function saveReschedule(id) {
  let all = records(), r = all.find(x => x.id === id);
  const d = $('#reschedule-date').value;
  const v = $('#reschedule-time').value;
  if (!r || !canManage(r) || v === '') {
    $('#reschedule-error').textContent = 'Перенос невозможен. Выберите доступное время.';
    return;
  }
  r.date = d;
  r.start = Number(v);
  try {
    localStorage.setItem('kut-website-bookings-v1', JSON.stringify(all));
    renderProfile();
  } catch (e) {
    $('#reschedule-error').textContent = 'Не удалось сохранить перенос.';
  }
}

// Certificates (WEB-17)
function openCertificate(src, title) {
  $('#certificate-image').src = src;
  $('#certificate-title').textContent = title;
  $('#certificate-dialog').showModal();
}
function closeCertificate() {
  $('#certificate-dialog').close();
}

function renderProducts() {
  $('#product-list').innerHTML = products.map((p, i) => `
    <article class="product-card">
      <div class="product-visual" role="img" aria-label="${escapeHTML(p.name)}">
        <div class="bottle">✳</div>
        <small>Оригинальный сертифицированный уход</small>
      </div>
      <div class="product-info">
        <div class="eyebrow">ДОМАШНИЙ УХОД / ${String(i + 1).padStart(2, '0')}</div>
        <h3>${escapeHTML(p.name)}</h3>
        <p>Профессиональный уход для домашнего применения. Наличие подтверждается в центре.</p>
        <div class="product-price">
          <b>${money(p.price)}</b>
          <button class="booking-link" onclick="openOrder(${p.id})">Заказать ↗</button>
        </div>
      </div>
    </article>
  `).join('');
}

function toggleNavigation() {
  const nav = document.querySelector('nav');
  const isOpen = nav.classList.toggle('open');
  const button = document.querySelector('.menu');
  if (button) {
    button.setAttribute('aria-expanded', String(isOpen));
    button.setAttribute('aria-label', isOpen ? 'Закрыть меню' : 'Открыть меню');
  }
}

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

// Load live catalog
async function loadCatalog() {
  try {
    const res = await fetch(new URL('/api/catalog', CRM_BASE));
    if (!res.ok) throw new Error();
    const data = await res.json();
    if (Array.isArray(data.services) && data.services.length) services = data.services;
    if (Array.isArray(data.products) && data.products.length) products = data.products;
  } catch (e) {
    // Fallback to local json files
    try {
      const [sRes, pRes] = await Promise.all([fetch('services.json'), fetch('products.json')]);
      if (sRes.ok) services = await sRes.json();
      if (pRes.ok) products = await pRes.json();
    } catch (err) {}
  }

  // Ensure clean product names (WEB-18)
  products = products.map(p => {
    let name = p.name;
    if (/конкурент/i.test(name) || /продукт\s*11/i.test(name)) {
      name = 'Восстанавливающий концентрат для ногтей';
    }
    return {...p, name};
  });

  renderServices();
  renderProducts();
}

loadCatalog();
