import { Router } from 'express';
import { param } from 'express-validator';
import { validateRequest } from '../middleware/validateRequest';
import { getCarCustomizations, getCarPaints, getCarWheels, getCarBodyKits, getCarSpoilers, getCarDecals, checkCompatibility } from '../controllers/customizationController';

const router = Router({ mergeParams: true });

router.get('/', getCarCustomizations);
router.get('/paints', getCarPaints);
router.get('/wheels', getCarWheels);
router.get('/body-kits', getCarBodyKits);
router.get('/spoilers', getCarSpoilers);
router.get('/decals', getCarDecals);
router.get('/compatibility', checkCompatibility);

export default router;
