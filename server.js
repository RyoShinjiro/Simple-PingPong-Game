const express = require('express');
const cors = require('cors');
const fs = require('fs');
const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

let scores = [];
try { scores = JSON.parse(fs.readFileSync('scores.json')); } catch { scores = []; }

app.post('/api/score', (req, res) => {
    const { username, score } = req.body;
    if (!username || typeof score !== 'number') return res.status(400).json({ error: 'Invalid input!' });
    scores.push({ username, score, ts: Date.now() });
    fs.writeFileSync('scores.json', JSON.stringify(scores));
    res.json({ success: true });
});

app.get('/api/leaderboard', (req, res) => {
    const top = scores.sort((a,b) => b.score-a.score).slice(0,10);
    res.json(top);
});

app.listen(PORT, () => console.log(`Backend running at http://localhost:${PORT}`));
