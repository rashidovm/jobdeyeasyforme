'use client';

import React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/cn';

type Variant = 'primary' | 'secondary' | 'whatsapp' | 'ghost';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  href?: string;
  fullWidth?: boolean;
}

const base =
  'inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-all duration-200 ' +
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green/40 focus-visible:ring-offset-2 focus-visible:ring-offset-cream ' +
  'disabled:opacity-60 disabled:pointer-events-none';

const variants: Record<Variant, string> = {
  primary:
    'bg-green text-white shadow-soft hover:bg-green-dark hover:shadow-card hover:-translate-y-0.5',
  secondary:
    'border-2 border-green text-green bg-transparent hover:bg-green-light hover:-translate-y-0.5',
  whatsapp:
    'bg-whatsapp text-white shadow-soft hover:brightness-95 hover:shadow-card hover:-translate-y-0.5',
  ghost: 'text-ink hover:bg-black/5',
};

const sizes: Record<Size, string> = {
  sm: 'px-4 py-2 text-sm',
  md: 'px-6 py-3 text-[0.95rem]',
  lg: 'px-7 py-3.5 text-base',
};

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  href,
  fullWidth,
  className,
  ...props
}: ButtonProps) {
  const classes = cn(base, variants[variant], sizes[size], fullWidth && 'w-full', className);

  if (href) {
    const external = href.startsWith('http') || href.startsWith('mailto:');
    return (
      <Link
        href={href}
        className={classes}
        target={external ? '_blank' : undefined}
        rel={external ? 'noopener noreferrer' : undefined}
      >
        {children}
      </Link>
    );
  }

  return (
    <button className={classes} {...props}>
      {children}
    </button>
  );
}
