"""UI smoke tests for the Olist Analytics left-sidebar workbench.

Requirements:
    pip install playwright
    playwright install chromium
    python tests/site_smoke.py
"""
from pathlib import Path

from playwright.sync_api import expect, sync_playwright

ROOT = Path(__file__).resolve().parents[1]
for name in (
    "assets/01_overview.png",
    "assets/02_revenue.png",
    "assets/03_customers.png",
    "assets/04_fulfillment.png",
    "downloads/Olist_电商经营分析.pbix",
    "downloads/Olist_四页看板.pdf",
):
    assert (ROOT / name).is_file(), f"Missing source asset: {name}"


def assert_image_loaded(page):
    page.wait_for_function(
        "() => { const img = document.getElementById('dashboard-image'); "
        "return img.complete && img.naturalWidth > 0; }"
    )


with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    for width, height in [(1440, 900), (375, 812)]:
        page = browser.new_page(viewport={"width": width, "height": height})
        errors = []
        page.on("pageerror", lambda error: errors.append(str(error)))
        page.goto((ROOT / "index.html").as_uri())

        assert page.locator(".sidebar-nav .nav-link").count() == 6
        assert page.locator('[data-view="overview"]').is_visible()
        expect(page.locator('[data-view="dashboard"]')).to_be_hidden()
        assert page.locator(".insight-card").count() == 3
        assert "13,494,400.74" in page.locator("#view-overview").inner_text()
        assert "3.04" in page.locator("#view-overview").inner_text()
        assert page.locator("body").evaluate(
            "(element) => getComputedStyle(element).overflow === 'hidden'"
        ), "Document should not be a vertically scrolling long page."

        # Switch from left navigation; on mobile open the drawer first.
        if width < 961:
            page.locator("#menu-toggle").click()
            assert page.locator("body").evaluate(
                "(element) => element.classList.contains('sidebar-open')"
            )
        page.locator('.sidebar-nav a[data-route="customers"]').click()
        expect(page.locator("#view-dashboard")).to_be_visible()
        expect(page.locator('[data-view="overview"]')).to_be_hidden()
        expect(page.locator("#dashboard-title")).to_have_text("用户行为")
        expect(page.locator("#dashboard-image")).to_have_attribute("src", "assets/03_customers.png")
        assert_image_loaded(page)
        assert "3.04%" in page.locator("#dashboard-takeaway").inner_text()
        assert page.locator('.sidebar-nav a[data-route="customers"]').get_attribute("aria-current") == "page"
        if width < 961:
            assert not page.locator("body").evaluate(
                "(element) => element.classList.contains('sidebar-open')"
            )

        # Modal zoom and keyboard navigation follow the sidebar routes.
        page.locator("#image-zoom-trigger").click()
        assert page.locator("#zoom-dialog").evaluate("(el) => el.open")
        page.keyboard.press("ArrowRight")
        expect(page.locator("#dashboard-title")).to_have_text("履约体验")
        expect(page.locator("#zoom-image")).to_have_attribute("src", "assets/04_fulfillment.png")
        page.keyboard.press("Escape")
        assert not page.locator("#zoom-dialog").evaluate("(el) => el.open")

        # Route buttons, browser hash navigation, evidence page.
        page.locator("#dashboard-next").click()
        expect(page.locator("#dashboard-title")).to_have_text("经营总览")
        assert_image_loaded(page)
        page.evaluate("location.hash = '#evidence'")
        expect(page.locator("#view-evidence")).to_be_visible()
        assert page.locator(".resource-item").count() == 4
        expect(page.locator("#view-dashboard")).to_be_hidden()

        dims = page.evaluate(
            "() => ({ viewport:document.documentElement.clientWidth, "
            "document:document.documentElement.scrollWidth })"
        )
        assert dims["document"] <= dims["viewport"] + 1, dims
        assert not errors, errors
        print(f"PASS {width}x{height}: fixed shell / sidebar / routes / gallery / evidence / zero JS errors")
        page.close()
    browser.close()
