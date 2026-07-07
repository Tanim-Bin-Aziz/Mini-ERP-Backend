import { Router } from 'express';
import { CustomerController } from './customer.controller';
import { validate } from '../../middlewares/validate.middleware';
import {
  createCustomerSchema,
  updateCustomerSchema,
  customerIdParamSchema,
} from './customer.validation';
import { isAuthenticated } from '../../middlewares/auth.middleware';
import { requirePermission } from '../../middlewares/permission.middleware';

const router = Router();

router.use(isAuthenticated);

router.get('/', requirePermission('customer:read'), CustomerController.getAll);

router.get(
  '/:id',
  requirePermission('customer:read'),
  validate(customerIdParamSchema),
  CustomerController.getById
);

router.post(
  '/',
  requirePermission('customer:create'),
  validate(createCustomerSchema),
  CustomerController.create
);

router.patch(
  '/:id',
  requirePermission('customer:update'),
  validate(updateCustomerSchema),
  CustomerController.update
);

router.patch(
  '/:id/restore',
  requirePermission('customer:update'),
  validate(customerIdParamSchema),
  CustomerController.restore
);

router.delete(
  '/:id',
  requirePermission('customer:delete'),
  validate(customerIdParamSchema),
  CustomerController.remove
);

export default router;
