import { Router } from 'express';
import { SettingsController } from '../controllers/settings.controller';

const router = Router();
router.get('/', SettingsController.get);
router.post('/', SettingsController.update);

export default router;
