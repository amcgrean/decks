// ─────────────────────────────────────────────────────────
//  BEISSER LUMBER — DECK VISUALIZER
//  Premium SVG illustration · Fully responsive (phone + tablet)
// ─────────────────────────────────────────────────────────
import { useState, useEffect } from "react";

// ── COLOR UTILS ──────────────────────────────────────────
const h2r = h => { const s=(h||"").replace("#",""); return [parseInt(s.slice(0,2),16)||0,parseInt(s.slice(2,4),16)||0,parseInt(s.slice(4,6),16)||0]; };
const r2h = (r,g,b) => "#"+[r,g,b].map(v=>Math.max(0,Math.min(255,Math.round(v))).toString(16).padStart(2,"0")).join("");
const lighten = (h,a) => { if(!h?.startsWith("#")) return h||"#9A7E5C"; const [r,g,b]=h2r(h); return r2h(r+(255-r)*a,g+(255-g)*a,b+(255-b)*a); };
const darken  = (h,a) => { if(!h?.startsWith("#")) return h||"#9A7E5C"; const [r,g,b]=h2r(h); return r2h(r*(1-a),g*(1-a),b*(1-a)); };
const mix = (h1,h2,t) => { const [r1,g1,b1]=h2r(h1),[r2,g2,b2]=h2r(h2); return r2h(r1+(r2-r1)*t,g1+(g2-g1)*t,b1+(b2-b1)*t); };

// ── DATA ────────────────────────────────────────────────
const BRANDS = [
  { id:"trex",         name:"Trex",             bc:"#C4481E", tag:"America's #1 Decking Brand",
    cols:[{n:"Transcend",colors:[{n:"Gravel Path",h:"#9B9087"},{n:"Havana Gold",h:"#C49A4A"},{n:"Island Mist",h:"#B4C0BA"},{n:"Lava Rock",h:"#4A3F3A"},{n:"Rope Swing",h:"#C4A882"},{n:"Spiced Rum",h:"#7A4A2A"},{n:"Tiki Torch",h:"#B87840"},{n:"Tree House",h:"#6B4E37"}]},{n:"Select",colors:[{n:"Saddle",h:"#8B5E3C"},{n:"Pebble Grey",h:"#9BA4A0"},{n:"Woodland Brown",h:"#5C3D28"}]},{n:"Enhance",colors:[{n:"Beach Dune",h:"#C8B898"},{n:"Clam Shell",h:"#D4C4A8"},{n:"Rocky Harbor",h:"#6B7A7A"},{n:"Toasted Sand",h:"#C4A870"}]}]},
  { id:"fiberon",      name:"Fiberon",           bc:"#1E5F98", tag:"Good Wood for the Whole Neighborhood",
    cols:[{n:"Sanctuary",colors:[{n:"Ipe",h:"#3E2412"},{n:"Driftwood",h:"#9E8E7A"},{n:"Seaside Ash",h:"#B0A494"},{n:"Dark Walnut",h:"#4A3020"},{n:"Weathered Teak",h:"#8B7355"}]},{n:"Symmetry",colors:[{n:"Slate Gray",h:"#7A8490"},{n:"Warm Sienna",h:"#A05A30"},{n:"Sandy Beige",h:"#C4A882"},{n:"Pacific Teak",h:"#7B6050"}]},{n:"Paramount",colors:[{n:"Flagstone",h:"#8A8078"},{n:"Sahara",h:"#C0A878"},{n:"Amber",h:"#B87830"}]}]},
  { id:"timbertech",   name:"TimberTech / AZEK", bc:"#103A5A", tag:"Engineered to Last a Lifetime",
    cols:[{n:"AZEK Vintage",colors:[{n:"Brownstone",h:"#614238"},{n:"Coastline",h:"#8A9898"},{n:"Weathered Teak",h:"#8B7355"},{n:"Mahogany",h:"#6A2E1A"}]},{n:"AZEK Harvest",colors:[{n:"Brazilian Walnut",h:"#3D2210"},{n:"Golden Teak",h:"#A87840"},{n:"Tigerwood",h:"#8A4E24"}]},{n:"Pro Reserve",colors:[{n:"Dark Hickory",h:"#4A3020"},{n:"Slate Grey",h:"#70787C"},{n:"Weathered Acacia",h:"#9A7E5C"}]}]},
  { id:"deckorators",  name:"Deckorators",       bc:"#A82820", tag:"Pioneering Outdoor Living",
    cols:[{n:"Voyage",colors:[{n:"Costa",h:"#6A4830"},{n:"Sierra",h:"#A07850"},{n:"Khaya",h:"#8A6040"},{n:"Tundra",h:"#B0A890"},{n:"Sedona",h:"#9A5830"},{n:"Mesa",h:"#C49870"}]},{n:"Vista",colors:[{n:"Driftwood",h:"#A09080"},{n:"Ironwood",h:"#4A3828"},{n:"Silverwood",h:"#8A8E90"},{n:"Dunewood",h:"#C0A87A"}]},{n:"Summit",colors:[{n:"Glacier",h:"#C4C8C4"},{n:"Boulder",h:"#8A7E74"},{n:"Cliffside",h:"#6A5E50"}]}]},
  { id:"wolf",         name:"Wolf",              bc:"#1E4A1E", tag:"Premium Outdoor Living Products",
    cols:[{n:"Serenity",colors:[{n:"Autumn Mist",h:"#B09070"},{n:"Moonlight",h:"#C0BEB8"},{n:"Walnut",h:"#5A3820"},{n:"Toffee",h:"#9A6A3A"}]},{n:"Distinction",colors:[{n:"Driftwood",h:"#9A8870"},{n:"Natural",h:"#C0A870"},{n:"Pecan",h:"#7A5030"}]}]},
  { id:"moistureshield",name:"MoistureShield",   bc:"#0E5A48", tag:"Built for the Elements",
    cols:[{n:"Vantage",colors:[{n:"Brazilia",h:"#4A2810"},{n:"Coastal Grey",h:"#8A9098"},{n:"Island Oak",h:"#8A6038"},{n:"Sand",h:"#C4A87A"}]},{n:"Pro",colors:[{n:"Antique",h:"#7A5830"},{n:"Brown",h:"#5A3820"},{n:"Grey",h:"#78808A"}]},{n:"Infuse",colors:[{n:"Weathered Olive",h:"#7A7A50"},{n:"Driftwood",h:"#A09080"}]}]},
  { id:"armadillo",    name:"Armadillo",          bc:"#5A3010", tag:"Hard as Nails, Beautiful as Wood",
    cols:[{n:"Distinction",colors:[{n:"Charcoal",h:"#3A3A3C"},{n:"Espresso",h:"#2A1A10"},{n:"Driftwood",h:"#9A8870"},{n:"Teak",h:"#8A6038"}]},{n:"Landmark",colors:[{n:"Chestnut",h:"#6A3A1A"},{n:"Aged Oak",h:"#7A6040"},{n:"Redwood",h:"#8A3020"},{n:"Silvered Ash",h:"#A8A498"}]}]},
];
const HOUSE_STYLES = [{id:"craftsman",name:"Craftsman",desc:"Broad eaves & exposed beams"},{id:"colonial",name:"Colonial",desc:"Symmetrical & stately"},{id:"modern",name:"Modern",desc:"Flat roof & clean lines"},{id:"farmhouse",name:"Farmhouse",desc:"Wrap porch & board-batten"}];
const DECK_LAYOUTS = [{id:"rectangle",name:"Rectangle",desc:"Classic & versatile"},{id:"lshape",name:"L-Shape",desc:"Wraps a corner"},{id:"multilevel",name:"Multi-Level",desc:"Two-tier with steps"},{id:"wraparound",name:"Wraparound",desc:"Full-width expanse"}];
const RAILING_STYLES = [{id:"none",name:"No Railing",desc:"Open ground-level look"},{id:"baluster",name:"Classic Baluster",desc:"Traditional spindles"},{id:"cable",name:"Cable Rail",desc:"Modern, unobstructed views"},{id:"glass",name:"Glass Panel",desc:"Seamless panoramic look"},{id:"horizontal",name:"Horizontal Board",desc:"Contemporary linear style"}];
const VIEWS = [{id:"front",label:"Front",icon:"🏠"},{id:"corner",label:"Corner",icon:"📐"},{id:"overhead",label:"Aerial",icon:"🛸"},{id:"detail",label:"Detail",icon:"🔍"}];
const STEPS = ["House Style","Deck Layout","Brand","Color","Railing","Summary"];

// ── MASTER SVG FILTERS & GRADIENTS ───────────────────────
// These are shared across all scene views
function SceneDefs({ base }) {
  const b = base || "#9A7E5C";
  return (
    <defs>
      {/* ── SKY ── */}
      <linearGradient id="g-sky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%"   stopColor="#4A7EA8"/>
        <stop offset="38%"  stopColor="#7AADC8"/>
        <stop offset="72%"  stopColor="#A8CEDF"/>
        <stop offset="100%" stopColor="#C8E0EE"/>
      </linearGradient>
      {/* Horizon warm haze */}
      <linearGradient id="g-horizon" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%"   stopColor="rgba(220,200,165,0)" />
        <stop offset="100%" stopColor="rgba(220,200,165,0.28)"/>
      </linearGradient>
      {/* ── LAWN ── */}
      <linearGradient id="g-lawn" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%"   stopColor="#527A2C"/>
        <stop offset="40%"  stopColor="#447020"/>
        <stop offset="100%" stopColor="#305018"/>
      </linearGradient>
      {/* Lawn sun stripe */}
      <linearGradient id="g-lawn-sun" x1="0" y1="0" x2="0.5" y2="1">
        <stop offset="0%"   stopColor="rgba(255,240,180,0.14)"/>
        <stop offset="100%" stopColor="rgba(255,240,180,0)"/>
      </linearGradient>
      {/* ── HOUSE WALLS (lit from upper-left) ── */}
      <linearGradient id="g-wall-front" x1="0.1" y1="0" x2="0.9" y2="1">
        <stop offset="0%"   stopColor="#F0E8D8"/>
        <stop offset="60%"  stopColor="#E4D8C4"/>
        <stop offset="100%" stopColor="#CECA B0"/>
      </linearGradient>
      <linearGradient id="g-wall-warm" x1="0.05" y1="0" x2="0.95" y2="1">
        <stop offset="0%"   stopColor="#EEE4D0"/>
        <stop offset="100%" stopColor="#D8CDB8"/>
      </linearGradient>
      {/* House side wall in shadow */}
      <linearGradient id="g-wall-side" x1="0" y1="0" x2="1" y2="0.2">
        <stop offset="0%"   stopColor="#C8BC9C"/>
        <stop offset="100%" stopColor="#B0A48A"/>
      </linearGradient>
      {/* ── ROOF ── */}
      <linearGradient id="g-roof-front" x1="0.1" y1="0" x2="0.9" y2="1">
        <stop offset="0%"   stopColor="#5A4838"/>
        <stop offset="35%"  stopColor="#3E3028"/>
        <stop offset="100%" stopColor="#281E16"/>
      </linearGradient>
      <linearGradient id="g-roof-side" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%"   stopColor="#4A3C2C"/>
        <stop offset="100%" stopColor="#38281A"/>
      </linearGradient>
      {/* Metal/standing seam roof for farmhouse */}
      <linearGradient id="g-roof-metal" x1="0.1" y1="0" x2="0.9" y2="1">
        <stop offset="0%"   stopColor="#6A7A7A"/>
        <stop offset="40%"  stopColor="#505E5E"/>
        <stop offset="100%" stopColor="#384444"/>
      </linearGradient>
      {/* ── GLASS WINDOWS ── */}
      <linearGradient id="g-glass" x1="0.1" y1="0" x2="0.6" y2="1">
        <stop offset="0%"   stopColor="#8EC4D8" stopOpacity="0.92"/>
        <stop offset="50%"  stopColor="#5A98B8" stopOpacity="0.85"/>
        <stop offset="100%" stopColor="#3A78A0" stopOpacity="0.95"/>
      </linearGradient>
      {/* Window glare — top-left specular */}
      <linearGradient id="g-glare" x1="0" y1="0" x2="0.8" y2="0.8">
        <stop offset="0%"   stopColor="rgba(255,255,255,0.68)"/>
        <stop offset="32%"  stopColor="rgba(255,255,255,0.15)"/>
        <stop offset="100%" stopColor="rgba(255,255,255,0)"/>
      </linearGradient>
      {/* ── DECK SURFACE ── */}
      <linearGradient id="g-deck-sun" x1="0.12" y1="0" x2="0.88" y2="1">
        <stop offset="0%"   stopColor="rgba(255,245,200,0.12)"/>
        <stop offset="100%" stopColor="rgba(255,245,200,0)"/>
      </linearGradient>
      {/* Deck fascia (front vertical face) */}
      <linearGradient id="g-deck-fascia" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%"   stopColor={darken(b,0.28)}/>
        <stop offset="100%" stopColor={darken(b,0.52)}/>
      </linearGradient>
      {/* AO shadow under house eaves falling onto deck */}
      <linearGradient id="g-deck-shadow" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%"   stopColor="rgba(30,20,10,0.32)"/>
        <stop offset="55%"  stopColor="rgba(30,20,10,0.10)"/>
        <stop offset="100%" stopColor="rgba(30,20,10,0)"/>
      </linearGradient>
      {/* ── ENVIRONMENT ── */}
      <linearGradient id="g-foundation" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%"   stopColor="#8A7A68"/>
        <stop offset="100%" stopColor="#6A5A48"/>
      </linearGradient>
      {/* Eave AO shadow (horizontal band under roof overhang) */}
      <linearGradient id="g-eave-ao" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%"   stopColor="rgba(0,0,0,0.22)"/>
        <stop offset="100%" stopColor="rgba(0,0,0,0)"/>
      </linearGradient>

      {/* ── SVG FILTERS ── */}

      {/* WOOD GRAIN — the key to realistic deck boards
          Asymmetric baseFrequency (very different X vs Y) = long horizontal fiber lines
          Overlay blend preserves base color while adding texture */}
      <filter id="f-wood" x="0%" y="0%" width="100%" height="100%" colorInterpolationFilters="sRGB">
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

      {/* ROOF TEXTURE — shingle or shake appearance */}
      <filter id="f-roof" x="0%" y="0%" width="100%" height="100%" colorInterpolationFilters="sRGB">
        <feTurbulence type="fractalNoise" baseFrequency="0.06 0.03" numOctaves="3" seed="4" result="noise"/>
        <feColorMatrix type="saturate" values="0" in="noise" result="gray"/>
        <feComponentTransfer in="gray" result="c">
          <feFuncR type="linear" slope="0.7" intercept="0.15"/>
          <feFuncG type="linear" slope="0.7" intercept="0.15"/>
          <feFuncB type="linear" slope="0.7" intercept="0.15"/>
        </feComponentTransfer>
        <feBlend in="SourceGraphic" in2="c" mode="multiply" result="b"/>
        <feComposite in="b" in2="SourceGraphic" operator="in"/>
      </filter>

      {/* WALL TEXTURE — subtle stucco / siding grain */}
      <filter id="f-wall" x="0%" y="0%" width="100%" height="100%" colorInterpolationFilters="sRGB">
        <feTurbulence type="fractalNoise" baseFrequency="0.45 0.45" numOctaves="2" seed="11" result="noise"/>
        <feColorMatrix type="saturate" values="0" in="noise" result="gray"/>
        <feComponentTransfer in="gray" result="faint">
          <feFuncA type="linear" slope="0.18"/>
        </feComponentTransfer>
        <feBlend in="SourceGraphic" in2="faint" mode="overlay" result="b"/>
        <feComposite in="b" in2="SourceGraphic" operator="in"/>
      </filter>

      {/* SOFT HOUSE DROP SHADOW */}
      <filter id="f-house-shadow" x="-6%" y="-4%" width="116%" height="122%">
        <feDropShadow dx="5" dy="10" stdDeviation="12" floodColor="rgba(20,14,8,0.42)" floodOpacity="1"/>
      </filter>

      {/* GRASS TEXTURE */}
      <filter id="f-grass" x="0%" y="0%" width="100%" height="100%" colorInterpolationFilters="sRGB">
        <feTurbulence type="fractalNoise" baseFrequency="0.7 0.3" numOctaves="3" seed="19" result="n"/>
        <feColorMatrix type="saturate" values="0.6" in="n" result="g"/>
        <feBlend in="SourceGraphic" in2="g" mode="overlay" result="b"/>
        <feComposite in="b" in2="SourceGraphic" operator="in"/>
      </filter>
    </defs>
  );
}

