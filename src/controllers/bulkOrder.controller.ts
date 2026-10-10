import { Request, Response } from 'express';
import { BulkOrderService } from '../services/bulkOrder.service';
import { KotPdfService } from '../services/kotpdf.service';
import { KitchenSummaryPdfService } from '../services/Kitchensummarypdf.service';

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
    const updated = await BulkOrderService.updateStatus(
      Number(req.params.id),
      Number(req.body.status)
    );

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    return res.json({
      success: true,
      message: 'Status updated',
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
}

  static async getAllDeliveryStatus(req: Request, res: Response) {
    try {
      const data = await BulkOrderService.getDeliveryStatus();

      res.json({
        success: true,
        data
      });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        message: err.message
      });
    }
  }

  // GET /bulk-orders/:id/kot/kitchen  or  /bulk-orders/:id/kot/packing
 static async downloadKot(req: Request, res: Response) {
  try {
    const { type } = req.params;

    if (type !== 'kitchen' && type !== 'packing') {
      return res.status(400).json({
        success: false,
        message: 'type must be kitchen or packing'
      });
    }

    const order: any =
      await BulkOrderService.getOneWithItems(Number(req.params.id));

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${type}-kot-${order.order_number}.pdf"`
    );

    const pdf = KotPdfService.build(order, type);

    pdf.pipe(res);
    pdf.end();

  } catch (err: any) {
    console.error('KOT PDF ERROR:', err);

    if (!res.headersSent) {
      return res.status(500).json({
        success: false,
        message: err.message
      });
    }

    res.end();
  }
}
  // GET /bulk-orders/kot/kitchen-summary?from=2026-10-10&to=2026-10-12
  static async downloadKitchenSummary(req: Request, res: Response) {
    try {
      const from = String(req.query.from || '');
      const to = String(req.query.to || '');
      const isoDate = /^\d{4}-\d{2}-\d{2}$/;

      if (!isoDate.test(from) || !isoDate.test(to) || from > to) {
        return res.status(400).json({ success: false, message: 'சரியான தேதி வரம்பை தேர்ந்தெடுக்கவும்' });
      }

      const summary = await BulkOrderService.getKitchenSummary(from, to);

      if (!summary.rows.length) {
        return res.status(404).json({ success: false, message: 'இந்த தேதிகளில் ஆர்டர் எதுவும் இல்லை' });
      }

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="kitchen-kot-${from}_to_${to}.pdf"`);

      const pdf = KitchenSummaryPdfService.build(summary.rows, from, to, summary.orderCount);
      pdf.pipe(res);
      pdf.end();
    } catch (err: any) {
      console.error('KITCHEN SUMMARY PDF ERROR:', err);
      if (!res.headersSent) {
        return res.status(500).json({ success: false, message: err.message });
      }
      res.end();
    }
  }
}