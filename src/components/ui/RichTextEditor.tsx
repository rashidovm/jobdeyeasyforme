'use client';

import React, { useId, useRef, useState } from 'react';
import { Bold, Italic, List, Heading1, Heading2, Eye, EyeOff } from 'lucide-react';
import RichText from '@/components/ui/RichText';
import { cn } from '@/lib/cn';

/**
 * A labeled textarea with formatting buttons (bold, italic, bullet, H1, H2)
 * that insert the lightweight syntax RichText renders — writers never type
 * #, -, or ** by hand. Includes a live preview toggle. Matches FormField's
 * visual language so it drops into the same forms.
 */
interface RichTextEditorProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  helperText?: string;
  required?: boolean;
  minRows?: number;
  /** Tailwind min-height class for the textarea/preview area, e.g. "min-h-[160px]" */
  minHeight?: string;
}

export default function RichTextEditor({
  label, value, onChange, placeholder, helperText, required, minRows = 12, minHeight,
}: RichTextEditorProps) {
  const ref = useRef<HTMLTextAreaElement>(null);
  const [preview, setPreview] = useState(false);
  const id = useId();

  const wrapSelection = (mark: string) => {
    const el = ref.current;
    if (!el) return;
    const { selectionStart: s, selectionEnd: e } = el;
    const selected = value.slice(s, e) || 'text';
    const next = value.slice(0, s) + mark + selected + mark + value.slice(e);
    onChange(next);
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(s + mark.length, s + mark.length + selected.length);
    });
  };

  const prefixLines = (prefix: string) => {
    const el = ref.current;
    if (!el) return;
    const { selectionStart: s, selectionEnd: e } = el;
    const lineStart = value.lastIndexOf('\n', s - 1) + 1;
    const lineEnd = value.indexOf('\n', e) === -1 ? value.length : value.indexOf('\n', e);
    const block = value.slice(lineStart, lineEnd) || 'text';
    const lines = block.split('\n').map((l) => (l.startsWith(prefix) ? l : prefix + l));
    const next = value.slice(0, lineStart) + lines.join('\n') + value.slice(lineEnd);
    onChange(next);
    requestAnimationFrame(() => el.focus());
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (!(e.ctrlKey || e.metaKey)) return;
    if (e.key.toLowerCase() === 'b') { e.preventDefault(); wrapSelection('**'); }
    if (e.key.toLowerCase() === 'i') { e.preventDefault(); wrapSelection('_'); }
  };

  const btn = (icon: React.ReactNode, title: string, onClick: () => void) => (
    <button type="button" title={title} onClick={onClick}
      className="flex h-8 w-8 items-center justify-center rounded-lg text-muted transition-colors hover:bg-green-light hover:text-green">
      {icon}
    </button>
  );

  return (
    <div className="mb-4 w-full">
      <label htmlFor={id} className="mb-1.5 block text-sm font-semibold text-ink">{label}</label>

      <div className="overflow-hidden rounded-xl border border-line">
        <div className="flex items-center gap-1 border-b border-line bg-cream px-2 py-1.5">
          {btn(<Bold className="h-4 w-4" />, 'Bold (Ctrl+B)', () => wrapSelection('**'))}
          {btn(<Italic className="h-4 w-4" />, 'Italic (Ctrl+I)', () => wrapSelection('_'))}
          {btn(<List className="h-4 w-4" />, 'Bullet list', () => prefixLines('- '))}
          {btn(<Heading1 className="h-4 w-4" />, 'Heading', () => prefixLines('# '))}
          {btn(<Heading2 className="h-4 w-4" />, 'Subheading', () => prefixLines('## '))}
          <div className="ml-auto">
            <button type="button" onClick={() => setPreview((v) => !v)}
              className={cn('flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold', preview ? 'bg-green text-white' : 'text-muted hover:bg-green-light hover:text-green')}>
              {preview ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />} {preview ? 'Editing' : 'Preview'}
            </button>
          </div>
        </div>

        {preview ? (
          <div className={cn('max-h-[420px] overflow-y-auto bg-white p-4', minHeight || 'min-h-[240px]')}>
            {value.trim() ? <RichText text={value} /> : <p className="text-sm text-muted">Nothing to preview yet.</p>}
          </div>
        ) : (
          <textarea
            id={id}
            ref={ref}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder={placeholder}
            rows={minHeight ? undefined : minRows}
            required={required}
            className={cn('w-full resize-y bg-white p-4 text-sm leading-relaxed outline-none placeholder:text-muted/60', minHeight)}
          />
        )}
      </div>
      {helperText && <p className="mt-1.5 text-xs text-muted">{helperText}</p>}
    </div>
  );
}
