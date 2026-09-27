export const SALE_QUERIES = {
  CREATE_SALE: `
    INSERT INTO sales (invoice_number, customer_id, sale_date, sale_time, subtotal, gst_total, cgst, sgst, discount, discount_type, grand_total, amount_paid, balance_return, payment_method, cashier_id, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `,
  CREATE_SALE_ITEM: `
    INSERT INTO sale_items (sale_id, product_id, product_name_snapshot, unit, quantity, price_per_unit, gst_percent, subtotal, gst_amount, total)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `,
  GET_ALL_SALES: `
    SELECT s.*, c.name as customer_name, c.phone as customer_phone
    FROM sales s
    LEFT JOIN customers c ON s.customer_id = c.id
    ORDER BY s.created_at DESC
  `
};
