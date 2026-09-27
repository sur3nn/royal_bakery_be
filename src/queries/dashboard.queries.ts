export const DASHBOARD_QUERIES = {
  GET_TODAYS_SALES: `
    SELECT COALESCE(SUM(grand_total), 0) as total_sales, COUNT(id) as total_orders 
    FROM sales 
    WHERE sale_date = CURRENT_DATE() AND status = 'Completed'
  `,
  GET_PENDING_DELIVERIES: `
    SELECT COUNT(id) as pending_deliveries 
    FROM bulk_orders 
    WHERE delivery_date = CURRENT_DATE() AND status IN ('Upcoming', 'Preparing')
  `,
  GET_LOW_STOCK_COUNT: `
    SELECT COUNT(id) as low_stock_count 
    FROM products 
    WHERE current_stock <= min_stock_threshold AND status = 'active'
  `
};
