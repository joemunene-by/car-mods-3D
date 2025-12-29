import { useState, useMemo, useCallback } from 'react';
import { useCustomizationStore } from '../store/customizationStore';
import { useCustomizations, CustomizationOption } from '../hooks/useCustomizations';
import PaintCustomizer from './customizers/PaintCustomizer';
import WheelsCustomizer from './customizers/WheelsCustomizer';
import BodyKitCustomizer from './customizers/BodyKitCustomizer';
import SpoilerCustomizer from './customizers/SpoilerCustomizer';
import DecalsCustomizer from './customizers/DecalsCustomizer';
import '../styles/Customizer.css';

interface CustomizerPanelProps {
  carId: string;
  carName: string;
  basePrice: number;
  onSave?: () => void;
}

type SectionKey = 'paint' | 'wheels' | 'bodyKit' | 'spoiler' | 'decals';

export default function CustomizerPanel({ carId, carName, basePrice, onSave }: CustomizerPanelProps) {
  const [expandedSections, setExpandedSections] = useState<Set<SectionKey>>(new Set(['paint']));
  const { options } = useCustomizations(carId);

  const {
    paint, wheels, bodyKit, spoiler, decals,
    undo, redo,
    undoStack, redoStack,
    resetAll, resetPaint, resetWheels, resetBodyKit, resetSpoiler, clearDecals,
  } = useCustomizationStore();

  const customizationPrice = useMemo(() => {
    let total = 0;
    return total;
  }, [paint, wheels, bodyKit, spoiler, decals]);

  const totalPrice = basePrice + customizationPrice;

  const toggleSection = useCallback((section: SectionKey) => {
    setExpandedSections(prev => {
      const next = new Set(prev);
      if (next.has(section)) {
        next.delete(section);
      } else {
        next.add(section);
      }
      return next;
    });
  }, []);

  const handleResetAll = useCallback(() => {
    if (window.confirm('Are you sure you want to reset all customizations?')) {
      resetAll(true);
    }
  }, [resetAll]);

  const groupOptionsByCategory = useMemo(() => {
    const groups: Record<string, CustomizationOption[]> = {};
    options.forEach(option => {
      if (!groups[option.category]) {
        groups[option.category] = [];
      }
      groups[option.category].push(option);
    });
    return groups;
  }, [options]);

  return (
    <div className="customization-panel">
      <div className="customization-header">
        <h2>Customization</h2>
        <p className="car-name">{carName}</p>
      </div>

      <div className="history-controls">
        <button
          className="history-btn"
          onClick={undo}
          disabled={undoStack.length === 0}
          title="Undo"
        >
          ↩ Undo
        </button>
        <button
          className="history-btn"
          onClick={redo}
          disabled={redoStack.length === 0}
          title="Redo"
        >
          ↪ Redo
        </button>
        <button
          className="history-btn"
          onClick={handleResetAll}
          title="Reset All"
        >
          🔄 Reset All
        </button>
      </div>

      <div className="customization-sections">
        <div className="customization-section">
          <button
            className={`customization-section-header ${expandedSections.has('paint') ? 'expanded' : ''}`}
            onClick={() => toggleSection('paint')}
          >
            <h3><span className="icon">🎨</span> Paint</h3>
            <span className="expand-icon">▼</span>
          </button>
          <div className="customization-section-content">
            <PaintCustomizer
              options={groupOptionsByCategory['PAINT'] || []}
              color={paint.color}
              finish={paint.finish}
              zone={paint.zone}
              onColorChange={(color) => useCustomizationStore.getState().setPaintColor(color, true)}
              onFinishChange={(finish) => useCustomizationStore.getState().setPaintFinish(finish, true)}
              onZoneChange={(zone) => useCustomizationStore.getState().setPaintZone(zone, true)}
              onReset={resetPaint}
            />
          </div>
        </div>

        <div className="customization-section">
          <button
            className={`customization-section-header ${expandedSections.has('wheels') ? 'expanded' : ''}`}
            onClick={() => toggleSection('wheels')}
          >
            <h3><span className="icon">⚙️</span> Wheels</h3>
            <span className="expand-icon">▼</span>
          </button>
          <div className="customization-section-content">
            <WheelsCustomizer
              options={groupOptionsByCategory['WHEELS'] || []}
              designId={wheels.designId}
              size={wheels.size}
              finish={wheels.finish}
              tireType={wheels.tireType}
              onDesignChange={(id) => useCustomizationStore.getState().setWheelDesign(id, true)}
              onSizeChange={(size) => useCustomizationStore.getState().setWheelSize(size, true)}
              onFinishChange={(finish) => useCustomizationStore.getState().setWheelFinish(finish, true)}
              onTireTypeChange={(type) => useCustomizationStore.getState().setTireType(type, true)}
              onReset={resetWheels}
            />
          </div>
        </div>

        <div className="customization-section">
          <button
            className={`customization-section-header ${expandedSections.has('bodyKit') ? 'expanded' : ''}`}
            onClick={() => toggleSection('bodyKit')}
          >
            <h3><span className="icon">🚗</span> Body Kit</h3>
            <span className="expand-icon">▼</span>
          </button>
          <div className="customization-section-content">
            <BodyKitCustomizer
              options={groupOptionsByCategory['BODY_KIT'] || []}
              kitId={bodyKit.kitId}
              pieces={bodyKit.pieces}
              onKitChange={(id) => useCustomizationStore.getState().setBodyKitDesign(id, true)}
              onPieceToggle={(piece, enabled) => useCustomizationStore.getState().toggleBodyKitPiece(piece, enabled, true)}
              onReset={resetBodyKit}
            />
          </div>
        </div>

        <div className="customization-section">
          <button
            className={`customization-section-header ${expandedSections.has('spoiler') ? 'expanded' : ''}`}
            onClick={() => toggleSection('spoiler')}
          >
            <h3><span className="icon">🏁</span> Spoiler</h3>
            <span className="expand-icon">▼</span>
          </button>
          <div className="customization-section-content">
            <SpoilerCustomizer
              options={groupOptionsByCategory['SPOILER'] || []}
              designId={spoiler.designId}
              type={spoiler.type}
              material={spoiler.material}
              position={spoiler.position}
              angle={spoiler.angle}
              height={spoiler.height}
              onDesignChange={(id) => useCustomizationStore.getState().setSpoilerDesign(id, true)}
              onTypeChange={(type) => useCustomizationStore.getState().setSpoilerType(type, true)}
              onMaterialChange={(material) => useCustomizationStore.getState().setSpoilerMaterial(material, true)}
              onPositionChange={(position) => useCustomizationStore.getState().setSpoilerPosition(position, true)}
              onAngleChange={(angle) => useCustomizationStore.getState().setSpoilerAngle(angle, true)}
              onHeightChange={(height) => useCustomizationStore.getState().setSpoilerHeight(height, true)}
              onReset={resetSpoiler}
            />
          </div>
        </div>

        <div className="customization-section">
          <button
            className={`customization-section-header ${expandedSections.has('decals') ? 'expanded' : ''}`}
            onClick={() => toggleSection('decals')}
          >
            <h3><span className="icon">✨</span> Decals</h3>
            <span className="expand-icon">▼</span>
          </button>
          <div className="customization-section-content">
            <DecalsCustomizer
              options={groupOptionsByCategory['DECAL'] || []}
              decals={decals}
              onAddDecal={(decal) => useCustomizationStore.getState().addDecal(decal, true)}
              onUpdateDecal={(id, updates) => useCustomizationStore.getState().updateDecal(id, updates, true)}
              onRemoveDecal={(id) => useCustomizationStore.getState().removeDecal(id, true)}
              onClearAll={clearDecals}
            />
          </div>
        </div>
      </div>

      <div className="price-summary">
        <div className="price-row">
          <span className="label">Base Price</span>
          <span className="value">${basePrice.toLocaleString()}</span>
        </div>
        <div className="price-row">
          <span className="label">Customizations</span>
          <span className="value">${customizationPrice.toLocaleString()}</span>
        </div>
        <div className="price-row total">
          <span className="label">Total</span>
          <span className="value">${totalPrice.toLocaleString()}</span>
        </div>
        <div className="action-buttons">
          <button className="primary-btn" onClick={onSave}>
            Save Configuration
          </button>
          <button className="secondary-btn">
            Reset
          </button>
        </div>
      </div>
    </div>
  );
}
