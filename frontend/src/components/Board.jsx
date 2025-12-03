import React from 'react';
import Cell from './Cell';
import '../styles/components/Board.css';

const Board = ({ board, onCellClick }) => {
  if (!board || board.length === 0) {
    return <div className="game-board">Chargement du plateau...</div>;
  }

  return (
    <div className="game-board">
      {board.map((row, rowIndex) =>
        row.map((cellValue, colIndex) => (
          <Cell
            key={`${rowIndex}-${colIndex}`}
            value={cellValue}
            row={rowIndex}
            col={colIndex}
            onClick={() => onCellClick(colIndex)}
          />
        ))
      )}
    </div>
  );
};

export default Board;
