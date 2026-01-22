import { io, Socket } from 'socket.io-client';

type MessageHandler = (data: any) => void;

class WebSocketService {
  private socket: Socket | null = null;
  private url: string;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private handlers: Map<string, Set<MessageHandler>> = new Map();

  constructor() {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
    this.url = apiUrl;
  }

  connect(): void {
    if (this.socket?.connected) {
      console.log('Already connected');
      return;
    }

    const token = localStorage.getItem('access_token');

    this.socket = io(this.url, {
      transports: ['websocket'],
      auth: {
        token: token || '',
      },
      reconnection: true,
      reconnectionAttempts: this.maxReconnectAttempts,
      reconnectionDelay: 3000,
    });

    this.socket.on('connect', () => {
      console.log('✅ WebSocket connected:', this.socket?.id);
      this.reconnectAttempts = 0;
    });

    this.socket.on('disconnect', (reason) => {
      console.log('❌ WebSocket disconnected:', reason);
    });

    this.socket.on('connect_error', (error) => {
      console.error('🔴 Connection error:', error);
      this.reconnectAttempts++;
    });

    // Слушаем все кастомные события
    this.socket.onAny((eventName, ...args) => {
      const data = args[0];

      if (this.handlers.has(eventName)) {
        this.handlers.get(eventName)?.forEach((handler) => handler(data));
      }

      // Global handlers
      if (this.handlers.has('*')) {
        this.handlers.get('*')?.forEach((handler) => handler({ type: eventName, data }));
      }
    });
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  // Отправка сообщений
  send(event: string, data: any): void {
    if (this.socket?.connected) {
      this.socket.emit(event, data);
    } else {
      console.warn('⚠️ WebSocket is not connected');
    }
  }

  // Подписка на события
  on(event: string, handler: MessageHandler): () => void {
    if (!this.handlers.has(event)) {
      this.handlers.set(event, new Set());
    }
    this.handlers.get(event)!.add(handler);

    // Возвращаем функцию отписки
    return () => {
      this.handlers.get(event)?.delete(handler);
    };
  }

  // Отписка от событий
  off(event: string, handler?: MessageHandler): void {
    if (handler) {
      this.handlers.get(event)?.delete(handler);
    } else {
      this.handlers.delete(event);
    }
  }

  get isConnected(): boolean {
    return this.socket?.connected || false;
  }
}

export const wsService = new WebSocketService();
