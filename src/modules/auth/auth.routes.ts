import { Router } from 'express';
import { AuthController } from './auth.controller';
import { validate } from '../../middlewares/validate.middleware';
import { loginSchema, refreshSchema } from './auth.validation';
import { isAuthenticated } from '../../middlewares/auth.middleware';

const router = Router();

router.post('/login', validate(loginSchema), AuthController.login);
router.post('/refresh', validate(refreshSchema), AuthController.refresh);
router.post('/logout', isAuthenticated, AuthController.logout);
router.get('/me', isAuthenticated, AuthController.me);

export default router;
