import { RAILING_STYLES, RAILING_COLORS } from '../../data/brands';

// Step 5: Railing style and color selection
export default function StepRailing({ sel, selColor, onSel, onSelColor }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

      {/* 1. Style Selection */}
      <div>
        <h3 style={{ fontFamily: 'DM Sans,sans-serif', fontSize: '13px', fontWeight: '700', color: '#1A1A18', marginBottom: '10px' }}>
          Railing Style
        </h3>
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
                }} />
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
      </div>

      {/* 2. Color Selection (only if railing is enabled) */}
      {sel && sel !== 'none' && (
        <div style={{ animation: 'fadeIn 0.3s ease' }}>
          <h3 style={{ fontFamily: 'DM Sans,sans-serif', fontSize: '13px', fontWeight: '700', color: '#1A1A18', marginBottom: '10px' }}>
            Railing Color
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
            {RAILING_COLORS.map(c => {
              const active = selColor === c.id;
              const isMatch = c.h === 'match';
              return (
                <button
                  key={c.id}
                  onClick={() => onSelColor(c.id)}
                  style={{
                    padding: '12px 10px',
                    border: `2px solid ${active ? '#1E3A2C' : '#D8D0C0'}`,
                    borderRadius: '8px',
                    background: active ? 'rgba(30,58,44,0.06)' : 'white',
                    cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: '8px',
                    transition: 'all 0.15s',
                  }}
                >
                  <div style={{
                    width: '18px', height: '18px', borderRadius: '50%',
                    background: isMatch ? 'linear-gradient(135deg, #C49A4A, #4A3F3A)' : c.h,
                    border: '1.5px solid rgba(0,0,0,0.15)',
                    flexShrink: 0,
                  }} />
                  <span style={{
                    fontFamily: 'DM Sans,sans-serif', fontSize: '11.5px',
                    fontWeight: active ? '700' : '500',
                    color: active ? '#1E3A2C' : '#4A4A48',
                  }}>
                    {c.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
