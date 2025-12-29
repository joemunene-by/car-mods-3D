import { useState, useCallback } from 'react';
import { useCustomizationStore, type SpoilerMaterial } from '../store/customizationStore';
import '../../styles/SpoilerCustomizer.css';

const SPOILER_DESIGNS: { id: string; name: string; price: number; description: string; previewColor: string }[] = [
  { id: 'gt', name: 'GT Wing', price: 1200, description: 'Large adjustable wing', previewColor: '#333' },
  { id: 'carbon', name: 'Carbon Fiber', price: 1800, description: 'Lightweight carbon look', previewColor: '#1a1a1a' },
  { id: 'racing', name: 'Racing Spoiler', price: 900, description: 'Aggressive track style', previewColor: '#444' },
  { id: 'stock', name: 'Stock Style', price: 400, description: 'Factory appearance', previewColor: '#555' },
];

const SPOILER_MATERIALS: { value: SpoilerMaterial; label: string; priceMultiplier: number; color: string }[] = [
  { value: 'abs_plastic', label: 'ABS Plastic', priceMultiplier: 1, color: '#333' },
  { value: 'carbon_fiber', label: 'Carbon Fiber', priceMultiplier: 1.5, color: '#1a1a1a' },
  { value: 'aluminum', label: 'Aluminum', priceMultiplier: 1.25, color: '#888' },
];

const SPOILER_POSITIONS = [
  { id: 'low', name: 'Low', description: 'Near deck lid' },
  { id: 'medium', name: 'Medium', description: 'Standard position' },
  { id: 'high', name: 'High', description: 'Maximum downforce' },
];

interface SpoilerCustomizerProps {
  onPriceChange?: (price: number) => void;
  onSpoilerChange?: (settings: { designId: string | null; material: SpoilerMaterial; position: string; angle: number }) => void;
}

