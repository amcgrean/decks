import { BRANDS } from '../../data/brands';

// Step 3: Brand selection — 7-brand card grid
export default function StepBrand({ sel, onSel }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '9px' }}>
      {BRANDS.map(b => {
        const active = sel === b.id;
        return (
          <button
            key={b.id}
            onClick={() => onSel(b.id)}
            style={{
              padding: '13px 12px',
              border: `2px solid ${active ? b.bc : '#D8D0C0'}`,
              borderRadius: '10px',
              background: active ? `${b.bc}1C` : 'white',
              boxShadow: active ? `0 4px 14px ${b.bc}35` : '0 1px 4px rgba(0,0,0,0.07)',
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'all 0.18s',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '7px', marginBottom: '3px' }}>
              <div style={{
                width: '9px', height: '9px', borderRadius: '50%',
                background: b.bc, flexShrink: 0,
              }}/>
              <span style={{
                fontSize: '12px', fontWeight: '700', fontFamily: 'DM Sans,sans-serif',
                color: active ? b.bc : '#1A1A18',
              }}>
                {b.name}
              </span>
            </div>
            <div style={{
              fontSize: '9.5px', fontFamily: 'DM Sans,sans-serif',
              color: '#888', lineHeight: '1.35',
            }}>
              {b.tag}
            </div>
            {/* Collection count hint */}
            <div style={{
              marginTop: '6px', fontSize: '9px', fontFamily: 'DM Sans,sans-serif',
              color: active ? b.bc : '#BCBAB8', fontWeight: '600',
            }}>
              {b.cols.length} collections · {b.cols.reduce((acc,c) => acc+c.colors.length, 0)} colors
            </div>
          </button>
        );
      })}
    </div>
  );
}
