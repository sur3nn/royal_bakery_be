import { Request, Response } from 'express';
import { DashboardService } from '../services/dashboard.service';

export class DashboardController {
  static async getSummary(req: Request, res: Response) {
    try {
      const data = await DashboardService.getSummary();
      res.json({ success: true, data });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
}
