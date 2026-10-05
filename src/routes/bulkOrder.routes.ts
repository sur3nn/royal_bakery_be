import { Router } from 'express';
import { BulkOrderController } from '../controllers/bulkOrder.controller';

const router = Router();
router.post('/', BulkOrderController.create);
router.get('/', BulkOrderController.getAll);
router.patch('/:id/status', BulkOrderController.updateStatus);
router.get('/:id/kot/:type', BulkOrderController.downloadKot);

export default router;
