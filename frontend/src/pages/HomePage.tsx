import { Link } from 'react-router-dom';

function HomePage() {
  return (
    <div className="page">
      <div className="hero">
        <h1>Car Mods 3D</h1>
        <p>Customize your dream car in stunning 3D</p>
        <Link to="/customizer">
          <button>Start Customizing</button>
        </Link>
      </div>
    </div>
  );
}

export default HomePage;
