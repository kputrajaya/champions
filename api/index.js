const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 8080 });

const keyClients = {};

wss.on('connection', (ws) => {
  console.log('Client connected');
  ws.on('message', (message) => {
    const parsed = JSON.parse(message);
    if (!parsed.key) return;
    if (parsed.action === 'subscribe') {
      keyClients[parsed.key] = keyClients[parsed.key] || new Set();
      keyClients[parsed.key].add(ws);
      console.log('Client subscribed to key:', parsed.key);
    } else if (parsed.action === 'publish') {
      if (!keyClients[parsed.key] || !parsed.data) return;
      keyClients[parsed.key].forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(parsed.data);
        }
      });
      console.log('Message sent to key:', parsed.key);
    }
  });

  ws.on('close', () => {
    console.log('Client disconnected');
    for (let key in keyClients) {
      keyClients[key].delete(ws);
    }
  });
});

console.log('Server is running on ws://localhost:8080');
