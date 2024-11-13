import React, { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import axios from 'axios';
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Tooltip, Legend);

const Grafica = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await axios.get('https://api.thingspeak.com/channels/2548222/feeds.json?results=500');
        console.log('Total registros obtenidos:', result.data.feeds.length); // Verifica la cantidad de registros

        // Obtener la fecha de hoy sin la hora
        const today = new Date();
        const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());

        // Filtrar los datos para que solo queden los registros de la fecha de hoy
        const filteredData = result.data.feeds.filter(feed => {
          const feedDate = new Date(feed.created_at);
          return feedDate >= todayStart;  // Solo los registros cuya fecha es de hoy
        });

        setData(filteredData); // Guardamos solo los registros de hoy

        // Si hay datos, extraemos la primera lectura
        if (filteredData.length > 0) {
          const firstEntry = filteredData[0];
          const firstDate = new Date(firstEntry.created_at);
          
          // Extraer la fecha y la hora en diferentes variables
          const fecha = firstDate.toLocaleDateString(); // Solo la fecha
          const hora = firstDate.toLocaleTimeString(); // Solo la hora

          console.log('Primera fecha detectada:', fecha);
          console.log('Primera hora detectada:', hora);
        }

      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  // Si no hay datos, muestra un mensaje de carga
  if (data.length === 0) {
    return <p>Cargando datos...</p>;
  }

  // Preparar los datos de temperatura para la gráfica
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

  // Preparar los datos de humedad para la gráfica
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

  // Opciones para las gráficas
  const options = {
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
    <div style={{ width: '95%', margin: '0 auto', padding: '10px' }}>
      <h2 style={{ textAlign: 'center', fontSize: '2rem', marginBottom: '20px', color: '#FFFFFF' }}>
        Gráficas de Temperatura y Humedad
      </h2>
      
      <div style={{ width: '100%', height: '40vh', marginBottom: '20px' }}>
        <h3 style={{ textAlign: 'center', fontSize: '1.5rem', color: '#FFFFFF' }}>Temperatura</h3>
        <Line data={tempData} options={options} />
      </div>
      <br></br>
      <br></br>
      <div style={{ width: '100%', height: '40vh' }}>
        <h3 style={{ textAlign: 'center', fontSize: '1.5rem', color: '#FFFFFF' }}>Humedad</h3>
        <Line data={humidityData} options={options} />
      </div>
      <br></br>
      <br></br>
      <p style={{ textAlign: 'center', marginTop: '20px', color: '#FFFFFF', fontSize: '1rem' }}>
        Nota: Estas gráficas muestran los datos históricos de temperatura y humedad, obtenidos de sensores locales para un análisis más detallado.
      </p>
    </div>
  );
};

export default Grafica;
