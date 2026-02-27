// Detail view — cinematic macro board close-up, ported verbatim from prototype
// This is the #1 feature for selling colors — port verbatim per build plan

import { darken, lighten, mix } from '../../utils/color';

export default function DetailView({ deckColor, railingStyle }) {
  const c = deckColor?.h || null;
  const base = c || '#9A7E5C';
  const bW = 78, seamW = 5, step = bW + seamW;
  const numBoards = Math.ceil(900 / step) + 2;
  const SH = 438;

  return (
    <svg viewBox="0 0 900 520" style={{ width: '100%', height: '100%', display: 'block' }}>
      <defs>
        <linearGradient id="dv-bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#161412"/>
          <stop offset="100%" stopColor="#221E1A"/>
        </linearGradient>
        {/* Per-board sheen */}
        <linearGradient id="dv-sheen" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="rgba(255,255,255,0.1)"/>
          <stop offset="30%"  stopColor="rgba(255,255,255,0.02)"/>
          <stop offset="100%" stopColor="rgba(0,0,0,0.16)"/>
        </linearGradient>
        {/* Specular gloss diagonal */}
        <linearGradient id="dv-gloss" x1="0" y1="0" x2="0.7" y2="0.7">
          <stop offset="0%"   stopColor="rgba(255,255,255,0.14)"/>
          <stop offset="30%"  stopColor="rgba(255,255,255,0.03)"/>
          <stop offset="100%" stopColor="rgba(255,255,255,0)"/>
        </linearGradient>
        {/* Side vignette */}
        <linearGradient id="dv-vigH" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%"   stopColor="rgba(0,0,0,0.75)"/>
          <stop offset="18%"  stopColor="rgba(0,0,0,0)"/>
          <stop offset="82%"  stopColor="rgba(0,0,0,0)"/>
          <stop offset="100%" stopColor="rgba(0,0,0,0.75)"/>
        </linearGradient>
        {/* Top/bottom vignette */}
        <linearGradient id="dv-vigV" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="rgba(0,0,0,0.7)"/>
          <stop offset="16%"  stopColor="rgba(0,0,0,0)"/>
          <stop offset="80%"  stopColor="rgba(0,0,0,0)"/>
          <stop offset="100%" stopColor="rgba(0,0,0,0.7)"/>
        </linearGradient>
        {/* THE WOOD GRAIN FILTER — asymmetric for fiber lines, more octaves for close-up detail */}
        <filter id="dv-wood-grain" x="0%" y="0%" width="100%" height="100%" colorInterpolationFilters="sRGB">
          <feTurbulence type="fractalNoise" baseFrequency="0.01 0.52" numOctaves="5" seed="9" result="grain"/>
          <feColorMatrix type="saturate" values="0.6" in="grain" result="tinted"/>
          <feComponentTransfer in="tinted" result="boosted">
            <feFuncR type="linear" slope="1.5" intercept="-0.22"/>
            <feFuncG type="linear" slope="1.4" intercept="-0.20"/>
            <feFuncB type="linear" slope="1.3" intercept="-0.18"/>
          </feComponentTransfer>
          <feBlend in="SourceGraphic" in2="boosted" mode="overlay" result="blended"/>
          <feComposite in="blended" in2="SourceGraphic" operator="in"/>
        </filter>
      </defs>

      <rect width="900" height="520" fill="url(#dv-bg)"/>

      {/* Board surface area */}
      <g transform="translate(-4,42)">
        {/* Floor shadow at bottom */}
        <rect x="0" y={SH} width="908" height="44" fill="rgba(0,0,0,0.65)"/>

        {/* Boards */}
        {Array.from({length: numBoards}, (_, bi) => {
          const x = bi * step - (step / 2);
          // Per-board color variation — makes each board look individually unique
          const variance  = ((bi*41+13)%32)/100;
          const variance2 = ((bi*23+7) %20)/100;
          const bColor = bi%7===0 ? darken(base, 0.06+variance2*0.08)
                       : bi%7===3 ? lighten(base, 0.04+variance*0.12)
                       : mix(base, lighten(base, 0.16), variance*0.6);
          const seamC = darken(base, 0.58);

          return (
            <g key={bi}>
              {/* Board with grain — the key quality element */}
              <rect x={x} y={0} width={bW} height={SH} fill={bColor} filter="url(#dv-wood-grain)"/>
              {/* Sheen overlay */}
              <rect x={x} y={0} width={bW} height={SH} fill="url(#dv-sheen)"/>
              {/* Specular gloss */}
              <rect x={x} y={0} width={bW} height={SH} fill="url(#dv-gloss)"/>
              {/* Left raised chamfer */}
              <rect x={x} y={0} width={4} height={SH} fill={lighten(bColor,0.2)} opacity="0.52"/>
              {/* Right deep shadow */}
              <rect x={x+bW-7} y={0} width={7} height={SH} fill="rgba(0,0,0,0.24)"/>
              {/* Seam groove */}
              <rect x={x+bW} y={0} width={seamW} height={SH} fill={seamC}/>
              {/* Seam edge highlight (top lip catches light) */}
              <rect x={x+bW} y={0} width={seamW} height={4} fill="rgba(255,255,255,0.1)"/>
              {/* Phillips screw fasteners — detailed */}
              {[86, 248, 410].map((fy, fi) => (
                <g key={fi}>
                  {/* Screw recess shadow */}
                  <ellipse cx={x+bW/2} cy={fy} rx={5.5} ry={3} fill="rgba(0,0,0,0.55)"/>
                  {/* Screw head */}
                  <ellipse cx={x+bW/2} cy={fy} rx={4} ry={2.2} fill={darken(bColor,0.28)}/>
                  {/* Drive slot — Phillips cross */}
                  <line x1={x+bW/2-2.8} y1={fy}     x2={x+bW/2+2.8} y2={fy}     stroke="rgba(0,0,0,0.45)" strokeWidth="1.1"/>
                  <line x1={x+bW/2}     y1={fy-2.4}  x2={x+bW/2}     y2={fy+2.4} stroke="rgba(0,0,0,0.45)" strokeWidth="1.1"/>
                  {/* Screw head glint */}
                  <ellipse cx={x+bW/2-1} cy={fy-0.9} rx={1.6} ry={0.9} fill="rgba(255,255,255,0.2)"/>
                </g>
              ))}
            </g>
          );
        })}

        {/* Expansion gap lines across board run */}
        {[126, 274, 422].map((gy, i) => (
          <g key={i}>
            <rect x="0" y={gy}     width="908" height="3.5" fill="rgba(0,0,0,0.38)"/>
            <rect x="0" y={gy+3.5} width="908" height="1.2" fill="rgba(255,255,255,0.06)"/>
          </g>
        ))}
      </g>

      {/* Railing post glimpse at left/center/right */}
      {railingStyle && railingStyle !== 'none' && (
        <g opacity="0.7">
          {[46, 330, 614].map((px, i) => (
            <g key={i}>
              <rect x={px}   y={18}  width={22} height={520} rx="5" fill={darken(base, 0.36)}/>
              <rect x={px}   y={18}  width={6}  height={520} fill="rgba(255,255,255,0.1)" rx="5"/>
              <rect x={px-6} y={16}  width={34} height={18} rx="4" fill="#D8D0B8"/>
              <rect x={px-6} y={16}  width={34} height={7}  rx="4" fill="#E8E0C8"/>
            </g>
          ))}
        </g>
      )}

      {/* Vignettes */}
      <rect x="0" y="0" width="900" height="520" fill="url(#dv-vigH)"/>
      <rect x="0" y="0" width="900" height="520" fill="url(#dv-vigV)"/>

      {/* Label chip */}
      <rect x="12" y="12" width="122" height="27" rx="5" fill="rgba(0,0,0,0.58)"/>
      <text x="73" y="30" textAnchor="middle" fill="rgba(255,255,255,0.92)" fontSize="11.5"
        fontFamily="DM Sans,sans-serif" fontWeight="700" letterSpacing="0.07em">BOARD DETAIL</text>

      {/* Color swatch chip */}
      {c && (
        <g>
          <rect x="720" y="452" width="168" height="56" rx="9" fill="rgba(0,0,0,0.68)"
            stroke="rgba(255,255,255,0.1)" strokeWidth="1"/>
          <rect x="733" y="463" width="28" height="34" rx="4" fill={c}
            stroke="rgba(255,255,255,0.2)" strokeWidth="1"/>
          <text x="770" y="476" fill="rgba(255,255,255,0.94)" fontSize="11.5"
            fontFamily="DM Sans,sans-serif" fontWeight="700">{deckColor?.n}</text>
          <text x="770" y="493" fill="rgba(255,255,255,0.44)" fontSize="9.5"
            fontFamily="DM Sans,sans-serif">{c.toUpperCase()}</text>
        </g>
      )}

      {/* No-color prompt */}
      {!c && (
        <g>
          <rect x="260" y="218" width="380" height="64" rx="12" fill="rgba(0,0,0,0.65)"/>
          <text x="450" y="247" textAnchor="middle" fill="rgba(255,255,255,0.94)" fontSize="15.5"
            fontFamily="Playfair Display,serif" fontWeight="600">Select a Color</text>
          <text x="450" y="267" textAnchor="middle" fill="rgba(255,255,255,0.48)" fontSize="11.5"
            fontFamily="DM Sans,sans-serif">to preview grain texture and detail</text>
        </g>
      )}
    </svg>
  );
}
