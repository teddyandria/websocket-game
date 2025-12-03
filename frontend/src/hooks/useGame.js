import { useEffect, useState, useCallback } from 'react';

export const useGame = (socket, gameId) => {
  const [gameState, setGameState] = useState(null);
  const [currentPlayer, setCurrentPlayer] = useState(null);
  const [playerInfo, setPlayerInfo] = useState(null);
  const [statusMessage, setStatusMessage] = useState('Connexion en cours...');
  const [error, setError] = useState(null);
  const [moveHistory, setMoveHistory] = useState([]);

  // Rejoindre une partie
  const joinGame = useCallback((playerName) => {
    if (!socket || !gameId) return;
    
    console.log('🎮 Tentative de rejoindre la partie:', gameId, 'en tant que', playerName);
    socket.emit('join_game', {
      game_id: gameId,
      player_name: playerName
    });
  }, [socket, gameId]);

  // Faire un coup
  const makeMove = useCallback((col) => {
    if (!socket || !gameId) return;
    
    if (!gameState || gameState.game_over) {
      console.log('⚠️ Jeu terminé ou pas d\'état de jeu');
      return;
    }

    if (playerInfo?.role === 'spectator') {
      setError('Les spectateurs ne peuvent pas jouer !');
      return;
    }

    if (!gameState.ai_enabled && (!gameState.players || Object.keys(gameState.players).length < 2)) {
      setError('Attendez qu\'un autre joueur rejoigne la partie !');
      return;
    }

    if (currentPlayer !== gameState.current_player) {
      setError('Ce n\'est pas votre tour !');
      return;
    }

    console.log('🎯 Tentative de mouvement dans la colonne:', col);
    socket.emit('make_move', {
      game_id: gameId,
      col: col
    });
  }, [socket, gameId, gameState, currentPlayer, playerInfo]);

  // Recommencer la partie
  const resetGame = useCallback(() => {
    if (!socket || !gameId) return;
    
    socket.emit('reset_game', {
      game_id: gameId
    });
  }, [socket, gameId]);

  // Envoyer une action globale
  const sendGlobalAction = useCallback((actionType, payload, scope = 'room') => {
    if (!socket) return;
    
    socket.emit('global_action', {
      game_id: gameId,
      action_type: actionType,
      payload: payload,
      scope: scope
    });
  }, [socket, gameId]);

  // Envoyer une action privée
  const sendPrivateAction = useCallback((targetSid, payload) => {
    if (!socket) return;
    
    socket.emit('private_action', {
      game_id: gameId,
      sid: targetSid,
      payload: payload
    });
  }, [socket, gameId]);

  // Écouter les événements du serveur
  useEffect(() => {
    if (!socket) return;

    // Joueur assigné
    socket.on('player_assigned', (data) => {
      console.log('👤 Joueur assigné:', data);
      setCurrentPlayer(data.player_number);
      setPlayerInfo(data);
      
      if (data.role === 'spectator') {
        setStatusMessage('Vous êtes spectateur 👁️');
      }
    });

    // Joueur rejoint
    socket.on('player_joined', (data) => {
      console.log('👥 Joueur a rejoint:', data);
      if (data.players_count === 2) {
        setStatusMessage('Partie complète ! Que le jeu commence !');
      } else {
        setStatusMessage(`${data.player_name} a rejoint la partie (${data.players_count}/2)`);
      }
    });

    // Spectateur rejoint
    socket.on('spectator_joined', (data) => {
      console.log('👁️ Spectateur a rejoint:', data);
      setStatusMessage(`${data.spectator_name} regarde la partie (${data.spectators_count} spectateur(s))`);
    });

    // Joueur quitté
    socket.on('player_left', (data) => {
      console.log('👋 Joueur a quitté:', data);
      setStatusMessage(`${data.player_name} a quitté la partie (${data.players_count}/2)`);
    });

    // Spectateur quitté
    socket.on('spectator_left', (data) => {
      console.log('👋 Spectateur a quitté:', data);
      setStatusMessage(`${data.spectator_name} ne regarde plus (${data.spectators_count} spectateur(s))`);
    });

    // État du jeu mis à jour
    socket.on('game_state', (data) => {
      console.log('🎲 État du jeu mis à jour:', data);
      setGameState(data);
      setError(null);
      
      // Si le plateau est vide (reset), réinitialiser l'historique
      if (data.board && data.board.every(row => row.every(cell => cell === 0))) {
        setMoveHistory([]);
      }
    });
    
    // Coup joué (nouveau gestionnaire)
    socket.on('move_made', (data) => {
      console.log('🎯 Coup joué:', data);
      // Ajouter le coup à l'historique
      setMoveHistory(prev => [...prev, {
        player: data.player,
        column: data.column,
        row: data.row
      }]);
    });

    // Erreur
    socket.on('error', (data) => {
      console.error('❌ Erreur:', data.message);
      setError(data.message);
    });

    // Partie terminée (joueur déconnecté)
    socket.on('game_ended', (data) => {
      console.log('🛑 Partie terminée:', data);
      setStatusMessage(data.message);
      setGameState(prev => ({ ...prev, game_over: true }));
      
      if (data.redirect) {
        setTimeout(() => {
          window.location.href = '/';
        }, 3000);
      }
    });

    // Cleanup
    return () => {
      socket.off('player_assigned');
      socket.off('player_joined');
      socket.off('spectator_joined');
      socket.off('player_left');
      socket.off('spectator_left');
      socket.off('game_state');
      socket.off('move_made');
      socket.off('error');
      socket.off('game_ended');
    };
  }, [socket]);

  return {
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
  };
};

export default useGame;
