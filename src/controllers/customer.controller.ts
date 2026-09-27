import { Request, Response } from 'express';
import { CustomerService } from '../services/customer.service';

export class CustomerController {
  static async getAll(req: Request, res: Response) {
    try {
      const data = await CustomerService.getAll();
      res.json({ success: true, data });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
}
