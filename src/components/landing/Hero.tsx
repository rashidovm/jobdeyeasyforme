'use client';

import React from 'react';
import Button from '@/components/ui/Button';

export default function Hero() {
  return (
    <section style={{
      padding: '80px 24px',
      maxWidth: '1100px',
      margin: '0 auto',
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '48px',
      alignItems: 'center',
    }} className="hero-grid">
      <div>
        <div style={{
          display: 'inline-block',
          backgroundColor: 'var(--gold-light)',
          color: 'var(--gold)',
          padding: '6px 12px',
          borderRadius: '50px',
          fontSize: '0.8rem',
          fontWeight: 700,
          marginBottom: '24px',
          border: '1px solid var(--gold)',
        }}>
          ✨ Founding 20 Offer: Lock in ₦1,500/mo for life
        </div>
        <h1 style={{
          fontSize: 'clamp(2rem, 4vw, 3.2rem)',
          fontWeight: 800,
          letterSpacing: '-1px',
          marginBottom: '16px',
          lineHeight: 1.1,
        }}>
          We do the hard part. You hit Send.
        </h1>
        <p style={{
          fontSize: '1.1rem',
          color: 'var(--grey)',
          marginBottom: '24px',
          lineHeight: 1.6,
        }}>
          JobDeyEasy finds jobs that fit you and prepares everything — a tailored CV, a matching cover letter, and a ready-to-send email. All you do is attach and send.
        </p>

        <div style={{ display: 'flex', gap: '12px', marginBottom: '32px', flexWrap: 'wrap' }}>
          <span style={{ padding: '8px 16px', backgroundColor: 'var(--green-light)', color: 'var(--green)', borderRadius: '50px', fontSize: '0.9rem', fontWeight: 600 }}>📄 Tailored CV</span>
          <span style={{ padding: '8px 16px', backgroundColor: 'var(--green-light)', color: 'var(--green)', borderRadius: '50px', fontSize: '0.9rem', fontWeight: 600 }}>✉️ Cover Letter</span>
          <span style={{ padding: '8px 16px', backgroundColor: 'var(--green-light)', color: 'var(--green)', borderRadius: '50px', fontSize: '0.9rem', fontWeight: 600 }}>📧 Send-ready Email</span>
        </div>

        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <Button href="/signup">Start Free Trial</Button>
          <Button href="#how-it-works" variant="secondary">See how it works</Button>
        </div>

        <div style={{ marginTop: '32px', display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.9rem', color: 'var(--grey)', display: 'flex', alignItems: 'center', gap: '6px' }}>✅ AI-drafted, human-checked</span>
          <span style={{ fontSize: '0.9rem', color: 'var(--grey)', display: 'flex', alignItems: 'center', gap: '6px' }}>✅ No CV? We build one</span>
          <span style={{ fontSize: '0.9rem', color: 'var(--grey)', display: 'flex', alignItems: 'center', gap: '6px' }}>✅ Delivered on WhatsApp</span>
        </div>
      </div>

      <div className="hero-visual" style={{
        backgroundColor: 'var(--white)',
        borderRadius: 'var(--radius)',
        boxShadow: 'var(--shadow-lg)',
        padding: '24px',
        maxWidth: '400px',
        justifySelf: 'center',
        width: '100%',
      }}>
        <div style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'var(--green)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700 }}>J</div>
          <div>
            <div style={{ fontSize: '0.9rem', fontWeight: 700 }}>JobDeyEasy</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--grey)' }}>online</div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ backgroundColor: 'var(--grey-light)', padding: '10px 14px', borderRadius: '12px 12px 12px 0', maxWidth: '80%', fontSize: '0.9rem' }}>
            Hi! I need help applying. I don't have a CV 😭
          </div>
          <div style={{ backgroundColor: 'var(--green-light)', padding: '10px 14px', borderRadius: '12px 12px 0 12px', maxWidth: '80%', alignSelf: 'flex-end', fontSize: '0.9rem', color: 'var(--green-dark)' }}>
            No problem! We'll build your CV, cover letter, and send email — all from scratch 👇
          </div>
          <div style={{ backgroundColor: 'var(--grey-light)', padding: '10px 14px', borderRadius: '12px 12px 12px 0', maxWidth: '80%', fontSize: '0.9rem' }}>
            Done! What happens next?
          </div>
          <div style={{ backgroundColor: 'var(--green-light)', padding: '10px 14px', borderRadius: '12px 12px 0 12px', maxWidth: '80%', alignSelf: 'flex-end', fontSize: '0.9rem', color: 'var(--green-dark)' }}>
            ✅ Your CV, cover letter, and send email are ready. Check your mailbox and copy, paste and send.
          </div>
        </div>
      </div>

      <style jsx>{`
        @media (max-width: 768px) {
          .hero-grid {
            grid-template-columns: 1fr;
            padding: 56px 24px;
          }
          .hero-visual {
            display: none;
          }
        }
      `}</style>
    </section>
  );
}
