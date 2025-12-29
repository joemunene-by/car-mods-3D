import { Router } from 'express';
import { body } from 'express-validator';
import { login, logout, register } from '../controllers/AuthController';
import { validateRequest } from '../middleware/validateRequest';

const router = Router();

router.post(
  '/register',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').isString().isLength({ min: 8 }),
    body('firstName').isString().notEmpty(),
    body('lastName').isString().notEmpty(),
  ],
  validateRequest,
  register
);

router.post(
  '/login',
  [body('email').isEmail().normalizeEmail(), body('password').isString().notEmpty()],
  validateRequest,
  login
);

router.post('/logout', logout);

export default router;
