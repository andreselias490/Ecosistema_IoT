import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Line } from 'react-chartjs-2';
import { Chart, registerables } from 'chart.js';
import './styles/Promedio.css';

Chart.register(...registerables);

const Promedio = () => {
  const [averageData, setAverageData] = useState({ avgTemp: 0, maxTemp: 0, minTemp: 0, avgHum: 0, maxHum: 0, minHum: 0 });
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchAndCalculate = async () => {
      try {
        const response = await axios.get('https://api.thingspeak.com/channels/2548222/feeds.json?results=500');
        const feeds = response.data.feeds;

        // Obtener la fecha de hoy sin la hora
        const today = new Date();
        const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());

        // Filtrar los datos para que solo queden los registros de la fecha de hoy
        const filteredData = feeds.filter(feed => {
          const feedDate = new Date(feed.created_at);
          return feedDate >= todayStart;
        });

        setData(filteredData); // Usar los datos filtrados en las gráficas

        // Si hay datos, calcular los valores máximos, mínimos y promedio
        if (filteredData.length > 0) {
          const temperatures = filteredData.map(feed => parseFloat(feed.field2));
          const humidities = filteredData.map(feed => parseFloat(feed.field1));

          // Calcular promedio, máximo y mínimo
          const avgTemp = (temperatures.reduce((a, b) => a + b, 0) / temperatures.length).toFixed(2);
          const maxTemp = Math.max(...temperatures).toFixed(2);
          const minTemp = Math.min(...temperatures).toFixed(2);

          const avgHum = (humidities.reduce((a, b) => a + b, 0) / humidities.length).toFixed(2);
          const maxHum = Math.max(...humidities).toFixed(2);
          const minHum = Math.min(...humidities).toFixed(2);

          setAverageData({ avgTemp, maxTemp, minTemp, avgHum, maxHum, minHum });
        }
      } catch (error) {
        console.error('Error fetching data', error);
      }
    };

    fetchAndCalculate();
  }, []);

  if (data.length === 0) {
    return <p>Cargando datos...</p>;
  }

  const tempData = {
    labels: data.map(feed => new Date(feed.created_at).toLocaleString()),
    datasets: [
      {
        label: 'Temperatura (°C)',
        data: data.map(feed => feed.field2),
        borderColor: 'rgba(255, 99, 132, 1)',
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        fill: true,
        tension: 0.4,
        pointRadius: 2,
      }
    ]
  };

  const humidityData = {
    labels: data.map(feed => new Date(feed.created_at).toLocaleString()),
    datasets: [
      {
        label: 'Humedad (%)',
        data: data.map(feed => feed.field1),
        borderColor: 'rgba(54, 162, 235, 1)',
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
        fill: true,
        tension: 0.4,
        pointRadius: 2,
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        type: 'category',
        title: {
          display: true,
          text: 'Fecha y Hora',
          color: '#FFFFFF',
        },
        ticks: {
          maxTicksLimit: 6,
          color: '#FFFFFF',
        },
      },
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Valores',
          color: '#FFFFFF',
        },
        ticks: {
          color: '#FFFFFF',
        },
      }
    },
    plugins: {
      legend: {
        display: true,
        labels: {
          color: '#FFFFFF',
        },
      },
    }
  };

  return (
    <div className="promedio-container">
      <h2 className="title">Promedio, Máximos y Mínimos (Datos del Día)</h2>

      <div className="promedio-grid">
        <div className="card">
          <h3>Temperatura Promedio</h3>
          <p>{averageData.avgTemp} °C</p>
        </div>
        <div className="card">
          <h3>Temperatura Máxima</h3>
          <p>{averageData.maxTemp} °C</p>
        </div>
        <div className="card">
          <h3>Temperatura Mínima</h3>
          <p>{averageData.minTemp} °C</p>
        </div>
        <div className="card">
          <h3>Humedad Promedio</h3>
          <p>{averageData.avgHum} %</p>
        </div>
        <div className="card">
          <h3>Humedad Máxima</h3>
          <p>{averageData.maxHum} %</p>
        </div>
        <div className="card">
          <h3>Humedad Mínima</h3>
          <p>{averageData.minHum} %</p>
        </div>
      </div>

      <h3 className="graph-title">Gráficas de Temperatura y Humedad</h3>

      <div className="chart-container">
        <Line data={tempData} options={chartOptions} />
      </div>

      <div className="chart-container" style={{ marginTop: '20px' }}>
        <Line data={humidityData} options={chartOptions} />
      </div>
      <p style={{ textAlign: 'center', marginTop: '20px', color: '#FFFFFF', fontSize: '1rem' }}>
        Nota: Los valores promedio, máximos y mínimos de temperatura y humedad se calculan a partir de los datos obtenidos solo para la fecha de hoy.
      </p>
    </div>
  );
};

export default Promedio;
