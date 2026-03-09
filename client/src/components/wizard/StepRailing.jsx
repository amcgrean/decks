import { RAILING_BRANDS, RAILING_COLORS } from '../../data/brands';

// Step 5: Railing style and color selection
export default function StepRailing({ selBrand, selSeries, selColor, onSelBrand, onSelSeries, onSelColor }) {
  // If no brand selected, or brand doesn't exist, show generic
  const currentBrand = RAILING_BRANDS.find(b => b.id === selBrand);
  const seriesList = currentBrand ? currentBrand.series : [];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

      {/* 1. Style Selection */}
      <div>
        <h3>1. Select Railing System</h3>
        <p className="wizard-step-desc">Choose from our premium railing brands and collections.</p>

        <div className="railing-grid" style={{ marginBottom: '16px' }}>
          <div
            className={`railing-card ${selBrand === 'none' ? 'active' : ''}`}
            onClick={() => onSelBrand('none')}
          >
            <div className="railing-icon" style={{ fontSize: '24px' }}>🚫</div>
            <div className="railing-info">
              <h4>No Railing</h4>
              <p>Open ground-level look</p>
            </div>
          </div>
          {RAILING_BRANDS.map(brand => (
            <div
              key={brand.id}
              className={`railing-card ${selBrand === brand.id ? 'active' : ''}`}
              onClick={() => onSelBrand(brand.id)}
            >
              <div className="railing-icon" style={{ fontSize: '24px' }}>🛡️</div>
              <div className="railing-info">
                <h4>{brand.name}</h4>
                <p>Select to view series</p>
              </div>
            </div>
          ))}
        </div>

        {currentBrand && (
          <>
            <h3 style={{ marginTop: '24px' }}>2. Select Series ({currentBrand.name})</h3>
            <div className="railing-grid">
              {seriesList.map(item => (
                <div
                  key={item.id}
                  className={`railing-card ${selSeries === item.id ? 'active' : ''}`}
                  onClick={() => onSelSeries(item.id)}
                >
                  <div className="railing-icon" style={{ fontSize: '24px' }}>
                    {item.style === 'glass' ? '🪟' : (item.style === 'cable' ? '🧵' : (item.style === 'horizontal' ? '☰' : '🏛️'))}
                  </div>
                  <div className="railing-info">
                    <h4>{item.name}</h4>
                    <p>{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* 2. Color Selection (only if railing is enabled) */}
      {selBrand && selBrand !== 'none' && (
        <div className="config-box animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <h3>{selBrand === 'none' ? 'Colors Unavailable' : '3. Select Hardware Color'}</h3>
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
