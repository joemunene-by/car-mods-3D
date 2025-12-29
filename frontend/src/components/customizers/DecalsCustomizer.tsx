import { useState } from 'react';
import { DecalPlacement, DecalConfig } from '../../store/customizationStore';
import { CustomizationOption } from '../../hooks/useCustomizations';

interface DecalsCustomizerProps {
  options: CustomizationOption[];
  decals: DecalConfig[];
  onAddDecal: (decal: Omit<DecalConfig, 'id'>) => void;
  onUpdateDecal: (id: string, updates: Partial<DecalConfig>) => void;
  onRemoveDecal: (id: string) => void;
  onClearAll: () => void;
}

const PLACEMENTS: { value: DecalPlacement; label: string }[] = [
  { value: 'HOOD', label: 'Hood' },
  { value: 'ROOF', label: 'Roof' },
  { value: 'TRUNK', label: 'Trunk' },
  { value: 'DOOR_LEFT', label: 'Left Door' },
  { value: 'DOOR_RIGHT', label: 'Right Door' },
  { value: 'QUARTER_LEFT', label: 'Left Quarter' },
  { value: 'QUARTER_RIGHT', label: 'Right Quarter' },
  { value: 'BUMPER_FRONT', label: 'Front Bumper' },
  { value: 'BUMPER_REAR', label: 'Rear Bumper' },
];

interface DecalType {
  id: string;
  name: string;
  type: 'stripe' | 'logo' | 'graphic' | 'number' | 'text';
  preview: string;
  price: number;
}

const DEFAULT_DECAL_TYPES: DecalType[] = [
  { id: 'racing-stripe', name: 'Racing Stripe', type: 'stripe', preview: '｜', price: 150 },
  { id: 'double-stripe', name: 'Double Stripe', type: 'stripe', preview: '║║', price: 200 },
  { id: 'flame', name: 'Flame', type: 'graphic', preview: '🔥', price: 350 },
  { id: 'skull', name: 'Skull', type: 'graphic', preview: '💀', price: 300 },
  { id: 'racing-number', name: 'Racing #', type: 'number', preview: '1', price: 100 },
  { id: 'star', name: 'Star', type: 'graphic', preview: '⭐', price: 250 },
  { id: 'flag', name: 'Racing Flag', type: 'graphic', preview: '🏁', price: 280 },
  { id: 'geometric', name: 'Geometric', type: 'graphic', preview: '⬡', price: 320 },
];

