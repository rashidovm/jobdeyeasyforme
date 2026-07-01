'use client';

import React from 'react';
import Link from 'next/link';

type Variant = 'primary' | 'secondary' | 'whatsapp';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  href?: string;
  fullWidth?: boolean;
}

const styles: Record<Variant, React.CSSProperties> = {
  primary: {
    backgroundColor: 'var(--green)',
    color: 'var(--white)',
    border: 'none',
  },
  secondary: {
    backgroundColor: 'transparent',
    color: 'var(--green)',
    border: '2px solid var(--green)',
  },
  whatsapp: {
    backgroundColor: 'var(--whatsapp)',
    color: 'var(--white)',
    border: 'none',
  },
};

export default function Button({
  children,
  variant = 'primary',
  href,
  fullWidth,
  style,
  ...props
}: ButtonProps) {
  const baseStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    padding: '12px 24px',
    borderRadius: '50px',
    fontWeight: 600,
    fontSize: '1rem',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    width: fullWidth ? '100%' : 'auto',
    ...styles[variant],
    ...style,
  };

  const hoverEffect = (e: React.MouseEvent<HTMLAnchorElement | HTMLButtonElement>) => {
    e.currentTarget.style.transform = 'translateY(-2px)';
    e.currentTarget.style.boxShadow = 'var(--shadow)';
    if (variant === 'primary') e.currentTarget.style.backgroundColor = 'var(--green-dark)';
    if (variant === 'secondary') e.currentTarget.style.backgroundColor = 'var(--green-light)';
  };

  const resetEffect = (e: React.MouseEvent<HTMLAnchorElement | HTMLButtonElement>) => {
    e.currentTarget.style.transform = 'translateY(0)';
    e.currentTarget.style.boxShadow = 'none';
    if (variant === 'primary') e.currentTarget.style.backgroundColor = 'var(--green)';
    if (variant === 'secondary') e.currentTarget.style.backgroundColor = 'transparent';
  };

  if (href) {
    return (
      <Link
        href={href}
        style={baseStyle}
        onMouseEnter={hoverEffect}
        onMouseLeave={resetEffect}
        target={href.startsWith('http') ? '_blank' : undefined}
        rel={href.startsWith('http') ? 'noopener noreferrer' : undefined}
      >
        {children}
      </Link>
    );
  }

  return (
    <button
      style={baseStyle}
      onMouseEnter={hoverEffect}
      onMouseLeave={resetEffect}
      {...props}
    >
      {children}
    </button>
  );
}
