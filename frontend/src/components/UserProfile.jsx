import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import '../styles/components/UserProfile.css';

function UserProfile({ isOpen, onClose }) {
  const { user, logout, updateProfile, getGameHistory } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [profileData, setProfileData] = useState({
    display_name: '',
    bio: '',
    avatar_url: ''
  });
  const [gameHistory, setGameHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (user && isOpen) {
      setProfileData({
        display_name: user.display_name || '',
        bio: user.bio || '',
        avatar_url: user.avatar_url || ''
      });
    }
  }, [user, isOpen]);

  useEffect(() => {
    if (activeTab === 'history' && isOpen) {
      loadGameHistory();
    }
  }, [activeTab, isOpen]);

  const loadGameHistory = async () => {
    setLoading(true);
    const result = await getGameHistory();
    if (result.success) {
      setGameHistory(result.history);
    }
    setLoading(false);
  };

  if (!isOpen || !user) return null;

  const handleInputChange = (e) => {
    setProfileData({
      ...profileData,
      [e.target.name]: e.target.value
    });
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    const result = await updateProfile(profileData);
    
    if (result.success) {
      setSuccess('Profil mis à jour avec succès !');
    } else {
      setError(result.error);
    }
    
    setLoading(false);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getWinRate = () => {
    if (user.games_played === 0) return 0;
    return Math.round((user.games_won / user.games_played) * 100);
  };

  return (
    <div className="profile-modal-overlay" onClick={onClose}>
      <div className="profile-modal" onClick={(e) => e.stopPropagation()}>
        <div className="profile-header">
          <div className="profile-avatar">
            {user.avatar_url ? (
              <img src={user.avatar_url} alt="Avatar" />
            ) : (
              <div className="avatar-placeholder">
                {user.display_name ? user.display_name.charAt(0).toUpperCase() : '👤'}
              </div>
            )}
          </div>
          <div className="profile-info">
            <h2>{user.display_name || user.username}</h2>
            <p className="username">@{user.username}</p>
            <div className="stats">
              <span className="stat">
                🎮 {user.games_played} parties
              </span>
              <span className="stat">
                🏆 {user.games_won} victoires
              </span>
              <span className="stat">
                📊 {getWinRate()}% de réussite
              </span>
            </div>
          </div>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="profile-tabs">
          <button 
            className={`tab ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            👤 Profil
          </button>
          <button 
            className={`tab ${activeTab === 'history' ? 'active' : ''}`}
            onClick={() => setActiveTab('history')}
          >
            📜 Historique
          </button>
        </div>

        <div className="profile-content">
          {activeTab === 'profile' && (
            <form onSubmit={handleSubmit} className="profile-form">
              {error && <div className="error-message">{error}</div>}
              {success && <div className="success-message">{success}</div>}

              <div className="form-group">
                <label htmlFor="display_name">Nom d'affichage</label>
                <input
                  type="text"
                  id="display_name"
                  name="display_name"
                  value={profileData.display_name}
                  onChange={handleInputChange}
                  maxLength="100"
                  placeholder="Votre nom d'affichage"
                />
              </div>

              <div className="form-group">
                <label htmlFor="bio">Biographie</label>
                <textarea
                  id="bio"
                  name="bio"
                  value={profileData.bio}
                  onChange={handleInputChange}
                  maxLength="500"
                  rows="4"
                  placeholder="Dites-nous en plus sur vous..."
                />
              </div>

              <div className="form-group">
                <label htmlFor="avatar_url">URL de l'avatar</label>
                <input
                  type="url"
                  id="avatar_url"
                  name="avatar_url"
                  value={profileData.avatar_url}
                  onChange={handleInputChange}
                  placeholder="https://exemple.com/votre-avatar.jpg"
                />
              </div>

              <div className="form-actions">
                <button type="submit" className="save-btn" disabled={loading}>
                  {loading ? 'Sauvegarde...' : 'Sauvegarder'}
                </button>
                <button type="button" onClick={logout} className="logout-btn">
                  Déconnexion
                </button>
              </div>
            </form>
          )}

          {activeTab === 'history' && (
            <div className="game-history">
              {loading ? (
                <div className="loading">Chargement de l'historique...</div>
              ) : gameHistory.length === 0 ? (
                <div className="no-history">
                  <p>🎮 Aucune partie enregistrée pour le moment</p>
                  <p>Jouez des parties en mode connecté pour voir votre historique ici !</p>
                </div>
              ) : (
                <div className="history-list">
                  {gameHistory.map((game, index) => (
                    <div key={index} className="history-item">
                      <div className="game-players">
                        <span className="player">{game.player1_name}</span>
                        <span className="vs">VS</span>
                        <span className="player">{game.player2_name}</span>
                      </div>
                      <div className="game-result">
                        {game.winner_id ? (
                          <span className={`result ${game.winner_id === user.id ? 'win' : 'loss'}`}>
                            {game.winner_id === user.id ? '🏆 Victoire' : '💔 Défaite'}
                          </span>
                        ) : (
                          <span className="result draw">🤝 Match nul</span>
                        )}
                      </div>
                      <div className="game-info">
                        <span className="date">{formatDate(game.ended_at)}</span>
                        <span className="moves">{game.moves_count} coups</span>
                        <span className="mode">{game.game_mode}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default UserProfile;