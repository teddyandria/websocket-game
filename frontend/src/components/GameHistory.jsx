import React from 'react';
import '../styles/components/GameHistory.css';

function GameHistory({ moves, players }) {
  if (!moves || moves.length === 0) {
    return (
      <div className="game-history">
        <h3>📜 Historique</h3>
        <div className="history-empty">
          <p>Aucun coup joué pour le moment</p>
        </div>
      </div>
    );
  }

  const getPlayerName = (playerNumber) => {
    if (!players) return `Joueur ${playerNumber}`;
    const player = Object.values(players).find(p => p.number === playerNumber);
    return player ? player.name : `Joueur ${playerNumber}`;
  };

  return (
    <div className="game-history">
      <h3>📜 Historique</h3>
      <div className="history-list">
        {moves.map((move, index) => (
          <div key={index} className={`history-item player${move.player}`}>
            <span className="move-number">#{index + 1}</span>
            <div className={`player-indicator player${move.player}`}></div>
            <span className="player-name">{getPlayerName(move.player)}</span>
            <span className="move-column">Colonne {move.column + 1}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default GameHistory;
