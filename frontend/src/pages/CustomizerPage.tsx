import CarViewer from '../components/CarViewer';
import CustomizationPanel from '../components/CustomizationPanel';
import { useCustomizationStore } from '../store/customizationStore';
import { useEffect } from 'react';
import './CustomizerPage.css';

function CustomizerPage() {
  const { selectedCarId, setSelectedCar } = useCustomizationStore();

  useEffect(() => {
    if (!selectedCarId) {
      setSelectedCar('default-car', 50000); // Default car with base price
    }
  }, [selectedCarId, setSelectedCar]);

  return (
    <div className="page customizer-page">
      <div className="customizer-layout">
        <div className="viewer-section">
          <CarViewer />
        </div>
        <div className="panel-section">
          <CustomizationPanel />
        </div>
      </div>
    </div>
  );
}

export default CustomizerPage;
