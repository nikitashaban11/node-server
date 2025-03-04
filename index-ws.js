import express from 'express';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = createServer();

app.get('/', (req, res) => {
  res.sendFile('index.html', { root: __dirname });
});

server.on('request', app);
server.listen(3000, () => console.log('server started on port 3000'));

/** Begin websocket */
const wss = new WebSocketServer({ server });

process.on('SIGINT', () => {
  console.log('sigint');
  wss.clients.forEach((client) => {
    client.close();
  });
  server.close(() => {
    shutdownDB();
  });
});

wss.on('connection', (ws) => {
  const numClients = wss.clients.size;
  console.log('Clients connected', numClients);

  wss.broadcast(`Current visitors: ${numClients}`);

  if (ws.readyState === ws.OPEN) {
    ws.send('Welcome to my server');
  }

  db.run(`INSERT INTO visitors (count, time)
        VALUES (${numClients}, datetime('now'))
    `);

  ws.on('close', () => {
    wss.broadcast(`Current visitors: ${numClients}`);
    console.log('A client has disconnected');
  });
});

wss.broadcast = function broadcast(data) {
  wss.clients.forEach((client) => {
    client.send(data);
  });
};

/** end websockets */
/** begin database */
const db = new sqlite3.Database(':memory:');

db.serialize(() => {
  db.run(`
        CREATE TABLE visitors (
            count INTEGER,
            time TEXT
        )
    `);
});

function getCounts() {
  db.each('SELECT * FROM visitors', (err, row) => {
    console.log(row);
  });
}

function shutdownDB() {
  console.log('Shutting down db');
  getCounts();
  db.close();
}
