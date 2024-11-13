import React from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

function Filter({ selectedDate, setSelectedDate, filterData }) {
  return (
    <div className="filter-container">
      <h3>Búsqueda por fecha</h3>
      <DatePicker
        className="date-filter"
        selected={selectedDate}
        onChange={date => setSelectedDate(date)}
        dateFormat="dd/MM/yyyy"
        placeholderText="Selecciona una fecha"
      />
      <button className="apply-filter-button" onClick={filterData}>
        Aplicar filtro
      </button>
    </div>
  );
}

export default Filter;
