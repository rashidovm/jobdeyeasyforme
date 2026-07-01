import Link from 'next/link';
import { buildWhatsappLink } from '@/lib/supabase';

export default function TermsPage() {
  return (
    <div style={{ maxWidth: '720px', margin: '0 auto', padding: '80px 24px' }}>
      <h1 style={{ fontSize: '2.4rem', marginBottom: '24px' }}>Terms of Service</h1>
      <p style={{ color: 'var(--grey)', lineHeight: 1.6, marginBottom: '24px' }}>
        Our full Terms of Service are being finalized — message us on WhatsApp with any questions in the meantime.
      </p>
      <a
        href={buildWhatsappLink("Hi, I have a question about your terms of service.")}
        target="_blank"
        rel="noopener noreferrer"
        style={{ color: 'var(--green)', fontWeight: 600 }}
      >
        💬 Message us on WhatsApp
      </a>
      <div style={{ marginTop: '32px' }}>
        <Link href="/" style={{ color: 'var(--grey)', fontSize: '0.9rem' }}>← Back to Home</Link>
      </div>
    </div>
  );
}
