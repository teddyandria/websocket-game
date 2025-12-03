# 🔴 Puissance 4 🟡

Un jeu de Puissance 4 multijoueur en ligne avec une architecture moderne séparant backend (Flask + SocketIO) et frontend (React), incluant une IA sophistiquée et un thème médiéval immersif.

## Fonctionnalités

- 🎮 **Jeu multijoueur** en temps réel via WebSocket
- 🤖 **Intelligence Artificielle** avec 4 niveaux (Facile, Moyen, Difficile, Impossible)
- 👤 **Système d'authentification** hybride (invité ou compte utilisateur)
- 🔐 **Comptes utilisateurs** avec profils personnalisables
- 💬 **Chat privé** entre joueurs pendant les parties
- 📊 **Historique des parties** pour les utilisateurs connectés
- 🛡️ **Panneau d'administration** pour gérer utilisateurs et parties
- ⚛️ **Interface React moderne** avec thème médiéval
- 🔄 **Communication temps réel** via Socket.IO
- 🎯 **Détection automatique** des victoires et égalités
- 👥 **Gestion des joueurs** (connexion/déconnexion)
- 🎨 **Design médiéval** inspiré de The Witcher
- 📱 **Responsive** (desktop, tablette, mobile)

## Architecture

Le projet utilise une architecture client-serveur séparée :

- **Backend** : Flask + Flask-SocketIO (Python 3) - Port 5001
- **Frontend** : React + Vite - Port 5173
- **Communication** : WebSocket via Socket.IO

## Structure du projet

```
puissance_4/
├── backend/
│   ├── app.py              # Serveur Flask + logique de jeu
│   ├── ai.py               # Intelligence Artificielle (minimax)
│   ├── requirements.txt    # Dépendances Python
│   └── README.md          # Documentation backend
├── frontend/
│   ├── package.json        # Dépendances Node.js
│   ├── vite.config.js      # Configuration Vite
│   ├── src/
│   │   ├── main.jsx        # Point d'entrée React
│   │   ├── App.jsx         # Router principal
│   │   ├── hooks/          # Custom hooks (useSocket, useGame)
│   │   ├── components/     # Composants React réutilisables
│   │   ├── pages/          # Pages (Home, Game)
│   │   └── styles/         # Fichiers CSS organisés
│   │       ├── index.css   # Styles globaux
│   │       ├── components/ # Styles des composants
│   │       └── pages/      # Styles des pages
│   └── README.md          # Documentation frontend
├── README.md              # Cette documentation
└── DOCUMENTATION.md       # Documentation technique détaillée
```

## Installation

### Prérequis
- Python 3.9+ et pip
- Node.js 16+ et npm

### Backend

```bash
cd backend

# Installer les dépendances
pip3 install -r requirements.txt

# Configurer les variables d'environnement
cp .env.example .env
# Éditez .env si besoin (les valeurs par défaut fonctionnent)
```

### Frontend

```bash
cd frontend
npm install
```

## Configuration

### Compte Administrateur

Un compte administrateur est créé automatiquement au démarrage du serveur backend avec les identifiants par défaut :

- **Username** : `admin`
- **Password** : `admin1234`
- **Email** : `admin@puissance4.local`

Ces valeurs peuvent être modifiées dans le fichier `backend/.env` :

```env
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin1234
ADMIN_EMAIL=admin@puissance4.local
```

### Variables d'environnement

Le fichier `backend/.env` contient :

```env
# Clé secrète Flask (générez-en une unique pour la production)
SECRET_KEY=votre_clé_secrète_super_sécurisée_changez_moi

# Base de données
DATABASE_PATH=puissance4.db

# Compte admin par défaut
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin1234
ADMIN_EMAIL=admin@puissance4.local
```

## Utilisation

### Démarrage en local (développement)

1. **Démarrer le backend** (dans un terminal) :
   ```bash
   cd backend
   python3 app.py
   ```
   Le serveur Flask démarrera sur `http://localhost:5001`

2. **Démarrer le frontend** (dans un autre terminal) :
   ```bash
   cd frontend
   npm run dev
   ```
   Le serveur Vite démarrera sur `http://localhost:5173`

3. **Ouvrir votre navigateur** et aller à :
   ```
   http://localhost:5173
   ```

