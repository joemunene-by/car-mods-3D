import * as THREE from 'three';

export type ControlsConfig = {
  rotationSpeed: number;
  zoomSpeed: number;
  dampingFactor: number;
  minPolarAngle: number;
  maxPolarAngle: number;
  minDistance: number;
  maxDistance: number;
};

export class ControlsManager {
  private camera: THREE.PerspectiveCamera;
  private target: THREE.Vector3;
  private canvas: HTMLCanvasElement;
  private config: ControlsConfig;

  private isDragging = false;
  private lastMouse = { x: 0, y: 0 };

  private spherical = new THREE.Spherical();
  private targetSpherical = new THREE.Spherical();

  constructor(
    camera: THREE.PerspectiveCamera,
    target: THREE.Vector3,
    canvas: HTMLCanvasElement,
    config?: Partial<ControlsConfig>
  ) {
    this.camera = camera;
    this.target = target;
    this.canvas = canvas;

    this.config = {
      rotationSpeed: 0.005,
      zoomSpeed: 0.002,
      dampingFactor: 0.12,
      minPolarAngle: 0.2,
      maxPolarAngle: Math.PI - 0.2,
      minDistance: 2.5,
      maxDistance: 12,
      ...config,
    };

    this.updateSpherical();

    this.canvas.addEventListener('mousedown', this.onMouseDown);
    this.canvas.addEventListener('wheel', this.onWheel, { passive: false });
    this.canvas.addEventListener('touchstart', this.onTouchStart, { passive: false });
  }

  private updateSpherical(): void {
    const offset = new THREE.Vector3().subVectors(this.camera.position, this.target);
    this.spherical.setFromVector3(offset);
    this.targetSpherical.copy(this.spherical);
    this.targetSpherical.radius = THREE.MathUtils.clamp(
      this.targetSpherical.radius,
      this.config.minDistance,
      this.config.maxDistance
    );
    this.spherical.radius = this.targetSpherical.radius;
  }

  private clampRotation(): void {
    this.targetSpherical.phi = THREE.MathUtils.clamp(
      this.targetSpherical.phi,
      this.config.minPolarAngle,
      this.config.maxPolarAngle
    );
  }

  private clampZoom(): void {
    this.targetSpherical.radius = THREE.MathUtils.clamp(
      this.targetSpherical.radius,
      this.config.minDistance,
      this.config.maxDistance
    );
  }

  private onMouseDown = (e: MouseEvent): void => {
    if (e.button !== 0) return;

    this.isDragging = true;
    this.lastMouse = { x: e.clientX, y: e.clientY };

    document.addEventListener('mousemove', this.onMouseMove);
    document.addEventListener('mouseup', this.onMouseUp);
  };

  private onMouseMove = (e: MouseEvent): void => {
    if (!this.isDragging) return;

    const deltaX = e.clientX - this.lastMouse.x;
    const deltaY = e.clientY - this.lastMouse.y;

    this.targetSpherical.theta -= deltaX * this.config.rotationSpeed;
    this.targetSpherical.phi += deltaY * this.config.rotationSpeed;
    this.clampRotation();

    this.lastMouse = { x: e.clientX, y: e.clientY };
  };

  private onMouseUp = (): void => {
    this.isDragging = false;
    document.removeEventListener('mousemove', this.onMouseMove);
    document.removeEventListener('mouseup', this.onMouseUp);
  };

  private onWheel = (e: WheelEvent): void => {
    e.preventDefault();

    const delta = e.deltaY * this.config.zoomSpeed;
    this.targetSpherical.radius += delta;
    this.clampZoom();
  };

  private lastTouch: { distance: number } | null = null;

  private onTouchStart = (e: TouchEvent): void => {
    e.preventDefault();

    if (e.touches.length === 1) {
      this.isDragging = true;
      this.lastMouse = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      document.addEventListener('touchmove', this.onTouchMove);
      document.addEventListener('touchend', this.onTouchEnd);
      return;
    }

    if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      this.lastTouch = { distance: Math.sqrt(dx * dx + dy * dy) };
      document.addEventListener('touchmove', this.onTouchMove);
      document.addEventListener('touchend', this.onTouchEnd);
    }
  };

  private onTouchMove = (e: TouchEvent): void => {
    e.preventDefault();

    if (e.touches.length === 1 && this.isDragging) {
      const deltaX = e.touches[0].clientX - this.lastMouse.x;
      const deltaY = e.touches[0].clientY - this.lastMouse.y;

      this.targetSpherical.theta -= deltaX * this.config.rotationSpeed;
      this.targetSpherical.phi += deltaY * this.config.rotationSpeed;
      this.clampRotation();

      this.lastMouse = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      return;
    }

    if (e.touches.length === 2 && this.lastTouch) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const distance = Math.sqrt(dx * dx + dy * dy);

      const delta = (this.lastTouch.distance - distance) * 0.01;
      this.targetSpherical.radius += delta;
      this.clampZoom();

      this.lastTouch.distance = distance;
    }
  };

  private onTouchEnd = (): void => {
    this.isDragging = false;
    this.lastTouch = null;
    document.removeEventListener('touchmove', this.onTouchMove);
    document.removeEventListener('touchend', this.onTouchEnd);
  };

  update(): void {
    this.spherical.theta += (this.targetSpherical.theta - this.spherical.theta) * this.config.dampingFactor;
    this.spherical.phi += (this.targetSpherical.phi - this.spherical.phi) * this.config.dampingFactor;
    this.spherical.radius +=
      (this.targetSpherical.radius - this.spherical.radius) * this.config.dampingFactor;

    const offset = new THREE.Vector3().setFromSpherical(this.spherical);
    this.camera.position.copy(this.target.clone().add(offset));
    this.camera.lookAt(this.target);
  }

  reset(): void {
    this.updateSpherical();
  }

  rotateBy(deltaTheta: number, deltaPhi = 0): void {
    this.targetSpherical.theta += deltaTheta;
    this.targetSpherical.phi += deltaPhi;
    this.clampRotation();
  }

  zoomBy(delta: number): void {
    this.targetSpherical.radius += delta;
    this.clampZoom();
  }

  dispose(): void {
    this.canvas.removeEventListener('mousedown', this.onMouseDown);
    this.canvas.removeEventListener('wheel', this.onWheel);
    this.canvas.removeEventListener('touchstart', this.onTouchStart);
    document.removeEventListener('mousemove', this.onMouseMove);
    document.removeEventListener('mouseup', this.onMouseUp);
    document.removeEventListener('touchmove', this.onTouchMove);
    document.removeEventListener('touchend', this.onTouchEnd);
  }
}