// ── WINDOW COMPONENT — glass + frame + glare ──────────────
function Win({x,y,w,h,mullion=true,arched=false,double=false}) {
  const fw=4, fh=5;
  const glassFill="url(#g-glass)", glareFill="url(#g-glare)";
  return (
    <g>
      {/* Outer casing shadow */}
      <rect x={x-fw-2} y={y-fh-2} width={w+fw*2+4} height={h+fh*2+4} fill="rgba(0,0,0,0.28)" rx="2"/>
      {/* Outer casing */}
      <rect x={x-fw} y={y-fh} width={w+fw*2} height={h+fh*2} fill="#D8CCB0" rx="1"/>
      {/* Inner sash */}
      <rect x={x-2} y={y-2} width={w+4} height={h+4} fill="#E8DEC8" rx="1"/>
      {/* Glass */}
      {arched ? (
        <path d={`M${x},${y+h*0.45} Q${x},${y} ${x+w/2},${y} Q${x+w},${y} ${x+w},${y+h*0.45} L${x+w},${y+h} L${x},${y+h} Z`}
          fill={glassFill}/>
      ) : <rect x={x} y={y} width={w} height={h} fill={glassFill}/>}
      {/* Mullions */}
      {mullion && !arched && <>
        <rect x={x+w/2-1.5} y={y} width={3} height={h} fill="rgba(255,255,255,0.55)"/>
        <rect x={x} y={y+h*0.48-1} width={w} height={2.5} fill="rgba(255,255,255,0.55)"/>
      </>}
      {double && <>
        <rect x={x+w/3-1} y={y} width={2.5} height={h} fill="rgba(255,255,255,0.5)"/>
        <rect x={x+w*2/3-1} y={y} width={2.5} height={h} fill="rgba(255,255,255,0.5)"/>
        <rect x={x} y={y+h/2-1} width={w} height={2.5} fill="rgba(255,255,255,0.5)"/>
      </>}
      {/* Glare highlight */}
      {arched ? (
        <path d={`M${x},${y+h*0.45} Q${x},${y} ${x+w/2},${y} Q${x+w},${y} ${x+w},${y+h*0.45} L${x+w},${y+h} L${x},${y+h} Z`}
          fill={glareFill} opacity="0.8"/>
      ) : <rect x={x} y={y} width={w} height={h} fill={glareFill} opacity="0.8"/>}
    </g>
  );
}

// ── CRAFTSMAN HOUSE ───────────────────────────────────────
function CraftsmanSVG({W=900, BY=342}) {
  const cx=W/2, L=78, R=822, T=110;
  const rfL=L-22, rfR=R+22, rfPeak=48;
  const porchR=348;
  return (
    <g filter="url(#f-house-shadow)">
      {/* ── MAIN GABLE ROOF ── */}
      <polygon points={`${rfL},${T+2} ${rfR},${T+2} ${rfR-18},${rfPeak} ${rfL+18},${rfPeak}`} fill="url(#g-roof-front)" filter="url(#f-roof)"/>
      {/* Ridge cap */}
      <rect x={rfL+16} y={rfPeak-3} width={rfR-rfL-32} height={8} fill={darken("#4A3828",0.2)} rx="2"/>
      {/* Wide fascia with deep overhang */}
      <rect x={rfL-6} y={T-2} width={rfR-rfL+12} height={13} fill="#DDD0B0"/>
      {/* Rafter tails (exposed beams — craftsman signature) */}
      {Array.from({length:16},(_,i)=>{
        const x=rfL+(i+0.5)*((rfR-rfL)/16);
        return <rect key={i} x={x-4} y={T} width={8} height={26} rx="2" fill="#5A3A1A"/>;
      })}
      {/* Gable vent */}
      <polygon points={`${cx-28},${rfPeak+36} ${cx+28},${rfPeak+36} ${cx},${rfPeak+8}`} fill="#2A1E14" opacity="0.55"/>
      <polygon points={`${cx-24},${rfPeak+34} ${cx+24},${rfPeak+34} ${cx},${rfPeak+10}`} fill="#1A1008" opacity="0.7"/>
      {/* Chimney */}
      <rect x={R-130} y={36} width={54} height={T-22} fill="#8A6E52"/>
      <rect x={R-130} y={36} width={54} height={14} fill="#7A5E42"/>
      <rect x={R-134} y={32} width={62} height={9} fill="#6A4E32" rx="1"/>
      {/* Chimney cap detail */}
      <rect x={R-136} y={30} width={66} height={5} fill="#5A3E22" rx="2"/>

      {/* ── MAIN WALL ── */}
      <rect x={L} y={T} width={R-L} height={BY-T} fill="url(#g-wall-warm)" filter="url(#f-wall)"/>
      {/* Board-and-batten siding */}
      {Array.from({length:28},(_,i)=>{
        const x=L+i*((R-L)/27.5);
        return <rect key={i} x={x-1.5} y={T} width={3} height={BY-T} fill="rgba(0,0,0,0.06)"/>;
      })}
      {Array.from({length:28},(_,i)=>{
        const x=L+i*((R-L)/27.5)+9;
        return <rect key={i} x={x-0.5} y={T} width={1.5} height={BY-T} fill="rgba(0,0,0,0.028)"/>;
      })}
      {/* Eave AO shadow */}
      <rect x={L} y={T} width={R-L} height={32} fill="url(#g-eave-ao)"/>
      {/* Belt course trim */}
      <rect x={L} y={T+(BY-T)*0.52-5} width={R-L} height={10} fill="#E4D8BC"/>
      <rect x={L} y={T+(BY-T)*0.52-5} width={R-L} height={2} fill="rgba(0,0,0,0.1)"/>

      {/* ── UPPER WINDOWS ── */}
      <Win x={445} y={T+32} w={84} h={76}/>
      <Win x={605} y={T+32} w={84} h={76}/>
      {/* ── LOWER WINDOWS ── */}
      <Win x={445} y={T+148} w={84} h={98}/>
      <Win x={605} y={T+148} w={84} h={98}/>

      {/* ── PORCH (left side) ── */}
      {/* Porch roof */}
      <polygon points={`${L-18},${T+(BY-T)*0.42} ${porchR+18},${T+(BY-T)*0.42} ${porchR+8},${T+(BY-T)*0.28} ${L+8},${T+(BY-T)*0.28}`}
        fill="url(#g-roof-front)" filter="url(#f-roof)"/>
      <rect x={L-18} y={T+(BY-T)*0.42-4} width={porchR-L+36} height={12} fill="#DDD0B0"/>
      {/* Porch rafter tails */}
      {Array.from({length:8},(_,i)=>{
        const x=L+i*((porchR-L)/7.5);
        return <rect key={i} x={x-3} y={T+(BY-T)*0.42-3} width={7} height={22} rx="2" fill="#5A3A1A"/>;
      })}
      {/* AO under porch eave */}
      <rect x={L} y={T+(BY-T)*0.42} width={porchR-L} height={24} fill="url(#g-eave-ao)"/>
      {/* Porch floor boards */}
      {Array.from({length:12},(_,i)=>{
        const y=BY-8+i*3-24;
        return <rect key={i} x={L} y={y} width={porchR-L} height={3} fill={i%2===0?"#C8BC9A":"#B8AC8A"}/>;
      })}
      <rect x={L} y={BY-12} width={porchR-L} height={5} fill={darken("#C0B49A",0.18)}/>
      {/* Porch columns — tapered */}
      {[L+48, L+155, L+265].map((cx2,i)=>(
        <g key={i}>
          <rect x={cx2-5} y={BY-16} width={18} height={16} fill="#DED2B0" rx="1"/>
          <polygon points={`${cx2-8},${T+(BY-T)*0.42+14} ${cx2+14},${T+(BY-T)*0.42+14} ${cx2+10},${BY-20} ${cx2-4},${BY-20}`}
            fill="#DDD4B4"/>
          <rect x={cx2-8} y={T+(BY-T)*0.42+10} width={22} height={6} fill="#D4CAA8" rx="1"/>
          <polygon points={`${cx2-8},${T+(BY-T)*0.42+14} ${cx2+14},${T+(BY-T)*0.42+14} ${cx2+10},${BY-20} ${cx2-4},${BY-20}`}
            fill="rgba(255,255,255,0.08)"/>
        </g>
      ))}
      {/* Porch railing */}
      <rect x={L+22} y={BY-64} width={porchR-L-44} height={7} fill="#D8D0B4" rx="1"/>
      <rect x={L+22} y={BY-64} width={porchR-L-44} height={2} fill="rgba(255,255,255,0.18)" rx="1"/>
      {Array.from({length:20},(_,i)=>(
        <rect key={i} x={L+26+i*((porchR-L-48)/19)} y={BY-59} width={5} height={46} rx="1" fill="#CDC5A2" opacity="0.9"/>
      ))}
      {/* Porch steps */}
      <rect x={L+44} y={BY}    width={110} height={12} fill="#C4B89A" rx="1"/>
      <rect x={L+52} y={BY+11} width={96}  height={10} fill="#B8AC8E" rx="1"/>

      {/* ── FRONT DOOR ── */}
      <rect x={L+84} y={BY-120} width={80} height={120} fill="#3A2418" rx="2"/>
      <Win x={L+86} y={BY-118} w={76} h={44} mullion={false} arched={true}/>
      <rect x={L+88} y={BY-70} width={36} height={68} fill="#2A1A0E" rx="1"/>
      <rect x={L+128} y={BY-70} width={35} height={68} fill="#2A1A0E" rx="1"/>
      <circle cx={L+128} cy={BY-34} r={5.5} fill="#C8A030"/>
      <circle cx={L+128} cy={BY-34} r={3.5} fill="#D8B044"/>
    </g>
  );
}

