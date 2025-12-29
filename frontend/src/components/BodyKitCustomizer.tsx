import { useState, useCallback } from 'react';
import { useCustomizationStore, type BodyKitPiece } from '../store/customizationStore';
import '../../styles/BodyKitCustomizer.css';

const BODY_KIT_PIECES: { value: BodyKitPiece; label: string; price: number }[] = [
  { value: 'front_bumper', label: 'Front Bumper', price: 800 },
  { value: 'rear_bumper', label: 'Rear Bumper', price: 700 },
  { value: 'side_skirts', label: 'Side Skirts', price: 500 },
  { value: 'splitter', label: 'Front Splitter', price: 400 },
  { value: 'diffuser', label: 'Rear Diffuser', price: 450 },
];

interface BodyKitInfo {
  id: string;
  name: string;
  price: number;
  description: string;
  pieces: BodyKitPiece[];
}

const SAMPLE_BODY_KITS: BodyKitInfo[] = [
  {
    id: 'sport_aero',
    name: 'Sport Aero Kit',
    price: 2500,
    description: 'Aggressive aerodynamic styling',
    pieces: ['front_bumper', 'rear_bumper', 'side_skirts'],
  },
  {
    id: 'track_demon',
    name: 'Track Demon Kit',
    price: 3500,
    description: 'Full race-inspired bodywork',
    pieces: ['front_bumper', 'rear_bumper', 'side_skirts', 'splitter', 'diffuser'],
  },
  {
    id: 'street_style',
    name: 'Street Style Kit',
    price: 1800,
    description: 'Subtle street enhancements',
    pieces: ['front_bumper', 'side_skirts'],
  },
  {
    id: 'widebody_extreme',
    name: 'Widebody Extreme',
    price: 5000,
    description: 'Maximum width and presence',
    pieces: ['front_bumper', 'rear_bumper', 'side_skirts', 'diffuser'],
  },
];

interface BodyKitCustomizerProps {
  onPriceChange?: (price: number) => void;
  onBodyKitChange?: (kitId: string | null, pieces: Record<string, boolean>) => void;
}

function BodyKitCustomizer({ onPriceChange, onBodyKitChange }: BodyKitCustomizerProps) {
  const { bodyKit, setBodyKit } = useCustomizationStore();
  const [selectedKit, setSelectedKit] = useState(bodyKit.kitId);
  const [selectedPieces, setSelectedPieces] = useState<Record<string, boolean>>(bodyKit.pieces);

  const handleKitSelect = useCallback((kitId: string | null) => {
    setSelectedKit(kitId);
    setBodyKit({ kitId });
    
    if (kitId === null) {
      setSelectedPieces({});
      if (onBodyKitChange) onBodyKitChange(null, {});
    } else {
      const kit = SAMPLE_BODY_KITS.find(k => k.id === kitId);
      if (kit) {
        const pieces: Record<string, boolean> = {};
        kit.pieces.forEach(piece => { pieces[piece] = true; });
        setSelectedPieces(pieces);
        if (onBodyKitChange) onBodyKitChange(kitId, pieces);
      }
    }
  }, [setBodyKit, onBodyKitChange]);

  const handlePieceToggle = useCallback((piece: BodyKitPiece) => {
    const newPieces = {
      ...selectedPieces,
      [piece]: !selectedPieces[piece],
    };
    setSelectedPieces(newPieces);
    setBodyKit({ pieces: newPieces });
    if (onBodyKitChange) onBodyKitChange(selectedKit, newPieces);
  }, [selectedPieces, setBodyKit, onBodyKitChange, selectedKit]);

  const handleReset = useCallback(() => {
    setSelectedKit(null);
    setSelectedPieces({});
    setBodyKit({ kitId: null, pieces: {} });
    if (onBodyKitChange) onBodyKitChange(null, {});
  }, [setBodyKit, onBodyKitChange]);

  const calculatePrice = useCallback(() => {
    let total = 0;
    Object.entries(selectedPieces).forEach(([piece, enabled]) => {
      if (enabled) {
        const pieceData = BODY_KIT_PIECES.find(p => p.value === piece);
        if (pieceData) total += pieceData.price;
      }
    });
    return total;
  }, [selectedPieces]);

  const totalPrice = calculatePrice();
  if (onPriceChange) onPriceChange(totalPrice);

  return (
    <div className="bodykit-customizer">
      <div className="customizer-section">
        <h3>Body Kit Selection</h3>
        <div className="bodykit-gallery">
          {SAMPLE_BODY_KITS.map((kit) => (
            <button
              key={kit.id}
              className={`bodykit-card ${selectedKit === kit.id ? 'active' : ''}`}
              onClick={() => handleKitSelect(kit.id)}
            >
              <div className="bodykit-preview">
                <div className="preview-placeholder">
                  <span>3D Preview</span>
                </div>
              </div>
              <div className="bodykit-info">
                <span className="bodykit-name">{kit.name}</span>
                <span className="bodykit-desc">{kit.description}</span>
                <span className="bodykit-pieces">
                  Includes: {kit.pieces.join(', ').replace(/_/g, ' ')}
                </span>
                <span className="bodykit-price">+${kit.price.toLocaleString()}</span>
              </div>
            </button>
          ))}
        </div>
        <button
          className="no-bodykit-btn"
          onClick={() => handleKitSelect(null)}
        >
          No Body Kit (Stock)
        </button>
      </div>

      {selectedKit && (
        <div className="customizer-section">
          <h3>Customize Pieces</h3>
          <p className="section-hint">Select which pieces to install</p>
          <div className="pieces-grid">
            {BODY_KIT_PIECES.map((piece) => {
              const isIncluded = SAMPLE_BODY_KITS.find(k => k.id === selectedKit)?.pieces.includes(piece.value);
              return (
                <button
                  key={piece.value}
                  className={`piece-btn ${selectedPieces[piece.value] ? 'active' : ''} ${!isIncluded ? 'disabled' : ''}`}
                  onClick={() => isIncluded && handlePieceToggle(piece.value)}
                  disabled={!isIncluded}
                >
                  <span className="piece-icon">
                    {piece.value.includes('front') ? '⬅' : 
                     piece.value.includes('rear') ? '➡' : 
                     piece.value.includes('side') ? '↔' : '⬡'}
                  </span>
                  <span className="piece-label">{piece.label}</span>
                  <span className="piece-price">+${piece.price}</span>
                  {!isIncluded && <span className="piece-not-included">Not in kit</span>}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div className="customizer-section">
        <div className="price-summary">
          <span>Body Kit Price:</span>
          <span className="price-value">${totalPrice.toLocaleString()}</span>
        </div>
        <button className="reset-btn" onClick={handleReset}>
          Reset to Default
        </button>
      </div>
    </div>
  );
}

export default BodyKitCustomizer;
