"""Smoke test for SPEC v2.0; run after cloning: python tests/site_smoke.py"""
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
url = (ROOT / "index.html").resolve().as_uri()

with sync_playwright() as pw:
    browser = pw.chromium.launch(headless=True)
    for width, height in [(1440, 900), (375, 812)]:
        page = browser.new_page(viewport={"width": width, "height": height})
        errors = []
        page.on("pageerror", lambda err: errors.append(str(err)))
        page.goto(url, wait_until="load")
        assert page.locator("main > section").count() == 3
        assert page.locator(".path-card").count() == 4
        assert page.get_by_role("heading", name="Olist 电商经营与用户行为分析").count() == 1
        assert page.locator("#report-empty").is_visible()
        assert page.locator("#report-frame").is_hidden()
        assert page.locator("#report-link").is_hidden()
        assert page.get_by_role("link", name="GitHub 源码").get_attribute("href").startswith("https://github.com/")
        dims = page.evaluate("({scroll:document.documentElement.scrollWidth,client:document.documentElement.clientWidth})")
        assert dims["scroll"] <= dims["client"] + 1, dims
        assert not errors, errors
        page.screenshot(path=str(ROOT / f"smoke_{width}.png"), full_page=True)
        page.close()
        print(f"PASS: {width}x{height}, 3 sections, 4 topics, no overflow")
    browser.close()