// ── COLONIAL HOUSE ────────────────────────────────────────
function ColonialSVG({W=900, BY=342}) {
  const cx=W/2, L=92, R=808, T=88;
  return (
    <g filter="url(#f-house-shadow)">
      {/* ── ROOF ── */}
      <polygon points={`${L-20},${T+4} ${R+20},${T+4} ${cx},${42}`} fill="url(#g-roof-front)" filter="url(#f-roof)"/>
      {/* Gable trim boards */}
      <line x1={L-20} y1={T+4} x2={cx} y2={42} stroke="#E0D4BC" strokeWidth={6}/>
      <line x1={R+20} y1={T+4} x2={cx} y2={42} stroke="#E0D4BC" strokeWidth={6}/>
      {/* Fascia */}
      <rect x={L-22} y={T+2} width={R-L+44} height={11} fill="#DDD4BC"/>
      {/* Chimneys (symmetrical — colonial must-have) */}
      {[cx-155, cx+108].map((chx,i)=>(
        <g key={i}>
          <rect x={chx} y={38} width={48} height={T-26} fill="#8A7060"/>
          <rect x={chx-4} y={34} width={56} height={9} fill="#7A6050" rx="1"/>
          <rect x={chx} y={38} width={48} height={14} fill="#6A5040"/>
          <rect x={chx-6} y={32} width={60} height={5} fill="#5A4030" rx="2"/>
        </g>
      ))}
      {/* ── MAIN WALL ── */}
      <rect x={L} y={T} width={R-L} height={BY-T} fill="url(#g-wall-front)" filter="url(#f-wall)"/>
      {/* Clapboard siding (horizontal lines) */}
      {Array.from({length:24},(_,i)=>{
        const y=T+6+i*((BY-T-6)/23);
        return <rect key={i} x={L} y={y} width={R-L} height={1.8} fill="rgba(0,0,0,0.055)"/>;
      })}
      {/* Eave AO */}
      <rect x={L} y={T} width={R-L} height={28} fill="url(#g-eave-ao)"/>
      {/* Corner boards */}
      <rect x={L}   y={T} width={12} height={BY-T} fill="#E2D8C2"/>
      <rect x={R-12} y={T} width={12} height={BY-T} fill="#D0C8B0"/>
      <rect x={L}   y={T} width={4} height={BY-T} fill="rgba(255,255,255,0.12)"/>
      {/* Belt / water table at mid-height */}
      <rect x={L} y={T+(BY-T)*0.5-6} width={R-L} height={12} fill="#E0D6C0"/>
      <rect x={L} y={T+(BY-T)*0.5-6} width={R-L} height={3} fill="rgba(0,0,0,0.1)"/>

      {/* ── UPPER FLOOR WINDOWS (6 across) ── */}
      {[150,268,386,512,630,748].map((wx,i)=><Win key={i} x={wx} y={T+24} w={64} h={82}/>)}
      {/* ── LOWER FLOOR WINDOWS ── */}
      {[124,722].map((wx,i)=><Win key={i} x={wx} y={T+(BY-T)*0.55} w={82} h={106}/>)}
      {[256,598].map((wx,i)=><Win key={i} x={wx} y={T+(BY-T)*0.55} w={82} h={106}/>)}

      {/* ── PORTICO ── */}
      {/* Pediment triangle */}
      <polygon points={`${cx-92},${T+(BY-T)*0.52} ${cx+92},${T+(BY-T)*0.52} ${cx},${T+(BY-T)*0.36}`}
        fill="#E4D8C0"/>
      <polygon points={`${cx-88},${T+(BY-T)*0.52} ${cx+88},${T+(BY-T)*0.52} ${cx},${T+(BY-T)*0.38}`}
        fill="url(#g-wall-warm)"/>
      {/* Columns */}
      {[cx-72,cx-24,cx+24,cx+72].map((colX,i)=>(
        <g key={i}>
          <rect x={colX-7} y={T+(BY-T)*0.52} width={14} height={(BY-T)*0.48} fill="#E8E0CA"/>
          <rect x={colX-7} y={T+(BY-T)*0.52} width={4} height={(BY-T)*0.48} fill="rgba(255,255,255,0.22)"/>
          <rect x={colX-10} y={T+(BY-T)*0.52-2} width={20} height={8} fill="#DDD4BC" rx="1"/>
          <rect x={colX-10} y={BY-6} width={20} height={8} fill="#DDD4BC" rx="1"/>
        </g>
      ))}
      {/* Front door */}
      <rect x={cx-38} y={T+(BY-T)*0.53} width={76} height={(BY-T)*0.47} fill="#3A2818" rx="2"/>
      <Win x={cx-36} y={T+(BY-T)*0.535} w={72} h={40} mullion={false} arched={true}/>
      <rect x={cx-2} y={T+(BY-T)*0.535+42} width={4} height={(BY-T)*0.47-44} fill="#2A1A0C"/>
      <circle cx={cx+19} cy={BY-30} r={5.5} fill="#C8A030"/>
      <circle cx={cx+19} cy={BY-30} r={3.5} fill="#D8B044"/>
      {/* Steps */}
      <rect x={cx-62} y={BY}    width={124} height={12} fill="#CAC0A6" rx="1"/>
      <rect x={cx-74} y={BY+11} width={148} height={10} fill="#BAB09A" rx="1"/>
    </g>
  );
}

// ── MODERN HOUSE ──────────────────────────────────────────
function ModernSVG({W=900, BY=342}) {
  const L=62, R=838, T=75;
  const WW=R-L;
  return (
    <g filter="url(#f-house-shadow)">
      {/* ── FLAT ROOF & PARAPET ── */}
      <rect x={L-6} y={T-12} width={WW+12} height={25} fill="#32363C"/>
      <rect x={L-6} y={T+11} width={WW+12} height={4}  fill="#3E444A"/>
      {/* Roof soffit edge */}
      <rect x={L-6} y={T-12} width={WW+12} height={6} fill="#282C30"/>

      {/* ── LEFT MASS — dark metal cladding ── */}
      <rect x={L} y={T+13} width={WW*0.34} height={BY-T-13} fill="#2C3038" filter="url(#f-wall)"/>
      {/* Cladding horizontal joints */}
      {Array.from({length:12},(_,i)=>(
        <rect key={i} x={L} y={T+13+i*((BY-T-13)/11.5)} width={WW*0.34} height={2} fill="rgba(255,255,255,0.06)"/>
      ))}
      {/* Left mass windows — floor-to-ceiling */}
      <Win x={L+20} y={T+25} w={WW*0.22} h={(BY-T-13)*0.44} mullion={false}/>
      <Win x={L+20} y={T+25+(BY-T-13)*0.52} w={WW*0.22} h={(BY-T-13)*0.36} mullion={false}/>

      {/* ── CENTER SECTION — glass curtain wall ── */}
      <rect x={L+WW*0.34} y={T+13} width={WW*0.18} height={BY-T-13} fill="#6898B0" opacity="0.72"/>
      {/* Curtain wall mullions */}
      {[1,2,3].map(i=>(
        <rect key={i} x={L+WW*0.34+i*(WW*0.18/4)} y={T+13} width={2.5} height={BY-T-13} fill="rgba(210,230,240,0.5)"/>
      ))}
      {Array.from({length:4},(_,i)=>(
        <rect key={i} x={L+WW*0.34} y={T+13+i*((BY-T-13)/3.5)} width={WW*0.18} height={2} fill="rgba(210,230,240,0.42)"/>
      ))}
      {/* Curtain wall glare */}
      <rect x={L+WW*0.34} y={T+13} width={WW*0.18} height={BY-T-13} fill="url(#g-glare)" opacity="0.55"/>

      {/* ── RIGHT MASS — light stucco ── */}
      <rect x={L+WW*0.52} y={T+13} width={WW*0.48} height={BY-T-13} fill="url(#g-wall-front)" filter="url(#f-wall)"/>
      {/* Horizontal reveals */}
      {Array.from({length:5},(_,i)=>(
        <rect key={i} x={L+WW*0.52} y={T+13+i*((BY-T-13)/4.5)} width={WW*0.48} height={2.5} fill="rgba(0,0,0,0.07)"/>
      ))}
      {/* Right mass windows */}
      <Win x={L+WW*0.56} y={T+32} w={WW*0.17} h={(BY-T-13)*0.38} mullion={false}/>
      <Win x={L+WW*0.76} y={T+32} w={WW*0.17} h={(BY-T-13)*0.38} mullion={false}/>
      <Win x={L+WW*0.56} y={T+32+(BY-T-13)*0.52} w={WW*0.17} h={(BY-T-13)*0.36} mullion={false}/>
      <Win x={L+WW*0.76} y={T+32+(BY-T-13)*0.52} w={WW*0.17} h={(BY-T-13)*0.36} mullion={false}/>

      {/* ── ENTRANCE CANOPY ── */}
      <rect x={L+WW*0.52-10} y={BY-124} width={46} height={8} fill="#32363C"/>
      <rect x={L+WW*0.52-8} y={BY-116} width={2} height={116} fill="#3E444A"/>
      {/* Door */}
      <rect x={L+WW*0.52-2} y={BY-116} width={42} height={116} fill="#1C2028" rx="1"/>
      <Win x={L+WW*0.52} y={BY-112} w={38} h={58} mullion={false}/>
      <circle cx={L+WW*0.52+10} cy={BY-38} r={4.5} fill="#909AA4"/>

      {/* ── OVERHANGS / ROOF SHADOW ── */}
      <rect x={L} y={T+13} width={WW} height={22} fill="rgba(0,0,0,0.18)"/>

      {/* Steps */}
      <rect x={L+WW*0.5-48} y={BY}    width={96} height={11} fill="#A8A89A" rx="1"/>
      <rect x={L+WW*0.5-60} y={BY+10} width={120} height={9} fill="#989888" rx="1"/>
    </g>
  );
}

