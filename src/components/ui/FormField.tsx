'use client';

import React, { useId } from 'react';
import { cn } from '@/lib/cn';

interface FormFieldProps
  extends React.InputHTMLAttributes<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement> {
  label: string;
  helperText?: string;
  error?: string;
  as?: 'input' | 'select' | 'textarea';
  options?: { value: string; label: string }[];
}

export default function FormField({
  label,
  helperText,
  error,
  as = 'input',
  options,
  id,
  className,
  children,
  ...props
}: FormFieldProps) {
  const generatedId = useId();
  const fieldId = id || generatedId;

  const control = cn(
    'w-full rounded-xl border bg-white px-4 py-2.5 text-[0.95rem] text-ink placeholder:text-muted/60',
    'transition-colors outline-none focus:border-green focus:ring-2 focus:ring-green/15',
    error ? 'border-red-300' : 'border-line',
    className
  );

  return (
    <div className="mb-4 w-full">
      <label htmlFor={fieldId} className="mb-1.5 block text-sm font-semibold text-ink">
        {label}
      </label>

      {as === 'select' ? (
        <select id={fieldId} className={control} {...(props as React.SelectHTMLAttributes<HTMLSelectElement>)}>
          {options
            ? options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))
            : children}
        </select>
      ) : as === 'textarea' ? (
        <textarea
          id={fieldId}
          className={cn(control, 'min-h-[110px] resize-y')}
          {...(props as React.TextareaHTMLAttributes<HTMLTextAreaElement>)}
        />
      ) : (
        <input id={fieldId} className={control} {...(props as React.InputHTMLAttributes<HTMLInputElement>)} />
      )}

      {error ? (
        <p className="mt-1.5 text-xs text-red-600">{error}</p>
      ) : helperText ? (
        <p className="mt-1.5 text-xs text-muted">{helperText}</p>
      ) : null}
    </div>
  );
}
