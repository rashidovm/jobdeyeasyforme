import React from 'react';
import { HOW_IT_WORKS_STEPS } from '@/lib/constants';

export default function HowItWorks() {
  return (
    <section id="how-it-works" style={{ padding: '80px 24px', backgroundColor: 'var(--white)' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <span style={{ color: 'var(--gold)', fontWeight: 700, fontSize: '0.75rem', letterSpacing: '2px', textTransform: 'uppercase' }}>HOW IT WORKS</span>
          <h2 style={{ fontSize: 'clamp(1.6rem, 3vw, 2.4rem)', marginTop: '8px', letterSpacing: '-0.5px' }}>Five simple steps to your next job</h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '24px' }}>
          {HOW_IT_WORKS_STEPS.map((step) => (
            <div key={step.num} style={{
              padding: '24px',
              backgroundColor: 'var(--cream)',
              borderRadius: 'var(--radius)',
              border: '1px solid var(--border)',
            }}>
              <div style={{
                width: '40px',
                height: '40px',
                backgroundColor: 'var(--green)',
                color: 'white',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                marginBottom: '16px'
              }}>
                {step.num}
              </div>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '8px' }}>{step.title}</h3>
              <p style={{ color: 'var(--grey)', fontSize: '0.9rem', lineHeight: 1.6 }}>{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
