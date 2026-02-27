// Framing (structural) view — blueprint-style joist and beam layout
// Shows the structural engineering of the deck from a top-down perspective

import { darken } from '../../utils/color';

export default function FramingView({ shape, deckColor }) {
  const b = deckColor?.h || '#9A7E5C';
  const W = 900, H = 520;

  // Deck region in framing view
  const DX = 80, DY = 290, DW = 740, DH = 170;

  const shapes = {
    rectangle:  { x: DX, y: DY, w: DW, h: DH, segments: [[DX, DY, DW, DH]] },
    lshape:     { x: DX, y: DY, w: DW, h: DH, segments: [[DX, DY, DW, DH*0.5], [DX, DY+DH*0.5, DW*0.5, DH*0.5]] },
    tshape:     { x: DX, y: DY, w: DW, h: DH, segments: [[DX, DY, DW, DH*0.5], [DX+DW*0.28, DY+DH*0.5, DW*0.44, DH*0.5]] },
    multilevel: { x: DX, y: DY-80, w: DW, h: DH+80, segments: [[DX+20, DY-80, DW-40, 85], [DX, DY, DW, DH]] },
    wraparound: { x: DX-60, y: DY, w: DW+120, h: DH, segments: [[DX-60, DY, DW+120, DH]] },
  };
  const cfg = shapes[shape] || shapes.rectangle;

  const JOIST_SPACING = 16; // 16" OC standard
  const BEAM_SPACING = 80;  // approximate pixel spacing for beams
  const POST_COLOR = '#C4924A';
  const JOIST_COLOR = 'rgba(180,200,220,0.7)';
  const BEAM_COLOR = 'rgba(200,220,240,0.9)';
  const LEDGER_COLOR = '#4A7EA8';
  const RIM_COLOR = 'rgba(220,235,245,0.95)';

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: '100%', display: 'block' }}>
      <defs>
        {/* Blueprint background gradient */}
        <linearGradient id="fr-bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#0A1628"/>
          <stop offset="100%" stopColor="#0D1E35"/>
        </linearGradient>
        {/* Grid pattern */}
        <pattern id="fr-grid" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(60,120,180,0.15)" strokeWidth="0.5"/>
        </pattern>
        <pattern id="fr-grid-major" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
          <path d="M 100 0 L 0 0 0 100" fill="none" stroke="rgba(60,120,180,0.08)" strokeWidth="1"/>
        </pattern>
        <filter id="fr-glow">
          <feGaussianBlur stdDeviation="2" result="blur"/>
          <feComposite in="SourceGraphic" in2="blur" operator="over"/>
        </filter>
      </defs>

      {/* Background */}
      <rect width={W} height={H} fill="url(#fr-bg)"/>
      <rect width={W} height={H} fill="url(#fr-grid)"/>
      <rect width={W} height={H} fill="url(#fr-grid-major)"/>

      {/* House footprint */}
      <rect x={DX} y={60} width={DW} height={DY-60} fill="rgba(240,234,216,0.06)" stroke="rgba(240,234,216,0.2)" strokeWidth="1.5" strokeDasharray="6 4"/>
      <text x={DX+DW/2} y={DY-60+30} textAnchor="middle" fill="rgba(240,234,216,0.3)" fontSize="11" fontFamily="DM Sans,sans-serif" letterSpacing="0.15em">HOUSE</text>

      {/* For each deck segment: draw framing */}
      {cfg.segments.map(([sx, sy, sw, sh], si) => (
        <g key={si}>
          {/* Ledger board (attached to house side) */}
          <rect x={sx} y={sy} width={sw} height={8} fill={LEDGER_COLOR} opacity="0.9"/>
          <text x={sx+sw/2} y={sy-4} textAnchor="middle" fill={LEDGER_COLOR} fontSize="8"
            fontFamily="DM Sans,sans-serif" letterSpacing="0.1em" opacity="0.8">LEDGER BOARD</text>

          {/* Rim joists (perimeter, except ledger) */}
          <rect x={sx}    y={sy+sh-6} width={sw} height={6} fill={RIM_COLOR}/>
          <rect x={sx}    y={sy}      width={6}  height={sh} fill={RIM_COLOR}/>
          <rect x={sx+sw-6} y={sy}   width={6}  height={sh} fill={RIM_COLOR}/>

          {/* Beams (perpendicular to joists, spanning the depth) */}
          {Array.from({length: Math.floor(sw/BEAM_SPACING)}, (_, bi) => {
            const bx = sx + BEAM_SPACING*(bi+1);
            if (bx >= sx+sw-6) return null;
            return (
              <g key={bi}>
                <rect x={bx-3} y={sy} width={6} height={sh} fill={BEAM_COLOR}/>
                {/* Post at each beam × grade line */}
                <circle cx={bx} cy={sy+sh-3} r={7} fill={POST_COLOR} opacity="0.9"/>
                <circle cx={bx} cy={sy+sh-3} r={4} fill={darken(POST_COLOR,0.2)}/>
                <line x1={bx} y1={sy+sh-3} x2={bx} y2={sy+sh+24} stroke={POST_COLOR} strokeWidth="4" opacity="0.6"/>
              </g>
            );
          })}

          {/* Joists (horizontal, running from ledger to rim joist) */}
          {Array.from({length: Math.floor(sh/JOIST_SPACING)}, (_, ji) => {
            const jy = sy + JOIST_SPACING*(ji+1);
            if (jy >= sy+sh-6) return null;
            return (
              <line key={ji} x1={sx+6} y1={jy} x2={sx+sw-6} y2={jy}
                stroke={JOIST_COLOR} strokeWidth="2" opacity="0.7"/>
            );
          })}

          {/* Corner posts */}
          {[[sx,sy+sh],[sx+sw,sy+sh]].map(([px,py],pi) => (
            <g key={pi}>
              <circle cx={px} cy={py} r={10} fill={POST_COLOR} opacity="0.85"/>
              <circle cx={px} cy={py} r={6}  fill={darken(POST_COLOR,0.25)}/>
              <circle cx={px} cy={py} r={2.5} fill="rgba(255,255,255,0.5)"/>
            </g>
          ))}

          {/* Span dimension annotations */}
          <g opacity="0.6">
            <line x1={sx+6} y1={sy+sh+20} x2={sx+sw-6} y2={sy+sh+20} stroke="rgba(150,200,240,0.5)" strokeWidth="1"/>
            <line x1={sx+6} y1={sy+sh+14}  x2={sx+6}  y2={sy+sh+26} stroke="rgba(150,200,240,0.5)" strokeWidth="1"/>
            <line x1={sx+sw-6} y1={sy+sh+14} x2={sx+sw-6} y2={sy+sh+26} stroke="rgba(150,200,240,0.5)" strokeWidth="1"/>
          </g>
        </g>
      ))}

      {/* Grade line */}
      <line x1={20} y1={cfg.y+cfg.h+28} x2={W-20} y2={cfg.y+cfg.h+28}
        stroke="rgba(100,160,100,0.4)" strokeWidth="1.5" strokeDasharray="4 4"/>
      <text x={24} y={cfg.y+cfg.h+24} fill="rgba(100,160,100,0.5)" fontSize="8" fontFamily="DM Sans,sans-serif" letterSpacing="0.1em">GRADE</text>

      {/* Legend */}
      <g transform={`translate(12,${H-90})`}>
        <rect width={180} height={84} rx="5" fill="rgba(0,0,0,0.5)" stroke="rgba(100,150,200,0.2)" strokeWidth="1"/>
        <text x={90} y={18} textAnchor="middle" fill="rgba(255,255,255,0.7)" fontSize="9" fontFamily="DM Sans,sans-serif" fontWeight="700" letterSpacing="0.1em">FRAMING LEGEND</text>
        {[
          { color: LEDGER_COLOR,  label: 'Ledger Board', y: 32 },
          { color: RIM_COLOR,     label: 'Rim Joist',    y: 46 },
          { color: BEAM_COLOR,    label: 'Beam',         y: 60 },
          { color: POST_COLOR,    label: 'Post',         y: 74 },
        ].map(({ color, label, y }) => (
          <g key={label}>
            <rect x={12} y={y-7} width={16} height={8} rx="1" fill={color} opacity="0.85"/>
            <text x={34} y={y} fill="rgba(200,220,240,0.7)" fontSize="9" fontFamily="DM Sans,sans-serif">{label}</text>
          </g>
        ))}
      </g>

      {/* Label chip */}
      <rect x="12" y="12" width="130" height="27" rx="5" fill="rgba(0,0,0,0.58)"/>
      <text x="77" y="30" textAnchor="middle" fill="rgba(255,255,255,0.92)" fontSize="11.5"
        fontFamily="DM Sans,sans-serif" fontWeight="700" letterSpacing="0.07em">FRAMING PLAN</text>

      {/* Joist spacing note */}
      <text x={W-12} y={H-14} textAnchor="end" fill="rgba(100,150,200,0.4)" fontSize="9"
        fontFamily="DM Sans,sans-serif">Joists 16&quot; O.C. · Beams per local code</text>
    </svg>
  );
}
