import pool from '../config/db';
import { SALE_QUERIES } from '../queries/sale.queries';
import { PRODUCT_QUERIES } from '../queries/product.queries';
import { CustomerService } from './customer.service';
import { ResultSetHeader, RowDataPacket } from 'mysql2/promise';

export class SaleService {
 static async createPOSBill(billData: any) {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    let customerId: number | null = null;

    if (billData.customer_phone && billData.customer_phone !== 'N/A') {
      customerId = await CustomerService.findOrCreateCustomer(connection, {
        name: billData.customer_name || 'Walk-in Customer',
        phone: billData.customer_phone
      });
    }

    const invoiceNumber = `INV-${Date.now()}`;
    const now = new Date();
    const saleDate = now.toISOString().split('T')[0];
    const saleTime = now.toTimeString().split(' ')[0];

    const [saleResult] = await connection.query<ResultSetHeader>(
      SALE_QUERIES.CREATE_SALE,
      [
        invoiceNumber,
        customerId,
        saleDate,
        saleTime,
        billData.subtotal,
        billData.gst_total,
        billData.cgst,
        billData.sgst,
        billData.discount || 0,
        billData.discount_type || 'percent',
        billData.grand_total,
        billData.amount_paid,
        billData.balance_return || 0,
        billData.payment_method,
        billData.cashier_id || null,
        'Completed'
      ]
    );

    const saleId = saleResult.insertId;

    // Store created items so they can be returned
    const createdItems: any[] = [];

    for (const item of billData.items) {
      const [itemResult] = await connection.query<ResultSetHeader>(
        SALE_QUERIES.CREATE_SALE_ITEM,
        [
          saleId,
          item.product_id,
          item.product_name,
          item.unit,
          item.quantity,
          item.price,
          item.gst_rate,
          item.subtotal,
          item.gst_amount,
          item.total
        ]
      );

      // Add the created sale item to response
      createdItems.push({
        id: itemResult.insertId,
        sale_id: saleId,
        product_id: item.product_id,
        product_name_snapshot: item.product_name,
        unit: item.unit,
        quantity: item.quantity,
        price_per_unit: item.price,
        gst_percent: item.gst_rate,
        subtotal: item.subtotal,
        gst_amount: item.gst_amount,
        total: item.total
      });

      const [stockUpdate] =
        await connection.query<ResultSetHeader>(
          PRODUCT_QUERIES.UPDATE_STOCK,
          [
            item.quantity,
            item.product_id,
            item.quantity
          ]
        );

      if (stockUpdate.affectedRows === 0) {
        throw new Error(
          `Insufficient stock for product ID: ${item.product_id}`
        );
      }

      await connection.query(
        PRODUCT_QUERIES.INSERT_INVENTORY_LOG,
        [
          item.product_id,
          'SALE',
          item.quantity,
          item.unit,
          'SALE',
          saleId,
          billData.cashier_id || null,
          'POS Retail Sale'
        ]
      );
    }

    await connection.commit();

    return {
      id: saleId,
      invoice_number: invoiceNumber,
      customer_id: customerId,
      customer_name: billData.customer_name,
      customer_phone: billData.customer_phone,
      sale_date: saleDate,
      sale_time: saleTime,
      subtotal: billData.subtotal,
      gst_total: billData.gst_total,
      cgst: billData.cgst,
      sgst: billData.sgst,
      discount: billData.discount || 0,
      discount_type: billData.discount_type || 'percent',
      grand_total: billData.grand_total,
      amount_paid: billData.amount_paid,
      balance_return: billData.balance_return || 0,
      payment_method: billData.payment_method,
      cashier_id: billData.cashier_id || null,
      status: 'Completed',

      // Return created sale items
      items: createdItems
    };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}


static async getAll() {
  const [rows] = await pool.query<RowDataPacket[]>(SALE_QUERIES.GET_ALL_SALES);
  const sales = rows as any[];

  for (const sale of sales) {
    const [items] = await pool.query<RowDataPacket[]>(SALE_QUERIES.GET_SALE_ITEMS, [sale.id]);
    sale.items = items;
  }

  return sales;
}
}
