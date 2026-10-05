export const BULK_ORDER_QUERIES = {
CREATE_ORDER: `
  INSERT INTO bulk_orders (
    order_number,
    customer_id,
    customer_name_snapshot,
    phone_snapshot,
    email_snapshot,
    delivery_date,
    delivery_time,
    total_amount,
    advance_paid,
    remaining_amount,
    status,
    occasion,
    special_instructions,
    created_by,
    delivery_address
  )
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`,

  // changed: now saves pack_size and pack_count
  CREATE_ORDER_ITEM: `
    INSERT INTO bulk_order_items (bulk_order_id, product_id, product_name_snapshot, quantity, unit, pack_size, pack_count, rate, amount)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `,

  // new: save the 2 KOT numbers
  SET_KOT: `
    UPDATE bulk_orders
       SET kitchen_kot_no = ?, packing_kot_no = ?, kot_generated_at = NOW()
     WHERE id = ?
  `,

  // changed: products JSON now includes pack_size and pack_count
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
            'pack_size', boi.pack_size,
            'pack_count', boi.pack_count,
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
  UPDATE_STATUS: `UPDATE bulk_orders SET status = ? WHERE id = ?`,
  
  GET_ALL_DELIVERY_STATUS: `
    SELECT id, name
    FROM delivery_status`,
     GET_BY_ID: `
    SELECT bo.*, c.name AS customer_name, c.phone AS customer_phone
      FROM bulk_orders bo
      LEFT JOIN customers c ON bo.customer_id = c.id
     WHERE bo.id = ?
  `,

  // new: items of one order for the KOT PDFs
  GET_ITEMS_BY_ORDER_IDS: `
    SELECT bulk_order_id,
           product_name_snapshot AS productName,
           quantity, unit,
           pack_size  AS packSize,
           pack_count AS packCount
      FROM bulk_order_items
     WHERE bulk_order_id IN (?)
     ORDER BY id
  `,
};