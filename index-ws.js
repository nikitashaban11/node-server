import http from 'node:http';
import express from 'express';
import { WebSocketServer } from 'ws';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer();

app.get('/', (req, res) => {
  res.sendFile('index.html', { root: __dirname });
});

server.on('request', app);
server.listen(3000, () => console.log('Server is running on port 3000'));

const wss = new WebSocketServer({ server });

wss.on('connection', (ws) => {
  const numClients = wss.clients.size;

  console.log(`Clients connected: ${numClients}`);

  wss.broadcast(`Current visitors ${numClients}`);

  if (ws.readyState === ws.OPEN) ws.send('Welcome to my server');

  ws.on('close', () => {
    wss.broadcast(`Current visitors ${numClients}`);
    console.log('Client has disconnected');
  });
});

wss.broadcast = (data) => {
  wss.clients.forEach((client) => {
    client.send(data);
  });
};
