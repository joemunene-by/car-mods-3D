import * as THREE from 'three';
import { ModelLoader } from './ModelLoader';
import { BodyKitPiece, SpoilerPosition } from '../store/customizationStore';

export interface PartConfig {
  modelUrl: string;
  position?: { x: number; y: number; z: number };
  rotation?: { x: number; y: number; z: number };
  scale?: { x: number; y: number; z: number };
}

export class PartManager {
  private modelLoader: ModelLoader;
  private scene: THREE.Scene | null = null;
  private wheelModels: Map<string, THREE.Group> = new Map();
  private bodyKitModels: Map<string, THREE.Group> = new Map();
  private spoilerModel: THREE.Group | null = null;
  private currentWheels: THREE.Group[] = [];
  private currentBodyKit: Map<BodyKitPiece, THREE.Group | null> = new Map();
  private loadedParts: Map<string, Promise<THREE.Group>> = new Map();

  constructor() {
    this.modelLoader = new ModelLoader();
  }

  initialize(scene: THREE.Scene): void {
    this.scene = scene;
  }

  async loadWheelDesign(designId: string, modelUrl: string): Promise<THREE.Group | null> {
    if (!this.scene) return null;

    if (this.wheelModels.has(designId)) {
      return this.wheelModels.get(designId)!.clone();
    }

    if (this.loadedParts.has(designId)) {
      return (await this.loadedParts.get(designId)!).clone();
    }

    const loadPromise = this.modelLoader.load(modelUrl, 1).then((loadedModel) => {
      this.wheelModels.set(designId, loadedModel.object);
      this.loadedParts.delete(designId);
      return loadedModel.object;
    });

    this.loadedParts.set(designId, loadPromise);
    return loadPromise.then((group) => group.clone());
  }

  async updateWheels(
    frontLeft: THREE.Group | null,
    frontRight: THREE.Group | null,
    rearLeft: THREE.Group | null,
    rearRight: THREE.Group | null
  ): Promise<void> {
    this.currentWheels.forEach((wheel) => {
      if (wheel.parent) {
        wheel.parent.remove(wheel);
      }
      disposeObjectDGroup(wheel);
    });
    this.currentWheels = [];

    if (frontLeft) {
      this.currentWheels.push(frontLeft);
      this.scene?.add(frontLeft);
    }
    if (frontRight) {
      this.currentWheels.push(frontRight);
      this.scene?.add(frontRight);
    }
    if (rearLeft) {
      this.currentWheels.push(rearLeft);
      this.scene?.add(rearLeft);
    }
    if (rearRight) {
      this.currentWheels.push(rearRight);
      this.scene?.add(rearRight);
    }
  }

  async loadAndInstallWheels(
    designId: string | null,
    wheelPositions: {
      frontLeft: { x: number; y: number; z: number };
      frontRight: { x: number; y: number; z: number };
      rearLeft: { x: number; y: number; z: number };
      rearRight: { x: number; y: number; z: number };
    },
    wheelSize: number = 0.35
  ): Promise<void> {
    if (!designId || !this.scene) {
      await this.updateWheels(null, null, null, null);
      return;
    }

    const wheelUrl = this.getWheelModelUrl(designId);
    const wheelModel = await this.loadWheelDesign(designId, wheelUrl);

    if (!wheelModel) return;

    const size = this.getWheelSizeScale(wheelSize);

    const fl = wheelModel.clone();
    fl.position.set(wheelPositions.frontLeft.x, wheelPositions.frontLeft.y, wheelPositions.frontLeft.z);
    fl.scale.setScalar(size);
    fl.rotation.y = Math.PI / 2;

    const fr = wheelModel.clone();
    fr.position.set(wheelPositions.frontRight.x, wheelPositions.frontRight.y, wheelPositions.frontRight.z);
    fr.scale.setScalar(size);
    fr.rotation.y = -Math.PI / 2;

    const rl = wheelModel.clone();
    rl.position.set(wheelPositions.rearLeft.x, wheelPositions.rearLeft.y, wheelPositions.rearLeft.z);
    rl.scale.setScalar(size);
    rl.rotation.y = Math.PI / 2;

    const rr = wheelModel.clone();
    rr.position.set(wheelPositions.rearRight.x, wheelPositions.rearRight.y, wheelPositions.rearRight.z);
    rr.scale.setScalar(size);
    rr.rotation.y = -Math.PI / 2;

    await this.updateWheels(fl, fr, rl, rr);
  }

