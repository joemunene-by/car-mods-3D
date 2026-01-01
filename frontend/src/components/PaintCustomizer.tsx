import { useEffect, useState } from 'react';
import { useCustomizationStore, type PaintFinish, type PaintZone } from '../store/customizationStore';
import './PaintCustomizer.css';

interface PaintCustomizerProps {
  onPriceUpdate?: (price: number) => void;
}

const PREDEFINED_COLORS = [
  { name: 'Black', hex: '#000000' },
  { name: 'White', hex: '#FFFFFF' },
  { name: 'Red', hex: '#FF0000' },
  { name: 'Blue', hex: '#0000FF' },
  { name: 'Yellow', hex: '#FFFF00' },
  { name: 'Green', hex: '#00FF00' },
  { name: 'Orange', hex: '#FFA500' },
  { name: 'Purple', hex: '#800080' },
  { name: 'Silver', hex: '#C0C0C0' },
  { name: 'Gold', hex: '#FFD700' },
  { name: 'Pink', hex: '#FFC0CB' },
  { name: 'Cyan', hex: '#00FFFF' },
];

const PAINT_FINISH_OPTIONS: { value: PaintFinish; label: string; price: number }[] = [
  { value: 'matte', label: 'Matte', price: 0 },
  { value: 'glossy', label: 'Glossy', price: 0 },
  { value: 'metallic', label: 'Metallic', price: 500 },
  { value: 'pearl', label: 'Pearl', price: 800 },
];

export default function PaintCustomizer({ onPriceUpdate }: PaintCustomizerProps) {
  const { paintZones, updatePaintZone } = useCustomizationStore();
  const [selectedZoneId, setSelectedZoneId] = useState<string>('body');

  const selectedZone = paintZones.find(zone => zone.id === selectedZoneId)!;

  const handleColorChange = (color: string) => {
    updatePaintZone(selectedZoneId, { color });
  };

  const handleFinishChange = (finish: PaintFinish) => {
    updatePaintZone(selectedZoneId, { finish });
  };

  const resetZone = () => {
    const defaultColor = selectedZoneId === 'accents' ? '#ff0000' : '#000000';
    updatePaintZone(selectedZoneId, { 
      color: defaultColor, 
      finish: 'glossy' 
    });
  };

  useEffect(() => {
    if (onPriceUpdate) {
      const finishPrice = PAINT_FINISH_OPTIONS.find(f => f.value === selectedZone.finish)?.price || 0;
      onPriceUpdate(finishPrice);
    }
  }, [selectedZone.finish, onPriceUpdate]);

  return (
    <div className="paint-customizer">
      <div className="zone-selector">
        <label>Select Paint Zone:</label>
        <div className="zone-buttons">
          {paintZones.map(zone => (
            <button
              key={zone.id}
              className={`zone-btn ${selectedZoneId === zone.id ? 'active' : ''}`}
              onClick={() => setSelectedZoneId(zone.id)}
            >
              {zone.name}
            </button>
          ))}
        </div>
      </div>

      <div className="current-zone">
        <h3>Customizing: {selectedZone.name}</h3>
        <div 
          className="color-preview" 
          style={{ backgroundColor: selectedZone.color }}
          title={`${selectedZone.name}: ${selectedZone.color}`}
        />
      </div>

      <div className="color-picker-section">
        <label>Color:</label>
        <input
          type="color"
          value={selectedZone.color}
          onChange={(e) => handleColorChange(e.target.value)}
          className="color-input"
        />
        
        <div className="color-swatches">
          {PREDEFINED_COLORS.map(color => (
            <button
              key={color.hex}
              className="color-swatch"
              style={{ backgroundColor: color.hex }}
              onClick={() => handleColorChange(color.hex)}
              title={color.name}
            />
          ))}
        </div>
      </div>

      <div className="finish-selector">
        <label>Paint Finish:</label>
        <select
          value={selectedZone.finish}
          onChange={(e) => handleFinishChange(e.target.value as PaintFinish)}
          className="finish-select"
        >
          {PAINT_FINISH_OPTIONS.map(option => (
            <option key={option.value} value={option.value}>
              {option.label} {option.price > 0 ? `+$${option.price}` : ''}
            </option>
          ))}
        </select>
      </div>

      <button onClick={resetZone} className="reset-btn">
        Reset {selectedZone.name} to Default
      </button>

      <div className="price-info">
        {PAINT_FINISH_OPTIONS.find(f => f.value === selectedZone.finish)?.price! > 0 && (
          <p className="price-additional">
            Additional: +${PAINT_FINISH_OPTIONS.find(f => f.value === selectedZone.finish)?.price}
          </p>
        )}
      </div>
    </div>
  );
}