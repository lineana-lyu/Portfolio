/**
 * Power BI Service → File → Embed report → Publish to web (public)
 * Paste the public view URL ONLY after checking that all model data
 * is safe to make public. A local .pbix path cannot be embedded.
 */
const POWER_BI_PUBLISH_TO_WEB_URL = "";

(() => {
  const frame = document.getElementById("report-frame");
  const empty = document.getElementById("report-empty");
  const link = document.getElementById("report-link");
  const value = POWER_BI_PUBLISH_TO_WEB_URL.trim();
  if (!value) return;

  try {
    const url = new URL(value);
    const isPublicPowerBI =
      url.protocol === "https:" &&
      url.hostname === "app.powerbi.com" &&
      url.pathname === "/view" &&
      url.searchParams.has("r");

    if (!isPublicPowerBI) {
      empty.querySelector("h3").textContent = "嵌入链接格式不正确";
      empty.querySelector("p").textContent = "仅支持 Power BI Service 公开发布的 https://app.powerbi.com/view?r=... 链接。";
      return;
    }

    frame.src = url.href;
    frame.hidden = false;
    empty.hidden = true;
    link.href = url.href;
    link.hidden = false;
  } catch {
    empty.querySelector("h3").textContent = "嵌入链接无效";
    empty.querySelector("p").textContent = "请检查 embed.js 中的公开 Power BI 地址。";
  }
})();
