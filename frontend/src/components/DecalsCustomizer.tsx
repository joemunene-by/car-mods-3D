import { useState, useCallback, useMemo } from 'react';
import { useCustomizationStore, type DecalPlacement, type DecalSettings } from '../store/customizationStore';
import '../../styles/DecalsCustomizer.css';

const DECAL_DESIGNS = [
  { id: 'racing_stripe_center', name: 'Center Racing Stripe', type: 'stripe' as const, price: 150, defaultColor: '#ffffff', width: 100, height: 1000, svgPath: 'M -20 0 L 20 0 L 20 500 L -20 500 Z' },
  { id: 'racing_stripe_dual', name: 'Dual Racing Stripes', type: 'stripe' as const, price: 200, defaultColor: '#ffffff', width: 200, height: 1000, svgPath: 'M -80 0 L -40 0 L -40 500 L -80 500 Z M 40 0 L 80 0 L 80 500 L 40 500 Z' },
  { id: 'hood_stripe', name: 'Hood Stripe', type: 'stripe' as const, price: 120, defaultColor: '#000000', width: 80, height: 400, svgPath: 'M -15 0 L 15 0 L 15 200 L -15 200 Z' },
  { id: 'number_11', name: 'Racing Number 11', type: 'number' as const, price: 80, defaultColor: '#ff0000', width: 150, height: 150 },
  { id: 'number_7', name: 'Racing Number 7', type: 'number' as const, price: 80, defaultColor: '#0066cc', width: 150, height: 150 },
  { id: 'number_99', name: 'Racing Number 99', type: 'number' as const, price: 80, defaultColor: '#ffcc00', width: 150, height: 150 },
  { id: 'flame_graphic', name: 'Flame Graphic', type: 'graphic' as const, price: 300, defaultColor: '#ff6600', width: 400, height: 200 },
  { id: 'checker_flag', name: 'Checker Flag', type: 'graphic' as const, price: 180, defaultColor: '#000000', width: 300, height: 150 },
  { id: 'carbon_fiber_accent', name: 'Carbon Fiber Accent', type: 'graphic' as const, price: 250, defaultColor: '#1a1a1a', width: 500, height: 100 },
  { id: 'star_logo', name: 'Star Logo', type: 'logo' as const, price: 100, defaultColor: '#ffd700', width: 150, height: 150, svgPath: 'M 0 -50 L 12 -15 L 47 -15 L 18 6 L 29 40 L 0 20 L -29 40 L -18 6 L -47 -15 L -12 -15 Z' },
  { id: 'shield_logo', name: 'Shield Emblem', type: 'logo' as const, price: 120, defaultColor: '#c0c0c0', width: 150, height: 180, svgPath: 'M 0 -40 Q 50 -40 50 0 Q 50 50 0 90 Q -50 50 -50 0 Q -50 -40 0 -40 Z' },
];

const DECAL_PLACEMENTS: { id: DecalPlacement; name: string; meshName: string }[] = [
  { id: 'hood', name: 'Hood', meshName: 'hood' },
  { id: 'roof', name: 'Roof', meshName: 'roof' },
  { id: 'trunk', name: 'Trunk', meshName: 'trunk' },
  { id: 'door_left', name: 'Left Door', meshName: 'door_left' },
  { id: 'door_right', name: 'Right Door', meshName: 'door_right' },
  { id: 'quarter_left', name: 'Left Quarter', meshName: 'quarter_left' },
  { id: 'quarter_right', name: 'Right Quarter', meshName: 'quarter_right' },
  { id: 'stripe_full', name: 'Full Length Stripe', meshName: 'body' },
];

interface DecalsCustomizerProps {
  onPriceChange?: (price: number) => void;
  onDecalAdd?: (decal: { designId: string; placement: DecalPlacement; color: string; opacity: number; scale: number; rotation: number }) => void;
  onDecalRemove?: (decalId: string) => void;
}

