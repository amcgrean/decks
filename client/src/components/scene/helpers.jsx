// Shared SVG sub-components: house archetypes, deck boards, railing, environment
// Ported verbatim from BeisserDeckVisualizer.jsx prototype

import { darken, lighten, mix } from '../../utils/color';

// ── WINDOW ─────────────────────────────────────────────────
export function Win({ x, y, w, h, mullion = true, arched = false, double = false }) {
  const fw = 4, fh = 5;
  return (
    <g>
      <rect x={x-fw-2} y={y-fh-2} width={w+fw*2+4} height={h+fh*2+4} fill="rgba(0,0,0,0.28)" rx="2"/>
      <rect x={x-fw} y={y-fh} width={w+fw*2} height={h+fh*2} fill="#D8CCB0" rx="1"/>
      <rect x={x-2} y={y-2} width={w+4} height={h+4} fill="#E8DEC8" rx="1"/>
      {arched ? (
        <path d={`M${x},${y+h*0.45} Q${x},${y} ${x+w/2},${y} Q${x+w},${y} ${x+w},${y+h*0.45} L${x+w},${y+h} L${x},${y+h} Z`}
          fill="url(#g-glass)"/>
      ) : <rect x={x} y={y} width={w} height={h} fill="url(#g-glass)"/>}
      {mullion && !arched && <>
        <rect x={x+w/2-1.5} y={y} width={3} height={h} fill="rgba(255,255,255,0.55)"/>
        <rect x={x} y={y+h*0.48-1} width={w} height={2.5} fill="rgba(255,255,255,0.55)"/>
      </>}
      {double && <>
        <rect x={x+w/3-1} y={y} width={2.5} height={h} fill="rgba(255,255,255,0.5)"/>
        <rect x={x+w*2/3-1} y={y} width={2.5} height={h} fill="rgba(255,255,255,0.5)"/>
        <rect x={x} y={y+h/2-1} width={w} height={2.5} fill="rgba(255,255,255,0.5)"/>
      </>}
      {arched ? (
        <path d={`M${x},${y+h*0.45} Q${x},${y} ${x+w/2},${y} Q${x+w},${y} ${x+w},${y+h*0.45} L${x+w},${y+h} L${x},${y+h} Z`}
          fill="url(#g-glare)" opacity="0.8"/>
      ) : <rect x={x} y={y} width={w} height={h} fill="url(#g-glare)" opacity="0.8"/>}
    </g>
  );
}

