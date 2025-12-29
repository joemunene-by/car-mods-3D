import { useEffect, useRef, useState, useCallback } from 'react';
import { useThreeScene } from '../hooks/useThreeScene';
import { useCarModel, useCars } from '../hooks/useCarModel';
import { useCustomizationStore } from '../store/customizationStore';
import { materialManager } from '../three-viewer/MaterialManager';
import { partManager } from '../three-viewer/PartManager';
import { decalManager } from '../three-viewer/DecalManager';
import CustomizerPanel from '../components/CustomizerPanel';
import '../styles/CarViewer.css';

interface CustomizerPageProps {
  initialCarId?: string;
}

function CustomizerPage({ initialCarId }: CustomizerPageProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { isSceneReady, sceneError, setModel, resetCamera, zoom, rotate } = useThreeScene(containerRef);
  
  const {
    cars,
    isLoading: carsLoading,
    error: carsError,
    refetch: refetchCars,
  } = useCars();

  const [selectedCarId, setSelectedCarId] = useState<string | null>(initialCarId || null);
  
  const {
    model,
    car,
    isLoading: modelLoading,
    error: modelError,
    reload: reloadModel,
  } = useCarModel(selectedCarId);

  const {
    paint,
    wheels,
    bodyKit,
    spoiler,
    decals,
    setCarId,
  } = useCustomizationStore();

  useEffect(() => {
    if (cars.length > 0 && !selectedCarId) {
      const defaultCar = cars[0];
      setSelectedCarId(defaultCar.id);
    }
  }, [cars, selectedCarId]);

  useEffect(() => {
    if (selectedCarId && car) {
      setCarId(selectedCarId, car.basePrice);
    }
  }, [selectedCarId, car, setCarId]);

  useEffect(() => {
    if (!isSceneReady || !model) return;

    setModel(model);

    if (model) {
      resetCamera();
    }

    return () => {
      materialManager.dispose();
      partManager.dispose();
      decalManager.dispose();
    };
  }, [isSceneReady, model, setModel, resetCamera]);

  useEffect(() => {
    if (!isSceneReady || !model) return;

    materialManager.updatePaint(paint.color, paint.finish, paint.zone);
  }, [isSceneReady, model, paint.color, paint.finish, paint.zone]);

  useEffect(() => {
    if (!isSceneReady || !model) return;

    const wheelPositions = {
      frontLeft: { x: -1.0, y: 0.35, z: 1.3 },
      frontRight: { x: 1.0, y: 0.35, z: 1.3 },
      rearLeft: { x: -1.0, y: 0.35, z: -1.3 },
      rearRight: { x: 1.0, y: 0.35, z: -1.3 },
    };

    const sizeMap: Record<string, number> = {
      '17"': 0.65,
      '18"': 0.68,
      '19"': 0.71,
      '20"': 0.74,
      '21"': 0.77,
    };

    partManager.loadAndInstallWheels(
      wheels.designId,
      wheelPositions,
      sizeMap[wheels.size] || 0.71
    );
  }, [isSceneReady, model, wheels.designId, wheels.size]);

  useEffect(() => {
    if (!isSceneReady || !model) return;

    partManager.installBodyKit(
      bodyKit.kitId,
      bodyKit.pieces,
      {
        FRONT_BUMPER: { modelUrl: '/models/bumper_front.glb', position: { x: 0, y: 0.3, z: 1.8 }, rotation: { x: 0, y: 0, z: 0 } },
        REAR_BUMPER: { modelUrl: '/models/bumper_rear.glb', position: { x: 0, y: 0.3, z: -1.8 }, rotation: { x: 0, y: 0, z: 0 } },
        SIDE_SKIRTS: { modelUrl: '/models/skirts.glb', position: { x: 0, y: 0.25, z: 0 }, rotation: { x: 0, y: 0, z: 0 } },
        FENDER_FLARES: { modelUrl: '/models/fender_flares.glb', position: { x: 0, y: 0.4, z: 0 }, rotation: { x: 0, y: 0, z: 0 } },
        HOOD: { modelUrl: '/models/hood.glb', position: { x: 0, y: 0.8, z: 1.0 }, rotation: { x: 0, y: 0, z: 0 } },
        DIFFUSER: { modelUrl: '/models/diffuser.glb', position: { x: 0, y: 0.25, z: -1.9 }, rotation: { x: 0, y: 0, z: 0 } },
        SPLITTER: { modelUrl: '/models/splitter.glb', position: { x: 0, y: 0.25, z: 2.0 }, rotation: { x: 0, y: 0, z: 0 } },
      }
    );
  }, [isSceneReady, model, bodyKit.kitId, bodyKit.pieces]);

  useEffect(() => {
    if (!isSceneReady || !model) return;

    const spoilerUrls: Record<string, { modelUrl: string }> = {
      'gt-wing-carbon': { modelUrl: '/models/spoiler_gt_carbon.glb' },
      'gt-wing-alum': { modelUrl: '/models/spoiler_gt_alum.glb' },
      'carbon-racing': { modelUrl: '/models/spoiler_racing.glb' },
      'sport-gt': { modelUrl: '/models/spoiler_sport.glb' },
    };

    if (spoiler.designId && spoilerUrls[spoiler.designId]) {
      partManager.installSpoiler(
        spoiler.designId,
        {
          modelUrl: spoilerUrls[spoiler.designId].modelUrl,
          position: spoiler.position,
          angle: spoiler.angle,
          height: spoiler.height,
        }
      );
    } else {
      partManager.installSpoiler(null!, { modelUrl: '', position: spoiler.position, angle: spoiler.angle, height: spoiler.height });
    }
  }, [isSceneReady, model, spoiler.designId, spoiler.position, spoiler.angle, spoiler.height]);

  useEffect(() => {
    if (!isSceneReady || !model) return;

    decalManager.renderAllDecals();
  }, [isSceneReady, model, decals]);

  const handleCarChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCarId(e.target.value);
  }, []);

  const handleReset = useCallback(() => {
    resetCamera();
  }, [resetCamera]);

  const handleZoomIn = useCallback(() => {
    zoom(-0.6);
  }, [zoom]);

  const handleZoomOut = useCallback(() => {
    zoom(0.6);
  }, [zoom]);

  const handleRotateLeft = useCallback(() => {
    rotate(0.35, 0);
  }, [rotate]);

  const handleRotateRight = useCallback(() => {
    rotate(-0.35, 0);
  }, [rotate]);

  const handleSaveConfiguration = useCallback(() => {
    console.log('Save configuration');
  }, []);

  const showLoading = (!sceneError && !carsError && !modelError) && (carsLoading || modelLoading || !isSceneReady);
  const showError = !!(sceneError || carsError || modelError);

  return (
    <div className="page customizer-page">
      <div className="viewer-container" ref={containerRef}>
        <div className="car-viewer-header" style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10 }}>
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
        </div>

        <div className="canvas-wrapper" style={{ height: '100%', borderRadius: 0 }}>
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

        <div className="controls-panel" style={{ position: 'absolute', bottom: 20, left: 20, right: 20 }}>
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

      {selectedCarId && car && (
        <CustomizerPanel
          carId={selectedCarId}
          carName={`${car.manufacturer} ${car.name} (${car.year})`}
          basePrice={car.basePrice}
          onSave={handleSaveConfiguration}
        />
      )}
    </div>
  );
}

export default CustomizerPage;
