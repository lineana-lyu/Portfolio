/* Olist Analytics: hash-driven sidebar workbench. No framework; no fake Power BI embedding. */
(() => {
  'use strict';

  const reportPages = [
    {
      route:'operations', index:'01', code:'OVERVIEW', label:'经营总览',
      title:'经营总览', description:'平台交易规模、月度商品收入和订单趋势如何变化？',
      src:'assets/01_overview.png',
      alt:'Olist 电商经营总览 Power BI 原始看板',
      caption:'经营总览 · GMV、有效订单与月度趋势',
      takeaway:'商品收入汇总 R$13,494,400.74；结合月度订单量及商品收入趋势，观察历史交易表现。',
    },
    {
      route:'revenue', index:'02', code:'REVENUE', label:'收入分析',
      title:'收入分析', description:'不同品类、巴西各州及支付方式呈现怎样的收入结构？',
      src:'assets/02_revenue.png',
      alt:'Olist 收入分析 Power BI 原始看板：品类、州级地域和支付方式',
      caption:'收入分析 · 品类贡献、地区分布及支付结构',
      takeaway:'月度、品类、RFM 用户及州级商品收入四种汇总结果一致，均为 R$13,494,400.74（不含运费）。',
    },
    {
      route:'customers', index:'03', code:'CUSTOMERS', label:'用户行为',
      title:'用户行为', description:'用户是否重复购买？不同首购 Cohort 和 RFM 分群怎样表现？',
      src:'assets/03_customers.png',
      alt:'Olist 用户行为 Power BI 原始看板：重复购买、Cohort 与 RFM',
      caption:'用户行为 · 历史复购、Cohort 月度回购与 RFM',
      takeaway:'历史购买用户 94,983 名，其中重复购买用户 2,887 名，历史复购率 3.04%。该数字并非流失预测。',
    },
    {
      route:'fulfillment', index:'04', code:'FULFILLMENT', label:'履约体验',
      title:'履约体验', description:'配送是否准时？配送延迟组与客户评价有什么关联？',
      src:'assets/04_fulfillment.png',
      alt:'Olist 履约体验 Power BI 原始看板：配送延迟分组、评分与卖家表现',
      caption:'履约体验 · 配送时效、客户评价与卖家表现',
      takeaway:'提前送达订单组平均评分约 4.29；延迟 8 天及以上的订单组约 1.70。这是分组相关性，不证明因果。',
    }
  ];
  const reportRoutes = reportPages.map(page => page.route);
  const allowedRoutes = new Set(['overview', ...reportRoutes, 'evidence']);
  const navItems = [...document.querySelectorAll('.sidebar-nav .nav-link')];
  const overview = document.querySelector('[data-view="overview"]');
  const dashboard = document.querySelector('[data-view="dashboard"]');
  const evidence = document.querySelector('[data-view="evidence"]');
  const main = document.getElementById('main');
  const breadcrumb = document.getElementById('current-view-label');
  const statusPage = document.getElementById('status-page');
  const toggleButton = document.getElementById('menu-toggle');
  const closeButton = document.getElementById('sidebar-close');
  const mobileScrim = document.getElementById('mobile-scrim');
  const image = document.getElementById('dashboard-image');
  const missing = document.getElementById('assets-missing');
  const zoomDialog = document.getElementById('zoom-dialog');
  const zoomImage = document.getElementById('zoom-image');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let currentRoute = 'overview';
  let reportIndex = 0;

  const labelFor = (route) => route === 'overview' ? '项目概览'
    : route === 'evidence' ? '技术证据'
    : reportPages.find(page => page.route === route)?.label ?? '项目概览';

  function setSidebarOpen(open) {
    document.body.classList.toggle('sidebar-open', open);
    toggleButton.setAttribute('aria-expanded', String(open));
    toggleButton.setAttribute('aria-label', open ? '关闭侧边菜单' : '打开侧边菜单');
    if (open) closeButton.focus();
  }

  function showReport(index) {
    const page = reportPages[index];
    if (!page) return;
    reportIndex = index;
    const fields = {
      'dashboard-title':page.title,
      'dashboard-description':page.description,
      'dashboard-eyebrow':'POWER BI / ' + page.code,
      'dashboard-progress':page.index + ' / 04',
      'dashboard-counter':page.index + ' / 04',
      'dashboard-caption':page.caption,
      'dashboard-takeaway':page.takeaway,
      'zoom-caption':page.label,
      'zoom-counter':page.index + ' / 04',
    };
    for (const [id, text] of Object.entries(fields)) {
      document.getElementById(id).textContent = text;
    }
    if (image.getAttribute('src') !== page.src) {
      image.setAttribute('src', page.src);
      if (!reducedMotion.matches) {
        image.classList.remove('image-in');
        void image.offsetWidth;
        image.classList.add('image-in');
      }
    }
    image.alt = page.alt;
    document.getElementById('original-image').href = page.src;
    zoomImage.src = page.src;
    zoomImage.alt = page.alt;
    missing.hidden = true;
    if (zoomDialog.open) zoomDialog.querySelector('.lightbox-body').scrollLeft = 0;
  }

  function navigate(route) {
    const key = allowedRoutes.has(route) ? route : 'overview';
    const wasSame = currentRoute === key;
    currentRoute = key;
    const isReport = reportRoutes.includes(key);
    overview.hidden = key !== 'overview';
    dashboard.hidden = !isReport;
    evidence.hidden = key !== 'evidence';
    overview.classList.toggle('is-active', key === 'overview');
    dashboard.classList.toggle('is-active', isReport);
    evidence.classList.toggle('is-active', key === 'evidence');
    if (isReport) showReport(reportRoutes.indexOf(key));
    for (const link of navItems) {
      const active = link.dataset.route === key;
      link.classList.toggle('is-active', active);
      if (active) link.setAttribute('aria-current', 'page');
      else link.removeAttribute('aria-current');
    }
    breadcrumb.textContent = labelFor(key);
    statusPage.textContent = key.toUpperCase();
    document.title = labelFor(key) + ' | Olist 数据分析作品集';
    main.scrollTop = 0;
    setSidebarOpen(false);
    // Navigation remains in the same viewport, so readers never have to scroll to another section.
    if (!wasSame && document.readyState === 'complete' && !zoomDialog.open) {
      main.focus({ preventScroll:true });
    }
  }

  function routeFromHash() {
    return decodeURIComponent(location.hash.replace(/^#/, '') || 'overview');
  }
  function openRoute(route) {
    if (!allowedRoutes.has(route)) return;
    if (location.hash !== '#' + route) location.hash = route;
    else navigate(route);
  }

  document.querySelectorAll('a[data-route]').forEach(link => {
    link.addEventListener('click', event => {
      event.preventDefault();
      openRoute(link.dataset.route);
    });
  });
  window.addEventListener('hashchange', () => navigate(routeFromHash()));
  toggleButton.addEventListener('click', () => setSidebarOpen(!document.body.classList.contains('sidebar-open')));
  closeButton.addEventListener('click', () => { setSidebarOpen(false); toggleButton.focus(); });
  mobileScrim.addEventListener('click', () => setSidebarOpen(false));
  window.matchMedia('(min-width: 961px)').addEventListener('change', event => {
    if (event.matches) setSidebarOpen(false);
  });

  function adjacent(direction) {
    openRoute(reportRoutes[(reportIndex + direction + reportPages.length) % reportPages.length]);
  }
  document.getElementById('dashboard-prev').addEventListener('click', () => adjacent(-1));
  document.getElementById('dashboard-next').addEventListener('click', () => adjacent(1));
  document.getElementById('zoom-prev').addEventListener('click', () => adjacent(-1));
  document.getElementById('zoom-next').addEventListener('click', () => adjacent(1));

  image.addEventListener('error', () => { missing.hidden = false; });
  document.getElementById('image-zoom-trigger').addEventListener('click', () => {
    zoomImage.src = reportPages[reportIndex].src;
    zoomDialog.showModal();
    document.getElementById('zoom-close').focus();
  });
  document.getElementById('zoom-close').addEventListener('click', () => zoomDialog.close());
  zoomDialog.addEventListener('click', event => { if (event.target === zoomDialog) zoomDialog.close(); });
  document.addEventListener('keydown', event => {
    if (zoomDialog.open && (event.key === 'ArrowLeft' || event.key === 'ArrowRight')) {
      event.preventDefault();
      adjacent(event.key === 'ArrowRight' ? 1 : -1);
    } else if (event.key === 'Escape' && document.body.classList.contains('sidebar-open')) {
      setSidebarOpen(false);
      toggleButton.focus();
    }
  });

  // Keep original screenshots; never simulate native Power BI filters from static images.
  for (const page of reportPages.slice(1)) {
    const preload = new Image();
    preload.src = page.src;
  }
  navigate(routeFromHash());
})();