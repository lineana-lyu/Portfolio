-- cohort_monthly_repeat.sql
-- MySQL 8.0+ | Olist | Monthly repurchase by FIRST purchase cohort.
-- Question: among customers first seen in month M, what fraction
-- placed >=1 eligible order in month M + n (n = 0..6)?
--
-- Key corrections relative to original analysis notes:
-- 1) Denominator = DISTINCT users first purchasing in cohort month.
-- 2) Activity = DISTINCT users per natural calendar month, NOT order rows.
-- 3) Only emit months that were observable in FULL in the sample.
--    The latest observed calendar month is conservatively excluded.
-- 4) Fully observed months with zero repeat purchases are 0, while
--    unobserved future months are absent (NOT incorrectly set to zero).
-- 5) customer_unique_id is user identity; order items only via EXISTS.
-- NOTE: These choices may yield slightly different results from the
-- screenshot; compare definitions before changing any public claims.

WITH RECURSIVE
params AS (
    SELECT CAST(DATE_FORMAT(MAX(o.order_purchase_timestamp), '%Y-%m-01') AS DATE)
        AS cutoff_exclusive
    FROM orders AS o
    WHERE o.order_status NOT IN ('canceled', 'unavailable')
      AND o.order_purchase_timestamp IS NOT NULL
      AND EXISTS (
          SELECT 1 FROM order_items AS oi WHERE oi.order_id = o.order_id
      )
),
eligible_orders AS (
    SELECT
        c.customer_unique_id,
        CAST(DATE_FORMAT(o.order_purchase_timestamp, '%Y-%m-01') AS DATE)
            AS purchase_month
    FROM orders AS o
    INNER JOIN customers AS c
        ON c.customer_id = o.customer_id
    CROSS JOIN params AS p
    WHERE o.order_status NOT IN ('canceled', 'unavailable')
      AND o.order_purchase_timestamp IS NOT NULL
      AND c.customer_unique_id IS NOT NULL
      AND o.order_purchase_timestamp < p.cutoff_exclusive
      AND EXISTS (
          SELECT 1 FROM order_items AS oi WHERE oi.order_id = o.order_id
      )
),
customer_month AS (
    SELECT DISTINCT customer_unique_id, purchase_month
    FROM eligible_orders
),
first_purchase AS (
    SELECT
        customer_unique_id,
        MIN(purchase_month) AS cohort_month
    FROM customer_month
    GROUP BY customer_unique_id
),
cohort_size AS (
    SELECT
        cohort_month,
        COUNT(*) AS cohort_users
    FROM first_purchase
    GROUP BY cohort_month
),
month_offsets AS (
    SELECT 0 AS month_index
    UNION ALL
    SELECT month_index + 1
    FROM month_offsets
    WHERE month_index < 6
),
observable_grid AS (
    SELECT
        cs.cohort_month,
        mo.month_index,
        cs.cohort_users
    FROM cohort_size AS cs
    CROSS JOIN month_offsets AS mo
    CROSS JOIN params AS p
    WHERE cs.cohort_month >= '2017-01-01'
      AND DATE_ADD(cs.cohort_month, INTERVAL mo.month_index MONTH)
          < p.cutoff_exclusive
),
active_customer_count AS (
    SELECT
        fp.cohort_month,
        TIMESTAMPDIFF(MONTH, fp.cohort_month, cm.purchase_month)
            AS month_index,
        COUNT(DISTINCT fp.customer_unique_id) AS active_users
    FROM first_purchase AS fp
    INNER JOIN customer_month AS cm
        ON fp.customer_unique_id = cm.customer_unique_id
    GROUP BY
        fp.cohort_month,
        TIMESTAMPDIFF(MONTH, fp.cohort_month, cm.purchase_month)
)
SELECT
    DATE_FORMAT(g.cohort_month, '%Y-%m') AS cohort_month,
    g.month_index,
    g.cohort_users,
    COALESCE(a.active_users, 0) AS returning_users_in_month,
    ROUND(
        100.0 * COALESCE(a.active_users, 0)
        / NULLIF(g.cohort_users, 0),
        2
    ) AS monthly_repurchase_pct
FROM observable_grid AS g
LEFT JOIN active_customer_count AS a
    ON a.cohort_month = g.cohort_month
   AND a.month_index = g.month_index
ORDER BY g.cohort_month, g.month_index;
