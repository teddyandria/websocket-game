import React from 'react';
import '../styles/components/PlayersList.css';

const PlayersList = ({ players, spectators, currentPlayer, user }) => {
  if (!players || Object.keys(players).length === 0) {
    return (
      <div className="players-panel">
        <h3>Joueurs</h3>
        <div className="players-list">
          <p>Aucun joueur connecté</p>
        </div>
      </div>
    );
  }

  const getPlayerAvatar = (player) => {
    if (user && player.name === (user.display_name || user.username)) {
      return user.avatar_url;
    }
    return null;
  };

  const getPlayerInitial = (playerName) => {
    return playerName ? playerName.charAt(0).toUpperCase() : '?';
  };

  return (
    <div className="players-panel">
      <h3>Joueurs</h3>
      <div className="players-list">
        {Object.values(players).map((player, index) => {
          const avatarUrl = getPlayerAvatar(player);
          const isCurrentPlayer = player.number === currentPlayer;
          
          return (
            <div key={index} className={`player-item ${isCurrentPlayer ? 'current' : ''}`}>
              <div className="player-avatar-container">
                {avatarUrl ? (
                  <img src={avatarUrl} alt={player.name} className="player-avatar" />
                ) : (
                  <div className={`player-avatar-placeholder player${player.number}`}>
                    {getPlayerInitial(player.name)}
                  </div>
                )}
                <div className={`player-color-indicator player${player.number}`}></div>
              </div>
              <div className="player-details">
                <span className="player-name">
                  {player.name}
                  {isCurrentPlayer && <span className="you-badge">Vous</span>}
                </span>
                <span className={`player-color-label player${player.number}`}>
                  {player.number === 1 ? '🔴 Rouge' : '🟡 Jaune'}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {spectators && Object.keys(spectators).length > 0 && (
        <>
          <h3 className="spectators-title">👁️ Spectateurs ({Object.keys(spectators).length})</h3>
          <div className="spectators-list">
            {Object.values(spectators).map((spectator, index) => {
              const avatarUrl = getPlayerAvatar(spectator);
              
              return (
                <div key={index} className="spectator-item">
                  <div className="spectator-avatar-container">
                    {avatarUrl ? (
                      <img src={avatarUrl} alt={spectator.name} className="spectator-avatar" />
                    ) : (
                      <div className="spectator-avatar-placeholder">
                        {getPlayerInitial(spectator.name)}
                      </div>
                    )}
                  </div>
                  <span className="spectator-name">{spectator.name}</span>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};

export default PlayersList;