// ── FARMHOUSE ─────────────────────────────────────────────
function FarmhouseSVG({W=900, BY=342}) {
  const cx=W/2, L=72, R=828, T=92;
  const WW=R-L;
  return (
    <g filter="url(#f-house-shadow)">
      {/* ── STANDING SEAM METAL ROOF ── */}
      <polygon points={`${L-22},${T+6} ${R+22},${T+6} ${cx},${44}`} fill="url(#g-roof-metal)" filter="url(#f-roof)"/>
      {/* Standing seam lines */}
      {Array.from({length:20},(_,i)=>{
        const t=(i+0.5)/20;
        const xl=L-22+t*(cx-(L-22)); const xr=R+22-t*(R+22-cx);
        const yl=T+6-t*(T+6-44); const yr=T+6-t*(T+6-44);
        return <line key={i} x1={xl} y1={yl} x2={cx} y2={44} stroke="rgba(255,255,255,0.07)" strokeWidth="1.5"/>;
      })}
      {/* Ridge cap */}
      <rect x={L} y={42} width={WW} height={6} fill="#5A6A6A" rx="2"/>
      {/* Fascia */}
      <rect x={L-24} y={T+4} width={WW+48} height={12} fill="#E0D8C4"/>
      {/* Chimney */}
      <rect x={cx+148} y={40} width={50} height={T-28} fill="#8A6A50"/>
      <rect x={cx+144} y={36} width={58} height={9} fill="#7A5A40" rx="1"/>

      {/* ── MAIN WALL ── */}
      <rect x={L} y={T} width={WW} height={BY-T} fill="url(#g-wall-warm)" filter="url(#f-wall)"/>
      {/* Board-and-batten (wider battens on farmhouse) */}
      {Array.from({length:22},(_,i)=>{
        const x=L+i*(WW/21.5);
        return (<g key={i}>
          <rect x={x-2} y={T} width={4} height={BY-T} fill="rgba(0,0,0,0.065)"/>
          <rect x={x+10} y={T} width={2} height={BY-T} fill="rgba(0,0,0,0.03)"/>
        </g>);
      })}
      {/* Eave AO */}
      <rect x={L} y={T} width={WW} height={30} fill="url(#g-eave-ao)"/>

      {/* ── FULL-WIDTH PORCH ── */}
      {/* Porch roof — lower pitch */}
      <rect x={L-28} y={BY-158} width={WW+56} height={16} fill="url(#g-roof-metal)"/>
      <rect x={L-30} y={BY-160} width={WW+60} height={8}  fill="#D8D0BC"/>
      {/* Porch rafter tails */}
      {Array.from({length:24},(_,i)=>{
        const x=L-22+i*((WW+44)/23);
        return <rect key={i} x={x-4} y={BY-160} width={8} height={24} rx="2" fill="#5A3A1A"/>;
      })}
      {/* AO under porch */}
      <rect x={L-28} y={BY-142} width={WW+56} height={28} fill="url(#g-eave-ao)"/>
      {/* Porch deck boards */}
      {Array.from({length:9},(_,i)=>{
        const y=BY-10+i*4-28;
        return <rect key={i} x={L-28} y={y} width={WW+56} height={4} fill={i%2===0?"#C2B69A":"#B2A68A"}/>;
      })}
      {/* Porch columns (6 across) */}
      {[L+4, L+WW*0.22, L+WW*0.44, L+WW*0.56, L+WW*0.78, R-4].map((cx2,i)=>(
        <g key={i}>
          <rect x={cx2-9} y={BY-142} width={18} height={130} fill="#E4DCC8"/>
          <rect x={cx2-9} y={BY-142} width={5} height={130} fill="rgba(255,255,255,0.18)"/>
          <rect x={cx2-13} y={BY-144} width={26} height={9} fill="#DDD5B8" rx="1"/>
          <rect x={cx2-13} y={BY-10} width={26} height={12} fill="#DDD5B8" rx="1"/>
        </g>
      ))}
      {/* Porch railing */}
      <rect x={L-20} y={BY-74} width={WW+40} height={8} fill="#D8D0B4" rx="1"/>
      {Array.from({length:42},(_,i)=>(
        <rect key={i} x={L-15+i*((WW+30)/41)} y={BY-68} width={5} height={52} rx="1" fill="#CCC4A0" opacity="0.88"/>
      ))}

      {/* ── WINDOWS ── */}
      {[L+100, L+260, L+WW*0.54, L+WW*0.68].map((wx,i)=>
        <Win key={`u${i}`} x={wx} y={T+26} w={82} h={98}/>
      )}
      {[L+100, L+WW*0.64].map((wx,i)=>
        <Win key={`l${i}`} x={wx} y={T+168} w={82} h={102}/>
      )}

      {/* ── FRONT DOOR ── */}
      <rect x={cx-42} y={T+168} width={84} height={BY-T-168} fill="#3A2418" rx="2"/>
      <Win x={cx-40} y={T+170} w={80} h={46} mullion={false} arched={true}/>
      <rect x={cx-3} y={T+220} width={6} height={BY-T-222} fill="#2A1A0C"/>
      <circle cx={cx+24} cy={BY-28} r={5.5} fill="#C8A030"/>
      <circle cx={cx+24} cy={BY-28} r={3.5} fill="#D8B044"/>
      {/* Steps */}
      <rect x={cx-66} y={BY}    width={132} height={12} fill="#C4B8A0" rx="1"/>
      <rect x={cx-78} y={BY+11} width={156} height={10} fill="#B4A890" rx="1"/>
    </g>
  );
}

function HouseSVG({style, W, BY}) {
  if (style==="colonial")  return <ColonialSVG  W={W} BY={BY}/>;
  if (style==="modern")    return <ModernSVG    W={W} BY={BY}/>;
  if (style==="farmhouse") return <FarmhouseSVG W={W} BY={BY}/>;
  return <CraftsmanSVG W={W} BY={BY}/>;
}

// ── DECK BOARDS — procedural with grain filter ────────────
function DeckBoards({base, layout, W=900, DECK_Y=342}) {
  const b = base||"#9A7E5C";
  const BH=8.5, SH=1.8, step=BH+SH;
  const isWrap=layout==="wraparound";
  const FASCIA_H=14;

  // Deck edge coordinates
  const deckEdges = {
    rectangle:  {L:W*0.088, R:W*0.912, depth:148},
    lshape:     {L:W*0.088, R:W*0.912, depth:148, lshape:true},
    multilevel: {L:W*0.088, R:W*0.912, depth:148, upper:true, upperY:DECK_Y-82, upperH:82},
    wraparound: {L:W*0.016, R:W*0.984, depth:148},
  };
  const e=deckEdges[layout]||deckEdges.rectangle;

  const mainPath = e.lshape
    ? `M${e.L},${DECK_Y} L${e.R},${DECK_Y} L${e.R},${DECK_Y+e.depth*0.52} L${W*0.56},${DECK_Y+e.depth*0.52} L${W*0.56},${DECK_Y+e.depth} L${e.L},${DECK_Y+e.depth} Z`
    : null;
  const mainPoly = !e.lshape
    ? `${e.L},${DECK_Y} ${e.R},${DECK_Y} ${e.R+(isWrap?18:22)},${DECK_Y+e.depth} ${e.L-(isWrap?18:22)},${DECK_Y+e.depth}`
    : null;
  const numBoards=Math.ceil(e.depth/step)+2;

  return (
    <g>
      <defs>
        <clipPath id="cp-deck-main">
          {e.lshape ? <path d={mainPath}/> : <polygon points={mainPoly}/>}
        </clipPath>
        {e.upper && (
          <clipPath id="cp-deck-upper">
            <polygon points={`${W*0.1},${e.upperY} ${W*0.9},${e.upperY} ${W*0.912},${DECK_Y} ${W*0.088},${DECK_Y}`}/>
          </clipPath>
        )}
      </defs>

      {/* ── MAIN DECK SURFACE ── */}
      <g clipPath="url(#cp-deck-main)">
        {/* Base color with grain filter — the magic */}
        <rect x={0} y={DECK_Y-12} width={W} height={e.depth+24} fill={b} filter="url(#f-wood)"/>
        {/* Board strips with alternating lightness */}
        {Array.from({length:numBoards},(_,i)=>{
          const y=DECK_Y+i*step;
          const variance=((i*17+5)%22)/100; // slight per-board color variation
          const boardColor=mix(b, lighten(b,0.14), variance);
          return (
            <g key={i}>
              <rect x={0} y={y} width={W} height={BH} fill={i%3===0?lighten(b,0.1):i%3===1?b:darken(b,0.05)}/>
              <rect x={0} y={y+BH} width={W} height={SH} fill={darken(b,0.32)}/>
            </g>
          );
        })}
        {/* Sun highlight on near boards */}
        <rect x={0} y={DECK_Y} width={W} height={e.depth} fill="url(#g-deck-sun)"/>
        {/* AO shadow cast by house wall onto deck */}
        <rect x={0} y={DECK_Y} width={W} height={52} fill="url(#g-deck-shadow)"/>
      </g>

      {/* ── UPPER LEVEL ── */}
      {e.upper && (
        <g clipPath="url(#cp-deck-upper)">
          <rect x={0} y={e.upperY-12} width={W} height={e.upperH+24} fill={lighten(b,0.06)} filter="url(#f-wood)"/>
          {Array.from({length:Math.ceil(e.upperH/step)+1},(_,i)=>{
            const y=e.upperY+i*step;
            return (<g key={i}>
              <rect x={0} y={y} width={W} height={BH} fill={i%3===0?lighten(b,0.12):i%3===1?lighten(b,0.04):b}/>
              <rect x={0} y={y+BH} width={W} height={SH} fill={darken(b,0.32)}/>
            </g>);
          })}
          <rect x={0} y={e.upperY} width={W} height={40} fill="url(#g-deck-shadow)"/>
          {/* Step nosing */}
          <rect x={W*0.092} y={DECK_Y-10} width={W*0.816} height={13} fill={darken(b,0.42)}/>
          <rect x={W*0.092} y={DECK_Y-3}  width={W*0.816} height={5}  fill={darken(b,0.26)}/>
        </g>
      )}

      {/* ── FASCIA (front face) ── */}
      {e.lshape ? (
        <>
          <path d={`M${e.L-(22)},${DECK_Y+e.depth} L${e.R+(22)},${DECK_Y+e.depth}`} stroke={darken(b,0.4)} strokeWidth={FASCIA_H} fill="none"/>
          <path d={`M${W*0.56},${DECK_Y+e.depth*0.52} L${e.R+22},${DECK_Y+e.depth*0.52}`} stroke={darken(b,0.4)} strokeWidth={FASCIA_H} fill="none"/>
        </>
      ) : (
        <rect x={e.L-(isWrap?18:22)} y={DECK_Y+e.depth} width={e.R-e.L+(isWrap?36:44)} height={FASCIA_H+2} fill="url(#g-deck-fascia)"/>
      )}

      {/* Cast shadow on lawn */}
      <ellipse cx={W/2} cy={DECK_Y+e.depth+FASCIA_H+10} rx={W*0.42} ry={16} fill="rgba(0,0,0,0.2)"/>
    </g>
  );
}

// ── RAILING ────────────────────────────────────────────────
function Railing({style, base, layout, W=900, DECK_Y=342}) {
  if (!style||style==="none") return null;
  const b=base||"#9A7E5C";
  const isWrap=layout==="wraparound";
  const L = isWrap ? W*0.016 : W*0.088;
  const R = isWrap ? W*0.984 : W*0.912;
  const RH=72, RT=DECK_Y-RH;
  const capFill=darken("#EAE2D0",0.04);
  const postFill=darken(b,0.24);
  const span=R-L;
  const postXs=[L, L+span*0.17, L+span*0.34, L+span*0.5, L+span*0.67, L+span*0.83, R];

  const TopRail=()=><><rect x={L-2} y={RT-8} width={span+4} height={10} fill={capFill} rx="2.5"/><rect x={L-2} y={RT-8} width={span+4} height={3} fill="rgba(255,255,255,0.2)" rx="2.5"/></>;
  const BotRail=()=><rect x={L-2} y={DECK_Y-13} width={span+4} height={9} fill={capFill} rx="2"/>;
  const Posts=()=><>{postXs.map((x,i)=><rect key={i} x={x-5.5} y={RT-12} width={11} height={RH+12} rx="2.5" fill={postFill}/>)}</>;
  const Caps=()=><>{postXs.map((x,i)=><rect key={i} x={x-8} y={RT-16} width={16} height={7} rx="2" fill={darken(capFill,0.06)}/>)}</>;

  if(style==="baluster"){
    const bals=[]; for(let x=L+18;x<R-14;x+=13) bals.push(x);
    return(<g>
      <BotRail/><TopRail/><Caps/>
      {bals.map((x,i)=>(
        <rect key={i} x={x} y={RT+2} width={5} height={RH-22} rx="1.5" fill={darken(capFill,0.14)} opacity="0.95"/>
      ))}
      <Posts/>
    </g>);
  }
  if(style==="cable"){
    const cables=Array.from({length:5},(_,i)=>RT+6+i*14);
    return(<g>
      {postXs.map((x,i)=><rect key={i} x={x-4.5} y={RT-10} width={9} height={RH+10} rx="2" fill="#8A9298"/>)}
      {cables.map((cy,i)=>(
        <g key={i}>
          <line x1={L} y1={cy} x2={R} y2={cy} stroke="#A0ACB4" strokeWidth="2.8"/>
          <line x1={L} y1={cy} x2={R} y2={cy} stroke="rgba(255,255,255,0.4)" strokeWidth="1"/>
        </g>
      ))}
      <rect x={L-2} y={RT-10} width={span+4} height={8} fill="#8A9298" rx="2"/>
    </g>);
  }
  if(style==="glass"){
    return(<g>
      {postXs.slice(0,-1).map((x,i)=>(
        <g key={i}>
          <rect x={x+8} y={RT+2} width={postXs[i+1]-x-16} height={RH-18}
            fill="rgba(150,205,228,0.2)" stroke="rgba(175,222,240,0.52)" strokeWidth="1.5" rx="1"/>
          <rect x={x+8} y={RT+2} width={postXs[i+1]-x-16} height={RH-18}
            fill="url(#g-glare)" opacity="0.45" rx="1"/>
        </g>
      ))}
      {postXs.map((x,i)=><rect key={i} x={x-4.5} y={RT-10} width={9} height={RH+10} rx="2" fill="#BBC6CE"/>)}
      <rect x={L-2} y={RT-10} width={span+4} height={8} fill="#BBC6CE" rx="2"/>
    </g>);
  }
  if(style==="horizontal"){
    const boards=Array.from({length:4},(_,i)=>RT+7+i*16);
    return(<g>
      <Posts/><Caps/>
      {boards.map((y,i)=>(
        <g key={i}>
          <rect x={L+8} y={y} width={span-16} height={11} rx="2" fill={i%2===0?darken(b,0.16):darken(b,0.24)}/>
          <rect x={L+8} y={y} width={span-16} height={3}  rx="2" fill="rgba(255,255,255,0.08)"/>
        </g>
      ))}
      <TopRail/>
    </g>);
  }
  return null;
}

