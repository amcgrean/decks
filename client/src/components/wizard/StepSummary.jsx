import { useState } from 'react';
import { BRANDS, SHAPES, RAILING_STYLES } from '../../data/brands';
import { fireEvent } from '../../utils/analytics';

// Step 7: Summary — review selections, save, share, email, request samples
export default function StepSummary({ sel, env, designId, onSave, onRestart }) {
  const [email,   setEmail]   = useState('');
  const [saving,  setSaving]  = useState(false);
  const [sent,    setSent]    = useState(false);
  const [copied,  setCopied]  = useState(false);
  const [savedId, setSavedId] = useState(designId || null);

  // Sample request form state
  const [showSample,   setShowSample]   = useState(false);
  const [sampleName,   setSampleName]   = useState('');
  const [sampleEmail,  setSampleEmail]  = useState('');
  const [samplePhone,  setSamplePhone]  = useState('');
  const [sampleSent,   setSampleSent]   = useState(false);
  const [sampleSaving, setSampleSaving] = useState(false);

  const brand   = BRANDS.find(b => b.id === sel.brand);
  const shape   = SHAPES.find(s => s.id === sel.shape);
  const railing = RAILING_STYLES.find(r => r.id === sel.railing);
  const sqFt    = Math.round(sel.width * sel.depth);

  const rows = [
    { l: 'Deck Shape',   v: shape?.name },
    { l: 'Dimensions',   v: `${sel.width}′ × ${sel.depth}′ (${sqFt} sq ft)` },
    { l: 'Brand',        v: brand?.name },
    { l: 'Collection',   v: sel.collection },
    { l: 'Color',        v: sel.color?.n },
    { l: 'Railing',      v: railing?.name },
    { l: 'Stairs',       v: sel.stairs?.enabled ? `Yes · ${sel.stairs.steps} steps · ${sel.stairs.width}′ wide · ${sel.stairs.position?.replace('-',' ')}` : 'None' },
  ].filter(r => r.v);

  // ── Save helper (idempotent) ────────────────────────────────
  const ensureSaved = async (emailForSave) => {
    if (savedId) return savedId;
    setSaving(true);
    const id = await onSave(emailForSave || null);
    setSaving(false);
    if (id) setSavedId(id);
    return id;
  };

  // ── Share link ──────────────────────────────────────────────
  const handleShare = async () => {
    const id = await ensureSaved();
    const url = id
      ? `${window.location.origin}?design=${id}`
      : `${window.location.origin}?shape=${sel.shape}&brand=${sel.brand || ''}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
    fireEvent('share_copy', { brand: sel.brand, meta: JSON.stringify({ design_id: id }) });
  };

  // ── Email my design ─────────────────────────────────────────
  const handleEmail = async () => {
    if (!email) return;
    await ensureSaved(email);
    setSent(true);
    fireEvent('design_email', { brand: sel.brand });
  };

  // ── Sample request ──────────────────────────────────────────
  const handleSampleSubmit = async () => {
    if (!sampleName || !sampleEmail) return;
    setSampleSaving(true);
    const id = savedId || await onSave(sampleEmail);
    if (id && !savedId) setSavedId(id);
    try {
      await fetch('/api/samples', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          design_id:   id,
          name:        sampleName,
          email:       sampleEmail,
          phone:       samplePhone,
          color1_hex:  sel.color?.h,
          color1_name: sel.color?.n,
          brand:       sel.brand,
        }),
      });
    } catch {}
    setSampleSaving(false);
    setSampleSent(true);
    fireEvent('sample_request', { brand: sel.brand });
  };

  // ── Sent confirmation ───────────────────────────────────────
  if (sent) return (
    <div style={{ textAlign: 'center', padding: '28px 0' }}>
      <div style={{ fontSize: '42px', marginBottom: '12px' }}>✉️</div>
      <div style={{ fontFamily: 'Playfair Display,serif', fontSize: '20px', color: '#1E3A2C', marginBottom: '8px' }}>
        Design Sent!
      </div>
      <p style={{ fontFamily: 'DM Sans,sans-serif', fontSize: '13px', color: '#6A6A68', marginBottom: '8px', lineHeight: '1.6' }}>
        Sent to <strong>{email}</strong>.<br/>Bring to any Beisser Lumber location.
      </p>
      {savedId && (
        <div style={{ marginBottom: '18px' }}>
          <div style={{ fontFamily: 'DM Sans,sans-serif', fontSize: '11px', color: '#9A9898', marginBottom: '8px' }}>
            Share your design with this link:
          </div>
          <button
            onClick={() => navigator.clipboard.writeText(`${window.location.origin}?design=${savedId}`).then(() => setCopied(true))}
            style={{
              padding: '8px 16px', fontSize: '11px', fontFamily: 'DM Sans,sans-serif',
              fontWeight: '700', background: copied ? '#1E3A2C' : 'white', color: copied ? 'white' : '#1E3A2C',
              border: '2px solid #1E3A2C', borderRadius: '7px', cursor: 'pointer',
            }}
          >
            {copied ? '✓ LINK COPIED' : '🔗 COPY SHARE LINK'}
          </button>
        </div>
      )}
      <button
        onClick={onRestart}
        style={{
          padding: '10px 22px', background: '#1E3A2C', color: 'white',
          border: 'none', borderRadius: '8px', fontFamily: 'DM Sans,sans-serif',
          fontWeight: '700', fontSize: '13px', cursor: 'pointer',
        }}
      >
        Start Over
      </button>
    </div>
  );

  return (
    <div>
      {/* Selected color preview */}
      {sel.color && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '18px',
          padding: '12px', background: 'white', borderRadius: '10px', border: '1px solid #E0D8C8',
        }}>
          <div style={{
            width: '46px', height: '46px', borderRadius: '7px',
            background: sel.color.h, flexShrink: 0, boxShadow: '0 2px 8px rgba(0,0,0,0.24)',
          }}/>
          <div>
            <div style={{ fontFamily: 'Playfair Display,serif', fontSize: '14px', color: '#1A1A18', marginBottom: '2px' }}>
              {sel.color.n}
            </div>
            <div style={{ fontFamily: 'DM Sans,sans-serif', fontSize: '11px', color: '#8A8A88' }}>
              {brand?.name} · {sel.collection} · {sel.color.h.toUpperCase()}
            </div>
          </div>
        </div>
      )}

      {/* Selections table */}
      <div style={{ marginBottom: '18px' }}>
        {rows.map((r, i) => (
          <div key={i} style={{
            display: 'flex', justifyContent: 'space-between',
            padding: '9px 0', borderBottom: '1px solid #EAE4D8',
          }}>
            <span style={{ fontFamily: 'DM Sans,sans-serif', fontSize: '12px', color: '#8A8A88', fontWeight: '500' }}>{r.l}</span>
            <span style={{ fontFamily: 'DM Sans,sans-serif', fontSize: '12px', color: '#1A1A18', fontWeight: '600', textAlign: 'right', maxWidth: '60%' }}>{r.v}</span>
          </div>
        ))}
      </div>

      {/* Share link */}
      <button
        onClick={handleShare}
        disabled={saving}
        style={{
          width: '100%', padding: '11px', marginBottom: '10px',
          background: copied ? '#1E3A2C' : 'white',
          color: copied ? 'white' : '#1E3A2C',
          border: '2px solid #1E3A2C', borderRadius: '8px',
          fontFamily: 'DM Sans,sans-serif', fontWeight: '700',
          fontSize: '12px', cursor: saving ? 'wait' : 'pointer',
          transition: 'all 0.2s', letterSpacing: '0.06em',
          opacity: saving ? 0.7 : 1,
        }}
      >
        {saving ? 'SAVING…' : copied ? '✓ LINK COPIED!' : '🔗 COPY SHARE LINK'}
      </button>

      {/* Email design */}
      <div style={{ background: '#F0EBE0', borderRadius: '10px', padding: '15px', marginBottom: '13px' }}>
        <p style={{
          fontFamily: 'DM Sans,sans-serif', fontSize: '11px', color: '#5A5A58',
          marginBottom: '8px', fontWeight: '700', letterSpacing: '0.05em',
        }}>
          EMAIL MY SELECTIONS
        </p>
        <input
          type="email"
          placeholder="your@email.com"
          value={email}
          onChange={e => setEmail(e.target.value)}
          style={{
            width: '100%', padding: '9px 12px', borderRadius: '7px',
            border: '1.5px solid #D0C8B8', fontFamily: 'DM Sans,sans-serif',
            fontSize: '13px', marginBottom: '8px', background: 'white',
            color: '#1A1A18', boxSizing: 'border-box',
          }}
        />
        <button
          onClick={handleEmail}
          disabled={!email || saving}
          style={{
            width: '100%', padding: '10px',
            background: '#1E3A2C', color: 'white', border: 'none',
            borderRadius: '7px', fontFamily: 'DM Sans,sans-serif',
            fontWeight: '700', fontSize: '12px',
            cursor: email && !saving ? 'pointer' : 'not-allowed',
            opacity: email && !saving ? 1 : 0.5, letterSpacing: '0.06em',
          }}
        >
          {saving ? 'SAVING…' : 'SEND MY DESIGN'}
        </button>
      </div>

      {/* Sample request */}
      <div style={{
        padding: '12px', background: 'rgba(196,146,74,0.08)',
        border: '1.5px solid rgba(196,146,74,0.3)', borderRadius: '8px',
        marginBottom: '14px',
      }}>
        {!showSample && !sampleSent && (
          <button
            onClick={() => setShowSample(true)}
            style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
          >
            <div style={{ fontFamily: 'DM Sans,sans-serif', fontSize: '11.5px', color: '#7A6030', fontWeight: '700', marginBottom: '4px' }}>
              🪵 Request Free Samples
            </div>
            <div style={{ fontFamily: 'DM Sans,sans-serif', fontSize: '11px', color: '#9A8050', lineHeight: '1.5' }}>
              Get physical board samples mailed to you — tap to request.
            </div>
          </button>
        )}

        {sampleSent && (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '22px', marginBottom: '4px' }}>✅</div>
            <div style={{ fontFamily: 'DM Sans,sans-serif', fontSize: '12px', color: '#4A6030', fontWeight: '700' }}>
              Sample request received!
            </div>
            <div style={{ fontFamily: 'DM Sans,sans-serif', fontSize: '11px', color: '#7A8060', marginTop: '4px' }}>
              Our team will be in touch within 1–2 business days.
            </div>
          </div>
        )}

        {showSample && !sampleSent && (
          <div>
            <div style={{ fontFamily: 'DM Sans,sans-serif', fontSize: '10.5px', color: '#7A6030', fontWeight: '700', marginBottom: '10px', letterSpacing: '0.06em' }}>
              🪵 REQUEST FREE SAMPLES
            </div>
            {sel.color && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px', padding: '7px 10px', background: 'rgba(255,255,255,0.7)', borderRadius: '6px' }}>
                <div style={{ width: '20px', height: '20px', borderRadius: '3px', background: sel.color.h, flexShrink: 0 }}/>
                <span style={{ fontFamily: 'DM Sans,sans-serif', fontSize: '11px', color: '#4A3820', fontWeight: '600' }}>
                  {sel.color.n} — {brand?.name}
                </span>
              </div>
            )}
            {[
              { label: 'YOUR NAME *',      value: sampleName,  set: setSampleName,  type: 'text',  ph: 'Jane Smith' },
              { label: 'EMAIL ADDRESS *',  value: sampleEmail, set: setSampleEmail, type: 'email', ph: 'jane@example.com' },
              { label: 'PHONE (OPTIONAL)', value: samplePhone, set: setSamplePhone, type: 'tel',   ph: '(555) 000-0000' },
            ].map(f => (
              <div key={f.label} style={{ marginBottom: '8px' }}>
                <div style={{ fontFamily: 'DM Sans,sans-serif', fontSize: '9.5px', color: '#9A8060', fontWeight: '700', letterSpacing: '0.08em', marginBottom: '4px' }}>
                  {f.label}
                </div>
                <input
                  type={f.type}
                  placeholder={f.ph}
                  value={f.value}
                  onChange={e => f.set(e.target.value)}
                  style={{
                    width: '100%', padding: '8px 10px', borderRadius: '6px',
                    border: '1.5px solid #D0C8B0', fontFamily: 'DM Sans,sans-serif',
                    fontSize: '12px', background: 'white', color: '#1A1A18',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
            ))}
            <button
              onClick={handleSampleSubmit}
              disabled={!sampleName || !sampleEmail || sampleSaving}
              style={{
                width: '100%', padding: '10px', marginTop: '4px',
                background: sampleName && sampleEmail && !sampleSaving ? '#7A6030' : '#C0B898',
                color: 'white', border: 'none', borderRadius: '6px',
                fontFamily: 'DM Sans,sans-serif', fontWeight: '700',
                fontSize: '11.5px', letterSpacing: '0.06em',
                cursor: sampleName && sampleEmail && !sampleSaving ? 'pointer' : 'not-allowed',
              }}
            >
              {sampleSaving ? 'SENDING…' : 'REQUEST SAMPLES'}
            </button>
          </div>
        )}
      </div>

      <p style={{
        fontFamily: 'DM Sans,sans-serif', fontSize: '11.5px', color: '#8A8A88',
        lineHeight: '1.6', textAlign: 'center', marginBottom: '12px',
      }}>
        Beisser Lumber · Iowa's Family Lumberyard Since 1952
      </p>

      <div style={{ textAlign: 'center' }}>
        <button
          onClick={onRestart}
          style={{
            padding: '8px 20px', background: 'transparent', color: '#1E3A2C',
            border: '2px solid #1E3A2C', borderRadius: '7px',
            fontFamily: 'DM Sans,sans-serif', fontWeight: '700',
            fontSize: '12px', cursor: 'pointer',
          }}
        >
          Start New Design
        </button>
      </div>
    </div>
  );
}
