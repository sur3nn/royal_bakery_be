export const INVENTORY_QUERIES = {
  GET_LOGS: `
    SELECT it.*, p.name as product_name 
    FROM inventory_transactions it
    JOIN products p ON it.product_id = p.id
    ORDER BY it.created_at DESC
  `,
  GET_LOW_STOCK: `
    SELECT p.*, c.name as category_name 
    FROM products p
    LEFT JOIN product_categories c ON p.category_id = c.id
    WHERE p.current_stock <= p.min_stock_threshold AND p.status = 'active'
  `,
  STOCK_ADJUSTMENT: `UPDATE products SET current_stock = current_stock + ? WHERE id = ?`
};
