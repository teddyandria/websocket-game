import React, { useState } from 'react';
import '../styles/components/GlobalActionForm.css';

function GlobalActionForm({ onSendGlobal }) {
  const [message, setMessage] = useState('');

  const handleSendRoom = () => {
    if (!message.trim()) return;
    onSendGlobal('chat', { text: message }, 'room');
    setMessage('');
  };

  const handleSendAll = () => {
    if (!message.trim()) return;
    onSendGlobal('announcement', { text: message }, 'all');
    setMessage('');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendRoom();
    }
  };

  return (
    <div className="card interaction-form">
      <h4>Action globale</h4>
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyPress={handleKeyPress}
        placeholder="Message global..."
        className="message-input"
      />
      <div className="button-group">
        <button onClick={handleSendRoom} className="btn btn-primary">
          Envoyer (room)
        </button>
        <button onClick={handleSendAll} className="btn btn-secondary">
          Envoyer (tous)
        </button>
      </div>
    </div>
  );
};

export default GlobalActionForm;
