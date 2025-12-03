from flask import Blueprint, render_template, request
from flask_socketio import emit, join_room, leave_room
import uuid
import threading
import time
from ai import PuissanceAI

game_bp = Blueprint('game', __name__)

_games = None

def init_game_routes(games):
    """Initialise les routes de jeu avec le dictionnaire des parties"""
    global _games
    _games = games

class Puissance4:
    def __init__(self, ai_enabled=False, difficulty='medium'):
        self.rows = 6
        self.cols = 7
        self.board = [[0 for _ in range(self.cols)] for _ in range(self.rows)]
        self.current_player = 1
        self.players = {}
        self.spectators = {}
        self.game_over = False
        self.winner = None
        self.ai_enabled = ai_enabled
        self.ai = PuissanceAI(difficulty) if ai_enabled else None
        self.global_score = {'player1': 0, 'player2': 0, 'draws': 0}
        
    def drop_piece(self, col, player):
        if col < 0 or col >= self.cols or self.game_over:
            return False
        
        for row in range(self.rows - 1, -1, -1):
            if self.board[row][col] == 0:
                self.board[row][col] = player
                return True
        return False
    
    def check_winner(self):
        for row in range(self.rows):
            for col in range(self.cols - 3):
                if self.board[row][col] != 0 and \
                   self.board[row][col] == self.board[row][col+1] == \
                   self.board[row][col+2] == self.board[row][col+3]:
                    return self.board[row][col]
        
        for row in range(self.rows - 3):
            for col in range(self.cols):
                if self.board[row][col] != 0 and \
                   self.board[row][col] == self.board[row+1][col] == \
                   self.board[row+2][col] == self.board[row+3][col]:
                    return self.board[row][col]
        
        for row in range(self.rows - 3):
            for col in range(self.cols - 3):
                if self.board[row][col] != 0 and \
                   self.board[row][col] == self.board[row+1][col+1] == \
                   self.board[row+2][col+2] == self.board[row+3][col+3]:
                    return self.board[row][col]
        
        for row in range(3, self.rows):
            for col in range(self.cols - 3):
                if self.board[row][col] != 0 and \
                   self.board[row][col] == self.board[row-1][col+1] == \
                   self.board[row-2][col+2] == self.board[row-3][col+3]:
                    return self.board[row][col]
        
        return None
    
    def is_board_full(self):
        return all(self.board[0][col] != 0 for col in range(self.cols))
    
    def reset_game(self):
        self.board = [[0 for _ in range(self.cols)] for _ in range(self.rows)]
        self.current_player = 1
        self.game_over = False
        self.winner = None
    
    def to_dict(self):
        return {
            'board': self.board,
            'current_player': self.current_player,
            'players': self.players,
            'spectators': self.spectators,
            'game_over': self.game_over,
            'winner': self.winner,
            'ai_enabled': self.ai_enabled,
            'global_score': self.global_score
        }
    
    def update_score(self, winner):
        """Met à jour le score global après une victoire"""
        if winner == 1:
            self.global_score['player1'] += 1
        elif winner == 2:
            self.global_score['player2'] += 1
        elif winner == 0:
            self.global_score['draws'] += 1

@game_bp.route('/join_game/<game_id>')
def join_game(game_id):
    if game_id in _games:
        return render_template('game.html', game_id=game_id)
    else:
        return "Partie non trouvée", 404

@game_bp.route('/create_game', methods=['POST'])
def create_game():
    game_id = str(uuid.uuid4())
    _games[game_id] = Puissance4()
    return {'game_id': game_id}

@game_bp.route('/create_ai_game', methods=['POST'])
def create_ai_game():
    data = request.json or {}
    difficulty = data.get('difficulty', 'medium')
    
    game_id = str(uuid.uuid4())
    game = Puissance4(ai_enabled=True, difficulty=difficulty)
    _games[game_id] = game
    
    return {'game_id': game_id, 'difficulty': difficulty}

