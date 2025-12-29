import * as THREE from 'three';
import { DecalPlacement, DecalConfig } from '../store/customizationStore';

export interface DecalTextureData {
  canvas: HTMLCanvasElement;
  texture: THREE.CanvasTexture;
}

export interface DecalRenderConfig {
  width: number;
  height: number;
  color: string;
  opacity: number;
  type: 'stripe' | 'logo' | 'graphic' | 'number' | 'text';
  text?: string;
  fontSize?: number;
  rotation?: number;
  scale?: number;
}

const DECAL_PLACEMENT_ZONES: Record<DecalPlacement, { position: { x: number; y: number; z: number }; rotation: { x: number; y: number; z: number }; size: { width: number; height: number } }> = {
  HOOD: { position: { x: 0, y: 0.85, z: 0.8 }, rotation: { x: -90, y: 0, z: 0 }, size: { width: 0.8, height: 0.4 } },
  ROOF: { position: { x: 0, y: 1.35, z: -0.3 }, rotation: { x: -90, y: 0, z: 0 }, size: { width: 1.0, height: 0.6 } },
  TRUNK: { position: { x: 0, y: 1.0, z: -1.9 }, rotation: { x: -90, y: 0, z: 0 }, size: { width: 0.8, height: 0.3 } },
  DOOR_LEFT: { position: { x: -0.6, y: 0.7, z: 0 }, rotation: { x: 0, y: 0, z: 90 }, size: { width: 1.2, height: 0.15 } },
  DOOR_RIGHT: { position: { x: 0.6, y: 0.7, z: 0 }, rotation: { x: 0, y: 0, z: -90 }, size: { width: 1.2, height: 0.15 } },
  QUARTER_LEFT: { position: { x: -0.7, y: 0.7, z: -1.2 }, rotation: { x: 0, y: 0, z: 45 }, size: { width: 0.6, height: 0.15 } },
  QUARTER_RIGHT: { position: { x: 0.7, y: 0.7, z: -1.2 }, rotation: { x: 0, y: 0, z: -45 }, size: { width: 0.6, height: 0.15 } },
  BUMPER_FRONT: { position: { x: 0, y: 0.45, z: 2.2 }, rotation: { x: -90, y: 0, z: 0 }, size: { width: 1.4, height: 0.15 } },
  BUMPER_REAR: { position: { x: 0, y: 0.45, z: -2.2 }, rotation: { x: -90, y: 0, z: 0 }, size: { width: 1.4, height: 0.15 } },
};

export class DecalManager {
  private carGroup: THREE.Group | null = null;
  private decalMeshes: Map<string, THREE.Mesh> = new Map();
  private decalTextures: Map<string, DecalTextureData> = new Map();
  private canvasPool: HTMLCanvasElement[] = [];
  private maxPoolSize = 10;

  initialize(_scene: THREE.Scene, carGroup: THREE.Group): void {
    this.carGroup = carGroup;
  }

