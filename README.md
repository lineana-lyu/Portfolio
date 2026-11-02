# Olist 电商经营与用户行为分析

基于 Olist 巴西电商公开交易数据，使用 **MySQL + Power BI** 完成经营表现、收入结构、用户行为和履约体验分析，并以一个轻量作品集网页展示四张 Power BI 看板。

**[在线查看作品集](https://lineana-lyu.github.io/Portfolio/)** · [下载 Power BI 原文件](downloads/Olist_电商经营分析.pbix) · [下载四页 PDF](downloads/Olist_四页看板.pdf)

![Olist 电商经营总览 Power BI 看板](assets/01_overview.png)

## 项目内容

| 分析方向 | 回答的业务问题 | 主要方法 |
| --- | --- | --- |
| 经营总览 | 平台交易规模与月度趋势如何？ | GMV、订单数、月度趋势与环比 |
| 收入结构 | 收入主要来自哪些品类和地区？ | 品类 GMV、州级分布、支付方式 |
| 用户行为 | 用户是否重复购买，如何理解用户差异？ | 购买频次、Cohort 月度回购、RFM |
| 履约体验 | 配送时效和客户评分有何关联？ | 配送偏差、客户评价、卖家表现 |

数据源为公开的 **Olist Brazilian E-Commerce Public Dataset**。本作品集以历史数据做描述性分析，不代表平台当前状况；RFM 不是预测流失模型，配送延迟与评分的关系不直接证明因果。

## 浏览与文件

在线网页包含项目背景、四个分析主题和四张真实 Power BI 截图。点击分析主题可跳转到对应看板；支持看板标签切换、键盘左右方向键切换，以及点击图片全屏放大。

**网页里展示的是静态看板图片，不能直接操作 Power BI 图表。** 如需使用 Power BI 的原生筛选及交叉联动，请下载 `.pbix` 并在 Power BI Desktop 中打开。部分模型刷新操作可能需要重新配置原始数据文件路径。

| 文件或目录 | 用途 |
| --- | --- |
| `index.html` | 单页内容、语义结构和大屏浏览入口 |
| `styles.css` | 参考个人网站设计体系的响应式样式 |
| `gallery.js` | 看板切换、键盘操作和原图放大 |
| `assets/` | 4 张 Power BI 导出图片 |
| `downloads/` | 原始 `.pbix` 与 PDF |
| `tests/site_smoke.py` | 桌面 / 移动端基本交互检查 |
| `docs/` | 项目质量检查及早期 SDD 归档 |

本项目使用**原生 HTML / CSS / JavaScript**，不依赖第三方前端框架或构建步骤；保留截图和源文件的原始格式。

## 关键 SQL 与结果对账

本仓库新增 3 份可独立运行的 MySQL 8.0+ 分析脚本：

- [用户历史复购](sql/01_customer_repeat_purchase.sql)：用户去重、有效订单范围与复购率。
- [Cohort 月度回购](sql/02_cohort_monthly_repeat.sql)：首购月份及完整可观察月份的回购。
- [配送时效 × 客户评分](sql/03_delivery_review_by_delay.sql)：订单级评价、延迟分层和评价覆盖率。

具体运行方法见 [SQL 使用说明](sql/README.md)，待核验数据与统计差异见 [SQL 对账清单](docs/SQL_VALIDATION.md)。

**状态说明：**这些脚本是根据原始项目 SQL 笔记整理，尚未连接本地 MySQL 数据库实测，现有 Power BI 数字仍属于历史截图结果，不能宣称已完成同口径对账。

## 本地运行

直接双击 `index.html`，或在仓库目录运行：

```bash
python -m http.server 8000
```

然后打开 `http://localhost:8000/`。

需要运行浏览器冒烟检查时，先安装 Python Playwright 和 Chromium：

```bash
pip install playwright
playwright install chromium
python tests/site_smoke.py
```

## 部署

静态网站使用 **GitHub Pages**，从 `main` 分支根目录发布。提交 HTML/CSS/JS 后，Pages 会更新公开页面；`assets/` 和 `downloads/` 与网页位于同一仓库。

## 设计来源与说明

网页的浅灰纸张背景、珊瑚色强调、编辑式标题、导航文字悬浮切换及看板选项卡，沿用个人项目 [personal_website](https://github.com/lineana-lyu/personal_website) 的设计语言；没有移植其全屏 Hero、视频、3D 或复杂动效，以保持数据分析作品集的阅读效率。

页面优化不会改变 Power BI 的统计结果。具体指标口径与数据质量仍以原始 SQL / Power BI 计算逻辑为准；在公开历史数据中得出的建议不等于已落地的运营效果。
