export const CATEGORY_QUERIES = {
  GET_ALL: `SELECT id, name, status FROM product_categories WHERE status = true ORDER BY name ASC`,
  CREATE: `INSERT INTO product_categories (name, status) VALUES (?, ?)`
};

export const UNIT_QUERIES = {
  GET_ALL: `SELECT id, name, short_code, display_label, allow_decimal FROM measurement_units WHERE status = true ORDER BY id ASC`,
  CREATE: `INSERT INTO measurement_units (name, short_code, display_label, allow_decimal) VALUES (?, ?, ?, ?)`
};