import { Router } from 'express';
import { SaleController } from '../controllers/sale.controller';

const router = Router();
router.post('/bill', SaleController.createBill);
router.get('/', SaleController.getAll);
router.get('/:id/bill', SaleController.downloadBill);

export default router;
