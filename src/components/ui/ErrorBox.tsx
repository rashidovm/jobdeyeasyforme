import React from 'react';

export default function ErrorBox({ message }: { message: string }) {
  if (!message) return null;
  return (
    <div
      role="alert"
      style={{
        backgroundColor: '#FEF2F2',
        border: '1px solid #FECACA',
        color: '#DC2626',
        padding: '12px 16px',
        borderRadius: 'var(--radius-sm)',
        marginBottom: '16px',
        fontSize: '0.9rem',
      }}
    >
      {message}
    </div>
  );
}
