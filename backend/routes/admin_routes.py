from flask import Blueprint, request, jsonify
from database import db
from auth import admin_required

admin_bp = Blueprint('admin', __name__)

# Variables globales pour les dépendances injectées
_games = None
_socketio = None

def init_admin_routes(games, socketio):
    """Initialise les routes admin avec les dépendances nécessaires"""
    global _games, _socketio
    _games = games
    _socketio = socketio

@admin_bp.route('/users', methods=['GET'])
@admin_required
def admin_get_users():
    include_inactive = request.args.get('include_inactive', 'false').lower() == 'true'
    users = db.get_all_users(include_inactive)
    
    return jsonify({'users': users})

@admin_bp.route('/users/<int:user_id>', methods=['DELETE'])
@admin_required
def admin_delete_user(user_id):
    if user_id == request.current_user['user_id']:
        return jsonify({'error': 'Vous ne pouvez pas supprimer votre propre compte'}), 400
    
    success = db.delete_user(user_id)
    
    if success:
        return jsonify({'success': True, 'message': 'Utilisateur supprimé'})
    else:
        return jsonify({'error': 'Utilisateur non trouvé'}), 404

@admin_bp.route('/users/<int:user_id>/toggle-admin', methods=['PUT'])
@admin_required
def admin_toggle_admin(user_id):
    data = request.json
    is_admin = data.get('is_admin', False)
    
    if user_id == request.current_user['user_id'] and not is_admin:
        return jsonify({'error': 'Vous ne pouvez pas retirer vos propres droits admin'}), 400
    
    success = db.toggle_user_admin(user_id, is_admin)
    
    if success:
        return jsonify({'success': True, 'message': 'Statut admin mis à jour'})
    else:
        return jsonify({'error': 'Utilisateur non trouvé'}), 404

@admin_bp.route('/games', methods=['GET'])
@admin_required
def admin_get_games():
    limit = request.args.get('limit', 100, type=int)
    games_list = db.get_all_games(limit)
    
    return jsonify({'games': games_list})

@admin_bp.route('/games/<game_id>', methods=['DELETE'])
@admin_required
def admin_delete_game(game_id):
    success = db.delete_game(game_id)
    
    if success:
        return jsonify({'success': True, 'message': 'Partie supprimée'})
    else:
        return jsonify({'error': 'Partie non trouvée'}), 404

@admin_bp.route('/active-games', methods=['GET'])
@admin_required
def admin_get_active_games():
    active_games = []
    
    for game_id, game in _games.items():
        active_games.append({
            'game_id': game_id,
            'players_count': len(game.players),
            'players': [{'name': p['name'], 'number': p['number']} for p in game.players.values()],
            'current_player': game.current_player,
            'game_over': game.game_over,
            'ai_enabled': game.ai_enabled,
            'moves_count': sum(1 for row in game.board for cell in row if cell != 0)
        })
    
    return jsonify({'active_games': active_games, 'count': len(active_games)})

@admin_bp.route('/active-games/<game_id>', methods=['DELETE'])
@admin_required
def admin_terminate_game(game_id):
    if game_id in _games:
        _socketio.emit('game_terminated', {
            'message': 'Cette partie a été terminée par un administrateur'
        }, room=game_id)
        
        del _games[game_id]
        
        return jsonify({'success': True, 'message': 'Partie terminée'})
    else:
        return jsonify({'error': 'Partie non trouvée'}), 404
