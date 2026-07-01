import React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/cn';

interface LogoProps {
  onClick?: () => void;
  className?: string;
  invert?: boolean;
}

export default function Logo({ onClick, className, invert }: LogoProps) {
  return (
    <Link
      href="/"
      onClick={onClick}
      aria-label="JobDeyEasy home"
      className={cn('inline-flex items-center gap-2.5', className)}
    >
      <span className="relative inline-flex h-9 w-9 items-center justify-center rounded-xl bg-green shadow-soft">
        {/* paper plane carrying a document */}
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M21 3L3 10.5l6.2 2.3L21 3z" fill="#fff" />
          <path d="M21 3l-3.6 15-4.5-6.2L21 3z" fill="#CFEAD9" />
          <circle cx="19.5" cy="19.5" r="1.5" fill="#D4881E" />
          <circle cx="15" cy="21.5" r="1" fill="#D4881E" />
        </svg>
      </span>
      <span className={cn('text-[1.2rem] font-extrabold tracking-tight', invert ? 'text-white' : 'text-ink')}>
        <span className="text-green">Job</span>
        <span className="text-gold">Dey</span>
        <span className={invert ? 'text-white' : 'text-green'}>Easy</span>
      </span>
    </Link>
  );
}
