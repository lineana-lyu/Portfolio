# Portfolio visual refresh · QA / review

2026-11-02 · 参考仓库 [personal_website](https://github.com/lineana-lyu/personal_website)

## Design mapping
- Reuse: Relief Edition neutral palette `#efeeea`, `#252522`, coral `#d56d63`, translucent navigation, thin editorial rules, serif section titles, nav-roll hover, underlined project tabs.
- Simplify: no hero video, no 3D, no mouse-following cursor, no page-entry animation, no heavy dependencies.
- Focus: three content regions (project context / four analysis questions / original Power BI export gallery), with download access to the PBIX and PDF.

## UX review by module
| Module | Decision | Risk / boundary |
| --- | --- | --- |
| Background | One compact intro, no full-screen hero; project goal and toolchain visible without interaction | Don't market Olist historical data as current operations |
| Analysis path | Four business questions, buttons navigate to corresponding screenshot | These are analysis topics, not a causal pipeline |
| Gallery | Original screenshots, switcher underline, keyboard arrows, native zoom dialog and image link | Image preview is NOT interactive Power BI |
| Downloads | Real `.pbix` and PDF in repository, relative links for GitHub Pages | Opening PBIX may require source path adjustment |

## Technical acceptance checklist
- [x] Four source image paths match tracked `assets/` names.
- [x] Download links match tracked `downloads/` names.
- [x] All gallery controls are native buttons; navigation works without pointer precision.
- [x] Zoom uses native `dialog`, Escape, left/right navigation and a visible close button.
- [x] Responsive CSS specifies 900px and 640px breakpoints and reduced-motion behavior.
- [x] No added runtime framework, fonts, trackers or external JS dependencies.
- [ ] Run `python tests/site_smoke.py` with Chromium to validate actual browser rendering at 1440px and 375px.
- [ ] Confirm GitHub Pages deployment is green and try PBIX download in an anonymous browser.

## Source accuracy
The website does not add unsupported claims from the screenshots. Detailed metric definitions, Cohort observation windows and fulfillment group sample sizes still need verification against the user's SQL. Existing figures in the original Power BI screenshots were not edited.

## Repository cleanup
Historical SDD versions are moved to `docs/archive/` for traceability. The live site only needs `index.html`, `styles.css`, `gallery.js`, `assets/` and `downloads/`. The README should describe current reality rather than old upload constraints.
