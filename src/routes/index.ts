import { Router } from 'express';
import productRoutes from './product.routes';
import saleRoutes from './sale.routes';
import bulkOrderRoutes from './bulkOrder.routes';
import categoryRoutes from './category.routes';
import customerRoutes from './customer.routes';
import inventoryRoutes from './inventory.routes';
import settingsRoutes from './settings.routes';
import dashboardRoutes from './dashboard.routes';
import unitRoutes from './unit.routes';

const router = Router();

router.use('/dashboard', dashboardRoutes);
router.use('/products', productRoutes);
router.use('/categories', categoryRoutes);
router.use('/customers', customerRoutes);
router.use('/sales', saleRoutes);
router.use('/bulk-orders', bulkOrderRoutes);
router.use('/inventory', inventoryRoutes);
router.use('/settings', settingsRoutes);
router.use('/units', unitRoutes);

export default router;
