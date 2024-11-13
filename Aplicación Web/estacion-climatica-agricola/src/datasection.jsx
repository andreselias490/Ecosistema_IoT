import React from 'react';
import { WiHumidity, WiThermometer } from 'react-icons/wi';
import { MdLocationOn, MdAccessTime } from 'react-icons/md';

const iconMap = {
  time: <MdAccessTime />,
  humidity: <WiHumidity />,
  temperature: <WiThermometer />,
  location: <MdLocationOn />,
};

function DataSection({ icon, label, value }) {
  return (
    <div className="data-section">
      <div className="data-icon">{iconMap[icon]}</div>
      <div className="data-details">
        <p>{label}: {value}</p>
      </div>
    </div>
  );
}

export default DataSection;
