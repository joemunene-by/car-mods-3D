import { useState, useCallback } from 'react';
import { useCustomizationStore, type PaintFinish } from '../store/customizationStore';
import '../../styles/PaintCustomizer.css';

const PREDEFINED_COLORS = [
  { name: 'Silver', color: '#c0c0c0' },
  { name: 'Black', color: '#1a1a1a' },
  { name: 'White', color: '#f5f5f5' },
  { name: 'Red', color: '#cc0000' },
  { name: 'Blue', color: '#0066cc' },
  { name: 'Green', color: '#006633' },
  { name: 'Yellow', color: '#ffcc00' },
  { name: 'Orange', color: '#ff6600' },
  { name: 'Purple', color: '#660066' },
  { name: 'Navy', color: '#000066' },
  { name: 'Burgundy', color: '#660000' },
  { name: 'Bronze', color: '#cd7f32' },
];

const FINISHES: { value: PaintFinish; label: string; price: number }[] = [
  { value: 'matte', label: 'Matte', price: 500 },
  { value: 'glossy', label: 'Glossy', price: 800 },
  { value: 'metallic', label: 'Metallic', price: 1200 },
  { value: 'pearl', label: 'Pearl', price: 2000 },
];

interface PaintCustomizerProps {
  onPriceChange?: (price: number) => void;
}

function PaintCustomizer({ onPriceChange }: PaintCustomizerProps) {
  const { paint, setPaint } = useCustomizationStore();
  const [customColor, setCustomColor] = useState(paint.color);

  const handleColorChange = useCallback((color: string) => {
    setCustomColor(color);
    setPaint({ color });
  }, [setPaint]);

  const handleFinishChange = useCallback((finish: PaintFinish) => {
    setPaint({ finish });
  }, [setPaint]);

  const handleZoneChange = useCallback((zone: keyof typeof paint.zones) => {
    setPaint({
      zones: {
        ...paint.zones,
        [zone]: !paint.zones[zone],
      },
    });
  }, [paint.zones, setPaint]);

  const handleReset = useCallback(() => {
    setPaint({
      color: '#c0c0c0',
      finish: 'metallic',
      zones: { body: true, roof: false, trim: true, accents: false },
    });
    setCustomColor('#c0c0c0');
  }, [setPaint]);

  const currentFinishPrice = FINISHES.find(f => f.value === paint.finish)?.price || 0;
  
  if (onPriceChange) {
    onPriceChange(currentFinishPrice);
  }

  return (
    <div className="paint-customizer">
      <div className="customizer-section">
        <h3>Paint Color</h3>
        
        <div className="color-picker-section">
          <div className="selected-color-display">
            <div
              className="color-preview-large"
              style={{ backgroundColor: customColor }}
            />
            <span className="color-hex">{customColor.toUpperCase()}</span>
          </div>

          <div className="color-input-row">
            <input
              type="color"
              value={customColor}
              onChange={(e) => handleColorChange(e.target.value)}
              className="color-input"
            />
            <input
              type="text"
              value={customColor}
              onChange={(e) => handleColorChange(e.target.value)}
              className="hex-input"
              placeholder="#HEX"
              maxLength={7}
            />
          </div>
        </div>

        <div className="predefined-colors">
          <h4>Quick Select</h4>
          <div className="color-swatches">
            {PREDEFINED_COLORS.map((c) => (
              <button
                key={c.color}
                className={`color-swatch ${paint.color === c.color ? 'active' : ''}`}
                style={{ backgroundColor: c.color }}
                onClick={() => handleColorChange(c.color)}
                title={c.name}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="customizer-section">
        <h3>Paint Finish</h3>
        <div className="finish-options">
          {FINISHES.map((finish) => (
            <button
              key={finish.value}
              className={`finish-btn ${paint.finish === finish.value ? 'active' : ''}`}
              onClick={() => handleFinishChange(finish.value)}
            >
              <span className="finish-name">{finish.label}</span>
              <span className="finish-price">+${finish.price.toLocaleString()}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="customizer-section">
        <h3>Paint Zones</h3>
        <div className="zone-options">
          {Object.entries(paint.zones).map(([zone, enabled]) => (
            <label key={zone} className={`zone-toggle ${enabled ? 'active' : ''}`}>
              <input
                type="checkbox"
                checked={!!enabled}
                onChange={() => handleZoneChange(zone as keyof typeof paint.zones)}
              />
              <span className="zone-label">
                {zone.charAt(0).toUpperCase() + zone.slice(1)}
              </span>
            </label>
          ))}
        </div>
      </div>

      <div className="customizer-section">
        <div className="price-summary">
          <span>Paint Price:</span>
          <span className="price-value">${currentFinishPrice.toLocaleString()}</span>
        </div>
        <button className="reset-btn" onClick={handleReset}>
          Reset to Default
        </button>
      </div>
    </div>
  );
}

export default PaintCustomizer;
