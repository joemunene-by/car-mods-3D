import { BodyKitPiece } from '../../store/customizationStore';
import { CustomizationOption } from '../../hooks/useCustomizations';

interface BodyKitCustomizerProps {
  options: CustomizationOption[];
  kitId: string | null;
  pieces: Record<BodyKitPiece, boolean>;
  onKitChange: (kitId: string | null) => void;
  onPieceToggle: (piece: BodyKitPiece, enabled: boolean) => void;
  onReset: () => void;
}

const BODY_KIT_PIECES: { value: BodyKitPiece; label: string }[] = [
  { value: 'FRONT_BUMPER', label: 'Front Bumper' },
  { value: 'REAR_BUMPER', label: 'Rear Bumper' },
  { value: 'SIDE_SKIRTS', label: 'Side Skirts' },
  { value: 'FENDER_FLARES', label: 'Fender Flares' },
  { value: 'HOOD', label: 'Hood' },
  { value: 'DIFFUSER', label: 'Diffuser' },
  { value: 'SPLITTER', label: 'Splitter' },
];

interface BodyKitDesign {
  id: string;
  name: string;
  description: string;
  preview: string;
  price: number;
  pieces: BodyKitPiece[];
}

const DEFAULT_BODY_KITS: BodyKitDesign[] = [
  {
    id: 'sport',
    name: 'Sport',
    description: 'Subtle enhancement',
    preview: '🚗',
    price: 2500,
    pieces: ['FRONT_BUMPER', 'REAR_BUMPER', 'SIDE_SKIRTS'],
  },
  {
    id: 'aggressive',
    name: 'Aggressive',
    description: 'Bold street look',
    preview: '🏎️',
    price: 4500,
    pieces: ['FRONT_BUMPER', 'REAR_BUMPER', 'SIDE_SKIRTS', 'FENDER_FLARES'],
  },
  {
    id: 'track',
    name: 'Track',
    description: 'Aerodynamics focus',
    preview: '🏁',
    price: 6500,
    pieces: ['FRONT_BUMPER', 'REAR_BUMPER', 'SIDE_SKIRTS', 'DIFFUSER', 'SPLITTER'],
  },
  {
    id: 'widebody',
    name: 'Widebody',
    description: 'Maximum width & flair',
    preview: '💪',
    price: 9500,
    pieces: ['FRONT_BUMPER', 'REAR_BUMPER', 'SIDE_SKIRTS', 'FENDER_FLARES', 'HOOD'],
  },
];

export default function BodyKitCustomizer({
  options,
  kitId,
  pieces,
  onKitChange,
  onPieceToggle,
  onReset,
}: BodyKitCustomizerProps) {
  const bodyKitOptions = options.filter(o => o.category === 'BODY_KIT');
  
  const hasApiKits = bodyKitOptions.length > 0;
  
  const kits = hasApiKits
    ? bodyKitOptions.map(o => ({
        id: o.id,
        name: o.name,
        description: o.description || '',
        preview: o.thumbnailUrl || '🚗',
        price: o.price,
        pieces: (o.specs?.bodyKitPiece ? [o.specs.bodyKitPiece as BodyKitPiece] : []) as BodyKitPiece[],
      }))
    : DEFAULT_BODY_KITS;

  const selectedKit = kits.find(k => k.id === kitId);

  const handleKitSelect = (id: string | null) => {
    onKitChange(id);
  };

  const handlePieceToggle = (piece: BodyKitPiece) => {
    onPieceToggle(piece, !pieces[piece]);
  };

  return (
    <div className="body-kit-customizer">
      <div className="section-row">
        <label className="section-label">Body Kit Design</label>
        <div className="body-kit-grid">
          <button
            className={`body-kit-option ${kitId === null ? 'selected' : ''}`}
            onClick={() => handleKitSelect(null)}
          >
            <div className="kit-preview">🚗</div>
            <div className="kit-info">
              <div className="kit-name">Stock</div>
              <div className="kit-price">No change</div>
            </div>
          </button>
          {kits.map((kit) => (
            <button
              key={kit.id}
              className={`body-kit-option ${kitId === kit.id ? 'selected' : ''}`}
              onClick={() => handleKitSelect(kit.id)}
            >
              <div className="kit-preview">{kit.preview}</div>
              <div className="kit-info">
                <div className="kit-name">{kit.name}</div>
                <div className="kit-price">+${kit.price.toLocaleString()}</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="section-row">
        <label className="section-label">Individual Pieces</label>
        <div className="body-kit-pieces">
          {BODY_KIT_PIECES.map((piece) => (
            <button
              key={piece.value}
              className="body-kit-piece"
              onClick={() => handlePieceToggle(piece.value)}
            >
              <input
                type="checkbox"
                checked={pieces[piece.value]}
                onChange={() => {}}
              />
              <label>{piece.label}</label>
            </button>
          ))}
        </div>
      </div>

      {selectedKit && (
        <div className="section-row" style={{ padding: '0.75rem', background: 'rgba(100, 108, 255, 0.1)', borderRadius: '6px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)' }}>
              Selected: {selectedKit.name}
            </span>
            <span style={{ fontSize: '0.9rem', color: '#a5aaff' }}>
              +${selectedKit.price.toLocaleString()}
            </span>
          </div>
          <div style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)' }}>
            Includes: {selectedKit.pieces.map(p => BODY_KIT_PIECES.find(bp => bp.value === p)?.label).join(', ')}
          </div>
        </div>
      )}

      <button className="reset-section-btn" onClick={onReset}>
        Reset Body Kit
      </button>
    </div>
  );
}
