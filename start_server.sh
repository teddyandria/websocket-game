#!/bin/bash

echo "🎮 Lancement de Puissance 4 - Backend + Frontend"
echo ""

# Récupération de l'IP locale
LOCAL_IP=$(ifconfig | grep "inet " | grep -v 127.0.0.1 | awk '{print $2}' | head -1)

echo "📡 Serveurs accessibles sur :"
echo "   Backend:  http://localhost:5001"
echo "   Frontend: http://localhost:5173"
echo "   Réseau:   http://$LOCAL_IP:5173"
echo ""
echo "� Démarrage des serveurs..."
echo ""

# Fonction pour tuer les processus au Ctrl+C
cleanup() {
    echo ""
    echo "🛑 Arrêt des serveurs..."
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
    exit 0
}

trap cleanup SIGINT SIGTERM

# Lancement du backend Flask
echo "🔧 Démarrage du backend Flask..."
cd backend && python3 app.py > ../backend.log 2>&1 &
BACKEND_PID=$!
cd ..

# Attendre que le backend démarre
sleep 2

# Lancement du frontend Vite
echo "⚛️  Démarrage du frontend React..."
cd frontend && npm run dev > ../frontend.log 2>&1 &
FRONTEND_PID=$!
cd ..

echo ""
echo "✅ Serveurs démarrés !"
echo "   Backend PID: $BACKEND_PID"
echo "   Frontend PID: $FRONTEND_PID"
echo ""
echo "📱 Ouvrez votre navigateur sur : http://localhost:5173"
echo "   (Appuyez sur Ctrl+C pour tout arrêter)"
echo ""

# Afficher les logs en temps réel
tail -f backend.log frontend.log

# Attendre que les processus se terminent
wait