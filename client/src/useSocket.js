import { useEffect, useRef, useCallback } from 'react';

const WS_BASE = process.env.REACT_APP_WS_URL ||
  `${window.location.protocol === 'https:' ? 'wss' : 'ws'}://${window.location.hostname}:3001`;

/**
 * Hook to subscribe to a tour's WebSocket room.
 * Calls onUpdate(data) whenever the server broadcasts a change.
 * Automatically reconnects on disconnect.
 */
export function useTourSocket(tourId, onUpdate) {
  const wsRef       = useRef(null);
  const timerRef    = useRef(null);
  const onUpdateRef = useRef(onUpdate);
  onUpdateRef.current = onUpdate;

  const connect = useCallback(() => {
    if (!tourId) return;
    const ws = new WebSocket(`${WS_BASE}/ws`);
    wsRef.current = ws;

    ws.onopen = () => {
      ws.send(JSON.stringify({ type: 'join', tourId }));
    };

    ws.onmessage = (evt) => {
      try {
        const msg = JSON.parse(evt.data);
        if (msg.type === 'update' && msg.data) {
          onUpdateRef.current(msg.data);
        }
      } catch (_) {}
    };

    ws.onclose = () => {
      // Reconnect after 2s
      timerRef.current = setTimeout(connect, 2000);
    };

    ws.onerror = () => ws.close();
  }, [tourId]);

  useEffect(() => {
    connect();
    return () => {
      clearTimeout(timerRef.current);
      if (wsRef.current) wsRef.current.close();
    };
  }, [connect]);
}
