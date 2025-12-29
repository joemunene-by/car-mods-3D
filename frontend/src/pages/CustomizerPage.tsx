import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import CarViewer from '../three-viewer/CarViewer';

function CustomizerPage() {
  return (
    <div className="page">
      <div className="container">
        <h1>Car Customizer</h1>
        <div className="canvas-container">
          <Canvas>
            <PerspectiveCamera makeDefault position={[5, 2, 5]} />
            <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} />
            <ambientLight intensity={0.5} />
            <directionalLight position={[10, 10, 5]} intensity={1} />
            <CarViewer />
          </Canvas>
        </div>
      </div>
    </div>
  );
}

export default CustomizerPage;
