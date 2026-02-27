// Corner (3-quarter) view — angled isometric with house side wall
import SceneDefs from './SceneDefs';
import { HouseSVG } from './helpers';
import { darken } from '../../utils/color';

export default function CornerView({ houseStyle, shape, deckColor, railingStyle }) {
  const base = deckColor?.h || null;
  const b = base || '#9A7E5C';
  const W = 900, BY = 342, DECK_BOT = BY + 148;

  const L = 110, R = 774, RH = 72, RT = BY - RH;
  const pXs = [L, L+(R-L)*0.17, L+(R-L)*0.34, L+(R-L)*0.5, L+(R-L)*0.67, L+(R-L)*0.83, R];
  const capC = darken('#EAE2D0', 0.04);
  const postC = darken(b, 0.24);

  const CornerRailing = () => {
    if (!railingStyle || railingStyle === 'none') return null;
    if (railingStyle === 'baluster') {
      const bals = []; for (let x = L+18; x < R-12; x += 13) bals.push(x);
      return (
        <g>
          <rect x={L} y={BY-13} width={R-L} height={9} fill={capC} rx="2"/>
          <rect x={L} y={RT-8}  width={R-L} height={10} fill={capC} rx="2.5"/>
          {bals.map((x,i) => <rect key={i} x={x} y={RT+2} width={5} height={RH-22} rx="1.5" fill={darken(capC,0.14)} opacity="0.93"/>)}
          {pXs.map((x,i) => <rect key={i} x={x-5.5} y={RT-12} width={11} height={RH+12} rx="2.5" fill={postC}/>)}
        </g>
      );
    }
    if (railingStyle === 'cable') {
      return (
        <g>
          {pXs.map((x,i) => <rect key={i} x={x-4.5} y={RT-10} width={9} height={RH+10} rx="2" fill="#8A9298"/>)}
          {Array.from({length:5},(_,i) => {const cy=RT+6+i*14;return(<g key={i}><line x1={L} y1={cy} x2={R} y2={cy} stroke="#A0ACB4" strokeWidth="2.8"/><line x1={L} y1={cy} x2={R} y2={cy} stroke="rgba(255,255,255,0.4)" strokeWidth="1"/></g>);})}
          <rect x={L} y={RT-10} width={R-L} height={8} fill="#8A9298" rx="2"/>
        </g>
      );
    }
    if (railingStyle === 'glass') {
      return (
        <g>
          {pXs.slice(0,-1).map((x,i) => <rect key={i} x={x+8} y={RT+2} width={pXs[i+1]-x-16} height={RH-18} fill="rgba(150,205,228,0.2)" stroke="rgba(175,222,240,0.52)" strokeWidth="1.5" rx="1"/>)}
          {pXs.map((x,i) => <rect key={i} x={x-4.5} y={RT-10} width={9} height={RH+10} rx="2" fill="#BBC6CE"/>)}
          <rect x={L} y={RT-10} width={R-L} height={8} fill="#BBC6CE" rx="2"/>
        </g>
      );
    }
    if (railingStyle === 'horizontal') {
      return (
        <g>
          {pXs.map((x,i) => <rect key={i} x={x-5.5} y={RT-12} width={11} height={RH+12} rx="2.5" fill={darken(b,0.24)}/>)}
          {Array.from({length:4},(_,i) => {const y=RT+7+i*16;return(<g key={i}><rect x={L+8} y={y} width={R-L-16} height={11} rx="2" fill={i%2===0?darken(b,0.16):darken(b,0.24)}/><rect x={L+8} y={y} width={R-L-16} height={3} rx="2" fill="rgba(255,255,255,0.08)"/></g>);})}
          <rect x={L} y={RT-8} width={R-L} height={10} fill={darken(b,0.28)} rx="2.5"/>
        </g>
      );
    }
    return null;
  };

  return (
    <svg viewBox={`0 0 ${W} 520`} style={{ width: '100%', height: '100%', display: 'block' }}>
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
      <rect y={370} width={W} height={18}  fill="rgba(0,0,0,0.14)"/>
      <ellipse cx={W/2} cy={490} rx={360} ry={18} fill="rgba(0,0,0,0.2)"/>

      {/* House front (shifted left) */}
      <g transform="translate(-52,0) scale(0.885,1)">
        <HouseSVG style={houseStyle} W={W} BY={BY}/>
      </g>

      {/* House side wall */}
      <polygon points={`598,64 864,24 864,${BY} 598,${BY}`} fill="url(#g-wall-side)"/>
      {Array.from({length:18},(_,i)=>{
        const y=64+i*((BY-64)/17.5);
        return <line key={i} x1={598} y1={y} x2={864} y2={y-(64-24)/4} stroke="rgba(0,0,0,0.05)" strokeWidth="1.3"/>;
      })}
      <polygon points={`598,64 640,68 640,${BY} 598,${BY}`} fill="rgba(0,0,0,0.12)"/>

      {/* Side windows */}
      {[[626,96,62,74],[736,96,62,74],[626,216,62,84],[736,216,62,84]].map(([x,y,ww,hh],i) => (
        <g key={i}>
          <rect x={x-5} y={y-5} width={ww+10} height={hh+10} fill="#C0B090" rx="1"/>
          <rect x={x} y={y} width={ww} height={hh} fill="url(#g-glass)"/>
          <rect x={x} y={y} width={ww} height={hh} fill="url(#g-glare)" opacity="0.75"/>
          <rect x={x+ww/2-1.5} y={y} width={3} height={hh} fill="rgba(255,255,255,0.5)"/>
        </g>
      ))}

      {/* Roof side slope */}
      <polygon points={`598,64 864,24 864,26 598,68`} fill={darken('#3A2E24',0.12)}/>

      {/* Foundation */}
      <rect x={W*0.085-50} y={340} width={W*0.72} height={12} fill="url(#g-foundation)" rx="1"/>
      <polygon points={`598,340 864,328 864,340 598,352`} fill="#6A5A48"/>

      {/* Deck top surface */}
      <g clipPath="url(#cv-deck-top)">
        <rect x={0} y={BY-12} width={W} height={180} fill={b} filter="url(#f-wood)"/>
        {Array.from({length:20},(_,i)=>{
          const t=i/19; const dy=BY+t*148;
          return <line key={i} x1={0} y1={dy} x2={W} y2={dy} stroke={darken(b,0.26)} strokeWidth="1.5" opacity="0.6"/>;
        })}
        <rect x={0} y={BY} width={W} height={24} fill="rgba(255,248,200,0.09)"/>
        <rect x={0} y={BY} width={W} height={52} fill="url(#g-deck-shadow)"/>
      </g>

      {/* Deck right face (3D depth) */}
      <polygon points={`774,${BY} 856,${BY-36} 878,${DECK_BOT-36} 796,${DECK_BOT}`} fill="url(#g-deck-fascia)"/>
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

      {/* Railing */}
      <CornerRailing/>

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
