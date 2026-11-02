# Olist 电商经营与用户行为分析

面向招聘人员的 **三段式作品集**：项目背景 → 分析路径 → Power BI 原生大屏。

> 仓库还未发布正式网站；目前 Power BI Service 的公共嵌入链接尚未配置。

## 项目页面

- **项目背景：** Olist 公开历史数据、MySQL 多表关联、Power BI 四页分析。
- **分析路径：** 经营总览 → 收入结构 → 并行研究用户行为／履约体验。每个主题只回答一个业务问题。
- **Power BI：** 使用官方公开发布的原生 iframe 保留四页筛选和图表联动，**不重绘 BI 图表**。

代码：`index.html`、`styles.css`、`embed.js`（均为静态文件，无构建步骤）。

## 本地查看

双击 `index.html`，或执行 `python -m http.server 8000` 并打开 `http://localhost:8000/`。

## 如何接入 Power BI

1. 在 Power BI Service 发布原始 `.pbix` 报表；确认数据模型及明细适合**完全公开**。
2. 如果账号和租户允许，在 Power BI 中使用 **Publish to web（公开发布）** 获取 `https://app.powerbi.com/view?r=...` 地址。私人分享 URL、workspace URL、本地 `.pbix` 不可替代。
3. 将地址填入 `embed.js` 中的 `POWER_BI_PUBLISH_TO_WEB_URL` 常量。
4. 刷新网页，在未登录浏览器窗口测试四页切换、筛选、地图及图表是否可用。

如果为空，网页会明确显示「Power BI 交互报表尚未接入」，不会展示伪造图表。

## SDD 与质量控制

- [SPEC v2.0](SPEC.md)：三段式需求、内容限制及验收
- [CR-002](changes/CR-002-three-section-portfolio.md)：此次设计取舍
- [SDD-04 审查](reviews/SDD-04-three-section-audit.md)：逐模块复盘
- [冒烟测试](tests/m1_smoke.py)：项目 3 个区块、4 主题、 iframe 状态、宽屏和手机页面溢出检查

在已安装 Playwright/Chromium 的本机运行：
```bash
python tests/m1_smoke.py
```

## 未通过的发布门槛

- Power BI 公开链接和无账号交互测试未完成。
- 关键 SQL 结果、订单口径、Cohort 观察窗口及履约评分样本量仍需对账。
- 未验证正式公开访问地址。

**本项目展示历史公开数据分析，不代表已经训练流失模型或实施运营实验。**
