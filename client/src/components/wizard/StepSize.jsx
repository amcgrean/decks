// Step 2: Deck dimensions — width × depth inputs with sq ft calculation

export default function StepSize({ width, depth, onWidth, onDepth }) {
  const sqFt = Math.round(width * depth);
  const boards = Math.ceil(sqFt / 1.33); // rough board-foot estimate

  const Input = ({ label, value, onChange, unit = 'ft' }) => (
    <div>
      <label style={{
        display: 'block', fontSize: '11px', fontWeight: '700', fontFamily: 'DM Sans,sans-serif',
        color: '#6A6A68', letterSpacing: '0.1em', marginBottom: '6px',
      }}>
        {label}
      </label>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0' }}>
        <input
          type="number"
          min={4} max={60}
          value={value}
          onChange={e => onChange(Math.max(4, Math.min(60, Number(e.target.value) || 4)))}
          style={{
            flex: 1,
            padding: '10px 12px',
            border: '2px solid #D0C8B8',
            borderRight: 'none',
            borderRadius: '8px 0 0 8px',
            fontSize: '18px',
            fontWeight: '700',
            fontFamily: 'DM Sans,sans-serif',
            color: '#1A1A18',
            background: 'white',
          }}
        />
        <div style={{
          padding: '10px 14px',
          background: '#1E3A2C',
          color: 'white',
          borderRadius: '0 8px 8px 0',
          fontSize: '13px',
          fontWeight: '700',
          fontFamily: 'DM Sans,sans-serif',
        }}>
          {unit}
        </div>
      </div>
    </div>
  );

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '20px' }}>
        <Input label="WIDTH" value={width}  onChange={onWidth}/>
        <Input label="DEPTH" value={depth} onChange={onDepth}/>
      </div>

      {/* Summary card */}
      <div style={{
        background: 'white',
        border: '2px solid #1E3A2C',
        borderRadius: '10px',
        padding: '16px',
        marginBottom: '14px',
      }}>
        <div style={{
          fontSize: '32px', fontWeight: '700', fontFamily: 'Playfair Display,serif',
          color: '#1E3A2C', textAlign: 'center', marginBottom: '4px',
        }}>
          {sqFt.toLocaleString()} <span style={{ fontSize: '16px', fontWeight: '400' }}>sq ft</span>
        </div>
        <div style={{
          textAlign: 'center', fontSize: '12px', fontFamily: 'DM Sans,sans-serif',
          color: '#8A8A88',
        }}>
          {width}′ wide × {depth}′ deep · est. {boards.toLocaleString()} lineal ft of decking
        </div>
      </div>

      {/* Quick size presets */}
      <div>
        <div style={{ fontSize: '11px', fontWeight: '700', fontFamily: 'DM Sans,sans-serif', color: '#9A9898', letterSpacing: '0.1em', marginBottom: '8px' }}>
          COMMON SIZES
        </div>
        <div style={{ display: 'flex', gap: '7px', flexWrap: 'wrap' }}>
          {[[10,12],[12,16],[14,20],[16,24],[20,30]].map(([w,d]) => (
            <button
              key={`${w}x${d}`}
              onClick={() => { onWidth(w); onDepth(d); }}
              style={{
                padding: '5px 12px',
                border: `1.5px solid ${width===w && depth===d ? '#1E3A2C' : '#D4CCC0'}`,
                borderRadius: '20px',
                fontSize: '11.5px',
                fontFamily: 'DM Sans,sans-serif',
                fontWeight: '600',
                background: width===w && depth===d ? '#1E3A2C' : 'white',
                color: width===w && depth===d ? 'white' : '#4A4A48',
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}
            >
              {w}×{d}′
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
