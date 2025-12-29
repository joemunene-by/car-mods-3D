import * as THREE from 'three';
import { useCustomizationStore, PaintFinish } from '../store/customizationStore';

export type PaintZone = 'BODY' | 'ROOF' | 'TRIM' | 'ACCENTS' | 'MIRRORS';

const FINISH_PRESETS: Record<PaintFinish, { roughness: number; metalness: number; clearcoat: number; clearcoatRoughness: number }> = {
  MATTE: { roughness: 0.9, metalness: 0.0, clearcoat: 0.0, clearcoatRoughness: 0.5 },
  GLOSSY: { roughness: 0.2, metalness: 0.1, clearcoat: 1.0, clearcoatRoughness: 0.05 },
  METALLIC: { roughness: 0.3, metalness: 0.9, clearcoat: 0.8, clearcoatRoughness: 0.2 },
  PEARL: { roughness: 0.25, metalness: 0.6, clearcoat: 1.0, clearcoatRoughness: 0.1 },
};

export class MaterialManager {
  private carGroup: THREE.Group | null = null;
  private bodyMaterials: Map<string, THREE.MeshPhysicalMaterial> = new Map();
  private originalMaterials: Map<string, THREE.Material> = new Map();
  private cachedTextures: Map<string, THREE.Texture> = new Map();

  initialize(carGroup: THREE.Group): void {
    this.carGroup = carGroup;
    this.cacheBodyMaterials();
  }

  private cacheBodyMaterials(): void {
    if (!this.carGroup) return;

    this.carGroup.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        const name = child.name || this.generatePartName(child);
        
        if (this.isBodyPart(name, child)) {
          if (Array.isArray(child.material)) {
            child.material.forEach((mat, index) => {
              const key = `${name}_${index}`;
              if (mat instanceof THREE.MeshPhysicalMaterial) {
                this.bodyMaterials.set(key, mat);
                this.originalMaterials.set(key, mat.clone());
              } else if (mat instanceof THREE.MeshStandardMaterial) {
                const physMat = new THREE.MeshPhysicalMaterial();
                physMat.copy(mat);
                child.material = physMat;
                this.bodyMaterials.set(key, physMat);
                this.originalMaterials.set(key, physMat.clone());
              }
            });
          } else if (child.material instanceof THREE.MeshPhysicalMaterial) {
            this.bodyMaterials.set(name, child.material);
            this.originalMaterials.set(name, child.material.clone());
          } else if (child.material instanceof THREE.MeshStandardMaterial) {
            const physMat = new THREE.MeshPhysicalMaterial();
            physMat.copy(child.material);
            child.material = physMat;
            this.bodyMaterials.set(name, physMat);
            this.originalMaterials.set(name, physMat.clone());
          }
        }
      }
    });
  }

  private isBodyPart(name: string, mesh: THREE.Mesh): boolean {
    const bodyPartNames = [
      'body', 'body_panel', 'car_body', 'chassis', 'door', 'doors',
      'fender', 'fenders', 'hood', 'trunk', 'roof', 'quarter',
      'bumper', 'bumpers', 'skirt', 'skirts', 'mirror', 'mirrors',
    ];
    
    const lowerName = name.toLowerCase();
    return bodyPartNames.some((part) => lowerName.includes(part)) || 
           mesh.geometry.type === 'BoxGeometry' ||
           mesh.geometry.type === 'BufferGeometry';
  }

  private generatePartName(mesh: THREE.Mesh): string {
    const parent = mesh.parent;
    const parentName = parent?.name || 'unknown';
    const index = mesh.parent?.children.indexOf(mesh) ?? 0;
    return `${parentName}_part_${index}`;
  }

  updatePaint(color: string, finish: PaintFinish, zone?: PaintZone): void {
    const preset = FINISH_PRESETS[finish];
    
    this.bodyMaterials.forEach((material, key) => {
      const shouldUpdate = this.shouldApplyToZone(key, zone);
      
      if (shouldUpdate) {
        material.color.set(color);
        material.roughness = preset.roughness;
        material.metalness = preset.metalness;
        material.clearcoat = preset.clearcoat;
        material.clearcoatRoughness = preset.clearcoatRoughness;
        
        if (preset.clearcoat > 0) {
          material.envMapIntensity = 1.5;
        } else {
          material.envMapIntensity = 0.5;
        }
        
        material.needsUpdate = true;
      }
    });
  }

  private shouldApplyToZone(materialKey: string, zone?: PaintZone): boolean {
    if (!zone || zone === 'BODY') return true;

    const keyLower = materialKey.toLowerCase();
    
    switch (zone) {
      case 'ROOF':
        return keyLower.includes('roof') || keyLower.includes('top');
      case 'TRIM':
        return keyLower.includes('trim') || keyLower.includes('accent');
      case 'ACCENTS':
        return keyLower.includes('accent') || keyLower.includes('detail');
      case 'MIRRORS':
        return keyLower.includes('mirror');
      default:
        return true;
    }
  }

  updateZonePaint(zone: PaintZone, color: string, finish: PaintFinish): void {
    this.updatePaint(color, finish, zone);
  }

  setZoneColor(zone: PaintZone, color: string): void {
    const store = useCustomizationStore.getState();
    this.updatePaint(color, store.paint.finish, zone);
  }

  setZoneFinish(zone: PaintZone, finish: PaintFinish): void {
    const store = useCustomizationStore.getState();
    this.updatePaint(store.paint.color, finish, zone);
  }

  getCurrentMaterials(): Map<string, THREE.MeshPhysicalMaterial> {
    return new Map(this.bodyMaterials);
  }

  resetMaterials(): void {
    this.bodyMaterials.forEach((material, key) => {
      const original = this.originalMaterials.get(key);
      if (original instanceof THREE.MeshPhysicalMaterial) {
        material.color.copy(original.color);
        material.roughness = original.roughness;
        material.metalness = original.metalness;
        material.clearcoat = original.clearcoat;
        material.clearcoatRoughness = original.clearcoatRoughness;
        material.needsUpdate = true;
      }
    });
  }

  createEnvironmentMap(scene: THREE.Scene, renderer: THREE.WebGLRenderer): void {
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    pmremGenerator.compileEquirectangularShader();
    
    const envMap = pmremGenerator.fromScene(new THREE.Scene()).texture;
    
    this.bodyMaterials.forEach((material) => {
      material.envMap = envMap;
      material.envMapIntensity = 1.0;
    });
    
    scene.environment = envMap;
  }

  dispose(): void {
    this.cachedTextures.forEach((texture) => texture.dispose());
    this.cachedTextures.clear();
    this.bodyMaterials.clear();
    this.originalMaterials.clear();
  }
}

export const materialManager = new MaterialManager();
