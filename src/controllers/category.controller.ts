import { Request, Response } from 'express';
import { CategoryService } from '../services/category.service';

export class CategoryController {
  static async getAll(req: Request, res: Response) {
    try {
      const data = await CategoryService.getAll();
      res.json({ success: true, data });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  static async create(req: Request, res: Response) {
    try {
      const id = await CategoryService.create(req.body.name, req.body.status);
      res.status(201).json({ success: true, data: { id } });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
}
