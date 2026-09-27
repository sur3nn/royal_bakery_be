import pool from '../config/db';
import { PRODUCT_QUERIES } from '../queries/product.queries';
import { ResultSetHeader, RowDataPacket } from 'mysql2/promise';

export class ProductService {
  static async getAll() {
    const [rows] = await pool.query<RowDataPacket[]>(PRODUCT_QUERIES.GET_ALL);
    return rows;
  }

  static async getById(id: number) {
    const [rows] = await pool.query<RowDataPacket[]>(PRODUCT_QUERIES.GET_BY_ID, [id]);
    return rows[0] || null;
  }

  static async create(data: any) {
  const [result] = await pool.query<ResultSetHeader>(PRODUCT_QUERIES.CREATE, [
    data.name, data.category_id, data.unit, data.selling_price, data.cost_price,
    data.gst_percent, data.current_stock, data.min_stock_threshold,
    data.image_url || null, data.is_popular || false, data.shelf_life_days || null
  ]);
  return result.insertId;
}

static async update(id: number, data: any) {
  const [result] = await pool.query<ResultSetHeader>(PRODUCT_QUERIES.UPDATE, [
    data.name, data.category_id, data.unit, data.selling_price, data.cost_price,
    data.gst_percent, data.current_stock, data.min_stock_threshold,
    data.image_url || null, data.is_popular || false, data.shelf_life_days || null,
    id
  ]);
  if (result.affectedRows === 0) return null;
  return this.getById(id);
}

  static async remove(id: number) {
    const [result] = await pool.query<ResultSetHeader>(PRODUCT_QUERIES.DELETE, [id]);
    return result.affectedRows > 0;
  }
}