def init_socketio_handlers(socketio, games, connected_users):
    from datetime import datetime
    
    def emit_game_state(game_id):
        if game_id not in games:
            return
        game = games[game_id]
        socketio.emit('game_state', game.to_dict(), room=game_id)
    
    @socketio.on('connect')
    def on_connect():
        connected_users[request.sid] = {
            'sid': request.sid,
            'username': 'Anonyme',
            'connected_at': datetime.now().isoformat()
        }
        print(f"✅ Utilisateur connecté: {request.sid} (Total: {len(connected_users)})")
    
    @socketio.on('join_game')
    def on_join_game(data):
        game_id = data['game_id']
        player_name = data['player_name']
        
        if request.sid in connected_users:
            connected_users[request.sid]['username'] = player_name
        
        if game_id not in games:
            emit('error', {'message': 'Partie non trouvée'})
            return
        
        game = games[game_id]
        join_room(game_id)
        
        if game.ai_enabled:
            if request.sid not in game.players:
                game.players[request.sid] = {
                    'number': 1,
                    'name': player_name,
                    'sid': request.sid
                }
                
                emit('player_assigned', {
                    'player_number': 1,
                    'name': player_name,
                    'sid': request.sid,
                    'role': 'player'
                }, room=request.sid)
        else:
            if len(game.players) < 2:
                player_number = len(game.players) + 1
                game.players[request.sid] = {
                    'number': player_number,
                    'name': player_name,
                    'sid': request.sid
                }
                
                emit('player_assigned', {
                    'player_number': player_number,
                    'name': player_name,
                    'sid': request.sid,
                    'role': 'player'
                }, room=request.sid)
                
                emit('player_joined', {
                    'player_name': player_name,
                    'player_number': player_number,
                    'players_count': len(game.players),
                    'spectators_count': len(game.spectators)
                }, room=game_id)
            else:
                game.spectators[request.sid] = {
                    'name': player_name,
                    'sid': request.sid
                }
                
                emit('player_assigned', {
                    'player_number': None,
                    'name': player_name,
                    'sid': request.sid,
                    'role': 'spectator'
                }, room=request.sid)
                
                emit('spectator_joined', {
                    'spectator_name': player_name,
                    'players_count': len(game.players),
                    'spectators_count': len(game.spectators)
                }, room=game_id)
                return
        
        emit_game_state(game_id)
    
    @socketio.on('make_move')
    def on_make_move(data):
        game_id = data['game_id']
        col = data['col']
        
        if game_id not in games:
            emit('error', {'message': 'Partie non trouvée'})
            return
        
        game = games[game_id]
        
        if len(game.players) < 2 and not game.ai_enabled:
            emit('error', {'message': 'Attendez qu\'un autre joueur rejoigne la partie'})
            return
        
        if request.sid not in game.players:
            emit('error', {'message': 'Vous n\'êtes pas dans cette partie'})
            return
        
        player_number = game.players[request.sid]['number']
        if player_number != game.current_player:
            emit('error', {'message': 'Ce n\'est pas votre tour'})
            return
        
        if game.drop_piece(col, player_number):
            row = None
            for r in range(6):
                if game.board[r][col] == player_number:
                    row = r
                    break
            
            player_name = game.players[request.sid]['name']
            emit('move_made', {
                'player': player_number,
                'column': col,
                'row': row,
                'player_name': player_name
            }, room=game_id)
            
            winner = game.check_winner()
            if winner:
                game.game_over = True
                game.winner = winner
                game.update_score(winner)
            elif game.is_board_full():
                game.game_over = True
                game.winner = 0
                game.update_score(0)
            else:
                game.current_player = 2 if game.current_player == 1 else 1
            
            emit_game_state(game_id)
            
            if game.ai_enabled and game.current_player == 2 and not game.game_over:
                threading.Thread(target=ai_move_delayed, args=(game_id, socketio)).start()
        else:
            emit('error', {'message': 'Coup invalide'})
    
    @socketio.on('reset_game')
    def on_reset_game(data):
        game_id = data['game_id']
        
        if game_id in games:
            game = games[game_id]
            game.reset_game()
            emit_game_state(game_id)
    
    @socketio.on('send_private_message')
    def handle_private_message(data):
        game_id = data.get('game_id')
        target_sid = data.get('target_sid')
        message = data.get('message')
        sender_name = data.get('sender_name')
        sender_sid = data.get('sender_sid')
        
        if game_id and target_sid and message:
            socketio.emit('private_message', {
                'sender_name': sender_name,
                'sender_sid': sender_sid,
                'message': message
            }, room=target_sid)
    
    @socketio.on('disconnect')
    def on_disconnect():
        if request.sid in connected_users:
            del connected_users[request.sid]
            print(f"❌ Utilisateur déconnecté: {request.sid} (Total: {len(connected_users)})")
        
        for game_id, game in list(games.items()):
            if request.sid in game.players:
                player_name = game.players[request.sid]['name']
                del game.players[request.sid]
                
                if not game.ai_enabled:
                    game.game_over = True
                    socketio.emit('game_ended', {
                        'reason': 'player_left',
                        'message': f'{player_name} a quitté la partie. La partie est terminée.',
                        'redirect': True
                    }, room=game_id)
                    
                    del games[game_id]
                else:
                    emit('player_left', {
                        'player_name': player_name,
                        'players_count': len(game.players),
                        'spectators_count': len(game.spectators)
                    }, room=game_id)
                
                leave_room(game_id)
                break
            elif request.sid in game.spectators:
                spectator_name = game.spectators[request.sid]['name']
                del game.spectators[request.sid]
                
                emit('spectator_left', {
                    'spectator_name': spectator_name,
                    'players_count': len(game.players),
                    'spectators_count': len(game.spectators)
                }, room=game_id)
                
                leave_room(game_id)
                break

def ai_move_delayed(game_id, socketio):
    from app import games
    
    time.sleep(1)
    
    if game_id not in games:
        return
    
    game = games[game_id]
    if not game.ai_enabled or game.game_over or game.current_player != 2:
        return
    
    ai_col = game.ai.get_move(game.board, 2)
    
    if ai_col is not None and game.drop_piece(ai_col, 2):
        row = None
        for r in range(6):
            if game.board[r][ai_col] == 2:
                row = r
                break
        
        socketio.emit('move_made', {
            'player': 2,
            'column': ai_col,
            'row': row,
            'player_name': 'IA'
        }, room=game_id)
        
        winner = game.check_winner()
        if winner:
            game.game_over = True
            game.winner = winner
            game.update_score(winner)
        elif game.is_board_full():
            game.game_over = True
            game.winner = 0
            game.update_score(0)
        else:
            game.current_player = 1
        
        def emit_state():
            if game_id in games:
                socketio.emit('game_state', games[game_id].to_dict(), room=game_id)
        
        socketio.emit('game_state', game.to_dict(), room=game_id)
