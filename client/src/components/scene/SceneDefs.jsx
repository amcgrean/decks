import { darken } from '../../utils/color';

// Master SVG <defs> — shared by Surface and Corner views
// Contains all gradients + filters ported verbatim from prototype
export default function SceneDefs({ base }) {
  const b = base || '#9A7E5C';
  return (
    <defs>
      {/* ── SKY ── */}
      <linearGradient id="g-sky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%"   stopColor="#4A7EA8"/>
        <stop offset="38%"  stopColor="#7AADC8"/>
        <stop offset="72%"  stopColor="#A8CEDF"/>
        <stop offset="100%" stopColor="#C8E0EE"/>
      </linearGradient>
      <linearGradient id="g-horizon" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%"   stopColor="rgba(220,200,165,0)"/>
        <stop offset="100%" stopColor="rgba(220,200,165,0.28)"/>
      </linearGradient>

      {/* ── LAWN ── */}
      <linearGradient id="g-lawn" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%"   stopColor="#527A2C"/>
        <stop offset="40%"  stopColor="#447020"/>
        <stop offset="100%" stopColor="#305018"/>
      </linearGradient>
      <linearGradient id="g-lawn-sun" x1="0" y1="0" x2="0.5" y2="1">
        <stop offset="0%"   stopColor="rgba(255,240,180,0.14)"/>
        <stop offset="100%" stopColor="rgba(255,240,180,0)"/>
      </linearGradient>

      {/* ── HOUSE WALLS (lit from upper-left) ── */}
      <linearGradient id="g-wall-front" x1="0.1" y1="0" x2="0.9" y2="1">
        <stop offset="0%"   stopColor="#F0E8D8"/>
        <stop offset="60%"  stopColor="#E4D8C4"/>
        <stop offset="100%" stopColor="#CECAB0"/>
      </linearGradient>
      <linearGradient id="g-wall-warm" x1="0.05" y1="0" x2="0.95" y2="1">
        <stop offset="0%"   stopColor="#EEE4D0"/>
        <stop offset="100%" stopColor="#D8CDB8"/>
      </linearGradient>
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
        <stop offset="0%"   stopColor={darken(b, 0.28)}/>
        <stop offset="100%" stopColor={darken(b, 0.52)}/>
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
