'use client';

import React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/cn';

type Variant = 'primary' | 'secondary' | 'whatsapp' | 'ghost' | 'gold' | 'dark';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  href?: string;
  fullWidth?: boolean;
}

const base =
  'group/btn relative inline-flex items-center justify-center gap-2 rounded-full font-semibold tracking-tight transition-all duration-200 ' +
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/50 focus-visible:ring-offset-2 focus-visible:ring-offset-cream ' +
  'active:translate-y-0 disabled:opacity-60 disabled:pointer-events-none';

const variants: Record<Variant, string> = {
  primary:
    'bg-green text-white shadow-[0_10px_28px_-10px_rgba(21,92,55,0.6)] hover:bg-green-dark hover:-translate-y-0.5 hover:shadow-[0_16px_34px_-10px_rgba(21,92,55,0.7)]',
  secondary:
    'border border-ink/15 bg-white/70 text-ink backdrop-blur hover:border-green hover:text-green hover:-translate-y-0.5',
  whatsapp:
    'bg-whatsapp text-white shadow-soft hover:brightness-95 hover:-translate-y-0.5 hover:shadow-card',
  ghost: 'text-ink hover:bg-ink/5',
  gold:
    'bg-gold text-white shadow-[0_10px_28px_-10px_rgba(192,131,41,0.7)] hover:bg-gold-bright hover:-translate-y-0.5',
  dark:
    'bg-forest text-cream shadow-[0_14px_34px_-12px_rgba(11,36,26,0.8)] hover:bg-forest-700 hover:-translate-y-0.5',
};

const sizes: Record<Size, string> = {
  sm: 'px-4 py-2 text-sm',
  md: 'px-6 py-3 text-[0.95rem]',
  lg: 'px-8 py-4 text-base',
};

export default function Button({
  children, variant = 'primary', size = 'md', href, fullWidth, className, ...props
}: ButtonProps) {
  const classes = cn(base, variants[variant], sizes[size], fullWidth && 'w-full', className);

  if (href) {
    const external = href.startsWith('http') || href.startsWith('mailto:');
    return (
      <Link href={href} className={classes} target={external ? '_blank' : undefined} rel={external ? 'noopener noreferrer' : undefined}>
        {children}
      </Link>
    );
  }
  return <button className={classes} {...props}>{children}</button>;
}
