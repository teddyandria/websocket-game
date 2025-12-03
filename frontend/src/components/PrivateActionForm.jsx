import React, { useState, useEffect } from 'react';
import '../styles/components/PrivateActionForm.css';

function PrivateActionForm({ players, onSendPrivate }) {
  const [message, setMessage] = useState('');
  const [targetSid, setTargetSid] = useState('');

  useEffect(() => {
    if (players && Object.keys(players).length > 0) {
      const sids = Object.keys(players);
      if (!targetSid || !sids.includes(targetSid)) {
        setTargetSid(sids[0] || '');
      }
    }
  }, [players, targetSid]);

  const handleSend = () => {
    if (!message.trim() || !targetSid) {
      alert('Choisissez une cible et un message');
      return;
    }
    onSendPrivate(targetSid, { text: message });
    setMessage('');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!players || Object.keys(players).length === 0) {
    return (
      <div className="card interaction-form">
        <h4>Action privée</h4>
        <p className="no-players">Aucun joueur disponible</p>
      </div>
    );
  }

  return (
    <div className="card interaction-form">
      <h4>Action privée</h4>
      <select
        value={targetSid}
        onChange={(e) => setTargetSid(e.target.value)}
        className="player-select"
      >
        <option value="">Sélectionner un joueur...</option>
        {Object.entries(players).map(([sid, player]) => (
          <option key={sid} value={sid}>
            {player.name} (joueur {player.number})
          </option>
        ))}
      </select>
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyPress={handleKeyPress}
        placeholder="Message privé..."
        className="message-input"
      />
      <div className="button-group">
        <button onClick={handleSend} className="btn btn-primary">
          Envoyer privé
        </button>
      </div>
    </div>
  );
};

export default PrivateActionForm;