// ── ENVIRONMENT (trees, shrubs, sky details) ────────────────
function Environment({W=900}) {
  return (<g>
    {/* Left tree — offset composition */}
    <rect x={22} y={268} width={16} height={104} fill="#4A3018"/>
    <ellipse cx={22+8} cy={368} rx={28} ry={10} fill="rgba(0,0,0,0.22)"/>
    <ellipse cx={30}   cy={225} rx={52} ry={44} fill="#2E6C1A"/>
    <ellipse cx={18}   cy={250} rx={36} ry={30} fill="#388020"/>
    <ellipse cx={42}   cy={254} rx={32} ry={26} fill="#307218"/>
    <ellipse cx={30}   cy={204} rx={38} ry={32} fill="#347A22"/>
    <ellipse cx={22}   cy={208} rx={20} ry={16} fill="rgba(255,255,255,0.06)"/>

    {/* Right tree */}
    <rect x={W-38} y={252} width={16} height={120} fill="#4A3018"/>
    <ellipse cx={W-30} cy={372} rx={30} ry={10} fill="rgba(0,0,0,0.22)"/>
    <ellipse cx={W-30} cy={206} rx={58} ry={48} fill="#286418"/>
    <ellipse cx={W-16} cy={236} rx={38} ry={32} fill="#327A1E"/>
    <ellipse cx={W-46} cy={240} rx={36} ry={28} fill="#2C7018"/>
    <ellipse cx={W-30} cy={186} rx={42} ry={36} fill="#307222"/>
    <ellipse cx={W-40} cy={190} rx={22} ry={18} fill="rgba(255,255,255,0.06)"/>

    {/* Foundation shrubs */}
    {[[96,348,36,22],[120,344,26,18],[W-132,348,36,22],[W-156,344,26,18]].map(([x,y,rx,ry],i)=>(
      <ellipse key={i} cx={x} cy={y} rx={rx} ry={ry} fill={i%2===0?"#387A22":"#408428"}/>
    ))}

    {/* Sun — subtle warm circle in sky */}
    <circle cx={W*0.18} cy={68} r={26} fill="rgba(255,245,200,0.22)"/>
    <circle cx={W*0.18} cy={68} r={18} fill="rgba(255,245,200,0.18)"/>
    <circle cx={W*0.18} cy={68} r={10} fill="rgba(255,248,210,0.28)"/>
  </g>);
}

// ── FRONT VIEW ────────────────────────────────────────────
function FrontView({houseStyle, deckLayout, deckColor, railingStyle}) {
  const base=deckColor?.h||null;
  const W=900, BY=342;
  return (
    <svg viewBox={`0 0 ${W} 520`} style={{width:"100%",height:"100%",display:"block"}}>
      <SceneDefs base={base}/>
      {/* Sky */}
      <rect width={W} height={520} fill="url(#g-sky)"/>
      {/* Horizon haze */}
      <rect y={260} width={W} height={120} fill="url(#g-horizon)"/>
      {/* Lawn */}
      <rect y={370} width={W} height={150} fill="url(#g-lawn)" filter="url(#f-grass)"/>
      <rect y={370} width={W} height={150} fill="url(#g-lawn-sun)"/>
      {/* Lawn near-shadow under deck */}
      <rect y={370} width={W} height={18} fill="rgba(0,0,0,0.14)"/>
      {/* Foundation / grade */}
      <rect x={W*0.085} y={340} width={W*0.83} height={12} fill="url(#g-foundation)" rx="1"/>
      <rect x={W*0.085} y={349} width={W*0.83} height={5}  fill="rgba(0,0,0,0.14)"/>
      {/* House */}
      <HouseSVG style={houseStyle} W={W} BY={BY}/>
      {/* Deck */}
      <DeckBoards base={base} layout={deckLayout} W={W} DECK_Y={BY}/>
      <Railing style={railingStyle} base={base} layout={deckLayout} W={W} DECK_Y={BY}/>
      {/* Trees in front (composited over) */}
      <Environment W={W}/>
      {/* Walkway */}
      <polygon points={`${W/2-34},${520} ${W/2+34},${520} ${W/2+20},${430} ${W/2-20},${430}`}
        fill="#BEB2A0" opacity="0.58"/>
      {!base && (
        <g>
          <rect x={W/2-188} y={394} width={376} height={58} rx="10" fill="rgba(16,22,14,0.72)"/>
          <text x={W/2} y={419} textAnchor="middle" fill="rgba(255,255,255,0.94)" fontSize="14.5"
            fontFamily="Playfair Display,serif" fontWeight="600" letterSpacing="0.03em">Select a Decking Color</text>
          <text x={W/2} y={438} textAnchor="middle" fill="rgba(255,255,255,0.52)" fontSize="11.5"
            fontFamily="DM Sans,sans-serif">to see your deck come to life</text>
        </g>
      )}
    </svg>
  );
}

// ── CORNER / 3-QUARTER VIEW ────────────────────────────────
function CornerView({houseStyle, deckLayout, deckColor, railingStyle}) {
  const base=deckColor?.h||null;
  const b=base||"#9A7E5C";
  const W=900, BY=342, DECK_BOT=BY+148;
  return (
    <svg viewBox={`0 0 ${W} 520`} style={{width:"100%",height:"100%",display:"block"}}>
      <SceneDefs base={base}/>
      <defs>
        <clipPath id="cv-deck-top">
          <polygon points={`110,${BY} 774,${BY} 796,${DECK_BOT} 88,${DECK_BOT}`}/>
        </clipPath>
      </defs>
      {/* Sky & lawn */}
      <rect width={W} height={520} fill="url(#g-sky)"/>
      <rect y={260} width={W} height={120} fill="url(#g-horizon)"/>
      <rect y={370} width={W} height={150} fill="url(#g-lawn)" filter="url(#f-grass)"/>
      <rect y={370} width={W} height={18} fill="rgba(0,0,0,0.14)"/>
      <ellipse cx={W/2} cy={490} rx={360} ry={18} fill="rgba(0,0,0,0.2)"/>

      {/* ── HOUSE FRONT (slightly shifted left) ── */}
      <g transform="translate(-52,0) scale(0.885,1)">
        <HouseSVG style={houseStyle} W={W} BY={BY}/>
      </g>
      {/* ── HOUSE SIDE WALL ── */}
      <polygon points={`598,64 864,24 864,${BY} 598,${BY}`} fill="url(#g-wall-side)"/>
      {/* Clapboard on side wall */}
      {Array.from({length:18},(_,i)=>{
        const y=64+i*((BY-64)/17.5);
        return <line key={i} x1={598} y1={y} x2={864} y2={y-(64-24)/4} stroke="rgba(0,0,0,0.05)" strokeWidth="1.3"/>;
      })}
      {/* AO shadow on side near corner */}
      <polygon points={`598,64 640,68 640,${BY} 598,${BY}`} fill="rgba(0,0,0,0.12)"/>
      {/* Side windows */}
      {[[626,96,62,74],[736,96,62,74],[626,216,62,84],[736,216,62,84]].map(([x,y,ww,hh],i)=>(
        <g key={i}>
          <rect x={x-5} y={y-5} width={ww+10} height={hh+10} fill="#C0B090" rx="1"/>
          <rect x={x} y={y} width={ww} height={hh} fill="url(#g-glass)"/>
          <rect x={x} y={y} width={ww} height={hh} fill="url(#g-glare)" opacity="0.75"/>
          <rect x={x+ww/2-1.5} y={y} width={3} height={hh} fill="rgba(255,255,255,0.5)"/>
        </g>
      ))}
      {/* Roof right slope (in shadow/angled) */}
      <polygon points={`598,64 864,24 864,26 598,68`} fill={darken("#3A2E24",0.12)}/>
      {/* Foundation */}
      <rect x={W*0.085-50} y={340} width={W*0.72} height={12} fill="url(#g-foundation)" rx="1"/>
      <polygon points={`598,340 864,328 864,340 598,352`} fill="#6A5A48"/>

      {/* ── DECK TOP ── */}
      <g clipPath="url(#cv-deck-top)">
        <rect x={0} y={BY-12} width={W} height={180} fill={b} filter="url(#f-wood)"/>
        {Array.from({length:20},(_,i)=>{
          const t=i/19; const dy=BY+t*148;
          return <line key={i} x1={0} y1={dy} x2={W} y2={dy} stroke={darken(b,0.26)} strokeWidth="1.5" opacity="0.6"/>;
        })}
        {/* Sun highlight band at top edge */}
        <rect x={0} y={BY} width={W} height={24} fill="rgba(255,248,200,0.09)"/>
        {/* AO shadow from house */}
        <rect x={0} y={BY} width={W} height={52} fill="url(#g-deck-shadow)"/>
      </g>
      {/* Deck right face (3D side visible) */}
      <polygon points={`774,${BY} 856,${BY-36} 878,${DECK_BOT-36} 796,${DECK_BOT}`}
        fill="url(#g-deck-fascia)"/>
      {/* Board lines on right face */}
      {Array.from({length:9},(_,i)=>{
        const t=i/8;
        return <line key={i} x1={856} y1={BY-36+t*128} x2={774} y2={BY+t*148}
          stroke={darken(b,0.42)} strokeWidth="1" opacity="0.55"/>;
      })}
      {/* Front fascia */}
      <polygon points={`88,${DECK_BOT} 796,${DECK_BOT} 796,${DECK_BOT+13} 88,${DECK_BOT+13}`}
        fill={darken(b,0.44)}/>
      {/* Right side fascia */}
      <polygon points={`796,${DECK_BOT} 878,${DECK_BOT-36} 878,${DECK_BOT-22} 796,${DECK_BOT+13}`}
        fill={darken(b,0.5)}/>

      {/* ── RAILING (3-quarter simplified) ── */}
      {railingStyle&&railingStyle!=="none"&&(()=>{
        const L=110, R=774, RH=72, RT=BY-RH;
        const pXs=[L,L+(R-L)*0.17,L+(R-L)*0.34,L+(R-L)*0.5,L+(R-L)*0.67,L+(R-L)*0.83,R];
        const capC=darken("#EAE2D0",0.04);
        const postC=darken(b,0.24);
        if(railingStyle==="baluster"){
          const bals=[]; for(let x=L+18;x<R-12;x+=13) bals.push(x);
          return(<g>
            <rect x={L} y={BY-13} width={R-L} height={9} fill={capC} rx="2"/>
            <rect x={L} y={RT-8} width={R-L} height={10} fill={capC} rx="2.5"/>
            {bals.map((x,i)=><rect key={i} x={x} y={RT+2} width={5} height={RH-22} rx="1.5" fill={darken(capC,0.14)} opacity="0.93"/>)}
            {pXs.map((x,i)=><rect key={i} x={x-5.5} y={RT-12} width={11} height={RH+12} rx="2.5" fill={postC}/>)}
          </g>);
        }
        if(railingStyle==="cable"){
          return(<g>
            {pXs.map((x,i)=><rect key={i} x={x-4.5} y={RT-10} width={9} height={RH+10} rx="2" fill="#8A9298"/>)}
            {Array.from({length:5},(_,i)=>{const cy=RT+6+i*14;return(<g key={i}><line x1={L} y1={cy} x2={R} y2={cy} stroke="#A0ACB4" strokeWidth="2.8"/><line x1={L} y1={cy} x2={R} y2={cy} stroke="rgba(255,255,255,0.4)" strokeWidth="1"/></g>);})}
            <rect x={L} y={RT-10} width={R-L} height={8} fill="#8A9298" rx="2"/>
          </g>);
        }
        if(railingStyle==="glass"){
          return(<g>
            {pXs.slice(0,-1).map((x,i)=><rect key={i} x={x+8} y={RT+2} width={pXs[i+1]-x-16} height={RH-18}
              fill="rgba(150,205,228,0.2)" stroke="rgba(175,222,240,0.52)" strokeWidth="1.5" rx="1"/>)}
            {pXs.map((x,i)=><rect key={i} x={x-4.5} y={RT-10} width={9} height={RH+10} rx="2" fill="#BBC6CE"/>)}
            <rect x={L} y={RT-10} width={R-L} height={8} fill="#BBC6CE" rx="2"/>
          </g>);
        }
        if(railingStyle==="horizontal"){
          return(<g>
            {pXs.map((x,i)=><rect key={i} x={x-5.5} y={RT-12} width={11} height={RH+12} rx="2.5" fill={darken(b,0.24)}/>)}
            {Array.from({length:4},(_,i)=>{const y=RT+7+i*16;return(<g key={i}><rect x={L+8} y={y} width={R-L-16} height={11} rx="2" fill={i%2===0?darken(b,0.16):darken(b,0.24)}/><rect x={L+8} y={y} width={R-L-16} height={3} rx="2" fill="rgba(255,255,255,0.08)"/></g>);})}
            <rect x={L} y={RT-8} width={R-L} height={10} fill={darken(b,0.28)} rx="2.5"/>
          </g>);
        }
        return null;
      })()}

      {/* Left tree */}
      <rect x={18} y={274} width={14} height={96} fill="#4A3018"/>
      <ellipse cx={25} cy={230} rx={46} ry={40} fill="#2E6C1A"/>
      <ellipse cx={14} cy={256} rx={32} ry={28} fill="#388020"/>
      <ellipse cx={36} cy={260} rx={30} ry={24} fill="#307218"/>
      <ellipse cx={25} cy={210} rx={34} ry={30} fill="#347A22"/>

      {!base && (
        <g>
          <rect x={W/2-170} y={400} width={340} height={54} rx="9" fill="rgba(16,22,14,0.72)"/>
          <text x={W/2} y={424} textAnchor="middle" fill="rgba(255,255,255,0.94)" fontSize="14"
            fontFamily="Playfair Display,serif" fontWeight="600">Select a Color to Preview</text>
          <text x={W/2} y={442} textAnchor="middle" fill="rgba(255,255,255,0.5)" fontSize="11"
            fontFamily="DM Sans,sans-serif">corner angle view</text>
        </g>
      )}
    </svg>
  );
}

