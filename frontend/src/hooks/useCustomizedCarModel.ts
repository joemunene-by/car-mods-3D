import { useRef, useEffect, useCallback, useState } from 'react';
import * as THREE from 'three';
import { useCustomizationStore, type PaintFinish } from '../store/customizationStore';
import { MaterialManager } from '../three-viewer/MaterialManager';
import { PartManager } from '../three-viewer/PartManager';
import { DecalManager } from '../three-viewer/DecalManager';

interface UseCustomizedCarModelOptions {
  isSceneReady: boolean;
}

export function useCustomizedCarModel(
  carModel: THREE.Group | null,
  _options: UseCustomizedCarModelOptions
) {
  const materialManagerRef = useRef<MaterialManager | null>(null);
  const partManagerRef = useRef<PartManager | null>(null);
  const decalManagerRef = useRef<DecalManager | null>(null);
  const carGroupRef = useRef<THREE.Group | null>(null);

  const { paint, wheels, bodyKit, spoiler, decals } = useCustomizationStore();
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    materialManagerRef.current = new MaterialManager();
    partManagerRef.current = new PartManager();
    decalManagerRef.current = new DecalManager();

    return () => {
      materialManagerRef.current?.dispose();
      partManagerRef.current?.dispose();
      decalManagerRef.current?.dispose();
    };
  }, []);

  useEffect(() => {
    if (carModel) {
      carGroupRef.current = carModel;
    }
  }, [carModel]);

  const applyPaint = useCallback((color: string, finish: PaintFinish, zones: typeof paint.zones) => {
    if (!carGroupRef.current || !materialManagerRef.current) return;

    const bodyMeshes = materialManagerRef.current.findBodyMeshes(carGroupRef.current);

    bodyMeshes.forEach((mesh) => {
      const meshName = mesh.name.toLowerCase();
      let shouldPaint = false;

      if (meshName.includes('roof') && zones.roof) shouldPaint = true;
      else if (meshName.includes('trim') && zones.trim) shouldPaint = true;
      else if (meshName.includes('accent') && zones.accents) shouldPaint = true;
      else if (zones.body) shouldPaint = true;

      if (shouldPaint) {
        materialManagerRef.current!.applyPaintToMesh(mesh, color, finish);
      }
    });
  }, [paint.zones]);

  const applyWheels = useCallback(async (settings: typeof wheels) => {
    if (!carGroupRef.current || !partManagerRef.current) return;

    console.log('Applying wheel settings:', settings);
  }, [wheels]);

  const applyBodyKit = useCallback((settings: typeof bodyKit) => {
    if (!carGroupRef.current || !partManagerRef.current) return;

    console.log('Applying body kit settings:', settings);
  }, [bodyKit]);

  const applySpoiler = useCallback((settings: typeof spoiler) => {
    if (!carGroupRef.current || !partManagerRef.current) return;

    console.log('Applying spoiler settings:', settings);
  }, [spoiler]);

  const applyDecals = useCallback((decalList: typeof decals) => {
    if (!carGroupRef.current || !decalManagerRef.current) return;

    console.log('Applying decals:', decalList);
  }, [decals]);

  useEffect(() => {
    if (!carGroupRef.current) return;

    setIsUpdating(true);
    applyPaint(paint.color, paint.finish, paint.zones);
    applyWheels(wheels);
    applyBodyKit(bodyKit);
    applySpoiler(spoiler);
    applyDecals(decals);
    setIsUpdating(false);
  }, [paint, wheels, bodyKit, spoiler, decals, applyPaint, applyWheels, applyBodyKit, applySpoiler, applyDecals]);

  const updatePaint = useCallback((color: string, finish: PaintFinish) => {
    applyPaint(color, finish, paint.zones);
  }, [paint.zones, applyPaint]);

  const updateWheel = useCallback((updates: Partial<typeof wheels>) => {
    if (updates.designId !== undefined || updates.size !== undefined || updates.finish !== undefined) {
      applyWheels({ ...wheels, ...updates });
    }
  }, [wheels, applyWheels]);

  const updateBodyKit = useCallback((updates: Partial<typeof bodyKit>) => {
    applyBodyKit({ ...bodyKit, ...updates });
  }, [bodyKit, applyBodyKit]);

  const updateSpoiler = useCallback((updates: Partial<typeof spoiler>) => {
    applySpoiler({ ...spoiler, ...updates });
  }, [spoiler, applySpoiler]);

  const addDecal = useCallback((decal: typeof decals[0]) => {
    applyDecals([...decals, decal]);
  }, [decals, applyDecals]);

  const removeDecal = useCallback((id: string) => {
    applyDecals(decals.filter(d => d.id !== id));
  }, [decals, applyDecals]);

  return {
    isUpdating,
    updatePaint,
    updateWheel,
    updateBodyKit,
    updateSpoiler,
    addDecal,
    removeDecal,
  };
}
