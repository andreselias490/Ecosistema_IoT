import React, { useState, useEffect } from 'react';
import './styles/App.css';
import { WiHumidity, WiThermometer } from 'react-icons/wi';
import { MdLocationOn, MdAccessTime, MdRefresh, MdArrowDropDown, MdLogout } from 'react-icons/md';
import Grafica from './grafica';
import Predicciones from './predicciones';
import Promedio from './promedio';
import Correlacion from './correlacion';
import VerTodosRegistros from './vertodosregistros';
import Manual from './manual'; // Importar el componente Manual

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [view, setView] = useState('inicio');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false); // Asegurar que inicie cerrado

  useEffect(() => {
    const isAuthenticatedInStorage = localStorage.getItem('isAuthenticated');
    if (isAuthenticatedInStorage === 'true') {
      setIsAuthenticated(true);
      fetchLatestData();
    }
  }, []);

  const fetchLatestData = () => {
    setLoading(true);
    fetch('https://api.thingspeak.com/channels/2548222/feeds.json?results=1')
      .then((response) => response.json())
      .then((data) => {
        setData(data);
        setLoading(false);
      })
      .catch((error) => {
        setError(error);
        setLoading(false);
      });
  };

  const handleLogin = async (username, password) => {
    const loginUrl = 'https://us-central1-fir-usuarios-8a31a.cloudfunctions.net/loginUser'; 
    setLoading(true);
    try {
      const response = await fetch(loginUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }), 
      });
      const result = await response.json();
      
      if (result.message === 'Login exitoso.') { 
        setIsAuthenticated(true);
        localStorage.setItem('isAuthenticated', 'true');
        fetchLatestData();
        setMenuOpen(false); // Asegurar que el menú esté cerrado tras login
      } else {
        alert(`Error en el login: ${result.error}`);
      }
    } catch (error) {
      alert('Error durante el login');
    }
    setLoading(false);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('isAuthenticated');
    setMenuOpen(false); // Cerrar el menú al cerrar sesión
  };

  const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = (e) => {
      e.preventDefault();
      handleLogin(username, password);
    };

    return (
      <div className="login-container">
        <form className="login-form" onSubmit={handleSubmit}>
          <h1>Login</h1>
          <label>Username:</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <label>Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit">Iniciar Sesión</button>
        </form>
        {loading && <p>Cargando...</p>}
      </div>
    );
  };

  const handleMenuClick = (option) => {
    setMenuOpen(false); // Cerrar el menú tras seleccionar opción
    setView(option);
    if (option === 'inicio') {
      fetchLatestData();
    }
  };

  const renderContent = () => {
    if (!data || loading) {
      return <p>Cargando datos...</p>;
    }

    switch (view) {
      case 'inicio':
        return (
          <div className="data-list">
            <div className="data-section">
              <div className="data-icon">
                <MdAccessTime />
              </div>
              <div className="data-details">
                <p>Fecha y Hora: {new Date(data?.feeds[0]?.created_at).toLocaleString()}</p>
              </div>
            </div>
            <div className="data-section">
              <div className="data-icon">
                <WiHumidity />
              </div>
              <div className="data-details">
                <p>Humedad: {Math.round(data?.feeds[0]?.field1)}%</p>
              </div>
            </div>
            <div className="data-section">
              <div className="data-icon">
                <WiThermometer />
              </div>
              <div className="data-details">
                <p>Temperatura: {parseFloat(data?.feeds[0]?.field2).toFixed(1)}°C</p>
              </div>
            </div>
            <div className="data-section">
              <div className="data-icon">
                <MdLocationOn />
              </div>
              <div className="data-details">
                <p>Ubicación: ({data?.feeds[0]?.field3}, {data?.feeds[0]?.field4})</p>
                <iframe
                  title="Mapa"
                  width="100%"
                  height="200"
                  src={`https://www.openstreetmap.org/export/embed.html?bbox=${data?.feeds[0]?.field4},${data?.feeds[0]?.field3},${data?.feeds[0]?.field4},${data?.feeds[0]?.field3}&marker=${data?.feeds[0]?.field3},${data?.feeds[0]?.field4}&layers=ND`}
                ></iframe>
              </div>
            </div>
          </div>
        );
      case 'todos':
        return <VerTodosRegistros />;
      case 'predicciones':
        return <Predicciones />;
      case 'grafica':
        return <Grafica />;
      case 'promedio':
        return <Promedio />;
      case 'correlacion':
        return <Correlacion />;
      case 'manual':
        return <Manual />;
      default:
        return null;
    }
  };

  return (
    <div className="App">
      <header className="App-header">
      <p className="main-title">Monitor Ambiental Agrícola</p>
      <h3 className="subtitle"><i>Nave 3: Plántula de espárrago</i></h3>

        {isAuthenticated && (
          <div className="menu-dropdown">
            <MdArrowDropDown
              className="menu-icon"
              style={{ fontSize: '3rem' }}
              onClick={() => setMenuOpen(!menuOpen)} 
            />
            {menuOpen && (
              <div className="menu-content">
                <button onClick={() => handleMenuClick('inicio')} style={{ fontSize: '1.5rem' }}>Inicio</button>
                <button onClick={() => handleMenuClick('todos')} style={{ fontSize: '1.5rem' }}>Ver todos los registros</button>
                <button onClick={() => handleMenuClick('predicciones')} style={{ fontSize: '1.5rem' }}>Predicciones</button>
                <button onClick={() => handleMenuClick('grafica')} style={{ fontSize: '1.5rem' }}>Gráfica</button>
                <button onClick={() => handleMenuClick('promedio')} style={{ fontSize: '1.5rem' }}>Promedio</button>
                <button onClick={() => handleMenuClick('correlacion')} style={{ fontSize: '1.5rem' }}>Correlación</button>
                <button onClick={() => handleMenuClick('manual')} style={{ fontSize: '1.5rem' }}>Manual aplicación web</button>
                <button onClick={handleLogout} style={{ fontSize: '1.5rem', marginTop: '10px' }}>
                  <MdLogout className="icon" />
                  Cerrar Sesión
                </button>
              </div>
            )}
          </div>
        )}
      </header>

      <main className="App-content">
        {!isAuthenticated ? <Login /> : renderContent()}
      </main>

      <button className="icon-button-act" onClick={() => fetchLatestData()}>
        <MdRefresh className="icon" />
      </button>
    </div>
  );
}

export default App;
