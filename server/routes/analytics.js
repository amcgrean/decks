const express = require('express');
const router = express.Router();
const { db } = require('../db/init');

// POST /api/analytics/event — fire-and-forget event logging
router.post('/event', (req, res) => {
  // Respond immediately so client is never blocked
  res.status(202).json({ ok: true });

  try {
    const { event_type, product_id, brand, session_id, device_type, meta } = req.body;
    if (!event_type) return;

    db.prepare(`
      INSERT INTO events (event_type, product_id, brand, session_id, device_type, meta)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(
      event_type,
      product_id || null,
      brand || null,
      session_id || null,
      device_type || null,
      meta ? JSON.stringify(meta) : null
    );
  } catch (err) {
    // Silently log — never surface to client
    console.error('[analytics] event error:', err.message);
  }
});

// GET /api/analytics/summary — basic stats (Phase 3 will add auth)
router.get('/summary', (req, res) => {
  try {
    const topColors = db.prepare(`
      SELECT e.product_id, p.color_name, p.brand_name, p.hex, COUNT(*) as count
      FROM events e
      JOIN products p ON e.product_id = p.id
      WHERE e.event_type = 'color_select' AND e.product_id IS NOT NULL
      GROUP BY e.product_id
      ORDER BY count DESC
      LIMIT 10
    `).all();

    const brandBreakdown = db.prepare(`
      SELECT brand, COUNT(*) as count
      FROM events
      WHERE event_type = 'brand_select' AND brand IS NOT NULL
      GROUP BY brand
      ORDER BY count DESC
    `).all();

    const dailySessions = db.prepare(`
      SELECT DATE(created_at) as date, COUNT(DISTINCT session_id) as sessions
      FROM events
      WHERE created_at >= DATE('now', '-30 days')
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `).all();

    const totalEvents = db.prepare('SELECT COUNT(*) as c FROM events').get();

    res.json({ topColors, brandBreakdown, dailySessions, totalEvents: totalEvents.c });
  } catch (err) {
    console.error('[analytics] summary error:', err);
    res.status(500).json({ error: 'Failed to load analytics' });
  }
});

module.exports = router;