  createDecalTexture(config: DecalRenderConfig): DecalTextureData {
    let canvas: HTMLCanvasElement;

    if (this.canvasPool.length > 0) {
      canvas = this.canvasPool.pop()!;
      const ctx = canvas.getContext('2d')!;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    } else {
      canvas = document.createElement('canvas');
      canvas.width = 1024;
      canvas.height = 1024;
    }

    const ctx = canvas.getContext('2d')!;
    ctx.globalAlpha = config.opacity;

    switch (config.type) {
      case 'stripe':
        this.drawStripe(ctx, config);
        break;
      case 'logo':
        this.drawLogo(ctx, config);
        break;
      case 'graphic':
        this.drawGraphic(ctx, config);
        break;
      case 'number':
        this.drawNumber(ctx, config);
        break;
      case 'text':
        this.drawText(ctx, config);
        break;
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;

    return { canvas, texture };
  }

  private drawStripe(ctx: CanvasRenderingContext2D, config: DecalRenderConfig): void {
    ctx.fillStyle = config.color;
    const centerY = ctx.canvas.height / 2;
    const stripeHeight = ctx.canvas.height * 0.3;
    
    ctx.fillRect(0, centerY - stripeHeight / 2, ctx.canvas.width, stripeHeight);
  }

  private drawLogo(ctx: CanvasRenderingContext2D, config: DecalRenderConfig): void {
    ctx.fillStyle = config.color;
    ctx.strokeStyle = config.color;
    ctx.lineWidth = 20;
    
    ctx.beginPath();
    ctx.arc(ctx.canvas.width / 2, ctx.canvas.height / 2, ctx.canvas.width * 0.35, 0, Math.PI * 2);
    ctx.stroke();
    
    ctx.beginPath();
    ctx.moveTo(ctx.canvas.width * 0.3, ctx.canvas.height * 0.4);
    ctx.lineTo(ctx.canvas.width * 0.5, ctx.canvas.height * 0.7);
    ctx.lineTo(ctx.canvas.width * 0.7, ctx.canvas.height * 0.4);
    ctx.closePath();
    ctx.fill();
  }

  private drawGraphic(ctx: CanvasRenderingContext2D, config: DecalRenderConfig): void {
    ctx.fillStyle = config.color;
    ctx.strokeStyle = config.color;
    ctx.lineWidth = 15;
    
    ctx.beginPath();
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const x = ctx.canvas.width / 2 + Math.cos(angle) * ctx.canvas.width * 0.3;
      const y = ctx.canvas.height / 2 + Math.sin(angle) * ctx.canvas.height * 0.3;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.stroke();
    
    ctx.beginPath();
    ctx.arc(ctx.canvas.width / 2, ctx.canvas.height / 2, ctx.canvas.width * 0.15, 0, Math.PI * 2);
    ctx.fill();
  }

  private drawNumber(ctx: CanvasRenderingContext2D, config: DecalRenderConfig): void {
    if (!config.text) return;
    
    ctx.fillStyle = config.color;
    ctx.font = `bold ${config.fontSize || 400}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    ctx.fillText(config.text, ctx.canvas.width / 2, ctx.canvas.height / 2);
  }

  private drawText(ctx: CanvasRenderingContext2D, config: DecalRenderConfig): void {
    if (!config.text) return;
    
    ctx.fillStyle = config.color;
    ctx.font = `bold ${config.fontSize || 200}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    ctx.save();
    ctx.translate(ctx.canvas.width / 2, ctx.canvas.height / 2);
    ctx.rotate((config.rotation || 0) * Math.PI / 180);
    ctx.fillText(config.text, 0, 0);
    ctx.restore();
  }

  createDecalMesh(
    decalConfig: DecalConfig,
    decalTypeConfig: { type: string }
  ): THREE.Mesh | null {
    const placementConfig = DECAL_PLACEMENT_ZONES[decalConfig.placement];
    if (!placementConfig || !this.carGroup) return null;

    const existingMesh = this.decalMeshes.get(decalConfig.id);
    if (existingMesh) {
      this.removeDecal(decalConfig.id);
    }

    const textureData = this.createDecalTexture({
      width: 1024,
      height: 1024,
      color: decalConfig.color,
      opacity: decalConfig.opacity,
      type: decalTypeConfig.type as DecalRenderConfig['type'],
      rotation: decalConfig.rotation,
      scale: decalConfig.scale,
    });

    const material = new THREE.MeshStandardMaterial({
      map: textureData.texture,
      transparent: true,
      opacity: 1,
      roughness: 0.5,
      metalness: 0.0,
      side: THREE.DoubleSide,
      depthWrite: false,
    });

    const geometry = new THREE.PlaneGeometry(
      placementConfig.size.width * decalConfig.scale,
      placementConfig.size.height * decalConfig.scale
    );

    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(
      placementConfig.position.x + decalConfig.offsetX,
      placementConfig.position.y,
      placementConfig.position.z + decalConfig.offsetY
    );
    mesh.rotation.set(
      placementConfig.rotation.x * (Math.PI / 180),
      placementConfig.rotation.y * (Math.PI / 180),
      placementConfig.rotation.z * (Math.PI / 180) + (decalConfig.rotation * Math.PI) / 180
    );

    this.decalMeshes.set(decalConfig.id, mesh);
    this.decalTextures.set(decalConfig.id, textureData);

    return mesh;
  }

  updateDecal(decalId: string, updates: Partial<DecalConfig>): void {
    const existingMesh = this.decalMeshes.get(decalId);
    if (!existingMesh) return;

    const newConfig = { ...existingMesh.userData, ...updates } as DecalConfig;
    
    const placementConfig = DECAL_PLACEMENT_ZONES[newConfig.placement];
    if (placementConfig) {
      existingMesh.position.x = placementConfig.position.x + newConfig.offsetX;
      existingMesh.position.z = placementConfig.position.z + newConfig.offsetY;
      
      const material = existingMesh.material as THREE.MeshStandardMaterial;
      if (updates.color || updates.opacity) {
        const textureData = this.createDecalTexture({
          width: 1024,
          height: 1024,
          color: newConfig.color,
          opacity: newConfig.opacity,
          type: 'stripe',
          rotation: newConfig.rotation,
          scale: newConfig.scale,
        });
        
        material.map?.dispose();
        material.map = textureData.texture;
        material.needsUpdate = true;
        
        const oldTexture = this.decalTextures.get(decalId);
        if (oldTexture && this.canvasPool.length < this.maxPoolSize) {
          this.canvasPool.push(oldTexture.canvas);
        }
        this.decalTextures.set(decalId, textureData);
      }
    }
  }

  addDecal(decalConfig: DecalConfig, decalTypeConfig: { type: string }): THREE.Mesh | null {
    const mesh = this.createDecalMesh(decalConfig, decalTypeConfig);
    if (mesh && this.carGroup) {
      this.carGroup.add(mesh);
    }
    return mesh;
  }

  removeDecal(decalId: string): void {
    const mesh = this.decalMeshes.get(decalId);
    if (mesh && mesh.parent) {
      mesh.parent.remove(mesh);
      
      const geometry = mesh.geometry;
      const material = mesh.material;
      geometry.dispose();
      if (Array.isArray(material)) {
        material.forEach((m) => {
          if (m instanceof THREE.MeshStandardMaterial) {
            m.map?.dispose();
          }
          m.dispose();
        });
      } else if (material instanceof THREE.MeshStandardMaterial) {
        material.map?.dispose();
        material.dispose();
      }
    }

    const textureData = this.decalTextures.get(decalId);
    if (textureData) {
      textureData.texture.dispose();
      if (this.canvasPool.length < this.maxPoolSize) {
        this.canvasPool.push(textureData.canvas);
      }
    }

    this.decalMeshes.delete(decalId);
    this.decalTextures.delete(decalId);
  }

  clearAllDecals(): void {
    const decalIds = Array.from(this.decalMeshes.keys());
    decalIds.forEach((id) => this.removeDecal(id));
  }

  renderAllDecals(): void {
    this.clearAllDecals();
  }

  getDecalMesh(decalId: string): THREE.Mesh | undefined {
    return this.decalMeshes.get(decalId);
  }

  getAllDecalMeshes(): THREE.Mesh[] {
    return Array.from(this.decalMeshes.values());
  }

  dispose(): void {
    this.clearAllDecals();
    this.canvasPool.forEach((canvas) => {
      const ctx = canvas.getContext('2d');
      ctx?.clearRect(0, 0, canvas.width, canvas.height);
    });
    this.canvasPool = [];
  }
}

export const decalManager = new DecalManager();
