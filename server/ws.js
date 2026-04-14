const { WebSocketServer } = require('ws');

// Map of tourId -> Set of WebSocket clients
const rooms = new Map();

function setupWss(server) {
  const wss = new WebSocketServer({ server, path: '/ws' });

  wss.on('connection', (ws, req) => {
    // Client sends { type: 'join', tourId } immediately after connect
    ws.on('message', raw => {
      try {
        const msg = JSON.parse(raw);
        if (msg.type === 'join' && msg.tourId) {
          ws._tourId = msg.tourId;
          if (!rooms.has(msg.tourId)) rooms.set(msg.tourId, new Set());
          rooms.get(msg.tourId).add(ws);
        }
      } catch (_) {}
    });

    ws.on('close', () => {
      if (ws._tourId && rooms.has(ws._tourId)) {
        rooms.get(ws._tourId).delete(ws);
        if (rooms.get(ws._tourId).size === 0) rooms.delete(ws._tourId);
      }
    });

    ws.on('error', () => ws.terminate());
  });

  return wss;
}

/**
 * Broadcast a JSON payload to all clients subscribed to a tour room.
 * @param {string} tourId
 * @param {object} payload  – { type, data }
 */
function broadcast(tourId, payload) {
  if (!rooms.has(tourId)) return;
  const msg = JSON.stringify(payload);
  rooms.get(tourId).forEach(ws => {
    if (ws.readyState === 1 /* OPEN */) ws.send(msg);
  });
}

module.exports = { setupWss, broadcast };
