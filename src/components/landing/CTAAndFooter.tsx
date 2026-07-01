import React from 'react';
import Button from '@/components/ui/Button';
import { buildWhatsappLink } from '@/lib/supabase';

export default function CTAAndFooter() {
  return (
    <>
      <section style={{ padding: '80px 24px', backgroundColor: 'var(--cream)' }}>
        <div style={{
          maxWidth: '800px',
          margin: '0 auto',
          textAlign: 'center',
          backgroundColor: 'var(--white)',
          padding: '48px',
          borderRadius: 'var(--radius)',
          boxShadow: 'var(--shadow)',
        }}>
          <h2 style={{ fontSize: 'clamp(1.6rem, 3vw, 2.4rem)', marginBottom: '16px', letterSpacing: '-0.5px' }}>
            Ready to let us do the hard part?
          </h2>
          <p style={{ color: 'var(--grey)', marginBottom: '32px', fontSize: '1.1rem' }}>
            Start your free trial today. No credit card required.
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button href="/signup">Start Free Trial</Button>
            <Button
              href={buildWhatsappLink("Hi! I want to start my free trial.")}
              variant="whatsapp"
            >
              💬 Chat on WhatsApp
            </Button>
          </div>
        </div>
      </section>

      <footer style={{
        backgroundColor: 'var(--dark)',
        color: 'var(--grey-light)',
        padding: '48px 24px',
      }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: '32px' }}>
          <div style={{ maxWidth: '300px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
                <path d="M16 2C8 2 2 8 2 16C2 24 8 30 16 30C24 30 30 24 30 16C30 8 24 2 16 2ZM16 28C9 28 4 23 4 16C4 9 9 4 16 4C23 4 28 9 28 16C28 23 23 28 16 28Z" fill="var(--green)"/>
                <path d="M9 16L14 21L23 12" stroke="var(--green)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="26" cy="6" r="2" fill="var(--gold)"/>
              </svg>
              <span style={{ fontWeight: 800, fontSize: '1.2rem', color: 'white' }}>
                <span style={{ color: 'var(--green)' }}>Job</span>
                <span style={{ color: 'var(--gold)' }}>Dey</span>
                <span style={{ color: 'var(--green)' }}>Easy</span>
              </span>
            </div>
            <p style={{ fontSize: '0.9rem', fontStyle: 'italic' }}>We send. You shine.</p>
          </div>

          <div style={{ display: 'flex', gap: '48px', flexWrap: 'wrap' }}>
            <div>
              <h4 style={{ color: 'white', marginBottom: '16px', fontSize: '0.9rem' }}>Company</h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <li><a href="#how-it-works" style={{ fontSize: '0.9rem', color: 'var(--grey-light)' }}>How it works</a></li>
                <li><a href="#pricing" style={{ fontSize: '0.9rem', color: 'var(--grey-light)' }}>Pricing</a></li>
                <li><a href="#faq" style={{ fontSize: '0.9rem', color: 'var(--grey-light)' }}>FAQ</a></li>
              </ul>
            </div>
            <div>
              <h4 style={{ color: 'white', marginBottom: '16px', fontSize: '0.9rem' }}>Legal</h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <li><a href="/privacy" style={{ fontSize: '0.9rem', color: 'var(--grey-light)' }}>Privacy Policy</a></li>
                <li><a href="/terms" style={{ fontSize: '0.9rem', color: 'var(--grey-light)' }}>Terms of Service</a></li>
              </ul>
            </div>
          </div>
        </div>
        <div style={{ maxWidth: '1100px', margin: '48px auto 0', borderTop: '1px solid #333', paddingTop: '24px', textAlign: 'center' }}>
          <p style={{ fontSize: '0.8rem', color: '#888' }}>© {new Date().getFullYear()} JobDeyEasy. All rights reserved.</p>
        </div>
      </footer>
    </>
  );
}
