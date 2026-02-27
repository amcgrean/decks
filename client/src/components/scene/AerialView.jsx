// Aerial (top-down) view with grass pattern, compass, railing posts
import { lighten, darken } from '../../utils/color';

export default function AerialView({ shape, deckColor, railingStyle }) {
  const base = deckColor?.h || null;
  const b = base || '#9A7E5C';
  const W = 900;
  const dark = darken(b, 0.26), edge = darken(b, 0.42);

  const shapes = {
    rectangle:  [[90, 318, 720, 152]],
    lshape:     [[90, 318, 720, 74], [90, 392, 356, 78]],
    tshape:     [[90, 318, 720, 74], [306, 392, 288, 78]],
    multilevel: [[108, 268, 684, 100], [90, 336, 720, 136]],
    wraparound: [[18, 318, 864, 152]],
  };
  const decks = shapes[shape] || shapes.rectangle;

  return (
    <svg viewBox={`0 0 ${W} 520`} style={{ width: '100%', height: '100%', display: 'block' }}>
      <defs>
        <pattern id="p-grass" x="0" y="0" width="18" height="18" patternUnits="userSpaceOnUse">
          <rect width="18" height="18" fill="#4A7A24"/>
          <line x1="0" y1="9" x2="9" y2="0" stroke="#387016" strokeWidth="1.8" opacity="0.4"/>
          <line x1="9" y1="18" x2="18" y2="9" stroke="#387016" strokeWidth="1.5" opacity="0.3"/>
        </pattern>
        <filter id="f-deck-top-shadow" x="-8%" y="-8%" width="118%" height="122%">
          <feDropShadow dx="4" dy="7" stdDeviation="7" floodColor="rgba(0,0,0,0.3)"/>
        </filter>
        <filter id="f-house-top-shadow" x="-6%" y="-6%" width="118%" height="125%">
          <feDropShadow dx="6" dy="11" stdDeviation="11" floodColor="rgba(0,0,0,0.36)"/>
        </filter>
        <filter id="f-wood-top" x="0%" y="0%" width="100%" height="100%" colorInterpolationFilters="sRGB">
          <feTurbulence type="fractalNoise" baseFrequency="0.012 0.48" numOctaves="4" seed="7" result="grain"/>
          <feColorMatrix type="saturate" values="0.5" in="grain" result="tinted"/>
          <feComponentTransfer in="tinted" result="contracted">
            <feFuncR type="linear" slope="1.4" intercept="-0.18"/>
            <feFuncG type="linear" slope="1.3" intercept="-0.16"/>
            <feFuncB type="linear" slope="1.2" intercept="-0.14"/>
          </feComponentTransfer>
          <feBlend in="SourceGraphic" in2="contracted" mode="overlay" result="blended"/>
          <feComposite in="blended" in2="SourceGraphic" operator="in"/>
        </filter>
        <linearGradient id="g-deck-sun-top" x1="0.12" y1="0" x2="0.88" y2="1">
          <stop offset="0%"   stopColor="rgba(255,245,200,0.12)"/>
          <stop offset="100%" stopColor="rgba(255,245,200,0)"/>
        </linearGradient>
      </defs>

      {/* Ground */}
      <rect width={W} height={520} fill="url(#p-grass)"/>
      <ellipse cx={W/2} cy={492} rx={W*0.46} ry={24} fill="rgba(0,0,0,0.18)"/>

      {/* Deck footprints */}
      {decks.map(([dx,dy,dw,dh], si) => (
        <g key={si} filter="url(#f-deck-top-shadow)">
          <rect x={dx} y={dy} width={dw} height={dh} fill={b} filter="url(#f-wood-top)"/>
          {Array.from({length: Math.ceil(dh/10)+1}, (_, i) => (
            <rect key={i} x={dx} y={dy+i*10} width={dw} height={9}
              fill={i%3===0 ? lighten(b,0.1) : i%3===1 ? b : darken(b,0.04)}/>
          ))}
          {Array.from({length: Math.ceil(dh/10)+1}, (_, i) => (
            <rect key={i} x={dx} y={dy+i*10} width={dw} height={1.6} fill={dark} opacity="0.7"/>
          ))}
          <rect x={dx}      y={dy}      width={dw} height={9}  fill={edge}/>
          <rect x={dx}      y={dy+dh-9} width={dw} height={9}  fill={darken(edge,0.1)}/>
          <rect x={dx}      y={dy}      width={9}  height={dh} fill={darken(edge,0.06)}/>
          <rect x={dx+dw-9} y={dy}      width={9}  height={dh} fill={darken(edge,0.06)}/>
          <rect x={dx} y={dy} width={dw} height={dh} fill="url(#g-deck-sun-top)"/>
        </g>
      ))}

      {/* Railing posts top-down */}
      {railingStyle && railingStyle !== 'none' && (() => {
        const [dx,dy,dw,dh] = decks[0];
        const sp = 78;
        const pts = [];
        for (let px = dx; px <= dx+dw; px += sp) { pts.push([px,dy]); pts.push([px,dy+dh]); }
        for (let py = dy+sp; py < dy+dh; py += sp) { pts.push([dx,py]); pts.push([dx+dw,py]); }
        return pts.map(([px,py], i) => (
          <circle key={i} cx={px} cy={py} r={5.5} fill={darken(b,0.34)} stroke={darken(b,0.5)} strokeWidth="1.5"/>
        ));
      })()}

      {/* House footprint */}
      <g filter="url(#f-house-top-shadow)">
        <rect x="90" y="68" width="720" height="252" fill="#EEE8D8" stroke="#CABC9C" strokeWidth="2"/>
        <rect x="90" y="68" width="720" height="14" fill="#3A2C22"/>
        <line x1="90" y1="110" x2="810" y2="110" stroke="#3A2C22" strokeWidth="5" opacity="0.3"/>
        <line x1="90" y1="198" x2="810" y2="198" stroke="#CABC9C" strokeWidth="2" opacity="0.45"/>
        <rect x="578" y="70" width="44" height="38" fill="#8A6E52" stroke="#5A4830" strokeWidth="1.5"/>
        {[148,268,388,512,634,752].map((wx,i) => (
          <rect key={i} x={wx} y={296} width={58} height={18} rx="2.5" fill="#5A88A0" opacity="0.9"/>
        ))}
        <rect x="408" y="310" width="68" height="10" rx="2.5" fill="#3A2818" stroke="#2A1810" strokeWidth="1"/>
        {Array.from({length:8},(_,i) => (
          <line key={i} x1="90" y1={80+i*22} x2="810" y2={80+i*22} stroke="rgba(180,170,150,0.3)" strokeWidth="1"/>
        ))}
      </g>

      {/* Pathway */}
      <polygon points={`${W/2-26},520 ${W/2+26},520 ${W/2+14},474 ${W/2-14},474`}
        fill="#C2B6A0" opacity="0.68"/>

      {/* Compass rose */}
      <g transform={`translate(${W-58},56)`}>
        <circle r="30" fill="rgba(255,255,255,0.16)" stroke="rgba(255,255,255,0.52)" strokeWidth="1.5"/>
        <polygon points="0,-22 3.5,0 0,-5 -3.5,0" fill="white"/>
        <polygon points="0,22 3.5,0 0,5 -3.5,0" fill="rgba(255,255,255,0.38)"/>
        <text x="0" y="-10" textAnchor="middle" fill="white" fontSize="11" fontFamily="DM Sans,sans-serif" fontWeight="700">N</text>
        <text x="0"  y="20" textAnchor="middle" fill="rgba(255,255,255,0.5)" fontSize="8.5" fontFamily="DM Sans,sans-serif">S</text>
        <text x="-18" y="4" textAnchor="middle" fill="rgba(255,255,255,0.5)" fontSize="8.5" fontFamily="DM Sans,sans-serif">W</text>
        <text x="18"  y="4" textAnchor="middle" fill="rgba(255,255,255,0.5)" fontSize="8.5" fontFamily="DM Sans,sans-serif">E</text>
      </g>

      {/* Label */}
      <rect x="12" y="12" width="112" height="27" rx="5" fill="rgba(0,0,0,0.54)"/>
      <text x="68" y="30" textAnchor="middle" fill="rgba(255,255,255,0.92)" fontSize="11.5"
        fontFamily="DM Sans,sans-serif" fontWeight="700" letterSpacing="0.07em">AERIAL PLAN</text>

      {!base && (
        <g>
          <rect x={W/2-146} y={426} width={292} height={44} rx="8" fill="rgba(0,0,0,0.52)"/>
          <text x={W/2} y={451} textAnchor="middle" fill="rgba(255,255,255,0.9)" fontSize="13"
            fontFamily="DM Sans,sans-serif" fontWeight="700">SELECT COLOR TO PREVIEW</text>
        </g>
      )}
    </svg>
  );
}
