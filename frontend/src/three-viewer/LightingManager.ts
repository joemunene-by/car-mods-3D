import * as THREE from 'three';

export class LightingManager {
  private lights: THREE.Light[] = [];
  private scene: THREE.Scene;
  private groundPlane: THREE.Mesh<THREE.PlaneGeometry, THREE.ShadowMaterial> | null = null;

  constructor(scene: THREE.Scene) {
    this.scene = scene;
    this.setupLights();
  }

  private setupLights(): void {
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    this.lights.push(ambientLight);
    this.scene.add(ambientLight);

    const mainDirectionalLight = new THREE.DirectionalLight(0xffffff, 1.2);
    mainDirectionalLight.position.set(5, 10, 5);
    mainDirectionalLight.castShadow = true;
    mainDirectionalLight.shadow.mapSize.width = 2048;
    mainDirectionalLight.shadow.mapSize.height = 2048;
    mainDirectionalLight.shadow.camera.near = 0.5;
    mainDirectionalLight.shadow.camera.far = 50;
    mainDirectionalLight.shadow.camera.left = -10;
    mainDirectionalLight.shadow.camera.right = 10;
    mainDirectionalLight.shadow.camera.top = 10;
    mainDirectionalLight.shadow.camera.bottom = -10;
    mainDirectionalLight.shadow.bias = -0.0001;
    this.lights.push(mainDirectionalLight);
    this.scene.add(mainDirectionalLight);

    const fillLight = new THREE.DirectionalLight(0xffffff, 0.4);
    fillLight.position.set(-5, 3, -5);
    this.lights.push(fillLight);
    this.scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0xffffff, 0.6);
    rimLight.position.set(0, 5, -8);
    this.lights.push(rimLight);
    this.scene.add(rimLight);

    const spotLight = new THREE.SpotLight(0xffffff, 0.8);
    spotLight.position.set(0, 15, 0);
    spotLight.angle = Math.PI / 6;
    spotLight.penumbra = 0.3;
    spotLight.decay = 2;
    spotLight.distance = 30;
    spotLight.castShadow = true;
    spotLight.shadow.mapSize.width = 1024;
    spotLight.shadow.mapSize.height = 1024;
    this.lights.push(spotLight);
    this.scene.add(spotLight);

    this.groundPlane = new THREE.Mesh(
      new THREE.PlaneGeometry(30, 30),
      new THREE.ShadowMaterial({ opacity: 0.3 })
    );
    this.groundPlane.rotation.x = -Math.PI / 2;
    this.groundPlane.position.y = -0.01;
    this.groundPlane.receiveShadow = true;
    this.scene.add(this.groundPlane);
  }

  getLights(): THREE.Light[] {
    return this.lights;
  }

  setIntensity(intensity: number): void {
    this.lights.forEach((light) => {
      light.intensity = light instanceof THREE.AmbientLight ? intensity * 0.5 : intensity;
    });
  }

  dispose(): void {
    this.lights.forEach((light) => {
      this.scene.remove(light);
    });
    this.lights = [];

    if (this.groundPlane) {
      this.scene.remove(this.groundPlane);
      this.groundPlane.geometry.dispose();
      this.groundPlane.material.dispose();
      this.groundPlane = null;
    }
  }
}