function SpoilerCustomizer({ onPriceChange, onSpoilerChange }: SpoilerCustomizerProps) {
  const { spoiler, setSpoiler } = useCustomizationStore();
  const [selectedDesign, setSelectedDesign] = useState(spoiler.designId);
  const [previewAngle, setPreviewAngle] = useState(spoiler.angle);

  const handleDesignSelect = useCallback((designId: string | null) => {
    setSelectedDesign(designId);
    setSpoiler({ designId });
    if (onSpoilerChange) {
      onSpoilerChange({
        designId,
        material: spoiler.material,
        position: spoiler.position,
        angle: spoiler.angle,
      });
    }
  }, [setSpoiler, onSpoilerChange, spoiler.material, spoiler.position, spoiler.angle]);

  const handleMaterialChange = useCallback((material: SpoilerMaterial) => {
    setSpoiler({ material });
    if (onSpoilerChange && selectedDesign) {
      onSpoilerChange({
        designId: selectedDesign,
        material,
        position: spoiler.position,
        angle: spoiler.angle,
      });
    }
  }, [setSpoiler, onSpoilerChange, selectedDesign, spoiler.position, spoiler.angle]);

  const handlePositionChange = useCallback((position: 'low' | 'medium' | 'high') => {
    setSpoiler({ position });
    if (onSpoilerChange && selectedDesign) {
      onSpoilerChange({
        designId: selectedDesign,
        material: spoiler.material,
        position,
        angle: spoiler.angle,
      });
    }
  }, [setSpoiler, onSpoilerChange, selectedDesign, spoiler.material, spoiler.angle]);

  const handleAngleChange = useCallback((angle: number) => {
    setPreviewAngle(angle);
    setSpoiler({ angle });
    if (onSpoilerChange && selectedDesign) {
      onSpoilerChange({
        designId: selectedDesign,
        material: spoiler.material,
        position: spoiler.position,
        angle,
      });
    }
  }, [setSpoiler, onSpoilerChange, selectedDesign, spoiler.material, spoiler.position]);

  const handleRemove = useCallback(() => {
    handleDesignSelect(null);
  }, [handleDesignSelect]);

  const handleReset = useCallback(() => {
    setSelectedDesign(null);
    setPreviewAngle(0);
    setSpoiler({
      designId: null,
      material: 'abs_plastic',
      position: 'medium',
      angle: 0,
    });
    if (onSpoilerChange) {
      onSpoilerChange({
        designId: null,
        material: 'abs_plastic',
        position: 'medium',
        angle: 0,
      });
    }
  }, [setSpoiler, onSpoilerChange]);

  const calculatePrice = useCallback(() => {
    if (!selectedDesign) return 0;
    const design = SPOILER_DESIGNS.find(d => d.id === selectedDesign);
    if (!design) return 0;
    const material = SPOILER_MATERIALS.find(m => m.value === spoiler.material);
    return design.price * (material?.priceMultiplier || 1);
  }, [selectedDesign, spoiler.material]);

  const totalPrice = calculatePrice();
  if (onPriceChange) onPriceChange(totalPrice);

  return (
    <div className="spoiler-customizer">
      <div className="customizer-section">
        <h3>Spoiler Design</h3>
        <div className="spoiler-gallery">
          {SPOILER_DESIGNS.map((design) => (
            <button
              key={design.id}
              className={`spoiler-card ${selectedDesign === design.id ? 'active' : ''}`}
              onClick={() => handleDesignSelect(design.id)}
            >
              <div
                className="spoiler-preview"
                style={{ backgroundColor: design.previewColor }}
              >
                <div className="spoiler-shape" />
              </div>
              <div className="spoiler-info">
                <span className="spoiler-name">{design.name}</span>
                <span className="spoiler-desc">{design.description}</span>
                <span className="spoiler-price">+${design.price.toLocaleString()}</span>
              </div>
            </button>
          ))}
        </div>
        <button
          className="no-spoiler-btn"
          onClick={handleRemove}
        >
          No Spoiler
        </button>
      </div>

      {selectedDesign && (
        <>
          <div className="customizer-section">
            <h3>Material</h3>
            <div className="material-options">
              {SPOILER_MATERIALS.map((material) => (
                <button
                  key={material.value}
                  className={`material-btn ${spoiler.material === material.value ? 'active' : ''}`}
                  onClick={() => handleMaterialChange(material.value)}
                >
                  <div
                    className="material-preview"
                    style={{
                      background: material.value === 'carbon_fiber'
                        ? 'repeating-linear-gradient(45deg, #1a1a1a, #1a1a1a 2px, #333 2px, #333 4px)'
                        : material.value === 'aluminum'
                        ? 'linear-gradient(135deg, #aaa, #fff, #aaa)'
                        : material.color,
                    }}
                  />
                  <span className="material-label">{material.label}</span>
                  {material.priceMultiplier > 1 && (
                    <span className="material-multiplier">
                      ×{material.priceMultiplier.toFixed(1)}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="customizer-section">
            <h3>Position</h3>
            <div className="position-options">
              {SPOILER_POSITIONS.map((pos) => (
                <button
                  key={pos.id}
                  className={`position-btn ${spoiler.position === pos.id ? 'active' : ''}`}
                  onClick={() => handlePositionChange(pos.id as 'low' | 'medium' | 'high')}
                >
                  <span className="position-name">{pos.name}</span>
                  <span className="position-desc">{pos.description}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="customizer-section">
            <h3>Angle Adjustment</h3>
            <div className="angle-control">
              <input
                type="range"
                min="-20"
                max="20"
                value={previewAngle}
                onChange={(e) => handleAngleChange(parseInt(e.target.value))}
                className="angle-slider"
              />
              <div className="angle-display">
                <span className="angle-value">{previewAngle}°</span>
                <span className="angle-label">
                  {previewAngle === 0 ? 'Neutral' : 
                   previewAngle < 0 ? 'Lower (Street)' : 'Higher (Track)'}
                </span>
              </div>
            </div>
          </div>
        </>
      )}

      <div className="customizer-section">
        <div className="price-summary">
          <span>Spoiler Price:</span>
          <span className="price-value">${totalPrice.toLocaleString()}</span>
        </div>
        <button className="reset-btn" onClick={handleReset}>
          Reset to Default
        </button>
      </div>
    </div>
  );
}

export default SpoilerCustomizer;
