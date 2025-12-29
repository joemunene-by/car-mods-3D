import { Router } from 'express';
import { body, param } from 'express-validator';
import {
  addItemToConfiguration,
  createConfiguration,
  deleteConfiguration,
  getConfigurationById,
  removeItemFromConfiguration,
  updateConfiguration,
} from '../controllers/ConfigurationController';
import { authenticate } from '../middleware/auth';
import { validateRequest } from '../middleware/validateRequest';

const router = Router();

router.post(
  '/',
  authenticate,
  [
    body('userId').isUUID().withMessage('userId must be a valid UUID'),
    body('carId').isUUID().withMessage('carId must be a valid UUID'),
    body('name').isString().notEmpty(),
    body('description').optional({ nullable: true }).isString(),
    body('customizationOptionIds').optional().isArray(),
    body('customizationOptionIds.*').optional().isUUID(),
  ],
  validateRequest,
  createConfiguration
);

router.get(
  '/:id',
  authenticate,
  [param('id').isUUID().withMessage('id must be a valid UUID')],
  validateRequest,
  getConfigurationById
);

router.put(
  '/:id',
  authenticate,
  [
    param('id').isUUID().withMessage('id must be a valid UUID'),
    body('name').optional().isString().notEmpty(),
    body('description').optional({ nullable: true }).isString(),
    body('customizationOptionIds').optional().isArray(),
    body('customizationOptionIds.*').optional().isUUID(),
  ],
  validateRequest,
  updateConfiguration
);

router.delete(
  '/:id',
  authenticate,
  [param('id').isUUID().withMessage('id must be a valid UUID')],
  validateRequest,
  deleteConfiguration
);

router.post(
  '/:id/items',
  authenticate,
  [
    param('id').isUUID().withMessage('id must be a valid UUID'),
    body('customizationOptionId').isUUID().withMessage('customizationOptionId must be a valid UUID'),
  ],
  validateRequest,
  addItemToConfiguration
);

router.delete(
  '/:id/items/:itemId',
  authenticate,
  [
    param('id').isUUID().withMessage('id must be a valid UUID'),
    param('itemId').isUUID().withMessage('itemId must be a valid UUID'),
  ],
  validateRequest,
  removeItemFromConfiguration
);

export default router;
