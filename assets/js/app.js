'use strict';
(() => {
  const root = document.documentElement;
  const toggle = document.querySelector('#theme-toggle');
  const progress = document.querySelector('#reading-progress');
  const filters = [...document.querySelectorAll('.filter')];
  const articles = [...document.querySelectorAll('.evidence')];
  const dialog = document.querySelector('#document-dialog');
  const close = document.querySelector('#dialog-close');
  const frame = document.querySelector('#document-frame');
  const title = document.querySelector('#dialog-title');
  const external = document.querySelector('#pdf-external');

  // Modo de lectura (sin servicios externos).
  try {
    if (localStorage.getItem('portfolio-contrast') === 'night') {
      root.dataset.theme = 'night';
      toggle.setAttribute('aria-pressed', 'true');
    }
  } catch (_) { /* El portafolio funciona sin almacenamiento local. */ }
  toggle.addEventListener('click', () => {
    const isNight = root.dataset.theme !== 'night';
    root.dataset.theme = isNight ? 'night' : 'day';
    toggle.setAttribute('aria-pressed', String(isNight));
    try { localStorage.setItem('portfolio-contrast', isNight ? 'night' : 'day'); } catch (_) { }
  });

  filters.forEach(button => button.addEventListener('click', () => {
    const week = button.dataset.week;
    filters.forEach(item => {
      const isActive = item === button;
      item.classList.toggle('active', isActive);
      item.setAttribute('aria-pressed', String(isActive));
    });
    articles.forEach(item => { item.hidden = week !== 'all' && item.dataset.week !== week; });
  }));

  let lastTrigger = null;
  document.querySelectorAll('.view-document').forEach(button => {
    button.addEventListener('click', () => {
      lastTrigger = button;
      const file = button.dataset.file;
      title.textContent = button.dataset.title || 'Documento de evidencia';
      frame.src = file;
      external.href = file;
      if (typeof dialog.showModal === 'function') dialog.showModal();
      else window.open(file, '_blank', 'noopener');
    });
  });
  const closeDialog = () => dialog.close();
  close.addEventListener('click', closeDialog);
  dialog.addEventListener('click', event => { if (event.target === dialog) closeDialog(); });
  dialog.addEventListener('close', () => {
    frame.removeAttribute('src');
    if (lastTrigger) lastTrigger.focus();
  });

  let queued = false;
  const updateProgress = () => {
    const total = document.documentElement.scrollHeight - window.innerHeight;
    const pct = total > 0 ? Math.min(100, Math.max(0, (window.scrollY / total) * 100)) : 0;
    progress.style.transform = `scaleX(${pct / 100})`;
    queued = false;
  };
  window.addEventListener('scroll', () => {
    if (!queued) { queued = true; requestAnimationFrame(updateProgress); }
  }, {passive: true});
  window.addEventListener('resize', updateProgress, {passive: true});
  updateProgress();
})();
