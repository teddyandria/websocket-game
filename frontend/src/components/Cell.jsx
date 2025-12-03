import React from 'react';
import '../styles/components/Cell.css';

const Cell = ({ value, onClick, row, col }) => {
  const getCellClass = () => {
    let classes = 'cell';
    if (value === 1) classes += ' player1';
    if (value === 2) classes += ' player2';
    return classes;
  };

  return (
    <div
      className={getCellClass()}
      onClick={onClick}
      data-row={row}
      data-col={col}
      style={{ cursor: 'pointer' }}
    >
      <div className="cell-inner"></div>
    </div>
  );
};

export default Cell;
