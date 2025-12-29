import { WheelSize, WheelFinish, TireType } from '../../store/customizationStore';
import { CustomizationOption } from '../../hooks/useCustomizations';

interface WheelsCustomizerProps {
  options: CustomizationOption[];
  designId: string | null;
  size: WheelSize;
  finish: WheelFinish;
  tireType: TireType;
  onDesignChange: (designId: string | null) => void;
  onSizeChange: (size: WheelSize) => void;
  onFinishChange: (finish: WheelFinish) => void;
  onTireTypeChange: (type: TireType) => void;
  onReset: () => void;
}

const WHEEL_SIZES: WheelSize[] = ['17"', '18"', '19"', '20"', '21"'];

const FINISHES: { value: WheelFinish; label: string; description: string }[] = [
  { value: 'CHROME', label: 'Chrome', description: 'High polish mirror finish' },
  { value: 'MATTE_BLACK', label: 'Matte Black', description: 'Sleek dark finish' },
  { value: 'POLISHED', label: 'Polished', description: 'Shiny metallic' },
  { value: 'PAINTED', label: 'Painted', description: 'Color matched' },
];

const TIRE_TYPES: { value: TireType; label: string; description: string }[] = [
  { value: 'SPORT', label: 'Sport', description: 'Performance focused' },
  { value: 'ALL_SEASON', label: 'All-Season', description: 'Year-round use' },
  { value: 'WINTER', label: 'Winter', description: 'Cold weather optimized' },
  { value: 'TRACK', label: 'Track', description: 'Maximum grip' },
];

interface WheelDesign {
  id: string;
  name: string;
  preview: string;
  price: number;
}

const DEFAULT_WHEEL_DESIGNS: WheelDesign[] = [
  { id: 'sport-5-spoke', name: 'Sport 5-Spoke', preview: '⭐', price: 800 },
  { id: 'multi-spoke', name: 'Multi-Spoke', preview: '⚡', price: 1000 },
  { id: 'split-5-spoke', name: 'Split 5-Spoke', preview: '💫', price: 1200 },
  { id: 'mesh', name: 'Mesh', preview: '🕸️', price: 1500 },
  { id: 'dual-5-spoke', name: 'Dual 5-Spoke', preview: '🔷', price: 900 },
  { id: 'aero', name: 'Aero', preview: '🌀', price: 1100 },
];

export default function WheelsCustomizer({
  options,
  designId,
  size,
  finish,
  tireType,
  onDesignChange,
  onSizeChange,
  onFinishChange,
  onTireTypeChange,
  onReset,
}: WheelsCustomizerProps) {
  const wheelOptions = options.filter(o => o.category === 'WHEELS');
  
  const hasApiDesigns = wheelOptions.length > 0;
  
  const designs = hasApiDesigns
    ? wheelOptions.map(o => ({
        id: o.id,
        name: o.name,
        preview: o.thumbnailUrl || '⚙️',
        price: o.price,
      }))
    : DEFAULT_WHEEL_DESIGNS;

  const selectedDesign = designs.find(d => d.id === designId);

  return (
    <div className="wheels-customizer">
      <div className="section-row">
        <label className="section-label">Wheel Design</label>
        <div className="wheel-grid">
          <button
            className={`wheel-option ${designId === null ? 'selected' : ''}`}
            onClick={() => onDesignChange(null)}
          >
            <div className="wheel-preview" style={{ background: 'linear-gradient(135deg, #333 0%, #666 50%, #333 100%)' }} />
            <span className="wheel-name">Stock</span>
          </button>
          {designs.map((wheel) => (
            <button
              key={wheel.id}
              className={`wheel-option ${designId === wheel.id ? 'selected' : ''}`}
              onClick={() => onDesignChange(wheel.id)}
            >
              <div className="wheel-preview">{wheel.preview}</div>
              <span className="wheel-name">{wheel.name}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="section-row">
        <label className="section-label">Wheel Size</label>
        <div className="size-buttons">
          {WHEEL_SIZES.map((s) => (
            <button
              key={s}
              className={`size-button ${size === s ? 'selected' : ''}`}
              onClick={() => onSizeChange(s)}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="section-row">
        <label className="section-label">Wheel Finish</label>
        <div className="finish-selector">
          {FINISHES.map((f) => (
            <button
              key={f.value}
              className={`finish-option ${finish === f.value ? 'selected' : ''}`}
              onClick={() => onFinishChange(f.value)}
              title={f.description}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="section-row">
        <label className="section-label">Tire Type</label>
        <div className="finish-selector">
          {TIRE_TYPES.map((t) => (
            <button
              key={t.value}
              className={`finish-option ${tireType === t.value ? 'selected' : ''}`}
              onClick={() => onTireTypeChange(t.value)}
              title={t.description}
            >
              {t.label}
            </button>
          ))}
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
        Reset Wheels
      </button>
    </div>
  );
}
