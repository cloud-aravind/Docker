const express = require('express');
const bodyParser = require('body-parser');
const path = require('path'); // For serving static files
const { MongoClient } = require('mongodb');

const app = express();
const port = process.env.PORT || 3000;  // Use PORT from ECS

// Middleware to parse JSON and serve static files
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname))); // Serve static files from the project directory

// MongoDB connection
const url = process.env.MONGO_URL || "mongodb://admin:password@172.31.92.142:27017";
const client = new MongoClient(url);

let db;
client.connect()
  .then(() => {
    db = client.db('AccountDetails'); // Database name
    console.log('Connected to MongoDB');
  })
  .catch(err => console.error('Error connecting to MongoDB:', err));

// Routes

// Serve the index.html page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Handle form submission
app.post('/submit', async (req, res) => {
  const { name, email } = req.body;

  if (!name || !email) {
    return res.status(400).json({ message: 'Name and email are required' });
  }

  try {
    const result = await db.collection('users').insertOne({ name, email });
    res.json({ message: 'Data submitted successfully', id: result.insertedId });
  } catch (err) {
    console.error('Error inserting data:', err);
    res.status(500).json({ message: 'Error submitting data' });
  }
});

// Fetch data (for verification)
app.get('/data', async (req, res) => {
  try {
    const data = await db.collection('users').find().toArray();
    res.json(data);
  } catch (err) {
    res.status(500).send('Error fetching data');
  }
});

// Start the server with 0.0.0.0 binding
app.listen(port, '0.0.0.0', () => console.log(`Server running on http://0.0.0.0:${port}`));
