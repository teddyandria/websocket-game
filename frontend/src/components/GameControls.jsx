import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/components/GameControls.css';

function GameControls({ gameState, onReset, onLeave }) {
  const navigate = useNavigate();

  const handleLeave = () => {
    if (window.confirm('Êtes-vous sûr de vouloir quitter la partie ?')) {
      navigate('/');
    }
  };

  return (
    <div className="game-controls">
      {gameState?.game_over && (
        <button onClick={onReset} className="btn btn-warning">
          Nouvelle partie
        </button>
      )}
      <button onClick={handleLeave} className="btn btn-danger">
        Quitter
      </button>
    </div>
  );
};

export default GameControls;
