import pool from '../config/db';
import { BULK_ORDER_QUERIES } from '../queries/bulkOrder.queries';
import { CustomerService } from './customer.service';
import { ResultSetHeader, RowDataPacket } from 'mysql2/promise';

export class BulkOrderService {
  static async createBulkOrder(orderData: any) {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      let customerId = await CustomerService.findOrCreateCustomer(connection, {
        name: orderData.customerName,
        phone: orderData.customerPhone,
        email: orderData.customerEmail
      });

      const orderNumber = `ORD-${Date.now()}`;
      const remainingAmount = orderData.totalAmount - (orderData.advancePaid || 0);

      const [orderResult] = await connection.query<ResultSetHeader>(BULK_ORDER_QUERIES.CREATE_ORDER, [
        orderNumber, customerId, 
        orderData.deliveryDate, orderData.deliveryTime, orderData.totalAmount, orderData.advancePaid || 0,
        remainingAmount, 'Upcoming', orderData.occasion || null, orderData.specialInstructions || null,
        orderData.createdBy || null
      ]);

      const orderId = orderResult.insertId;

      for (const item of orderData.products) {
        await connection.query(BULK_ORDER_QUERIES.CREATE_ORDER_ITEM, [
          orderId, item.productId, item.productName, item.quantity, item.unit, item.price, item.total
        ]);
      }

      await connection.commit();
      return { orderId, orderNumber };
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  static async getAll() {
    const [rows] = await pool.query<RowDataPacket[]>(BULK_ORDER_QUERIES.GET_ALL);
    return rows;
  }

  static async updateStatus(id: number, status: string) {
    const [result] = await pool.query<ResultSetHeader>(BULK_ORDER_QUERIES.UPDATE_STATUS, [status, id]);
    return result.affectedRows > 0;
  }
}