// ── OVERHEAD / AERIAL VIEW ─────────────────────────────────
function OverheadView({deckLayout, deckColor, railingStyle}) {
  const base=deckColor?.h||null;
  const b=base||"#9A7E5C";
  const W=900;
  const dark=darken(b,0.26), edge=darken(b,0.42);

  const shapes={
    rectangle:  [[90,318,720,152]],
    lshape:     [[90,318,720,74],[90,392,356,78]],
    multilevel: [[108,268,684,100],[90,336,720,136]],
    wraparound: [[18,318,864,152]],
  };
  const decks=shapes[deckLayout]||shapes.rectangle;

  return (
    <svg viewBox={`0 0 ${W} 520`} style={{width:"100%",height:"100%",display:"block"}}>
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
      </defs>

      {/* Ground */}
      <rect width={W} height={520} fill="url(#p-grass)"/>
      {/* Shadow under house+deck complex */}
      <ellipse cx={W/2} cy={492} rx={W*0.46} ry={24} fill="rgba(0,0,0,0.18)"/>

      {/* Deck footprints */}
      {decks.map(([dx,dy,dw,dh],si)=>(
        <g key={si} filter="url(#f-deck-top-shadow)">
          {/* Base with grain */}
          <rect x={dx} y={dy} width={dw} height={dh} fill={b} filter="url(#f-wood)"/>
          {/* Board stripes */}
          {Array.from({length:Math.ceil(dh/10)+1},(_,i)=>(
            <rect key={i} x={dx} y={dy+i*10} width={dw} height={9} fill={i%3===0?lighten(b,0.1):i%3===1?b:darken(b,0.04)}/>
          ))}
          {Array.from({length:Math.ceil(dh/10)+1},(_,i)=>(
            <rect key={i} x={dx} y={dy+i*10} width={dw} height={1.6} fill={dark} opacity="0.7"/>
          ))}
          {/* Fascia */}
          <rect x={dx}    y={dy}    width={dw} height={9}  fill={edge}/>
          <rect x={dx}    y={dy+dh-9} width={dw} height={9}  fill={darken(edge,0.1)}/>
          <rect x={dx}    y={dy}    width={9}  height={dh} fill={darken(edge,0.06)}/>
          <rect x={dx+dw-9} y={dy}  width={9}  height={dh} fill={darken(edge,0.06)}/>
          {/* Sun gloss stripe */}
          <rect x={dx} y={dy} width={dw} height={dh} fill="url(#g-deck-sun)"/>
        </g>
      ))}

      {/* Railing posts from above */}
      {railingStyle&&railingStyle!=="none"&&(()=>{
        const [dx,dy,dw,dh]=decks[0];
        const sp=78;
        const pts=[];
        for(let px=dx;px<=dx+dw;px+=sp){pts.push([px,dy]);pts.push([px,dy+dh]);}
        for(let py=dy+sp;py<dy+dh;py+=sp){pts.push([dx,py]);pts.push([dx+dw,py]);}
        return pts.map(([px,py],i)=>(
          <circle key={i} cx={px} cy={py} r={5.5} fill={darken(b,0.34)} stroke={darken(b,0.5)} strokeWidth="1.5"/>
        ));
      })()}

      {/* House footprint */}
      <g filter="url(#f-house-top-shadow)">
        <rect x="90" y="68" width="720" height="252" fill="#EEE8D8" stroke="#CABC9C" strokeWidth="2"/>
        {/* Ridge */}
        <rect x="90" y="68" width="720" height="14" fill="#3A2C22"/>
        <line x1="90" y1="110" x2="810" y2="110" stroke="#3A2C22" strokeWidth="5" opacity="0.3"/>
        {/* Floor plan hints */}
        <line x1="90" y1="198" x2="810" y2="198" stroke="#CABC9C" strokeWidth="2" opacity="0.45"/>
        {/* Chimney footprint */}
        <rect x="578" y="70" width="44" height="38" fill="#8A6E52" stroke="#5A4830" strokeWidth="1.5"/>
        {/* Windows row */}
        {[148,268,388,512,634,752].map((wx,i)=>(
          <rect key={i} x={wx} y={296} width={58} height={18} rx="2.5" fill="#5A88A0" stroke="#4878908" strokeWidth="1" opacity="0.9"/>
        ))}
        {/* Door */}
        <rect x="408" y="310" width="68" height="10" rx="2.5" fill="#3A2818" stroke="#2A1810" strokeWidth="1"/>
        {/* Siding direction hint */}
        {Array.from({length:8},(_,i)=>(
          <line key={i} x1="90" y1={80+i*22} x2="810" y2={80+i*22} stroke="rgba(180,170,150,0.3)" strokeWidth="1"/>
        ))}
      </g>

      {/* Pathway */}
      <polygon points={`${W/2-26},${520} ${W/2+26},${520} ${W/2+14},${474} ${W/2-14},${474}`}
        fill="#C2B6A0" opacity="0.68"/>

      {/* Compass rose */}
      <g transform={`translate(${W-58},56)`}>
        <circle r="30" fill="rgba(255,255,255,0.16)" stroke="rgba(255,255,255,0.52)" strokeWidth="1.5"/>
        <polygon points="0,-22 3.5,0 0,-5 -3.5,0" fill="white"/>
        <polygon points="0,22 3.5,0 0,5 -3.5,0" fill="rgba(255,255,255,0.38)"/>
        <text x="0" y="-10" textAnchor="middle" fill="white" fontSize="11" fontFamily="DM Sans,sans-serif" fontWeight="700">N</text>
        <text x="0" y="20" textAnchor="middle" fill="rgba(255,255,255,0.5)" fontSize="8.5" fontFamily="DM Sans,sans-serif">S</text>
        <text x="-18" y="4" textAnchor="middle" fill="rgba(255,255,255,0.5)" fontSize="8.5" fontFamily="DM Sans,sans-serif">W</text>
        <text x="18" y="4" textAnchor="middle" fill="rgba(255,255,255,0.5)" fontSize="8.5" fontFamily="DM Sans,sans-serif">E</text>
      </g>

      {/* Label */}
      <rect x="12" y="12" width="112" height="27" rx="5" fill="rgba(0,0,0,0.54)"/>
      <text x="68" y="30" textAnchor="middle" fill="rgba(255,255,255,0.92)" fontSize="11.5"
        fontFamily="DM Sans,sans-serif" fontWeight="700" letterSpacing="0.07em">AERIAL PLAN</text>

      {!base&&(<g>
        <rect x={W/2-146} y={426} width={292} height={44} rx="8" fill="rgba(0,0,0,0.52)"/>
        <text x={W/2} y={451} textAnchor="middle" fill="rgba(255,255,255,0.9)" fontSize="13"
          fontFamily="DM Sans,sans-serif" fontWeight="700">SELECT COLOR TO PREVIEW</text>
      </g>)}
    </svg>
  );
}

