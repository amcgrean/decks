// Surface view — premium front-elevation SVG with full quality rendering
import SceneDefs from './SceneDefs';
import { HouseSVG, DeckBoards, Railing, Environment } from './helpers';

export default function SurfaceView({ houseStyle, shape, deckColor, railingStyle }) {
  const base = deckColor?.h || null;
  const W = 900, BY = 342;
  return (
    <svg viewBox={`0 0 ${W} 520`} style={{ width: '100%', height: '100%', display: 'block' }}>
      <SceneDefs base={base}/>

      {/* Sky */}
      <rect width={W} height={520} fill="url(#g-sky)"/>
      <rect y={260} width={W} height={120} fill="url(#g-horizon)"/>

      {/* Lawn */}
      <rect y={370} width={W} height={150} fill="url(#g-lawn)" filter="url(#f-grass)"/>
      <rect y={370} width={W} height={150} fill="url(#g-lawn-sun)"/>
      <rect y={370} width={W} height={18}  fill="rgba(0,0,0,0.14)"/>

      {/* Foundation / grade */}
      <rect x={W*0.085} y={340} width={W*0.83} height={12} fill="url(#g-foundation)" rx="1"/>
      <rect x={W*0.085} y={349} width={W*0.83} height={5}  fill="rgba(0,0,0,0.14)"/>

      {/* House */}
      <HouseSVG style={houseStyle} W={W} BY={BY}/>

      {/* Deck */}
      <DeckBoards base={base} shape={shape} W={W} DECK_Y={BY}/>
      <Railing style={railingStyle} base={base} shape={shape} W={W} DECK_Y={BY}/>

      {/* Trees composited on top */}
      <Environment W={W}/>

      {/* Walkway */}
      <polygon points={`${W/2-34},520 ${W/2+34},520 ${W/2+20},430 ${W/2-20},430`}
        fill="#BEB2A0" opacity="0.58"/>

      {/* No-color prompt */}
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
