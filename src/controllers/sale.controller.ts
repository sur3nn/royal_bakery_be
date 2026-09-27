import { Request, Response } from 'express';
import { SaleService } from '../services/sale.service';

export class SaleController {
  static async createBill(req: Request, res: Response) {
    try {
      const result = await SaleService.createPOSBill(req.body);
      res.status(201).json({ success: true, data: result });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  static async getAll(req: Request, res: Response) {
    try {
      const data = await SaleService.getAll();
      res.json({ success: true, data });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
}
