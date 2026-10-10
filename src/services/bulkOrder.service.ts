import pool from '../config/db';
import { BULK_ORDER_QUERIES } from '../queries/bulkOrder.queries';
import { CustomerService } from './customer.service';
import { ResultSetHeader, RowDataPacket } from 'mysql2/promise';

export class BulkOrderService {
static async createBulkOrder(orderData: any) {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    console.log('1. Creating/finding customer');

    const customerId = await CustomerService.findOrCreateCustomer(connection, {
      name: orderData.customerName,
      phone: orderData.customerPhone,
      email: orderData.customerEmail || null,
    });

    console.log('customerId:', customerId);

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

    console.log('2. items:', items);

    const totalAmount = items.reduce(
      (sum: number, i: any) => sum + i.total,
      0
    );

    const advancePaid = Number(orderData.advancePaid || 0);
    const remainingAmount = totalAmount - advancePaid;
    const orderNumber = `ORD-${Date.now()}`;

    console.log('3. Creating order:', {
      orderNumber,
      customerId,
      totalAmount,
      advancePaid,
      remainingAmount
    });

  const [orderResult] = await connection.query<ResultSetHeader>(
  BULK_ORDER_QUERIES.CREATE_ORDER,
  [
    orderNumber,
    customerId,

    // Customer snapshots
    orderData.customerName,
    orderData.customerPhone,
    orderData.customerEmail || null,

    orderData.deliveryDate,
    orderData.deliveryTime,
    totalAmount,
    advancePaid,
    remainingAmount,
    'Upcoming',
    orderData.occasion || null,
    orderData.specialInstructions || null,
    orderData.createdBy || null,
    orderData.deliveryAddress || null,
  ]
);

    const orderId = orderResult.insertId;

    console.log('4. orderId:', orderId);

    for (const i of items) {
      console.log('5. inserting item:', i);

      await connection.query(
        BULK_ORDER_QUERIES.CREATE_ORDER_ITEM,
        [
          orderId,
          i.productId,
          i.productName,
          i.quantity,
          i.unit,
          i.packSize,
          i.packCount,
          i.price,
          i.total,
        ]
      );
    }

    const kitchenKotNo = `KIT-${orderId}`;
    const packingKotNo = `PACK-${orderId}`;

    console.log('6. setting KOT:', {
      kitchenKotNo,
      packingKotNo
    });

    await connection.query(
      BULK_ORDER_QUERIES.SET_KOT,
      [
        kitchenKotNo,
        packingKotNo,
        orderId
      ]
    );

    await connection.commit();

    return {
      orderId,
      orderNumber,
      kitchenKotNo,
      packingKotNo,
      kitchenPdfUrl: `/bulk-orders/${orderId}/kot/kitchen`,
      packingPdfUrl: `/bulk-orders/${orderId}/kot/packing`,
    };

  } catch (error) {
    console.error('BULK ORDER SERVICE ERROR:', error);
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

  static async updateStatus(id: number, statusId: number) {
  const [result] = await pool.query<ResultSetHeader>(
    BULK_ORDER_QUERIES.UPDATE_STATUS,
    [statusId, id]
  );

  return result.affectedRows > 0;
}


   static async getDeliveryStatus() {
    const [rows] = await pool.query<RowDataPacket[]>(
      BULK_ORDER_QUERIES.GET_ALL_DELIVERY_STATUS
    );

    return rows;
  }
    static async getKitchenSummary(from: string, to: string) {
    const [rows] = await pool.query<RowDataPacket[]>(BULK_ORDER_QUERIES.KITCHEN_SUMMARY, [from, to]);
    const [cnt] = await pool.query<RowDataPacket[]>(BULK_ORDER_QUERIES.KITCHEN_ORDER_COUNT, [from, to]);

    return {
      rows: rows.map((r) => ({
        productId: r.productId,
        productName: r.productName,
        unit: r.unit,
        totalQuantity: Number(r.totalQuantity),
        orderCount: Number(r.orderCount),
      })),
      orderCount: Number(cnt[0]?.total ?? 0),
    };
  }
  
}