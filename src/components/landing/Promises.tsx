import React from 'react';
import { PROMISES } from '@/lib/constants';

export default function Promises() {
  return (
    <section style={{
      backgroundColor: 'var(--green)',
      color: 'white',
      padding: '80px 24px',
    }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <span style={{ color: 'var(--gold)', fontWeight: 700, fontSize: '0.75rem', letterSpacing: '2px', textTransform: 'uppercase' }}>OUR PROMISES</span>
          <h2 style={{ fontSize: 'clamp(1.6rem, 3vw, 2.4rem)', marginTop: '8px', letterSpacing: '-0.5px' }}>What JobDeyEasy will never do</h2>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '24px'
        }}>
          {PROMISES.map((promise, i) => (
            <div key={i} style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              backgroundColor: 'rgba(255,255,255,0.1)',
              padding: '16px',
              borderRadius: 'var(--radius-sm)',
            }}>
              <span style={{ fontSize: '1.2rem' }}>🤝</span>
              <p style={{ fontWeight: 500, margin: 0 }}>{promise}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
