// All 7 brands with 74+ colors — sourced from BeisserDeckVisualizer.jsx prototype
export const BRANDS = [
  { id: 'trex', name: 'Trex', bc: '#C4481E', tag: "America's #1 Decking Brand",
    cols: [
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
  { id: 'fiberon', name: 'Fiberon', bc: '#1E5F98', tag: 'Good Wood for the Whole Neighborhood',
    cols: [
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
  { id: 'timbertech', name: 'TimberTech / AZEK', bc: '#103A5A', tag: 'Engineered to Last a Lifetime',
    cols: [
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
  { id: 'deckorators', name: 'Deckorators', bc: '#A82820', tag: 'Pioneering Outdoor Living',
    cols: [
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
  { id: 'wolf', name: 'Wolf', bc: '#1E4A1E', tag: 'Premium Outdoor Living Products',
    cols: [
      { n: 'Serenity', colors: [
        { n: 'Autumn Mist', h: '#B09070' }, { n: 'Moonlight', h: '#C0BEB8' },
        { n: 'Walnut', h: '#5A3820' }, { n: 'Toffee', h: '#9A6A3A' },
      ]},
      { n: 'Distinction', colors: [
        { n: 'Driftwood', h: '#9A8870' }, { n: 'Natural', h: '#C0A870' },
        { n: 'Pecan', h: '#7A5030' },
      ]},
    ]},
  { id: 'moistureshield', name: 'MoistureShield', bc: '#0E5A48', tag: 'Built for the Elements',
    cols: [
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
  { id: 'armadillo', name: 'Armadillo', bc: '#5A3010', tag: 'Hard as Nails, Beautiful as Wood',
    cols: [
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

export const SHAPES = [
  { id: 'rectangle',  name: 'Rectangle',   desc: 'Classic & versatile',       icon: '▬' },
  { id: 'lshape',     name: 'L-Shape',     desc: 'Wraps a corner',             icon: '⌐' },
  { id: 'tshape',     name: 'T-Shape',     desc: 'Center extension forward',   icon: '⊤' },
  { id: 'wraparound', name: 'Wrap-Around', desc: 'Full-width expanse',         icon: '═' },
  { id: 'multilevel', name: 'Multi-Level', desc: 'Two-tier with steps',        icon: '☰' },
];

export const RAILING_STYLES = [
  { id: 'none',       name: 'No Railing',       desc: 'Open ground-level look' },
  { id: 'baluster',   name: 'Classic Baluster',  desc: 'Traditional spindles' },
  { id: 'cable',      name: 'Cable Rail',        desc: 'Modern, unobstructed views' },
  { id: 'glass',      name: 'Glass Panel',       desc: 'Seamless panoramic look' },
  { id: 'horizontal', name: 'Horizontal Board',  desc: 'Contemporary linear style' },
];

export const VIEWS = [
  { id: 'surface',  label: 'Surface',  icon: '🏠' },
  { id: 'corner',   label: 'Corner',   icon: '📐' },
  { id: 'aerial',   label: 'Aerial',   icon: '🛸' },
  { id: 'framing',  label: 'Framing',  icon: '🪵' },
  { id: 'detail',   label: 'Detail',   icon: '🔍' },
];

export const STEP_LABELS = ['Shape', 'Size', 'Brand', 'Color', 'Railing', 'Stairs', 'Summary'];
