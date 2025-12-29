import express from 'express';
import { body, param, validationResult } from 'express-validator';

const router = express.Router();

const validate = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ status: 'error', message: 'Validation failed', errors: errors.array() });
  }
  next();
};

interface SavedConfiguration {
  id: string;
  carId: string;
  paint: {
    color: string;
    finish: string;
    zones: Record<string, boolean>;
  };
  wheels: {
    designId: string;
    size: number;
    finish: string;
    tire: string;
  };
  bodyKit: {
    kitId: string | null;
    pieces: Record<string, boolean>;
  };
  spoiler: {
    designId: string | null;
    material: string;
    position: string;
    angle: number;
  };
  decals: Array<{
    id: string;
    designId: string;
    placement: string;
    color: string;
    opacity: number;
    scale: number;
    rotation: number;
    offsetX: number;
    offsetY: number;
  }>;
  totalPrice: number;
  name: string;
  createdAt: string;
  updatedAt: string;
}

const configurations: Map<string, SavedConfiguration> = new Map();

router.get('/', (req, res) => {
  const configs = Array.from(configurations.values());
  res.json({ status: 'success', data: configs });
});

router.get('/:id', param('id').notEmpty(), validate, (req, res) => {
  const { id } = req.params;
  const config = configurations.get(id);
  
  if (!config) {
    return res.status(404).json({ status: 'error', message: 'Configuration not found' });
  }
  
  res.json({ status: 'success', data: config });
});

router.post('/',
  body('carId').notEmpty(),
  body('paint').isObject(),
  body('wheels').isObject(),
  body('bodyKit').isObject(),
  body('spoiler').isObject(),
  body('decals').isArray(),
  validate,
  (req, res) => {
    const id = `config_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const config: SavedConfiguration = {
      id,
      carId: req.body.carId,
      paint: req.body.paint,
      wheels: req.body.wheels,
      bodyKit: req.body.bodyKit,
      spoiler: req.body.spoiler,
      decals: req.body.decals,
      totalPrice: req.body.totalPrice || 0,
      name: req.body.name || `Build ${new Date().toLocaleDateString()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    configurations.set(id, config);
    
    res.status(201).json({ status: 'success', data: config });
  }
);

router.put('/:id',
  param('id').notEmpty(),
  body('paint').optional().isObject(),
  body('wheels').optional().isObject(),
  body('bodyKit').optional().isObject(),
  body('spoiler').optional().isObject(),
  body('decals').optional().isArray(),
  validate,
  (req, res) => {
    const { id } = req.params;
    const config = configurations.get(id);
    
    if (!config) {
      return res.status(404).json({ status: 'error', message: 'Configuration not found' });
    }
    
    const updatedConfig: SavedConfiguration = {
      ...config,
      ...req.body,
      id: config.id,
      createdAt: config.createdAt,
      updatedAt: new Date().toISOString(),
    };
    
    configurations.set(id, updatedConfig);
    
    res.json({ status: 'success', data: updatedConfig });
  }
);

router.delete('/:id', param('id').notEmpty(), validate, (req, res) => {
  const { id } = req.params;
  const deleted = configurations.delete(id);
  
  if (!deleted) {
    return res.status(404).json({ status: 'error', message: 'Configuration not found' });
  }
  
  res.status(204).send();
});

export default router;
