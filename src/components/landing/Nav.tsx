'use client';

import React, { useEffect, useState } from 'react';
import { Menu, X } from 'lucide-react';
import Logo from '@/components/ui/Logo';
import Button from '@/components/ui/Button';
import { cn } from '@/lib/cn';

const LINKS = [
  { href: '#how-it-works', label: 'How it works' },
  { href: '/jobs', label: 'Jobs' },
  { href: '#pricing', label: 'Pricing' },
  { href: '#faq', label: 'FAQ' },
];

export default function Nav() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={cn(
        'sticky top-0 z-50 border-b transition-colors duration-300',
        scrolled ? 'border-line bg-cream/85 backdrop-blur-md' : 'border-transparent bg-cream/60 backdrop-blur-sm'
      )}
    >
      <nav className="container-tight flex h-16 items-center justify-between">
        <Logo />

        <div className="hidden items-center gap-8 md:flex">
          {LINKS.map((l) => (
            <a key={l.href} href={l.href} className="text-sm font-medium link-muted">
              {l.label}
            </a>
          ))}
          <div className="flex items-center gap-3">
            <a href="/login" className="text-sm font-semibold link-muted">
              Log in
            </a>
            <Button href="/signup" size="sm">
              Start free trial
            </Button>
          </div>
        </div>

        <button
          className="inline-flex h-10 w-10 items-center justify-center rounded-xl text-ink md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </nav>

      {open && (
        <div className="border-t border-line bg-cream md:hidden">
          <div className="container-tight flex flex-col gap-1 py-4">
            {LINKS.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-2 py-2.5 text-sm font-medium text-ink hover:bg-black/5"
              >
                {l.label}
              </a>
            ))}
            <a
              href="/login"
              onClick={() => setOpen(false)}
              className="rounded-lg px-2 py-2.5 text-sm font-medium text-ink hover:bg-black/5"
            >
              Log in
            </a>
            <div className="pt-2">
              <Button href="/signup" fullWidth>
                Start free trial
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
