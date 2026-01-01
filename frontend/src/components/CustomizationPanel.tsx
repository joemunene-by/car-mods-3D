import { useState } from 'react';
import { useCustomizationStore } from '../store/customizationStore';
import PaintCustomizer from './PaintCustomizer';
import WheelsCustomizer from './WheelsCustomizer';
import BodyKitCustomizer from './BodyKitCustomizer';
import './CustomizationPanel.css';

export default function CustomizationPanel() {
  const { 
    activeSection, 
    setActiveSection, 
    totalPrice, 
    basePrice, 
    resetAll,
    getConfigurationData 
  } = useCustomizationStore();
  
  const [expandedSection, setExpandedSection] = useState<string>(activeSection);

  const sections = [
    { id: 'paint', label: 'Paint', icon: '🎨', component: PaintCustomizer },
    { id: 'wheels', label: 'Wheels', icon: '🔧', component: WheelsCustomizer },
    { id: 'body_kit', label: 'Body Kit', icon: '🏎️', component: BodyKitCustomizer },
  ];

  const handleSaveConfiguration = async () => {
    try {
      const configData = getConfigurationData();
      // TODO: Implement API call to save configuration
      console.log('Saving configuration:', configData);
    } catch (error) {
      console.error('Failed to save configuration:', error);
    }
  };

  const customizationPrice = totalPrice - basePrice;

  return (
    <div className="customization-panel">
      <div className="panel-header">
        <h2>Customize Your Car</h2>
        <div className="price-display">
          <div className="base-price">Base: ${basePrice.toLocaleString()}</div>
          <div className="customization-price">
            Customizations: ${customizationPrice > 0 ? '+' : ''}{customizationPrice.toLocaleString()}
          </div>
          <div className="total-price">Total: ${totalPrice.toLocaleString()}</div>
        </div>
      </div>

      <div className="sections-nav">
        {sections.map((section) => (
          <button
            key={section.id}
            className={`section-tab ${activeSection === section.id ? 'active' : ''}`}
            onClick={() => {
              setActiveSection(section.id as any);
              setExpandedSection(section.id);
            }}
          >
            <span className="section-icon">{section.icon}</span>
            <span className="section-label">{section.label}</span>
          </button>
        ))}
      </div>

      <div className="sections-content">
        {sections.map((section) => {
          const Component = section.component;
          const isExpanded = expandedSection === section.id;
          const isActive = activeSection === section.id;

          return (
            <div
              key={section.id}
              className={`section-panel ${isActive ? 'active' : ''} ${isExpanded ? 'expanded' : ''}`}
            >
              <div 
                className="section-header"
                onClick={() => setExpandedSection(isExpanded ? '' : section.id)}
              >
                <h3>
                  <span className="section-icon">{section.icon}</span>
                  {section.label}
                </h3>
                <span className={`expand-icon ${isExpanded ? 'expanded' : ''}`}>▼</span>
              </div>
              
              {isExpanded && (
                <div className="section-content">
                  <Component />
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="panel-actions">
        <button onClick={resetAll} className="reset-btn">
          Reset All Customizations
        </button>
        <button onClick={handleSaveConfiguration} className="save-btn">
          Save Configuration
        </button>
      </div>
    </div>
  );
}