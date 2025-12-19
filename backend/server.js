const express = require('express');
const { MongoClient } = require('mongodb');
const app = express();
const PORT = 3001;
const MONGO_URL = process.env.MONGO_URL || 'mongodb://localhost:27017';
const DB_NAME = 'demo';

app.use(express.json());

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