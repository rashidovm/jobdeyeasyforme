import React from 'react';
import Link from 'next/link';

export default function Logo({ onClick }: { onClick?: () => void }) {
  return (
    <Link href="/" onClick={onClick} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M16 2C8 2 2 8 2 16C2 24 8 30 16 30C24 30 30 24 30 16C30 8 24 2 16 2ZM16 28C9 28 4 23 4 16C4 9 9 4 16 4C23 4 28 9 28 16C28 23 23 28 16 28Z" fill="var(--green)"/>
        <path d="M9 16L14 21L23 12" stroke="var(--green)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <circle cx="26" cy="6" r="2" fill="var(--gold)"/>
        <circle cx="6" cy="26" r="2" fill="var(--gold)"/>
      </svg>
      <span style={{ fontWeight: 800, fontSize: '1.25rem', letterSpacing: '-0.5px' }}>
        <span style={{ color: 'var(--green)' }}>Job</span>
        <span style={{ color: 'var(--gold)' }}>Dey</span>
        <span style={{ color: 'var(--green)' }}>Easy</span>
      </span>
    </Link>
  );
}
