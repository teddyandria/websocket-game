# Panneau d'Administration - Puissance 4

## Accès au panneau admin

Le panneau d'administration est accessible uniquement aux utilisateurs ayant le statut `is_admin = 1` dans la base de données.

### Promouvoir le premier administrateur

1. Créez un compte utilisateur normalement via l'interface web
2. Exécutez le script SQL suivant :

```bash
cd backend
sqlite3 puissance4.db
```

Puis dans le shell SQLite :

```sql
UPDATE users SET is_admin = 1 WHERE username = 'votre_username';
SELECT username, email, is_admin FROM users WHERE username = 'votre_username';
.exit
```

Ou utilisez directement le fichier SQL fourni :

```bash
cd backend
# Modifiez make_admin.sql pour mettre votre nom d'utilisateur
sqlite3 puissance4.db < make_admin.sql
```

3. Déconnectez-vous et reconnectez-vous pour que le statut admin soit pris en compte
4. Un bouton "🛡️ Admin" apparaîtra dans la navbar

## Fonctionnalités du panneau admin

### 1. Gestion des utilisateurs (👥 Utilisateurs)

- **Voir tous les utilisateurs** : Liste complète avec statistiques
- **Promouvoir/Rétrograder** : Donner ou retirer les droits admin
- **Supprimer un utilisateur** : Suppression définitive (avec confirmation)
  - Supprime également toutes les données associées (parties, messages, invitations)
  - Impossible de supprimer son propre compte
  - Impossible de se retirer ses propres droits admin

### 2. Historique des parties (📜 Historique)

- **Voir toutes les parties enregistrées** : Historique complet avec détails
- **Supprimer une partie** : Supprime la partie et son historique de chat
- Affiche : joueurs, mode (IA/Multi), nombre de coups, dates

### 3. Parties en cours (🎮 Parties actives)

- **Voir les parties actives** : Parties en cours en temps réel
- **Terminer une partie** : Force la fin d'une partie
  - Notifie tous les joueurs connectés
  - Supprime la partie du serveur
- Affiche : joueurs connectés, joueur actuel, progression

## Routes API Admin

Toutes les routes admin nécessitent le header `Authorization: Bearer <token>` avec un token d'utilisateur admin.

### Utilisateurs

- `GET /api/admin/users` - Liste tous les utilisateurs
  - Query param : `include_inactive=true` pour inclure les utilisateurs désactivés
- `DELETE /api/admin/users/:id` - Supprime un utilisateur
- `PUT /api/admin/users/:id/toggle-admin` - Change le statut admin
  - Body : `{ "is_admin": true/false }`

### Parties

- `GET /api/admin/games` - Liste toutes les parties enregistrées
  - Query param : `limit=100` (défaut)
- `DELETE /api/admin/games/:game_id` - Supprime une partie de l'historique
- `GET /api/admin/active-games` - Liste les parties en cours
- `DELETE /api/admin/active-games/:game_id` - Termine une partie active

## Sécurité

- Les routes admin vérifient le statut `is_admin` en base de données à chaque requête
- Le token JWT seul ne suffit pas, l'utilisateur doit avoir `is_admin = 1`
- Erreur 403 (Accès refusé) si l'utilisateur n'est pas admin
- Erreur 401 (Non autorisé) si le token est invalide ou absent

## Design

Le panneau admin utilise le même thème médiéval/Witcher que le reste de l'application :
- Parchemin beige avec bordures marron
- Polices Cinzel et Crimson Text
- Badges colorés pour les statuts
- Tableaux responsives
- Confirmations pour les actions destructives