// ── CRAFTSMAN HOUSE ─────────────────────────────────────────
function CraftsmanSVG({ W = 900, BY = 342, showDoor = true }) {
  const cx = W/2, L = 78, R = 822, T = 110;
  const rfL = L-22, rfR = R+22, rfPeak = 48;
  const porchR = 348;
  return (
    <g filter="url(#f-house-shadow)">
      <polygon points={`${rfL},${T+2} ${rfR},${T+2} ${rfR-18},${rfPeak} ${rfL+18},${rfPeak}`} fill="url(#g-roof-front)" filter="url(#f-roof)"/>
      <rect x={rfL+16} y={rfPeak-3} width={rfR-rfL-32} height={8} fill={darken('#4A3828',0.2)} rx="2"/>
      <rect x={rfL-6} y={T-2} width={rfR-rfL+12} height={13} fill="#DDD0B0"/>
      {Array.from({length:16},(_,i)=>{const x=rfL+(i+0.5)*((rfR-rfL)/16);return <rect key={i} x={x-4} y={T} width={8} height={26} rx="2" fill="#5A3A1A"/>;} )}
      <polygon points={`${cx-28},${rfPeak+36} ${cx+28},${rfPeak+36} ${cx},${rfPeak+8}`} fill="#2A1E14" opacity="0.55"/>
      <polygon points={`${cx-24},${rfPeak+34} ${cx+24},${rfPeak+34} ${cx},${rfPeak+10}`} fill="#1A1008" opacity="0.7"/>
      <rect x={R-130} y={36} width={54} height={T-22} fill="#8A6E52"/>
      <rect x={R-130} y={36} width={54} height={14} fill="#7A5E42"/>
      <rect x={R-134} y={32} width={62} height={9} fill="#6A4E32" rx="1"/>
      <rect x={R-136} y={30} width={66} height={5} fill="#5A3E22" rx="2"/>
      <rect x={L} y={T} width={R-L} height={BY-T} fill="url(#g-wall-warm)" filter="url(#f-wall)"/>
      {Array.from({length:28},(_,i)=>{const x=L+i*((R-L)/27.5);return <rect key={i} x={x-1.5} y={T} width={3} height={BY-T} fill="rgba(0,0,0,0.06)"/>;} )}
      {Array.from({length:28},(_,i)=>{const x=L+i*((R-L)/27.5)+9;return <rect key={i} x={x-0.5} y={T} width={1.5} height={BY-T} fill="rgba(0,0,0,0.028)"/>;} )}
      <rect x={L} y={T} width={R-L} height={32} fill="url(#g-eave-ao)"/>
      <rect x={L} y={T+(BY-T)*0.52-5} width={R-L} height={10} fill="#E4D8BC"/>
      <rect x={L} y={T+(BY-T)*0.52-5} width={R-L} height={2} fill="rgba(0,0,0,0.1)"/>
      <Win x={445} y={T+32} w={84} h={76}/>
      <Win x={605} y={T+32} w={84} h={76}/>
      <Win x={445} y={T+148} w={84} h={98}/>
      <Win x={605} y={T+148} w={84} h={98}/>
      <polygon points={`${L-18},${T+(BY-T)*0.42} ${porchR+18},${T+(BY-T)*0.42} ${porchR+8},${T+(BY-T)*0.28} ${L+8},${T+(BY-T)*0.28}`} fill="url(#g-roof-front)" filter="url(#f-roof)"/>
      <rect x={L-18} y={T+(BY-T)*0.42-4} width={porchR-L+36} height={12} fill="#DDD0B0"/>
      {Array.from({length:8},(_,i)=>{const x=L+i*((porchR-L)/7.5);return <rect key={i} x={x-3} y={T+(BY-T)*0.42-3} width={7} height={22} rx="2" fill="#5A3A1A"/>;} )}
      <rect x={L} y={T+(BY-T)*0.42} width={porchR-L} height={24} fill="url(#g-eave-ao)"/>
      {Array.from({length:12},(_,i)=>{const y=BY-8+i*3-24;return <rect key={i} x={L} y={y} width={porchR-L} height={3} fill={i%2===0?'#C8BC9A':'#B8AC8A'}/>;} )}
      <rect x={L} y={BY-12} width={porchR-L} height={5} fill={darken('#C0B49A',0.18)}/>
      {[L+48,L+155,L+265].map((cx2,i)=>(
        <g key={i}>
          <rect x={cx2-5} y={BY-16} width={18} height={16} fill="#DED2B0" rx="1"/>
          <polygon points={`${cx2-8},${T+(BY-T)*0.42+14} ${cx2+14},${T+(BY-T)*0.42+14} ${cx2+10},${BY-20} ${cx2-4},${BY-20}`} fill="#DDD4B4"/>
          <rect x={cx2-8} y={T+(BY-T)*0.42+10} width={22} height={6} fill="#D4CAA8" rx="1"/>
          <polygon points={`${cx2-8},${T+(BY-T)*0.42+14} ${cx2+14},${T+(BY-T)*0.42+14} ${cx2+10},${BY-20} ${cx2-4},${BY-20}`} fill="rgba(255,255,255,0.08)"/>
        </g>
      ))}
      <rect x={L+22} y={BY-64} width={porchR-L-44} height={7} fill="#D8D0B4" rx="1"/>
      <rect x={L+22} y={BY-64} width={porchR-L-44} height={2} fill="rgba(255,255,255,0.18)" rx="1"/>
      {Array.from({length:20},(_,i)=>(
        <rect key={i} x={L+26+i*((porchR-L-48)/19)} y={BY-59} width={5} height={46} rx="1" fill="#CDC5A2" opacity="0.9"/>
      ))}
      <rect x={L+44} y={BY}    width={110} height={12} fill="#C4B89A" rx="1"/>
      <rect x={L+52} y={BY+11} width={96}  height={10} fill="#B8AC8E" rx="1"/>
      {showDoor && <g>
        <rect x={L+84} y={BY-120} width={80} height={120} fill="#3A2418" rx="2"/>
        <Win x={L+86} y={BY-118} w={76} h={44} mullion={false} arched={true}/>
        <rect x={L+88} y={BY-70} width={36} height={68} fill="#2A1A0E" rx="1"/>
        <rect x={L+128} y={BY-70} width={35} height={68} fill="#2A1A0E" rx="1"/>
        <circle cx={L+128} cy={BY-34} r={5.5} fill="#C8A030"/>
        <circle cx={L+128} cy={BY-34} r={3.5} fill="#D8B044"/>
      </g>}
    </g>
  );
}

