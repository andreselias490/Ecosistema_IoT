import React, { useState } from 'react';
import './styles/detailsmenu.css';

function DetailsMenu({ children }) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="details-menu">
      <button onClick={toggleMenu} className="details-button">
        {isOpen ? 'Cerrar Detalles' : 'Detalles'}
      </button>
      {isOpen && <div className="details-content">{children}</div>}
    </div>
  );
}

export default DetailsMenu;
