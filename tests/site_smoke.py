"""Browser smoke checks for the published/static Olist case page.

Run after cloning:
    pip install playwright
    playwright install chromium
    python tests/site_smoke.py
"""
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
for resource in (
    "assets/01_overview.png",
    "assets/02_revenue.png",
    "assets/03_customers.png",
    "assets/04_fulfillment.png",
    "downloads/Olist_电商经营分析.pbix",
    "downloads/Olist_四页看板.pdf",
):
    assert (ROOT / resource).is_file(), f"Missing: {resource}"

with sync_playwright() as playwright:
    browser = playwright.chromium.launch(headless=True)
    for width, height in ((1440, 900), (375, 812)):
        page = browser.new_page(viewport={"width": width, "height": height})
        errors = []
        page.on("pageerror", lambda error: errors.append(str(error)))
        page.goto((ROOT / "index.html").as_uri())
        assert page.locator("h1").count() == 1
        assert page.locator("main > section").count() == 4
        assert page.locator(".insight-card").count() == 3
        assert "R$13,494,400.74" in page.locator("#findings").inner_text()
        assert "3.04" in page.locator("#findings").inner_text()
        assert page.locator(".path-item").count() == 4
        assert page.locator(".gallery-tab").count() == 4
        assert page.locator("#dashboard-image").evaluate("(el) => el.naturalWidth > 0")
        page.locator('.gallery-tab[data-index="2"]').click()
        assert page.locator("#dashboard-image").get_attribute("src") == "assets/03_customers.png"
        assert page.locator("#dashboard-image").evaluate("(el) => el.naturalWidth > 0")
        assert page.locator("#original-image").get_attribute("href") == "assets/03_customers.png"
        assert "Cohort" in page.locator("#dashboard-takeaway").inner_text()
        page.locator("#image-zoom-trigger").click()
        assert page.locator("#zoom-dialog").evaluate("(el) => el.open")
        page.keyboard.press("ArrowRight")
        assert page.locator("#zoom-image").get_attribute("src") == "assets/04_fulfillment.png"
        page.keyboard.press("Escape")
        assert not page.locator("#zoom-dialog").evaluate("(el) => el.open")
        page.locator('[data-go-page="1"]').click()
        assert page.locator("#dashboard-image").get_attribute("src") == "assets/02_revenue.png"
        assert "四维" not in page.locator("#dashboard-takeaway").inner_text()
        assert "R$13,494,400.74" in page.locator("#dashboard-takeaway").inner_text()
        dimensions = page.evaluate("({document: document.documentElement.scrollWidth, viewport: document.documentElement.clientWidth})")
        assert dimensions["document"] <= dimensions["viewport"] + 1, dimensions
        assert not errors, errors
        print(f"PASS: {width}x{height} layout, galleries, path navigation, zoom, keyboard")
        page.close()
    browser.close()