// ── COLONIAL HOUSE ──────────────────────────────────────────
function ColonialSVG({ W = 900, BY = 342, showDoor = true }) {
  const cx = W/2, L = 92, R = 808, T = 88;
  return (
    <g filter="url(#f-house-shadow)">
      <polygon points={`${L-20},${T+4} ${R+20},${T+4} ${cx},${42}`} fill="url(#g-roof-front)" filter="url(#f-roof)"/>
      <line x1={L-20} y1={T+4} x2={cx} y2={42} stroke="#E0D4BC" strokeWidth={6}/>
      <line x1={R+20} y1={T+4} x2={cx} y2={42} stroke="#E0D4BC" strokeWidth={6}/>
      <rect x={L-22} y={T+2} width={R-L+44} height={11} fill="#DDD4BC"/>
      {[cx-155,cx+108].map((chx,i)=>(
        <g key={i}>
          <rect x={chx} y={38} width={48} height={T-26} fill="#8A7060"/>
          <rect x={chx-4} y={34} width={56} height={9} fill="#7A6050" rx="1"/>
          <rect x={chx} y={38} width={48} height={14} fill="#6A5040"/>
          <rect x={chx-6} y={32} width={60} height={5} fill="#5A4030" rx="2"/>
        </g>
      ))}
      <rect x={L} y={T} width={R-L} height={BY-T} fill="url(#g-wall-front)" filter="url(#f-wall)"/>
      {Array.from({length:24},(_,i)=>{const y=T+6+i*((BY-T-6)/23);return <rect key={i} x={L} y={y} width={R-L} height={1.8} fill="rgba(0,0,0,0.055)"/>;} )}
      <rect x={L} y={T} width={R-L} height={28} fill="url(#g-eave-ao)"/>
      <rect x={L}   y={T} width={12} height={BY-T} fill="#E2D8C2"/>
      <rect x={R-12} y={T} width={12} height={BY-T} fill="#D0C8B0"/>
      <rect x={L}   y={T} width={4}  height={BY-T} fill="rgba(255,255,255,0.12)"/>
      <rect x={L} y={T+(BY-T)*0.5-6} width={R-L} height={12} fill="#E0D6C0"/>
      <rect x={L} y={T+(BY-T)*0.5-6} width={R-L} height={3}  fill="rgba(0,0,0,0.1)"/>
      {[150,268,386,512,630,748].map((wx,i)=><Win key={i} x={wx} y={T+24} w={64} h={82}/>)}
      {[124,722].map((wx,i)=><Win key={i} x={wx} y={T+(BY-T)*0.55} w={82} h={106}/>)}
      {[256,598].map((wx,i)=><Win key={`b${i}`} x={wx} y={T+(BY-T)*0.55} w={82} h={106}/>)}
      <polygon points={`${cx-92},${T+(BY-T)*0.52} ${cx+92},${T+(BY-T)*0.52} ${cx},${T+(BY-T)*0.36}`} fill="#E4D8C0"/>
      <polygon points={`${cx-88},${T+(BY-T)*0.52} ${cx+88},${T+(BY-T)*0.52} ${cx},${T+(BY-T)*0.38}`} fill="url(#g-wall-warm)"/>
      {[cx-72,cx-24,cx+24,cx+72].map((colX,i)=>(
        <g key={i}>
          <rect x={colX-7} y={T+(BY-T)*0.52} width={14} height={(BY-T)*0.48} fill="#E8E0CA"/>
          <rect x={colX-7} y={T+(BY-T)*0.52} width={4}  height={(BY-T)*0.48} fill="rgba(255,255,255,0.22)"/>
          <rect x={colX-10} y={T+(BY-T)*0.52-2} width={20} height={8} fill="#DDD4BC" rx="1"/>
          <rect x={colX-10} y={BY-6} width={20} height={8} fill="#DDD4BC" rx="1"/>
        </g>
      ))}
      {showDoor && <g>
        <rect x={cx-38} y={T+(BY-T)*0.53} width={76} height={(BY-T)*0.47} fill="#3A2818" rx="2"/>
        <Win x={cx-36} y={T+(BY-T)*0.535} w={72} h={40} mullion={false} arched={true}/>
        <rect x={cx-2} y={T+(BY-T)*0.535+42} width={4} height={(BY-T)*0.47-44} fill="#2A1A0C"/>
        <circle cx={cx+19} cy={BY-30} r={5.5} fill="#C8A030"/>
        <circle cx={cx+19} cy={BY-30} r={3.5} fill="#D8B044"/>
      </g>}
      <rect x={cx-62} y={BY}    width={124} height={12} fill="#CAC0A6" rx="1"/>
      <rect x={cx-74} y={BY+11} width={148} height={10} fill="#BAB09A" rx="1"/>
    </g>
  );
}

