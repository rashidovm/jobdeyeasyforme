'use client';

import React, { useEffect, useState } from 'react';
import { Menu, X } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import Logo from '@/components/ui/Logo';
import Button from '@/components/ui/Button';
import { cn } from '@/lib/cn';

const LINKS = [
  { href: '#how-it-works', label: 'How it works' },
  { href: '/jobs', label: 'Jobs' },
  { href: '/blog', label: 'Blog' },
  { href: '#pricing', label: 'Pricing' },
  { href: '#faq', label: 'FAQ' },
];

export default function Nav() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setAuthed(!!data.user));
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header className="sticky top-0 z-50 pt-3">
      <nav className="container-tight">
        <div className={cn(
          'flex h-16 items-center justify-between rounded-full px-4 pl-5 transition-all duration-300',
          scrolled ? 'border border-line bg-cream/80 shadow-card backdrop-blur-xl' : 'border border-transparent'
        )}>
          <Logo />

          <div className="hidden items-center gap-1 md:flex">
            {LINKS.map((l) => (
              <a key={l.href} href={l.href} className="rounded-full px-3.5 py-2 text-sm font-medium text-muted transition-colors hover:bg-ink/5 hover:text-ink">
                {l.label}
              </a>
            ))}
          </div>

          <div className="hidden items-center gap-2 md:flex">
            {authed ? (
              <Button href="/dashboard" size="sm">My dashboard →</Button>
            ) : (
              <>
                <a href="/login" className="rounded-full px-3.5 py-2 text-sm font-semibold link-muted">Log in</a>
                <Button href="/signup" size="sm">Start free trial</Button>
              </>
            )}
          </div>

          <button
            className="inline-flex h-10 w-10 items-center justify-center rounded-full text-ink md:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? 'Close menu' : 'Open menu'} aria-expanded={open}
          >
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </nav>

      {open && (
        <div className="container-tight mt-2 md:hidden">
          <div className="flex flex-col gap-1 rounded-3xl border border-line bg-cream p-4 shadow-card">
            {LINKS.map((l) => (
              <a key={l.href} href={l.href} onClick={() => setOpen(false)} className="rounded-xl px-3 py-2.5 text-sm font-medium text-ink hover:bg-ink/5">
                {l.label}
              </a>
            ))}
            {authed ? (
              <div className="pt-2"><Button href="/dashboard" fullWidth>My dashboard →</Button></div>
            ) : (
              <>
                <a href="/login" onClick={() => setOpen(false)} className="rounded-xl px-3 py-2.5 text-sm font-medium text-ink hover:bg-ink/5">Log in</a>
                <div className="pt-2"><Button href="/signup" fullWidth>Start free trial</Button></div>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