  private getWheelModelUrl(designId: string): string {
    return `/models/wheels/${designId}.glb`;
  }

  private getWheelSizeScale(size: number): number {
    return size * 0.4;
  }

  async loadBodyKitPiece(piece: BodyKitPiece, modelUrl: string): Promise<THREE.Group | null> {
    if (!this.scene) return null;

    const key = `${piece}_${modelUrl}`;
    
    if (this.bodyKitModels.has(key)) {
      return this.bodyKitModels.get(key)!.clone();
    }

    if (this.loadedParts.has(key)) {
      return (await this.loadedParts.get(key)!).clone();
    }

    const loadPromise = this.modelLoader.load(modelUrl, 4).then((loadedModel) => {
      this.bodyKitModels.set(key, loadedModel.object);
      this.loadedParts.delete(key);
      return loadedModel.object;
    });

    this.loadedParts.set(key, loadPromise);
    return loadPromise.then((group) => group.clone());
  }

  async updateBodyKit(pieces: Map<BodyKitPiece, THREE.Group | null>): Promise<void> {
    this.currentBodyKit.forEach((model) => {
      if (model && model.parent) {
        model.parent.remove(model);
        disposeObjectDGroup(model);
      }
    });
    this.currentBodyKit.clear();

    pieces.forEach((model, piece) => {
      if (model) {
        this.currentBodyKit.set(piece, model);
        this.scene?.add(model);
      }
    });
  }

  async installBodyKit(
    kitId: string | null,
    enabledPieces: Record<BodyKitPiece, boolean>,
    pieceConfigs: Record<BodyKitPiece, PartConfig>
  ): Promise<void> {
    const pieces = new Map<BodyKitPiece, THREE.Group | null>();

    if (!kitId) {
      await this.updateBodyKit(pieces);
      return;
    }

    const loadPromises: Promise<void>[] = [];

    for (const [piece, enabled] of Object.entries(enabledPieces)) {
      const pieceEnum = piece as BodyKitPiece;
      
      if (enabled && pieceConfigs[pieceEnum]) {
        const config = pieceConfigs[pieceEnum];
        const promise = this.loadBodyKitPiece(pieceEnum, config.modelUrl).then((model) => {
          if (model && config.position) {
            model.position.set(config.position.x, config.position.y, config.position.z);
          }
          if (model && config.rotation) {
            model.rotation.set(
              config.rotation.x * (Math.PI / 180),
              config.rotation.y * (Math.PI / 180),
              config.rotation.z * (Math.PI / 180)
            );
          }
          if (model && config.scale) {
            model.scale.set(config.scale.x, config.scale.y, config.scale.z);
          }
          pieces.set(pieceEnum, model);
        });
        loadPromises.push(promise);
      } else {
        pieces.set(pieceEnum, null);
      }
    }

    await Promise.all(loadPromises);
    await this.updateBodyKit(pieces);
  }

  async loadSpoiler(designId: string | null, modelUrl: string, position: SpoilerPosition): Promise<THREE.Group | null> {
    if (!this.scene || !designId) {
      if (this.spoilerModel) {
        this.spoilerModel.parent?.remove(this.spoilerModel);
        disposeObjectDGroup(this.spoilerModel);
        this.spoilerModel = null;
      }
      return null;
    }

    const key = `spoiler_${designId}_${position}`;
    
    if (this.loadedParts.has(key)) {
      return (await this.loadedParts.get(key)!).clone();
    }

    const loadPromise = this.modelLoader.load(modelUrl, 4).then((loadedModel) => {
      this.loadedParts.delete(key);
      return loadedModel.object;
    });

    this.loadedParts.set(key, loadPromise);
    return loadPromise.then((group) => group.clone());
  }

