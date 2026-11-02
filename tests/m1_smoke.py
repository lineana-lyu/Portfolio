"""Content-focused acceptance for SDD CR-001; run: python tests/m1_smoke.py."""
import os
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
HTML = (ROOT / "index.html").read_text(encoding="utf-8")
CSS = (ROOT / "styles.css").read_text(encoding="utf-8")
assert "app.js" not in HTML
assert 'role="tablist"' not in HTML
assert "阶段 M1" not in HTML
with sync_playwright() as playwright:
    opts = {"headless": True}
    if os.environ.get("CHROMIUM_PATH"):
        opts["executable_path"] = os.environ["CHROMIUM_PATH"]
    browser = playwright.chromium.launch(**opts)
    for width, height in ((1440, 900), (375, 812)):
        page = browser.new_page(viewport={"width": width, "height": height})
        errors = []
        page.on("pageerror", lambda e: errors.append(str(e)))
        page.set_content(HTML, wait_until="load")
        page.add_style_tag(content=CSS)
        assert page.locator("h1").count() == 1
        assert page.locator(".reason-list li").count() == 3
        assert page.locator(".fact-number").count() == 0
        assert page.get_by_role("link", name="项目源码").count() == 1
        assert page.locator(".notes").get_attribute("open") is None
        page.locator(".notes summary").click()
        assert page.locator(".notes").get_attribute("open") is not None
        dims = page.evaluate("({body: document.documentElement.scrollWidth, viewport: document.documentElement.clientWidth})")
        assert dims["body"] <= dims["viewport"] + 1, dims
        assert not errors, errors
        print("PASS", width, height, "3 reasons, disclosure, no overflow or JS errors")
        page.close()
    browser.close()
