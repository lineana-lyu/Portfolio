-- delivery_review_by_delay.sql
-- MySQL 8.0+ | Olist | Delivery punctuality x customer review score.
-- Order-level analysis: NEVER join raw order_items to raw reviews.
-- Scope: status = 'delivered', with actual and estimated delivery dates.
-- One order can have multiple reviews; average them into ONE order score.
-- NULL review scores are excluded from the score average and COUNT(score).
-- Delay is calendar days (DATEDIFF), not hours.
-- This documents ASSOCIATION ONLY, not a causal effect of lateness.

WITH delivered_orders AS (
    SELECT
        o.order_id,
        DATEDIFF(
            o.order_delivered_customer_date,
            o.order_estimated_delivery_date
        ) AS delay_days
    FROM orders AS o
    WHERE o.order_status = 'delivered'
      AND o.order_delivered_customer_date IS NOT NULL
      AND o.order_estimated_delivery_date IS NOT NULL
),
order_review AS (
    SELECT
        order_id,
        AVG(review_score) AS avg_order_review_score
    FROM order_reviews
    GROUP BY order_id
),
scored_orders AS (
    SELECT
        d.order_id,
        d.delay_days,
        r.avg_order_review_score,
        CASE
            WHEN d.delay_days < 0 THEN 'Early'
            WHEN d.delay_days = 0 THEN 'On Time'
            WHEN d.delay_days BETWEEN 1 AND 3 THEN 'Late (1-3 days)'
            WHEN d.delay_days BETWEEN 4 AND 7 THEN 'Late (4-7 days)'
            ELSE 'Late (8+ days)'
        END AS delivery_bucket
    FROM delivered_orders AS d
    LEFT JOIN order_review AS r
        ON r.order_id = d.order_id
)
SELECT
    delivery_bucket,
    COUNT(*) AS delivered_order_count,
    COUNT(avg_order_review_score) AS reviewed_order_count,
    COUNT(*) - COUNT(avg_order_review_score) AS missing_review_order_count,
    ROUND(
        100.0 * COUNT(avg_order_review_score) / NULLIF(COUNT(*), 0),
        2
    ) AS review_coverage_pct,
    ROUND(AVG(avg_order_review_score), 2) AS avg_review_score,
    ROUND(AVG(delay_days), 2) AS avg_delay_days,
    ROUND(
        100.0 * COUNT(*) / NULLIF(SUM(COUNT(*)) OVER (), 0),
        2
    ) AS delivered_order_share_pct
FROM scored_orders
GROUP BY delivery_bucket
ORDER BY FIELD(
    delivery_bucket,
    'Early',
    'On Time',
    'Late (1-3 days)',
    'Late (4-7 days)',
    'Late (8+ days)'
);
