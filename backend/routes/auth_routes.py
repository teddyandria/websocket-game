from flask import Blueprint, request, jsonify, current_app
from database import db
from auth import token_required, optional_token

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'ok'})

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.json
    username = data.get('username')
    email = data.get('email')
    password = data.get('password')
    display_name = data.get('display_name')
    
    if not username or not email or not password:
        return jsonify({'error': 'Tous les champs sont requis'}), 400
    
    if len(password) < 6:
        return jsonify({'error': 'Le mot de passe doit contenir au moins 6 caractères'}), 400
    
    user_id = db.create_user(username, email, password, display_name)
    
    if not user_id:
        return jsonify({'error': 'Nom d\'utilisateur ou email déjà utilisé'}), 409
    
    user = db.get_user_by_id(user_id)
    token = current_app.auth_manager.generate_token(user)
    
    return jsonify({
        'token': token,
        'user': user
    }), 201

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.json
    username = data.get('username')
    password = data.get('password')
    
    user = db.authenticate_user(username, password)
    
    if not user:
        return jsonify({'error': 'Identifiants invalides'}), 401
    
    token = current_app.auth_manager.generate_token(user)
    
    return jsonify({
        'token': token,
        'user': user
    })

@auth_bp.route('/profile', methods=['GET'])
@token_required
def get_profile():
    user_id = request.current_user['user_id']
    user = db.get_user_by_id(user_id)
    
    return jsonify({'success': True, 'user': user})

@auth_bp.route('/profile', methods=['PUT'])
@token_required
def update_profile():
    user_id = request.current_user['user_id']
    data = request.json
    
    allowed_fields = ['display_name', 'bio', 'avatar_url']
    update_data = {k: v for k, v in data.items() if k in allowed_fields}
    
    if not update_data:
        return jsonify({'error': 'Aucune donnée à mettre à jour'}), 400
    
    success = db.update_user_profile(user_id, **update_data)
    
    user = db.get_user_by_id(user_id)
    
    return jsonify({'success': True, 'user': user})

@auth_bp.route('/game-history', methods=['GET'])
@token_required
def get_game_history():
    user_id = request.current_user['user_id']
    limit = request.args.get('limit', 50, type=int)
    
    history = db.get_user_game_history(user_id, limit)
    
    return jsonify({'history': history})

@auth_bp.route('/chat-history/<game_id>', methods=['GET'])
@optional_token
def get_chat_history(game_id):
    limit = request.args.get('limit', 100, type=int)
    history = db.get_chat_history(game_id, limit)
    
    return jsonify({'messages': history})
