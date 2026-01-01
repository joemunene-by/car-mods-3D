import { useState } from 'react';
import { useCustomizationStore, type BodyKitPiece } from '../store/customizationStore';
import './BodyKitCustomizer.css';

interface BodyKitOption {
  id: string;
  name: string;
  pieceType: BodyKitPiece['pieceType'];
  material: string;
  price: number;
  modelUrl?: string;
  imageUrl?: string;
  compatibleWith: string[];
}

const BODY_KIT_OPTIONS: BodyKitOption[] = [
  {
    id: 'sport-front',
    name: 'Sport Front Bumper',
    pieceType: 'front_bumper',
    material: 'ABS Plastic',
    price: 800,
    modelUrl: '/models/bodykits/sport_front_bumper.glb',
    compatibleWith: ['all'],
  },
  {
    id: 'racing-front',
    name: 'Racing Front Bumper',
    pieceType: 'front_bumper',
    material: 'Carbon Fiber',
    price: 1500,
    modelUrl: '/models/bodykits/racing_front_bumper.glb',
    compatibleWith: ['sport', 'racing'],
  },
  {
    id: 'sport-rear',
    name: 'Sport Rear Bumper',
    pieceType: 'rear_bumper',
    material: 'ABS Plastic',
    price: 700,
    modelUrl: '/models/bodykits/sport_rear_bumper.glb',
    compatibleWith: ['all'],
  },
  {
    id: 'sport-skirts',
    name: 'Sport Side Skirts',
    pieceType: 'side_skirt',
    material: 'ABS Plastic',
    price: 600,
    modelUrl: '/models/bodykits/sport_side_skirts.glb',
    compatibleWith: ['all'],
  },
  {
    id: 'carbon-splitter',
    name: 'Carbon Fiber Splitter',
    pieceType: 'splitter',
    material: 'Carbon Fiber',
    price: 900,
    modelUrl: '/models/bodykits/carbon_splitter.glb',
    compatibleWith: ['sport', 'racing'],
  },
  {
    id: 'carbon-diffuser',
    name: 'Carbon Fiber Diffuser',
    pieceType: 'diffuser',
    material: 'Carbon Fiber',
    price: 1000,
    modelUrl: '/models/bodykits/carbon_diffuser.glb',
    compatibleWith: ['sport', 'racing'],
  },
];

const PIECE_TYPES = [
  { type: 'front_bumper' as const, name: 'Front Bumper' },
  { type: 'rear_bumper' as const, name: 'Rear Bumper' },
  { type: 'side_skirt' as const, name: 'Side Skirts' },
  { type: 'splitter' as const, name: 'Front Splitter' },
  { type: 'diffuser' as const, name: 'Rear Diffuser' },
];

export default function BodyKitCustomizer() {
  const { bodyKit, addBodyKitPiece, removeBodyKitPiece } = useCustomizationStore();
  const [selectedOptions, setSelectedOptions] = useState<{ [key: string]: string }>({});

  const handleSelectOption = (pieceType: BodyKitPiece['pieceType'], optionId: string) => {
    const option = BODY_KIT_OPTIONS.find(opt => opt.id === optionId)!;
    const piece: BodyKitPiece = {
      pieceType,
      optionId,
      modelUrl: option.modelUrl,
    };
    
    addBodyKitPiece(piece);
    setSelectedOptions(prev => ({ ...prev, [pieceType]: optionId }));
  };

  const handleRemovePiece = (pieceType: BodyKitPiece['pieceType']) => {
    removeBodyKitPiece(pieceType);
    const newSelected = { ...selectedOptions };
    delete newSelected[pieceType];
    setSelectedOptions(newSelected);
  };

  return (
    <div className="body-kit-customizer">
      <div className="body-kit-pieces">
        {PIECE_TYPES.map(({ type, name }) => {
          const selectedOptionId = selectedOptions[type];
          const selectedOption = selectedOptionId 
            ? BODY_KIT_OPTIONS.find(opt => opt.id === selectedOptionId)
            : null;
          const availableOptions = BODY_KIT_OPTIONS.filter(opt => opt.pieceType === type);

          return (
            <div key={type} className="piece-section">
              <h4>{name}</h4>
              
              {selectedOption && (
                <div className="current-selection">
                  <div className="selection-info">
                    <span className="selected-name">{selectedOption.name}</span>
                    <span className="selected-material">{selectedOption.material}</span>
                    <span className="selected-price">+${selectedOption.price}</span>
                  </div>
                  <button 
                    className="remove-btn"
                    onClick={() => handleRemovePiece(type)}
                  >
                    Remove
                  </button>
                </div>
              )}

              <div className="options-grid">
                {availableOptions.map(option => (
                  <button
                    key={option.id}
                    className={`option-card ${selectedOptionId === option.id ? 'selected' : ''}`}
                    onClick={() => handleSelectOption(type, option.id)}
                  >
                    <div className="option-image">
                      <div className="image-placeholder">
                        {option.name.substring(0, 2)}
                      </div>
                    </div>
                    <div className="option-details">
                      <span className="option-name">{option.name}</span>
                      <span className="option-material">{option.material}</span>
                      <span className="option-price">+${option.price}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {bodyKit.length > 0 && (
        <div className="body-kit-summary">
          <h4>Body Kit Summary:</h4>
          <ul className="selected-pieces">
            {bodyKit.map(piece => {
              const option = BODY_KIT_OPTIONS.find(opt => opt.id === piece.optionId)!;
              return (
                <li key={piece.optionId} className="piece-item">
                  <span className="piece-name">{option.name}</span>
                  <span className="piece-price">+${option.price}</span>
                </li>
              );
            })}
          </ul>
          <div className="total-price">
            Body Kit Total: +${bodyKit.reduce((sum, piece) => {
              const option = BODY_KIT_OPTIONS.find(opt => opt.id === piece.optionId)!;
              return sum + option.price;
            }, 0)}
          </div>
        </div>
      )}
    </div>
  );
}