// ── MODERN HOUSE ────────────────────────────────────────────
function ModernSVG({ W = 900, BY = 342, showDoor = true }) {
  const L = 62, R = 838, T = 75;
  const WW = R-L;
  return (
    <g filter="url(#f-house-shadow)">
      <rect x={L-6} y={T-12} width={WW+12} height={25} fill="#32363C"/>
      <rect x={L-6} y={T+11} width={WW+12} height={4}  fill="#3E444A"/>
      <rect x={L-6} y={T-12} width={WW+12} height={6}  fill="#282C30"/>
      <rect x={L} y={T+13} width={WW*0.34} height={BY-T-13} fill="#2C3038" filter="url(#f-wall)"/>
      {Array.from({length:12},(_,i)=>(
        <rect key={i} x={L} y={T+13+i*((BY-T-13)/11.5)} width={WW*0.34} height={2} fill="rgba(255,255,255,0.06)"/>
      ))}
      <Win x={L+20} y={T+25} w={WW*0.22} h={(BY-T-13)*0.44} mullion={false}/>
      <Win x={L+20} y={T+25+(BY-T-13)*0.52} w={WW*0.22} h={(BY-T-13)*0.36} mullion={false}/>
      <rect x={L+WW*0.34} y={T+13} width={WW*0.18} height={BY-T-13} fill="#6898B0" opacity="0.72"/>
      {[1,2,3].map(i=>(
        <rect key={i} x={L+WW*0.34+i*(WW*0.18/4)} y={T+13} width={2.5} height={BY-T-13} fill="rgba(210,230,240,0.5)"/>
      ))}
      {Array.from({length:4},(_,i)=>(
        <rect key={i} x={L+WW*0.34} y={T+13+i*((BY-T-13)/3.5)} width={WW*0.18} height={2} fill="rgba(210,230,240,0.42)"/>
      ))}
      <rect x={L+WW*0.34} y={T+13} width={WW*0.18} height={BY-T-13} fill="url(#g-glare)" opacity="0.55"/>
      <rect x={L+WW*0.52} y={T+13} width={WW*0.48} height={BY-T-13} fill="url(#g-wall-front)" filter="url(#f-wall)"/>
      {Array.from({length:5},(_,i)=>(
        <rect key={i} x={L+WW*0.52} y={T+13+i*((BY-T-13)/4.5)} width={WW*0.48} height={2.5} fill="rgba(0,0,0,0.07)"/>
      ))}
      <Win x={L+WW*0.56} y={T+32} w={WW*0.17} h={(BY-T-13)*0.38} mullion={false}/>
      <Win x={L+WW*0.76} y={T+32} w={WW*0.17} h={(BY-T-13)*0.38} mullion={false}/>
      <Win x={L+WW*0.56} y={T+32+(BY-T-13)*0.52} w={WW*0.17} h={(BY-T-13)*0.36} mullion={false}/>
      <Win x={L+WW*0.76} y={T+32+(BY-T-13)*0.52} w={WW*0.17} h={(BY-T-13)*0.36} mullion={false}/>
      {showDoor && <g>
        <rect x={L+WW*0.52-10} y={BY-124} width={46} height={8} fill="#32363C"/>
        <rect x={L+WW*0.52-8}  y={BY-116} width={2}  height={116} fill="#3E444A"/>
        <rect x={L+WW*0.52-2}  y={BY-116} width={42} height={116} fill="#1C2028" rx="1"/>
        <Win x={L+WW*0.52} y={BY-112} w={38} h={58} mullion={false}/>
        <circle cx={L+WW*0.52+10} cy={BY-38} r={4.5} fill="#909AA4"/>
      </g>}
      <rect x={L} y={T+13} width={WW} height={22} fill="rgba(0,0,0,0.18)"/>
      <rect x={L+WW*0.5-48} y={BY}    width={96}  height={11} fill="#A8A89A" rx="1"/>
      <rect x={L+WW*0.5-60} y={BY+10} width={120} height={9}  fill="#989888" rx="1"/>
    </g>
  );
}

