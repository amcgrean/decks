import { SHAPES } from '../../data/brands';

// Step 1: Deck Shape selection
export default function StepShape({ sel, onSel }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
      {SHAPES.map(s => {
        const active = sel === s.id;
        return (
          <button
            key={s.id}
            onClick={() => onSel(s.id)}
            style={{
              padding: '14px 12px',
              border: `2px solid ${active ? '#1E3A2C' : '#D8D0C0'}`,
              borderRadius: '10px',
              background: active ? 'rgba(30,58,44,0.08)' : 'white',
              boxShadow: active ? '0 4px 14px rgba(30,58,44,0.18)' : '0 1px 4px rgba(0,0,0,0.07)',
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'all 0.18s',
            }}
          >
            <div style={{ fontSize: '22px', marginBottom: '6px', opacity: 0.7, lineHeight: 1 }}>
              {s.icon}
            </div>
            <div style={{
              fontSize: '13px', fontWeight: '700', fontFamily: 'DM Sans,sans-serif',
              color: active ? '#1E3A2C' : '#1A1A18', marginBottom: '3px',
            }}>
              {s.name}
            </div>
            <div style={{
              fontSize: '11px', fontFamily: 'DM Sans,sans-serif',
              color: active ? '#2A5A3C' : '#7A7A78', lineHeight: '1.4',
            }}>
              {s.desc}
            </div>
          </button>
        );
      })}
    </div>
  );
}
