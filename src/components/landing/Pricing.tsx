'use client';

import React, { useState, useEffect } from 'react';
import { PLANS } from '@/lib/constants';
import { supabase } from '@/lib/supabase';
import Button from '@/components/ui/Button';

export default function Pricing() {
  const [spotsLeft, setSpotsLeft] = useState(20);

  useEffect(() => {
    async function fetchLaunchSlots() {
      const { data } = await supabase
        .from('launch_slots')
        .select('filled_count, cap')
        .eq('id', 1)
        .single();

      if (data) {
        setSpotsLeft(Math.max(0, data.cap - data.filled_count));
      }
    }
    fetchLaunchSlots();
  }, []);

  return (
    <section id="pricing" style={{ padding: '80px 24px', backgroundColor: 'var(--cream)' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <span style={{ color: 'var(--gold)', fontWeight: 700, fontSize: '0.75rem', letterSpacing: '2px', textTransform: 'uppercase' }}>PRICING</span>
          <h2 style={{ fontSize: 'clamp(1.6rem, 3vw, 2.4rem)', marginTop: '8px', letterSpacing: '-0.5px' }}>Simple, honest pricing</h2>
          <p style={{ color: 'var(--grey)', marginTop: '8px' }}>No hidden fees. Cancel anytime.</p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '24px',
          marginBottom: '32px'
        }} className="pricing-grid">
          {PLANS.map((plan) => (
            <div key={plan.id} style={{
              backgroundColor: 'var(--white)',
              border: plan.id === 'starter' ? '2px solid var(--green)' : '1px solid var(--border)',
              borderRadius: 'var(--radius)',
              padding: '32px 24px',
              boxShadow: 'var(--shadow-sm)',
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
            }}>
              {plan.founding20 && spotsLeft > 0 && (
                <div style={{
                  position: 'absolute',
                  top: '-12px',
                  right: '24px',
                  backgroundColor: 'var(--gold)',
                  color: 'white',
                  padding: '4px 12px',
                  borderRadius: '50px',
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}>
                  <span style={{ width: '6px', height: '6px', backgroundColor: 'white', borderRadius: '50%', animation: 'pulse 2s infinite' }}></span>
                  Founding 20
                </div>
              )}
              <h3 style={{ fontSize: '1.2rem', marginBottom: '8px' }}>{plan.name}</h3>
              <div style={{ marginBottom: '16px' }}>
                <span style={{ fontSize: '2rem', fontWeight: 800 }}>{plan.priceLabel}</span>
                <span style={{ color: 'var(--grey)', fontSize: '0.9rem' }}>{plan.period}</span>
              </div>
              <p style={{ color: 'var(--grey)', fontSize: '0.85rem', marginBottom: '24px', minHeight: '40px' }}>{plan.description}</p>
              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 24px 0', flexGrow: 1 }}>
                {plan.features.map((f, i) => (
                  <li key={i} style={{ display: 'flex', alignItems: 'start', gap: '8px', marginBottom: '12px', fontSize: '0.9rem' }}>
                    <span style={{ color: 'var(--green)', fontWeight: 700 }}>✓</span> {f}
                  </li>
                ))}
              </ul>
              <Button href="/signup" variant={plan.id === 'starter' ? 'primary' : 'secondary'} fullWidth>
                {plan.cta}
              </Button>
            </div>
          ))}
        </div>

        {spotsLeft > 0 && (
          <div style={{
            backgroundColor: 'var(--gold-light)',
            border: '1px solid var(--gold)',
            borderRadius: 'var(--radius-sm)',
            padding: '16px',
            textAlign: 'center',
            color: 'var(--gold)',
            fontWeight: 500,
            fontSize: '0.9rem'
          }}>
            🎉 Only {spotsLeft} spots left for the Founding 20 offer! Lock in ₦1,500/month for life.
          </div>
        )}
      </div>
      <style jsx>{`
        @keyframes pulse {
          0% { opacity: 1; }
          50% { opacity: 0.4; }
          100% { opacity: 1; }
        }
      `}</style>
    </section>
  );
}
