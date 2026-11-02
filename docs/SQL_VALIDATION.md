# SQL 对账与业务结论审核

**状态：待本地 MySQL 实测**。此次只从已有《数据检查.md》和现有四张 Power BI 截图整理了 SQL 逻辑；没有 Olist 全量关系表的数据副本，也没有连接用户本地数据库，因此任何“对账成功”说法都不成立。

## 1. 执行环境与口径确认

记录下列信息再截图或导出：
- [ ] MySQL 版本（必须 8.0+，查询使用窗口函数、CTE、递归 CTE）。
- [ ] 当前数据库名及 9 表行数（原笔记有统一行数检查 SQL）。
- [ ] 最早和最晚 `orders.order_purchase_timestamp`；检查样本末月是否完整。
- [ ] 订单状态分布；本次复购和 Cohort 用 `NOT IN ('canceled','unavailable')`，**包含未送达状态**。
- [ ] 查询是否要求订单存在 `order_items` 行；本次明确要求存在商品明细。
- [ ] `customer_unique_id` 是否有 NULL 或不对应记录。
- [ ] 这份样本与 Power BI 导入的数据集是否一致（尤其日期筛选）。

## 2. 运行复购 SQL

运行 [01_customer_repeat_purchase.sql](../sql/01_customer_repeat_purchase.sql)，保留一行结果。

| 字段 | 既有 Power BI 参考（非已验证） | 本地运行值 |
| --- | ---: | --- |
| purchasing_users | 94,983 | 待填写 |
| repeat_users | 2,887 | 待填写 |
| historical_repeat_rate_pct | 3.04% | 待填写 |
| one_time_users | 92,096 | 待填写 |
| one_time_rate_pct | 96.96% | 待填写 |

如果不相等，逐项比对：订单状态、`order_purchase_timestamp IS NOT NULL`、是否要求 `order_items` 存在、是否按 `customer_unique_id` 统计、Power BI 是否额外筛选 `delivered` 或 2018-08 截止。

**注意**：复购数小不能据此判断“高流失”；缺少统一观察时长，也没有业务行业基准。

## 3. 运行 Cohort SQL

运行 [02_cohort_monthly_repeat.sql](../sql/02_cohort_monthly_repeat.sql)。

- [ ] 所有 Cohort 的 M0 = cohort_users 且月度回购率为 100%。
- [ ] `returning_users_in_month` 不大于 `cohort_users`。
- [ ] 对**完整可观察**但无回购的月份输出 0；样本截止后的未来月份**不输出行**。
- [ ] 每个自然月只计一次用户（`DISTINCT customer_unique_id, purchase_month`）。
- [ ] 比较不同 cohort 的 M1/M2 时，选择同样成熟的观察窗口。
- [ ] 不能与 `01` 的购买用户总量强行对齐：`02` 排除了**最新观察月份**的购买，`01` 则包含全部历史有效订单。

**原始笔记里有必须注意的差异**：使用 `PERIOD_DIFF` 算月份间隔是合理的；但原 SQL 只展示出现过购买活动的 Cohort-M 单元格，容易混淆 0 与未观察。整理后的脚本使用月份网格显式区分。

## 4. 运行配送评分 SQL

运行 [03_delivery_review_by_delay.sql](../sql/03_delivery_review_by_delay.sql)。

| 分组 | 现有截图评分（非已验证） | 本地 avg_review_score | delivered_order_count | reviewed_order_count |
| --- | ---: | --- | --- | --- |
| Early | 约 4.29 | 待填写 | 待填写 | 待填写 |
| On Time | 约 4.04 | 待填写 | 待填写 | 待填写 |
| Late (1-3 days) | 约 3.29 | 待填写 | 待填写 | 待填写 |
| Late (4-7 days) | 约 2.11 | 待填写 | 待填写 | 待填写 |
| Late (8+ days) | 约 1.70 | 待填写 | 待填写 | 待填写 |

- [ ] `delivered_order_count >= reviewed_order_count`；覆盖率在 0–100%。
- [ ] 分组的配送订单总量等于实际已送达、两日期非空订单总量。
- [ ] 准时送达率若定义为 `(Early+On Time)/全部有效妥投订单`，可以用分组订单数复算并与截图 **93.23%** 比较。
- [ ] `reviewed_order_count` 只统计评论平均分非 NULL 的订单；不可以用 `COUNT(DISTINCT order_id)` 冒充“已评价订单”。
- [ ] 一个订单若有多条评价，先求订单均分后再进行分组均值。
- [ ] 多卖家共享同一订单的评价不应被解释为对单个卖家已证实的独立贡献。

即使评分分组差异明显，也只能说**相关**，不能写“延迟造成差评”或“造成用户流失”。

## 5. 三项代码与原始分析记录的关键差异

| 原记录 | 当前处理 | 状态 |
| --- | --- | --- |
| 使用订单 + 商品 + 用户联表计算复购 | 使用 `EXISTS` 检查商品行存在，但不展开商品明细 | 已在代码实现；待 MySQL 实测 |
| Cohort 源 SQL 仅有活动月份，未来月份为空 | 生成可观察月份网格，真正 0 与尚未观察分开 | 已在代码实现；待数据对账 |
| RFM 源文档在笔记层有部分字符与 CTE 拼写问题 | 本轮只整理复购和 Cohort，不对 RFM 直接宣称已修复完成 | 仍需独立复盘 |
| 配送分组源 SQL 的 `reviewed_order_count` 实际包括无评分订单 | 真实区分总订单、已评分、缺失评分及评分覆盖率 | 已在代码实现；待 MySQL 实测 |
| 旧版 Cohort 和复购有时对订单是否存在商品明细采用不同筛选 | 两份 SQL 用一致规则，保留时间窗口差异 | 已统一，可能影响历史截图数字 |

## 6. 下一步的验收条件

收到上述三份查询的原始导出结果或 MySQL 执行截图后，逐条比对 Power BI，确认：
- **事实**：数字 / 分母 / 日期范围一致，或解释清楚可复现的差异；
- **逻辑**：没有一对多重复计数、时间截断、评价缺失导致的误导；
- **呈现**：只有通过核验的两条事实才能被放到作品集首页。

**当前结论：SQL 已整理；SQL 运行、数据库结果核验和 Power BI 同口径对账仍待完成。**
