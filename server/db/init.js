const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const DATA_DIR = path.join(__dirname, '..', 'data');
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

const db = new Database(path.join(DATA_DIR, 'beisser.db'));

// Enable WAL mode for better concurrent read performance
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// ── SCHEMA ──────────────────────────────────────────────────
db.exec(`
  CREATE TABLE IF NOT EXISTS products (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    brand       TEXT NOT NULL,
    brand_name  TEXT NOT NULL,
    collection  TEXT NOT NULL,
    color_name  TEXT NOT NULL,
    hex         TEXT NOT NULL,
    sort_order  INTEGER DEFAULT 0,
    active      INTEGER DEFAULT 1
  );

  CREATE TABLE IF NOT EXISTS designs (
    id              TEXT PRIMARY KEY,
    quote_name      TEXT,
    notes           TEXT,
    house_style     TEXT,
    house_facade    TEXT,
    house_color_hex TEXT,
    deck_shape      TEXT,
    deck_width      REAL,
    deck_depth      REAL,
    product_id      INTEGER REFERENCES products(id),
    railing_style   TEXT,
    has_stairs      INTEGER DEFAULT 0,
    stair_config    TEXT,
    customer_email  TEXT,
    created_at      DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS events (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    event_type  TEXT NOT NULL,
    product_id  INTEGER,
    brand       TEXT,
    session_id  TEXT,
    device_type TEXT,
    meta        TEXT,
    created_at  DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS admin_users (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    username      TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL
  );
`);

