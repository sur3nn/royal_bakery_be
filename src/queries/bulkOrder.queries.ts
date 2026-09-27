export const BULK_ORDER_QUERIES = {
  CREATE_ORDER: `
    INSERT INTO bulk_orders (order_number, customer_id,delivery_date, delivery_time, total_amount, advance_paid, remaining_amount, status, occasion, special_instructions, created_by)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `,
  CREATE_ORDER_ITEM: `
    INSERT INTO bulk_order_items (bulk_order_id, product_id, product_name_snapshot, quantity, unit, rate, amount)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `,
  GET_ALL: `SELECT 
    bo.*,
    c.name AS customer_name,
    c.phone AS customer_phone,
    c.email AS customer_email,

    COALESCE(
      JSON_ARRAYAGG(
        CASE
          WHEN boi.id IS NOT NULL THEN JSON_OBJECT(
            'id', boi.id,
            'bulk_order_id', boi.bulk_order_id,
            'product_id', boi.product_id,
            'product_name', boi.product_name_snapshot,
            'unit', boi.unit,
            'price', boi.rate,
            'quantity', boi.quantity,
            'total', boi.amount
          )
        END
      ),
      JSON_ARRAY()
    ) AS products

  FROM bulk_orders bo

  LEFT JOIN customers c
    ON bo.customer_id = c.id

  LEFT JOIN bulk_order_items boi
    ON bo.id = boi.bulk_order_id


  GROUP BY bo.id

  ORDER BY bo.delivery_date ASC, bo.delivery_time ASC`,
  UPDATE_STATUS: `UPDATE bulk_orders SET status = ? WHERE id = ?`
};
