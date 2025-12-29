import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import CustomizerPage from './pages/CustomizerPage';
import './styles/App.css';

function App() {
  return (
    <Router>
      <div className="app">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/customizer" element={<CustomizerPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
