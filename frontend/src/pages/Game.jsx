import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { useSocket } from '../hooks/useSocket';
import { useGame } from '../hooks/useGame';
import { useAuth } from '../contexts/AuthContext';
import Board from '../components/Board';
import PlayersList from '../components/PlayersList';
import GameStatus from '../components/GameStatus';
import GameControls from '../components/GameControls';
import GameHistory from '../components/GameHistory';
import GlobalScore from '../components/GlobalScore';
import '../styles/pages/Game.css';

const Game = () => {
  const { gameId } = useParams();
  const [searchParams] = useSearchParams();
  const playerName = searchParams.get('name');
  
  const { user } = useAuth();
  const { socket, connected } = useSocket();
  const {
    gameState,
    currentPlayer,
    playerInfo,
    statusMessage,
    error,
    moveHistory,
    joinGame,
    makeMove,
    resetGame,
    sendGlobalAction,
    sendPrivateAction
  } = useGame(socket, gameId);

  const [showNameModal, setShowNameModal] = useState(!playerName);
  const [tempPlayerName, setTempPlayerName] = useState('');

  useEffect(() => {
    if (socket && playerName && gameId) {
      joinGame(playerName);
    }
  }, [socket, playerName, gameId, joinGame]);

  const handleJoinFromModal = () => {
    if (!tempPlayerName.trim()) {
      alert('Veuillez entrer votre nom');
      return;
    }
    joinGame(tempPlayerName);
    setShowNameModal(false);
  };

  const handleCellClick = (col) => {
    makeMove(col);
  };

  if (!connected) {
    return (
      <div className="container">
        <div className="loading">
          <h2>Connexion au serveur...</h2>
          <p>Veuillez patienter</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="game-header">
        <h1>🔴 Puissance 4 🟡</h1>
        <div className="game-info-header">
          <div className="game-id">Partie: {gameId?.substring(0, 8)}...</div>
          <GameStatus
            gameState={gameState}
            currentPlayer={currentPlayer}
            playerInfo={playerInfo}
            statusMessage={statusMessage}
          />
        </div>
      </div>

      {error && (
        <div className="alert alert-error">
          {error}
        </div>
      )}

      <div className="game-layout">
        <PlayersList 
          players={gameState?.players} 
          spectators={gameState?.spectators}
          currentPlayer={currentPlayer}
          user={user}
        />

        <div className="game-board-container">
          <GlobalScore 
            score={gameState?.global_score} 
            players={gameState?.players}
          />
          <Board
            board={gameState?.board}
            onCellClick={handleCellClick}
          />
          <GameControls
            gameState={gameState}
            onReset={resetGame}
          />
        </div>

        <GameHistory 
          moves={moveHistory}
          players={gameState?.players}
        />
      </div>

      {showNameModal && (
        <div className="modal">
          <div className="modal-content">
            <h3>Rejoindre la partie</h3>
            <input
              type="text"
              value={tempPlayerName}
              onChange={(e) => setTempPlayerName(e.target.value)}
              placeholder="Votre nom"
              maxLength="20"
              onKeyPress={(e) => e.key === 'Enter' && handleJoinFromModal()}
              autoFocus
            />
            <button onClick={handleJoinFromModal} className="btn btn-primary">
              Rejoindre
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Game;
