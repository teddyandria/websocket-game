import React from 'react';
import '../styles/components/GameStatus.css';

function GameStatus({ gameState, currentPlayer, playerInfo, statusMessage }) {
  const getStatusText = () => {
    if (statusMessage && !gameState) {
      return statusMessage;
    }

    if (!gameState) {
      return 'Connexion en cours...';
    }

    const playersCount = gameState.players ? Object.keys(gameState.players).length : 0;

    if (!gameState.ai_enabled && playersCount < 2) {
      return `En attente d'un autre joueur... (${playersCount}/2)`;
    }

    if (gameState.game_over) {
      if (gameState.winner === 0) {
        return 'Match nul !';
      } else if (gameState.winner === currentPlayer) {
        return "T'as gagné tricheur de merde";
      } else {
        if (gameState.ai_enabled) {
          return 'L\'IA a gagné HAHAHAHAH (looser)';
        } else {
          return "T'as perdu sale merde";
        }
      }
    } else {
      if (gameState.current_player === currentPlayer) {
        return 'À ton tour batard';
      } else {
        if (gameState.ai_enabled) {
          return 'L\'IA réfléchit...';
        } else {
          return 'Au tour de ton adversaire...';
        }
      }
    }
  };

  const getPlayerInfoText = () => {
    if (!playerInfo || !currentPlayer) return '';
    const color = currentPlayer === 1 ? '🔴' : '🟡';
    return `T'es le joueur ${currentPlayer} ${color}`;
  };

  return (
    <div className="game-info">
      {playerInfo && (
        <div className="player-info">{getPlayerInfoText()}</div>
      )}
      <div className="game-status">{getStatusText()}</div>
    </div>
  );
};

export default GameStatus;
