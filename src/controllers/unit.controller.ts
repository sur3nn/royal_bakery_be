import { Request, Response } from 'express';
import { UnitService } from '../services/unit.service';
import { CategoryService } from '../services/category.service';

export class DropdownController {
  // GET /api/categories
  static async getCategories(req: Request, res: Response) {
    try {
      const data = await CategoryService.getAll();
      res.json({ success: true, data });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  // GET /api/units
  static async getUnits(req: Request, res: Response) {
    try {
      const data = await UnitService.getAllUnits();
      res.json({ success: true, data });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  // POST /api/units
  static async createUnit(req: Request, res: Response) {
    try {
      const { name, shortCode, allowDecimal } = req.body;
      const id = await UnitService.createUnit(name, shortCode, allowDecimal);
      res.status(201).json({ success: true, data: { id } });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
}