export default function DecalsCustomizer({
  options,
  decals,
  onAddDecal,
  onRemoveDecal,
  onClearAll,
}: DecalsCustomizerProps) {
  const decalOptions = options.filter(o => o.category === 'DECAL');
  
  const hasApiDecals = decalOptions.length > 0;
  
  const decalTypes = hasApiDecals
    ? decalOptions.map(o => ({
        id: o.id,
        name: o.name,
        type: (o.specs?.decalType as DecalType['type']) || 'graphic',
        preview: o.thumbnailUrl || '✨',
        price: o.price,
      }))
    : DEFAULT_DECAL_TYPES;

  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [selectedPlacement, setSelectedPlacement] = useState<DecalPlacement>('HOOD');
  const [decalColor, setDecalColor] = useState('#FFFFFF');
  const [decalOpacity, setDecalOpacity] = useState(1);
  const [decalScale, setDecalScale] = useState(1);
  const [decalRotation, setDecalRotation] = useState(0);

  const handleAddDecal = () => {
    if (!selectedType) return;

    const typeConfig = decalTypes.find(d => d.id === selectedType);
    if (!typeConfig) return;

    onAddDecal({
      typeId: selectedType,
      name: typeConfig.name,
      placement: selectedPlacement,
      color: decalColor,
      opacity: decalOpacity,
      scale: decalScale,
      rotation: decalRotation,
      offsetX: 0,
      offsetY: 0,
    });

    setSelectedType(null);
  };

  const handleClearAll = () => {
    if (window.confirm('Are you sure you want to remove all decals?')) {
      onClearAll();
    }
  };

  return (
    <div className="decals-customizer">
      <div className="section-row">
        <label className="section-label">Decal Library</label>
        <div className="decal-library">
          {decalTypes.map((decal) => (
            <button
              key={decal.id}
              className={`decal-option ${selectedType === decal.id ? 'selected' : ''}`}
              onClick={() => setSelectedType(decal.id)}
              title={decal.name}
            >
              {decal.preview}
            </button>
          ))}
        </div>
      </div>

      {selectedType && (
        <>
          <div className="section-row">
            <label className="section-label">Placement</label>
            <div className="placement-grid">
              {PLACEMENTS.map((p) => (
                <button
                  key={p.value}
                  className={`placement-option ${selectedPlacement === p.value ? 'selected' : ''}`}
                  onClick={() => setSelectedPlacement(p.value)}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <div className="section-row">
            <label className="section-label">Decal Color</label>
            <div className="color-input-wrapper" style={{ maxWidth: '200px' }}>
              <input
                type="color"
                className="color-preview-swatch"
                value={decalColor}
                onChange={(e) => setDecalColor(e.target.value)}
                style={{ width: '50px', height: '50px' }}
              />
              <input
                type="text"
                className="color-hex-input"
                value={decalColor}
                onChange={(e) => setDecalColor(e.target.value)}
              />
            </div>
          </div>

          <div className="section-row">
            <label className="section-label">Opacity: {Math.round(decalOpacity * 100)}%</label>
            <div className="slider-control">
              <input
                type="range"
                min="0.1"
                max="1"
                step="0.1"
                value={decalOpacity}
                onChange={(e) => setDecalOpacity(Number(e.target.value))}
              />
            </div>
          </div>

          <div className="section-row">
            <label className="section-label">Scale: {decalScale.toFixed(1)}x</label>
            <div className="slider-control">
              <input
                type="range"
                min="0.5"
                max="2"
                step="0.1"
                value={decalScale}
                onChange={(e) => setDecalScale(Number(e.target.value))}
              />
            </div>
          </div>

          <div className="section-row">
            <label className="section-label">Rotation: {decalRotation}°</label>
            <div className="slider-control">
              <input
                type="range"
                min="-180"
                max="180"
                step="15"
                value={decalRotation}
                onChange={(e) => setDecalRotation(Number(e.target.value))}
              />
            </div>
          </div>

          <div className="section-row">
            <button
              className="primary-btn"
              style={{ width: '100%', padding: '0.75rem' }}
              onClick={handleAddDecal}
            >
              Apply Decal
            </button>
          </div>
        </>
      )}

      {decals.length > 0 && (
        <div className="section-row">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <label className="section-label" style={{ margin: 0 }}>Applied Decals ({decals.length})</label>
            <button
              className="reset-section-btn"
              style={{ margin: 0, width: 'auto', padding: '0.4rem 0.75rem' }}
              onClick={handleClearAll}
            >
              Clear All
            </button>
          </div>
          <div className="applied-decals">
            {decals.map((decal) => {
              const typeConfig = decalTypes.find(t => t.id === decal.typeId);
              return (
                <div key={decal.id} className="applied-decal">
                  <div className="decal-preview" style={{ background: decal.color, opacity: decal.opacity }}>
                    {typeConfig?.preview || '✨'}
                  </div>
                  <div className="decal-info">
                    <div className="decal-name">{decal.name}</div>
                    <div className="decal-placement">
                      {PLACEMENTS.find(p => p.value === decal.placement)?.label}
                    </div>
                  </div>
                  <button
                    className="remove-btn"
                    onClick={() => onRemoveDecal(decal.id)}
                    title="Remove decal"
                  >
                    ✕
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {decals.length === 0 && !selectedType && (
        <div className="section-row" style={{ textAlign: 'center', padding: '1rem', color: 'rgba(255,255,255,0.5)' }}>
          <p>Select a decal from the library above to add it to your car.</p>
        </div>
      )}
    </div>
  );
}