// ── FARMHOUSE ───────────────────────────────────────────────
function FarmhouseSVG({ W = 900, BY = 342, showDoor = true }) {
  const cx = W/2, L = 72, R = 828, T = 92;
  const WW = R-L;
  return (
    <g filter="url(#f-house-shadow)">
      <polygon points={`${L-22},${T+6} ${R+22},${T+6} ${cx},${44}`} fill="url(#g-roof-metal)" filter="url(#f-roof)"/>
      {Array.from({length:20},(_,i)=>{
        const t=(i+0.5)/20;
        const xl=L-22+t*(cx-(L-22));
        return <line key={i} x1={xl} y1={T+6-t*(T+6-44)} x2={cx} y2={44} stroke="rgba(255,255,255,0.07)" strokeWidth="1.5"/>;
      })}
      <rect x={L} y={42} width={WW} height={6} fill="#5A6A6A" rx="2"/>
      <rect x={L-24} y={T+4} width={WW+48} height={12} fill="#E0D8C4"/>
      <rect x={cx+148} y={40} width={50} height={T-28} fill="#8A6A50"/>
      <rect x={cx+144} y={36} width={58} height={9} fill="#7A5A40" rx="1"/>
      <rect x={L} y={T} width={WW} height={BY-T} fill="url(#g-wall-warm)" filter="url(#f-wall)"/>
      {Array.from({length:22},(_,i)=>{const x=L+i*(WW/21.5);return(<g key={i}><rect x={x-2} y={T} width={4} height={BY-T} fill="rgba(0,0,0,0.065)"/><rect x={x+10} y={T} width={2} height={BY-T} fill="rgba(0,0,0,0.03)"/></g>);})}
      <rect x={L} y={T} width={WW} height={30} fill="url(#g-eave-ao)"/>
      <rect x={L-28} y={BY-158} width={WW+56} height={16} fill="url(#g-roof-metal)"/>
      <rect x={L-30} y={BY-160} width={WW+60} height={8} fill="#D8D0BC"/>
      {Array.from({length:24},(_,i)=>{const x=L-22+i*((WW+44)/23);return <rect key={i} x={x-4} y={BY-160} width={8} height={24} rx="2" fill="#5A3A1A"/>;} )}
      <rect x={L-28} y={BY-142} width={WW+56} height={28} fill="url(#g-eave-ao)"/>
      {Array.from({length:9},(_,i)=>{const y=BY-10+i*4-28;return <rect key={i} x={L-28} y={y} width={WW+56} height={4} fill={i%2===0?'#C2B69A':'#B2A68A'}/>;} )}
      {[L+4,L+WW*0.22,L+WW*0.44,L+WW*0.56,L+WW*0.78,R-4].map((cx2,i)=>(
        <g key={i}>
          <rect x={cx2-9} y={BY-142} width={18} height={130} fill="#E4DCC8"/>
          <rect x={cx2-9} y={BY-142} width={5}  height={130} fill="rgba(255,255,255,0.18)"/>
          <rect x={cx2-13} y={BY-144} width={26} height={9}  fill="#DDD5B8" rx="1"/>
          <rect x={cx2-13} y={BY-10}  width={26} height={12} fill="#DDD5B8" rx="1"/>
        </g>
      ))}
      <rect x={L-20} y={BY-74} width={WW+40} height={8} fill="#D8D0B4" rx="1"/>
      {Array.from({length:42},(_,i)=>(
        <rect key={i} x={L-15+i*((WW+30)/41)} y={BY-68} width={5} height={52} rx="1" fill="#CCC4A0" opacity="0.88"/>
      ))}
      {[L+100,L+260,L+WW*0.54,L+WW*0.68].map((wx,i)=><Win key={`u${i}`} x={wx} y={T+26} w={82} h={98}/>)}
      {[L+100,L+WW*0.64].map((wx,i)=><Win key={`l${i}`} x={wx} y={T+168} w={82} h={102}/>)}
      {showDoor && <g>
        <rect x={cx-42} y={T+168} width={84} height={BY-T-168} fill="#3A2418" rx="2"/>
        <Win x={cx-40} y={T+170} w={80} h={46} mullion={false} arched={true}/>
        <rect x={cx-3} y={T+220} width={6} height={BY-T-222} fill="#2A1A0C"/>
        <circle cx={cx+24} cy={BY-28} r={5.5} fill="#C8A030"/>
        <circle cx={cx+24} cy={BY-28} r={3.5} fill="#D8B044"/>
      </g>}
      <rect x={cx-66} y={BY}    width={132} height={12} fill="#C4B8A0" rx="1"/>
      <rect x={cx-78} y={BY+11} width={156} height={10} fill="#B4A890" rx="1"/>
    </g>
  );
}

// ── HOUSE SVG ROUTER ────────────────────────────────────────
export function HouseSVG({ style, showDoor, W, BY }) {
  const doorVisible = showDoor !== false;
  if (style === 'colonial')  return <ColonialSVG  W={W} BY={BY} showDoor={doorVisible}/>;
  if (style === 'modern')    return <ModernSVG    W={W} BY={BY} showDoor={doorVisible}/>;
  if (style === 'farmhouse') return <FarmhouseSVG W={W} BY={BY} showDoor={doorVisible}/>;
  return <CraftsmanSVG W={W} BY={BY} showDoor={doorVisible}/>;
}

