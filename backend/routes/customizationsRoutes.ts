import { Router } from 'express';
import { body, param } from 'express-validator';
import {
  createCustomization,
  deleteCustomization,
  getCustomizationById,
  updateCustomization,
} from '../controllers/CustomizationController';
import { CustomizationCategory } from '../models/enums';
import { requireAdmin } from '../middleware/auth';
import { validateRequest } from '../middleware/validateRequest';

const router = Router();

router.get(
  '/:id',
  [param('id').isUUID().withMessage('id must be a valid UUID')],
  validateRequest,
  getCustomizationById
);

router.post(
  '/',
  requireAdmin,
  [
    body('carId').isUUID().withMessage('carId must be a valid UUID'),
    body('category')
      .isIn(Object.values(CustomizationCategory))
      .withMessage('Invalid customization category'),
    body('name').isString().notEmpty(),
    body('price').isFloat({ min: 0 }).toFloat(),
    body('description').optional({ nullable: true }).isString(),
    body('colorHex').optional({ nullable: true }).isString(),
    body('modelUrl').optional({ nullable: true }).isString(),
    body('imageUrl').optional({ nullable: true }).isString(),
  ],
  validateRequest,
  createCustomization
);

router.put(
  '/:id',
  requireAdmin,
  [
    param('id').isUUID().withMessage('id must be a valid UUID'),
    body('carId').optional().isUUID(),
    body('category').optional().isIn(Object.values(CustomizationCategory)),
    body('name').optional().isString().notEmpty(),
    body('price').optional().isFloat({ min: 0 }).toFloat(),
    body('description').optional({ nullable: true }).isString(),
    body('colorHex').optional({ nullable: true }).isString(),
    body('modelUrl').optional({ nullable: true }).isString(),
    body('imageUrl').optional({ nullable: true }).isString(),
  ],
  validateRequest,
  updateCustomization
);

router.delete(
  '/:id',
  requireAdmin,
  [param('id').isUUID().withMessage('id must be a valid UUID')],
  validateRequest,
  deleteCustomization
);

export default router;
