"""M1 smoke test — narrative UI only.

Run:
  pip install playwright
  playwright install chromium
  python tests/m1_smoke.py

This does not verify SQL results, Power BI embedding, or public deployment.
"""
import os
from pathlib import Path
from playwright.sync_api import sync_playwright

root = Path(__file__).resolve().parents[1]
html = (root / "index.html").read_text(encoding="utf-8")
css = (root / "styles.css").read_text(encoding="utf-8")
js = (root / "app.js").read_text(encoding="utf-8")

with sync_playwright() as playwright:
    args = {"headless": True}
    if os.getenv("CHROMIUM_PATH"):
        args["executable_path"] = os.environ["CHROMIUM_PATH"]
    browser = playwright.chromium.launch(**args)
    for width, height in [(1440, 900), (375, 812)]:
        page = browser.new_page(viewport={"width": width, "height": height})
        errors = []
        page.on("pageerror", lambda error: errors.append(str(error)))
        page.set_content(html, wait_until="load")
        page.add_style_tag(content=css)
        page.add_script_tag(content=js)
        assert "交易增长之后" in page.locator("h1").inner_text()
        assert page.locator(".fact-number").count() == 2
        assert page.get_by_role("tab").count() == 5
        assert page.get_by_role("tab", selected=True).count() == 1
        for index in range(5):
            page.locator(f"#step-tab-{index}").click()
            assert page.locator(f"#step-tab-{index}").get_attribute("aria-selected") == "true"
            assert page.locator("#panel-finding").inner_text()
            assert page.locator("#panel-next").inner_text()
        page.locator("#step-tab-1").focus()
        page.keyboard.press("ArrowRight")
        assert page.locator("#step-tab-2").get_attribute("aria-selected") == "true"
        page.keyboard.press("End")
        assert page.locator("#step-tab-4").get_attribute("aria-selected") == "true"
        page.keyboard.press("Home")
        assert page.locator("#step-tab-0").get_attribute("aria-selected") == "true"
        page.locator("#method-details summary").click()
        assert page.locator("#method-details").get_attribute("open") is not None
        sizes = page.evaluate("({whole:document.documentElement.scrollWidth,viewport:document.documentElement.clientWidth})")
        assert sizes["whole"] <= sizes["viewport"] + 1, sizes
        assert not errors, errors
        print(f"PASS {width}×{height}: tabs, keyboard, details, width, JavaScript")
        page.close()
    browser.close()
