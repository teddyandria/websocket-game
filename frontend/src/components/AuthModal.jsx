import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import '../styles/components/AuthModal.css';

function AuthModal({ isOpen, onClose, mode: initialMode = 'login' }) {
  const { login, register } = useAuth();
  const [mode, setMode] = useState(initialMode);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    displayName: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Synchroniser le mode avec le prop quand le modal s'ouvre
  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setError('');
      setFormData({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        displayName: ''
      });
    }
  }, [isOpen, initialMode]);

  if (!isOpen) return null;

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError(''); // Effacer l'erreur quand l'utilisateur tape
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (mode === 'login') {
        const result = await login(formData.username, formData.password);
        if (result.success) {
          onClose();
          setFormData({
            username: '',
            email: '',
            password: '',
            confirmPassword: '',
            displayName: ''
          });
        } else {
          setError(result.error);
        }
      } else {
        // Mode inscription
        if (formData.password !== formData.confirmPassword) {
          setError('Les mots de passe ne correspondent pas');
          setLoading(false);
          return;
        }

        if (formData.password.length < 6) {
          setError('Le mot de passe doit faire au moins 6 caractères');
          setLoading(false);
          return;
        }

        const result = await register(
          formData.username,
          formData.email,
          formData.password,
          formData.displayName
        );

        if (result.success) {
          onClose();
          setFormData({
            username: '',
            email: '',
            password: '',
            confirmPassword: '',
            displayName: ''
          });
        } else {
          setError(result.error);
        }
      }
    } catch (err) {
      setError('Une erreur inattendue s\'est produite');
    }

    setLoading(false);
  };

  const switchMode = () => {
    setMode(mode === 'login' ? 'register' : 'login');
    setError('');
    setFormData({
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
      displayName: ''
    });
  };

  return (
    <div className="auth-modal-overlay" onClick={onClose}>
      <div className="auth-modal" onClick={(e) => e.stopPropagation()}>
        <div className="auth-modal-header">
          <h2>
            {mode === 'login' ? '🏰 Connexion' : '⚔️ Inscription'}
          </h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {error && (
            <div className="auth-error">
              {error}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="username">Nom d'utilisateur</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              required
              minLength="3"
              maxLength="50"
              placeholder="Votre nom d'utilisateur"
            />
          </div>

          {mode === 'register' && (
            <>
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  placeholder="votre@email.com"
                />
              </div>

              <div className="form-group">
                <label htmlFor="displayName">Nom d'affichage (optionnel)</label>
                <input
                  type="text"
                  id="displayName"
                  name="displayName"
                  value={formData.displayName}
                  onChange={handleInputChange}
                  maxLength="100"
                  placeholder="Comment vous apparaîtrez aux autres"
                />
              </div>
            </>
          )}

          <div className="form-group">
            <label htmlFor="password">Mot de passe</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              required
              minLength="6"
              placeholder="Votre mot de passe"
            />
          </div>

          {mode === 'register' && (
            <div className="form-group">
              <label htmlFor="confirmPassword">Confirmer le mot de passe</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                required
                placeholder="Répétez votre mot de passe"
              />
            </div>
          )}

          <button 
            type="submit" 
            className="auth-submit-btn"
            disabled={loading}
          >
            {loading ? 'Chargement...' : (mode === 'login' ? 'Se connecter' : 'S\'inscrire')}
          </button>
        </form>

        <div className="auth-switch">
          {mode === 'login' ? (
            <p>
              Pas encore de compte ?{' '}
              <button type="button" onClick={switchMode} className="switch-link">
                Créer un compte
              </button>
            </p>
          ) : (
            <p>
              Déjà un compte ?{' '}
              <button type="button" onClick={switchMode} className="switch-link">
                Se connecter
              </button>
            </p>
          )}
        </div>

        <div className="auth-guest-mode">
          <hr />
          <p className="guest-text">
            Ou continuez en tant qu'invité (fonctionnalités limitées)
          </p>
          <button type="button" onClick={onClose} className="guest-btn">
            🎮 Jouer en mode invité
          </button>
        </div>
      </div>
    </div>
  );
}

export default AuthModal;