// server/index.js
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3001; // Use a port different from Vite (5173)

app.use(cors()); // Allow requests from your React frontend

app.get('/api/hello', (req, res) => {
  res.json({ message: 'Hello from backend!' });
});

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});