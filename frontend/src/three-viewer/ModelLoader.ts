import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import type { GLTF } from 'three/examples/jsm/loaders/GLTFLoader.js';

export type LoadedModel = {
  url: string;
  object: THREE.Group;
  dispose: () => void;
};

const gltfCache = new Map<string, Promise<GLTF>>();

const traverseMaterials = (material: THREE.Material, cb: (m: THREE.Material) => void) => {
  cb(material);

  // Dispose textures attached to common material maps
  const anyMat = material as unknown as Record<string, unknown>;
  for (const key of [
    'map',
    'normalMap',
    'roughnessMap',
    'metalnessMap',
    'aoMap',
    'emissiveMap',
    'alphaMap',
    'bumpMap',
    'displacementMap',
    'envMap',
  ]) {
    const tex = anyMat[key];
    if (tex && tex instanceof THREE.Texture) {
      tex.dispose();
    }
  }
};

export const disposeObject3D = (object: THREE.Object3D): void => {
  object.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      child.geometry.dispose();

      if (Array.isArray(child.material)) {
        child.material.forEach((m) => traverseMaterials(m, (mat) => mat.dispose()));
      } else if (child.material) {
        traverseMaterials(child.material, (mat) => mat.dispose());
      }
    }
  });
};

const computeBounds = (object: THREE.Object3D) => {
  const box = new THREE.Box3().setFromObject(object);
  const size = new THREE.Vector3();
  const center = new THREE.Vector3();
  box.getSize(size);
  box.getCenter(center);
  return { box, size, center };
};

export const centerAndScaleModel = (object: THREE.Object3D, desiredSize = 4): void => {
  const { size, center } = computeBounds(object);

  object.position.sub(center);

  const maxDimension = Math.max(size.x, size.y, size.z);
  if (maxDimension > 0) {
    const scale = desiredSize / maxDimension;
    object.scale.setScalar(scale);
  }

  const { center: centeredCenter } = computeBounds(object);
  object.position.sub(centeredCenter);
};

const postProcessModel = (object: THREE.Object3D) => {
  object.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      child.castShadow = true;
      child.receiveShadow = true;

      const geometry = child.geometry;
      if (!geometry.attributes.normal) {
        geometry.computeVertexNormals();
      }
    }
  });
};

export class ModelLoader {
  private loader: GLTFLoader;

  constructor() {
    this.loader = new GLTFLoader();
  }

  private getOrLoad(url: string): Promise<GLTF> {
    const existing = gltfCache.get(url);
    if (existing) return existing;

    const p = this.loader.loadAsync(url);
    gltfCache.set(url, p);
    return p;
  }

  async load(url: string, desiredSize = 4): Promise<LoadedModel> {
    const gltf = await this.getOrLoad(url);

    const object = gltf.scene.clone(true);
    postProcessModel(object);
    centerAndScaleModel(object, desiredSize);

    return {
      url,
      object,
      dispose: () => disposeObject3D(object),
    };
  }
}
