"""Olist one-screen UI regression: layout and image bounds, not just CSS flags."""
from pathlib import Path
from playwright.sync_api import expect, sync_playwright

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "test-results"
OUT.mkdir(exist_ok=True)
URI = (ROOT / "index.html").as_uri()
IMAGES = {
    "operations": "assets/01_overview.png",
    "revenue": "assets/02_revenue.png",
    "customers": "assets/03_customers.png",
    "fulfillment": "assets/04_fulfillment.png",
}
for path in [*IMAGES.values(), "downloads/Olist_电商经营分析.pbix", "downloads/Olist_四页看板.pdf"]:
    assert (ROOT / path).is_file(), f"Missing: {path}"

BOUNDS_JS = """(selectors) => {
  const bounds = (sel) => {
    const el=document.querySelector(sel);
    const r=el.getBoundingClientRect();
    return {top:r.top,bottom:r.bottom,left:r.left,right:r.right,
            height:r.height,width:r.width,scrollHeight:el.scrollHeight,
            clientHeight:el.clientHeight, scrollWidth:el.scrollWidth,
            clientWidth:el.clientWidth};
  };
  const visible=Object.fromEntries(selectors.map(x=>[x,bounds(x)]));
  return {visible, viewport:{width:innerWidth,height:innerHeight},
          document:{height:document.documentElement.scrollHeight,
                    clientHeight:document.documentElement.clientHeight,
                    width:document.documentElement.scrollWidth,
                    clientWidth:document.documentElement.clientWidth}};
}"""

def layout(page, route, viewport, desktop):
    selectors = {
        "overview": ["#view-overview", ".overview-header", ".metric-strip",
                     ".overview-stage", ".preview-image-link", ".preview-image-link img",
                     ".overview-aside", ".aside-link"],
        "evidence": ["#view-evidence", ".evidence-header", ".evidence-grid",
                     ".evidence-row:last-child", ".evidence-footer"],
    }.get(route, ["#view-dashboard", ".report-heading", ".dashboard-insight",
                  ".dashboard-figure", ".dashboard-image-button",
                  "#dashboard-image", ".dashboard-caption", ".report-footer"])
    all_rects = page.evaluate(BOUNDS_JS, selectors)
    assert all_rects["document"]["width"] <= all_rects["document"]["clientWidth"] + 2, (route, all_rects)
    if not desktop:
        return
    assert all_rects["document"]["height"] <= all_rects["document"]["clientHeight"] + 2, (route, all_rects)
    work = page.locator("#main").evaluate(
        "(e)=>({scroll:e.scrollHeight,client:e.clientHeight})"
    )
    assert work["scroll"] <= work["client"] + 2, (route, "main scroll", work)
    current_view = all_rects["visible"][selectors[0]]
    assert current_view["scrollHeight"] <= current_view["clientHeight"] + 2, (
        route, "view internal scroll", current_view
    )
    for sel, rect in all_rects["visible"].items():
        assert rect["height"] > 0 and rect["width"] > 0, (route, sel, rect)
        assert rect["top"] >= 45 and rect["bottom"] <= viewport[1] - 20, (
            route, sel, "VERTICAL CLIP", rect
        )
        assert rect["left"] >= 0 and rect["right"] <= viewport[0] + 1, (
            route, sel, "HORIZONTAL CLIP", rect
        )
    if route in IMAGES:
        image = all_rects["visible"]["#dashboard-image"]
        button = all_rects["visible"][".dashboard-image-button"]
        assert image["top"] >= button["top"] - 1 and image["bottom"] <= button["bottom"] + 1
        assert image["left"] >= button["left"] - 1 and image["right"] <= button["right"] + 1
        # Original 1551 x 874 image, displayed without cropping or distortion
        assert abs(image["width"] / image["height"] - 1551 / 874) < 0.02, (route, image)

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    for size in [(1366, 768), (1440, 900), (1024, 768), (375, 812)]:
        width, height = size
        desktop = width > 960
        page = browser.new_page(viewport={"width": width, "height": height})
        errors = []
        page.on("pageerror", lambda error: errors.append(str(error)))
        page.goto(URI + "#overview")
        expect(page.locator("#view-overview")).to_be_visible()
        assert page.locator(".sidebar-nav .nav-link").count() == 6
        assert page.locator(".insight-card").count() == 3
        assert "13,494,400.74" in page.locator("#view-overview").inner_text()
        expect(page.locator(".preview-image-link img")).to_have_js_property("complete", True)
        assert page.locator(".preview-image-link img").evaluate("(e)=>e.naturalWidth === 1551")
        layout(page, "overview", size, desktop)
        page.screenshot(path=str(OUT / f"{width}-overview.png"))
        for route, src in IMAGES.items():
            page.evaluate("(route) => location.hash = '#' + route", route)
            expect(page.locator("#view-dashboard")).to_be_visible()
            expect(page.locator("#dashboard-image")).to_have_attribute("src", src)
            page.wait_for_function("() => document.querySelector('#dashboard-image').naturalWidth === 1551")
            assert page.locator(".sidebar-nav a.is-active").get_attribute("data-route") == route
            layout(page, route, size, desktop)
            if route == "customers":
                assert "3.04%" in page.locator("#dashboard-takeaway").inner_text()
                page.screenshot(path=str(OUT / f"{width}-customers.png"))
        page.evaluate("location.hash = '#evidence'")
        expect(page.locator("#view-evidence")).to_be_visible()
        assert page.locator(".evidence-row").count() == 3
        assert page.locator(".resource-item").count() == 4
        layout(page, "evidence", size, desktop)
        page.screenshot(path=str(OUT / f"{width}-evidence.png"))

        # Real sidebar navigation + gallery dialog and keyboard.
        if not desktop:
            page.locator("#menu-toggle").click()
            assert page.locator("body").evaluate("(e)=>e.classList.contains('sidebar-open')")
        page.locator('.sidebar-nav a[data-route="operations"]').click()
        expect(page.locator("#dashboard-image")).to_have_attribute("src", IMAGES["operations"])
        page.locator("#image-zoom-trigger").click()
        assert page.locator("#zoom-dialog").evaluate("(e)=>e.open")
        page.keyboard.press("ArrowRight")
        expect(page.locator("#dashboard-image")).to_have_attribute("src", IMAGES["revenue"])
        page.keyboard.press("Escape")
        assert not page.locator("#zoom-dialog").evaluate("(e)=>e.open")
        assert not errors, errors
        print(f"PASS {width}x{height} all routes, no desktop scroll/clip, image contain, navigation and zoom")
        page.close()
    browser.close()
