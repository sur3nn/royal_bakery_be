import { Request, Response } from 'express';
import { BulkOrderService } from '../services/bulkOrder.service';
import { KotPdfService } from '../services/kotpdf.service';

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

  // GET /bulk-orders/:id/kot/kitchen  or  /bulk-orders/:id/kot/packing
  static async downloadKot(req: Request, res: Response) {
    try {
      const { type } = req.params;
      if (type !== 'kitchen' && type !== 'packing') {
        return res.status(400).json({ success: false, message: 'type must be kitchen or packing' });
      }

      const order : any= await BulkOrderService.getOneWithItems(Number(req.params.id));
      if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${type}-kot-${order.order_number}.pdf"`);
      KotPdfService.build(order, type).pipe(res);
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
}