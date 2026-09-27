import { Request, Response } from 'express';
import { ProductService } from '../services/product.service';

export class ProductController {
  static async getAll(req: Request, res: Response) {
    try {
      const data = await ProductService.getAll();
      res.json({ success: true, data });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  static async getById(req: Request, res: Response) {
    try {
      const data = await ProductService.getById(Number(req.params.id));
      if (!data) return res.status(404).json({ success: false, message: 'Product not found' });
      res.json({ success: true, data });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  static async create(req: Request, res: Response) {
    try {
      const id = await ProductService.create(req.body);
      res.status(201).json({ success: true, data: { id } });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  static async update(req: Request, res: Response) {
    try {
      const data = await ProductService.update(Number(req.params.id), req.body);
      if (!data) return res.status(404).json({ success: false, message: 'Product not found' });
      res.json({ success: true, data });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  static async remove(req: Request, res: Response) {
    try {
      const ok = await ProductService.remove(Number(req.params.id));
      if (!ok) return res.status(404).json({ success: false, message: 'Product not found' });
      res.json({ success: true, message: 'Product removed' });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
}