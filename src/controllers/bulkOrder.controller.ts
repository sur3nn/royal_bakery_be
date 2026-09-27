import { Request, Response } from 'express';
import { BulkOrderService } from '../services/bulkOrder.service';

export class BulkOrderController {
  static async create(req: Request, res: Response) {
    try {
      const result = await BulkOrderService.createBulkOrder(req.body);
      res.status(201).json({ success: true, data: result });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  static async getAll(req: Request, res: Response) {
    try {
      const data = await BulkOrderService.getAll();
      res.json({ success: true, data });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  static async updateStatus(req: Request, res: Response) {
    try {
      const updated = await BulkOrderService.updateStatus(Number(req.params.id), req.body.status);
      if (!updated) return res.status(404).json({ success: false, message: 'Order not found' });
      res.json({ success: true, message: 'Status updated' });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
}
