# Olist 核心 SQL 证据

这三份 SQL 是从历史项目《数据检查.md》的分析思路与查询改写整理的 **MySQL 8.0+** 脚本。目标是使用户行为及履约判断具有可复现的统计口径；**尚未在用户本地 MySQL 数据库运行**，因此不代表数值已经对账成功。

| SQL 文件 | 分析问题 | 返回结果 |
| --- | --- | --- |
| [01_customer_repeat_purchase.sql](01_customer_repeat_purchase.sql) | 历史购买用户中有多少人重复购买？ | 1 行：用户数、一次购/复购用户数、占比 |
| [02_cohort_monthly_repeat.sql](02_cohort_monthly_repeat.sql) | 不同首购月份后续自然月回购表现怎样？ | 每个 Cohort M0–M6 的样本量、回购人数和回购率 |
| [03_delivery_review_by_delay.sql](03_delivery_review_by_delay.sql) | 不同配送延迟组的客户评价有何关联？ | 5 组的配送订单数、有效评价订单数、评分、覆盖率 |

## 使用方法

1. 在 DataGrip 中连接已经导入 Olist 9 张表的 MySQL 8.0+ 数据库。
2. 选择包含 `customers`、`orders`、`order_items` 和 `order_reviews` 的数据库（例如 `USE olist_analytics;`）。
3. **逐份打开并独立运行**，每份 SQL 以一条查询结束；不要直接拼接成一个 CTE。
4. 将查询结果导出为 CSV，留存执行日期、数据库版本和数据截止范围；按 [SQL 对账清单](../docs/SQL_VALIDATION.md) 检查。

## 统一口径（重要）

- 唯一用户：`customers.customer_unique_id`；`customer_id` 只是一次下单时的客户记录 ID。
- 研究用有效订单：`orders.order_status NOT IN ('canceled','unavailable')`、有购买时间、至少有一行 `order_items` 商品明细。
- **研究用有效订单不等于已妥投订单，也不等于付款金额已到账。** 对复购和 Cohort 使用上述相同条件。
- 复购：同一 `customer_unique_id` 的 **去重订单数 ≥ 2**；整个数据窗口的历史描述，而非未来流失概率。
- Cohort 月份：首次购买所在自然月；每月活跃表示当月发生至少一笔有效订单，不是连续留存；M0 必然为 100%。
- Cohort 时间：为避免不完整自然月，排除*数据集中最新出现的自然月*；仅输出可完全观察的 M0–M6。此保守策略会让 Cohort 统计的基数和全窗口复购统计不同。
- 配送：只选择 `order_status='delivered'` 且预计/实际送达日期均非空的订单；先将订单评价聚合为一分，再求延迟组均分。
- 严重延迟：`DATEDIFF(实际送达, 预计送达) >= 8`，单位是自然日。
- 数据来源：公开的 Olist Brazilian E-Commerce Public Dataset。样本并不是当下电商业务运行数据。

## 与历史截图可能不同的原因

| 旧查询/看板做法 | 此次整理方式 | 为什么会变化 |
| --- | --- | --- |
| Cohort 直接统计所有满足订单状态的订单 | 额外保证订单有商品明细，与复购脚本统一 | 可能改变极少量边界订单 |
| Cohort 最后一个月份也纳入回购 | 排除最新可能不完整月；只输出成熟窗口 | 避免把“未观察”误记为 0 |
| 只展示存在购买的 Cohort 单元格 | 生成完整可观察月份：观测到 0 即显示 0，无法观察的月份不显示 | 明确 0 与缺失的区别 |
| 延迟组 `COUNT(DISTINCT order_id)` 命名 `reviewed_order_count` | 分别报告 delivered_order_count 与 reviewed_order_count | 原命名无法反映缺失评价 |
| 订单评价可能多行 | 每个订单先 `AVG(review_score)`，再计算配送组均值 | 防止多次评价订单权重过大 |

## 不要写成已验证的结论

Power BI 原截图给出历史复购率约 **3.04%**、准时送达率约 **93.23%**、延迟 8 天以上评分约 **1.70**。它们是**待对账的既有看板数字**，并不是运行新脚本后自动得出的结果。

在本地输出实际统计结果并核对口径之前，作品集首页仍只引用现有看板，不能写「通过严格 SQL 对账已证明」。履约和评分只能描述关联，不能证明配送延迟导致评分下降。
