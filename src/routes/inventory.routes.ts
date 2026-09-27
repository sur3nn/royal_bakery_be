import { Router } from 'express';
import { InventoryController } from '../controllers/inventory.controller';

const router = Router();
router.get('/logs', InventoryController.getLogs);
router.get('/low-stock', InventoryController.getLowStock);
router.post('/adjust', InventoryController.adjustStock);

export default router;
