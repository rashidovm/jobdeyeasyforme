'use client';

import React, { useId, useRef } from 'react';
import { Bold, List, Heading1, Heading2 } from 'lucide-react';
import { cn } from '@/lib/cn';

interface RichTextEditorProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  helperText?: string;
  placeholder?: string;
  required?: boolean;
  minHeight?: string;
}

/**
 * A plain textarea with a small formatting toolbar above it. Instead of
 * asking people to type "**bold**" or "# Heading" by hand, they can select
 * text and click a button (or use Ctrl+B) and the markdown-lite syntax is
 * inserted for them. The output is still plain text compatible with
 * <RichText /> — no rich-text library, no hidden HTML.
 */
export default function RichTextEditor({
  label, value, onChange, helperText, placeholder, required, minHeight = 'min-h-[220px]',
}: RichTextEditorProps) {
  const fieldId = useId();
  const ref = useRef<HTMLTextAreaElement>(null);

  const applyWrap = (before: string, after: string = before) => {
    const el = ref.current;
    if (!el) return;
    const { selectionStart: start, selectionEnd: end } = el;
    const selected = value.slice(start, end);
    const next = value.slice(0, start) + before + selected + after + value.slice(end);
    onChange(next);
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(start + before.length, start + before.length + selected.length);
    });
  };

  const applyLinePrefix = (prefix: string) => {
    const el = ref.current;
    if (!el) return;
    const { selectionStart: start, selectionEnd: end } = el;
    // Expand selection to cover whole lines
    const lineStart = value.lastIndexOf('\n', start - 1) + 1;
    let lineEnd = value.indexOf('\n', end);
    if (lineEnd === -1) lineEnd = value.length;
    const block = value.slice(lineStart, lineEnd);
    const lines = block.split('\n').map((l) => (l.startsWith(prefix) ? l : prefix + l));
    const next = value.slice(0, lineStart) + lines.join('\n') + value.slice(lineEnd);
    onChange(next);
    requestAnimationFrame(() => el.focus());
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b') {
      e.preventDefault();
      applyWrap('**');
    }
  };

  return (
    <div className="mb-4 w-full">
      <label htmlFor={fieldId} className="mb-1.5 block text-sm font-semibold text-ink">{label}</label>

      <div className="mb-1.5 flex items-center gap-1 rounded-xl border border-line bg-cream/60 p-1">
        <ToolbarButton label="Bold (Ctrl+B)" onClick={() => applyWrap('**')}><Bold className="h-3.5 w-3.5" /></ToolbarButton>
        <ToolbarButton label="Bullet list" onClick={() => applyLinePrefix('- ')}><List className="h-3.5 w-3.5" /></ToolbarButton>
        <ToolbarButton label="Heading" onClick={() => applyLinePrefix('# ')}><Heading1 className="h-3.5 w-3.5" /></ToolbarButton>
        <ToolbarButton label="Subheading" onClick={() => applyLinePrefix('## ')}><Heading2 className="h-3.5 w-3.5" /></ToolbarButton>
        <span className="ml-auto pr-2 text-[0.65rem] text-muted">Select text, then click a button</span>
      </div>

      <textarea
        id={fieldId}
        ref={ref}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        required={required}
        className={cn(
          'w-full resize-y rounded-xl border border-line bg-white px-4 py-2.5 text-[0.95rem] text-ink placeholder:text-muted/60',
          'transition-colors outline-none focus:border-green focus:ring-2 focus:ring-green/15',
          minHeight
        )}
      />
      {helperText && <p className="mt-1.5 text-xs text-muted">{helperText}</p>}
    </div>
  );
}

function ToolbarButton({ label, onClick, children }: { label: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      aria-label={label}
      className="rounded-lg p-2 text-muted hover:bg-white hover:text-ink"
    >
      {children}
    </button>
  );
}
