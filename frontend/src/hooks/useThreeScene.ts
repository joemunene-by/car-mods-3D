import { useCallback, useEffect, useRef, useState } from 'react';
import { SceneManager } from '../three-viewer/SceneManager';
import { CameraManager } from '../three-viewer/CameraManager';
import { LightingManager } from '../three-viewer/LightingManager';
import { ControlsManager } from '../three-viewer/ControlsManager';
import type { LoadedModel } from '../three-viewer/ModelLoader';

const isWebGLAvailable = () => {
  try {
    const canvas = document.createElement('canvas');
    return !!(
      window.WebGLRenderingContext &&
      (canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
    );
  } catch {
    return false;
  }
};

export const useThreeScene = (containerRef: React.RefObject<HTMLDivElement>) => {
  const sceneManagerRef = useRef<SceneManager | null>(null);
  const cameraManagerRef = useRef<CameraManager | null>(null);
  const lightingManagerRef = useRef<LightingManager | null>(null);
  const controlsManagerRef = useRef<ControlsManager | null>(null);
  const currentModelRef = useRef<LoadedModel | null>(null);

  const [isSceneReady, setIsSceneReady] = useState(false);
  const [sceneError, setSceneError] = useState<string | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    if (!isWebGLAvailable()) {
      setSceneError('WebGL is not supported in this browser/environment.');
      setIsSceneReady(false);
      return;
    }

    sceneManagerRef.current = new SceneManager(container);
    cameraManagerRef.current = new CameraManager(container);
    lightingManagerRef.current = new LightingManager(sceneManagerRef.current.getScene());

    const camera = cameraManagerRef.current.getCamera();
    const target = cameraManagerRef.current.getTarget();
    const canvas = sceneManagerRef.current.getCanvas();

    controlsManagerRef.current = new ControlsManager(camera, target, canvas, {
      minPolarAngle: 0.2,
      maxPolarAngle: Math.PI - 0.2,
      dampingFactor: 0.12,
      minDistance: 2.5,
      maxDistance: 12,
    });

    setIsSceneReady(true);

    const resize = () => {
      const width = container.clientWidth;
      const height = container.clientHeight;
      sceneManagerRef.current?.resize(width, height);
      cameraManagerRef.current?.resize(width, height);
    };

    resize();

    const resizeObserver = new ResizeObserver(() => resize());
    resizeObserver.observe(container);

    let animationFrameId = 0;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      controlsManagerRef.current?.update();

      if (sceneManagerRef.current && cameraManagerRef.current) {
        sceneManagerRef.current.render(cameraManagerRef.current.getCamera());
      }
    };

    animate();

    return () => {
      resizeObserver.disconnect();
      cancelAnimationFrame(animationFrameId);

      if (currentModelRef.current) {
        sceneManagerRef.current?.getScene().remove(currentModelRef.current.object);
        currentModelRef.current.dispose();
        currentModelRef.current = null;
      }

      controlsManagerRef.current?.dispose();
      lightingManagerRef.current?.dispose();
      cameraManagerRef.current?.dispose();
      sceneManagerRef.current?.dispose();

      sceneManagerRef.current = null;
      cameraManagerRef.current = null;
      lightingManagerRef.current = null;
      controlsManagerRef.current = null;
    };
  }, [containerRef]);

  const setModel = useCallback((model: LoadedModel | null) => {
    if (!sceneManagerRef.current) return;

    if (currentModelRef.current?.object === model?.object) {
      return;
    }

    if (currentModelRef.current) {
      sceneManagerRef.current.getScene().remove(currentModelRef.current.object);
      currentModelRef.current.dispose();
      currentModelRef.current = null;
    }

    if (model) {
      currentModelRef.current = model;
      sceneManagerRef.current.getScene().add(model.object);
    }
  }, []);

  const resetCamera = useCallback(() => {
    cameraManagerRef.current?.reset();
    controlsManagerRef.current?.reset();
  }, []);

  const zoom = useCallback((delta: number) => {
    controlsManagerRef.current?.zoomBy(delta);
  }, []);

  const rotate = useCallback((deltaTheta: number, deltaPhi = 0) => {
    controlsManagerRef.current?.rotateBy(deltaTheta, deltaPhi);
  }, []);

  return {
    isSceneReady,
    sceneError,
    sceneManager: sceneManagerRef.current,
    cameraManager: cameraManagerRef.current,
    lightingManager: lightingManagerRef.current,
    controlsManager: controlsManagerRef.current,
    setModel,
    resetCamera,
    zoom,
    rotate,
  };
};
