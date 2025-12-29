import { useState, useCallback } from 'react';
import { useCustomizationStore, type WheelSize, type WheelFinish, type TireType } from '../store/customizationStore';
import '../../styles/WheelsCustomizer.css';

const WHEEL_SIZES: WheelSize[] = [17, 18, 19, 20, 21, 22];

const WHEEL_FINISHES: { value: WheelFinish; label: string; description: string }[] = [
  { value: 'chrome', label: 'Chrome', description: 'High shine, classic look' },
  { value: 'matte_black', label: 'Matte Black', description: 'Modern, stealth appearance' },
  { value: 'polished', label: 'Polished', description: 'Bright, mirror-like finish' },
  { value: 'brushed', label: 'Brushed', description: 'Subtle, textured metal' },
];

const TIRE_TYPES: { value: TireType; label: string; description: string; price: number }[] = [
  { value: 'sport', label: 'Sport', description: 'Performance handling', price: 0 },
  { value: 'all_season', label: 'All-Season', description: 'Year-round versatility', price: 200 },
  { value: 'winter', label: 'Winter', description: 'Cold weather traction', price: 400 },
  { value: 'performance', label: 'Performance', description: 'Max grip & speed', price: 600 },
];

interface WheelDesignInfo {
  id: string;
  name: string;
  price: number;
  previewColor: string;
}

const SAMPLE_WHEEL_DESIGNS: WheelDesignInfo[] = [
  { id: 'sport_5spoke', name: '5-Spoke Sport', price: 1200, previewColor: '#666666' },
  { id: 'multi_spoke', name: 'Multi-Spoke', price: 1500, previewColor: '#888888' },
  { id: 'split_rim', name: 'Split Rim', price: 1800, previewColor: '#aaaaaa' },
  { id: 'dual_5spoke', name: 'Dual 5-Spoke', price: 1400, previewColor: '#777777' },
  { id: 'star_design', name: 'Star Design', price: 1600, previewColor: '#999999' },
  { id: 'aero', name: 'Aero Blade', price: 2000, previewColor: '#555555' },
];

interface WheelsCustomizerProps {
  onPriceChange?: (price: number) => void;
}

