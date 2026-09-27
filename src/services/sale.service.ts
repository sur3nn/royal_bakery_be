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
      if (billData.customerPhone) {
        customerId = await CustomerService.findOrCreateCustomer(connection, {
          name: billData.customerName || 'Walk-in Customer',
          phone: billData.customerPhone
        });
      }

      const invoiceNumber = `INV-${Date.now()}`;
      const now = new Date();
      const saleDate = now.toISOString().split('T')[0];
      const saleTime = now.toTimeString().split(' ')[0];

      const [saleResult] = await connection.query<ResultSetHeader>(SALE_QUERIES.CREATE_SALE, [
        invoiceNumber, customerId, saleDate, saleTime,
        billData.subtotal, billData.gstTotal, billData.cgst, billData.sgst,
        billData.discount || 0, billData.discountType || 'fixed', billData.grandTotal,
        billData.amountPaid, billData.balanceReturn || 0, billData.paymentMethod,
        billData.cashierId || null, 'Completed'
      ]);

      const saleId = saleResult.insertId;

      for (const item of billData.items) {
        await connection.query(SALE_QUERIES.CREATE_SALE_ITEM, [
          saleId, item.productId, item.productName, item.unit, item.quantity,
          item.pricePerUnit, item.gstPercent, item.subtotal, item.gstAmount, item.total
        ]);

        const [stockUpdate] = await connection.query<ResultSetHeader>(PRODUCT_QUERIES.UPDATE_STOCK, [
          item.quantity, item.productId, item.quantity
        ]);

        if (stockUpdate.affectedRows === 0) {
          throw new Error(`Insufficient stock for product ID: ${item.productId}`);
        }

        await connection.query(PRODUCT_QUERIES.INSERT_INVENTORY_LOG, [
          item.productId, 'SALE', item.quantity, item.unit, 'SALE', saleId, billData.cashierId || null, 'POS Retail Sale'
        ]);
      }

      await connection.commit();
      return { saleId, invoiceNumber };
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  static async getAll() {
    const [rows] = await pool.query<RowDataPacket[]>(SALE_QUERIES.GET_ALL_SALES);
    return rows;
  }
}
