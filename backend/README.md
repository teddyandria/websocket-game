# Backend - Flask + SocketIO

## Description

Serveur backend pour le jeu Puissance 4, construit avec Flask et Flask-SocketIO pour la communication en temps réel.

## Technologies

- **Flask 2.3.3** : Framework web Python
- **Flask-SocketIO 5.3.6** : Support WebSocket pour Flask
- **python-socketio 5.9.0** : Serveur Socket.IO
- **python-engineio 4.7.1** : Moteur de transport en temps réel

## Installation

```bash
pip3 install -r requirements.txt
```

## Lancement du serveur

```bash
python3 app.py
```

Le serveur démarrera sur `http://localhost:5001`

## Structure

```
backend/
├── app.py              # Serveur Flask avec routes et événements Socket.IO
├── ai.py               # Logique de l'IA (minimax avec alpha-beta pruning)
├── requirements.txt    # Dépendances Python
└── README.md          # Cette documentation
```

## API

### Endpoints REST

#### `POST /create_game`
Créer une nouvelle partie multijoueur.

**Réponse :**
```json
{
  "game_id": "uuid-string"
}
```

#### `POST /create_ai_game`
Créer une partie contre l'IA.

**Body :**
```json
{
  "difficulty": "easy|medium|hard|impossible"
}
```

**Réponse :**
```json
{
  "game_id": "uuid-string"
}
```

### Événements Socket.IO

#### Client → Serveur

**`join_game`**
Rejoindre une partie existante.
```json
{
  "game_id": "string",
  "player_name": "string"
}
```

**`make_move`**
Jouer un coup dans une colonne.
```json
{
  "game_id": "string",
  "col": 0-6
}
```

**`reset_game`**
Réinitialiser la partie.
```json
{
  "game_id": "string"
}
```

**`global_action`**
Envoyer une action visible globalement.
```json
{
  "game_id": "string",
  "action_type": "string",
  "payload": "any",
  "scope": "room|all"  // "room" = partie actuelle, "all" = tous les joueurs
}
```

**`private_action`**
Envoyer une action à un joueur spécifique.
```json
{
  "game_id": "string",
  "target_sid": "string",  // Socket ID du destinataire
  "payload": "any"
}
```

#### Serveur → Client

**`game_created`**
Confirmation de création de partie.

**`player_joined`**
Un joueur a rejoint la partie.
```json
{
  "player_number": 1|2,
  "player_name": "string",
  "sid": "socket-id"
}
```

**`game_state`**
État actuel de la partie.
```json
{
  "board": [[...]], // 6x7 matrix
  "current_player": 1|2,
  "game_over": boolean,
  "winner": null|1|2,
  "players": {...}
}
```

**`move_made`**
Un coup a été joué.
```json
{
  "col": 0-6,
  "player": 1|2,
  "board": [[...]],
  "current_player": 1|2,
  "game_over": boolean,
  "winner": null|1|2
}
```

**`game_reset`**
La partie a été réinitialisée.

**`global_action`**
Action globale reçue.
```json
{
  "from": "player-name",
  "action_type": "string",
  "payload": "any",
  "timestamp": "ISO-string"
}
```

**`private_action`**
Action privée reçue.
```json
{
  "from": "player-name",
  "payload": "any",
  "timestamp": "ISO-string"
}
```

**`error`**
Une erreur s'est produite.
```json
{
  "message": "string"
}
```

## Classes principales

### `Puissance4`
Gère la logique du jeu.

**Méthodes principales :**
- `drop_piece(col, player)` : Déposer une pièce
- `check_winner()` : Vérifier s'il y a un gagnant
- `reset()` : Réinitialiser le plateau
- `is_valid_move(col)` : Vérifier si un coup est valide

### `PuissanceAI`
Intelligence artificielle avec algorithme minimax.

**Difficultés :**
- `easy` : Coups aléatoires
- `medium` : Minimax profondeur 3
- `hard` : Minimax profondeur 5
- `impossible` : Minimax profondeur 7

**Méthode principale :**
- `get_best_move(board, difficulty)` : Retourne la meilleure colonne à jouer

## Configuration

### CORS
Par défaut, le serveur accepte les connexions de toutes origines :
```python
socketio = SocketIO(app, cors_allowed_origins="*")
```

Pour la production, limitez aux domaines autorisés :
```python
socketio = SocketIO(app, cors_allowed_origins=["https://votredomaine.com"])
```

### Port
Le serveur écoute sur le port `5001`. Pour changer :
```python
socketio.run(app, host='0.0.0.0', port=VOTRE_PORT, debug=True)
```

## Développement

### Mode debug
Le serveur démarre en mode debug par défaut, avec rechargement automatique des fichiers.

### Logs
Les événements Socket.IO sont logués dans la console pour faciliter le debugging.

## Gestion des parties

Les parties sont stockées en mémoire dans un dictionnaire `games = {}`. 

⚠️ **Note** : Les parties sont perdues au redémarrage du serveur. Pour une application en production, utilisez une base de données (Redis, PostgreSQL, etc.).

## Sécurité

⚠️ Cette configuration est pour le développement local uniquement.

Pour la production :
1. Désactivez le mode debug
2. Configurez CORS correctement
3. Ajoutez une authentification
4. Validez toutes les entrées utilisateur
5. Utilisez HTTPS
6. Gérez les secrets avec des variables d'environnement
7. Implémentez une limitation de taux (rate limiting)

## Tests

Pour tester manuellement le serveur :

```python
# Installer httpie
pip install httpie

# Créer une partie
http POST http://localhost:5001/create_game

# Créer une partie IA
http POST http://localhost:5001/create_ai_game difficulty=hard
```

## Dépannage

### Port déjà utilisé
Si le port 5001 est occupé :
```bash
# Trouver le processus
lsof -i :5001

# Tuer le processus
kill -9 PID
```

### Problèmes de connexion Socket.IO
Vérifiez que :
- Le serveur Flask est démarré
- CORS est correctement configuré
- Le client se connecte à la bonne URL
