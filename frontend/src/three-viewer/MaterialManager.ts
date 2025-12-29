import * as THREE from 'three';
import type { PaintFinish } from '../store/customizationStore';

export class MaterialManager {
  private materials: Map<string, THREE.MeshStandardMaterial> = new Map();
  private paintMaterials: Map<string, THREE.MeshStandardMaterial> = new Map();

  createPaintMaterial(
    color: string,
    finish: PaintFinish,
    existingMaterial?: THREE.MeshStandardMaterial
  ): THREE.MeshStandardMaterial {
    const material = existingMaterial || new THREE.MeshStandardMaterial({
      color: new THREE.Color(color),
      roughness: 0.5,
      metalness: 0.5,
    });

    const parsedColor = new THREE.Color(color);

    switch (finish) {
      case 'matte':
        material.roughness = 0.9;
        material.metalness = 0.0;
        material.envMapIntensity = 0.2;
        break;
      case 'glossy':
        material.roughness = 0.1;
        material.metalness = 0.0;
        material.envMapIntensity = 1.0;
        break;
      case 'metallic':
        material.roughness = 0.3;
        material.metalness = 0.8;
        material.envMapIntensity = 1.2;
        break;
      case 'pearl':
        material.roughness = 0.2;
        material.metalness = 0.6;
        material.envMapIntensity = 1.5;
        break;
    }

    material.color.copy(parsedColor);

    this.paintMaterials.set(material.uuid, material);

    return material;
  }

  createWheelMaterial(
    finish: 'chrome' | 'matte_black' | 'polished' | 'brushed'
  ): THREE.MeshStandardMaterial {
    const material = new THREE.MeshStandardMaterial({
      roughness: 0.3,
      metalness: 0.9,
    });

    switch (finish) {
      case 'chrome':
        material.color.setHex(0xcccccc);
        material.roughness = 0.1;
        material.metalness = 1.0;
        break;
      case 'matte_black':
        material.color.setHex(0x1a1a1a);
        material.roughness = 0.8;
        material.metalness = 0.1;
        break;
      case 'polished':
        material.color.setHex(0xaaaaaa);
        material.roughness = 0.2;
        material.metalness = 0.95;
        break;
      case 'brushed':
        material.color.setHex(0x888888);
        material.roughness = 0.4;
        material.metalness = 0.85;
        break;
    }

    return material;
  }

  createCarbonFiberMaterial(): THREE.MeshStandardMaterial {
    return new THREE.MeshStandardMaterial({
      color: 0x1a1a1a,
      roughness: 0.3,
      metalness: 0.3,
    });
  }

  createPlasticMaterial(color: string = '#1a1a1a'): THREE.MeshStandardMaterial {
    return new THREE.MeshStandardMaterial({
      color: new THREE.Color(color),
      roughness: 0.7,
      metalness: 0.0,
    });
  }

  createAluminumMaterial(): THREE.MeshStandardMaterial {
    return new THREE.MeshStandardMaterial({
      color: 0xcccccc,
      roughness: 0.4,
      metalness: 0.9,
    });
  }

  applyPaintToMesh(
    mesh: THREE.Mesh,
    color: string,
    finish: PaintFinish
  ): void {
    const material = mesh.material as THREE.MeshStandardMaterial;
    if (material) {
      this.createPaintMaterial(color, finish, material);
      mesh.material = material;
      material.needsUpdate = true;
    }
  }

  applyMaterialToMesh(
    mesh: THREE.Mesh,
    material: THREE.MeshStandardMaterial
  ): void {
    mesh.material = material;
    material.needsUpdate = true;
  }

  findBodyMeshes(object: THREE.Object3D): THREE.Mesh[] {
    const bodyMeshes: THREE.Mesh[] = [];
    
    object.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        const name = child.name.toLowerCase();
        if (
          name.includes('body') ||
          name.includes('paint') ||
          name.includes('panel') ||
          name.includes('door') ||
          name.includes('hood') ||
          name.includes('trunk') ||
          name.includes('fender') ||
          name.includes('quarter')
        ) {
          bodyMeshes.push(child);
        }
      }
    });
    
    return bodyMeshes;
  }

  findWheelMeshes(object: THREE.Object3D): THREE.Mesh[] {
    const wheelMeshes: THREE.Mesh[] = [];
    
    object.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        const name = child.name.toLowerCase();
        if (
          name.includes('wheel') ||
          name.includes('rim') ||
          name.includes('tire')
        ) {
          wheelMeshes.push(child);
        }
      }
    });
    
    return wheelMeshes;
  }

  findMeshByName(object: THREE.Object3D, name: string): THREE.Mesh | null {
    let found: THREE.Mesh | null = null;
    
    object.traverse((child) => {
      if (!found && child instanceof THREE.Mesh && child.name.toLowerCase().includes(name.toLowerCase())) {
        found = child;
      }
    });
    
    return found;
  }

  findMeshesByPrefix(object: THREE.Object3D, prefix: string): THREE.Mesh[] {
    const meshes: THREE.Mesh[] = [];
    
    object.traverse((child) => {
      if (child instanceof THREE.Mesh && child.name.toLowerCase().startsWith(prefix.toLowerCase())) {
        meshes.push(child);
      }
    });
    
    return meshes;
  }

  dispose(): void {
    this.materials.forEach((material) => material.dispose());
    this.paintMaterials.forEach((material) => material.dispose());
    this.materials.clear();
    this.paintMaterials.clear();
  }
}

export const materialManager = new MaterialManager();
