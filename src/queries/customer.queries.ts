export const CUSTOMER_QUERIES = {
  GET_ALL: `SELECT * FROM customers ORDER BY created_at DESC`,
  GET_BY_ID: `SELECT * FROM customers WHERE id = ?`,
  FIND_BY_PHONE: `SELECT * FROM customers WHERE phone = ?`,
  CREATE: `
    INSERT INTO customers (name, phone, email, address, notes, outstanding_balance)
    VALUES (?, ?, ?, ?, ?, ?)
  `
};
