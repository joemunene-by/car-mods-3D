import * as THREE from 'three';

export class SceneManager {
  private scene: THREE.Scene;
  private renderer: THREE.WebGLRenderer;
  private container: HTMLDivElement;
  private raycaster: THREE.Raycaster;

  constructor(container: HTMLDivElement) {
    this.container = container;

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xf3f3f3);

    this.raycaster = new THREE.Raycaster();

    // `antialias: true` enables MSAA on the default framebuffer (when supported).
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: false,
      powerPreference: 'high-performance',
    });

    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;

    this.resize(container.clientWidth, container.clientHeight);

    container.appendChild(this.renderer.domElement);
  }

  getScene(): THREE.Scene {
    return this.scene;
  }

  getRenderer(): THREE.WebGLRenderer {
    return this.renderer;
  }

  getCanvas(): HTMLCanvasElement {
    return this.renderer.domElement;
  }

  resize(width: number, height: number): void {
    if (width <= 0 || height <= 0) return;
    this.renderer.setSize(width, height, false);
  }

  render(camera: THREE.Camera): void {
    this.renderer.render(this.scene, camera);
  }

  raycast(pointerNdc: THREE.Vector2, camera: THREE.Camera, objects?: THREE.Object3D[]): THREE.Intersection[] {
    this.raycaster.setFromCamera(pointerNdc, camera);
    return this.raycaster.intersectObjects(objects ?? this.scene.children, true);
  }

  dispose(): void {
    this.renderer.dispose();

    if (this.container && this.renderer.domElement.parentNode === this.container) {
      this.container.removeChild(this.renderer.domElement);
    }
  }
}
