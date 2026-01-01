import { useState } from 'react';
import { useCustomizationStore, type WheelCustomization } from '../store/customizationStore';
import './WheelsCustomizer.css';

interface WheelOption {
  id: string;
  name: string;
  design: string;
  imageUrl?: string;
  price: number;
}

const WHEEL_DESIGNS: WheelOption[] = [
  { id: 'sport-5spoke', name: 'Sport 5-Spoke', design: '5-spoke-sport', price: 800 },
  { id: 'performance-10spoke', name: 'Performance 10-Spoke', design: '10-spoke-performance', price: 1200 },
  { id: 'luxury-split', name: 'Luxury Split-Spoke', design: 'split-spoke-luxury', price: 1500 },
  { id: 'racing-multi', name: 'Racing Multi-Spoke', design: 'multi-spoke-racing', price: 1000 },
  { id: 'classic-mesh', name: 'Classic Mesh', design: 'mesh-classic', price: 900 },
];

const WHEEL_SIZES = [
  { size: '17', label: '17"', price: 0 },
  { size: '18', label: '18"', price: 200 },
  { size: '19', label: '19"', price: 400 },
  { size: '20', label: '20"', price: 600 },
];

const WHEEL_FINISHES = [
  { value: 'chrome', label: 'Chrome', price: 200 },
  { value: 'matte_black', label: 'Matte Black', price: 0 },
  { value: 'polished', label: 'Polished Aluminum', price: 150 },
  { value: 'gunmetal', label: 'Gunmetal', price: 100 },
  { value: 'bronze', label: 'Bronze', price: 100 },
];

const TIRE_TYPES = [
  { value: 'sport', label: 'Sport Performance', price: 400 },
  { value: 'all-season', label: 'All-Season', price: 200 },
  { value: 'winter', label: 'Winter', price: 300 },
  { value: 'max-performance', label: 'Max Performance', price: 600 },
];

const WHEEL_SPECS = {
  '17': { offset: '+35', boltPattern: '5x114.3', width: '8.5J' },
  '18': { offset: '+35', boltPattern: '5x114.3', width: '9.0J' },
  '19': { offset: '+30', boltPattern: '5x114.3', width: '9.5J' },
  '20': { offset: '+30', boltPattern: '5x114.3', width: '10.0J' },
};

export default function WheelsCustomizer() {
  const { wheels, setWheels } = useCustomizationStore();
  const [selectedDesign, setSelectedDesign] = useState<string>(wheels?.designId || WHEEL_DESIGNS[0].id);
  const [selectedSize, setSelectedSize] = useState<string>(wheels?.size || '18');
  const [selectedFinish, setSelectedFinish] = useState<string>(wheels?.finish || 'matte_black');
  const [selectedTire, setSelectedTire] = useState<string>(wheels?.tireType || 'all-season');

  const handleApplyWheels = () => {
    const design = WHEEL_DESIGNS.find(d => d.id === selectedDesign)!;
    const specs = WHEEL_SPECS[selectedSize as keyof typeof WHEEL_SPECS];
    
    const newWheels: WheelCustomization = {
      designId: selectedDesign,
      size: selectedSize,
      color: selectedFinish === 'matte_black' ? '#000000' : 
             selectedFinish === 'chrome' ? '#c0c0c0' :
             selectedFinish === 'gunmetal' ? '#2c2c2c' :
             selectedFinish === 'bronze' ? '#cd7f32' : '#d3d3d3',
      finish: selectedFinish,
      tireType: selectedTire,
      modelUrl: `/models/wheels/${selectedDesign}_${selectedSize}.glb`,
    };

    setWheels(newWheels);
  };

  const calculateTotalPrice = () => {
    const designPrice = WHEEL_DESIGNS.find(d => d.id === selectedDesign)?.price || 0;
    const sizePrice = WHEEL_SIZES.find(s => s.size === selectedSize)?.price || 0;
    const finishPrice = WHEEL_FINISHES.find(f => f.value === selectedFinish)?.price || 0;
    const tirePrice = TIRE_TYPES.find(t => t.value === selectedTire)?.price || 0;
    
    return designPrice + sizePrice + finishPrice + tirePrice;
  };

  const specs = WHEEL_SPECS[selectedSize as keyof typeof WHEEL_SPECS];

  return (
    <div className="wheels-customizer">
      <div className="wheel-design-selector">
        <label>Wheel Design:</label>
        <div className="design-grid">
          {WHEEL_DESIGNS.map(design => (
            <button
              key={design.id}
              className={`design-option ${selectedDesign === design.id ? 'selected' : ''}`}
              onClick={() => setSelectedDesign(design.id)}
            >
              <div className="design-image">
                <div className="wheel-preview-placeholder">
                  {design.name.substring(0, 2)}
                </div>
              </div>
              <div className="design-info">
                <span className="design-name">{design.name}</span>
                <span className="design-price">+${design.price}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="size-selector">
        <label>Wheel Size:</label>
        <div className="size-buttons">
          {WHEEL_SIZES.map(size => (
            <button
              key={size.size}
              className={`size-btn ${selectedSize === size.size ? 'active' : ''}`}
              onClick={() => setSelectedSize(size.size)}
            >
              {size.label}
              {size.price > 0 && <span className="size-price">+${size.price}</span>}
            </button>
          ))}
        </div>
      </div>

      <div className="finish-selector">
        <label>Wheel Finish:</label>
        <select
          value={selectedFinish}
          onChange={(e) => setSelectedFinish(e.target.value)}
          className="finish-select"
        >
          {WHEEL_FINISHES.map(finish => (
            <option key={finish.value} value={finish.value}>
              {finish.label} {finish.price > 0 ? `+$${finish.price}` : ''}
            </option>
          ))}
        </select>
      </div>

      <div className="tire-selector">
        <label>Tire Type:</label>
        <select
          value={selectedTire}
          onChange={(e) => setSelectedTire(e.target.value)}
          className="tire-select"
        >
          {TIRE_TYPES.map(tire => (
            <option key={tire.value} value={tire.value}>
              {tire.label} +${tire.price}
            </option>
          ))}
        </select>
      </div>

      <div className="wheel-specs">
        <h4>Wheel Specifications:</h4>
        <div className="spec-grid">
          <div className="spec-item">
            <span className="spec-label">Offset (ET):</span>
            <span className="spec-value">{specs.offset}</span>
          </div>
          <div className="spec-item">
            <span className="spec-label">Bolt Pattern:</span>
            <span className="spec-value">{specs.boltPattern}</span>
          </div>
          <div className="spec-item">
            <span className="spec-label">Width:</span>
            <span className="spec-value">{specs.width}</span>
          </div>
          <div className="spec-item">
            <span className="spec-label">Size:</span>
            <span className="spec-value">{selectedSize}"</span>
          </div>
        </div>
      </div>

      <button onClick={handleApplyWheels} className="apply-wheels-btn">
        Apply Wheels
      </button>

      {wheels && (
        <div className="current-selection">
          <h4>Current Selection:</h4>
          <p className="selection-summary">
            {WHEEL_DESIGNS.find(d => d.id === wheels.designId)?.name} - {wheels.size}" - {wheels.finish}
          </p>
        </div>
      )}
    </div>
  );
}