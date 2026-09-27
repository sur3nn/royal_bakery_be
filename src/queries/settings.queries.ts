export const SETTINGS_QUERIES = {
  GET_SETTINGS: `SELECT * FROM shop_settings WHERE id = 1`,
  UPSERT_SETTINGS: `
    INSERT INTO shop_settings (id, shop_name, tagline, address, phone, email, gstin, fssai_license, currency_symbol, invoice_prefix, show_qr_code, printer_width, auto_print_receipt, default_cgst_percent, default_sgst_percent)
    VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE
      shop_name = VALUES(shop_name), tagline = VALUES(tagline), address = VALUES(address), phone = VALUES(phone),
      email = VALUES(email), gstin = VALUES(gstin), fssai_license = VALUES(fssai_license), currency_symbol = VALUES(currency_symbol),
      invoice_prefix = VALUES(invoice_prefix), show_qr_code = VALUES(show_qr_code), printer_width = VALUES(printer_width),
      auto_print_receipt = VALUES(auto_print_receipt), default_cgst_percent = VALUES(default_cgst_percent), default_sgst_percent = VALUES(default_sgst_percent)
  `
};
