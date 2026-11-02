/** Four original Power BI dashboard screenshots; no report reimplementation. */
const dashboardPages = [
  { src: "assets/01_overview.png", alt: "Olist 电商经营总览：核心指标、GMV 月度趋势和环比变化", caption: "经营总览 · 核心指标与月度趋势" },
  { src: "assets/02_revenue.png", alt: "Olist 收入分析：巴西州级地图、品类 GMV、支付方式和收入趋势", caption: "收入分析 · 品类、地区与支付结构" },
  { src: "assets/03_customers.png", alt: "Olist 用户行为与价值分析：购买频次、Cohort 和 RFM 分群", caption: "用户行为 · 购买频次、Cohort 与 RFM" },
  { src: "assets/04_fulfillment.png", alt: "Olist 订单履约与客户体验：配送时效、评价和卖家表现", caption: "履约体验 · 配送时效与客户评价" },
];
const tabs = [...document.querySelectorAll(".gallery-tab")];
const image = document.querySelector("#dashboard-image");
const caption = document.querySelector("#dashboard-caption");
const original = document.querySelector("#original-image");
function showPage(index) {
  const page = dashboardPages[index];
  if (!page) return;
  image.src = page.src;
  image.alt = page.alt;
  caption.textContent = page.caption;
  original.href = page.src;
  tabs.forEach((tab, i) => {
    const active = index === i;
    tab.classList.toggle("is-active", active);
    tab.setAttribute("aria-pressed", String(active));
  });
}
tabs.forEach((tab, index) => tab.addEventListener("click", () => showPage(index)));
image.addEventListener("error", () => {
  image.alt = "看板图片尚未上传至 GitHub。";
  const warning = document.getElementById("assets-missing");
  if (warning) warning.hidden = false;
});

// HTTP-hosted previews must not advertise a missing PBIX as downloadable.
if (location.protocol === "https:" || location.protocol === "http:") {
  const download = document.querySelector("a.download");
  if (download) {
    fetch(download.href, { method: "HEAD" })
      .then(response => {
        if (!response.ok) {
          download.textContent = "Power BI 文件待上传";
          download.removeAttribute("href");
          download.removeAttribute("download");
          download.setAttribute("aria-disabled", "true");
        }
      })
      .catch(() => {
        download.textContent = "Power BI 文件暂不可用";
        download.removeAttribute("href");
        download.removeAttribute("download");
        download.setAttribute("aria-disabled", "true");
      });
  }
}
