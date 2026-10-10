import { Router } from 'express';
import { BulkOrderController } from '../controllers/bulkOrder.controller';

const router = Router();
router.post('/', BulkOrderController.create);
router.get('/', BulkOrderController.getAll);
router.patch('/:id/status', BulkOrderController.updateStatus);
router.get('/status', BulkOrderController.getAllDeliveryStatus);
router.get('/:id/kot/:type', BulkOrderController.downloadKot);
router.get('/kot/kitchen-summary', BulkOrderController.downloadKitchenSummary);

export default router;
