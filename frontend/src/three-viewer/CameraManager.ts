import * as THREE from 'three';

export type CameraLimits = {
  minDistance: number;
  maxDistance: number;
};

export class CameraManager {
  private camera: THREE.PerspectiveCamera;
  private target: THREE.Vector3;
  private limits: CameraLimits;

  constructor(container: HTMLDivElement) {
    const aspect = container.clientWidth > 0 && container.clientHeight > 0
      ? container.clientWidth / container.clientHeight
      : 1;

    this.camera = new THREE.PerspectiveCamera(65, aspect, 0.1, 1000);

    this.target = new THREE.Vector3(0, 0, 0);

    this.limits = {
      minDistance: 2.5,
      maxDistance: 12,
    };

    this.reset();
  }

  getCamera(): THREE.PerspectiveCamera {
    return this.camera;
  }

  getTarget(): THREE.Vector3 {
    return this.target;
  }

  setLimits(limits: Partial<CameraLimits>): void {
    this.limits = { ...this.limits, ...limits };
  }

  getLimits(): CameraLimits {
    return this.limits;
  }

  resize(width: number, height: number): void {
    if (width <= 0 || height <= 0) return;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
  }

  getDistanceToTarget(): number {
    return this.camera.position.distanceTo(this.target);
  }

  setDistanceToTarget(distance: number): void {
    const clamped = THREE.MathUtils.clamp(distance, this.limits.minDistance, this.limits.maxDistance);

    const dir = new THREE.Vector3().subVectors(this.camera.position, this.target).normalize();
    this.camera.position.copy(this.target.clone().add(dir.multiplyScalar(clamped)));
    this.camera.lookAt(this.target);
  }

  reset(): void {
    // Front-slightly-elevated view
    this.camera.position.set(4, 2, 6);
    this.camera.lookAt(this.target);
    this.setDistanceToTarget(this.getDistanceToTarget());
  }

  dispose(): void {
    // no-op
  }
}
