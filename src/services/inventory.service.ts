import pool from '../config/db';
import { INVENTORY_QUERIES } from '../queries/inventory.queries';
import { PRODUCT_QUERIES } from '../queries/product.queries';
import { RowDataPacket } from 'mysql2/promise';

export class InventoryService {
  static async getLogs() {
    const [rows] = await pool.query<RowDataPacket[]>(INVENTORY_QUERIES.GET_LOGS);
    return rows;
  }

  static async getLowStock() {
    const [rows] = await pool.query<RowDataPacket[]>(INVENTORY_QUERIES.GET_LOW_STOCK);
    return rows;
  }

  static async adjustStock(productId: number, quantity: number, type: 'IN' | 'OUT', notes?: string, userId?: number) {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();
      const adjustedQty = type === 'IN' ? quantity : -quantity;

      await connection.query(INVENTORY_QUERIES.STOCK_ADJUSTMENT, [adjustedQty, productId]);
      await connection.query(PRODUCT_QUERIES.INSERT_INVENTORY_LOG, [
        productId, type, quantity, 'pcs', 'ADJUSTMENT', null, userId || null, notes || 'Manual stock adjustment'
      ]);

      await connection.commit();
      return true;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }
}
