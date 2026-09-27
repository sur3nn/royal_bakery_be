import { Router } from 'express';
import { DropdownController } from '../controllers/unit.controller';

const router = Router();

router.get('/', DropdownController.getUnits);
router.post('/', DropdownController.createUnit);

export default router;