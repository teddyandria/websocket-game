import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import AuthModal from '../components/AuthModal';
import UserProfile from '../components/UserProfile';
import '../styles/pages/Home.css';

const API_URL = 'http://localhost:5001';

const Home = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, getAuthHeaders } = useAuth();
  const [gameId, setGameId] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [createdGameId, setCreatedGameId] = useState(null);
  const [createdAiGameId, setCreatedAiGameId] = useState(null);
  const [difficulty, setDifficulty] = useState('medium');
  const [playerNameCreator, setPlayerNameCreator] = useState('');
  const [playerNameAi, setPlayerNameAi] = useState('');
  const [loading, setLoading] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [authModalMode, setAuthModalMode] = useState('login');

  const handleCreateGame = async () => {
    // Vérifier si l'utilisateur est connecté
    if (!isAuthenticated()) {
      setAuthModalMode('login');
      setShowAuthModal(true);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/create_game`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      if (response.ok) {
        const data = await response.json();
        setCreatedGameId(data.game_id);
        // Utiliser le nom de l'utilisateur connecté
        setPlayerNameCreator(user.display_name || user.username);
      } else {
        alert('Erreur lors de la création de la partie');
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  const handleStartGame = () => {
    const nameToUse = isAuthenticated() 
      ? (user.display_name || user.username) 
      : playerNameCreator.trim();
    
    if (!nameToUse) {
      alert('Veuillez entrer votre nom');
      return;
    }
    navigate(`/game/${createdGameId}?name=${encodeURIComponent(nameToUse)}`);
  };

  const handleCreateAiGame = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/create_ai_game`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ difficulty })
      });

      if (response.ok) {
        const data = await response.json();
        setCreatedAiGameId(data.game_id);
      } else {
        alert('Erreur lors de la création de la partie IA');
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  const handleStartAiGame = () => {
    const nameToUse = isAuthenticated() 
      ? (user.display_name || user.username) 
      : playerNameAi.trim();
    
    if (!nameToUse) {
      alert('Veuillez entrer votre nom');
      return;
    }
    navigate(`/game/${createdAiGameId}?name=${encodeURIComponent(nameToUse)}`);
  };

  const handleJoinGame = () => {
    if (!gameId.trim()) {
      alert('Veuillez entrer l\'ID de la partie');
      return;
    }
    
    const nameToUse = isAuthenticated() 
      ? (user.display_name || user.username) 
      : playerName.trim();
    
    if (!nameToUse) {
      alert('Veuillez entrer votre nom');
      return;
    }
    navigate(`/game/${gameId}?name=${encodeURIComponent(nameToUse)}`);
  };

  const handleCancelMulti = () => {
    if (window.confirm('Êtes-vous sûr de vouloir annuler la création de cette partie ?')) {
      setCreatedGameId(null);
      setPlayerNameCreator('');
    }
  };

  const handleCancelAi = () => {
    if (window.confirm('Êtes-vous sûr de vouloir annuler la création de cette partie IA ?')) {
      setCreatedAiGameId(null);
      setPlayerNameAi('');
    }
  };

  return (
    <div className="container">
      {/* Barre de navigation */}
      <nav className="navbar">
        <div className="nav-left">
          <h1>🔴 Puissance 4 🟡</h1>
        </div>
        <div className="nav-right">
          {isAuthenticated() ? (
            <div className="user-menu">
              {user.is_admin && (
                <button 
                  className="btn-admin"
                  onClick={() => navigate('/admin')}
                >
                  🛡️ Admin
                </button>
              )}
              <button 
                className="user-button"
                onClick={() => setShowProfile(true)}
              >
                <span className="user-avatar">
                  {user.avatar_url ? (
                    <img src={user.avatar_url} alt="Avatar" />
                  ) : (
                    user.display_name ? user.display_name.charAt(0).toUpperCase() : '👤'
                  )}
                </span>
                <span className="user-name">{user.display_name || user.username}</span>
              </button>
            </div>
          ) : (
            <div className="auth-buttons">
              <button 
                className="btn-secondary"
                onClick={() => {
                  setAuthModalMode('login');
                  setShowAuthModal(true);
                }}
              >
                Connexion
              </button>
              <button 
                className="btn-primary"
                onClick={() => {
                  setAuthModalMode('register');
                  setShowAuthModal(true);
                }}
              >
                Inscription
              </button>
            </div>
          )}
        </div>
      </nav>
      
      <div className="menu">
        <div className="card">
          <h2>Bienvenue !</h2>
          <p>Créez une nouvelle partie ou rejoignez une partie existante pour jouer au Puissance 4 en ligne.</p>

          {!createdGameId && !createdAiGameId && (
            <div className="actions">
              <button 
                onClick={handleCreateGame} 
                className="btn btn-primary"
                disabled={loading}
              >
                Créer une partie multijoueur
              </button>

              <div className="ai-section">
                <h3>Jouer contre l'IA</h3>
                <div className="difficulty-selection">
                  <label htmlFor="difficulty">Niveau de difficulté :</label>
                  <select
                    id="difficulty"
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value)}
                    className="difficulty-select"
                  >
                    <option value="easy">Facile</option>
                    <option value="medium">Moyen</option>
                    <option value="hard">Difficile</option>
                  </select>
                </div>
                <button 
                  onClick={handleCreateAiGame} 
                  className="btn btn-success"
                  disabled={loading}
                >
                  Jouer contre l'IA
                </button>
              </div>

              <div className="join-section">
                <h3>Rejoindre une partie existante</h3>
                <input
                  type="text"
                  value={gameId}
                  onChange={(e) => setGameId(e.target.value)}
                  placeholder="ID de la partie"
                  maxLength="36"
                  onKeyPress={(e) => e.key === 'Enter' && handleJoinGame()}
                />
                {!isAuthenticated() && (
                  <input
                    type="text"
                    value={playerName}
                    onChange={(e) => setPlayerName(e.target.value)}
                    placeholder="Votre nom"
                    maxLength="20"
                    onKeyPress={(e) => e.key === 'Enter' && handleJoinGame()}
                  />
                )}
                <button onClick={handleJoinGame} className="btn btn-secondary">
                  Rejoindre la partie
                </button>
              </div>
            </div>
          )}

          {createdGameId && (
            <div className="game-created">
              <h3>Partie multijoueur créée !</h3>
              <p>ID de votre partie : <strong>{createdGameId}</strong></p>
              <p>Partagez cet ID avec votre adversaire</p>
              {isAuthenticated() ? (
                <p className="user-info">Vous jouez en tant que : <strong>{user.display_name || user.username}</strong></p>
              ) : (
                <input
                  type="text"
                  value={playerNameCreator}
                  onChange={(e) => setPlayerNameCreator(e.target.value)}
                  placeholder="Votre nom"
                  maxLength="20"
                  onKeyPress={(e) => e.key === 'Enter' && handleStartGame()}
                />
              )}
              <div className="game-actions">
                <button onClick={handleStartGame} className="btn btn-success">
                  Commencer la partie
                </button>
                <button onClick={handleCancelMulti} className="btn btn-secondary">
                  Annuler
                </button>
              </div>
            </div>
          )}

          {createdAiGameId && (
            <div className="game-created">
              <h3>Partie IA créée !</h3>
              <p>Niveau : <strong>{difficulty}</strong></p>
              {isAuthenticated() ? (
                <p className="user-info">Vous jouez en tant que : <strong>{user.display_name || user.username}</strong></p>
              ) : (
                <input
                  type="text"
                  value={playerNameAi}
                  onChange={(e) => setPlayerNameAi(e.target.value)}
                  placeholder="Votre nom"
                  maxLength="20"
                  onKeyPress={(e) => e.key === 'Enter' && handleStartAiGame()}
                />
              )}
              <div className="game-actions">
                <button onClick={handleStartAiGame} className="btn btn-success">
                  Commencer contre l'IA
                </button>
                <button onClick={handleCancelAi} className="btn btn-secondary">
                  Annuler
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="card rules">
          <h3>Règles du jeu</h3>
          <ul>
            <li>Le but est d'aligner 4 pions de votre couleur</li>
            <li>Vous pouvez aligner horizontalement, verticalement ou en diagonale</li>
            <li>Les pions tombent par gravité dans la colonne choisie</li>
            <li>Le joueur rouge commence toujours</li>
          </ul>
        </div>
      </div>

      {/* Modals */}
      <AuthModal 
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        mode={authModalMode}
      />
      
      <UserProfile
        isOpen={showProfile}
        onClose={() => setShowProfile(false)}
      />
    </div>
  );
};

export default Home;
