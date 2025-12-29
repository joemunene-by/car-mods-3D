import { SpoilerType, SpoilerMaterial, SpoilerPosition } from '../../store/customizationStore';
import { CustomizationOption } from '../../hooks/useCustomizations';

interface SpoilerCustomizerProps {
  options: CustomizationOption[];
  designId: string | null;
  type: SpoilerType;
  material: SpoilerMaterial;
  position: SpoilerPosition;
  angle: number;
  height: number;
  onDesignChange: (designId: string | null) => void;
  onTypeChange: (type: SpoilerType) => void;
  onMaterialChange: (material: SpoilerMaterial) => void;
  onPositionChange: (position: SpoilerPosition) => void;
  onAngleChange: (angle: number) => void;
  onHeightChange: (height: number) => void;
  onReset: () => void;
}

const SPOILER_TYPES: { value: SpoilerType; label: string; icon: string }[] = [
  { value: 'STOCK', label: 'Stock', icon: '📦' },
  { value: 'GT', label: 'GT Wing', icon: '🪶' },
  { value: 'CARBON', label: 'Carbon', icon: '💎' },
  { value: 'RACING', label: 'Racing', icon: '🏁' },
  { value: 'NONE', label: 'None', icon: '❌' },
];

const MATERIALS: { value: SpoilerMaterial; label: string; description: string }[] = [
  { value: 'ABS_PLASTIC', label: 'ABS Plastic', description: 'Durable, lightweight' },
  { value: 'CARBON_FIBER', label: 'Carbon Fiber', description: 'Premium, lightweight' },
  { value: 'ALUMINUM', label: 'Aluminum', description: 'Strong, classic' },
  { value: 'FIBERGLASS', label: 'Fiberglass', description: 'Versatile, affordable' },
];

const POSITIONS: { value: SpoilerPosition; label: string }[] = [
  { value: 'LOW', label: 'Low' },
  { value: 'MID', label: 'Mid' },
  { value: 'HIGH', label: 'High' },
  { value: 'LIP', label: 'Lip' },
];

interface SpoilerDesign {
  id: string;
  name: string;
  type: SpoilerType;
  material: SpoilerMaterial;
  price: number;
  preview: string;
}

const DEFAULT_SPOILERS: SpoilerDesign[] = [
  { id: 'gt-wing-carbon', name: 'GT Carbon Wing', type: 'GT', material: 'CARBON_FIBER', price: 2800, preview: '🪶' },
  { id: 'gt-wing-alum', name: 'GT Aluminum Wing', type: 'GT', material: 'ALUMINUM', price: 2200, preview: '🪶' },
  { id: 'carbon-racing', name: 'Carbon Racing', type: 'RACING', material: 'CARBON_FIBER', price: 3500, preview: '🏁' },
  { id: 'sport-gt', name: 'Sport GT', type: 'GT', material: 'ABS_PLASTIC', price: 1500, preview: '🏁' },
];

export default function SpoilerCustomizer({
  options,
  designId,
  type,
  material,
  position,
  angle,
  height,
  onDesignChange,
  onTypeChange,
  onMaterialChange,
  onPositionChange,
  onAngleChange,
  onHeightChange,
  onReset,
}: SpoilerCustomizerProps) {
  const spoilerOptions = options.filter(o => o.category === 'SPOILER');
  
  const hasApiDesigns = spoilerOptions.length > 0;
  
  const designs = hasApiDesigns
    ? spoilerOptions.map(o => ({
        id: o.id,
        name: o.name,
        type: (o.specs?.spoilerType as SpoilerType) || 'GT',
        material: (o.specs?.spoilerMaterial as SpoilerMaterial) || 'ABS_PLASTIC',
        price: o.price,
        preview: o.thumbnailUrl || '🏁',
      }))
    : DEFAULT_SPOILERS;

  const selectedDesign = designs.find(d => d.id === designId);

  return (
    <div className="spoiler-customizer">
      <div className="section-row">
        <label className="section-label">Spoiler Design</label>
        <div className="spoiler-grid">
          <button
            className={`spoiler-option ${designId === null ? 'selected' : ''}`}
            onClick={() => onDesignChange(null)}
          >
            <div className="spoiler-icon">📦</div>
            <div className="spoiler-name">Stock</div>
          </button>
          {designs.map((spoiler) => (
            <button
              key={spoiler.id}
              className={`spoiler-option ${designId === spoiler.id ? 'selected' : ''}`}
              onClick={() => onDesignChange(spoiler.id)}
            >
              <div className="spoiler-icon">{spoiler.preview}</div>
              <div className="spoiler-name">{spoiler.name}</div>
            </button>
          ))}
        </div>
      </div>

      <div className="section-row">
        <label className="section-label">Spoiler Type</label>
        <div className="finish-selector">
          {SPOILER_TYPES.map((t) => (
            <button
              key={t.value}
              className={`finish-option ${type === t.value ? 'selected' : ''}`}
              onClick={() => onTypeChange(t.value)}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="section-row">
        <label className="section-label">Material</label>
        <div className="finish-selector">
          {MATERIALS.map((m) => (
            <button
              key={m.value}
              className={`finish-option ${material === m.value ? 'selected' : ''}`}
              onClick={() => onMaterialChange(m.value)}
              title={m.description}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      <div className="section-row">
        <label className="section-label">Position</label>
        <div className="finish-selector">
          {POSITIONS.map((p) => (
            <button
              key={p.value}
              className={`finish-option ${position === p.value ? 'selected' : ''}`}
              onClick={() => onPositionChange(p.value)}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <div className="section-row">
        <label className="section-label">Angle Adjustment: {angle}°</label>
        <div className="slider-control">
          <input
            type="range"
            min="-30"
            max="30"
            value={angle}
            onChange={(e) => onAngleChange(Number(e.target.value))}
          />
          <div className="slider-labels">
            <span>-30°</span>
            <span>0°</span>
            <span>+30°</span>
          </div>
        </div>
      </div>

      <div className="section-row">
        <label className="section-label">Height Adjustment: {height}%</label>
        <div className="slider-control">
          <input
            type="range"
            min="0"
            max="100"
            value={height}
            onChange={(e) => onHeightChange(Number(e.target.value))}
          />
          <div className="slider-labels">
            <span>Low</span>
            <span>High</span>
          </div>
        </div>
      </div>

      {selectedDesign && (
        <div className="section-row" style={{ padding: '0.75rem', background: 'rgba(100, 108, 255, 0.1)', borderRadius: '6px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)' }}>
              Selected: {selectedDesign.name}
            </span>
            <span style={{ fontSize: '0.9rem', color: '#a5aaff' }}>
              +${selectedDesign.price.toLocaleString()}
            </span>
          </div>
        </div>
      )}

      <button className="reset-section-btn" onClick={onReset}>
        Reset Spoiler
      </button>
    </div>
  );
}
