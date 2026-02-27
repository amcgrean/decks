const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

// ── MIDDLEWARE ───────────────────────────────────────────────
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173' }));
app.use(express.json());

// ── ROUTES ───────────────────────────────────────────────────
app.use('/api/products',   require('./routes/products'));
app.use('/api/designs',    require('./routes/designs'));
app.use('/api/analytics',  require('./routes/analytics'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', ts: new Date().toISOString() });
});

// ── SERVE CLIENT (PRODUCTION) ────────────────────────────────
const CLIENT_DIST = path.join(__dirname, '..', 'client', 'dist');
const fs = require('fs');
if (fs.existsSync(CLIENT_DIST)) {
  app.use(express.static(CLIENT_DIST));
  app.get('*', (req, res) => {
    if (!req.path.startsWith('/api')) {
      res.sendFile(path.join(CLIENT_DIST, 'index.html'));
    }
  });
}

// ── START ────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`[server] Beisser Deck Visualizer API running on port ${PORT}`);
});
