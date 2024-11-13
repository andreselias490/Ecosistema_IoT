import React from 'react';
import DataSection from './datasection';
function DataList({ data, showAll }) {
  if (showAll) {
    return (
      <table className="data-table">
        <thead>
          <tr>
            <th>Entry ID</th>
            <th>Fecha y Hora</th>
            <th>Humedad</th>
            <th>Temperatura</th>
            <th>Ubicación</th>
          </tr>
        </thead>
        <tbody>
          {data.map(feed => (
            <tr key={feed.entry_id}>
              <td>{feed.entry_id}</td>
              <td>{new Date(feed.created_at).toLocaleString()}</td>
              <td>{feed.field1}%</td>
              <td>{feed.field2}°C</td>
              <td>({feed.field3}, {feed.field4})</td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  } else {
    return (
      <div className="data-list">
        <DataSection icon="time" label="Fecha y Hora" value={new Date(data[0].created_at).toLocaleString()} />
        <DataSection icon="humidity" label="Humedad" value={`${data[0].field1}%`} />
        <DataSection icon="temperature" label="Temperatura" value={`${data[0].field2}°C`} />
        <DataSection icon="location" label="Ubicación" value={`(${data[0].field3}, ${data[0].field4})`} />
        
        {/* Aquí integramos el mapa de OpenStreetMap */}
        <div className="data-section">
          <iframe
            title="Mapa"
            width="100%"
            height="200"
            src={`https://www.openstreetmap.org/export/embed.html?bbox=${data[0].field4},${data[0].field3},${data[0].field4},${data[0].field3}&marker=${data[0].field3},${data[0].field4}&layers=ND`}
          ></iframe>
        </div>
      </div>
    );
  }
}

export default DataList;
