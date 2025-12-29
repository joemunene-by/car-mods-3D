import { useState, useCallback } from 'react';
import PaintCustomizer from './PaintCustomizer';
import WheelsCustomizer from './WheelsCustomizer';
import BodyKitCustomizer from './BodyKitCustomizer';
import SpoilerCustomizer from './SpoilerCustomizer';
import DecalsCustomizer from './DecalsCustomizer';
import PriceDisplay from './PriceDisplay';
import '../styles/CustomizationPanel.css';

export type CustomizationSection = 'paint' | 'wheels' | 'bodyKit' | 'spoiler' | 'decals';

interface CustomizationPanelProps {
  carBasePrice: number;
  onSave?: () => void;
  onLoad?: () => void;
}

function CustomizationPanel({ carBasePrice, onSave, onLoad }: CustomizationPanelProps) {
  const [activeSection, setActiveSection] = useState<CustomizationSection>('paint');
  const [expandedSections, setExpandedSections] = useState<Set<CustomizationSection>>(
    new Set(['paint'])
  );
  
  const [prices, setPrices] = useState({
    paint: 1200,
    wheels: 1400,
    bodyKit: 0,
    spoiler: 0,
    decals: 0,
  });

  const toggleSection = useCallback((section: CustomizationSection) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(section)) {
        next.delete(section);
      } else {
        next.add(section);
      }
      return next;
    });
  }, []);

  const handlePriceUpdate = useCallback((section: CustomizationSection, price: number) => {
    setPrices((prev) => ({ ...prev, [section]: price }));
  }, []);

  const totalCustomizationPrice = Object.values(prices).reduce((sum, p) => sum + p, 0);
  const totalPrice = carBasePrice + totalCustomizationPrice;

  const sections: { id: CustomizationSection; label: string; icon: string }[] = [
    { id: 'paint', label: 'Paint', icon: '🎨' },
    { id: 'wheels', label: 'Wheels', icon: '⚙️' },
    { id: 'bodyKit', label: 'Body Kit', icon: '🚗' },
    { id: 'spoiler', label: 'Spoiler', icon: '🪶' },
    { id: 'decals', label: 'Decals', icon: '✨' },
  ];

  return (
    <div className="customization-panel">
      <div className="panel-header">
        <h2>Customization</h2>
        <div className="total-price">
          <span className="price-label">Total</span>
          <span className="price-value">${totalPrice.toLocaleString()}</span>
        </div>
      </div>

      <div className="section-tabs">
        {sections.map((section) => (
          <button
            key={section.id}
            className={`section-tab ${activeSection === section.id ? 'active' : ''}`}
            onClick={() => {
              setActiveSection(section.id);
              toggleSection(section.id);
            }}
          >
            <span className="tab-icon">{section.icon}</span>
            <span className="tab-label">{section.label}</span>
          </button>
        ))}
      </div>

      <div className="panel-content">
        {activeSection === 'paint' && (
          <div className={`section-content ${expandedSections.has('paint') ? 'expanded' : ''}`}>
            <PaintCustomizer onPriceChange={(p) => handlePriceUpdate('paint', p)} />
          </div>
        )}

        {activeSection === 'wheels' && (
          <div className={`section-content ${expandedSections.has('wheels') ? 'expanded' : ''}`}>
            <WheelsCustomizer onPriceChange={(p) => handlePriceUpdate('wheels', p)} />
          </div>
        )}

        {activeSection === 'bodyKit' && (
          <div className={`section-content ${expandedSections.has('bodyKit') ? 'expanded' : ''}`}>
            <BodyKitCustomizer onPriceChange={(p) => handlePriceUpdate('bodyKit', p)} />
          </div>
        )}

        {activeSection === 'spoiler' && (
          <div className={`section-content ${expandedSections.has('spoiler') ? 'expanded' : ''}`}>
            <SpoilerCustomizer onPriceChange={(p) => handlePriceUpdate('spoiler', p)} />
          </div>
        )}

        {activeSection === 'decals' && (
          <div className={`section-content ${expandedSections.has('decals') ? 'expanded' : ''}`}>
            <DecalsCustomizer onPriceChange={(p) => handlePriceUpdate('decals', p)} />
          </div>
        )}
      </div>

      <div className="panel-footer">
        <PriceDisplay
          basePrice={carBasePrice}
          paintPrice={prices.paint}
          wheelsPrice={prices.wheels}
          bodyKitPrice={prices.bodyKit}
          spoilerPrice={prices.spoiler}
          decalsPrice={prices.decals}
          onSave={onSave}
          onLoad={onLoad}
        />
      </div>
    </div>
  );
}

export default CustomizationPanel;
