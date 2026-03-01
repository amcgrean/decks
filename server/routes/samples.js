const express = require('express');
const router = express.Router();
const { db } = require('../db/init');

// POST /api/samples — save sample request
// Phase 2: persists to DB. Phase 3: add nodemailer SMTP notification.
router.post('/', (req, res) => {
  try {
    const {
      design_id, name, email, phone,
      color1_hex, color1_name,
      color2_hex, color2_name,
      brand, notes,
    } = req.body;

    if (!name || !email) {
      return res.status(400).json({ error: 'name and email are required' });
    }

    const result = db.prepare(`
      INSERT INTO sample_requests
        (design_id, name, email, phone, color1_hex, color1_name, color2_hex, color2_name, brand, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      design_id || null,
      name,
      email,
      phone || null,
      color1_hex || null,
      color1_name || null,
      color2_hex || null,
      color2_name || null,
      brand || null,
      notes || null,
    );

    // Log an analytics event for funnel tracking
    db.prepare(`
      INSERT INTO events (event_type, brand, meta)
      VALUES (?, ?, ?)
    `).run('sample_request', brand || null, JSON.stringify({ name, color: color1_name }));

    res.json({ id: result.lastInsertRowid, ok: true });
  } catch (err) {
    console.error('[samples] POST error:', err);
    res.status(500).json({ error: 'Failed to save sample request' });
  }
});

module.exports = router;
