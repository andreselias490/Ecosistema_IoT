import React, { useEffect, useState } from 'react';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const VerTodosRegistros = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(null);
  const [filteredData, setFilteredData] = useState([]);

  useEffect(() => {
    const fetchAllData = () => {
      axios.get('https://api.thingspeak.com/channels/2548222/feeds.json?results=8000')
        .then(response => {
          setData(response.data);
          setFilteredData(response.data.feeds);
          setLoading(false);
        })
        .catch(error => {
          console.error("Error fetching data", error);
          setLoading(false);
        });
    };

    fetchAllData();
  }, []);

  const filterData = () => {
    if (data && selectedDate) {
      let filtered = data.feeds.filter(feed => {
        const feedDate = new Date(feed.created_at);
        return feedDate.toDateString() === selectedDate.toDateString();
      });
      setFilteredData(filtered);
    } else {
      setFilteredData(data.feeds);
    }
  };

  if (loading) {
    return <div>Cargando...</div>;
  }

  return (
    <div>
      <h2>Todos los Registros</h2>

      {/* Cuadro de búsqueda por fecha */}
      <div className="filter-container">
        <h3>Búsqueda por fecha</h3>
        <DatePicker
          className='date-filter'
          selected={selectedDate}
          onChange={date => setSelectedDate(date)}
          dateFormat="dd/MM/yyyy"
          placeholderText="Selecciona una fecha"
        />
        <button className="apply-filter-button" onClick={filterData}>
          Aplicar filtro
        </button>
      </div>

      {/* Mostrar los registros filtrados */}
      <table>
        <thead>
          <tr>
            <th>Fecha</th>
            <th>Temperatura (°C)</th>
            <th>Humedad (%)</th>
            <th>Ubicación</th>
          </tr>
        </thead>
        <tbody>
  {filteredData.map(feed => (
    <tr key={feed.entry_id}>
      <td>{new Date(feed.created_at).toLocaleString()}</td>
      <td>{parseFloat(feed.field2).toFixed(1)}</td> {/* Temperatura con un decimal */}
      <td>{Math.round(feed.field1)}</td> {/* Humedad en números enteros */}
      <td>{`(${feed.field3}, ${feed.field4})`}</td>
    </tr>
  ))}
</tbody>

      </table>

      {/* Mostrar mapa solo si hay datos de ubicación */}
      {filteredData.length > 0 && filteredData[0].field3 && filteredData[0].field4 && (
        <div className="map-container">
          <h3>Ubicación del primer registro</h3>
          <iframe
            title="Mapa"
            width="100%"
            height="300"
            src={`https://www.openstreetmap.org/export/embed.html?bbox=${filteredData[0].field4},${filteredData[0].field3},${filteredData[0].field4},${filteredData[0].field3}&marker=${filteredData[0].field3},${filteredData[0].field4}&layers=ND`}
          ></iframe>
        </div>
      )}
    </div>
  );
};

export default VerTodosRegistros;
