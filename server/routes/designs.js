const express = require('express');
const router = express.Router();
const { db } = require('../db/init');
const { v4: uuidv4 } = require('uuid');

// POST /api/designs — save design, return UUID
router.post('/', (req, res) => {
  try {
    const {
      quote_name, notes, house_style, house_facade, house_color_hex,
      deck_shape, deck_width, deck_depth, product_id,
      railing_style, has_stairs, stair_config, customer_email,
    } = req.body;

    const id = uuidv4();
    db.prepare(`
      INSERT INTO designs (id, quote_name, notes, house_style, house_facade, house_color_hex,
        deck_shape, deck_width, deck_depth, product_id, railing_style, has_stairs, stair_config, customer_email)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id, quote_name || null, notes || null, house_style || null,
      house_facade || null, house_color_hex || null,
      deck_shape || null, deck_width || null, deck_depth || null,
      product_id || null, railing_style || null,
      has_stairs ? 1 : 0, stair_config ? JSON.stringify(stair_config) : null,
      customer_email || null
    );

    res.json({ id });
  } catch (err) {
    console.error('[designs] POST error:', err);
    res.status(500).json({ error: 'Failed to save design' });
  }
});

// GET /api/designs/:id — load saved design
router.get('/:id', (req, res) => {
  try {
    const design = db.prepare('SELECT * FROM designs WHERE id = ?').get(req.params.id);
    if (!design) return res.status(404).json({ error: 'Design not found' });

    // Parse stair config
    if (design.stair_config) {
      try { design.stair_config = JSON.parse(design.stair_config); } catch {}
    }

    // Load associated product if exists
    if (design.product_id) {
      design.product = db.prepare('SELECT * FROM products WHERE id = ?').get(design.product_id);
    }

    res.json(design);
  } catch (err) {
    console.error('[designs] GET error:', err);
    res.status(500).json({ error: 'Failed to load design' });
  }
});

module.exports = router;