  async updateSpoiler(
    model: THREE.Group | null,
    position: { x: number; y: number; z: number },
    rotation?: { x: number; y: number; z: number },
    scale?: { x: number; y: number; z: number }
  ): Promise<void> {
    if (this.spoilerModel) {
      this.spoilerModel.parent?.remove(this.spoilerModel);
      disposeObjectDGroup(this.spoilerModel);
    }

    if (model) {
      model.position.set(position.x, position.y, position.z);
      if (rotation) {
        model.rotation.set(
          rotation.x * (Math.PI / 180),
          rotation.y * (Math.PI / 180),
          rotation.z * (Math.PI / 180)
        );
      }
      if (scale) {
        model.scale.set(scale.x, scale.y, scale.z);
      }
      this.spoilerModel = model;
      this.scene?.add(model);
    }
  }

  async installSpoiler(
    designId: string | null,
    spoilerConfig: { modelUrl: string; position: SpoilerPosition; angle: number; height: number }
  ): Promise<void> {
    if (!designId || !this.scene) {
      if (this.spoilerModel) {
        this.spoilerModel.parent?.remove(this.spoilerModel);
        disposeObjectDGroup(this.spoilerModel);
        this.spoilerModel = null;
      }
      return;
    }

    const positions: Record<SpoilerPosition, { position: { x: number; y: number; z: number }; rotation: { x: number; y: number; z: number } }> = {
      LOW: { position: { x: 0, y: 1.4, z: -1.8 }, rotation: { x: 0, y: 0, z: spoilerConfig.angle } },
      MID: { position: { x: 0, y: 1.5, z: -1.8 }, rotation: { x: 0, y: 0, z: spoilerConfig.angle } },
      HIGH: { position: { x: 0, y: 1.6, z: -1.8 }, rotation: { x: 0, y: 0, z: spoilerConfig.angle } },
      LIP: { position: { x: 0, y: 1.45, z: -1.85 }, rotation: { x: 0, y: 0, z: spoilerConfig.angle } },
    };

    const posConfig = positions[spoilerConfig.position];
    const model = await this.loadSpoiler(designId, spoilerConfig.modelUrl, spoilerConfig.position);

    await this.updateSpoiler(
      model,
      posConfig.position,
      { ...posConfig.rotation, z: spoilerConfig.angle },
      { x: 1, y: 1, z: 1 }
    );
  }

  removeAllParts(): void {
    this.updateWheels(null, null, null, null);
    this.currentBodyKit.forEach((model) => {
      if (model && model.parent) {
        model.parent.remove(model);
        disposeObjectDGroup(model);
      }
    });
    this.currentBodyKit.clear();
    if (this.spoilerModel) {
      this.spoilerModel.parent?.remove(this.spoilerModel);
      disposeObjectDGroup(this.spoilerModel);
      this.spoilerModel = null;
    }
  }

  dispose(): void {
    this.removeAllParts();
    this.wheelModels.forEach((model) => disposeObjectDGroup(model));
    this.bodyKitModels.forEach((model) => disposeObjectDGroup(model));
    this.wheelModels.clear();
    this.bodyKitModels.clear();
    this.loadedParts.clear();
  }
}

function disposeObjectDGroup(group: THREE.Group): void {
  group.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      child.geometry.dispose();
      if (Array.isArray(child.material)) {
        child.material.forEach((m) => m.dispose());
      } else if (child.material) {
        child.material.dispose();
      }
    }
  });
}

export const partManager = new PartManager();
