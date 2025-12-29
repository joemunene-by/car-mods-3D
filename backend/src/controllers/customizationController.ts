import express from 'express';
import { body, param, query, validationResult } from 'express-validator';

const router = express.Router();

const validate = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ status: 'error', message: 'Validation failed', errors: errors.array() });
  }
  next();
};

const customizationOptions = {
  paints: [
    { id: 'silver_metallic', name: 'Silver Metallic', color: '#c0c0c0', finish: 'metallic', price: 1200, category: 'metallic', availableZones: ['body', 'roof', 'trim'] },
    { id: 'black_pearl', name: 'Black Pearl', color: '#1a1a1a', finish: 'pearl', price: 2000, category: 'pearl', availableZones: ['body', 'roof', 'trim', 'accents'] },
    { id: 'red_glossy', name: 'Red Glossy', color: '#cc0000', finish: 'glossy', price: 800, category: 'glossy', availableZones: ['body', 'roof'] },
    { id: 'blue_metallic', name: 'Blue Metallic', color: '#0066cc', finish: 'metallic', price: 1200, category: 'metallic', availableZones: ['body', 'roof'] },
    { id: 'white_pearl', name: 'White Pearl', color: '#f5f5f5', finish: 'pearl', price: 2000, category: 'pearl', availableZones: ['body', 'roof', 'trim'] },
    { id: 'orange_matte', name: 'Orange Matte', color: '#ff6600', finish: 'matte', price: 500, category: 'matte', availableZones: ['body'] },
    { id: 'green_metallic', name: 'Green Metallic', color: '#006633', finish: 'metallic', price: 1200, category: 'metallic', availableZones: ['body'] },
    { id: 'purple_pearl', name: 'Purple Pearl', color: '#660066', finish: 'pearl', price: 2000, category: 'pearl', availableZones: ['body', 'roof'] },
  ],
  wheels: [
    { id: 'sport_5spoke', name: '5-Spoke Sport', modelUrl: '/models/wheels/sport_5spoke.glb', previewUrl: '/images/wheels/sport_5spoke.png', price: 1200, compatibleSizes: [17, 18, 19, 20], specs: { offset: '35mm', boltPattern: '5x120', weight: '25 lbs' } },
    { id: 'multi_spoke', name: 'Multi-Spoke', modelUrl: '/models/wheels/multi_spoke.glb', previewUrl: '/images/wheels/multi_spoke.png', price: 1500, compatibleSizes: [18, 19, 20, 21], specs: { offset: '40mm', boltPattern: '5x120', weight: '22 lbs' } },
    { id: 'split_rim', name: 'Split Rim', modelUrl: '/models/wheels/split_rim.glb', previewUrl: '/images/wheels/split_rim.png', price: 1800, compatibleSizes: [19, 20, 21, 22], specs: { offset: '38mm', boltPattern: '5x120', weight: '24 lbs' } },
    { id: 'dual_5spoke', name: 'Dual 5-Spoke', modelUrl: '/models/wheels/dual_5spoke.glb', previewUrl: '/images/wheels/dual_5spoke.png', price: 1400, compatibleSizes: [17, 18, 19, 20], specs: { offset: '32mm', boltPattern: '5x120', weight: '26 lbs' } },
    { id: 'star_design', name: 'Star Design', modelUrl: '/models/wheels/star_design.glb', previewUrl: '/images/wheels/star_design.png', price: 1600, compatibleSizes: [18, 19, 20, 21], specs: { offset: '36mm', boltPattern: '5x120', weight: '23 lbs' } },
    { id: 'aero', name: 'Aero Blade', modelUrl: '/models/wheels/aero_blade.glb', previewUrl: '/images/wheels/aero_blade.png', price: 2000, compatibleSizes: [19, 20, 21, 22], specs: { offset: '42mm', boltPattern: '5x120', weight: '21 lbs' } },
  ],
  bodyKits: [
    { id: 'sport_aero', name: 'Sport Aero Kit', previewUrl: '/images/bodykits/sport_aero.png', price: 2500, compatibleCars: ['all'], pieces: [{ id: 'front_bumper', name: 'Front Bumper', type: 'front_bumper', modelUrl: '/models/bodykit/sport_aero/front_bumper.glb', price: 800 }, { id: 'rear_bumper', name: 'Rear Bumper', type: 'rear_bumper', modelUrl: '/models/bodykit/sport_aero/rear_bumper.glb', price: 700 }, { id: 'side_skirts', name: 'Side Skirts', type: 'side_skirts', modelUrl: '/models/bodykit/sport_aero/side_skirts.glb', price: 500 }] },
    { id: 'track_demon', name: 'Track Demon Kit', previewUrl: '/images/bodykits/track_demon.png', price: 3500, compatibleCars: ['all'], pieces: [{ id: 'front_bumper', name: 'Front Bumper', type: 'front_bumper', modelUrl: '/models/bodykit/track_demon/front_bumper.glb', price: 900 }, { id: 'rear_bumper', name: 'Rear Bumper', type: 'rear_bumper', modelUrl: '/models/bodykit/track_demon/rear_bumper.glb', price: 800 }, { id: 'side_skirts', name: 'Side Skirts', type: 'side_skirts', modelUrl: '/models/bodykit/track_demon/side_skirts.glb', price: 600 }, { id: 'splitter', name: 'Front Splitter', type: 'splitter', modelUrl: '/models/bodykit/track_demon/splitter.glb', price: 450 }, { id: 'diffuser', name: 'Rear Diffuser', type: 'diffuser', modelUrl: '/models/bodykit/track_demon/diffuser.glb', price: 500 }] },
    { id: 'street_style', name: 'Street Style Kit', previewUrl: '/images/bodykits/street_style.png', price: 1800, compatibleCars: ['all'], pieces: [{ id: 'front_bumper', name: 'Front Bumper', type: 'front_bumper', modelUrl: '/models/bodykit/street_style/front_bumper.glb', price: 600 }, { id: 'side_skirts', name: 'Side Skirts', type: 'side_skirts', modelUrl: '/models/bodykit/street_style/side_skirts.glb', price: 400 }] },
    { id: 'widebody_extreme', name: 'Widebody Extreme', previewUrl: '/images/bodykits/widebody_extreme.png', price: 5000, compatibleCars: ['all'], pieces: [{ id: 'front_bumper', name: 'Front Bumper', type: 'front_bumper', modelUrl: '/models/bodykit/widebody/front_bumper.glb', price: 1200 }, { id: 'rear_bumper', name: 'Rear Bumper', type: 'rear_bumper', modelUrl: '/models/bodykit/widebody/rear_bumper.glb', price: 1000 }, { id: 'side_skirts', name: 'Side Skirts', type: 'side_skirts', modelUrl: '/models/bodykit/widebody/side_skirts.glb', price: 800 }, { id: 'diffuser', name: 'Rear Diffuser', type: 'diffuser', modelUrl: '/models/bodykit/widebody/diffuser.glb', price: 600 }] },
  ],
  spoilers: [
    { id: 'gt', name: 'GT Wing', modelUrl: '/models/spoilers/gt_wing.glb', previewUrl: '/images/spoilers/gt_wing.png', price: 1200, materialOptions: ['abs_plastic', 'carbon_fiber', 'aluminum'], positions: [{ id: 'low', name: 'Low', offset: { x: 1.4, y: 0.8, z: 0 }, rotation: { x: 0, y: 0, z: 0 } }, { id: 'medium', name: 'Medium', offset: { x: 1.4, y: 0.95, z: 0 }, rotation: { x: 0, y: 0, z: 0 } }, { id: 'high', name: 'High', offset: { x: 1.4, y: 1.1, z: 0 }, rotation: { x: 0, y: 0, z: 0 } }] },
    { id: 'carbon', name: 'Carbon Fiber Wing', modelUrl: '/models/spoilers/carbon_wing.glb', previewUrl: '/images/spoilers/carbon_wing.png', price: 1800, materialOptions: ['carbon_fiber'], positions: [{ id: 'low', name: 'Low', offset: { x: 1.4, y: 0.78, z: 0 }, rotation: { x: 0, y: 0, z: 0 } }, { id: 'medium', name: 'Medium', offset: { x: 1.4, y: 0.9, z: 0 }, rotation: { x: 0, y: 0, z: 0 } }] },
    { id: 'racing', name: 'Racing Spoiler', modelUrl: '/models/spoilers/racing_spoiler.glb', previewUrl: '/images/spoilers/racing_spoiler.png', price: 900, materialOptions: ['abs_plastic', 'aluminum'], positions: [{ id: 'low', name: 'Low', offset: { x: 1.35, y: 0.75, z: 0 }, rotation: { x: 0, y: 0, z: 0 } }, { id: 'medium', name: 'Medium', offset: { x: 1.35, y: 0.85, z: 0 }, rotation: { x: 0, y: 0, z: 0 } }] },
    { id: 'stock', name: 'Stock Style', modelUrl: '/models/spoilers/stock_spoiler.glb', previewUrl: '/images/spoilers/stock_spoiler.png', price: 400, materialOptions: ['abs_plastic'], positions: [{ id: 'low', name: 'Low', offset: { x: 1.3, y: 0.7, z: 0 }, rotation: { x: 0, y: 0, z: 0 } }] },
  ],
  decals: [
    { id: 'racing_stripe_center', name: 'Center Racing Stripe', type: 'stripe', previewUrl: '/images/decals/stripe_center.png', price: 150, defaultColor: '#ffffff', width: 100, height: 1000, availablePlacements: ['hood', 'roof', 'stripe_full'] },
    { id: 'racing_stripe_dual', name: 'Dual Racing Stripes', type: 'stripe', previewUrl: '/images/decals/stripe_dual.png', price: 200, defaultColor: '#ffffff', width: 200, height: 1000, availablePlacements: ['hood', 'roof', 'stripe_full'] },
    { id: 'hood_stripe', name: 'Hood Stripe', type: 'stripe', previewUrl: '/images/decals/hood_stripe.png', price: 120, defaultColor: '#000000', width: 80, height: 400, availablePlacements: ['hood'] },
    { id: 'number_11', name: 'Racing Number 11', type: 'number', previewUrl: '/images/decals/number_11.png', price: 80, defaultColor: '#ff0000', width: 150, height: 150, availablePlacements: ['door_left', 'door_right', 'trunk'] },
    { id: 'number_7', name: 'Racing Number 7', type: 'number', previewUrl: '/images/decals/number_7.png', price: 80, defaultColor: '#0066cc', width: 150, height: 150, availablePlacements: ['door_left', 'door_right', 'trunk'] },
    { id: 'number_99', name: 'Racing Number 99', type: 'number', previewUrl: '/images/decals/number_99.png', price: 80, defaultColor: '#ffcc00', width: 150, height: 150, availablePlacements: ['door_left', 'door_right', 'trunk'] },
    { id: 'flame_graphic', name: 'Flame Graphic', type: 'graphic', previewUrl: '/images/decals/flame.png', price: 300, defaultColor: '#ff6600', width: 400, height: 200, availablePlacements: ['hood', 'door_left', 'door_right', 'quarter_left', 'quarter_right'] },
    { id: 'checker_flag', name: 'Checker Flag', type: 'graphic', previewUrl: '/images/decals/checker.png', price: 180, defaultColor: '#000000', width: 300, height: 150, availablePlacements: ['hood', 'trunk', 'quarter_left', 'quarter_right'] },
    { id: 'carbon_fiber_accent', name: 'Carbon Fiber Accent', type: 'graphic', previewUrl: '/images/decals/carbon.png', price: 250, defaultColor: '#1a1a1a', width: 500, height: 100, availablePlacements: ['hood', 'roof', 'trunk'] },
    { id: 'star_logo', name: 'Star Logo', type: 'logo', previewUrl: '/images/decals/star.png', price: 100, defaultColor: '#ffd700', width: 150, height: 150, svgPath: 'M 0 -50 L 12 -15 L 47 -15 L 18 6 L 29 40 L 0 20 L -29 40 L -18 6 L -47 -15 L -12 -15 Z', availablePlacements: ['hood', 'roof', 'trunk', 'door_left', 'door_right'] },
    { id: 'shield_logo', name: 'Shield Emblem', type: 'logo', previewUrl: '/images/decals/shield.png', price: 120, defaultColor: '#c0c0c0', width: 150, height: 180, svgPath: 'M 0 -40 Q 50 -40 50 0 Q 50 50 0 90 Q -50 50 -50 0 Q -50 -40 0 -40 Z', availablePlacements: ['hood', 'trunk', 'quarter_left', 'quarter_right'] },
  ],
};

router.get('/:carId/customizations', (req, res) => {
  res.json({ status: 'success', data: customizationOptions });
});

router.get('/:carId/customizations/paints', (req, res) => {
  res.json({ status: 'success', data: customizationOptions.paints });
});

router.get('/:carId/customizations/wheels', (req, res) => {
  res.json({ status: 'success', data: customizationOptions.wheels });
});

router.get('/:carId/customizations/body-kits', (req, res) => {
  res.json({ status: 'success', data: customizationOptions.bodyKits });
});

router.get('/:carId/customizations/spoilers', (req, res) => {
  res.json({ status: 'success', data: customizationOptions.spoilers });
});

router.get('/:carId/customizations/decals', (req, res) => {
  res.json({ status: 'success', data: customizationOptions.decals });
});

router.get('/:carId/compatibility', query('type').notEmpty(), query('optionId').notEmpty(), validate, (req, res) => {
  const { type, optionId } = req.query;
  res.json({ status: 'success', data: { compatible: true, reason: undefined } });
});

export default router;
