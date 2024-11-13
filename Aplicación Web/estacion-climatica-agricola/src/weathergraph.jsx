import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const WeatherGraph = ({ data }) => {
  // Función para agrupar los datos por día y calcular los máximos y mínimos
  const groupByDay = (data) => {
    const groupedData = {};

    data.forEach(feed => {
      const date = new Date(feed.created_at).toLocaleDateString();
      const temp = parseFloat(feed.field1);
      const humidity = parseFloat(feed.field2);

      if (!groupedData[date]) {
        groupedData[date] = {
          date,
          tempMax: temp,
          tempMin: temp,
          humidityMax: humidity,
          humidityMin: humidity,
        };
      } else {
        groupedData[date].tempMax = Math.max(groupedData[date].tempMax, temp);
        groupedData[date].tempMin = Math.min(groupedData[date].tempMin, temp);
        groupedData[date].humidityMax = Math.max(groupedData[date].humidityMax, humidity);
        groupedData[date].humidityMin = Math.min(groupedData[date].humidityMin, humidity);
      }
    });

    return Object.values(groupedData);
  };

  // Datos agrupados por día
  const formattedData = groupByDay(data);

  return (
    <ResponsiveContainer width="100%" height={400}>
      <LineChart data={formattedData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip />
        <Legend />
        {/* Líneas para los máximos y mínimos de temperatura */}
        <Line type="monotone" dataKey="tempMax" stroke="#ff7300" name="Temperatura Máxima (°C)" />
        <Line type="monotone" dataKey="tempMin" stroke="#387908" name="Temperatura Mínima (°C)" />
        {/* Líneas para los máximos y mínimos de humedad */}
        <Line type="monotone" dataKey="humidityMax" stroke="#8884d8" name="Humedad Máxima (%)" />
        <Line type="monotone" dataKey="humidityMin" stroke="#82ca9d" name="Humedad Mínima (%)" />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default WeatherGraph;
