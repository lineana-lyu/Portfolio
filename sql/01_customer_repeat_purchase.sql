-- customer_repeat_purchase.sql
-- MySQL 8.0+ | Olist | Evidence for historical repeat purchase
-- Grain: 1 row per customer_unique_id in user_frequency.
-- "Eligible" is a study-defined scope, NOT confirmed delivery:
--   order status NOT IN ('canceled', 'unavailable')
--   and at least one order_items row.
-- Time: all available eligible orders; unequal follow-up time is a limitation.
-- No joins to raw order_items or order_reviews in the final counting step.
--
-- Dashboard reference ONLY (not verified here):
--   users 94,983; repeat users 2,887; repeat rate 3.04%.
-- Run against your own imported data and compare the results.

WITH eligible_orders AS (
    SELECT
        o.order_id,
        c.customer_unique_id,
        o.order_purchase_timestamp
    FROM orders AS o
    INNER JOIN customers AS c
        ON o.customer_id = c.customer_id
    WHERE o.order_status NOT IN ('canceled', 'unavailable')
      AND o.order_purchase_timestamp IS NOT NULL
      AND c.customer_unique_id IS NOT NULL
      AND EXISTS (
          SELECT 1
          FROM order_items AS oi
          WHERE oi.order_id = o.order_id
      )
),
user_frequency AS (
    SELECT
        customer_unique_id,
        COUNT(DISTINCT order_id) AS order_count
    FROM eligible_orders
    GROUP BY customer_unique_id
)
SELECT
    COUNT(*) AS purchasing_users,
    SUM(CASE WHEN order_count = 1 THEN 1 ELSE 0 END) AS one_time_users,
    SUM(CASE WHEN order_count >= 2 THEN 1 ELSE 0 END) AS repeat_users,
    ROUND(
        100.0 * SUM(CASE WHEN order_count >= 2 THEN 1 ELSE 0 END)
        / NULLIF(COUNT(*), 0),
        2
    ) AS historical_repeat_rate_pct,
    ROUND(
        100.0 * SUM(CASE WHEN order_count = 1 THEN 1 ELSE 0 END)
        / NULLIF(COUNT(*), 0),
        2
    ) AS one_time_rate_pct
FROM user_frequency;
