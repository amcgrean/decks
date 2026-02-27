// Step 6: Stair configuration

const POSITIONS = [
  { id: 'front-center', label: 'Front Center', icon: '⬇' },
  { id: 'front-left',   label: 'Front Left',   icon: '↙' },
  { id: 'front-right',  label: 'Front Right',  icon: '↘' },
  { id: 'side-left',    label: 'Side Left',    icon: '←' },
  { id: 'side-right',   label: 'Side Right',   icon: '→' },
];

export default function StepStairs({ stairs, onStairs }) {
  const upd = (k, v) => onStairs({ ...stairs, [k]: v });

  return (
    <div>
      {/* Toggle */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '14px',
        background: 'white',
        border: `2px solid ${stairs.enabled ? '#1E3A2C' : '#D8D0C0'}`,
        borderRadius: '10px',
        marginBottom: '16px',
        cursor: 'pointer',
      }}
        onClick={() => upd('enabled', !stairs.enabled)}
      >
        <div>
          <div style={{ fontSize: '13px', fontWeight: '700', fontFamily: 'DM Sans,sans-serif', color: '#1A1A18' }}>
            Include Stairs
          </div>
          <div style={{ fontSize: '11px', fontFamily: 'DM Sans,sans-serif', color: '#8A8A88' }}>
            Add stair access to your deck
          </div>
        </div>
        {/* Toggle pill */}
        <div style={{
          width: '44px', height: '24px', borderRadius: '12px',
          background: stairs.enabled ? '#1E3A2C' : '#D4CCC0',
          position: 'relative', transition: 'background 0.2s', flexShrink: 0,
        }}>
          <div style={{
            position: 'absolute', top: '3px',
            left: stairs.enabled ? '23px' : '3px',
            width: '18px', height: '18px', borderRadius: '50%',
            background: 'white', transition: 'left 0.2s',
            boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
          }}/>
        </div>
      </div>

      {stairs.enabled && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Position */}
          <div>
            <div style={{ fontSize: '11px', fontWeight: '700', fontFamily: 'DM Sans,sans-serif', color: '#9A9898', letterSpacing: '0.1em', marginBottom: '8px' }}>
              POSITION
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '7px' }}>
              {POSITIONS.map(p => {
                const active = stairs.position === p.id;
                return (
                  <button
                    key={p.id}
                    onClick={() => upd('position', p.id)}
                    style={{
                      padding: '7px 13px',
                      border: `2px solid ${active ? '#1E3A2C' : '#D8D0C0'}`,
                      borderRadius: '8px',
                      fontSize: '11.5px',
                      fontFamily: 'DM Sans,sans-serif',
                      fontWeight: '600',
                      background: active ? '#1E3A2C' : 'white',
                      color: active ? 'white' : '#4A4A48',
                      cursor: 'pointer',
                      transition: 'all 0.15s',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px',
                    }}
                  >
                    <span>{p.icon}</span>
                    <span>{p.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Steps count */}
          <div>
            <div style={{ fontSize: '11px', fontWeight: '700', fontFamily: 'DM Sans,sans-serif', color: '#9A9898', letterSpacing: '0.1em', marginBottom: '8px' }}>
              NUMBER OF STEPS: <span style={{ color: '#1E3A2C' }}>{stairs.steps}</span>
            </div>
            <input
              type="range" min={2} max={12} value={stairs.steps}
              onChange={e => upd('steps', Number(e.target.value))}
              style={{ width: '100%', accentColor: '#1E3A2C' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', fontFamily: 'DM Sans,sans-serif', color: '#B0ABA4', marginTop: '2px' }}>
              <span>2</span><span>12</span>
            </div>
          </div>

          {/* Width */}
          <div>
            <div style={{ fontSize: '11px', fontWeight: '700', fontFamily: 'DM Sans,sans-serif', color: '#9A9898', letterSpacing: '0.1em', marginBottom: '8px' }}>
              STAIR WIDTH: <span style={{ color: '#1E3A2C' }}>{stairs.width}′</span>
            </div>
            <input
              type="range" min={3} max={12} value={stairs.width}
              onChange={e => upd('width', Number(e.target.value))}
              style={{ width: '100%', accentColor: '#1E3A2C' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', fontFamily: 'DM Sans,sans-serif', color: '#B0ABA4', marginTop: '2px' }}>
              <span>3′</span><span>12′</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
