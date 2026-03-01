import { useState, useEffect, useRef } from 'react';
import Scene from './components/scene/Scene';
import StepShape   from './components/wizard/StepShape';
import StepSize    from './components/wizard/StepSize';
import StepBrand   from './components/wizard/StepBrand';
import StepColor   from './components/wizard/StepColor';
import StepRailing from './components/wizard/StepRailing';
import StepStairs  from './components/wizard/StepStairs';
import StepSummary from './components/wizard/StepSummary';
import EnvironmentPanel from './components/layout/EnvironmentPanel';
import { BRANDS, VIEWS, STEP_LABELS } from './data/brands';
import { fireEvent } from './utils/analytics';

const TOTAL_STEPS = 7; // 0–6

export default function App() {
  const [step,          setStep]   = useState(0);
  const [view,          setView]   = useState('surface');
  const [mobile,        setMobile] = useState(false);
  const [sceneExpanded, setExpand] = useState(false);
  const [showEnv,       setShowEnv]= useState(false);
  const [designId,      setDesignId] = useState(null);

  const [sel, setSel] = useState({
    shape:      'rectangle',
    width:      12,
    depth:      16,
    brand:      null,
    collection: null,
    color:      null,
    railing:    'baluster',
    stairs: {
      enabled:  false,
      steps:    3,
      width:    5,
      position: 'front-center',
    },
  });

  const [env, setEnv] = useState({
    houseStyle: 'craftsman',
    houseColor: '#F0E8D8',
    showDoor:   true,
    showGrass:  true,
  });

  // ── RESPONSIVE DETECTION ──────────────────────────────────
  useEffect(() => {
    const check = () => setMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // ── ANALYTICS: session start ──────────────────────────────
  useEffect(() => {
    fireEvent('session_start');
  }, []);

  // ── LOAD SHARED DESIGN FROM URL (?design=UUID) ────────────
  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get('design');
    if (!id) return;
    fetch(`/api/designs/${id}`)
      .then(r => r.ok ? r.json() : null)
      .then(d => {
        if (!d) return;
        setSel({
          shape:      d.deck_shape  || 'rectangle',
          width:      d.deck_width  || 12,
          depth:      d.deck_depth  || 16,
          brand:      d.product?.brand      || null,
          collection: d.product?.collection || null,
          color:      d.product ? { n: d.product.color_name, h: d.product.hex } : null,
          railing:    d.railing_style || 'baluster',
          stairs:     d.stair_config
            ? { ...d.stair_config, enabled: !!d.has_stairs }
            : { enabled: !!d.has_stairs, steps: 3, width: 5, position: 'front-center' },
        });
        if (d.house_style)     setEnv(e => ({ ...e, houseStyle: d.house_style }));
        if (d.house_color_hex) setEnv(e => ({ ...e, houseColor: d.house_color_hex }));
        setDesignId(id);
        setStep(6);
      })
      .catch(() => {});
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── SAVE DESIGN → /api/designs ────────────────────────────
  const saveDesign = async (customerEmail) => {
    if (designId) return designId;
    try {
      const res = await fetch('/api/designs', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          house_style:     env.houseStyle,
          house_color_hex: env.houseColor,
          deck_shape:  sel.shape,
          deck_width:  sel.width,
          deck_depth:  sel.depth,
          brand:       sel.brand,
          color_hex:   sel.color?.h,
          railing_style: sel.railing,
          has_stairs:  sel.stairs?.enabled ? 1 : 0,
          stair_config: sel.stairs,
          customer_email: customerEmail || null,
        }),
      });
      if (!res.ok) return null;
      const { id } = await res.json();
      setDesignId(id);
      return id;
    } catch { return null; }
  };

  // ── STATE HELPERS ─────────────────────────────────────────
  const upd = (k, v) => setSel(s => ({ ...s, [k]: v }));

  const brand = BRANDS.find(b => b.id === sel.brand);

  const canNext = () => {
    if (step === 0) return !!sel.shape;
    if (step === 1) return sel.width > 0 && sel.depth > 0;
    if (step === 2) return !!sel.brand;
    if (step === 3) return !!sel.color;
    if (step === 4) return !!sel.railing;
    if (step === 5) return true; // stairs optional
    return true;
  };

  const goNext = () => {
    if (step < TOTAL_STEPS - 1 && canNext()) setStep(s => s + 1);
  };

  const goBack = () => {
    if (step > 0) setStep(s => s - 1);
  };

  const restart = () => {
    setStep(0);
    setView('surface');
    setExpand(false);
    setDesignId(null);
    setSel({
      shape: 'rectangle', width: 12, depth: 16,
      brand: null, collection: null, color: null, railing: 'baluster',
      stairs: { enabled: false, steps: 3, width: 5, position: 'front-center' },
    });
  };

  const handleViewChange = (v) => {
    setView(v);
    fireEvent('view_change', { meta: JSON.stringify({ view: v }) });
  };

  const handleBrandSelect = (id) => {
    upd('brand', id);
    upd('collection', null);
    upd('color', null);
    fireEvent('brand_select', { brand: id });
  };

  const handleColorSelect = (color) => {
    upd('color', color);
    const product = BRANDS.find(b => b.id === sel.brand)
      ?.cols.flatMap(c => c.colors)
      .find(c => c.h === color.h);
    fireEvent('color_select', {
      brand: sel.brand,
      meta: JSON.stringify({ color: color.n, hex: color.h }),
    });
  };

  const progress = (step / (TOTAL_STEPS - 1)) * 100;

  // ── STEP SUBTITLES ────────────────────────────────────────
  const subtitles = [
    'Choose the footprint that fits your outdoor space.',
    'Enter the width and depth to calculate square footage.',
    'Beisser carries all the major decking brands.',
    'Browse collections and find your perfect board color.',
    'Frame your deck with the right railing style.',
    'Add stair access to your deck if needed.',
    'Your design is complete — save and share it.',
  ];

  // ── WIZARD CONTENT ────────────────────────────────────────
  const renderStep = () => {
    switch (step) {
      case 0: return <StepShape sel={sel.shape} onSel={v => upd('shape', v)}/>;
      case 1: return (
        <StepSize
          width={sel.width}  depth={sel.depth}
          onWidth={v => upd('width', v)} onDepth={v => upd('depth', v)}
        />
      );
      case 2: return <StepBrand sel={sel.brand} onSel={handleBrandSelect}/>;
      case 3: return (
        <StepColor
          brandId={sel.brand}
          selCol={sel.collection || brand?.cols[0]?.n}
          selColor={sel.color}
          onSelCol={v => { upd('collection', v); upd('color', null); }}
          onSelColor={handleColorSelect}
        />
      );
      case 4: return <StepRailing sel={sel.railing} onSel={v => upd('railing', v)}/>;
      case 5: return <StepStairs stairs={sel.stairs} onStairs={v => upd('stairs', v)}/>;
      case 6: return <StepSummary sel={sel} env={env} designId={designId} onSave={saveDesign} onRestart={restart}/>;
      default: return null;
    }
  };

  // ── SHARED UI SUB-COMPONENTS ──────────────────────────────

  const SceneHeader = () => {
    const envRef = useRef(null);
    return (
      <div style={{
        padding: '11px 15px', display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', background: 'rgba(0,0,0,0.38)',
        flexShrink: 0, position: 'relative',
      }}>
        <div>
          <div style={{
            fontFamily: 'Playfair Display,serif', fontSize: '14px', color: 'white',
            fontWeight: '700', letterSpacing: '0.05em',
          }}>
            BEISSER LUMBER
          </div>
          <div style={{
            fontFamily: 'DM Sans,sans-serif', fontSize: '8.5px',
            color: 'rgba(255,255,255,0.46)', letterSpacing: '0.16em', marginTop: '1px',
          }}>
            DECK VISUALIZER
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* Selected color chip */}
          {sel.color && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: '5px',
              background: 'rgba(255,255,255,0.11)', borderRadius: '20px', padding: '4px 10px',
            }}>
              <div style={{
                width: '9px', height: '9px', borderRadius: '50%',
                background: sel.color.h, border: '1.5px solid rgba(255,255,255,0.4)', flexShrink: 0,
              }}/>
              <span style={{ fontFamily: 'DM Sans,sans-serif', fontSize: '10px', color: 'rgba(255,255,255,0.88)', fontWeight: '600' }}>
                {sel.color.n}
              </span>
            </div>
          )}

          {/* Scene settings button */}
          <div ref={envRef} style={{ position: 'relative' }}>
            <button
              onClick={() => setShowEnv(v => !v)}
              style={{
                background: showEnv ? 'rgba(196,146,74,0.2)' : 'rgba(255,255,255,0.1)',
                border: `1px solid ${showEnv ? 'rgba(196,146,74,0.5)' : 'rgba(255,255,255,0.22)'}`,
                borderRadius: '6px', padding: '4px 9px',
                fontFamily: 'DM Sans,sans-serif', fontSize: '10px',
                color: showEnv ? '#C4924A' : 'rgba(255,255,255,0.7)', fontWeight: '600',
              }}
            >
              ⚙ Scene
            </button>
            {showEnv && (
              <EnvironmentPanel env={env} onEnv={setEnv} onClose={() => setShowEnv(false)}/>
            )}
          </div>

          {/* Mobile expand/collapse */}
          {mobile && (
            <button
              onClick={() => setExpand(v => !v)}
              style={{
                background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.22)',
                borderRadius: '6px', padding: '4px 9px',
                fontFamily: 'DM Sans,sans-serif', fontSize: '10px',
                color: 'rgba(255,255,255,0.8)', fontWeight: '600',
              }}
            >
              {sceneExpanded ? '▲' : '▼'}
            </button>
          )}
        </div>
      </div>
    );
  };

  const ViewTabs = () => (
    <div style={{
      display: 'flex', gap: '5px', padding: '7px 12px',
      background: 'rgba(0,0,0,0.28)', flexShrink: 0,
    }}>
      {VIEWS.map(v => {
        const active = view === v.id;
        return (
          <button
            key={v.id}
            onClick={() => handleViewChange(v.id)}
            style={{
              flex: 1, padding: '6px 4px', border: '1.5px solid',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px',
              borderColor: active ? 'rgba(255,255,255,0.88)' : 'rgba(255,255,255,0.18)',
              borderRadius: '7px',
              background: active ? 'rgba(255,255,255,0.17)' : 'transparent',
              transition: 'all 0.14s',
            }}
          >
            <span style={{ fontSize: '13px', lineHeight: 1 }}>{v.icon}</span>
            <span style={{
              fontFamily: 'DM Sans,sans-serif', fontSize: '8px',
              fontWeight: active ? '700' : '500', letterSpacing: '0.07em',
              color: active ? 'white' : 'rgba(255,255,255,0.48)',
            }}>
              {v.label.toUpperCase()}
            </span>
          </button>
        );
      })}
    </div>
  );

  const MetaStrip = () => {
    const parts = [
      sel.shape,
      brand && brand.name,
      sel.railing && sel.railing !== 'none' && sel.railing,
    ].filter(Boolean);
    return (
      <div style={{
        padding: '7px 15px', background: 'rgba(0,0,0,0.22)',
        display: 'flex', gap: '14px', flexShrink: 0,
        flexWrap: 'wrap', alignItems: 'center',
      }}>
        {parts.map((lbl, i) => (
          <span key={i} style={{
            fontFamily: 'DM Sans,sans-serif', fontSize: '9px',
            color: 'rgba(255,255,255,0.38)', letterSpacing: '0.1em',
          }}>
            {lbl.toUpperCase()}
          </span>
        ))}
        <span style={{
          marginLeft: 'auto', fontFamily: 'DM Sans,sans-serif', fontSize: '9px',
          color: 'rgba(255,255,255,0.3)', letterSpacing: '0.08em',
        }}>
          {VIEWS.find(v => v.id === view)?.icon} {view.toUpperCase()}
        </span>
      </div>
    );
  };

  const ProgressBar = () => (
    <div style={{ height: '3.5px', background: '#DDD5C4', flexShrink: 0 }}>
      <div style={{ height: '100%', background: '#1E3A2C', width: `${progress}%`, transition: 'width 0.4s ease' }}/>
    </div>
  );

  const WizardContent = ({ padBottom = 0 }) => (
    <div style={{ flex: 1, overflowY: 'auto', padding: `20px 20px 12px`, paddingBottom: padBottom || '12px' }}>
      <div style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
          <div style={{
            width: '23px', height: '23px', borderRadius: '50%', background: '#1E3A2C',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'DM Sans,sans-serif', fontSize: '10.5px', fontWeight: '700',
            color: 'white', flexShrink: 0,
          }}>
            {step < TOTAL_STEPS - 1 ? step + 1 : '✓'}
          </div>
          <span style={{
            fontFamily: 'DM Sans,sans-serif', fontSize: '10px', color: '#9A9898',
            letterSpacing: '0.12em', fontWeight: '600',
          }}>
            {step < TOTAL_STEPS - 1 ? `STEP ${step+1} OF ${TOTAL_STEPS-1}` : 'COMPLETE'}
          </span>
        </div>
        <h2 style={{
          fontFamily: 'Playfair Display,serif', fontSize: mobile ? '20px' : '22px',
          color: '#1A1A18', fontWeight: '700', marginBottom: '5px',
        }}>
          {STEP_LABELS[step]}
        </h2>
        <p style={{ fontFamily: 'DM Sans,sans-serif', fontSize: '12.5px', color: '#787870', lineHeight: '1.55' }}>
          {subtitles[step]}
        </p>
        {/* Hint for color/railing steps to switch views */}
        {(step === 3 || step === 4) && (
          <div style={{
            marginTop: '9px', padding: '7px 11px', background: 'rgba(30,58,44,0.07)',
            borderRadius: '7px', border: '1px solid rgba(30,58,44,0.13)',
            display: 'flex', alignItems: 'center', gap: '7px',
          }}>
            <span style={{ fontSize: '12px' }}>💡</span>
            <span style={{ fontFamily: 'DM Sans,sans-serif', fontSize: '11px', color: '#4A6A58', fontWeight: '500' }}>
              Switch <strong>views</strong> above to see from different angles
            </span>
          </div>
        )}
      </div>
      {renderStep()}
    </div>
  );

  const NavBar = ({ fixed = false }) => (
    <div style={{
      padding: fixed ? '10px 14px' : '14px 22px',
      borderTop: '1px solid #E0D8C8',
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      background: 'rgba(240,234,216,0.97)', backdropFilter: 'blur(10px)',
      flexShrink: 0,
      ...(fixed ? { position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 200 } : {}),
    }}>
      <button
        onClick={goBack}
        disabled={step === 0}
        style={{
          padding: '9px 16px', background: 'transparent', border: '2px solid',
          borderColor: step === 0 ? '#D4CCBC' : '#B8B0A0', borderRadius: '8px',
          fontFamily: 'DM Sans,sans-serif', fontWeight: '700', fontSize: '12px',
          color: step === 0 ? '#C8C0B0' : '#4A4A48',
        }}
      >
        ← Back
      </button>

      {/* Progress dots */}
      <div style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
        {STEP_LABELS.slice(0, -1).map((_, i) => (
          <div key={i} style={{
            width: step === i ? '15px' : '5.5px', height: '5.5px', borderRadius: '3px',
            background: i <= step ? '#1E3A2C' : '#D0C8BC', transition: 'all 0.24s',
          }}/>
        ))}
      </div>

      <button
        onClick={goNext}
        disabled={!canNext()}
        style={{
          padding: '9px 16px', border: 'none', borderRadius: '8px',
          fontFamily: 'DM Sans,sans-serif', fontWeight: '700', fontSize: '12px',
          background: canNext() ? '#1E3A2C' : '#D8D0C0',
          color: canNext() ? 'white' : '#B0A898',
          boxShadow: canNext() ? '0 4px 12px rgba(30,58,44,0.28)' : 'none',
          transition: 'all 0.15s',
        }}
      >
        {step === TOTAL_STEPS - 2 ? 'See My Design →' : 'Next →'}
      </button>
    </div>
  );

  const sceneProps = {
    houseStyle:  env.houseStyle,
    houseColor:  env.houseColor,
    showDoor:    env.showDoor,
    showGrass:   env.showGrass,
    shape:       sel.shape,
    deckColor:   sel.color,
    railingStyle: sel.railing,
    view,
  };

  // ── DESKTOP LAYOUT (≥768px) ───────────────────────────────
  if (!mobile) {
    return (
      <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', fontFamily: 'DM Sans,sans-serif' }}>
        {/* Scene panel — 57% */}
        <div style={{ flex: '0 0 57%', display: 'flex', flexDirection: 'column', background: '#182218', overflow: 'hidden' }}>
          <SceneHeader/>
          <ViewTabs/>
          <div style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
            <Scene {...sceneProps}/>
          </div>
          <MetaStrip/>
        </div>

        {/* Wizard panel — 43% */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: '#F0EAD8' }}>
          <ProgressBar/>
          <WizardContent/>
          {step < TOTAL_STEPS - 1 && <NavBar/>}
        </div>
      </div>
    );
  }

  // ── MOBILE LAYOUT (<768px) ────────────────────────────────
  const SCENE_H = sceneExpanded ? '62vh' : '40vh';
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden', fontFamily: 'DM Sans,sans-serif' }}>
      {/* Scene — top portion, expandable on tap */}
      <div style={{
        background: '#182218', flexShrink: 0, display: 'flex', flexDirection: 'column',
        height: SCENE_H, transition: 'height 0.3s ease', overflow: 'hidden',
      }}>
        <SceneHeader/>
        <ViewTabs/>
        <div style={{ flex: 1, overflow: 'hidden' }}>
          <Scene {...sceneProps}/>
        </div>
        {!sceneExpanded && <MetaStrip/>}
      </div>

      {/* Progress bar */}
      <ProgressBar/>

      {/* Wizard — scrollable remaining space */}
      <div style={{ flex: 1, overflowY: 'auto', background: '#F0EAD8', paddingBottom: '72px' }}>
        <WizardContent padBottom={80}/>
      </div>

      {/* Fixed bottom nav */}
      {step < TOTAL_STEPS - 1 && <NavBar fixed/>}
    </div>
  );
}
