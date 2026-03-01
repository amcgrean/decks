// Corner (3-quarter) view — angled perspective with house side wall
import SceneDefs from './SceneDefs';
import { HouseSVG } from './helpers';
import { darken } from '../../utils/color';

export default function CornerView({ houseStyle, shape, deckColor, railingStyle }) {
  const base = deckColor?.h || null;
  const b = base || '#9A7E5C';
  const W = 900, BY = 342, DECK_BOT = BY + 148; // 490

  // ── PERSPECTIVE SETUP ─────────────────────────────────────
  // Horizon at y=190 (eye-level ≈ 5.5ft above grade in scene coords)
  // Deck surface: far edge (at house) y=342, near edge (viewer) y=490
  const yH = 190;
  const yFar  = BY;        // 342 – far top edge of deck
  const yNear = DECK_BOT;  // 490 – near bottom edge of deck
  const invFar  = 1 / (yFar  - yH);  // 1/152
  const invNear = 1 / (yNear - yH);  // 1/300

  // Map t∈[0,1] → perspective-correct screen y  (t=0 = far/house, t=1 = near/viewer)
  const perspY = t => Math.round(yH + 1 / (invFar + t * (invNear - invFar)));

  // ── SIDE WALL GEOMETRY (corrected two-point perspective) ──
  // VP_right ≈ (2200, 190).  Wall spans x: 596 → 866
  // Near-left corner  (596): roof at y=68, base at y=342
  // Far-right corner  (866): roof at y=96  (LOWER – recedes correctly)
  //                          base at y=326  (slightly higher – converges)
  const SW = { x0: 596, x1: 866, ytop0: 68, ytop1: 96, ybot0: 342, ybot1: 326 };

  // Interpolate a y-value along the side wall at screen x
  const swY = (x, y0, y1) => y0 + (x - SW.x0) / (SW.x1 - SW.x0) * (y1 - y0);

  // ── FRONT RAILING (at near/front deck edge y=490) ─────────
  const RAIL_H_NEAR = 62;                           // railing height at near edge (screen px)
  const RAIL_H_FAR  = Math.round(RAIL_H_NEAR * (yFar - yH) / (yNear - yH)); // ~31px at far
  const RAIL_TOP_Y  = DECK_BOT - RAIL_H_NEAR;      // 428
  const sideTopFar  = BY - RAIL_H_FAR;             // 311  (left-edge railing top at back)
  const RL = 88, RR = 796;                          // near-edge deck left / right
  const frontSpan = RR - RL;
  const fPostXs = [RL, RL+frontSpan*0.17, RL+frontSpan*0.34, RL+frontSpan*0.5,
                   RL+frontSpan*0.67, RL+frontSpan*0.83, RR];
  const capC  = darken('#EAE2D0', 0.04);
  const postC = darken(b, 0.24);

  const CornerRailing = () => {
    if (!railingStyle || railingStyle === 'none') return null;

    // Left-side railing panel (trapezoidal face along left deck edge)
    const sidePts = `88,${RAIL_TOP_Y} 110,${sideTopFar} 110,${BY} 88,${DECK_BOT}`;

    if (railingStyle === 'baluster') {
      const bals = [];
      for (let x = RL + 14; x < RR - 8; x += 15) bals.push(x);
      return (
        <g>
          <polygon points={sidePts} fill={darken(capC, 0.06)} opacity="0.65"/>
          <rect x={RL} y={DECK_BOT - 11} width={frontSpan} height={9} fill={capC} rx="2"/>
          <rect x={RL} y={RAIL_TOP_Y - 8} width={frontSpan} height={9} fill={capC} rx="2.5"/>
          <rect x={RL} y={RAIL_TOP_Y - 8} width={frontSpan} height={3} fill="rgba(255,255,255,0.18)" rx="2.5"/>
          {bals.map((x, i) => (
            <rect key={i} x={x} y={RAIL_TOP_Y + 1} width={5} height={RAIL_H_NEAR - 20}
              rx="1.5" fill={darken(capC, 0.14)} opacity="0.93"/>
          ))}
          {fPostXs.map((x, i) => (
            <rect key={i} x={x - 5.5} y={RAIL_TOP_Y - 11} width={11} height={RAIL_H_NEAR + 11}
              rx="2.5" fill={postC}/>
          ))}
        </g>
      );
    }

    if (railingStyle === 'cable') {
      return (
        <g>
          <polygon points={sidePts} fill="rgba(138,146,152,0.35)"/>
          {fPostXs.map((x, i) => (
            <rect key={i} x={x - 4.5} y={RAIL_TOP_Y - 8} width={9} height={RAIL_H_NEAR + 8}
              rx="2" fill="#8A9298"/>
          ))}
          {Array.from({ length: 5 }, (_, i) => {
            const cy = RAIL_TOP_Y + 6 + i * 11;
            return (
              <g key={i}>
                <line x1={RL} y1={cy} x2={RR} y2={cy} stroke="#A0ACB4" strokeWidth="2.8"/>
                <line x1={RL} y1={cy} x2={RR} y2={cy} stroke="rgba(255,255,255,0.4)" strokeWidth="1"/>
              </g>
            );
          })}
          <rect x={RL} y={RAIL_TOP_Y - 8} width={frontSpan} height={8} fill="#8A9298" rx="2"/>
        </g>
      );
    }

    if (railingStyle === 'glass') {
      return (
        <g>
          <polygon points={sidePts} fill="rgba(150,205,228,0.12)" stroke="rgba(175,222,240,0.35)" strokeWidth="1"/>
          {fPostXs.slice(0, -1).map((x, i) => (
            <rect key={i} x={x + 8} y={RAIL_TOP_Y + 2} width={fPostXs[i + 1] - x - 16}
              height={RAIL_H_NEAR - 18}
              fill="rgba(150,205,228,0.2)" stroke="rgba(175,222,240,0.52)" strokeWidth="1.5" rx="1"/>
          ))}
          {fPostXs.map((x, i) => (
            <rect key={i} x={x - 4.5} y={RAIL_TOP_Y - 8} width={9} height={RAIL_H_NEAR + 8}
              rx="2" fill="#BBC6CE"/>
          ))}
          <rect x={RL} y={RAIL_TOP_Y - 8} width={frontSpan} height={8} fill="#BBC6CE" rx="2"/>
        </g>
      );
    }

    if (railingStyle === 'horizontal') {
      return (
        <g>
          <polygon points={sidePts} fill={darken(b, 0.18)} opacity="0.55"/>
          {fPostXs.map((x, i) => (
            <rect key={i} x={x - 5.5} y={RAIL_TOP_Y - 11} width={11} height={RAIL_H_NEAR + 11}
              rx="2.5" fill={darken(b, 0.24)}/>
          ))}
          {Array.from({ length: 4 }, (_, i) => {
            const y = RAIL_TOP_Y + 7 + i * 13;
            return (
              <g key={i}>
                <rect x={RL + 8} y={y} width={frontSpan - 16} height={9} rx="2"
                  fill={i % 2 === 0 ? darken(b, 0.16) : darken(b, 0.24)}/>
                <rect x={RL + 8} y={y} width={frontSpan - 16} height={3} rx="2"
                  fill="rgba(255,255,255,0.08)"/>
              </g>
            );
          })}
          <rect x={RL} y={RAIL_TOP_Y - 8} width={frontSpan} height={9} fill={darken(b, 0.28)} rx="2.5"/>
        </g>
      );
    }
    return null;
  };

  // ── PERSPECTIVE-CORRECT SIDE WINDOWS ─────────────────────
  // Wall: near-left top (596,68) → far-right top (866,96)
  //       near-left bot (596,342) → far-right bot (866,326)
  // For each original window (x0,x1,yTopOrig,yBotOrig), project to wall coords.
  const wallH_left  = SW.ybot0 - SW.ytop0; // 274
  const wallH_right = SW.ybot1 - SW.ytop1; // 230
  const projectWinY = (x, yOrig) => {
    const t = (x - SW.x0) / (SW.x1 - SW.x0);
    const wallTop = SW.ytop0 + t * (SW.ytop1 - SW.ytop0);
    const wallH   = wallH_left - t * (wallH_left - wallH_right);
    const yOff    = yOrig - SW.ytop0; // offset from left-wall top in original coords
    return Math.round(wallTop + yOff * (wallH / wallH_left));
  };

  // Original window bounding boxes (x, y_top, x+w, y_bot) in original side-wall space
  const sideWins = [
    [626, 68 + 28,  688, 68 + 28 + 74],   // upper-left window   (y_top=96, h=74)
    [736, 68 + 28,  798, 68 + 28 + 74],   // upper-right window
    [626, 68 + 148, 688, 68 + 148 + 84],  // lower-left window   (y_top=216, h=84)
    [736, 68 + 148, 798, 68 + 148 + 84],  // lower-right window
  ];

  return (
    <svg viewBox={`0 0 ${W} 520`} style={{ width: '100%', height: '100%', display: 'block' }}>
      <SceneDefs base={base}/>
      <defs>
        <clipPath id="cv-deck-top">
          <polygon points={`110,${BY} 774,${BY} ${RR},${DECK_BOT} ${RL},${DECK_BOT}`}/>
        </clipPath>
      </defs>

      {/* ── SKY & LAWN ── */}
      <rect width={W} height={520} fill="url(#g-sky)"/>
      <rect y={260} width={W} height={120} fill="url(#g-horizon)"/>
      <rect y={370} width={W} height={150} fill="url(#g-lawn)" filter="url(#f-grass)"/>
      <rect y={370} width={W} height={18}  fill="rgba(0,0,0,0.14)"/>
      <ellipse cx={W / 2} cy={492} rx={370} ry={20} fill="rgba(0,0,0,0.18)"/>

      {/* ── HOUSE FRONT (scaled left to reveal side wall) ── */}
      <g transform="translate(-52,0) scale(0.885,1)">
        <HouseSVG style={houseStyle} W={W} BY={BY}/>
      </g>

      {/* ── HOUSE SIDE WALL — CORRECTED PERSPECTIVE ──
           Near-left top (596,68) → Far-right top (866,96)  [slopes DOWN = correct]
           Near-left bot (596,342) → Far-right bot (866,326) [floor converges to VP] */}
      <polygon
        points={`${SW.x0},${SW.ytop0} ${SW.x1},${SW.ytop1} ${SW.x1},${SW.ybot1} ${SW.x0},${SW.ybot0}`}
        fill="url(#g-wall-side)"/>

      {/* Siding lines — interpolate between corrected left & right edges */}
      {Array.from({ length: 18 }, (_, i) => {
        const t  = i / 17;
        const y1 = SW.ytop0 + t * (SW.ybot0 - SW.ytop0);
        const y2 = SW.ytop1 + t * (SW.ybot1 - SW.ytop1);
        return (
          <line key={i} x1={SW.x0} y1={y1} x2={SW.x1} y2={y2}
            stroke="rgba(0,0,0,0.05)" strokeWidth="1.3"/>
        );
      })}

      {/* Junction shadow strip (where front wall meets side wall) */}
      <polygon
        points={`${SW.x0},${SW.ytop0} ${SW.x0 + 42},${swY(SW.x0 + 42, SW.ytop0, SW.ytop1)}
                 ${SW.x0 + 42},${BY} ${SW.x0},${SW.ybot0}`}
        fill="rgba(0,0,0,0.12)"/>

      {/* ── SIDE WINDOWS — perspective parallelograms ── */}
      {sideWins.map(([x0, yT_orig, x1, yB_orig], i) => {
        const tl = { x: x0, y: projectWinY(x0, yT_orig) };
        const tr = { x: x1, y: projectWinY(x1, yT_orig) };
        const br = { x: x1, y: projectWinY(x1, yB_orig) };
        const bl = { x: x0, y: projectWinY(x0, yB_orig) };
        const pts    = `${tl.x},${tl.y} ${tr.x},${tr.y} ${br.x},${br.y} ${bl.x},${bl.y}`;
        const ptsOut = `${tl.x-5},${tl.y-5} ${tr.x+5},${tr.y-5} ${br.x+5},${br.y+5} ${bl.x-5},${bl.y+5}`;
        const mx = (tl.x + tr.x) / 2, myT = (tl.y + tr.y) / 2, myB = (bl.y + br.y) / 2;
        return (
          <g key={i}>
            <polygon points={ptsOut} fill="#C0B090"/>
            <polygon points={pts} fill="url(#g-glass)"/>
            <polygon points={pts} fill="url(#g-glare)" opacity="0.75"/>
            <line x1={mx} y1={myT} x2={mx} y2={myB} stroke="rgba(255,255,255,0.5)" strokeWidth="2.5"/>
          </g>
        );
      })}

      {/* Roof edge of side wall (thin strip at roofline) */}
      <polygon
        points={`${SW.x0},${SW.ytop0} ${SW.x1},${SW.ytop1} ${SW.x1},${SW.ytop1 + 2} ${SW.x0},${SW.ytop0 + 2}`}
        fill={darken('#3A2E24', 0.12)}/>

      {/* ── FOUNDATION ── */}
      <rect x={W * 0.085 - 50} y={340} width={W * 0.72} height={12} fill="url(#g-foundation)" rx="1"/>
      <polygon
        points={`${SW.x0},340 ${SW.x1},${SW.ybot1 - 2} ${SW.x1},${SW.ybot1 + 10} ${SW.x0},352`}
        fill="#6A5A48"/>

      {/* ── DECK TOP SURFACE — perspective-correct board lines ── */}
      <g clipPath="url(#cv-deck-top)">
        <rect x={0} y={BY - 12} width={W} height={180} fill={b} filter="url(#f-wood)"/>
        {Array.from({ length: 22 }, (_, i) => {
          // t=0 → far edge (y=342), t=1 → near edge (y=490)
          const t  = i / 21;
          const dy = perspY(t);
          return (
            <line key={i} x1={0} y1={dy} x2={W} y2={dy}
              stroke={darken(b, 0.26)} strokeWidth="1.5" opacity="0.6"/>
          );
        })}
        <rect x={0} y={BY} width={W} height={24} fill="rgba(255,248,200,0.09)"/>
        <rect x={0} y={BY} width={W} height={52} fill="url(#g-deck-shadow)"/>
        {/* sun sheen — fades across depth */}
        <rect x={0} y={BY} width={W} height={148} fill="url(#g-deck-sun)"/>
      </g>

      {/* ── DECK RIGHT FACE (3-D depth) ── */}
      <polygon
        points={`774,${BY} 856,${BY - 36} 878,${DECK_BOT - 36} 796,${DECK_BOT}`}
        fill="url(#g-deck-fascia)"/>
      {Array.from({ length: 9 }, (_, i) => {
        const t = i / 8;
        return (
          <line key={i}
            x1={856} y1={BY - 36 + t * 128}
            x2={774} y2={BY + t * 148}
            stroke={darken(b, 0.42)} strokeWidth="1" opacity="0.55"/>
        );
      })}

      {/* Front fascia board */}
      <polygon
        points={`${RL},${DECK_BOT} ${RR},${DECK_BOT} ${RR},${DECK_BOT + 13} ${RL},${DECK_BOT + 13}`}
        fill={darken(b, 0.44)}/>
      {/* Right side fascia */}
      <polygon
        points={`${RR},${DECK_BOT} 878,${DECK_BOT - 36} 878,${DECK_BOT - 22} ${RR},${DECK_BOT + 13}`}
        fill={darken(b, 0.5)}/>

      {/* ── RAILING (front edge of deck) ── */}
      <CornerRailing/>

      {/* Left tree */}
      <rect x={18} y={274} width={14} height={96} fill="#4A3018"/>
      <ellipse cx={25}  cy={230} rx={46} ry={40} fill="#2E6C1A"/>
      <ellipse cx={14}  cy={256} rx={32} ry={28} fill="#388020"/>
      <ellipse cx={36}  cy={260} rx={30} ry={24} fill="#307218"/>
      <ellipse cx={25}  cy={210} rx={34} ry={30} fill="#347A22"/>

      {!base && (
        <g>
          <rect x={W / 2 - 170} y={400} width={340} height={54} rx="9" fill="rgba(16,22,14,0.72)"/>
          <text x={W / 2} y={424} textAnchor="middle" fill="rgba(255,255,255,0.94)" fontSize="14"
            fontFamily="Playfair Display,serif" fontWeight="600">Select a Color to Preview</text>
          <text x={W / 2} y={442} textAnchor="middle" fill="rgba(255,255,255,0.5)" fontSize="11"
            fontFamily="DM Sans,sans-serif">corner angle view</text>
        </g>
      )}
    </svg>
  );
}
