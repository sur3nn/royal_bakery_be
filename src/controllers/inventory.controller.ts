import { Request, Response } from 'express';
import { InventoryService } from '../services/inventory.service';

export class InventoryController {
  static async getLogs(req: Request, res: Response) {
    try {
      const data = await InventoryService.getLogs();
      res.json({ success: true, data });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  static async getLowStock(req: Request, res: Response) {
    try {
      const data = await InventoryService.getLowStock();
      res.json({ success: true, data });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  static async adjustStock(req: Request, res: Response) {
    try {
      const { productId, quantity, type, notes, userId } = req.body;
      await InventoryService.adjustStock(productId, quantity, type, notes, userId);
      res.json({ success: true, message: 'Stock adjusted' });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message });
    }
  }
}
