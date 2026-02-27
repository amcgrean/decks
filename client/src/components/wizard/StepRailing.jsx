import { RAILING_STYLES } from '../../data/brands';

// Step 5: Railing style selection
export default function StepRailing({ sel, onSel }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '9px' }}>
      {RAILING_STYLES.map(r => {
        const active = sel === r.id;
        return (
          <button
            key={r.id}
            onClick={() => onSel(r.id)}
            style={{
              padding: '13px 12px',
              border: `2px solid ${active ? '#1E3A2C' : '#D8D0C0'}`,
              borderRadius: '10px',
              background: active ? 'rgba(30,58,44,0.08)' : 'white',
              boxShadow: active ? '0 4px 14px rgba(30,58,44,0.18)' : '0 1px 4px rgba(0,0,0,0.07)',
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'all 0.18s',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
            }}
          >
            <div style={{
              width: '11px', height: '11px', borderRadius: '50%',
              flexShrink: 0,
              background: active ? '#C4924A' : '#D8D0C0',
              boxShadow: active ? '0 0 0 3px rgba(196,146,74,0.2)' : 'none',
              transition: 'all 0.18s',
            }}/>
            <div>
              <div style={{
                fontSize: '13px', fontWeight: '700', fontFamily: 'DM Sans,sans-serif',
                color: active ? '#1E3A2C' : '#1A1A18', marginBottom: '2px',
              }}>
                {r.name}
              </div>
              <div style={{
                fontSize: '11px', fontFamily: 'DM Sans,sans-serif',
                color: active ? '#2A5A3C' : '#7A7A78', lineHeight: '1.4',
              }}>
                {r.desc}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
