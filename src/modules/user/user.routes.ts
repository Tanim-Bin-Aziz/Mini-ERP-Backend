import { Router } from 'express';
import { UserController } from './user.controller';
import { validate } from '../../middlewares/validate.middleware';
import { createUserSchema, updateUserSchema, userIdParamSchema } from './user.validation';
import { isAuthenticated } from '../../middlewares/auth.middleware';
import { requirePermission } from '../../middlewares/permission.middleware';

const router = Router();

// Every route here is Admin-only, gated by the 'role:manage' permission —
// this is how Manager/Employee accounts get created (no public self-registration).
router.use(isAuthenticated);
router.use(requirePermission('role:manage'));

router.get('/', UserController.getAll);
router.get('/:id', validate(userIdParamSchema), UserController.getById);
router.post('/', validate(createUserSchema), UserController.create);
router.patch('/:id', validate(updateUserSchema), UserController.update);
router.delete('/:id', validate(userIdParamSchema), UserController.deactivate);

export default router;
