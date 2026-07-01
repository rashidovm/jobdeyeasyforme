'use client';

import React, { useState } from 'react';
import Button from '@/components/ui/Button';

export default function Nav() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav style={{
      position: 'sticky',
      top: 0,
      backgroundColor: 'rgba(250, 248, 243, 0.9)',
      backdropFilter: 'blur(8px)',
      borderBottom: '1px solid var(--border)',
      zIndex: 100,
      padding: '16px 0',
    }}>
      <div style={{
        maxWidth: '1100px',
        margin: '0 auto',
        padding: '0 24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
            <path d="M16 2C8 2 2 8 2 16C2 24 8 30 16 30C24 30 30 24 30 16C30 8 24 2 16 2ZM16 28C9 28 4 23 4 16C4 9 9 4 16 4C23 4 28 9 28 16C28 23 23 28 16 28Z" fill="var(--green)"/>
            <path d="M9 16L14 21L23 12" stroke="var(--green)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <circle cx="26" cy="6" r="2" fill="var(--gold)"/>
          </svg>
          <span style={{ fontWeight: 800, fontSize: '1.2rem' }}>
            <span style={{ color: 'var(--green)' }}>Job</span>
            <span style={{ color: 'var(--gold)' }}>Dey</span>
            <span style={{ color: 'var(--green)' }}>Easy</span>
          </span>
        </div>

        <div style={{ display: 'flex', gap: '32px', alignItems: 'center' }} className="nav-links">
          <a href="#how-it-works" style={{ fontWeight: 500, color: 'var(--dark)' }}>How it works</a>
          <a href="#pricing" style={{ fontWeight: 500, color: 'var(--dark)' }}>Pricing</a>
          <a href="#faq" style={{ fontWeight: 500, color: 'var(--dark)' }}>FAQ</a>
          <Button href="/signup">Start Free Trial</Button>
        </div>

        <button
          className="menu-toggle"
          onClick={() => setIsOpen(!isOpen)}
          style={{ display: 'none', fontSize: '1.5rem' }}
          aria-label="Toggle menu"
        >
          {isOpen ? '✕' : '☰'}
        </button>
      </div>

      {isOpen && (
        <div style={{
          padding: '16px 24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          borderBottom: '1px solid var(--border)',
        }} className="mobile-menu">
          <a href="#how-it-works" onClick={() => setIsOpen(false)}>How it works</a>
          <a href="#pricing" onClick={() => setIsOpen(false)}>Pricing</a>
          <a href="#faq" onClick={() => setIsOpen(false)}>FAQ</a>
          <Button href="/signup" fullWidth>Start Free Trial</Button>
        </div>
      )}

      <style jsx>{`
        @media (max-width: 768px) {
          .nav-links { display: none !important; }
          .menu-toggle { display: block !important; }
        }
      `}</style>
    </nav>
  );
}
