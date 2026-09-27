import pool from '../config/db';
import { CATEGORY_QUERIES } from '../queries/category.queries';
import { ResultSetHeader, RowDataPacket } from 'mysql2/promise';

export class CategoryService {
  static async getAll() {
    const [rows] = await pool.query<RowDataPacket[]>(CATEGORY_QUERIES.GET_ALL);
    return rows;
  }

  static async create(name: string, status: boolean = true) {
    const [result] = await pool.query<ResultSetHeader>(CATEGORY_QUERIES.CREATE, [name, status]);
    return result.insertId;
  }
}
