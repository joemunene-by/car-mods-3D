import { Router } from 'express';
import { body, param } from 'express-validator';
import { getConfigurationsForUser } from '../controllers/ConfigurationController';
import { getUserProfile, updateUserProfile } from '../controllers/UserController';
import { authenticate } from '../middleware/auth';
import { validateRequest } from '../middleware/validateRequest';

const router = Router();

router.get(
  '/:userId/configurations',
  authenticate,
  [param('userId').isUUID().withMessage('userId must be a valid UUID')],
  validateRequest,
  getConfigurationsForUser
);

router.get(
  '/:id',
  authenticate,
  [param('id').isUUID().withMessage('id must be a valid UUID')],
  validateRequest,
  getUserProfile
);

router.put(
  '/:id',
  authenticate,
  [
    param('id').isUUID().withMessage('id must be a valid UUID'),
    body('firstName').optional().isString().notEmpty(),
    body('lastName').optional().isString().notEmpty(),
    body('email').optional().isEmail().normalizeEmail(),
  ],
  validateRequest,
  updateUserProfile
);

export default router;