// ── DECK BOARDS — procedural with grain filter & perspective-correct spacing ──
export function DeckBoards({ base, shape, W = 900, DECK_Y = 342 }) {
  const b = base || '#9A7E5C';
  const isWrap  = shape === 'wraparound';
  const FASCIA_H = 14;

  // Perspective offset at the near (front) edge — wider = more dramatic 3-D depth
  const PERSP = isWrap ? 36 : 56;

  const deckEdges = {
    rectangle:  { L: W*0.088, R: W*0.912, depth: 148 },
    lshape:     { L: W*0.088, R: W*0.912, depth: 148, lshape: true },
    tshape:     { L: W*0.088, R: W*0.912, depth: 148, tshape: true },
    multilevel: { L: W*0.088, R: W*0.912, depth: 148, upper: true, upperY: DECK_Y-82, upperH: 82 },
    wraparound: { L: W*0.016, R: W*0.984, depth: 148 },
  };
  const e = deckEdges[shape] || deckEdges.rectangle;

  // Clip-path geometry — near (front) edge widens by PERSP on each side
  const mainPath = e.lshape
    ? `M${e.L},${DECK_Y} L${e.R},${DECK_Y} L${e.R},${DECK_Y+e.depth*0.52} L${W*0.56},${DECK_Y+e.depth*0.52} L${W*0.56},${DECK_Y+e.depth} L${e.L},${DECK_Y+e.depth} Z`
    : e.tshape
    ? `M${e.L},${DECK_Y} L${e.R},${DECK_Y} L${e.R},${DECK_Y+e.depth*0.5} L${W*0.64},${DECK_Y+e.depth*0.5} L${W*0.64},${DECK_Y+e.depth} L${W*0.36},${DECK_Y+e.depth} L${W*0.36},${DECK_Y+e.depth*0.5} L${e.L},${DECK_Y+e.depth*0.5} Z`
    : null;
  const mainPoly = !e.lshape && !e.tshape
    ? `${e.L},${DECK_Y} ${e.R},${DECK_Y} ${e.R+PERSP},${DECK_Y+e.depth} ${e.L-PERSP},${DECK_Y+e.depth}`
    : null;

  // ── Perspective-correct board y-positions ─────────────────
  // Horizon at y=190 (eye ≈ 5.5 ft above grade).
  // Far edge (house junction): DECK_Y=342   → 152 px below horizon
  // Near edge (viewer side):   DECK_Y+depth → 300 px below horizon
  // Interpolating in 1/depth space gives foreshortening: near boards are
  // wider-spaced, far boards compressed — exactly as a real camera sees it.
  const yH       = 190;
  const invFar   = 1 / (DECK_Y - yH);                     // 1/152
  const invNear  = 1 / (DECK_Y + e.depth - yH);           // 1/300
  const N_BOARDS = 18;
  const boardYs  = Array.from({ length: N_BOARDS + 1 }, (_, i) => {
    const t = i / N_BOARDS;
    return Math.round(yH + 1 / (invFar + t * (invNear - invFar)));
  });

  // Upper-deck board positions (multilevel shape)
  const invFarU  = e.upper ? 1 / (e.upperY - yH)  : 0;
  const invNearU = e.upper ? 1 / (DECK_Y   - yH)  : 0;
  const N_UP     = 8;
  const upperYs  = e.upper
    ? Array.from({ length: N_UP + 1 }, (_, i) => {
        const t = i / N_UP;
        return Math.round(yH + 1 / (invFarU + t * (invNearU - invFarU)));
      })
    : [];

  return (
    <g>
      <defs>
        <clipPath id="cp-deck-main">
          {(e.lshape || e.tshape) ? <path d={mainPath}/> : <polygon points={mainPoly}/>}
        </clipPath>
        {e.upper && (
          <clipPath id="cp-deck-upper">
            <polygon points={`${W*0.1},${e.upperY} ${W*0.9},${e.upperY} ${W*0.912},${DECK_Y} ${W*0.088},${DECK_Y}`}/>
          </clipPath>
        )}
      </defs>

      {/* ── MAIN DECK SURFACE ── */}
      <g clipPath="url(#cp-deck-main)">
        <rect x={0} y={DECK_Y-12} width={W} height={e.depth+24} fill={b} filter="url(#f-wood)"/>
        {/* Perspective-correct boards: t=0→far/house, t=1→near/viewer */}
        {boardYs.slice(0, -1).map((y, i) => {
          const yNext = boardYs[i + 1];
          const totalH = yNext - y;
          if (totalH <= 0) return null;
          const gapH = Math.max(Math.round(totalH * 0.15), 1);
          const brdH = totalH - gapH;
          return (
            <g key={i}>
              <rect x={0} y={y} width={W} height={brdH}
                fill={i%3===0 ? lighten(b,0.1) : i%3===1 ? b : darken(b,0.05)}/>
              <rect x={0} y={y+brdH} width={W} height={gapH} fill={darken(b, 0.32)}/>
            </g>
          );
        })}
        <rect x={0} y={DECK_Y} width={W} height={e.depth} fill="url(#g-deck-sun)"/>
        <rect x={0} y={DECK_Y} width={W} height={52}      fill="url(#g-deck-shadow)"/>
      </g>

      {/* ── UPPER LEVEL (multi-level) ── */}
      {e.upper && (
        <g clipPath="url(#cp-deck-upper)">
          <rect x={0} y={e.upperY-12} width={W} height={e.upperH+24} fill={lighten(b,0.06)} filter="url(#f-wood)"/>
          {upperYs.slice(0, -1).map((y, i) => {
            const yNext = upperYs[i + 1];
            const totalH = yNext - y;
            if (totalH <= 0) return null;
            const gapH = Math.max(Math.round(totalH * 0.15), 1);
            const brdH = totalH - gapH;
            return (
              <g key={i}>
                <rect x={0} y={y} width={W} height={brdH}
                  fill={i%3===0 ? lighten(b,0.12) : i%3===1 ? lighten(b,0.04) : b}/>
                <rect x={0} y={y+brdH} width={W} height={gapH} fill={darken(b, 0.32)}/>
              </g>
            );
          })}
          <rect x={0} y={e.upperY} width={W} height={40} fill="url(#g-deck-shadow)"/>
          <rect x={W*0.092} y={DECK_Y-10} width={W*0.816} height={13} fill={darken(b,0.42)}/>
          <rect x={W*0.092} y={DECK_Y-3}  width={W*0.816} height={5}  fill={darken(b,0.26)}/>
        </g>
      )}

      {/* ── FASCIA ── */}
      {(e.lshape || e.tshape) ? (
        <>
          <path d={`M${e.L-22},${DECK_Y+e.depth} L${e.R+22},${DECK_Y+e.depth}`}
            stroke={darken(b,0.4)} strokeWidth={FASCIA_H} fill="none"/>
          {e.lshape && <path d={`M${W*0.56},${DECK_Y+e.depth*0.52} L${e.R+22},${DECK_Y+e.depth*0.52}`}
            stroke={darken(b,0.4)} strokeWidth={FASCIA_H} fill="none"/>}
          {e.tshape && <>
            <path d={`M${W*0.36},${DECK_Y+e.depth*0.5} L${e.L-22},${DECK_Y+e.depth*0.5}`}
              stroke={darken(b,0.4)} strokeWidth={FASCIA_H} fill="none"/>
            <path d={`M${W*0.64},${DECK_Y+e.depth*0.5} L${e.R+22},${DECK_Y+e.depth*0.5}`}
              stroke={darken(b,0.4)} strokeWidth={FASCIA_H} fill="none"/>
          </>}
        </>
      ) : (
        <rect x={e.L-PERSP} y={DECK_Y+e.depth} width={e.R-e.L+PERSP*2} height={FASCIA_H+2}
          fill="url(#g-deck-fascia)"/>
      )}

      <ellipse cx={W/2} cy={DECK_Y+e.depth+FASCIA_H+10} rx={W*0.46} ry={18} fill="rgba(0,0,0,0.2)"/>
    </g>
  );
}

