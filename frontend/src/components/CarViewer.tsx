import { useEffect, useRef, useState } from 'react';
import { useThreeScene } from '../hooks/useThreeScene';
import { useCarModel, useCars } from '../hooks/useCarModel';
import { useCustomizedCarModel } from '../hooks/useCustomizedCarModel';
import { useCustomizationStore } from '../store/customizationStore';
import CustomizationPanel from './CustomizationPanel';
import '../styles/CarViewer.css';
import type { LoadedModel } from '../three-viewer/ModelLoader';

function CarViewer() {
  const containerRef = useRef<HTMLDivElement>(null);
  const customizationRef = useRef<HTMLDivElement>(null);
  const { isSceneReady, sceneError, setModel, resetCamera, zoom, rotate } = useThreeScene(containerRef);

  const {
    cars,
    isLoading: carsLoading,
    error: carsError,
    refetch: refetchCars,
  } = useCars();

  const [selectedCarId, setSelectedCarId] = useState<string | null>(null);
  const [showCustomization, setShowCustomization] = useState(true);

  const {
    model,
    car,
    isLoading: modelLoading,
    error: modelError,
    reload: reloadModel,
  } = useCarModel(selectedCarId);

  const { setCarId } = useCustomizationStore();

  useEffect(() => {
    if (cars.length > 0 && !selectedCarId) {
      setSelectedCarId(cars[0].id);
    }
  }, [cars, selectedCarId]);

  useEffect(() => {
    if (selectedCarId) {
      setCarId(selectedCarId);
    }
  }, [selectedCarId, setCarId]);

  useEffect(() => {
    if (!isSceneReady) return;

    if (model) {
      setModel(model as unknown as LoadedModel);
      resetCamera();
    }
  }, [isSceneReady, model, resetCamera, setModel]);

  useCustomizedCarModel(model as unknown as THREE.Group, { isSceneReady });

  const handleCarChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCarId(e.target.value);
  };

  const handleReset = () => {
    resetCamera();
  };

  const handleZoomIn = () => {
    zoom(-0.6);
  };

  const handleZoomOut = () => {
    zoom(0.6);
  };

  const handleRotateLeft = () => {
    rotate(0.35, 0);
  };

  const handleRotateRight = () => {
    rotate(-0.35, 0);
  };

  const handleSaveConfiguration = () => {
    console.log('Saving configuration...');
  };

  const handleLoadConfiguration = () => {
    console.log('Loading configuration...');
  };

  const showLoading = (!sceneError && !carsError && !modelError) && (carsLoading || modelLoading || !isSceneReady);
  const showError = !!(sceneError || carsError || modelError);

  return (
    <div className="car-viewer">
      <div className="car-viewer-header">
        <div className="car-info">
          {car && (
            <>
              <h2>{car.name}</h2>
              <p className="car-details">
                {car.manufacturer} • {car.year} • ${car.basePrice.toLocaleString()}
              </p>
              {car.description && <p className="car-description">{car.description}</p>}
            </>
          )}
        </div>

        <div className="car-selector">
          <label htmlFor="car-select">Select Car:</label>
          <select
            id="car-select"
            value={selectedCarId || ''}
            onChange={handleCarChange}
            disabled={carsLoading || !!sceneError}
          >
            {carsLoading && <option value="">Loading cars...</option>}
            {!carsLoading && cars.length === 0 && <option value="">No cars available</option>}
            {cars.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.year})
              </option>
            ))}
          </select>
        </div>

        <button
          className={`customization-toggle ${showCustomization ? 'active' : ''}`}
          onClick={() => setShowCustomization(!showCustomization)}
        >
          {showCustomization ? 'Hide' : 'Show'} Customizer
        </button>
      </div>

      <div className="viewer-content">
        <div className={`canvas-wrapper ${showCustomization ? 'with-panel' : ''}`} ref={containerRef}>
          {showLoading && (
            <div className="loading-overlay">
              <div className="spinner"></div>
              <p>
                {!isSceneReady
                  ? 'Initializing 3D viewer...'
                  : carsLoading
                    ? 'Loading cars...'
                    : 'Loading 3D model...'}
              </p>
            </div>
          )}

          {showError && (
            <div className="error-overlay">
              <div className="error-message">
                <h3>Error</h3>
                <p>{sceneError || carsError || modelError}</p>
                <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
                  {carsError && <button onClick={refetchCars}>Retry cars</button>}
                  {modelError && <button onClick={reloadModel}>Retry model</button>}
                </div>
              </div>
            </div>
          )}
        </div>

        {showCustomization && (
          <div className="customization-container" ref={customizationRef}>
            <CustomizationPanel
              carBasePrice={car?.basePrice || 0}
              onSave={handleSaveConfiguration}
              onLoad={handleLoadConfiguration}
            />
          </div>
        )}
      </div>

      <div className="controls-panel">
        <button className="control-btn" onClick={handleRotateLeft} title="Rotate Left" disabled={!!sceneError}>
          <span>Rotate Left</span>
        </button>

        <button className="control-btn" onClick={handleRotateRight} title="Rotate Right" disabled={!!sceneError}>
          <span>Rotate Right</span>
        </button>

        <button className="control-btn" onClick={handleZoomIn} title="Zoom In" disabled={!!sceneError}>
          <span>Zoom In</span>
        </button>

        <button className="control-btn" onClick={handleZoomOut} title="Zoom Out" disabled={!!sceneError}>
          <span>Zoom Out</span>
        </button>

        <button className="control-btn" onClick={handleReset} title="Reset View" disabled={!!sceneError}>
          <span>Reset View</span>
        </button>

        <div className="control-hint">
          <p>Drag to rotate • Scroll/pinch to zoom</p>
        </div>
      </div>
    </div>
  );
}

export default CarViewer;
