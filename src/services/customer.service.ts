import pool from '../config/db';
import { PoolConnection, ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { CUSTOMER_QUERIES } from '../queries/customer.queries';

export class CustomerService {
  static async getAll() {
    const [rows] = await pool.query<RowDataPacket[]>(CUSTOMER_QUERIES.GET_ALL);
    return rows;
  }

  static async findOrCreateCustomer(connection: PoolConnection, customerData: { name: string; phone: string; email?: string }) {
    if (!customerData.phone) return null;
    const [existing] = await connection.query<RowDataPacket[]>(CUSTOMER_QUERIES.FIND_BY_PHONE, [customerData.phone]);
    if (existing.length > 0) return existing[0].id;

    const [result] = await connection.query<ResultSetHeader>(CUSTOMER_QUERIES.CREATE, [
      customerData.name, customerData.phone, customerData.email || null, null, null, 0
    ]);
    return result.insertId;
  }
}
