/* Olist case-study gallery. UI mirrors the portfolio's project switcher, not a Power BI reimplementation. */
(() => {
  'use strict';

  const pages = [
    { src: 'assets/01_overview.png', alt: 'Olist 电商经营总览 Power BI 看板：GMV、有效订单和月度增长', caption: '经营总览 · GMV、有效订单与月度增长', code: 'OVERVIEW', name: '经营总览' },
    { src: 'assets/02_revenue.png', alt: 'Olist 收入分析看板：巴西州级地图、商品类目、支付方式与月度 GMV', caption: '收入结构 · 品类、地区与支付方式', code: 'REVENUE', name: '收入结构' },
    { src: 'assets/03_customers.png', alt: 'Olist 用户行为看板：购买频次、Cohort 月度回购和 RFM 分层', caption: '用户行为 · 复购、Cohort 与 RFM', code: 'CUSTOMERS', name: '用户行为' },
    { src: 'assets/04_fulfillment.png', alt: 'Olist 履约体验看板：配送时效、客户评分与卖家表现', caption: '履约体验 · 配送时效与客户评价', code: 'FULFILLMENT', name: '履约体验' },
  ];
  const tabs = [...document.querySelectorAll('.gallery-tab')];
  const image = document.getElementById('dashboard-image');
  const caption = document.getElementById('dashboard-caption');
  const counter = document.getElementById('gallery-count');
  const stage = document.getElementById('stage-page');
  const original = document.getElementById('original-image');
  const missing = document.getElementById('assets-missing');
  const dialog = document.getElementById('zoom-dialog');
  const zoomImage = document.getElementById('zoom-image');
  const zoomCaption = document.getElementById('zoom-caption');
  const zoomCounter = document.getElementById('zoom-counter');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let current = 0;

  const formatIndex = (index) => String(index + 1).padStart(2, '0') + ' / 04';
  function render(index, focusTab = false) {
    if (!pages[index]) return;
    current = index;
    const item = pages[current];
    image.src = item.src;
    image.alt = item.alt;
    caption.textContent = item.caption;
    stage.textContent = String(current + 1).padStart(2, '0') + ' — ' + item.code;
    counter.textContent = formatIndex(current);
    original.href = item.src;
    zoomImage.src = item.src;
    zoomImage.alt = item.alt;
    zoomCaption.textContent = item.name;
    zoomCounter.textContent = formatIndex(current);
    missing.hidden = true;
    tabs.forEach((tab, tabIndex) => {
      const selected = current === tabIndex;
      tab.classList.toggle('is-active', selected);
      tab.setAttribute('aria-pressed', String(selected));
    });
    if (focusTab) tabs[current].focus();
    image.classList.remove('image-in');
    if (!reducedMotion.matches) {
      void image.offsetWidth;
      image.classList.add('image-in');
    }
    const view = dialog.querySelector('.lightbox-viewport');
    if (dialog.open) view.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }

  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => render(index));
    tab.addEventListener('keydown', (event) => {
      if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
        event.preventDefault();
        const direction = event.key === 'ArrowRight' ? 1 : -1;
        render((index + direction + pages.length) % pages.length, true);
      }
    });
  });

  document.querySelectorAll('[data-go-page]').forEach((button) => {
    button.addEventListener('click', () => {
      render(Number(button.dataset.goPage));
      document.getElementById('dashboards').scrollIntoView({
        behavior: reducedMotion.matches ? 'auto' : 'smooth',
        block: 'start',
      });
    });
  });

  image.addEventListener('error', () => { missing.hidden = false; });
  document.getElementById('image-zoom-trigger').addEventListener('click', () => {
    zoomImage.src = pages[current].src;
    dialog.showModal();
    document.getElementById('zoom-close').focus();
  });
  document.getElementById('zoom-close').addEventListener('click', () => dialog.close());
  document.getElementById('zoom-prev').addEventListener('click', () => render((current + pages.length - 1) % pages.length));
  document.getElementById('zoom-next').addEventListener('click', () => render((current + 1) % pages.length));
  dialog.addEventListener('click', (event) => { if (event.target === dialog) dialog.close(); });
  document.addEventListener('keydown', (event) => {
    if (!dialog.open) return;
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();
      render((current + (event.key === 'ArrowRight' ? 1 : -1) + pages.length) % pages.length);
    }
  });

  // Eagerly preload the remaining small preview images; the PBIX stays downloadable as-is.
  pages.slice(1).forEach((page) => { const preload = new Image(); preload.src = page.src; });
})();
