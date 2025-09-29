const express = require('express');
const fs = require('fs');
const cors = require('cors');
const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Load scores
let scores = [];
try {
    scores = JSON.parse(fs.readFileSync('scores.json', 'utf8'));
} catch (e) { scores = []; }

// Get leaderboard
app.get('/api/leaderboard', (req, res) => {
    // Urutkan berdasarkan skor tertinggi
    const sorted = scores.sort((a, b) => b.score - a.score).slice(0, 10);
    res.json(sorted);
});

// Submit score
app.post('/api/score', (req, res) => {
    const { username, score } = req.body;
    if (!username || typeof score !== 'number') {
        return res.status(400).json({ error: 'Invalid input!' });
    }
    scores.push({ username, score, timestamp: Date.now() });
    fs.writeFileSync('scores.json', JSON.stringify(scores));
    res.json({ success: true });
});

// Healthcheck
app.get('/', (req, res) => res.send('Pingpong Backend API running!'));

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
