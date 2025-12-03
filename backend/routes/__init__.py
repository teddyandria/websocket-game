from .auth_routes import auth_bp
from .admin_routes import admin_bp, init_admin_routes
from .game_routes import game_bp, init_socketio_handlers, init_game_routes

__all__ = ['auth_bp', 'admin_bp', 'game_bp', 'init_socketio_handlers', 'init_admin_routes', 'init_game_routes']
