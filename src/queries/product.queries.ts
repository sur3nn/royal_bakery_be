export const PRODUCT_QUERIES = {
  GET_ALL: `
    SELECT p.*, c.name as category_name 
    FROM products p 
    LEFT JOIN product_categories c ON p.category_id = c.id 
    WHERE p.status = 'active'
  `,
  GET_BY_ID: `
    SELECT p.*, c.name as category_name 
    FROM products p 
    LEFT JOIN product_categories c ON p.category_id = c.id 
    WHERE p.id = ? AND p.status = 'active'
  `,
  CREATE: `
  INSERT INTO products 
    (name, category_id, unit, selling_price, cost_price, gst_percent, current_stock, min_stock_threshold, image_url, is_popular, shelf_life_days)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`,
UPDATE: `
  UPDATE products SET
    name = ?, category_id = ?, unit = ?, selling_price = ?, cost_price = ?,
    gst_percent = ?, current_stock = ?, min_stock_threshold = ?,
    image_url = ?, is_popular = ?, shelf_life_days = ?
  WHERE id = ? AND status = 'active'
`,
  DELETE: `
    UPDATE products SET status = 'inactive' WHERE id = ?
  `,
  UPDATE_STOCK: `
    UPDATE products 
    SET current_stock = current_stock - ? 
    WHERE id = ? AND current_stock >= ?
  `,
  INSERT_INVENTORY_LOG: `
    INSERT INTO inventory_transactions (product_id, type, quantity, unit, reference_type, reference_id, performed_by, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `
};