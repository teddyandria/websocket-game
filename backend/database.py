import sqlite3
import hashlib
import secrets
from datetime import datetime, timedelta
import jwt
import os

class Database:
    def __init__(self, db_path='puissance4.db'):
        self.db_path = db_path
        self.init_database()
    
    def get_connection(self):
        return sqlite3.connect(self.db_path)
    
    def init_database(self):
        """Initialise la base de données avec toutes les tables"""
        conn = self.get_connection()
        cursor = conn.cursor()
        
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username VARCHAR(50) UNIQUE NOT NULL,
                email VARCHAR(100) UNIQUE NOT NULL,
                password_hash VARCHAR(255) NOT NULL,
                display_name VARCHAR(100),
                avatar_url VARCHAR(255),
                bio TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                last_login TIMESTAMP,
                games_played INTEGER DEFAULT 0,
                games_won INTEGER DEFAULT 0,
                is_active BOOLEAN DEFAULT 1,
                is_admin BOOLEAN DEFAULT 0
            )
        ''')
        
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS game_history (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                game_id VARCHAR(36) NOT NULL,
                player1_id INTEGER,
                player2_id INTEGER,
                player1_name VARCHAR(100),
                player2_name VARCHAR(100),
                winner_id INTEGER,
                game_mode VARCHAR(20) DEFAULT 'multiplayer',
                started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                ended_at TIMESTAMP,
                moves_count INTEGER DEFAULT 0,
                is_guest_game BOOLEAN DEFAULT 0,
                FOREIGN KEY (player1_id) REFERENCES users (id),
                FOREIGN KEY (player2_id) REFERENCES users (id),
                FOREIGN KEY (winner_id) REFERENCES users (id)
            )
        ''')
        
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS chat_messages (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                game_id VARCHAR(36) NOT NULL,
                sender_id INTEGER,
                sender_name VARCHAR(100) NOT NULL,
                recipient_id INTEGER,
                message TEXT NOT NULL,
                sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                is_guest_message BOOLEAN DEFAULT 0,
                FOREIGN KEY (sender_id) REFERENCES users (id),
                FOREIGN KEY (recipient_id) REFERENCES users (id)
            )
        ''')
        
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS friendships (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                friend_id INTEGER NOT NULL,
                status VARCHAR(20) DEFAULT 'pending',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                accepted_at TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users (id),
                FOREIGN KEY (friend_id) REFERENCES users (id),
                UNIQUE(user_id, friend_id)
            )
        ''')
        
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS game_invitations (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                from_user_id INTEGER NOT NULL,
                to_user_id INTEGER NOT NULL,
                game_id VARCHAR(36),
                status VARCHAR(20) DEFAULT 'pending',
                message TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                expires_at TIMESTAMP,
                FOREIGN KEY (from_user_id) REFERENCES users (id),
                FOREIGN KEY (to_user_id) REFERENCES users (id)
            )
        ''')
        
        conn.commit()
        conn.close()
    
    def create_admin_user(self, username, email, password, display_name=None):
        conn = self.get_connection()
        cursor = conn.cursor()
        
        try:
            cursor.execute('SELECT id FROM users WHERE username = ?', (username,))
            existing = cursor.fetchone()
            
            if existing:
                cursor.execute('UPDATE users SET is_admin = 1 WHERE username = ?', (username,))
                conn.commit()
                conn.close()
                return existing[0]
            
            password_hash = self.hash_password(password)
            display_name = display_name or username
            
            cursor.execute('''
                INSERT INTO users (username, email, password_hash, display_name, is_admin)
                VALUES (?, ?, ?, ?, 1)
            ''', (username, email, password_hash, display_name))
            
            user_id = cursor.lastrowid
            conn.commit()
            return user_id
        except sqlite3.IntegrityError as e:
            return None
        finally:
            conn.close()
    
    def hash_password(self, password):
        """Hash un mot de passe avec salt"""
        salt = secrets.token_hex(16)
        password_hash = hashlib.pbkdf2_hmac('sha256', password.encode(), salt.encode(), 100000)
        return f"{salt}:{password_hash.hex()}"
    
    def verify_password(self, password, hashed):
        """Vérifie un mot de passe"""
        try:
            salt, hash_hex = hashed.split(':')
            password_hash = hashlib.pbkdf2_hmac('sha256', password.encode(), salt.encode(), 100000)
            return password_hash.hex() == hash_hex
        except:
            return False
    
    def create_user(self, username, email, password, display_name=None):
        """Crée un nouvel utilisateur"""
        conn = self.get_connection()
        cursor = conn.cursor()
        
        try:
            password_hash = self.hash_password(password)
            display_name = display_name or username
            
            cursor.execute('''
                INSERT INTO users (username, email, password_hash, display_name)
                VALUES (?, ?, ?, ?)
            ''', (username, email, password_hash, display_name))
            
            user_id = cursor.lastrowid
            conn.commit()
            return user_id
        except sqlite3.IntegrityError as e:
            return None
        finally:
            conn.close()
    
    def authenticate_user(self, username, password):
        """Authentifie un utilisateur"""
        conn = self.get_connection()
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT id, username, email, password_hash, display_name, avatar_url, is_admin
            FROM users WHERE username = ? AND is_active = 1
        ''', (username,))
        
        user = cursor.fetchone()
        conn.close()
        
        if user and self.verify_password(password, user[3]):
            return {
                'id': user[0],
                'username': user[1],
                'email': user[2],
                'display_name': user[4],
                'avatar_url': user[5],
                'is_admin': bool(user[6])
            }
        return None
    
    def get_user_by_id(self, user_id):
        """Récupère un utilisateur par son ID"""
        conn = self.get_connection()
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT id, username, email, display_name, avatar_url, bio, 
                   games_played, games_won, created_at, is_admin
            FROM users WHERE id = ? AND is_active = 1
        ''', (user_id,))
        
        user = cursor.fetchone()
        conn.close()
        
        if user:
            return {
                'id': user[0],
                'username': user[1],
                'email': user[2],
                'display_name': user[3],
                'avatar_url': user[4],
                'bio': user[5],
                'games_played': user[6],
                'games_won': user[7],
                'created_at': user[8],
                'is_admin': bool(user[9])
            }
        return None
    
    def update_user_profile(self, user_id, display_name=None, bio=None, avatar_url=None):
        """Met à jour le profil utilisateur"""
        conn = self.get_connection()
        cursor = conn.cursor()
        
        updates = []
        params = []
        
        if display_name is not None:
            updates.append("display_name = ?")
            params.append(display_name)
        if bio is not None:
            updates.append("bio = ?")
            params.append(bio)
        if avatar_url is not None:
            updates.append("avatar_url = ?")
            params.append(avatar_url)
        
        if updates:
            params.append(user_id)
            cursor.execute(f'''
                UPDATE users SET {", ".join(updates)}
                WHERE id = ?
            ''', params)
            conn.commit()
        
        conn.close()
    
    def save_game_result(self, game_id, player1_id, player2_id, player1_name, player2_name, 
                        winner_id, game_mode='multiplayer', moves_count=0, is_guest_game=False):
        """Sauvegarde le résultat d'une partie"""
        conn = self.get_connection()
        cursor = conn.cursor()
        
        cursor.execute('''
            INSERT INTO game_history 
            (game_id, player1_id, player2_id, player1_name, player2_name, 
             winner_id, game_mode, ended_at, moves_count, is_guest_game)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (game_id, player1_id, player2_id, player1_name, player2_name,
              winner_id, game_mode, datetime.now(), moves_count, is_guest_game))
        
        if not is_guest_game:
            if player1_id:
                cursor.execute('UPDATE users SET games_played = games_played + 1 WHERE id = ?', (player1_id,))
                if winner_id == player1_id:
                    cursor.execute('UPDATE users SET games_won = games_won + 1 WHERE id = ?', (player1_id,))
            
            if player2_id:
                cursor.execute('UPDATE users SET games_played = games_played + 1 WHERE id = ?', (player2_id,))
                if winner_id == player2_id:
                    cursor.execute('UPDATE users SET games_won = games_won + 1 WHERE id = ?', (player2_id,))
        
        conn.commit()
        conn.close()
    
    def get_user_game_history(self, user_id, limit=50):
        """Récupère l'historique des parties d'un utilisateur"""
        conn = self.get_connection()
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT game_id, player1_name, player2_name, winner_id, 
                   game_mode, started_at, ended_at, moves_count
            FROM game_history 
            WHERE (player1_id = ? OR player2_id = ?) AND is_guest_game = 0
            ORDER BY ended_at DESC LIMIT ?
        ''', (user_id, user_id, limit))
        
        games = cursor.fetchall()
        conn.close()
        
        return [{
            'game_id': game[0],
            'player1_name': game[1],
            'player2_name': game[2],
            'winner_id': game[3],
            'game_mode': game[4],
            'started_at': game[5],
            'ended_at': game[6],
            'moves_count': game[7]
        } for game in games]
    
    def save_chat_message(self, game_id, sender_id, sender_name, recipient_id, message, is_guest_message=False):
        """Sauvegarde un message de chat"""
        conn = self.get_connection()
        cursor = conn.cursor()
        
        cursor.execute('''
            INSERT INTO chat_messages 
            (game_id, sender_id, sender_name, recipient_id, message, is_guest_message)
            VALUES (?, ?, ?, ?, ?, ?)
        ''', (game_id, sender_id, sender_name, recipient_id, message, is_guest_message))
        
        conn.commit()
        conn.close()
    
    def get_chat_history(self, game_id, limit=100):
        """Récupère l'historique du chat d'une partie"""
        conn = self.get_connection()
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT sender_id, sender_name, recipient_id, message, sent_at, is_guest_message
            FROM chat_messages 
            WHERE game_id = ?
            ORDER BY sent_at ASC LIMIT ?
        ''', (game_id, limit))
        
        messages = cursor.fetchall()
        conn.close()
        
        return [{
            'sender_id': msg[0],
            'sender_name': msg[1],
            'recipient_id': msg[2],
            'message': msg[3],
            'sent_at': msg[4],
            'is_guest_message': msg[5]
        } for msg in messages]
    
    def get_all_users(self, include_inactive=False):
        """Récupère tous les utilisateurs (admin)"""
        conn = self.get_connection()
        cursor = conn.cursor()
        
        query = '''
            SELECT id, username, email, display_name, avatar_url, 
                   created_at, last_login, games_played, games_won, 
                   is_active, is_admin
            FROM users
        '''
        
        if not include_inactive:
            query += ' WHERE is_active = 1'
        
        query += ' ORDER BY created_at DESC'
        
        cursor.execute(query)
        users = cursor.fetchall()
        conn.close()
        
        return [{
            'id': user[0],
            'username': user[1],
            'email': user[2],
            'display_name': user[3],
            'avatar_url': user[4],
            'created_at': user[5],
            'last_login': user[6],
            'games_played': user[7],
            'games_won': user[8],
            'is_active': bool(user[9]),
            'is_admin': bool(user[10])
        } for user in users]
    
    def delete_user(self, user_id):
        """Supprime un utilisateur (admin)"""
        conn = self.get_connection()
        cursor = conn.cursor()
        
        cursor.execute('DELETE FROM chat_messages WHERE sender_id = ? OR recipient_id = ?', (user_id, user_id))
        cursor.execute('DELETE FROM friendships WHERE user_id = ? OR friend_id = ?', (user_id, user_id))
        cursor.execute('DELETE FROM game_invitations WHERE sender_id = ? OR recipient_id = ?', (user_id, user_id))
        cursor.execute('DELETE FROM game_history WHERE player1_id = ? OR player2_id = ?', (user_id, user_id))
        cursor.execute('DELETE FROM users WHERE id = ?', (user_id,))
        
        conn.commit()
        affected = cursor.rowcount
        conn.close()
        
        return affected > 0
    
    def get_all_games(self, limit=100):
        """Récupère toutes les parties enregistrées (admin)"""
        conn = self.get_connection()
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT id, game_id, player1_name, player2_name, 
                   winner_id, game_mode, started_at, ended_at, moves_count
            FROM game_history 
            ORDER BY started_at DESC LIMIT ?
        ''', (limit,))
        
        games = cursor.fetchall()
        conn.close()
        
        return [{
            'id': game[0],
            'game_id': game[1],
            'player1_name': game[2],
            'player2_name': game[3],
            'winner_id': game[4],
            'game_mode': game[5],
            'started_at': game[6],
            'ended_at': game[7],
            'moves_count': game[8]
        } for game in games]
    
    def delete_game(self, game_id):
        """Supprime une partie de l'historique (admin)"""
        conn = self.get_connection()
        cursor = conn.cursor()
        
        cursor.execute('DELETE FROM chat_messages WHERE game_id = ?', (game_id,))
        cursor.execute('DELETE FROM game_history WHERE game_id = ?', (game_id,))
        
        conn.commit()
        affected = cursor.rowcount
        conn.close()
        
        return affected > 0
    
    def toggle_user_admin(self, user_id, is_admin):
        """Active/désactive le statut admin d'un utilisateur"""
        conn = self.get_connection()
        cursor = conn.cursor()
        
        cursor.execute('UPDATE users SET is_admin = ? WHERE id = ?', (is_admin, user_id))
        
        conn.commit()
        affected = cursor.rowcount
        conn.close()
        
        return affected > 0

# Instance globale de la base de données
db = Database()