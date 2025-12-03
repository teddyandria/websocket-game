import React, { useState, useEffect } from 'react';
import '../styles/components/ActionsFeed.css';

const ActionsFeed = ({ socket }) => {
  const [actions, setActions] = useState([]);

  useEffect(() => {
    if (!socket) return;

    // Écouter les actions globales
    socket.on('global_action', (data) => {
      const type = data.action_type || 'message';
      const payload = data.payload || {};
      const text = `[GLOBAL] ${type}: ${payload.text || JSON.stringify(payload)}`;
      
      setActions(prev => [...prev, { id: Date.now(), text, type: 'global' }]);
    });

    // Écouter les actions privées
    socket.on('private_action', (data) => {
      const payload = data.payload || {};
      const text = `[PRIVÉ] ${payload.text || JSON.stringify(payload)}`;
      
      setActions(prev => [...prev, { id: Date.now(), text, type: 'private' }]);
    });

    return () => {
      socket.off('global_action');
      socket.off('private_action');
    };
  }, [socket]);

  return (
    <div className="card actions-feed-container">
      <h4>Flux d'actions</h4>
      <div className="actions-feed">
        {actions.length === 0 ? (
          <p className="no-actions">Aucune action pour le moment...</p>
        ) : (
          actions.map(action => (
            <div key={action.id} className={`action-item ${action.type}`}>
              {action.text}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ActionsFeed;
