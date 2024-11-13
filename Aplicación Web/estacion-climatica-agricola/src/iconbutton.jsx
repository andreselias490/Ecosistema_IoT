import React from 'react';
import { MdViewList, MdRefresh } from 'react-icons/md';

function IconButton({ onClick, icon }) {
  return (
    <button className="icon-button-menu" onClick={onClick}>
      {iconMap[icon]}
    </button>
  );
}

const iconMap = {
  list: <MdViewList />,
  refresh: <MdRefresh />,
};

export default IconButton;
