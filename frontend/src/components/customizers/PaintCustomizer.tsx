import React from 'react';
import { PaintFinish, PaintZone } from '../../store/customizationStore';
import { CustomizationOption } from '../../hooks/useCustomizations';

interface PaintCustomizerProps {
  options: CustomizationOption[];
  color: string;
  finish: PaintFinish;
  zone: PaintZone;
  onColorChange: (color: string) => void;
  onFinishChange: (finish: PaintFinish) => void;
  onZoneChange: (zone: PaintZone) => void;
  onReset: () => void;
}

const PREDEFINED_COLORS = [
  '#C0C0C0', '#FFFFFF', '#000000', '#FF0000', '#00FF00', '#0000FF',
  '#FFFF00', '#FF00FF', '#00FFFF', '#FFA500', '#800080', '#008000',
  '#000080', '#808080', '#FFC0CB', '#A52A2A', '#4B0082', '#FFD700',
];

const FINISHES: { value: PaintFinish; label: string; description: string }[] = [
  { value: 'MATTE', label: 'Matte', description: 'Non-reflective, unique look' },
  { value: 'GLOSSY', label: 'Glossy', description: 'High shine, classic look' },
  { value: 'METALLIC', label: 'Metallic', description: 'Metallic flakes, depth' },
  { value: 'PEARL', label: 'Pearl', description: 'Iridescent, premium finish' },
];

const ZONES: { value: PaintZone; label: string }[] = [
  { value: 'BODY', label: 'Body' },
  { value: 'ROOF', label: 'Roof' },
  { value: 'TRIM', label: 'Trim' },
  { value: 'ACCENTS', label: 'Accents' },
  { value: 'MIRRORS', label: 'Mirrors' },
];

export default function PaintCustomizer({
  options,
  color,
  finish,
  zone,
  onColorChange,
  onFinishChange,
  onZoneChange,
  onReset,
}: PaintCustomizerProps) {
  const paintOptions = options.filter(o => o.category === 'PAINT');
  
  const colorOptions = paintOptions.filter(o => o.colorHex);
  const hasPredefinedColors = colorOptions.length > 0;
  const displayColors = hasPredefinedColors 
    ? colorOptions.map(o => o.colorHex!).filter(Boolean)
    : PREDEFINED_COLORS;

  const handleColorInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onColorChange(e.target.value);
  };

  const handleSwatchClick = (swatchColor: string) => {
    onColorChange(swatchColor);
  };

  return (
    <div className="paint-customizer">
      <div className="section-row">
        <label className="section-label">Color</label>
        <div className="color-picker-container">
          <div className="color-input-wrapper">
            <input
              type="color"
              className="color-preview-swatch"
              value={color}
              onChange={handleColorInputChange}
            />
            <input
              type="text"
              className="color-hex-input"
              value={color}
              onChange={handleColorInputChange}
              placeholder="#HEX"
            />
          </div>
          <div className="color-swatches">
            {displayColors.map((swatchColor) => (
              <button
                key={swatchColor}
                className={`color-swatch ${color === swatchColor ? 'selected' : ''}`}
                style={{ backgroundColor: swatchColor }}
                onClick={() => handleSwatchClick(swatchColor)}
                title={swatchColor}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="section-row">
        <label className="section-label">Paint Finish</label>
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
        <label className="section-label">Paint Zone</label>
        <div className="zone-selector">
          {ZONES.map((z) => (
            <button
              key={z.value}
              className={`zone-option ${zone === z.value ? 'selected' : ''}`}
              onClick={() => onZoneChange(z.value)}
            >
              {z.label}
            </button>
          ))}
        </div>
      </div>

      <button className="reset-section-btn" onClick={onReset}>
        Reset Paint
      </button>
    </div>
  );
}
