# Olist · 数据分析作品集（SDD）

> **研究问题：交易增长之后，用户是否还会回来？**

这是面向数据分析实习／校招的业务推导型作品集。网站负责讲清问题、方法选择和判断边界；Power BI 在后续版本作为原生数据证据嵌入，不重复开发图表。

## 当前状态

- **M1 已实现并完成模块审查**：首屏、两个主指标、五步可交互的业务推导、口径说明。
- **数据待复核**：数值暂来自既有 Power BI 截图；SQL 对账属于 M2。
- **Power BI 尚未接入**：本地 `.pbix` 不能直接通过 iframe 展示；公开嵌入属于 M3。
- **尚未部署公共网址**：部署与访客访问验收属于 M5。
- 当前唯一维护仓库：`lineana-lyu/Portfolio`，默认分支 `main`。

## 本地预览

直接双击 `index.html`，或运行：

```bash
python -m http.server 8000
```

然后访问 `http://localhost:8000/`。

项目使用原生 HTML、CSS、JavaScript，无第三方运行时依赖。

## 规格、代码和质量门槛

- [SPEC.md](SPEC.md)：冻结需求、分析边界、可测试验收条件
- [index.html](index.html)：语义化结构、业务问题与关键指标
- [styles.css](styles.css)：响应式、精简深色视觉规范
- [app.js](app.js)：五步业务推导内容和交互
- [M1 审查](reviews/SDD-02-M1-review.md)：逐模块业务及工程批判性审查
- [M1 冒烟测试](tests/m1_smoke.py)：桌面／手机、Tab、键盘、折叠与页面溢出

测试依赖 Playwright：

```bash
pip install playwright
playwright install chromium
python tests/m1_smoke.py
```

## 下一步

**M2：证据对账。** 优先核验用户唯一标识、订单筛选、购买频次和 Cohort 成熟窗口；提供关键 SQL 与结果，只有证据可靠后才更新为「已核验」。

**没有做的事不得写成成果**：目前不是流失预测模型，没有运营 A/B 结果，也没有已公开可交互的 Power BI 在线报表。
