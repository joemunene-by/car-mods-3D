import { useMemo } from 'react';
import { useCustomizationStore } from '../store/customizationStore';
import '../../styles/PriceDisplay.css';

interface PriceDisplayProps {
  basePrice: number;
  paintPrice: number;
  wheelsPrice: number;
  bodyKitPrice: number;
  spoilerPrice: number;
  decalsPrice: number;
  onSave?: () => void;
  onLoad?: () => void;
}

function PriceDisplay({
  basePrice,
  paintPrice,
  wheelsPrice,
  bodyKitPrice,
  spoilerPrice,
  decalsPrice,
  onSave,
  onLoad,
}: PriceDisplayProps) {
  const { decals, reset } = useCustomizationStore();

  const customizationTotal = useMemo(() => {
    return paintPrice + wheelsPrice + bodyKitPrice + spoilerPrice + decalsPrice;
  }, [paintPrice, wheelsPrice, bodyKitPrice, spoilerPrice, decalsPrice]);

  const totalPrice = useMemo(() => {
    return basePrice + customizationTotal;
  }, [basePrice, customizationTotal]);

  return (
    <div className="price-display">
      <div className="price-header">
        <h3>Price Breakdown</h3>
      </div>

      <div className="price-base">
        <span className="price-label">Base Price</span>
        <span className="price-value">${basePrice.toLocaleString()}</span>
      </div>

      <div className="customizations-list">
        <div className="price-item">
          <span className="item-label">Paint</span>
          <span className="item-value">${paintPrice.toLocaleString()}</span>
        </div>
        <div className="price-item">
          <span className="item-label">Wheels ({wheelsPrice > 0 ? 'Customized' : 'Stock'})</span>
          <span className="item-value">${wheelsPrice.toLocaleString()}</span>
        </div>
        {bodyKitPrice > 0 && (
          <div className="price-item">
            <span className="item-label">Body Kit</span>
            <span className="item-value">${bodyKitPrice.toLocaleString()}</span>
          </div>
        )}
        {spoilerPrice > 0 && (
          <div className="price-item">
            <span className="item-label">Spoiler</span>
            <span className="item-value">${spoilerPrice.toLocaleString()}</span>
          </div>
        )}
        {decals.length > 0 && (
          <div className="price-item">
            <span className="item-label">Decals ({decals.length})</span>
            <span className="item-value">${decalsPrice.toLocaleString()}</span>
          </div>
        )}
      </div>

      <div className="price-divider" />

      <div className="price-total">
        <span className="total-label">Total Price</span>
        <span className="total-value">${totalPrice.toLocaleString()}</span>
      </div>

      <div className="price-addons">
        <span className="addons-label">Customizations: ${customizationTotal.toLocaleString()}</span>
      </div>

      <div className="price-actions">
        <button className="save-btn" onClick={onSave}>
          Save Build
        </button>
        <button className="load-btn" onClick={onLoad}>
          Load Build
        </button>
      </div>

      <div className="price-reset">
        <button className="reset-full-btn" onClick={reset}>
          Reset All Customizations
        </button>
      </div>
    </div>
  );
}

export default PriceDisplay;
