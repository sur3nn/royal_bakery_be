export const CATEGORY_QUERIES = {
  GET_ALL: `SELECT * FROM product_categories WHERE status = true ORDER BY name ASC`,
  CREATE: `INSERT INTO product_categories (name, status) VALUES (?, ?)`,
  UPDATE: `UPDATE product_categories SET name = ?, status = ? WHERE id = ?`
};
