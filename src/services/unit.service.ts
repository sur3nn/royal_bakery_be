import pool from '../config/db';
import { CATEGORY_QUERIES, UNIT_QUERIES } from '../queries/unit.queries';
import { RowDataPacket, ResultSetHeader } from 'mysql2/promise';

export class UnitService {
  // Get Measurement Units List
  static async getAllUnits() {
    const [rows] = await pool.query<RowDataPacket[]>(UNIT_QUERIES.GET_ALL);
    return rows.map(row => ({
      id: row.id,
      name: row.name,
      shortCode: row.short_code,
      displayLabel: row.display_label,
      allowDecimal: Boolean(row.allow_decimal)
    }));
  }

  // Add Measurement Unit
  static async createUnit(name: string, shortCode: string, allowDecimal: boolean = true) {
    const displayLabel = `${shortCode} (${name})`;
    const [result] = await pool.query<ResultSetHeader>(
      UNIT_QUERIES.CREATE, 
      [name, shortCode, displayLabel, allowDecimal]
    );
    return result.insertId;
  }
}