// ── RAILING ─────────────────────────────────────────────────
export function Railing({ style, base, shape, W = 900, DECK_Y = 342 }) {
  if (!style || style === 'none') return null;
  const b = base || '#9A7E5C';
  const isWrap = shape === 'wraparound';
  const L = isWrap ? W*0.016 : W*0.088;
  const R = isWrap ? W*0.984 : W*0.912;
  const RH = 72, RT = DECK_Y - RH;
  const capFill = darken('#EAE2D0', 0.04);
  const postFill = darken(b, 0.24);
  const span = R - L;
  const postXs = [L, L+span*0.17, L+span*0.34, L+span*0.5, L+span*0.67, L+span*0.83, R];

  const TopRail = () => (
    <>
      <rect x={L-2} y={RT-8} width={span+4} height={10} fill={capFill} rx="2.5"/>
      <rect x={L-2} y={RT-8} width={span+4} height={3}  fill="rgba(255,255,255,0.2)" rx="2.5"/>
    </>
  );
  const BotRail = () => <rect x={L-2} y={DECK_Y-13} width={span+4} height={9} fill={capFill} rx="2"/>;
  const Posts   = () => <>{postXs.map((x,i) => <rect key={i} x={x-5.5} y={RT-12} width={11} height={RH+12} rx="2.5" fill={postFill}/>)}</>;
  const Caps    = () => <>{postXs.map((x,i) => <rect key={i} x={x-8} y={RT-16} width={16} height={7} rx="2" fill={darken(capFill,0.06)}/>)}</>;

  if (style === 'baluster') {
    const bals = []; for (let x = L+18; x < R-14; x += 13) bals.push(x);
    return (
      <g>
        <BotRail/><TopRail/><Caps/>
        {bals.map((x,i) => <rect key={i} x={x} y={RT+2} width={5} height={RH-22} rx="1.5" fill={darken(capFill,0.14)} opacity="0.95"/>)}
        <Posts/>
      </g>
    );
  }
  if (style === 'cable') {
    const cables = Array.from({length:5}, (_,i) => RT+6+i*14);
    return (
      <g>
        {postXs.map((x,i) => <rect key={i} x={x-4.5} y={RT-10} width={9} height={RH+10} rx="2" fill="#8A9298"/>)}
        {cables.map((cy,i) => (
          <g key={i}>
            <line x1={L} y1={cy} x2={R} y2={cy} stroke="#A0ACB4" strokeWidth="2.8"/>
            <line x1={L} y1={cy} x2={R} y2={cy} stroke="rgba(255,255,255,0.4)" strokeWidth="1"/>
          </g>
        ))}
        <rect x={L-2} y={RT-10} width={span+4} height={8} fill="#8A9298" rx="2"/>
      </g>
    );
  }
  if (style === 'glass') {
    return (
      <g>
        {postXs.slice(0,-1).map((x,i) => (
          <g key={i}>
            <rect x={x+8} y={RT+2} width={postXs[i+1]-x-16} height={RH-18}
              fill="rgba(150,205,228,0.2)" stroke="rgba(175,222,240,0.52)" strokeWidth="1.5" rx="1"/>
            <rect x={x+8} y={RT+2} width={postXs[i+1]-x-16} height={RH-18}
              fill="url(#g-glare)" opacity="0.45" rx="1"/>
          </g>
        ))}
        {postXs.map((x,i) => <rect key={i} x={x-4.5} y={RT-10} width={9} height={RH+10} rx="2" fill="#BBC6CE"/>)}
        <rect x={L-2} y={RT-10} width={span+4} height={8} fill="#BBC6CE" rx="2"/>
      </g>
    );
  }
  if (style === 'horizontal') {
    const boards = Array.from({length:4}, (_,i) => RT+7+i*16);
    return (
      <g>
        <Posts/><Caps/>
        {boards.map((y,i) => (
          <g key={i}>
            <rect x={L+8} y={y} width={span-16} height={11} rx="2" fill={i%2===0 ? darken(b,0.16) : darken(b,0.24)}/>
            <rect x={L+8} y={y} width={span-16} height={3}  rx="2" fill="rgba(255,255,255,0.08)"/>
          </g>
        ))}
        <TopRail/>
      </g>
    );
  }
  return null;
}

