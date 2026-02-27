const express = require('express');
const router = express.Router();
const { db, BRANDS, BRAND_COLORS } = require('../db/init');

// In-memory cache for products (invalidated on write)
let cache = null;

function buildCache() {
  const rows = db.prepare('SELECT * FROM products WHERE active = 1 ORDER BY sort_order').all();
  const brandMeta = {
    trex:         { bc: '#C4481E', tag: "America's #1 Decking Brand" },
    fiberon:      { bc: '#1E5F98', tag: 'Good Wood for the Whole Neighborhood' },
    timbertech:   { bc: '#103A5A', tag: 'Engineered to Last a Lifetime' },
    deckorators:  { bc: '#A82820', tag: 'Pioneering Outdoor Living' },
    wolf:         { bc: '#1E4A1E', tag: 'Premium Outdoor Living Products' },
    moistureshield:{ bc: '#0E5A48', tag: 'Built for the Elements' },
    armadillo:    { bc: '#5A3010', tag: 'Hard as Nails, Beautiful as Wood' },
  };

  const brandMap = {};
  for (const row of rows) {
    if (!brandMap[row.brand]) {
      brandMap[row.brand] = {
        id: row.brand,
        name: row.brand_name,
        bc: brandMeta[row.brand]?.bc || '#555',
        tag: brandMeta[row.brand]?.tag || '',
        collections: {},
      };
    }
    if (!brandMap[row.brand].collections[row.collection]) {
      brandMap[row.brand].collections[row.collection] = { name: row.collection, colors: [] };
    }
    brandMap[row.brand].collections[row.collection].colors.push({
      id: row.id,
      n: row.color_name,
      h: row.hex,
    });
  }

  // Convert to array with collections as array
  return Object.values(brandMap).map(b => ({
    ...b,
    collections: Object.values(b.collections),
  }));
}

// GET /api/products — all active products grouped by brand/collection
router.get('/', (req, res) => {
  try {
    if (!cache) cache = buildCache();
    res.json(cache);
  } catch (err) {
    console.error('[products] GET error:', err);
    res.status(500).json({ error: 'Failed to load products' });
  }
});

module.exports = router;
module.exports.invalidateCache = () => { cache = null; };
