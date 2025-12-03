from flask import Flask
from flask_socketio import SocketIO
from flask_cors import CORS
import os
from dotenv import load_dotenv
from database import db
from auth import auth_manager
from routes import auth_bp, admin_bp, game_bp, init_socketio_handlers, init_admin_routes, init_game_routes

load_dotenv()

app = Flask(__name__)
secret_key = os.getenv('SECRET_KEY', 'votre_clé_secrète_ici')
app.config['SECRET_KEY'] = secret_key
auth_manager.secret_key = secret_key
app.auth_manager = auth_manager

CORS(app, resources={r"/*": {"origins": ["http://localhost:5173", "http://localhost:5174"]}})
socketio = SocketIO(
    app, 
    cors_allowed_origins=["http://localhost:5173", "http://localhost:5174"],
    async_mode='threading',
    logger=False,
    engineio_logger=False,
    ping_timeout=60,
    ping_interval=25
)

# Stockage des parties en cours
games = {}

# Enregistre les blueprints
app.register_blueprint(auth_bp, url_prefix='/api')
app.register_blueprint(admin_bp, url_prefix='/api/admin')
app.register_blueprint(game_bp)

# Initialise les routes avec les dépendances nécessaires
init_game_routes(games)
init_admin_routes(games, socketio)
init_socketio_handlers(socketio, games)


def init_admin_user():
    """Initialise le compte administrateur au démarrage"""
    admin_username = os.getenv('ADMIN_USERNAME', 'admin')
    admin_password = os.getenv('ADMIN_PASSWORD', 'admin1234')
    admin_email = os.getenv('ADMIN_EMAIL', 'admin@puissance4.local')
    
    try:
        user_id = db.create_admin_user(admin_username, admin_email, admin_password, 'Administrateur')
        if user_id:
            print(f"✅ Compte administrateur initialisé : {admin_username}")
        else:
            print(f"ℹ️  Compte administrateur déjà existant : {admin_username}")
    except Exception as e:
        print(f"⚠️  Erreur lors de l'initialisation de l'admin : {e}")

if __name__ == '__main__':
    init_admin_user()
    
    print("🚀 Démarrage du serveur sur http://0.0.0.0:5001")
    socketio.run(app, debug=True, host='0.0.0.0', port=5001)