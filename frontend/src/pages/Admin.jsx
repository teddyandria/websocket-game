import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import '../styles/pages/Admin.css';

const Admin = () => {
  const { user, getAuthHeaders } = useAuth();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState('users');
  const [users, setUsers] = useState([]);
  const [games, setGames] = useState([]);
  const [activeGames, setActiveGames] = useState([]);
  const [connectedUsers, setConnectedUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (!user || !user.is_admin) {
      navigate('/');
    }
  }, [user, navigate]);

  useEffect(() => {
    if (activeTab === 'users') {
      loadUsers();
    } else if (activeTab === 'games') {
      loadGames();
    } else if (activeTab === 'active-games') {
      loadActiveGames();
    } else if (activeTab === 'connected-users') {
      loadConnectedUsers();
    }
  }, [activeTab]);

  const loadUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('http://localhost:5001/api/admin/users', {
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users);
      } else {
        setError('Erreur lors du chargement des utilisateurs');
      }
    } catch (err) {
      setError('Erreur de connexion au serveur');
    }
    setLoading(false);
  };

  const loadGames = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('http://localhost:5001/api/admin/games', {
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setGames(data.games);
      } else {
        setError('Erreur lors du chargement des parties');
      }
    } catch (err) {
      setError('Erreur de connexion au serveur');
    }
    setLoading(false);
  };

  const loadActiveGames = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('http://localhost:5001/api/admin/active-games', {
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setActiveGames(data.active_games);
      } else {
        setError('Erreur lors du chargement des parties actives');
      }
    } catch (err) {
      setError('Erreur de connexion au serveur');
    }
    setLoading(false);
  };

  const loadConnectedUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('http://localhost:5001/api/admin/connected-users', {
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setConnectedUsers(data.connected_users);
      } else {
        setError('Erreur lors du chargement des utilisateurs connectés');
      }
    } catch (err) {
      setError('Erreur de connexion au serveur');
    }
    setLoading(false);
  };

  const deleteUser = async (userId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:5001/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        }
      });

      if (response.ok) {
        setSuccessMessage('Utilisateur supprimé avec succès');
        loadUsers();
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        const data = await response.json();
        setError(data.error || 'Erreur lors de la suppression');
      }
    } catch (err) {
      setError('Erreur de connexion au serveur');
    }
  };

  const toggleAdmin = async (userId, currentStatus) => {
    const newStatus = !currentStatus;
    
    try {
      const response = await fetch(`http://localhost:5001/api/admin/users/${userId}/toggle-admin`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        body: JSON.stringify({ is_admin: newStatus })
      });

      if (response.ok) {
        setSuccessMessage(`Statut admin ${newStatus ? 'activé' : 'désactivé'}`);
        loadUsers();
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        const data = await response.json();
        setError(data.error || 'Erreur lors de la modification');
      }
    } catch (err) {
      setError('Erreur de connexion au serveur');
    }
  };

  const deleteGame = async (gameId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette partie ?')) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:5001/api/admin/games/${gameId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        }
      });

      if (response.ok) {
        setSuccessMessage('Partie supprimée avec succès');
        loadGames();
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        const data = await response.json();
        setError(data.error || 'Erreur lors de la suppression');
      }
    } catch (err) {
      setError('Erreur de connexion au serveur');
    }
  };

  const terminateActiveGame = async (gameId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir terminer cette partie en cours ?')) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:5001/api/admin/active-games/${gameId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        }
      });

      if (response.ok) {
        setSuccessMessage('Partie terminée avec succès');
        loadActiveGames();
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        const data = await response.json();
        setError(data.error || 'Erreur lors de la terminaison');
      }
    } catch (err) {
      setError('Erreur de connexion au serveur');
    }
  };

  const disconnectUser = async (sid) => {
    if (!window.confirm('Êtes-vous sûr de vouloir déconnecter cet utilisateur ?')) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:5001/api/admin/connected-users/${sid}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        }
      });

      if (response.ok) {
        setSuccessMessage('Utilisateur déconnecté avec succès');
        loadConnectedUsers();
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        const data = await response.json();
        setError(data.error || 'Erreur lors de la déconnexion');
      }
    } catch (err) {
      setError('Erreur de connexion au serveur');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR') + ' ' + date.toLocaleTimeString('fr-FR');
  };

  if (!user || !user.is_admin) {
    return null;
  }

  return (
    <div className="admin-page">
      <div className="admin-container">
        <div className="admin-header">
          <h1>🛡️ Panneau d'Administration</h1>
          <button onClick={() => navigate('/')} className="btn-back">
            ← Retour
          </button>
        </div>

        {error && <div className="alert alert-error">{error}</div>}
        {successMessage && <div className="alert alert-success">{successMessage}</div>}

        <div className="admin-tabs">
          <button
            className={activeTab === 'users' ? 'tab-active' : ''}
            onClick={() => setActiveTab('users')}
          >
            👥 Utilisateurs ({users.length})
          </button>
          <button
            className={activeTab === 'games' ? 'tab-active' : ''}
            onClick={() => setActiveTab('games')}
          >
            📜 Historique ({games.length})
          </button>
          <button
            className={activeTab === 'active-games' ? 'tab-active' : ''}
            onClick={() => setActiveTab('active-games')}
          >
            🎮 Parties actives ({activeGames.length})
          </button>
          <button
            className={activeTab === 'connected-users' ? 'tab-active' : ''}
            onClick={() => setActiveTab('connected-users')}
          >
            🟢 En ligne ({connectedUsers.length})
          </button>
        </div>

        <div className="admin-content">
          {loading ? (
            <div className="loading">Chargement...</div>
          ) : (
            <>
              {activeTab === 'users' && (
                <div className="users-table">
                  <table>
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Nom d'utilisateur</th>
                        <th>Email</th>
                        <th>Nom affiché</th>
                        <th>Parties jouées</th>
                        <th>Victoires</th>
                        <th>Admin</th>
                        <th>Créé le</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map(u => (
                        <tr key={u.id} className={u.is_admin ? 'admin-row' : ''}>
                          <td>{u.id}</td>
                          <td>{u.username}</td>
                          <td>{u.email}</td>
                          <td>{u.display_name || '-'}</td>
                          <td>{u.games_played}</td>
                          <td>{u.games_won}</td>
                          <td>
                            <span className={`badge ${u.is_admin ? 'badge-admin' : 'badge-user'}`}>
                              {u.is_admin ? 'Admin' : 'Utilisateur'}
                            </span>
                          </td>
                          <td>{formatDate(u.created_at)}</td>
                          <td className="actions-cell">
                            <button
                              onClick={() => toggleAdmin(u.id, u.is_admin)}
                              className="btn-small btn-warning"
                              disabled={u.id === user.id}
                            >
                              {u.is_admin ? '⬇️ Retirer admin' : '⬆️ Promouvoir'}
                            </button>
                            <button
                              onClick={() => deleteUser(u.id)}
                              className="btn-small btn-danger"
                              disabled={u.id === user.id}
                            >
                              🗑️ Supprimer
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {users.length === 0 && <p className="no-data">Aucun utilisateur trouvé</p>}
                </div>
              )}

              {activeTab === 'games' && (
                <div className="games-table">
                  <table>
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Joueur 1</th>
                        <th>Joueur 2</th>
                        <th>Mode</th>
                        <th>Coups</th>
                        <th>Commencée le</th>
                        <th>Terminée le</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {games.map(g => (
                        <tr key={g.id}>
                          <td>{g.game_id.substring(0, 8)}...</td>
                          <td>{g.player1_name}</td>
                          <td>{g.player2_name || 'IA'}</td>
                          <td>{g.game_mode === 'ai' ? 'IA' : 'Multi'}</td>
                          <td>{g.moves_count}</td>
                          <td>{formatDate(g.started_at)}</td>
                          <td>{formatDate(g.ended_at)}</td>
                          <td>
                            <button
                              onClick={() => deleteGame(g.game_id)}
                              className="btn-small btn-danger"
                            >
                              🗑️ Supprimer
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {games.length === 0 && <p className="no-data">Aucune partie enregistrée</p>}
                </div>
              )}

              {activeTab === 'active-games' && (
                <div className="active-games-grid">
                  {activeGames.map(g => (
                    <div key={g.game_id} className="active-game-card">
                      <div className="game-card-header">
                        <h3>Partie {g.game_id.substring(0, 8)}</h3>
                        <span className={`status ${g.game_over ? 'status-ended' : 'status-active'}`}>
                          {g.game_over ? 'Terminée' : 'En cours'}
                        </span>
                      </div>
                      <div className="game-card-body">
                        <p><strong>Joueurs:</strong> {g.players_count}/2</p>
                        <ul className="players-list-admin">
                          {g.players.map(p => (
                            <li key={p.number}>
                              {p.name} {p.number === g.current_player && !g.game_over && '(en train de jouer)'}
                            </li>
                          ))}
                        </ul>
                        <p><strong>Mode:</strong> {g.ai_enabled ? 'IA' : 'Multijoueur'}</p>
                        <p><strong>Coups joués:</strong> {g.moves_count}</p>
                      </div>
                      <div className="game-card-footer">
                        <button
                          onClick={() => terminateActiveGame(g.game_id)}
                          className="btn-danger btn-full"
                        >
                          ⛔ Terminer la partie
                        </button>
                      </div>
                    </div>
                  ))}
                  {activeGames.length === 0 && <p className="no-data">Aucune partie active</p>}
                </div>
              )}

              {activeTab === 'connected-users' && (
                <div className="connected-users-section">
                  <div className="section-header">
                    <h2>Utilisateurs connectés</h2>
                    <button onClick={loadConnectedUsers} className="btn-refresh">
                      🔄 Actualiser
                    </button>
                  </div>
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Nom d'utilisateur</th>
                        <th>Statut</th>
                        <th>Partie</th>
                        <th>Connecté depuis</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {connectedUsers.map(cu => (
                        <tr key={cu.sid}>
                          <td>{cu.username}</td>
                          <td>
                            <span className={`badge badge-${cu.role === 'idle' ? 'idle' : cu.role === 'player' ? 'player' : 'spectator'}`}>
                              {cu.role === 'idle' ? '💤 Inactif' : cu.role === 'player' ? '🎮 Joueur' : '👁️ Spectateur'}
                            </span>
                          </td>
                          <td>
                            {cu.in_game ? cu.in_game.substring(0, 8) + '...' : '-'}
                          </td>
                          <td>{formatDate(cu.connected_at)}</td>
                          <td>
                            <button
                              onClick={() => disconnectUser(cu.sid)}
                              className="btn-danger btn-small"
                            >
                              🚫 Déconnecter
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {connectedUsers.length === 0 && <p className="no-data">Aucun utilisateur connecté</p>}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Admin;
