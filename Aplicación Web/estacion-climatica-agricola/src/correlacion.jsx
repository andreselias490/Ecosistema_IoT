import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const Correlacion = () => {
  const [correlation, setCorrelation] = useState(null);
  const [chartData, setChartData] = useState(null);

  const timeSlots = ['03:00', '09:00', '12:00', '15:00', '21:00']; // Approximate times for each slot

  useEffect(() => {
    const fetchAndCalculateCorrelation = async () => {
      try {
        const response = await axios.get('https://api.thingspeak.com/channels/2548222/feeds.json?results=8000');
        const feeds = response.data.feeds;

        // Group data by day
        const groupedByDay = feeds.reduce((acc, feed) => {
          const date = new Date(feed.created_at);
          const day = date.toISOString().split('T')[0]; // Get the day part of the date
          if (!acc[day]) acc[day] = [];
          acc[day].push(feed);
          return acc;
        }, {});

        // For each day, pick data points closest to time slots
        const selectedFeeds = Object.values(groupedByDay).flatMap(dayFeeds => {
          return timeSlots.map(slot => {
            // Find the feed closest to the desired time slot
            const closestFeed = dayFeeds.reduce((prev, curr) => {
              const prevDiff = Math.abs(new Date(prev.created_at).getHours() - parseInt(slot.split(':')[0]));
              const currDiff = Math.abs(new Date(curr.created_at).getHours() - parseInt(slot.split(':')[0]));
              return currDiff < prevDiff ? curr : prev;
            });
            return closestFeed;
          });
        });

        const labels = selectedFeeds.map(feed => new Date(feed.created_at).toLocaleString());
        const temperatures = selectedFeeds.map(feed => parseFloat(feed.field2));
        const humidities = selectedFeeds.map(feed => parseFloat(feed.field1));

        const calculatePearsonCorrelation = (x, y) => {
          const n = x.length;
          const sumX = x.reduce((a, b) => a + b, 0);
          const sumY = y.reduce((a, b) => a + b, 0);
          const sumXY = x.map((xi, i) => xi * y[i]).reduce((a, b) => a + b, 0);
          const sumX2 = x.map(xi => xi * xi).reduce((a, b) => a + b, 0);
          const sumY2 = y.map(yi => yi * yi).reduce((a, b) => a + b, 0);

          const numerator = (n * sumXY) - (sumX * sumY);
          const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));

          return (denominator === 0) ? 0 : (numerator / denominator).toFixed(2);
        };

        const correlationValue = calculatePearsonCorrelation(temperatures, humidities);
        setCorrelation(correlationValue);

        setChartData({
          labels: labels,
          datasets: [
            {
              label: 'Temperatura (°C)',
              data: temperatures,
              borderColor: 'rgba(75, 192, 192, 1)',
              backgroundColor: 'rgba(75, 192, 192, 0.2)',
              fill: false,
              tension: 0.1,
              pointRadius: 2,
            },
            {
              label: 'Humedad (%)',
              data: humidities,
              borderColor: 'rgba(153, 102, 255, 1)',
              backgroundColor: 'rgba(153, 102, 255, 0.2)',
              fill: false,
              tension: 0.1,
              pointRadius: 2,
            },
          ],
        });
      } catch (error) {
        console.error("Error fetching data", error);
      }
    };

    fetchAndCalculateCorrelation();
  }, []);

  return (
    <div style={{ width: '95%', margin: '0 auto', padding: '10px' }}>
      <h2 style={{ textAlign: 'center', fontSize: '2rem', marginBottom: '20px', color: '#FFFFFF' }}>
        Correlación entre Temperatura y Humedad
      </h2>
      <p style={{ textAlign: 'center', marginTop: '10px', color: '#FFFFFF', fontSize: '1rem' }}>
        La correlación de Pearson es: {correlation !== null ? correlation : "Calculando..."}
      </p>
      <p style={{ textAlign: 'center', marginTop: '10px', color: '#FFFFFF', fontSize: '0.9rem' }}>
        Nota: La correlación de Pearson mide la relación entre la temperatura y la humedad. Un valor cercano a 1 indica una fuerte correlación positiva, mientras que un valor cercano a -1 indica una fuerte correlación negativa.
      </p>
      {chartData && (
        <div style={{ width: '100%', height: '40vh', marginBottom: '20px' }}>
          <Line
            data={chartData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              scales: {
                x: {
                  title: {
                    display: true,
                    text: 'Tiempo',
                    color: '#FFFFFF',
                    font: {
                      size: 12,
                    },
                  },
                  ticks: {
                    maxTicksLimit: 5,
                    color: '#FFFFFF',
                  },
                },
                y: {
                  title: {
                    display: true,
                    text: 'Valores',
                    color: '#FFFFFF',
                    font: {
                      size: 12,
                    },
                  },
                  ticks: {
                    color: '#FFFFFF',
                  },
                },
              },
              elements: {
                line: {
                  tension: 0.4,
                },
              },
              plugins: {
                legend: {
                  display: true,
                  labels: {
                    color: '#FFFFFF',
                    font: {
                      size: 10,
                    },
                  },
                },
              },
            }}
          />
        </div>
      )}
    </div>
  );
};

export default Correlacion;
