import { useEffect, useState, useRef } from 'react';
import io from 'socket.io-client';

const SOCKET_URL = 'http://localhost:5001';

export const useSocket = () => {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const socketRef = useRef(null);

  useEffect(() => {
    // Créer la connexion socket
    const newSocket = io(SOCKET_URL, {
      transports: ['polling', 'websocket'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
      upgrade: true
    });

    socketRef.current = newSocket;
    setSocket(newSocket);

    // Événements de connexion
    newSocket.on('connect', () => {
      console.log('✅ Socket connecté:', newSocket.id);
      setConnected(true);
    });

    newSocket.on('disconnect', () => {
      console.log('❌ Socket déconnecté');
      setConnected(false);
    });

    newSocket.on('connect_error', (error) => {
      console.error('Erreur de connexion socket:', error);
      setConnected(false);
    });

    newSocket.on('force_disconnect', (data) => {
      console.log('⚠️ Déconnexion forcée par admin:', data.message);
      alert(data.message);
      window.location.href = '/';
    });

    // Cleanup lors du démontage
    return () => {
      console.log('🔌 Fermeture de la connexion socket');
      newSocket.off('force_disconnect');
      newSocket.close();
    };
  }, []);

  return { socket, connected };
};

export default useSocket;
