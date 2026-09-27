import { Request, Response } from 'express';
import { SettingsService } from '../services/settings.service';

export class SettingsController {
  static async get(req: Request, res: Response) {
    try {
      const data = await SettingsService.get();
      res.json({ success: true, data });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  static async update(req: Request, res: Response) {
    try {
      await SettingsService.update(req.body);
      res.json({ success: true, message: 'Settings saved' });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
}
