import { BRANDS } from '../../data/brands';

// Step 4: Color selection — collection tabs + swatch grid
export default function StepColor({ brandId, selCol, selColor, onSelCol, onSelColor }) {
  const brand = BRANDS.find(b => b.id === brandId);
  if (!brand) {
    return (
      <p style={{
        color: '#8A8A88', fontFamily: 'DM Sans,sans-serif', fontSize: '13px',
        padding: '24px 0', textAlign: 'center',
      }}>
        ← Select a brand first
      </p>
    );
  }

  const active = brand.cols.find(c => c.n === selCol) || brand.cols[0];

  return (
    <div>
      {/* Collection tabs */}
      <div style={{ display: 'flex', gap: '7px', flexWrap: 'wrap', marginBottom: '16px' }}>
        {brand.cols.map(c => {
          const isActive = active.n === c.n;
          return (
            <button
              key={c.n}
              onClick={() => onSelCol(c.n)}
              style={{
                padding: '6px 13px',
                borderRadius: '20px',
                border: `2px solid ${isActive ? brand.bc : '#D8D0C0'}`,
                fontSize: '11.5px',
                fontFamily: 'DM Sans,sans-serif',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.15s',
                background: isActive ? brand.bc : 'white',
                color: isActive ? 'white' : '#4A4A48',
              }}
            >
              {c.n}
            </button>
          );
        })}
      </div>

      {/* Color swatch grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(68px, 1fr))',
        gap: '9px',
      }}>
        {active.colors.map(color => {
          const isSel = selColor?.n === color.n;
          return (
            <button
              key={color.n}
              onClick={() => onSelColor(color)}
              title={color.n}
              style={{
                border: `3px solid ${isSel ? brand.bc : 'transparent'}`,
                borderRadius: '8px',
                cursor: 'pointer',
                padding: 0,
                overflow: 'hidden',
                transition: 'all 0.15s',
                boxShadow: isSel
                  ? `0 0 0 2px white, 0 0 0 4px ${brand.bc}`
                  : '0 2px 7px rgba(0,0,0,0.2)',
                transform: isSel ? 'scale(1.1)' : 'scale(1)',
              }}
            >
              <div style={{ height: '50px', background: color.h }}/>
              <div style={{ padding: '5px 3px', background: 'white', textAlign: 'center' }}>
                <div style={{
                  fontSize: '9px', fontFamily: 'DM Sans,sans-serif', fontWeight: '600',
                  color: '#2A2A28', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}>
                  {color.n}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Selected color info strip */}
      {selColor && (
        <div style={{
          marginTop: '14px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '10px 12px',
          background: 'white',
          border: '1.5px solid #E0D8C8',
          borderRadius: '8px',
        }}>
          <div style={{
            width: '32px', height: '32px', borderRadius: '5px',
            background: selColor.h, flexShrink: 0,
            boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
          }}/>
          <div>
            <div style={{ fontFamily: 'Playfair Display,serif', fontSize: '13px', color: '#1A1A18' }}>
              {selColor.n}
            </div>
            <div style={{ fontFamily: 'DM Sans,sans-serif', fontSize: '10px', color: '#9A9898' }}>
              {brand.name} · {active.n} · {selColor.h.toUpperCase()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
