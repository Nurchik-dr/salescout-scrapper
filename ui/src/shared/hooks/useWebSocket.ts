// hooks/useWebSocket.ts
import { useEffect, useState } from 'react';
import { wsService } from '../api/websocket';

export const useWebSocket = () => {
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Подключаемся
    wsService.connect();

    // Подписываемся на все события для отслеживания статуса
    const unsubscribe = wsService.on('*', (message) => {
      setIsConnected(wsService.isConnected);
    });

    // Проверяем статус подключения
    const interval = setInterval(() => {
      setIsConnected(wsService.isConnected);
    }, 1000);

    return () => {
      unsubscribe();
      clearInterval(interval);
      // НЕ отключаем wsService.disconnect() здесь,
      // чтобы соединение оставалось активным
    };
  }, []);

  return {
    isConnected,
    send: wsService.send.bind(wsService),
    on: wsService.on.bind(wsService),
    off: wsService.off.bind(wsService),
  };
};
