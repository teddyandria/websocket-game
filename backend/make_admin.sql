-- Script pour promouvoir un utilisateur en administrateur
-- Utilisation: sqlite3 puissance4.db < make_admin.sql

-- Remplacez 'votre_username' par le nom d'utilisateur à promouvoir
UPDATE users 
SET is_admin = 1 
WHERE username = 'votre_username';

-- Vérifier le résultat
SELECT username, email, is_admin 
FROM users 
WHERE username = 'votre_username';
