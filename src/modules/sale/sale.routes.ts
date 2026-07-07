import { Router } from 'express';
import { SaleController } from './sale.controller';
import { validate } from '../../middlewares/validate.middleware';
import { createSaleSchema, saleIdParamSchema } from './sale.validation';
import { isAuthenticated } from '../../middlewares/auth.middleware';
import { requirePermission } from '../../middlewares/permission.middleware';

const router = Router();

router.use(isAuthenticated);

router.get('/', requirePermission('sale:read'), SaleController.getAll);

router.get(
  '/:id',
  requirePermission('sale:read'),
  validate(saleIdParamSchema),
  SaleController.getById
);

router.post(
  '/',
  requirePermission('sale:create'),
  validate(createSaleSchema),
  SaleController.create
);

router.patch(
  '/:id/refund',
  requirePermission('sale:create'),
  validate(saleIdParamSchema),
  SaleController.refund
);

export default router;