// ── BOARD DETAIL VIEW — macro close-up ────────────────────
function DetailView({deckColor, railingStyle}) {
  const c=deckColor?.h||null;
  const base=c||"#9A7E5C";
  const bW=78, seamW=5, step=bW+seamW;
  const numBoards=Math.ceil(900/step)+2;
  const SH=438;

  return (
    <svg viewBox="0 0 900 520" style={{width:"100%",height:"100%",display:"block"}}>
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
        {/* THE WOOD GRAIN FILTER — asymmetric for fiber lines */}
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
        {/* Floor shadow */}
        <rect x="0" y={SH} width="908" height="44" fill="rgba(0,0,0,0.65)"/>

        {/* Boards */}
        {Array.from({length:numBoards},(_,bi)=>{
          const x=bi*step-(step/2);
          // Per-board color variation — makes each board look individually unique
          const variance=((bi*41+13)%32)/100;
          const variance2=((bi*23+7)%20)/100;
          const bColor = bi%7===0 ? darken(base,0.06+variance2*0.08)
                       : bi%7===3 ? lighten(base,0.04+variance*0.12)
                       : mix(base, lighten(base,0.16), variance*0.6);
          const seamC = darken(base,0.58);

          return (<g key={bi}>
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
            {/* Screw fasteners — detailed */}
            {[86, 248, 410].map((fy,fi)=>(
              <g key={fi}>
                {/* Screw recess shadow */}
                <ellipse cx={x+bW/2} cy={fy} rx={5.5} ry={3} fill="rgba(0,0,0,0.55)"/>
                {/* Screw head */}
                <ellipse cx={x+bW/2} cy={fy} rx={4} ry={2.2} fill={darken(bColor,0.28)}/>
                {/* Drive slot — Phillips cross */}
                <line x1={x+bW/2-2.8} y1={fy} x2={x+bW/2+2.8} y2={fy} stroke="rgba(0,0,0,0.45)" strokeWidth="1.1"/>
                <line x1={x+bW/2} y1={fy-2.4} x2={x+bW/2} y2={fy+2.4} stroke="rgba(0,0,0,0.45)" strokeWidth="1.1"/>
                {/* Screw head glint */}
                <ellipse cx={x+bW/2-1} cy={fy-0.9} rx={1.6} ry={0.9} fill="rgba(255,255,255,0.2)"/>
              </g>
            ))}
          </g>);
        })}

        {/* Expansion gap lines across board run */}
        {[126,274,422].map((gy,i)=>(
          <g key={i}>
            <rect x="0" y={gy}   width="908" height="3.5" fill="rgba(0,0,0,0.38)"/>
            <rect x="0" y={gy+3.5} width="908" height="1.2" fill="rgba(255,255,255,0.06)"/>
          </g>
        ))}
      </g>

      {/* Railing post glimpse */}
      {railingStyle&&railingStyle!=="none"&&(
        <g opacity="0.7">
          {[46,330,614].map((px,i)=>(
            <g key={i}>
              <rect x={px} y={18} width={22} height={520} rx="5" fill={darken(base,0.36)}/>
              <rect x={px} y={18} width={6}  height={520} fill="rgba(255,255,255,0.1)" rx="5"/>
              <rect x={px-6}  y={16} width={34} height={18} rx="4" fill="#D8D0B8"/>
              <rect x={px-6}  y={16} width={34} height={7}  rx="4" fill="#E8E0C8"/>
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

      {/* Color swatch */}
      {c && (
        <g>
          <rect x="720" y="452" width="168" height="56" rx="9" fill="rgba(0,0,0,0.68)" stroke="rgba(255,255,255,0.1)" strokeWidth="1"/>
          <rect x="733" y="463" width="28" height="34" rx="4" fill={c} stroke="rgba(255,255,255,0.2)" strokeWidth="1"/>
          <text x="770" y="476" fill="rgba(255,255,255,0.94)" fontSize="11.5" fontFamily="DM Sans,sans-serif" fontWeight="700">{deckColor?.n}</text>
          <text x="770" y="493" fill="rgba(255,255,255,0.44)" fontSize="9.5" fontFamily="DM Sans,sans-serif">{c.toUpperCase()}</text>
        </g>
      )}

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

// ── SCENE ROUTER ──────────────────────────────────────────
function Scene({houseStyle, deckLayout, deckColor, railingStyle, view}) {
  const p={houseStyle, deckLayout, deckColor, railingStyle};
  if(view==="corner")   return <CornerView   {...p}/>;
  if(view==="overhead") return <OverheadView {...p}/>;
  if(view==="detail")   return <DetailView   deckColor={deckColor} railingStyle={railingStyle}/>;
  return <FrontView {...p}/>;
}

// ── STEP COMPONENTS ────────────────────────────────────────
const T = { // shared style tokens
  card: (sel, accent) => ({
    padding:"13px 12px", border:`2px solid ${sel?(accent||"#1E3A2C"):"#D8D0C0"}`,
    cursor:"pointer", textAlign:"left", transition:"all 0.18s", borderRadius:"10px",
    background: sel?(accent?accent+"1C":"#1E3A2C"):"white",
    boxShadow: sel?`0 4px 14px ${accent||"#1E3A2C"}35`:"0 1px 4px rgba(0,0,0,0.07)",
  }),
  cardLabel: (sel, accent) => ({
    fontSize:"13px", fontWeight:"700", fontFamily:"DM Sans,sans-serif",
    color: sel?(accent||"white"):"#1A1A18", marginBottom:"3px",
  }),
  cardSub: sel => ({
    fontSize:"11px", fontFamily:"DM Sans,sans-serif",
    color: sel?"rgba(255,255,255,0.7)":"#7A7A78", lineHeight:"1.4",
  }),
};

function StepHouseStyle({sel, onSel}) {
  return (<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"10px"}}>
    {HOUSE_STYLES.map(h=>(
      <button key={h.id} onClick={()=>onSel(h.id)} style={T.card(sel===h.id)}>
        <div style={T.cardLabel(sel===h.id)}>{h.name}</div>
        <div style={T.cardSub(sel===h.id)}>{h.desc}</div>
      </button>
    ))}
  </div>);
}
function StepDeckLayout({sel, onSel}) {
  const icons={rectangle:"▬",lshape:"⌐",multilevel:"☰",wraparound:"═"};
  return (<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"10px"}}>
    {DECK_LAYOUTS.map(d=>(
      <button key={d.id} onClick={()=>onSel(d.id)} style={T.card(sel===d.id)}>
        <div style={{fontSize:"19px",marginBottom:"5px",opacity:0.65}}>{icons[d.id]}</div>
        <div style={T.cardLabel(sel===d.id)}>{d.name}</div>
        <div style={T.cardSub(sel===d.id)}>{d.desc}</div>
      </button>
    ))}
  </div>);
}
function StepBrand({sel, onSel}) {
  return (<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"9px"}}>
    {BRANDS.map(b=>(
      <button key={b.id} onClick={()=>onSel(b.id)} style={T.card(sel===b.id, b.bc)}>
        <div style={{display:"flex",alignItems:"center",gap:"7px",marginBottom:"3px"}}>
          <div style={{width:"9px",height:"9px",borderRadius:"50%",background:b.bc,flexShrink:0}}/>
          <span style={{fontSize:"12px",fontWeight:"700",fontFamily:"DM Sans,sans-serif",
            color:sel===b.id?b.bc:"#1A1A18"}}>{b.name}</span>
        </div>
        <div style={{fontSize:"9.5px",fontFamily:"DM Sans,sans-serif",color:"#888",lineHeight:"1.35"}}>{b.tag}</div>
      </button>
    ))}
  </div>);
}
function StepColor({brandId, selCol, selColor, onSelCol, onSelColor}) {
  const brand=BRANDS.find(b=>b.id===brandId);
  if(!brand) return <p style={{color:"#8A8A88",fontFamily:"DM Sans,sans-serif",fontSize:"13px",padding:"24px 0",textAlign:"center"}}>← Select a brand first</p>;
  const active=brand.cols.find(c=>c.n===selCol)||brand.cols[0];
  return (<div>
    <div style={{display:"flex",gap:"7px",flexWrap:"wrap",marginBottom:"16px"}}>
      {brand.cols.map(c=>(
        <button key={c.n} onClick={()=>onSelCol(c.n)} style={{
          padding:"6px 13px",borderRadius:"20px",border:`2px solid ${active.n===c.n?brand.bc:"#D8D0C0"}`,
          fontSize:"11.5px",fontFamily:"DM Sans,sans-serif",fontWeight:"600",cursor:"pointer",transition:"all 0.15s",
          background:active.n===c.n?brand.bc:"white",color:active.n===c.n?"white":"#4A4A48",
        }}>{c.n}</button>
      ))}
    </div>
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(70px,1fr))",gap:"9px"}}>
      {active.colors.map(color=>(
        <button key={color.n} onClick={()=>onSelColor(color)} title={color.n} style={{
          border:`3px solid ${selColor?.n===color.n?brand.bc:"transparent"}`,
          borderRadius:"8px",cursor:"pointer",padding:0,overflow:"hidden",transition:"all 0.15s",
          boxShadow:selColor?.n===color.n?`0 0 0 2px white,0 0 0 4px ${brand.bc}`:"0 2px 7px rgba(0,0,0,0.2)",
          transform:selColor?.n===color.n?"scale(1.1)":"scale(1)",
        }}>
          <div style={{height:"50px",background:color.h}}/>
          <div style={{padding:"5px 3px",background:"white",textAlign:"center"}}>
            <div style={{fontSize:"9px",fontFamily:"DM Sans,sans-serif",fontWeight:"600",
              color:"#2A2A28",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{color.n}</div>
          </div>
        </button>
      ))}
    </div>
  </div>);
}
function StepRailing({sel, onSel}) {
  return (<div style={{display:"flex",flexDirection:"column",gap:"9px"}}>
    {RAILING_STYLES.map(r=>(
      <button key={r.id} onClick={()=>onSel(r.id)} style={{
        ...T.card(sel===r.id),display:"flex",alignItems:"center",gap:"12px",
      }}>
        <div style={{width:"11px",height:"11px",borderRadius:"50%",flexShrink:0,
          background:sel===r.id?"#C4924A":"#D8D0C0"}}/>
        <div>
          <div style={T.cardLabel(sel===r.id)}>{r.name}</div>
          <div style={T.cardSub(sel===r.id)}>{r.desc}</div>
        </div>
      </button>
    ))}
  </div>);
}
function StepSummary({sel, onRestart}) {
  const [email,setEmail]=useState("");
  const [sent,setSent]=useState(false);
  const brand=BRANDS.find(b=>b.id===sel.brand);
  const rows=[
    {l:"House Style",v:HOUSE_STYLES.find(h=>h.id===sel.houseStyle)?.name},
    {l:"Deck Layout",v:DECK_LAYOUTS.find(d=>d.id===sel.deckLayout)?.name},
    {l:"Brand",v:brand?.name},{l:"Collection",v:sel.collection},
    {l:"Color",v:sel.color?.n},
    {l:"Railing",v:RAILING_STYLES.find(r=>r.id===sel.railing)?.name},
  ].filter(r=>r.v);
  if(sent) return(
    <div style={{textAlign:"center",padding:"28px 0"}}>
      <div style={{fontSize:"38px",marginBottom:"12px"}}>✉️</div>
      <div style={{fontFamily:"Playfair Display,serif",fontSize:"20px",color:"#1E3A2C",marginBottom:"8px"}}>Design Sent!</div>
      <p style={{fontFamily:"DM Sans,sans-serif",fontSize:"13px",color:"#6A6A68",marginBottom:"22px",lineHeight:"1.6"}}>
        Sent to <strong>{email}</strong>.<br/>Bring to any Beisser Lumber location.
      </p>
      <button onClick={onRestart} style={{padding:"10px 22px",background:"#1E3A2C",color:"white",
        border:"none",borderRadius:"8px",fontFamily:"DM Sans,sans-serif",fontWeight:"700",fontSize:"13px",cursor:"pointer"}}>
        Start Over
      </button>
    </div>
  );
  return (<div>
    {sel.color&&(
      <div style={{display:"flex",alignItems:"center",gap:"12px",marginBottom:"18px",padding:"12px",
        background:"white",borderRadius:"10px",border:"1px solid #E0D8C8"}}>
        <div style={{width:"46px",height:"46px",borderRadius:"7px",background:sel.color.h,
          flexShrink:0,boxShadow:"0 2px 8px rgba(0,0,0,0.24)"}}/>
        <div>
          <div style={{fontFamily:"Playfair Display,serif",fontSize:"14px",color:"#1A1A18",marginBottom:"2px"}}>{sel.color.n}</div>
          <div style={{fontFamily:"DM Sans,sans-serif",fontSize:"11px",color:"#8A8A88"}}>{brand?.name} · {sel.collection}</div>
        </div>
      </div>
    )}
    <div style={{marginBottom:"18px"}}>
      {rows.map((r,i)=>(
        <div key={i} style={{display:"flex",justifyContent:"space-between",padding:"9px 0",borderBottom:"1px solid #EAE4D8"}}>
          <span style={{fontFamily:"DM Sans,sans-serif",fontSize:"12px",color:"#8A8A88",fontWeight:"500"}}>{r.l}</span>
          <span style={{fontFamily:"DM Sans,sans-serif",fontSize:"12px",color:"#1A1A18",fontWeight:"600"}}>{r.v}</span>
        </div>
      ))}
    </div>
    <div style={{background:"#F0EBE0",borderRadius:"10px",padding:"15px",marginBottom:"13px"}}>
      <p style={{fontFamily:"DM Sans,sans-serif",fontSize:"11px",color:"#5A5A58",marginBottom:"8px",fontWeight:"600",letterSpacing:"0.05em"}}>EMAIL MY SELECTIONS</p>
      <input type="email" placeholder="your@email.com" value={email} onChange={e=>setEmail(e.target.value)}
        style={{width:"100%",padding:"9px 12px",borderRadius:"7px",border:"1.5px solid #D0C8B8",
          fontFamily:"DM Sans,sans-serif",fontSize:"13px",marginBottom:"8px",
          background:"white",color:"#1A1A18",boxSizing:"border-box",outline:"none"}}/>
      <button onClick={()=>email&&setSent(true)} style={{width:"100%",padding:"10px",
        background:"#1E3A2C",color:"white",border:"none",borderRadius:"7px",
        fontFamily:"DM Sans,sans-serif",fontWeight:"700",fontSize:"12px",cursor:"pointer",
        opacity:email?1:0.5,letterSpacing:"0.06em"}}>SEND MY DESIGN</button>
    </div>
    <p style={{fontFamily:"DM Sans,sans-serif",fontSize:"11.5px",color:"#8A8A88",lineHeight:"1.6",textAlign:"center",marginBottom:"12px"}}>
      Visit any Beisser Lumber location or request samples online.
    </p>
    <div style={{textAlign:"center"}}>
      <button onClick={onRestart} style={{padding:"8px 20px",background:"transparent",color:"#1E3A2C",
        border:"2px solid #1E3A2C",borderRadius:"7px",fontFamily:"DM Sans,sans-serif",
        fontWeight:"700",fontSize:"12px",cursor:"pointer"}}>Start New Design</button>
    </div>
  </div>);
}

// ── MAIN APP ───────────────────────────────────────────────
export default function DeckVisualizer() {
  const [step,  setStep]  = useState(0);
  const [view,  setView]  = useState("front");
  const [expand,setExpand]= useState(false);
  const [mobile,setMobile]= useState(false);
  const [sel,   setSel]   = useState({
    houseStyle:"craftsman", deckLayout:"rectangle",
    brand:null, collection:null, color:null, railing:"baluster",
  });

  // Responsive detection
  useEffect(()=>{
    const check=()=>setMobile(window.innerWidth<768);
    check();
    window.addEventListener("resize",check);
    return()=>window.removeEventListener("resize",check);
  },[]);

  // Inject fonts
  useEffect(()=>{
    const link=document.createElement("link");
    link.href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=DM+Sans:wght@300;400;500;600;700&display=swap";
    link.rel="stylesheet"; document.head.appendChild(link);
    const st=document.createElement("style");
    st.textContent=`*{box-sizing:border-box;margin:0;padding:0}html,body{height:100%;background:#F0EAD8;overflow:hidden}button{cursor:pointer}button:focus{outline:none}::-webkit-scrollbar{width:5px}::-webkit-scrollbar-thumb{background:#C4BCA8;border-radius:3px}`;
    document.head.appendChild(st);
    return()=>{document.head.removeChild(link);document.head.removeChild(st);};
  },[]);

  const upd=(k,v)=>setSel(s=>({...s,[k]:v}));
  const brand=BRANDS.find(b=>b.id===sel.brand);
  const canNext=()=>{
    if(step===0) return !!sel.houseStyle;
    if(step===1) return !!sel.deckLayout;
    if(step===2) return !!sel.brand;
    if(step===3) return !!sel.color;
    if(step===4) return !!sel.railing;
    return true;
  };
  const TOTAL=6;
  const progress=(step/(TOTAL-1))*100;

  const stepContent=()=>{
    switch(step){
      case 0: return <StepHouseStyle sel={sel.houseStyle} onSel={v=>upd("houseStyle",v)}/>;
      case 1: return <StepDeckLayout sel={sel.deckLayout} onSel={v=>upd("deckLayout",v)}/>;
      case 2: return <StepBrand     sel={sel.brand}     onSel={v=>{upd("brand",v);upd("collection",null);upd("color",null);}}/>;
      case 3: return <StepColor brandId={sel.brand}
          selCol={sel.collection||brand?.cols[0]?.n} selColor={sel.color}
          onSelCol={v=>{upd("collection",v);upd("color",null);}} onSelColor={v=>upd("color",v)}/>;
      case 4: return <StepRailing  sel={sel.railing}  onSel={v=>upd("railing",v)}/>;
      case 5: return <StepSummary  sel={sel} onRestart={()=>{setStep(0);setView("front");setExpand(false);setSel({houseStyle:"craftsman",deckLayout:"rectangle",brand:null,collection:null,color:null,railing:"baluster"});}}/>;
      default: return null;
    }
  };

  // ── SHARED SUBCOMPONENTS ──
  const Header = () => (
    <div style={{
      padding:"11px 15px",display:"flex",alignItems:"center",justifyContent:"space-between",
      background:"rgba(0,0,0,0.38)",flexShrink:0,
    }}>
      <div>
        <div style={{fontFamily:"Playfair Display,serif",fontSize:"14px",color:"white",fontWeight:"700",letterSpacing:"0.05em"}}>BEISSER LUMBER</div>
        <div style={{fontFamily:"DM Sans,sans-serif",fontSize:"8.5px",color:"rgba(255,255,255,0.46)",letterSpacing:"0.16em",marginTop:"1px"}}>DECK VISUALIZER</div>
      </div>
      <div style={{display:"flex",alignItems:"center",gap:"8px"}}>
        {sel.color&&(
          <div style={{display:"flex",alignItems:"center",gap:"5px",background:"rgba(255,255,255,0.11)",borderRadius:"20px",padding:"4px 10px"}}>
            <div style={{width:"9px",height:"9px",borderRadius:"50%",background:sel.color.h,border:"1.5px solid rgba(255,255,255,0.4)",flexShrink:0}}/>
            <span style={{fontFamily:"DM Sans,sans-serif",fontSize:"10px",color:"rgba(255,255,255,0.88)",fontWeight:"600"}}>{sel.color.n}</span>
          </div>
        )}
        {mobile&&(
          <button onClick={()=>setExpand(e=>!e)} style={{
            background:"rgba(255,255,255,0.1)",border:"1px solid rgba(255,255,255,0.22)",
            borderRadius:"6px",padding:"4px 9px",fontFamily:"DM Sans,sans-serif",
            fontSize:"10px",color:"rgba(255,255,255,0.8)",fontWeight:"600",
          }}>{expand?"▲":"▼ Expand"}</button>
        )}
      </div>
    </div>
  );

  const ViewTabs = () => (
    <div style={{display:"flex",gap:"5px",padding:"7px 12px",background:"rgba(0,0,0,0.28)",flexShrink:0}}>
      {VIEWS.map(v=>(
        <button key={v.id} onClick={()=>setView(v.id)} style={{
          flex:1, padding:"6px 4px", border:"1.5px solid",
          display:"flex", flexDirection:"column", alignItems:"center", gap:"2px",
          borderColor: view===v.id?"rgba(255,255,255,0.88)":"rgba(255,255,255,0.18)",
          borderRadius:"7px",
          background: view===v.id?"rgba(255,255,255,0.17)":"transparent",
          transition:"all 0.14s",
        }}>
          <span style={{fontSize:"14px",lineHeight:1}}>{v.icon}</span>
          <span style={{fontFamily:"DM Sans,sans-serif",fontSize:"8.5px",
            fontWeight:view===v.id?"700":"500",letterSpacing:"0.07em",
            color:view===v.id?"white":"rgba(255,255,255,0.48)"}}>
            {v.label.toUpperCase()}
          </span>
        </button>
      ))}
    </div>
  );

  const MetaStrip = () => (
    <div style={{padding:"7px 15px",background:"rgba(0,0,0,0.22)",display:"flex",
      gap:"14px",flexShrink:0,flexWrap:"wrap",alignItems:"center"}}>
      {[
        sel.houseStyle && HOUSE_STYLES.find(h=>h.id===sel.houseStyle)?.name,
        sel.deckLayout && DECK_LAYOUTS.find(d=>d.id===sel.deckLayout)?.name,
        brand && brand.name,
        sel.railing && sel.railing!=="none" && RAILING_STYLES.find(r=>r.id===sel.railing)?.name,
      ].filter(Boolean).map((lbl,i)=>(
        <span key={i} style={{fontFamily:"DM Sans,sans-serif",fontSize:"9px",
          color:"rgba(255,255,255,0.38)",letterSpacing:"0.1em"}}>{lbl.toUpperCase()}</span>
      ))}
      <span style={{marginLeft:"auto",fontFamily:"DM Sans,sans-serif",fontSize:"9px",
        color:"rgba(255,255,255,0.3)",letterSpacing:"0.08em"}}>
        {VIEWS.find(v=>v.id===view)?.icon} {view.toUpperCase()}
      </span>
    </div>
  );

  const ProgressBar = () => (
    <div style={{height:"3.5px",background:"#DDD5C4",flexShrink:0}}>
      <div style={{height:"100%",background:"#1E3A2C",width:`${progress}%`,transition:"width 0.4s ease"}}/>
    </div>
  );

  const NavBar = ({compact=false}) => (
    <div style={{
      padding: compact?"10px 14px":"14px 22px",
      borderTop:"1px solid #E0D8C8",
      display:"flex",justifyContent:"space-between",alignItems:"center",
      background:"rgba(240,234,216,0.97)",backdropFilter:"blur(10px)",
      flexShrink:0, ...(compact?{position:"fixed",bottom:0,left:0,right:0,zIndex:200}:{}),
    }}>
      <button onClick={()=>setStep(s=>s-1)} disabled={step===0} style={{
        padding:"9px 16px",background:"transparent",border:"2px solid",
        borderColor:step===0?"#D4CCBC":"#B8B0A0",borderRadius:"8px",
        fontFamily:"DM Sans,sans-serif",fontWeight:"700",fontSize:"12px",
        color:step===0?"#C8C0B0":"#4A4A48",
      }}>← Back</button>
      <div style={{display:"flex",gap:"5px",alignItems:"center"}}>
        {STEPS.slice(0,-1).map((_,i)=>(
          <div key={i} style={{
            width:step===i?"15px":"5.5px",height:"5.5px",borderRadius:"3px",
            background:i<=step?"#1E3A2C":"#D0C8BC",transition:"all 0.24s",
          }}/>
        ))}
      </div>
      <button onClick={()=>setStep(s=>s+1)} disabled={!canNext()} style={{
        padding:"9px 16px",border:"none",borderRadius:"8px",
        fontFamily:"DM Sans,sans-serif",fontWeight:"700",fontSize:"12px",
        background:canNext()?"#1E3A2C":"#D8D0C0",
        color:canNext()?"white":"#B0A898",
        boxShadow:canNext()?"0 4px 12px rgba(30,58,44,0.28)":"none",
        transition:"all 0.15s",
      }}>{step===4?"See My Design →":"Next →"}</button>
    </div>
  );

  const WizardContent = ({padBottom=0}) => (
    <div style={{flex:1,overflowY:"auto",padding:"20px 20px 12px",paddingBottom:padBottom||"12px"}}>
      <div style={{marginBottom:"20px"}}>
        <div style={{display:"flex",alignItems:"center",gap:"8px",marginBottom:"6px"}}>
          <div style={{width:"23px",height:"23px",borderRadius:"50%",background:"#1E3A2C",
            display:"flex",alignItems:"center",justifyContent:"center",
            fontFamily:"DM Sans,sans-serif",fontSize:"10.5px",fontWeight:"700",color:"white",flexShrink:0}}>
            {step<5?step+1:"✓"}
          </div>
          <span style={{fontFamily:"DM Sans,sans-serif",fontSize:"10px",color:"#9A9898",
            letterSpacing:"0.12em",fontWeight:"600"}}>
            {step<5?`STEP ${step+1} OF ${TOTAL-1}`:"COMPLETE"}
          </span>
        </div>
        <h2 style={{fontFamily:"Playfair Display,serif",fontSize:mobile?"20px":"22px",
          color:"#1A1A18",fontWeight:"700",marginBottom:"5px"}}>{STEPS[step]}</h2>
        <p style={{fontFamily:"DM Sans,sans-serif",fontSize:"12.5px",color:"#787870",lineHeight:"1.55"}}>
          {step===0&&"Match your home's architectural character."}
          {step===1&&"Choose the deck footprint that fits your space."}
          {step===2&&"Beisser carries all the major decking brands."}
          {step===3&&"Browse collections and find your perfect board color."}
          {step===4&&"Choose a railing style to frame your deck."}
          {step===5&&"Your design is complete — save and share it."}
        </p>
        {(step===3||step===4)&&(
          <div style={{marginTop:"9px",padding:"7px 11px",background:"rgba(30,58,44,0.07)",
            borderRadius:"7px",border:"1px solid rgba(30,58,44,0.13)",
            display:"flex",alignItems:"center",gap:"7px"}}>
            <span style={{fontSize:"12px"}}>💡</span>
            <span style={{fontFamily:"DM Sans,sans-serif",fontSize:"11px",color:"#4A6A58",fontWeight:"500"}}>
              Switch <strong>views</strong> above to see from different angles
            </span>
          </div>
        )}
      </div>
      {stepContent()}
    </div>
  );

  // ── DESKTOP LAYOUT ─────────────────────────────────────
  if (!mobile) return (
    <div style={{display:"flex",height:"100vh",overflow:"hidden",fontFamily:"DM Sans,sans-serif"}}>
      {/* Scene panel */}
      <div style={{flex:"0 0 57%",display:"flex",flexDirection:"column",background:"#182218",overflow:"hidden"}}>
        <Header/>
        <ViewTabs/>
        <div style={{flex:1,overflow:"hidden",position:"relative"}}>
          <Scene houseStyle={sel.houseStyle} deckLayout={sel.deckLayout}
            deckColor={sel.color} railingStyle={sel.railing} view={view}/>
        </div>
        <MetaStrip/>
      </div>
      {/* Wizard panel */}
      <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden",background:"#F0EAD8"}}>
        <ProgressBar/>
        <WizardContent/>
        {step<5&&<NavBar/>}
      </div>
    </div>
  );

  // ── MOBILE / TABLET LAYOUT ─────────────────────────────
  const SCENE_H = expand ? "62vh" : "40vh";
  return (
    <div style={{display:"flex",flexDirection:"column",height:"100vh",overflow:"hidden",fontFamily:"DM Sans,sans-serif"}}>
      {/* Scene — top portion, expandable */}
      <div style={{
        background:"#182218",flexShrink:0,display:"flex",flexDirection:"column",
        height:SCENE_H,transition:"height 0.3s ease",overflow:"hidden",
      }}>
        <Header/>
        <ViewTabs/>
        <div style={{flex:1,overflow:"hidden"}}>
          <Scene houseStyle={sel.houseStyle} deckLayout={sel.deckLayout}
            deckColor={sel.color} railingStyle={sel.railing} view={view}/>
        </div>
        {!expand&&<MetaStrip/>}
      </div>

      {/* Progress bar */}
      <ProgressBar/>

      {/* Wizard — scrollable remaining space */}
      <div style={{flex:1,overflowY:"auto",background:"#F0EAD8",paddingBottom:"72px"}}>
        <WizardContent padBottom={80}/>
      </div>

      {/* Fixed bottom nav */}
      {step<5&&<NavBar compact/>}
    </div>
  );
}
