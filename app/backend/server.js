const express = require('express');
const { MongoClient } = require('mongodb');
const app = express();
const PORT = 3001;
const MONGO_URL = process.env.MONGO_URL || 'mongodb://mongo-service:27017';
const DB_NAME = 'demo';

app.use(express.json());

const promClient = require('prom-client');

// Enable default metrics (CPU, Memory, Event Loop)
promClient.collectDefaultMetrics();

// Custom metric: HTTP Request Duration
const httpRequestDurationMicroseconds = new promClient.Histogram({
  name: 'http_request_duration_ms',
  help: 'Duration of HTTP requests in ms',
  labelNames: ['method', 'route', 'code'],
  buckets: [50, 100, 200, 300, 400, 500, 750, 1000, 2000]
});

// Middleware to track duration of all requests
app.use((req, res, next) => {
  const end = httpRequestDurationMicroseconds.startTimer();
  res.on('finish', () => {
    end({ route: req.route ? req.route.path : req.path, code: res.statusCode, method: req.method });
  });
  next();
});

app.get('/metrics', async (req, res) => {
  res.set('Content-Type', promClient.register.contentType);
  res.end(await promClient.register.metrics());
});

app.get('/health', (req, res) => {
  res.status(200).send('OK');
});
app.get('/api/messages', async (req, res) => {
  try {
    const client = await MongoClient.connect(MONGO_URL);
    const db = client.db(DB_NAME);
    const messages = await db.collection('messages').find().toArray();
    client.close();
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/messages', async (req, res) => {
  try {
    const client = await MongoClient.connect(MONGO_URL);
    const db = client.db(DB_NAME);
    const result = await db.collection('messages').insertOne({ text: req.body.text });
    client.close();
    res.json(result.ops[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => console.log(`Backend listening on port ${PORT}`));