'use client';

import React, { useId } from 'react';

interface FormFieldProps extends React.InputHTMLAttributes<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement> {
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
  ...props
}: FormFieldProps) {
  const generatedId = useId();
  const fieldId = id || generatedId;

  const baseStyle: React.CSSProperties = {
    width: '100%',
    padding: '12px 16px',
    border: `1.5px solid ${error ? '#FECACA' : 'var(--border)'}`,
    borderRadius: 'var(--radius-sm)',
    backgroundColor: 'var(--white)',
    fontSize: '1rem',
    transition: 'border 0.2s ease',
    outline: 'none',
  };

  const focusStyle = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    e.target.style.borderColor = 'var(--green)';
  };

  return (
    <div style={{ marginBottom: '16px', width: '100%' }}>
      <label
        htmlFor={fieldId}
        style={{ display: 'block', fontWeight: 600, marginBottom: '6px', fontSize: '0.9rem' }}
      >
        {label}
      </label>
      {as === 'select' ? (
        <select
          id={fieldId}
          style={baseStyle}
          onFocus={focusStyle}
          {...(props as React.SelectHTMLAttributes<HTMLSelectElement>)}
        >
          {options?.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
        </select>
      ) : as === 'textarea' ? (
        <textarea
          id={fieldId}
          style={{ ...baseStyle, minHeight: '100px', resize: 'vertical' }}
          onFocus={focusStyle}
          {...(props as React.TextareaHTMLAttributes<HTMLTextAreaElement>)}
        />
      ) : (
        <input
          id={fieldId}
          style={baseStyle}
          onFocus={focusStyle}
          {...(props as React.InputHTMLAttributes<HTMLInputElement>)}
        />
      )}
      {error ? (
        <p style={{ color: '#DC2626', fontSize: '0.8rem', marginTop: '4px' }}>{error}</p>
      ) : helperText ? (
        <p style={{ color: 'var(--grey)', fontSize: '0.8rem', marginTop: '4px' }}>{helperText}</p>
      ) : null}
    </div>
  );
}
