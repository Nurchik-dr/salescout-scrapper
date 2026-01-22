// components/TestWebSocket.tsx
import React, { useState, useEffect } from 'react';
import { useWebSocket } from '../hooks/useWebSocket';

export const TestWebSocket: React.FC = () => {
  const { isConnected, send, on, off } = useWebSocket();
  const [messages, setMessages] = useState<any[]>([]);
  const [inputValue, setInputValue] = useState('');

  useEffect(() => {
    // Подписываемся на событие 'message'
    const unsubscribe = on('message', (data) => {
      console.log('📨 Received message:', data);
      setMessages((prev) => [...prev, data]);
    });

    // Подписываемся на broadcast
    const unsubscribeBroadcast = on('broadcast', (data) => {
      console.log('📢 Broadcast:', data);
      setMessages((prev) => [...prev, { type: 'broadcast', ...data }]);
    });

    return () => {
      unsubscribe();
      unsubscribeBroadcast();
    };
  }, [on]);

  const handleSend = () => {
    if (!inputValue.trim()) return;

    send('message', { text: inputValue, timestamp: new Date() });
    setInputValue('');
  };

  const handleBroadcast = () => {
    if (!inputValue.trim()) return;

    send('broadcast', { text: inputValue, timestamp: new Date() });
    setInputValue('');
  };

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <h2>WebSocket Test</h2>

      <div style={{ marginBottom: '20px' }}>
        <strong>Status: </strong>
        {isConnected ? (
          <span style={{ color: 'green' }}>🟢 Connected</span>
        ) : (
          <span style={{ color: 'red' }}>🔴 Disconnected</span>
        )}
      </div>

      <div
        style={{
          border: '1px solid #ddd',
          padding: '10px',
          height: '300px',
          overflowY: 'auto',
          marginBottom: '20px',
          backgroundColor: '#f9f9f9',
        }}
      >
        {messages.length === 0 ? (
          <p style={{ color: '#999' }}>No messages yet...</p>
        ) : (
          messages.map((msg, index) => (
            <div
              key={index}
              style={{
                marginBottom: '10px',
                padding: '5px',
                backgroundColor: '#fff',
                borderRadius: '4px',
              }}
            >
              <pre>{JSON.stringify(msg, null, 2)}</pre>
            </div>
          ))
        )}
      </div>

      <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Type a message..."
          style={{ flex: 1, padding: '8px' }}
          disabled={!isConnected}
        />
      </div>

      <div style={{ display: 'flex', gap: '10px' }}>
        <button
          onClick={handleSend}
          disabled={!isConnected}
          style={{ padding: '8px 16px', flex: 1 }}
        >
          Send Message
        </button>
        <button
          onClick={handleBroadcast}
          disabled={!isConnected}
          style={{ padding: '8px 16px', flex: 1 }}
        >
          Broadcast
        </button>
      </div>
    </div>
  );
};