function WheelsCustomizer({ onPriceChange }: WheelsCustomizerProps) {
  const { wheels, setWheels } = useCustomizationStore();
  const [selectedDesign, setSelectedDesign] = useState(wheels.designId);

  const handleDesignChange = useCallback((designId: string) => {
    setSelectedDesign(designId);
    setWheels({ designId });
  }, [setWheels]);

  const handleSizeChange = useCallback((size: WheelSize) => {
    setWheels({ size });
  }, [setWheels]);

  const handleFinishChange = useCallback((finish: WheelFinish) => {
    setWheels({ finish });
  }, [setWheels]);

  const handleTireChange = useCallback((tire: TireType) => {
    setWheels({ tire });
  }, [setWheels]);

  const handleReset = useCallback(() => {
    setWheels({
      designId: 'sport_5spoke',
      size: 19,
      finish: 'polished',
      tire: 'sport',
    });
    setSelectedDesign('sport_5spoke');
  }, [setWheels]);

  const currentDesign = SAMPLE_WHEEL_DESIGNS.find(d => d.id === selectedDesign) || SAMPLE_WHEEL_DESIGNS[0];
  const currentTire = TIRE_TYPES.find(t => t.value === wheels.tire);

  const basePrice = currentDesign.price;
  const sizeMultiplier = 1 + (wheels.size - 17) * 0.15;
  const tirePrice = currentTire?.price || 0;
  const totalPrice = (basePrice * sizeMultiplier) + tirePrice;

  if (onPriceChange) {
    onPriceChange(totalPrice);
  }

  const wheelSpecs = {
    offset: `${(wheels.size * 0.5).toFixed(1)}mm`,
    boltPattern: '5x120',
    centerBore: '72.6mm',
    weight: `${(18 - wheels.size * 0.3).toFixed(1)} lbs`,
  };

  return (
    <div className="wheels-customizer">
      <div className="customizer-section">
        <h3>Wheel Design</h3>
        <div className="wheel-designs-grid">
          {SAMPLE_WHEEL_DESIGNS.map((design) => (
            <button
              key={design.id}
              className={`wheel-design-card ${selectedDesign === design.id ? 'active' : ''}`}
              onClick={() => handleDesignChange(design.id)}
            >
              <div
                className="wheel-preview"
                style={{
                  background: `conic-gradient(from 0deg, ${design.previewColor} 0%, #333 25%, ${design.previewColor} 50%, #333 75%, ${design.previewColor} 100%)`,
                }}
              />
              <span className="wheel-name">{design.name}</span>
              <span className="wheel-price">+${design.price.toLocaleString()}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="customizer-section">
        <h3>Wheel Size</h3>
        <div className="size-selector">
          {WHEEL_SIZES.map((size) => (
            <button
              key={size}
              className={`size-btn ${wheels.size === size ? 'active' : ''}`}
              onClick={() => handleSizeChange(size)}
            >
              <span className="size-value">{size}"</span>
              <span className="size-label">
                {size <= 18 ? 'Street' : size <= 20 ? 'Sport' : 'Track'}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="customizer-section">
        <h3>Wheel Finish</h3>
        <div className="finish-grid">
          {WHEEL_FINISHES.map((finish) => (
            <button
              key={finish.value}
              className={`finish-card ${wheels.finish === finish.value ? 'active' : ''}`}
              onClick={() => handleFinishChange(finish.value)}
            >
              <div
                className="finish-preview"
                style={{
                  background: finish.value === 'chrome' ? 'linear-gradient(135deg, #fff, #ccc)' :
                             finish.value === 'matte_black' ? '#1a1a1a' :
                             finish.value === 'polished' ? 'linear-gradient(135deg, #ddd, #fff, #ddd)' :
                             'repeating-linear-gradient(45deg, #666, #666 2px, #888 2px, #888 4px)',
                }}
              />
              <span className="finish-label">{finish.label}</span>
              <span className="finish-desc">{finish.description}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="customizer-section">
        <h3>Tire Type</h3>
        <div className="tire-options">
          {TIRE_TYPES.map((tire) => (
            <button
              key={tire.value}
              className={`tire-btn ${wheels.tire === tire.value ? 'active' : ''}`}
              onClick={() => handleTireChange(tire.value)}
            >
              <span className="tire-label">{tire.label}</span>
              <span className="tire-desc">{tire.description}</span>
              {tire.price > 0 && <span className="tire-price">+${tire.price}</span>}
            </button>
          ))}
        </div>
      </div>

      <div className="customizer-section">
        <div className="wheel-specs">
          <div className="spec-item">
            <span className="spec-label">Offset</span>
            <span className="spec-value">{wheelSpecs.offset}</span>
          </div>
          <div className="spec-item">
            <span className="spec-label">Bolt Pattern</span>
            <span className="spec-value">{wheelSpecs.boltPattern}</span>
          </div>
          <div className="spec-item">
            <span className="spec-label">Center Bore</span>
            <span className="spec-value">{wheelSpecs.centerBore}</span>
          </div>
          <div className="spec-item">
            <span className="spec-label">Weight (each)</span>
            <span className="spec-value">{wheelSpecs.weight}</span>
          </div>
        </div>
      </div>

      <div className="customizer-section">
        <div className="price-summary">
          <div className="price-row">
            <span>Wheel Design:</span>
            <span>${basePrice.toLocaleString()}</span>
          </div>
          <div className="price-row">
            <span>Size ({wheels.size}"):</span>
            <span>${(basePrice * sizeMultiplier - basePrice).toLocaleString()}</span>
          </div>
          <div className="price-row">
            <span>Tires:</span>
            <span>${tirePrice.toLocaleString()}</span>
          </div>
          <div className="price-row total">
            <span>Wheels Total:</span>
            <span>${totalPrice.toLocaleString()}</span>
          </div>
        </div>
        <button className="reset-btn" onClick={handleReset}>
          Reset to Default
        </button>
      </div>
    </div>
  );
}

export default WheelsCustomizer;
