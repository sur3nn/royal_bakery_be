// bulk_orders.status is a VARCHAR. It can hold the text 'Upcoming' (set when an order is created)
// OR a delivery_status id such as '2' (set by the status dropdown). Every query below joins
// delivery_status on BOTH so the real status name is always found.
//
// Your tables use different collations (utf8mb4_unicode_ci and utf8mb4_0900_ai_ci), and MySQL
// refuses to compare or COALESCE them. So every text comparison below forces ONE collation
// on both sides with COLLATE.
const COLL = 'utf8mb4_unicode_ci';

const STATUS_JOIN = `
  LEFT JOIN delivery_status ds
         ON ds.name COLLATE ${COLL} = bo.status COLLATE ${COLL}
         OR CAST(ds.id AS CHAR) COLLATE ${COLL} = bo.status COLLATE ${COLL}
`;

// Real status name of an order, whichever way it was stored
const STATUS_NAME = `COALESCE(ds.name COLLATE ${COLL}, bo.status COLLATE ${COLL})`;

const PENDING_WHERE = `
  bo.delivery_date >= CURDATE()
  AND LOWER(${STATUS_NAME}) IN ('upcoming', 'preparing', 'ready')
`;

export const DASHBOARD_QUERIES = {
  // Server "today" as text, used to build the 7-day chart without time-zone surprises
  GET_TODAY: `SELECT DATE_FORMAT(CURDATE(), '%Y-%m-%d') AS today`,

  // KPI: today's sales, bills, average ticket
  GET_TODAYS_SALES: `
    SELECT COALESCE(SUM(grand_total), 0) AS total_sales,
           COUNT(id)                     AS total_bills
      FROM sales
     WHERE sale_date = CURDATE() AND status = 'Completed'
  `,

  // KPI: estimated profit = selling subtotal (before GST) - cost of what was sold
  GET_TODAYS_PROFIT: `
    SELECT COALESCE(SUM(si.subtotal - (COALESCE(p.cost_price, 0) * si.quantity)), 0) AS profit,
           COALESCE(SUM(si.subtotal), 0)                                            AS revenue
      FROM sale_items si
      JOIN sales s         ON s.id = si.sale_id
      LEFT JOIN products p ON p.id = si.product_id
     WHERE s.sale_date = CURDATE() AND s.status = 'Completed'
  `,

  // Hourly chart: one row per hour that had sales (the service groups them into 2-hour slots)
  GET_HOURLY_SALES: `
    SELECT HOUR(sale_time)               AS hr,
           COALESCE(SUM(grand_total), 0) AS sales,
           COUNT(id)                     AS bills
      FROM sales
     WHERE sale_date = CURDATE() AND status = 'Completed'
     GROUP BY HOUR(sale_time)
  `,

  // Weekly chart: last 7 days including today
  GET_WEEKLY_SALES: `
    SELECT DATE_FORMAT(sale_date, '%Y-%m-%d') AS day,
           COALESCE(SUM(grand_total), 0)      AS sales,
           COUNT(id)                          AS bills
      FROM sales
     WHERE sale_date >= CURDATE() - INTERVAL 6 DAY
       AND sale_date <= CURDATE()
       AND status = 'Completed'
     GROUP BY sale_date
  `,

  // Top 5 products by quantity sold in the last 30 days
  GET_TOP_PRODUCTS: `
    SELECT p.id,
           p.name,
           pc.name           AS category,
           p.unit            AS unit,
           p.selling_price   AS sellingPrice,
           p.current_stock   AS stock,
           p.image_url       AS image,
           p.is_popular      AS isHighDemand,
           SUM(si.quantity)  AS soldQty,
           SUM(si.total)     AS soldAmount
      FROM sale_items si
      JOIN sales s          ON s.id = si.sale_id
                           AND s.status = 'Completed'
                           AND s.sale_date >= CURDATE() - INTERVAL 29 DAY
      JOIN products p       ON p.id = si.product_id
      LEFT JOIN product_categories pc ON pc.id = p.category_id
     GROUP BY p.id, p.name, pc.name, p.unit, p.selling_price, p.current_stock, p.image_url, p.is_popular
     ORDER BY soldQty DESC
     LIMIT 5
  `,

  // Low stock list + count
  GET_LOW_STOCK_PRODUCTS: `
    SELECT p.id,
           p.name,
           pc.name                 AS category,
           p.unit                  AS unit,
           p.selling_price         AS sellingPrice,
           p.current_stock         AS stock,
           p.min_stock_threshold   AS minStock,
           p.image_url             AS image
      FROM products p
      LEFT JOIN product_categories pc ON pc.id = p.category_id
     WHERE p.current_stock <= p.min_stock_threshold AND p.status = 'active'
     ORDER BY (p.current_stock - p.min_stock_threshold) ASC, p.name
     LIMIT 50
  `,
  GET_LOW_STOCK_COUNT: `
    SELECT COUNT(id) AS low_stock_count
      FROM products
     WHERE current_stock <= min_stock_threshold AND status = 'active'
  `,

  // Pending deliveries (Upcoming / Preparing / Ready, from today onwards) + count
  GET_PENDING_DELIVERIES: `
    SELECT bo.id,
           bo.order_number                                        AS orderNumber,
           COALESCE(c.name COLLATE ${COLL}, bo.customer_name_snapshot COLLATE ${COLL}) AS customerName,
           bo.phone_snapshot                                      AS customerPhone,
           DATE_FORMAT(bo.delivery_date, '%Y-%m-%d')              AS deliveryDate,
           TIME_FORMAT(bo.delivery_time, '%H:%i')                 AS deliveryTime,
           ${STATUS_NAME}                                         AS status,
           bo.remaining_amount                                    AS remainingAmount
      FROM bulk_orders bo
      LEFT JOIN customers c ON c.id = bo.customer_id
      ${STATUS_JOIN}
     WHERE ${PENDING_WHERE}
     ORDER BY bo.delivery_date ASC, bo.delivery_time ASC
     LIMIT 50
  `,
  GET_PENDING_DELIVERIES_COUNT: `
    SELECT COUNT(bo.id) AS pending_count
      FROM bulk_orders bo
      ${STATUS_JOIN}
     WHERE ${PENDING_WHERE}
  `,

  // Total number of bulk orders
  GET_BULK_ORDERS_TOTAL: `SELECT COUNT(id) AS total FROM bulk_orders`,
};