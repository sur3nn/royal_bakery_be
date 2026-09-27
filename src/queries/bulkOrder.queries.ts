export const BULK_ORDER_QUERIES = {
  CREATE_ORDER: `
    INSERT INTO bulk_orders (order_number, customer_id, customer_name_snapshot, phone_snapshot, email_snapshot, delivery_date, delivery_time, total_amount, advance_paid, remaining_amount, status, occasion, special_instructions, created_by)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `,
  CREATE_ORDER_ITEM: `
    INSERT INTO bulk_order_items (bulk_order_id, product_id, product_name_snapshot, quantity, unit, rate, amount)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `,
  GET_ALL: `SELECT * FROM bulk_orders ORDER BY delivery_date ASC, delivery_time ASC`,
  UPDATE_STATUS: `UPDATE bulk_orders SET status = ? WHERE id = ?`
};
