import { Router } from 'express';
import { body, param } from 'express-validator';
import {
  createCar,
  deleteCar,
  getCarById,
  getCars,
  updateCar,
} from '../controllers/CarsController';
import { getCustomizationsForCar } from '../controllers/CustomizationController';
import { requireAdmin } from '../middleware/auth';
import { validateRequest } from '../middleware/validateRequest';

const router = Router();

router.get('/', getCars);

router.get(
  '/:id',
  [param('id').isUUID().withMessage('id must be a valid UUID')],
  validateRequest,
  getCarById
);

router.get(
  '/:carId/customizations',
  [param('carId').isUUID().withMessage('carId must be a valid UUID')],
  validateRequest,
  getCustomizationsForCar
);

router.post(
  '/',
  requireAdmin,
  [
    body('name').isString().notEmpty(),
    body('manufacturer').isString().notEmpty(),
    body('year').isInt({ min: 1886 }).toInt(),
    body('basePrice').isFloat({ min: 0 }).toFloat(),
    body('description').optional({ nullable: true }).isString(),
    body('modelUrl').optional({ nullable: true }).isString(),
  ],
  validateRequest,
  createCar
);

router.put(
  '/:id',
  requireAdmin,
  [
    param('id').isUUID().withMessage('id must be a valid UUID'),
    body('name').optional().isString().notEmpty(),
    body('manufacturer').optional().isString().notEmpty(),
    body('year').optional().isInt({ min: 1886 }).toInt(),
    body('basePrice').optional().isFloat({ min: 0 }).toFloat(),
    body('description').optional({ nullable: true }).isString(),
    body('modelUrl').optional({ nullable: true }).isString(),
  ],
  validateRequest,
  updateCar
);

router.delete(
  '/:id',
  requireAdmin,
  [param('id').isUUID().withMessage('id must be a valid UUID')],
  validateRequest,
  deleteCar
);

export default router;
