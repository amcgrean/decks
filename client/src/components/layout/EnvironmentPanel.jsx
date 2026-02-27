import { useState } from 'react';

// Collapsible house environment settings panel
// Lives in scene header — keeps house options out of the main wizard flow

const HOUSE_STYLES = [
  { id: 'craftsman',  label: 'Craftsman' },
  { id: 'colonial',   label: 'Colonial' },
  { id: 'modern',     label: 'Modern' },
  { id: 'farmhouse',  label: 'Farmhouse' },
];

export default function EnvironmentPanel({ env, onEnv, onClose }) {
  const upd = (k, v) => onEnv(prev => ({ ...prev, [k]: v }));

  return (
    <div style={{
      position: 'absolute',
      top: '100%',
      right: 0,
      zIndex: 300,
      background: '#1A2A1E',
      border: '1px solid rgba(255,255,255,0.12)',
      borderRadius: '12px',
      padding: '16px',
      width: '260px',
      boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
        <span style={{ fontFamily: 'DM Sans,sans-serif', fontSize: '11px', fontWeight: '700', color: 'rgba(255,255,255,0.7)', letterSpacing: '0.1em' }}>
          SCENE SETTINGS
        </span>
        <button onClick={onClose} style={{ color: 'rgba(255,255,255,0.4)', fontSize: '18px', lineHeight: 1, padding: '2px 6px' }}>×</button>
      </div>

      {/* House Style */}
      <div style={{ marginBottom: '14px' }}>
        <div style={{ fontSize: '10px', fontFamily: 'DM Sans,sans-serif', color: 'rgba(255,255,255,0.45)', letterSpacing: '0.1em', marginBottom: '7px' }}>
          HOUSE STYLE
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
          {HOUSE_STYLES.map(s => {
            const active = env.houseStyle === s.id;
            return (
              <button
                key={s.id}
                onClick={() => upd('houseStyle', s.id)}
                style={{
                  padding: '6px 8px',
                  border: `1.5px solid ${active ? '#C4924A' : 'rgba(255,255,255,0.15)'}`,
                  borderRadius: '6px',
                  fontSize: '11px',
                  fontFamily: 'DM Sans,sans-serif',
                  fontWeight: '600',
                  background: active ? 'rgba(196,146,74,0.18)' : 'transparent',
                  color: active ? '#C4924A' : 'rgba(255,255,255,0.55)',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
              >
                {s.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* House Color */}
      <div style={{ marginBottom: '14px' }}>
        <div style={{ fontSize: '10px', fontFamily: 'DM Sans,sans-serif', color: 'rgba(255,255,255,0.45)', letterSpacing: '0.1em', marginBottom: '7px' }}>
          HOUSE COLOR
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <input
            type="color"
            value={env.houseColor}
            onChange={e => upd('houseColor', e.target.value)}
            style={{ width: '36px', height: '28px', border: 'none', borderRadius: '4px', cursor: 'pointer', background: 'transparent' }}
          />
          <span style={{ fontFamily: 'DM Sans,sans-serif', fontSize: '11px', color: 'rgba(255,255,255,0.55)', fontWeight: '600' }}>
            {env.houseColor.toUpperCase()}
          </span>
        </div>
      </div>

      {/* Toggles */}
      {[
        { key: 'showDoor',  label: 'Patio Door' },
        { key: 'showGrass', label: 'Grass / Lawn' },
      ].map(({ key, label }) => {
        const on = env[key];
        return (
          <div
            key={key}
            onClick={() => upd(key, !on)}
            style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '7px 0', borderBottom: '1px solid rgba(255,255,255,0.07)',
              cursor: 'pointer',
            }}
          >
            <span style={{ fontFamily: 'DM Sans,sans-serif', fontSize: '12px', color: 'rgba(255,255,255,0.6)' }}>
              {label}
            </span>
            <div style={{
              width: '36px', height: '20px', borderRadius: '10px',
              background: on ? '#1E3A2C' : 'rgba(255,255,255,0.15)',
              border: `1.5px solid ${on ? '#C4924A' : 'rgba(255,255,255,0.2)'}`,
              position: 'relative', transition: 'all 0.2s',
            }}>
              <div style={{
                position: 'absolute', top: '2px',
                left: on ? '17px' : '2px',
                width: '14px', height: '14px', borderRadius: '50%',
                background: on ? '#C4924A' : 'rgba(255,255,255,0.4)',
                transition: 'left 0.2s',
              }}/>
            </div>
          </div>
        );
      })}
    </div>
  );
}
