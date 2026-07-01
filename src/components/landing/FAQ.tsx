'use client';

import React, { useState } from 'react';
import { FAQS } from '@/lib/constants';

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section id="faq" style={{ padding: '80px 24px', backgroundColor: 'var(--white)' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <span style={{ color: 'var(--gold)', fontWeight: 700, fontSize: '0.75rem', letterSpacing: '2px', textTransform: 'uppercase' }}>FAQ</span>
          <h2 style={{ fontSize: 'clamp(1.6rem, 3vw, 2.4rem)', marginTop: '8px', letterSpacing: '-0.5px' }}>Questions? We have answers.</h2>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {FAQS.map((faq, i) => (
            <div key={i} style={{
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-sm)',
              overflow: 'hidden',
              backgroundColor: 'var(--cream)',
            }}>
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                style={{
                  width: '100%',
                  padding: '20px 24px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  textAlign: 'left',
                  fontWeight: 600,
                  fontSize: '1rem',
                  color: 'var(--dark)',
                }}
                aria-expanded={openIndex === i}
              >
                {faq.q}
                <span style={{
                  transform: openIndex === i ? 'rotate(45deg)' : 'rotate(0)',
                  transition: 'transform 0.2s ease',
                  fontSize: '1.5rem',
                  color: 'var(--green)'
                }}>+</span>
              </button>
              <div style={{
                maxHeight: openIndex === i ? '500px' : '0',
                overflow: 'hidden',
                transition: 'max-height 0.3s ease',
              }}>
                <p style={{ padding: '0 24px 20px 24px', color: 'var(--grey)', lineHeight: 1.6 }}>{faq.a}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