// ── ENVIRONMENT (trees, shrubs, sun) ────────────────────────
export function Environment({ W = 900 }) {
  return (
    <g>
      <rect x={22} y={268} width={16} height={104} fill="#4A3018"/>
      <ellipse cx={30}   cy={225} rx={52} ry={44} fill="#2E6C1A"/>
      <ellipse cx={18}   cy={250} rx={36} ry={30} fill="#388020"/>
      <ellipse cx={42}   cy={254} rx={32} ry={26} fill="#307218"/>
      <ellipse cx={30}   cy={204} rx={38} ry={32} fill="#347A22"/>
      <ellipse cx={22}   cy={208} rx={20} ry={16} fill="rgba(255,255,255,0.06)"/>
      <ellipse cx={30}   cy={368} rx={28} ry={10} fill="rgba(0,0,0,0.22)"/>

      <rect x={W-38} y={252} width={16} height={120} fill="#4A3018"/>
      <ellipse cx={W-30} cy={206} rx={58} ry={48} fill="#286418"/>
      <ellipse cx={W-16} cy={236} rx={38} ry={32} fill="#327A1E"/>
      <ellipse cx={W-46} cy={240} rx={36} ry={28} fill="#2C7018"/>
      <ellipse cx={W-30} cy={186} rx={42} ry={36} fill="#307222"/>
      <ellipse cx={W-40} cy={190} rx={22} ry={18} fill="rgba(255,255,255,0.06)"/>
      <ellipse cx={W-30} cy={372} rx={30} ry={10} fill="rgba(0,0,0,0.22)"/>

      {[[96,348,36,22],[120,344,26,18],[W-132,348,36,22],[W-156,344,26,18]].map(([x,y,rx,ry],i) => (
        <ellipse key={i} cx={x} cy={y} rx={rx} ry={ry} fill={i%2===0 ? '#387A22' : '#408428'}/>
      ))}

      <circle cx={W*0.18} cy={68} r={26} fill="rgba(255,245,200,0.22)"/>
      <circle cx={W*0.18} cy={68} r={18} fill="rgba(255,245,200,0.18)"/>
      <circle cx={W*0.18} cy={68} r={10} fill="rgba(255,248,210,0.28)"/>
    </g>
  );
}
