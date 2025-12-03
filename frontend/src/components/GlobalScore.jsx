import React from 'react';
import '../styles/components/GlobalScore.css';

const GlobalScore = ({ score, players }) => {
  if (!score) return null;

  const getPlayerName = (playerNumber) => {
    if (!players) return `Joueur ${playerNumber}`;
    const player = Object.values(players).find(p => p.number === playerNumber);
    return player ? player.name : `Joueur ${playerNumber}`;
  };

  return (
    <div className="global-score">
      <h3 className="score-title">📊 Score Global</h3>
      <div className="score-board">
        <div className="score-item player1-score">
          <div className="score-label">
            <span className="player-indicator player1">🔴</span>
            {getPlayerName(1)}
          </div>
          <div className="score-value">{score.player1 || 0}</div>
        </div>
        
        <div className="score-item draws-score">
          <div className="score-label">⚖️ Nuls</div>
          <div className="score-value">{score.draws || 0}</div>
        </div>
        
        <div className="score-item player2-score">
          <div className="score-label">
            <span className="player-indicator player2">🟡</span>
            {getPlayerName(2)}
          </div>
          <div className="score-value">{score.player2 || 0}</div>
        </div>
      </div>
      <div className="score-total">
        Total: {(score.player1 || 0) + (score.player2 || 0) + (score.draws || 0)} parties
      </div>
    </div>
  );
};

export default GlobalScore;
