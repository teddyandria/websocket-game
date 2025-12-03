import jwt
import secrets
from datetime import datetime, timedelta
from functools import wraps
from flask import request, jsonify, current_app
import os

class AuthManager:
    def __init__(self, secret_key=None):
        self.secret_key = secret_key or os.getenv('SECRET_KEY') or secrets.token_hex(32)
    
    def generate_token(self, user_data):
        payload = {
            'user_id': user_data['id'],
            'username': user_data['username'],
            'exp': datetime.utcnow() + timedelta(days=7),
            'iat': datetime.utcnow()
        }
        
        return jwt.encode(payload, self.secret_key, algorithm='HS256')
    
    def verify_token(self, token):
        """Vérifie et décode un JWT token"""
        try:
            payload = jwt.decode(token, self.secret_key, algorithms=['HS256'])
            return payload
        except jwt.ExpiredSignatureError:
            return None
        except jwt.InvalidTokenError:
            return None
    
    def get_user_from_token(self, token):
        """Extrait les données utilisateur d'un token"""
        payload = self.verify_token(token)
        if payload:
            return {
                'user_id': payload['user_id'],
                'username': payload['username']
            }
        return None

def token_required(f):
    """Décorateur pour protéger les routes nécessitant une authentification"""
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        
        auth_header = request.headers.get('Authorization')
        if auth_header:
            try:
                token = auth_header.split(' ')[1]
            except IndexError:
                return jsonify({'error': 'Format de token invalide'}), 401
        
        if not token:
            return jsonify({'error': 'Token manquant'}), 401
        
        auth_manager = current_app.auth_manager
        user_data = auth_manager.get_user_from_token(token)
        
        if not user_data:
            return jsonify({'error': 'Token invalide ou expiré'}), 401
        
        # Ajouter les données utilisateur à la requête
        request.current_user = user_data
        return f(*args, **kwargs)
    
    return decorated

def optional_token(f):
    """Décorateur pour les routes où l'authentification est optionnelle"""
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        request.current_user = None
        
        auth_header = request.headers.get('Authorization')
        if auth_header:
            try:
                token = auth_header.split(' ')[1]
                auth_manager = current_app.auth_manager
                user_data = auth_manager.get_user_from_token(token)
                if user_data:
                    request.current_user = user_data
            except:
                pass
        
        return f(*args, **kwargs)
    
    return decorated

def admin_required(f):
    """Décorateur pour protéger les routes admin"""
    @wraps(f)
    def decorated(*args, **kwargs):
        from database import db
        
        token = None
        
        auth_header = request.headers.get('Authorization')
        if auth_header:
            try:
                token = auth_header.split(' ')[1]
            except IndexError:
                return jsonify({'error': 'Format de token invalide'}), 401
        
        if not token:
            return jsonify({'error': 'Token manquant'}), 401
        
        auth_manager = current_app.auth_manager
        user_data = auth_manager.get_user_from_token(token)
        
        if not user_data:
            return jsonify({'error': 'Token invalide ou expiré'}), 401
        
        user = db.get_user_by_id(user_data['user_id'])
        if not user or not user.get('is_admin'):
            return jsonify({'error': 'Accès refusé - droits administrateur requis'}), 403
        request.current_user = user_data
        return f(*args, **kwargs)
    
    return decorated

# Instance globale
auth_manager = AuthManager()