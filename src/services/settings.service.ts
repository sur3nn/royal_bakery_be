import pool from '../config/db';
import { SETTINGS_QUERIES } from '../queries/settings.queries';
import { RowDataPacket } from 'mysql2/promise';

export class SettingsService {
  static async get() {
    const [rows] = await pool.query<RowDataPacket[]>(SETTINGS_QUERIES.GET_SETTINGS);
    return rows[0] || null;
  }

  static async update(s: any) {
    await pool.query(SETTINGS_QUERIES.UPSERT_SETTINGS, [
      s.shopName, s.tagline, s.address, s.phone, s.email, s.gstin,
      s.fssaiLicense, s.currencySymbol || '₹', s.invoicePrefix || 'INV-',
      s.showQrCode ?? true, s.printerWidth || '80mm', s.autoPrintReceipt ?? false,
      s.defaultCgstPercent || 2.50, s.defaultSgstPercent || 2.50
    ]);
    return true;
  }
}
