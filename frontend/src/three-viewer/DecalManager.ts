import * as THREE from 'three';

export type DecalDesign = {
  id: string;
  name: string;
  type: 'stripe' | 'graphic' | 'number' | 'logo' | 'custom';
  previewUrl: string;
  price: number;
  defaultColor: string;
  svgPath?: string;
  width: number;
  height: number;
};

export type DecalPlacement = {
  id: string;
  name: string;
  meshName: string;
  uvOffset: THREE.Vector2;
  uvScale: THREE.Vector2;
};

export class DecalManager {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private decalTextures: Map<string, THREE.CanvasTexture> = new Map();
  private activeDecals: Map<string, THREE.Mesh> = new Map();
  private decalMeshes: Map<string, THREE.Mesh> = new Map();

  constructor() {
    this.canvas = document.createElement('canvas');
    this.canvas.width = 1024;
    this.canvas.height = 1024;
    this.ctx = this.canvas.getContext('2d')!;
  }

  createDecalTexture(
    design: DecalDesign,
    color: string,
    opacity: number,
    scale: number = 1,
    rotation: number = 0
  ): THREE.CanvasTexture {
    const key = `decal_${design.id}_${color}_${opacity}_${scale}_${rotation}`;
    
    if (this.decalTextures.has(key)) {
      return this.decalTextures.get(key)!;
    }

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    this.ctx.save();
    this.ctx.globalAlpha = opacity;
    this.ctx.translate(this.canvas.width / 2, this.canvas.height / 2);
    this.ctx.rotate((rotation * Math.PI) / 180);
    this.ctx.scale(scale, scale);

    if (design.svgPath) {
      this.ctx.fillStyle = color;
      const path = new Path2D(design.svgPath);
      this.ctx.fill(path);
    } else {
      this.ctx.fillStyle = color;
      this.ctx.fillRect(
        -design.width / 2,
        -design.height / 2,
        design.width,
        design.height
      );
    }

    this.ctx.restore();

    const texture = new THREE.CanvasTexture(this.canvas);
    texture.needsUpdate = true;
    texture.colorSpace = THREE.SRGBColorSpace;

    this.decalTextures.set(key, texture);

    return texture;
  }

  applyDecal(
    carGroup: THREE.Group,
    design: DecalDesign,
    placement: DecalPlacement,
    color: string,
    opacity: number,
    decalId: string,
    scale: number = 1,
    rotation: number = 0,
    offsetX: number = 0,
    offsetY: number = 0
  ): THREE.Mesh | null {
    const targetMesh = this.findMeshByName(carGroup, placement.meshName);
    
    if (!targetMesh) {
      console.warn(`Target mesh "${placement.meshName}" not found`);
      return null;
    }

    this.removeDecal(decalId);

    const texture = this.createDecalTexture(design, color, opacity, scale, rotation);

    const decalMaterial = new THREE.MeshStandardMaterial({
      map: texture,
      transparent: true,
      opacity: 1,
      roughness: 0.5,
      metalness: 0.0,
      depthWrite: false,
      polygonOffset: true,
      polygonOffsetFactor: -1,
    });

    const decalGeometry = new THREE.PlaneGeometry(
      placement.uvScale.x,
      placement.uvScale.y
    );

    const decalMesh = new THREE.Mesh(decalGeometry, decalMaterial);

    decalMesh.name = `decal_${decalId}`;
    decalMesh.userData.decalId = decalId;

    this.positionDecalOnMesh(decalMesh, targetMesh, placement, offsetX, offsetY);

    carGroup.add(decalMesh);
    this.activeDecals.set(decalId, decalMesh);
    this.decalMeshes.set(decalId, decalMesh);

    return decalMesh;
  }

  private positionDecalOnMesh(
    decal: THREE.Mesh,
    targetMesh: THREE.Mesh,
    placement: DecalPlacement,
    offsetX: number,
    offsetY: number
  ): void {
    const worldPos = new THREE.Vector3();
    targetMesh.localToWorld(worldPos);

    decal.position.copy(worldPos);
    decal.position.x += placement.uvOffset.x + offsetX;
    decal.position.y += placement.uvOffset.y + offsetY;
    decal.position.z += 0.01;

    decal.rotation.copy(targetMesh.rotation);
    decal.rotation.x += Math.PI / 2;

    decal.scale.multiply(targetMesh.scale);
  }

  updateDecal(
    _decalId: string,
    _updates: {
      color?: string;
      opacity?: number;
      scale?: number;
      rotation?: number;
      offsetX?: number;
      offsetY?: number;
    }
  ): void {
  }

  removeDecal(decalId: string): void {
    const decal = this.activeDecals.get(decalId);
    if (decal) {
      if (decal.parent) {
        decal.parent.remove(decal);
      }

      const material = decal.material as THREE.MeshStandardMaterial;
      if (material.map) {
        material.map.dispose();
      }
      material.dispose();

      decal.geometry.dispose();

      this.activeDecals.delete(decalId);
      this.decalMeshes.delete(decalId);
    }
  }

  clearAllDecals(): void {
    this.activeDecals.forEach((_decal, id) => {
      this.removeDecal(id);
    });
  }

  private findMeshByName(object: THREE.Object3D, name: string): THREE.Mesh | null {
    let found: THREE.Mesh | null = null;
    
    object.traverse((child) => {
      if (!found && child instanceof THREE.Mesh && child.name.toLowerCase().includes(name.toLowerCase())) {
        found = child;
      }
    });
    
    return found;
  }

  createStripeTexture(
    color: string,
    opacity: number,
    stripeWidth: number = 50,
    isRacingStripe: boolean = true
  ): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.globalAlpha = opacity;

    if (isRacingStripe) {
      ctx.fillStyle = color;
      ctx.fillRect(0, 256 - stripeWidth / 2, 512, stripeWidth);
    } else {
      ctx.fillStyle = color;
      ctx.fillRect(0, 0, 512, stripeWidth);
      ctx.fillRect(0, 512 - stripeWidth, 512, stripeWidth);
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.needsUpdate = true;

    return texture;
  }

  createNumberTexture(
    number: string,
    color: string,
    font: string = 'Arial',
    size: number = 200
  ): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 256;
    const ctx = canvas.getContext('2d')!;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = color;
    ctx.font = `bold ${size}px ${font}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(number, canvas.width / 2, canvas.height / 2);

    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;

    return texture;
  }

  isDecalActive(decalId: string): boolean {
    return this.activeDecals.has(decalId);
  }

  getActiveDecals(): string[] {
    return Array.from(this.activeDecals.keys());
  }

  dispose(): void {
    this.clearAllDecals();
    this.decalTextures.forEach((texture) => texture.dispose());
    this.decalTextures.clear();
  }
}

export const decalManager = new DecalManager();
