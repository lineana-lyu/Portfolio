# Olist · 用户回购分析作品集

一个面向数据分析实习／校招的**业务分析案例**。网站负责清楚地说明「现象 → 判断过程 → 待验证的运营决策」，而不是重做 Power BI 大屏。

## 当前页面（内容减法版）

- 主结论：历史样本中 96.96% 的用户只购买一次（截图来源，待 SQL 对账）。
- 三条关键判断：用户去重口径、Cohort 观察时间公平性、RFM 频次集中造成的分群局限。
- 运营假设：优先验证首购后二次购买，设计随机对照实验；没有编造实施结果。
- 一处原生 HTML 折叠内容：指标口径与尚未验证的判断。
- 没有重复 KPI 卡片、五步标签交互、重复图表或展示用的开发状态标签。

## 文件与运行

- `index.html`：页面内容与语义结构
- `styles.css`：响应式深色样式
- `tests/m1_smoke.py`：1440px / 375px 渲染与交互冒烟测试
- `SPEC.md`：经 CR-001 更新的 v1.1 规格
- `changes/CR-001-content-reduction.md`：内容减法决策依据
- `reviews/SDD-03-content-reduction.md`：模块复审记录

运行：直接打开 `index.html`，或在仓库根目录执行 `python -m http.server 8000`。

测试（需 Playwright 和 Chromium）：
```bash
CHROMIUM_PATH=/usr/bin/chromium python tests/m1_smoke.py
```

## 当前仍缺什么

**尚未正式完成求职作品集，也没有公共网址。**

M2 需补齐 SQL 对账与 Cohort 观察窗口核验；M3 将使用真正的 Power BI Service 公开嵌入链接显示原生报表（需检查公开数据风险），不会把截图冒充可交互报表。后续发布前再验证未登录访客访问。

当前已确认的主线是历史交易行为描述，**不是流失预测或已完成的运营实验**。
