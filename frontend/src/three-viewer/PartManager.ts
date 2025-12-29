import * as THREE from 'three';
import { ModelLoader, disposeObject3D } from './ModelLoader';
import type { LoadedModel } from './ModelLoader';

export type WheelDesign = {
  id: string;
  name: string;
  modelUrl: string;
  previewUrl: string;
  price: number;
  specs?: {
    offset: number;
    boltPattern: string;
    weight: string;
  };
};

export type BodyKit = {
  id: string;
  name: string;
  previewUrl: string;
  price: number;
  compatibleCars: string[];
  pieces: BodyKitPiece[];
};

export type BodyKitPiece = {
  id: string;
  name: string;
  type: 'front_bumper' | 'rear_bumper' | 'side_skirts' | 'splitter' | 'diffuser';
  modelUrl: string;
  price: number;
  position?: THREE.Vector3;
  rotation?: THREE.Euler;
  scale?: THREE.Vector3;
};

export type SpoilerDesign = {
  id: string;
  name: string;
  modelUrl: string;
  previewUrl: string;
  price: number;
  materialOptions: string[];
  positions: SpoilerPosition[];
};

export type SpoilerPosition = {
  id: string;
  name: string;
  offset: THREE.Vector3;
  rotation: THREE.Euler;
};

export class PartManager {
  private modelLoader: ModelLoader;
  private loadedParts: Map<string, LoadedModel> = new Map();
  private wheelMeshes: Map<string, THREE.Group> = new Map();
  private bodyKitMeshes: Map<string, THREE.Group> = new Map();
  private spoilerMesh: THREE.Group | null = null;

  constructor() {
    this.modelLoader = new ModelLoader();
  }

  async loadWheel(design: WheelDesign, size: number): Promise<LoadedModel | null> {
    const key = `wheel_${design.id}_${size}`;
    
    if (this.loadedParts.has(key)) {
      return this.loadedParts.get(key) || null;
    }

    try {
      const model = await this.modelLoader.load(design.modelUrl, 1);
      this.loadedParts.set(key, model);
      return model;
    } catch (error) {
      console.error(`Failed to load wheel design ${design.id}:`, error);
      return null;
    }
  }

  async loadBodyKitPiece(piece: BodyKitPiece): Promise<LoadedModel | null> {
    const key = `bodykit_${piece.id}`;
    
    if (this.loadedParts.has(key)) {
      return this.loadedParts.get(key) || null;
    }

    try {
      const model = await this.modelLoader.load(piece.modelUrl, 4);
      this.loadedParts.set(key, model);
      return model;
    } catch (error) {
      console.error(`Failed to load body kit piece ${piece.id}:`, error);
      return null;
    }
  }

  async loadSpoiler(design: SpoilerDesign): Promise<LoadedModel | null> {
    const key = `spoiler_${design.id}`;
    
    if (this.loadedParts.has(key)) {
      return this.loadedParts.get(key) || null;
    }

    try {
      const model = await this.modelLoader.load(design.modelUrl, 4);
      this.loadedParts.set(key, model);
      return model;
    } catch (error) {
      console.error(`Failed to load spoiler design ${design.id}:`, error);
      return null;
    }
  }

  installWheels(
    carGroup: THREE.Group,
    wheelModels: Map<string, LoadedModel>,
    frontLeft: boolean,
    frontRight: boolean,
    rearLeft: boolean,
    rearRight: boolean
  ): void {
    this.clearWheels();

    const wheelPositions = this.findWheelPositions(carGroup);

    if (frontLeft && wheelModels.has('front_left')) {
      const wheel = wheelModels.get('front_left')!.object.clone();
      wheel.position.copy(wheelPositions.frontLeft);
      this.wheelMeshes.set('front_left', wheel);
      carGroup.add(wheel);
    }

    if (frontRight && wheelModels.has('front_right')) {
      const wheel = wheelModels.get('front_right')!.object.clone();
      wheel.position.copy(wheelPositions.frontRight);
      this.wheelMeshes.set('front_right', wheel);
      carGroup.add(wheel);
    }

    if (rearLeft && wheelModels.has('rear_left')) {
      const wheel = wheelModels.get('rear_left')!.object.clone();
      wheel.position.copy(wheelPositions.rearLeft);
      this.wheelMeshes.set('rear_left', wheel);
      carGroup.add(wheel);
    }

    if (rearRight && wheelModels.has('rear_right')) {
      const wheel = wheelModels.get('rear_right')!.object.clone();
      wheel.position.copy(wheelPositions.rearRight);
      this.wheelMeshes.set('rear_right', wheel);
      carGroup.add(wheel);
    }
  }

