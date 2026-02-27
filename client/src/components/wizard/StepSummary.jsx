import { useState } from 'react';
import { BRANDS, SHAPES, RAILING_STYLES } from '../../data/brands';

// Step 7: Summary — review selections, share, email, request samples
export default function StepSummary({ sel, onRestart }) {
  const [email, setEmail]   = useState('');
  const [sent,  setSent]    = useState(false);
  const [copied, setCopied] = useState(false);

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

  const handleShare = () => {
    const params = new URLSearchParams({
      shape: sel.shape || '',
      brand: sel.brand || '',
      color: sel.color?.h || '',
      railing: sel.railing || '',
    });
    const url = `${window.location.origin}?${params}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleEmail = () => {
    if (email) {
      setSent(true);
      // In Phase 2, this will POST to /api/designs and send email via server
    }
  };

  if (sent) return (
    <div style={{ textAlign: 'center', padding: '28px 0' }}>
      <div style={{ fontSize: '42px', marginBottom: '12px' }}>✉️</div>
      <div style={{ fontFamily: 'Playfair Display,serif', fontSize: '20px', color: '#1E3A2C', marginBottom: '8px' }}>
        Design Sent!
      </div>
      <p style={{ fontFamily: 'DM Sans,sans-serif', fontSize: '13px', color: '#6A6A68', marginBottom: '22px', lineHeight: '1.6' }}>
        Sent to <strong>{email}</strong>.<br/>Bring to any Beisser Lumber location.
      </p>
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
        style={{
          width: '100%', padding: '11px', marginBottom: '10px',
          background: copied ? '#1E3A2C' : 'white',
          color: copied ? 'white' : '#1E3A2C',
          border: '2px solid #1E3A2C', borderRadius: '8px',
          fontFamily: 'DM Sans,sans-serif', fontWeight: '700',
          fontSize: '12px', cursor: 'pointer', transition: 'all 0.2s',
          letterSpacing: '0.06em',
        }}
      >
        {copied ? '✓ LINK COPIED!' : '🔗 COPY SHARE LINK'}
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
          style={{
            width: '100%', padding: '10px',
            background: '#1E3A2C', color: 'white', border: 'none',
            borderRadius: '7px', fontFamily: 'DM Sans,sans-serif',
            fontWeight: '700', fontSize: '12px', cursor: 'pointer',
            opacity: email ? 1 : 0.5, letterSpacing: '0.06em',
          }}
        >
          SEND MY DESIGN
        </button>
      </div>

      {/* Request samples CTA */}
      <div style={{
        padding: '12px', background: 'rgba(196,146,74,0.08)',
        border: '1.5px solid rgba(196,146,74,0.3)', borderRadius: '8px',
        marginBottom: '14px', textAlign: 'center',
      }}>
        <div style={{ fontFamily: 'DM Sans,sans-serif', fontSize: '11.5px', color: '#7A6030', fontWeight: '700', marginBottom: '4px' }}>
          🪵 Request Free Samples
        </div>
        <div style={{ fontFamily: 'DM Sans,sans-serif', fontSize: '11px', color: '#9A8050', lineHeight: '1.5' }}>
          Visit any Beisser Lumber location or call to order samples.
        </div>
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
