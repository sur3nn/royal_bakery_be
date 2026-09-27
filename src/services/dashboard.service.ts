import pool from '../config/db';
import { DASHBOARD_QUERIES } from '../queries/dashboard.queries';
import { RowDataPacket } from 'mysql2/promise';

export class DashboardService {
  static async getSummary() {
    const [[sales]] = await pool.query<RowDataPacket[]>(DASHBOARD_QUERIES.GET_TODAYS_SALES);
    const [[deliveries]] = await pool.query<RowDataPacket[]>(DASHBOARD_QUERIES.GET_PENDING_DELIVERIES);
    const [[lowStock]] = await pool.query<RowDataPacket[]>(DASHBOARD_QUERIES.GET_LOW_STOCK_COUNT);

    return {
      todaySales: sales.total_sales,
      todayOrders: sales.total_orders,
      pendingDeliveries: deliveries.pending_deliveries,
      lowStockCount: lowStock.low_stock_count
    };
  }
}
