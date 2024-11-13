import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './styles/Predicciones.css';  // Importa el archivo CSS

const Predicciones = () => {
  const [predictions, setPredictions] = useState({ temp: null, humidity: null });

  useEffect(() => {
    const fetchWeatherForecast = async () => {
      try {
        const response = await axios.get('https://api.openweathermap.org/data/2.5/forecast', {
          params: {
            q: 'Irapuato',
            appid: 'f3ce385fda89c99b4c689ba3c8e5ec7b',
            units: 'metric'
          }
        });

        const next24HoursForecast = response.data.list[0];
        setPredictions({
          temp: next24HoursForecast.main.temp,
          humidity: next24HoursForecast.main.humidity,
        });
      } catch (error) {
        console.error('Error fetching forecast', error);
      }
    };

    fetchWeatherForecast();
  }, []);

  return (
    <div className="weather-card">
      <h2 className="weather-title">Predicciones del Clima</h2>
      <div className="weather-info">
        <div className="weather-item">
          <span className="label">Temperatura:</span>
          <span className="value">{predictions.temp ? `${predictions.temp} °C` : "Cargando..."}</span>
        </div>
        <div className="weather-item">
          <span className="label">Humedad:</span>
          <span className="value">{predictions.humidity ? `${predictions.humidity} %` : "Cargando..."}</span>
        </div>
      </div>
      <p className="weather-note">
        Nota: Las predicciones se basan en datos históricos del clima y estiman las condiciones para las próximas 24 horas.
      </p>
    </div>
  );
};

export default Predicciones;
