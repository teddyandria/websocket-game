import React, { useState, useEffect, useRef } from 'react';
import '../styles/components/ChatBox.css';

function ChatBox({ socket, gameId, playerInfo, players, isAiGame }) {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const messagesEndRef = useRef(null);

  // Convertir players en tableau si c'est un objet
  const playersArray = players ? (Array.isArray(players) ? players : Object.values(players)) : [];
  
  // Debug: afficher les données pour comprendre le problème
  console.log('ChatBox Debug:', {
    players,
    playersArray,
    playerInfo,
    isAiGame
  });
  
  // Trouver l'adversaire (l'autre joueur dans la partie)
  const opponent = playersArray.find(p => p.sid !== playerInfo?.sid);

  // Scroll automatique vers le bas
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Écouter les messages privés
  useEffect(() => {
    if (!socket || isAiGame) return;

    const handlePrivateMessage = (data) => {
      setMessages(prev => [...prev, {
        id: Date.now(),
        sender: data.sender_name,
        senderId: data.sender_sid,
        message: data.message,
        timestamp: new Date()
      }]);
    };

    socket.on('private_message', handlePrivateMessage);

    return () => {
      socket.off('private_message', handlePrivateMessage);
    };
  }, [socket, isAiGame]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    
    if (!inputMessage.trim() || !socket || !playerInfo || !opponent) return;

    // Envoyer message privé à l'adversaire
    socket.emit('send_private_message', {
      game_id: gameId,
      target_sid: opponent.sid,
      message: inputMessage.trim(),
      sender_name: playerInfo.name,
      sender_sid: playerInfo.sid
    });

    // Ajouter immédiatement le message à la liste locale
    setMessages(prev => [...prev, {
      id: Date.now(),
      sender: playerInfo.name,
      senderId: playerInfo.sid,
      message: inputMessage.trim(),
      timestamp: new Date(),
      isOwn: true
    }]);

    setInputMessage('');
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString('fr-FR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  // Si c'est une partie contre l'IA, afficher le message de désactivation
  if (isAiGame) {
    return (
      <div className="chat-box">
        <div className="chat-header">
          <h3>💬 Chat désactivé</h3>
        </div>
        <div className="chat-messages">
          <div className="chat-empty">
            <p>🤖 Le chat n'est pas disponible en mode solo contre l'IA</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-box">
      <div className="chat-header">
        <h3>
          💬 Chat privé {opponent && `avec ${opponent.name}`}
        </h3>
        {messages.length > 0 && (
          <span className="message-count">{messages.length}</span>
        )}
      </div>

      <div className="chat-messages">
        {!opponent ? (
          <div className="chat-empty">
            <p>⏳ En attente d'un adversaire...</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="chat-empty">
            <p>💬 Commencez à discuter avec {opponent.name} !</p>
          </div>
        ) : (
          messages.map((msg) => (
            <div 
              key={msg.id} 
              className={`chat-message ${msg.senderId === playerInfo?.sid ? 'own' : 'other'}`}
            >
              <div className="message-header">
                <span className="message-sender">
                  {msg.senderId === playerInfo?.sid ? 'Vous' : msg.sender}
                </span>
                <span className="message-time">{formatTime(msg.timestamp)}</span>
              </div>
              <div className="message-content">{msg.message}</div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <form className="chat-input-form" onSubmit={handleSendMessage}>
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder={
            opponent 
              ? `Message à ${opponent.name}...` 
              : 'En attente d\'un adversaire...'
          }
          disabled={!socket || !playerInfo || !opponent}
          maxLength={200}
        />
        <button 
          type="submit" 
          className="btn-send"
          disabled={!inputMessage.trim() || !socket || !playerInfo || !opponent}
        >
          📤
        </button>
      </form>
    </div>
  );
}

export default ChatBox;