  private findWheelPositions(carGroup: THREE.Group): {
    frontLeft: THREE.Vector3;
    frontRight: THREE.Vector3;
    rearLeft: THREE.Vector3;
    rearRight: THREE.Vector3;
  } {
    const positions = {
      frontLeft: new THREE.Vector3(-1.2, 0.35, 0.85),
      frontRight: new THREE.Vector3(-1.2, 0.35, -0.85),
      rearLeft: new THREE.Vector3(1.2, 0.35, 0.85),
      rearRight: new THREE.Vector3(1.2, 0.35, -0.85),
    };

    carGroup.traverse((child) => {
      if (child instanceof THREE.Group) {
        const name = child.name.toLowerCase();
        if (name.includes('wheel') || name.includes('rim')) {
          const worldPos = new THREE.Vector3();
          child.getWorldPosition(worldPos);
          
          if (name.includes('front') && name.includes('left')) {
            positions.frontLeft.copy(worldPos);
          } else if (name.includes('front') && name.includes('right')) {
            positions.frontRight.copy(worldPos);
          } else if (name.includes('rear') && name.includes('left')) {
            positions.rearLeft.copy(worldPos);
          } else if (name.includes('rear') && name.includes('right')) {
            positions.rearRight.copy(worldPos);
          }
        }
      }
    });

    return positions;
  }

  clearWheels(): void {
    this.wheelMeshes.forEach((wheel) => {
      this.removeFromParent(wheel);
      disposeObject3D(wheel);
    });
    this.wheelMeshes.clear();
  }

  installBodyKit(
    carGroup: THREE.Group,
    pieces: Map<string, LoadedModel>
  ): void {
    this.clearBodyKit();

    pieces.forEach((model, pieceId) => {
      const piece = model.object.clone();
      this.bodyKitMeshes.set(pieceId, piece);
      carGroup.add(piece);
    });
  }

  clearBodyKit(): void {
    this.bodyKitMeshes.forEach((piece) => {
      this.removeFromParent(piece);
      disposeObject3D(piece);
    });
    this.bodyKitMeshes.clear();
  }

  installSpoiler(
    carGroup: THREE.Group,
    model: LoadedModel,
    position: SpoilerPosition,
    angle: number = 0
  ): void {
    this.clearSpoiler();

    this.spoilerMesh = model.object.clone();
    this.spoilerMesh.position.copy(position.offset);
    this.spoilerMesh.rotation.copy(position.rotation);
    this.spoilerMesh.rotateZ(angle);

    carGroup.add(this.spoilerMesh);
  }

  updateSpoilerAngle(angle: number): void {
    if (this.spoilerMesh) {
      this.spoilerMesh.rotation.z = angle * (Math.PI / 180);
    }
  }

  clearSpoiler(): void {
    if (this.spoilerMesh) {
      this.removeFromParent(this.spoilerMesh);
      disposeObject3D(this.spoilerMesh);
      this.spoilerMesh = null;
    }
  }

  private removeFromParent(object: THREE.Object3D): void {
    if (object.parent) {
      object.parent.remove(object);
    }
  }

  isBodyKitInstalled(pieceId: string): boolean {
    return this.bodyKitMeshes.has(pieceId);
  }

  isWheelInstalled(position: string): boolean {
    return this.wheelMeshes.has(position);
  }

  hasSpoiler(): boolean {
    return this.spoilerMesh !== null;
  }

  dispose(): void {
    this.clearWheels();
    this.clearBodyKit();
    this.clearSpoiler();

    this.loadedParts.forEach((model) => model.dispose());
    this.loadedParts.clear();
  }
}

export const partManager = new PartManager();
