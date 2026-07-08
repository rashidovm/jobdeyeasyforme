'use client';

import React from 'react';
import Button from '@/components/ui/Button';

const COLORS = ['#1E7C4B', '#C08329', '#E8A63D', '#25D366', '#F2ECE0'];

export default function Celebration({ title, message, onClose }: { title: string; message: string; onClose: () => void }) {
  const pieces = Array.from({ length: 28 });
  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-forest/60 p-6 backdrop-blur-sm" role="dialog" aria-modal="true">
      {/* confetti */}
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        {pieces.map((_, i) => (
          <span
            key={i}
            className="confetti-piece"
            style={{
              left: `${(i * 37) % 100}%`,
              backgroundColor: COLORS[i % COLORS.length],
              animationDelay: `${(i % 10) * 0.18}s`,
              animationDuration: `${2.4 + (i % 5) * 0.35}s`,
              width: i % 3 === 0 ? '10px' : '7px',
              height: i % 3 === 0 ? '14px' : '10px',
            }}
          />
        ))}
      </div>

      <div className="relative w-full max-w-sm animate-pop rounded-3xl border border-line bg-cream p-8 text-center shadow-lift">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gold-light text-4xl">🎉</div>
        <h2 className="display mt-4 text-3xl">{title}</h2>
        <p className="mt-3 text-muted">{message}</p>
        <div className="mt-6"><Button onClick={onClose} fullWidth>Keep going 🚀</Button></div>
      </div>
    </div>
  );
}
