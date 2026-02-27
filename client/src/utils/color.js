// Color utility functions — ported verbatim from BeisserDeckVisualizer.jsx prototype
// These power all procedural SVG rendering

export const h2r = h => {
  const s = (h || '').replace('#', '');
  return [parseInt(s.slice(0,2),16)||0, parseInt(s.slice(2,4),16)||0, parseInt(s.slice(4,6),16)||0];
};

export const r2h = (r, g, b) =>
  '#' + [r,g,b].map(v => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2,'0')).join('');

export const lighten = (h, a) => {
  if (!h?.startsWith('#')) return h || '#9A7E5C';
  const [r,g,b] = h2r(h);
  return r2h(r + (255-r)*a, g + (255-g)*a, b + (255-b)*a);
};

export const darken = (h, a) => {
  if (!h?.startsWith('#')) return h || '#9A7E5C';
  const [r,g,b] = h2r(h);
  return r2h(r*(1-a), g*(1-a), b*(1-a));
};

export const mix = (h1, h2, t) => {
  const [r1,g1,b1] = h2r(h1);
  const [r2,g2,b2] = h2r(h2);
  return r2h(r1+(r2-r1)*t, g1+(g2-g1)*t, b1+(b2-b1)*t);
};