4. **Accès administrateur** :
   - Connectez-vous avec les identifiants admin (voir section Configuration)
   - Un bouton "🛡️ Admin" apparaîtra dans la navbar
   - Accédez au panneau d'administration : `http://localhost:5173/admin`

### Pour les autres joueurs

**Rien à installer !** 
- Ouvrez simplement votre navigateur
- Allez à l'URL fournie par l'hôte
- Créez ou rejoignez une partie

### Types de parties

`http://localhost:5173`

## Comment jouer

### Mode Multijoueur
1. **Créer une partie** : Sur la page d'accueil, cliquez sur "Créer une partie multijoueur"
2. **Partager le lien** : Envoyez le lien généré à votre adversaire
3. **Commencer** : Une fois les 2 joueurs connectés, la partie commence automatiquement

### Mode IA
1. **Choisir le niveau** : Sélectionnez Facile, Moyen, Difficile ou Impossible
2. **Créer la partie** : Cliquez sur "Jouer contre l'IA"
3. **Jouer** : Vous commencez (rouge), l'IA joue automatiquement après chaque coup

### Rejoindre une partie
1. **Entrer l'ID** : Saisissez l'ID de la partie dans le champ dédié
2. **Votre nom** : Entrez votre nom de joueur
3. **Rejoindre** : Cliquez sur "Rejoindre" pour entrer dans la partie

### Règles du jeu
1. **Objectif** : Aligner 4 pions de votre couleur (horizontalement, verticalement ou en diagonale)
2. **Tour de jeu** : 
   - Le joueur rouge (Joueur 1) commence toujours
   - Cliquez sur une colonne pour y déposer votre pion
   - Le pion tombe automatiquement à la position la plus basse disponible
3. **Victoire** : Le premier joueur à aligner 4 pions gagne
4. **Égalité** : Si le plateau est plein sans alignement, c'est match nul
5. **Reset** : Recommencez une partie avec le bouton "Nouvelle partie"

### Actions interactives
- **Actions globales** : Envoyez des messages visibles par tous les joueurs de la partie ou tous les joueurs connectés
- **Actions privées** : Envoyez des messages privés à un joueur spécifique

## Technologies utilisées

### Backend
- **Python 3.13** : Langage principal pour la logique métier
- **Flask 2.3.3** : Framework web minimaliste
- **Flask-SocketIO 5.3.6** : Communication WebSocket temps réel
- **python-socketio 5.9.0** : Serveur Socket.IO
- **Algorithme Minimax** : IA avec élagage Alpha-Beta (jusqu'à 7 niveaux de profondeur)

### Frontend  
- **React 18** : Bibliothèque UI moderne et performante
- **Vite** : Build tool ultra-rapide avec HMR
- **Socket.IO Client** : Communication WebSocket
- **React Router** : Navigation entre pages
- **CSS3** : Design responsive avec Grid et Flexbox
- **Google Fonts** : Cinzel et Crimson Text pour le thème médiéval

### Architecture
- **Séparation backend/frontend** : API REST + WebSocket
- **Communication temps réel** : Synchronisation bidirectionnelle via Socket.IO
- **Système de salles** : Isolation des parties multijoueur
- **Design responsive** : Compatible desktop, tablette et mobile
- **Thème médiéval** : Inspiré de l'univers The Witcher

## Configuration

### Backend
- Port : 5001
- Host : 0.0.0.0 (accessible depuis le réseau local)
- Mode debug : activé par défaut
- CORS : Autorisé pour toutes les origines (développement)

### Frontend
- Port : 5173 (Vite dev server)
- URL API : http://localhost:5001
- HMR : Activé (hot module replacement)

Pour un déploiement en production, modifiez ces paramètres dans `app.py`.

## Développement

Pour contribuer au projet :

1. Le code backend se trouve dans `app.py`
2. La logique du jeu est dans la classe `Puissance4`
3. L'interface utilisateur est dans les templates HTML
4. Les styles sont dans `static/css/style.css`
5. La logique frontend est dans `static/js/`

## Améliorations possibles

- [ ] Système de classement
- [ ] Sauvegarde des parties
- [ ] Mode solo contre IA
- [ ] Animations améliorées
- [ ] Support de plus de 2 joueurs
- [ ] Chat en temps réel
- [ ] Personnalisation des couleurs

Amusez-vous bien ! 🎮