function DecalsCustomizer({ onPriceChange, onDecalAdd, onDecalRemove }: DecalsCustomizerProps) {
  const { decals, addDecal, updateDecal, removeDecal } = useCustomizationStore();
  const [selectedDesign, setSelectedDesign] = useState<string | null>(null);
  const [selectedPlacement, setSelectedPlacement] = useState<DecalPlacement>('hood');
  const [selectedColor, setSelectedColor] = useState('#ffffff');
  const [opacity, setOpacity] = useState(1);
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');

  const handleApplyDecal = useCallback(() => {
    if (!selectedDesign) return;
    
    const design = DECAL_DESIGNS.find(d => d.id === selectedDesign);
    if (!design) return;

    addDecal({
      designId: selectedDesign,
      placement: selectedPlacement,
      color: selectedColor,
      opacity,
      scale,
      rotation,
      offsetX: 0,
      offsetY: 0,
    });

    if (onDecalAdd) {
      onDecalAdd({
        designId: selectedDesign,
        placement: selectedPlacement,
        color: selectedColor,
        opacity,
        scale,
        rotation,
      });
    }

    setSelectedDesign(null);
  }, [selectedDesign, selectedPlacement, selectedColor, opacity, scale, rotation, addDecal, onDecalAdd]);

  const handleRemoveDecal = useCallback((id: string) => {
    removeDecal(id);
    if (onDecalRemove) {
      onDecalRemove(id);
    }
  }, [removeDecal, onDecalRemove]);

  const handleUpdateDecal = useCallback((id: string, updates: Partial<DecalSettings>) => {
    updateDecal(id, updates);
  }, [updateDecal]);

  const handleReset = useCallback(() => {
    decals.forEach((d: DecalSettings) => removeDecal(d.id));
  }, [decals, removeDecal]);

  const filteredDesigns = useMemo(() => {
    return DECAL_DESIGNS.filter(design => {
      const matchesSearch = design.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = filterType === 'all' || design.type === filterType;
      return matchesSearch && matchesType;
    });
  }, [searchQuery, filterType]);

  const totalPrice = useMemo(() => {
    return decals.reduce((sum: number, decal: DecalSettings) => {
      const design = DECAL_DESIGNS.find(d => d.id === decal.designId);
      return sum + (design?.price || 0) * decal.opacity;
    }, 0);
  }, [decals]);

  const selectedDesignData = selectedDesign ? DECAL_DESIGNS.find(d => d.id === selectedDesign) : null;

  if (onPriceChange) onPriceChange(totalPrice);

  return (
    <div className="decals-customizer">
      <div className="customizer-section">
        <h3>Decal Library</h3>
        
        <div className="decal-filters">
          <input
            type="text"
            placeholder="Search decals..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Types</option>
            <option value="stripe">Stripes</option>
            <option value="number">Numbers</option>
            <option value="graphic">Graphics</option>
            <option value="logo">Logos</option>
          </select>
        </div>

        <div className="decal-grid">
          {filteredDesigns.map((design) => (
            <button
              key={design.id}
              className={`decal-card ${selectedDesign === design.id ? 'active' : ''}`}
              onClick={() => {
                setSelectedDesign(design.id);
                setSelectedColor(design.defaultColor);
              }}
            >
              <div
                className="decal-preview"
                style={{
                  backgroundColor: design.type === 'stripe' ? '#222' : '#f0f0f0',
                }}
              >
                {design.type === 'stripe' && (
                  <div
                    className="stripe-preview"
                    style={{
                      backgroundColor: design.defaultColor,
                      width: design.id.includes('dual') ? '60%' : '30%',
                    }}
                  />
                )}
                {design.type === 'number' && (
                  <span className="number-preview">{design.name.split(' ')[2]}</span>
                )}
                {design.type === 'graphic' && (
                  <span className="graphic-preview">★</span>
                )}
                {design.type === 'logo' && (
                  <span className="logo-preview">◆</span>
                )}
              </div>
              <span className="decal-name">{design.name}</span>
              <span className="decal-price">+${design.price}</span>
            </button>
          ))}
        </div>
      </div>

      {selectedDesign && selectedDesignData && (
        <div className="customizer-section">
          <h3>Configure Decal</h3>
          
          <div className="config-row">
            <label>Placement:</label>
            <select
              value={selectedPlacement}
              onChange={(e) => setSelectedPlacement(e.target.value as DecalPlacement)}
              className="config-select"
            >
              {DECAL_PLACEMENTS.map((placement) => (
                <option key={placement.id} value={placement.id}>
                  {placement.name}
                </option>
              ))}
            </select>
          </div>

          <div className="config-row">
            <label>Color:</label>
            <div className="color-config">
              <input
                type="color"
                value={selectedColor}
                onChange={(e) => setSelectedColor(e.target.value)}
                className="color-input"
              />
              <input
                type="text"
                value={selectedColor}
                onChange={(e) => setSelectedColor(e.target.value)}
                className="hex-input"
                maxLength={7}
              />
            </div>
          </div>

          <div className="config-row">
            <label>Opacity: {Math.round(opacity * 100)}%</label>
            <input
              type="range"
              min="0.1"
              max="1"
              step="0.1"
              value={opacity}
              onChange={(e) => setOpacity(parseFloat(e.target.value))}
              className="slider"
            />
          </div>

          <div className="config-row">
            <label>Scale: {scale.toFixed(1)}x</label>
            <input
              type="range"
              min="0.5"
              max="2"
              step="0.1"
              value={scale}
              onChange={(e) => setScale(parseFloat(e.target.value))}
              className="slider"
            />
          </div>

          <div className="config-row">
            <label>Rotation: {rotation}°</label>
            <input
              type="range"
              min="-180"
              max="180"
              step="15"
              value={rotation}
              onChange={(e) => setRotation(parseInt(e.target.value))}
              className="slider"
            />
          </div>

          <button className="apply-btn" onClick={handleApplyDecal}>
            Apply Decal
          </button>
        </div>
      )}

      {decals.length > 0 && (
        <div className="customizer-section">
          <h3>Applied Decals ({decals.length})</h3>
          <div className="applied-decals">
            {decals.map((decal: DecalSettings) => {
              const design = DECAL_DESIGNS.find(d => d.id === decal.designId);
              return (
                <div key={decal.id} className="applied-decal-item">
                  <div className="decal-info">
                    <span className="decal-name">{design?.name || decal.designId}</span>
                    <span className="decal-placement">{decal.placement}</span>
                  </div>
                  <div className="decal-controls">
                    <input
                      type="color"
                      value={decal.color}
                      onChange={(e) => handleUpdateDecal(decal.id, { color: e.target.value })}
                      className="mini-color-input"
                    />
                    <input
                      type="range"
                      min="0.1"
                      max="1"
                      step="0.1"
                      value={decal.opacity}
                      onChange={(e) => handleUpdateDecal(decal.id, { opacity: parseFloat(e.target.value) })}
                      className="mini-slider"
                      title="Opacity"
                    />
                    <button
                      className="remove-decal-btn"
                      onClick={() => handleRemoveDecal(decal.id)}
                    >
                      ×
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="customizer-section">
        <div className="price-summary">
          <span>Decals Total:</span>
          <span className="price-value">${totalPrice.toLocaleString()}</span>
        </div>
        <button className="reset-btn" onClick={handleReset}>
          Remove All Decals
        </button>
      </div>
    </div>
  );
}

export default DecalsCustomizer;
