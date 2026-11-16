(() => {
 'use strict';
 const links = [...document.querySelectorAll('a[data-photo-group]')];
 if (!links.length || typeof HTMLDialogElement === 'undefined') return;
 const dialog = document.createElement('dialog');
 dialog.className = 'photo-viewer';
 dialog.setAttribute('aria-label', 'Просмотр фотографий');
 dialog.innerHTML = '<form method="dialog"><button class="photo-close" aria-label="Закрыть просмотр">Закрыть ×</button></form><figure><img alt=""><figcaption aria-live="polite"></figcaption></figure><nav aria-label="Листание фотографий"><button type="button" data-prev aria-label="Предыдущее фото">← Назад</button><span data-count></span><button type="button" data-next aria-label="Следующее фото">Далее →</button></nav>';
 document.body.append(dialog);
 let active = [], index = 0, opener = null;
 const picture = dialog.querySelector('img'), caption = dialog.querySelector('figcaption');
 function render() {
  const link = active[index];
  picture.src = link.href; picture.alt = link.dataset.caption;
  caption.textContent = link.dataset.caption;
  dialog.querySelector('[data-count]').textContent = `${index + 1} / ${active.length}`;
 }
 function move(delta) { index = (index + delta + active.length) % active.length; render(); }
 links.forEach(link => link.addEventListener('click', event => {
  if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey || event.button !== 0) return;
  event.preventDefault(); opener = link;
  active = links.filter(item => item.dataset.photoGroup === link.dataset.photoGroup && !item.hidden);
  index = active.indexOf(link); render(); dialog.showModal();
 }));
 dialog.querySelector('[data-prev]').addEventListener('click', () => move(-1));
 dialog.querySelector('[data-next]').addEventListener('click', () => move(1));
 dialog.addEventListener('keydown', event => {
  if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') { event.preventDefault(); move(event.key === 'ArrowLeft' ? -1 : 1); }
 });
 dialog.addEventListener('click', event => { if (event.target === dialog) { const r = dialog.getBoundingClientRect(); if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) dialog.close(); } });
 dialog.addEventListener('close', () => { picture.removeAttribute('src'); opener?.focus(); });
 document.querySelectorAll('[data-photo-filter]').forEach(button => button.addEventListener('click', () => {
  const group = button.dataset.photoFilter;
  document.querySelectorAll('[data-photo-filter]').forEach(item => item.setAttribute('aria-pressed', String(item === button)));
  document.querySelectorAll('.work-grid [data-photo-group]').forEach(item => { item.hidden = group !== 'all' && item.dataset.photoGroup !== group; });
 }));
})();