// ── SEED PRODUCTS ────────────────────────────────────────────
const BRANDS = [
  { id: 'trex', name: 'Trex', cols: [
    { n: 'Transcend', colors: [
      { n: 'Gravel Path', h: '#9B9087' }, { n: 'Havana Gold', h: '#C49A4A' },
      { n: 'Island Mist', h: '#B4C0BA' }, { n: 'Lava Rock', h: '#4A3F3A' },
      { n: 'Rope Swing', h: '#C4A882' }, { n: 'Spiced Rum', h: '#7A4A2A' },
      { n: 'Tiki Torch', h: '#B87840' }, { n: 'Tree House', h: '#6B4E37' },
    ]},
    { n: 'Select', colors: [
      { n: 'Saddle', h: '#8B5E3C' }, { n: 'Pebble Grey', h: '#9BA4A0' },
      { n: 'Woodland Brown', h: '#5C3D28' },
    ]},
    { n: 'Enhance', colors: [
      { n: 'Beach Dune', h: '#C8B898' }, { n: 'Clam Shell', h: '#D4C4A8' },
      { n: 'Rocky Harbor', h: '#6B7A7A' }, { n: 'Toasted Sand', h: '#C4A870' },
    ]},
  ]},
  { id: 'fiberon', name: 'Fiberon', cols: [
    { n: 'Sanctuary', colors: [
      { n: 'Ipe', h: '#3E2412' }, { n: 'Driftwood', h: '#9E8E7A' },
      { n: 'Seaside Ash', h: '#B0A494' }, { n: 'Dark Walnut', h: '#4A3020' },
      { n: 'Weathered Teak', h: '#8B7355' },
    ]},
    { n: 'Symmetry', colors: [
      { n: 'Slate Gray', h: '#7A8490' }, { n: 'Warm Sienna', h: '#A05A30' },
      { n: 'Sandy Beige', h: '#C4A882' }, { n: 'Pacific Teak', h: '#7B6050' },
    ]},
    { n: 'Paramount', colors: [
      { n: 'Flagstone', h: '#8A8078' }, { n: 'Sahara', h: '#C0A878' },
      { n: 'Amber', h: '#B87830' },
    ]},
  ]},
  { id: 'timbertech', name: 'TimberTech / AZEK', cols: [
    { n: 'AZEK Vintage', colors: [
      { n: 'Brownstone', h: '#614238' }, { n: 'Coastline', h: '#8A9898' },
      { n: 'Weathered Teak', h: '#8B7355' }, { n: 'Mahogany', h: '#6A2E1A' },
    ]},
    { n: 'AZEK Harvest', colors: [
      { n: 'Brazilian Walnut', h: '#3D2210' }, { n: 'Golden Teak', h: '#A87840' },
      { n: 'Tigerwood', h: '#8A4E24' },
    ]},
    { n: 'Pro Reserve', colors: [
      { n: 'Dark Hickory', h: '#4A3020' }, { n: 'Slate Grey', h: '#70787C' },
      { n: 'Weathered Acacia', h: '#9A7E5C' },
    ]},
  ]},
  { id: 'deckorators', name: 'Deckorators', cols: [
    { n: 'Voyage', colors: [
      { n: 'Costa', h: '#6A4830' }, { n: 'Sierra', h: '#A07850' },
      { n: 'Khaya', h: '#8A6040' }, { n: 'Tundra', h: '#B0A890' },
      { n: 'Sedona', h: '#9A5830' }, { n: 'Mesa', h: '#C49870' },
    ]},
    { n: 'Vista', colors: [
      { n: 'Driftwood', h: '#A09080' }, { n: 'Ironwood', h: '#4A3828' },
      { n: 'Silverwood', h: '#8A8E90' }, { n: 'Dunewood', h: '#C0A87A' },
    ]},
    { n: 'Summit', colors: [
      { n: 'Glacier', h: '#C4C8C4' }, { n: 'Boulder', h: '#8A7E74' },
      { n: 'Cliffside', h: '#6A5E50' },
    ]},
  ]},
  { id: 'wolf', name: 'Wolf', cols: [
    { n: 'Serenity', colors: [
      { n: 'Autumn Mist', h: '#B09070' }, { n: 'Moonlight', h: '#C0BEB8' },
      { n: 'Walnut', h: '#5A3820' }, { n: 'Toffee', h: '#9A6A3A' },
    ]},
    { n: 'Distinction', colors: [
      { n: 'Driftwood', h: '#9A8870' }, { n: 'Natural', h: '#C0A870' },
      { n: 'Pecan', h: '#7A5030' },
    ]},
  ]},
  { id: 'moistureshield', name: 'MoistureShield', cols: [
    { n: 'Vantage', colors: [
      { n: 'Brazilia', h: '#4A2810' }, { n: 'Coastal Grey', h: '#8A9098' },
      { n: 'Island Oak', h: '#8A6038' }, { n: 'Sand', h: '#C4A87A' },
    ]},
    { n: 'Pro', colors: [
      { n: 'Antique', h: '#7A5830' }, { n: 'Brown', h: '#5A3820' },
      { n: 'Grey', h: '#78808A' },
    ]},
    { n: 'Infuse', colors: [
      { n: 'Weathered Olive', h: '#7A7A50' }, { n: 'Driftwood', h: '#A09080' },
    ]},
  ]},
  { id: 'armadillo', name: 'Armadillo', cols: [
    { n: 'Distinction', colors: [
      { n: 'Charcoal', h: '#3A3A3C' }, { n: 'Espresso', h: '#2A1A10' },
      { n: 'Driftwood', h: '#9A8870' }, { n: 'Teak', h: '#8A6038' },
    ]},
    { n: 'Landmark', colors: [
      { n: 'Chestnut', h: '#6A3A1A' }, { n: 'Aged Oak', h: '#7A6040' },
      { n: 'Redwood', h: '#8A3020' }, { n: 'Silvered Ash', h: '#A8A498' },
    ]},
  ]},
];

const BRAND_COLORS = {
  trex: '#C4481E', fiberon: '#1E5F98', timbertech: '#103A5A',
  deckorators: '#A82820', wolf: '#1E4A1E', moistureshield: '#0E5A48',
  armadillo: '#5A3010',
};

// Only seed if products table is empty
const productCount = db.prepare('SELECT COUNT(*) as c FROM products').get();
if (productCount.c === 0) {
  const insert = db.prepare(
    'INSERT INTO products (brand, brand_name, collection, color_name, hex, sort_order) VALUES (?, ?, ?, ?, ?, ?)'
  );
  const insertMany = db.transaction((brands) => {
    let order = 0;
    for (const brand of brands) {
      for (const col of brand.cols) {
        for (const color of col.colors) {
          insert.run(brand.id, brand.name, col.n, color.n, color.h, order++);
        }
      }
    }
  });
  insertMany(BRANDS);
  console.log('[db] Seeded products table with all brands and colors');
}

module.exports = { db, BRANDS, BRAND_COLORS };
