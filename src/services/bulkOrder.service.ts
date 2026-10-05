import pool from '../config/db';
import { BULK_ORDER_QUERIES } from '../queries/bulkOrder.queries';
import { CustomerService } from './customer.service';
import { ResultSetHeader, RowDataPacket } from 'mysql2/promise';

export class BulkOrderService {
  static async createBulkOrder(orderData: any) {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      const customerId = await CustomerService.findOrCreateCustomer(connection, {
        name: orderData.customerName,
        phone: orderData.customerPhone,
        email: orderData.customerEmail,
      });

      // 1) Work out each item on the server: total = pack size x boxes
      //    e.g. 1 kg x 5 boxes -> kitchen makes 5 kg, packing packs 5 boxes of 1 kg
      const items = orderData.products.map((item: any) => {
        const packSize = Number(item.packSize ?? item.quantity ?? 1);
        const packCount = Number(item.packCount ?? 1);
        const quantity = +(packSize * packCount).toFixed(3);
        const price = Number(item.price || 0);
        return {
          productId: item.productId,
          productName: item.productName,
          unit: item.unit,
          packSize,
          packCount,
          quantity,
          price,
          total: +(quantity * price).toFixed(2),
        };
      });

      const totalAmount = items.reduce((sum: number, i: any) => sum + i.total, 0);
      const advancePaid = Number(orderData.advancePaid || 0);
      const remainingAmount = totalAmount - advancePaid;
      const orderNumber = `ORD-${Date.now()}`;

      const [orderResult] = await connection.query<ResultSetHeader>(BULK_ORDER_QUERIES.CREATE_ORDER, [
        orderNumber, customerId,
        orderData.deliveryDate, orderData.deliveryTime, totalAmount, advancePaid,
        remainingAmount, 'Upcoming', orderData.occasion || null, orderData.specialInstructions || null,
        orderData.createdBy || null, orderData.deliveryAddress,
      ]);
      const orderId = orderResult.insertId;

      for (const i of items) {
        await connection.query(BULK_ORDER_QUERIES.CREATE_ORDER_ITEM, [
          orderId, i.productId, i.productName, i.quantity, i.unit, i.packSize, i.packCount, i.price, i.total,
        ]);
      }

      // 2) Make the two KOT numbers (PDFs are built when downloaded)
      const kitchenKotNo = `KIT-${orderId}`;
      const packingKotNo = `PACK-${orderId}`;
      await connection.query(BULK_ORDER_QUERIES.SET_KOT, [kitchenKotNo, packingKotNo, orderId]);

      await connection.commit();
      return {
        orderId, orderNumber, kitchenKotNo, packingKotNo,
        kitchenPdfUrl: `/bulk-orders/${orderId}/kot/kitchen`,
        packingPdfUrl: `/bulk-orders/${orderId}/kot/packing`,
      };
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  static async getAll() {
    const [rows] = await pool.query<RowDataPacket[]>(BULK_ORDER_QUERIES.GET_ALL);
    if (!rows.length) return rows;

    const [items] = await pool.query<RowDataPacket[]>(
      BULK_ORDER_QUERIES.GET_ITEMS_BY_ORDER_IDS, [rows.map((r) => r.id)]
    );
    return rows.map((r) => ({ ...r, products: items.filter((i) => i.bulk_order_id === r.id) }));
  }

  static async getOneWithItems(id: number) {
    const [orders] = await pool.query<RowDataPacket[]>(BULK_ORDER_QUERIES.GET_BY_ID, [id]);
    if (!orders.length) return null;
    const [items] = await pool.query<RowDataPacket[]>(BULK_ORDER_QUERIES.GET_ITEMS_BY_ORDER_IDS, [[id]]);
    return { ...orders[0], products: items };
  }

  static async updateStatus(id: number, status: string) {
    const [result] = await pool.query<ResultSetHeader>(BULK_ORDER_QUERIES.UPDATE_STATUS, [status, id]);
    return result.affectedRows > 0;
  }
  
}