import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import Logo from '@/components/ui/Logo';

export const metadata = { title: 'Terms of Service — JobDeyEasy' };

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-cream px-6 py-12">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8 flex items-center justify-between">
          <Logo />
          <Link href="/" className="inline-flex items-center gap-1.5 text-sm font-semibold link-muted">
            <ArrowLeft className="h-4 w-4" /> Back home
          </Link>
        </div>

        <article className="rounded-3xl border border-line bg-white p-8 shadow-card sm:p-12">
          <h1 className="text-3xl font-extrabold">Terms of Service</h1>
          <p className="mt-2 text-sm text-muted">Last updated: {new Date().getFullYear()}</p>

          <div className="mt-8 space-y-8 text-[0.95rem] leading-relaxed text-muted">
            <Section title="What we do">
              JobDeyEasy prepares tailored job applications: we source roles, write your CV and cover
              letter, and give you a ready-to-send email. You review and send the applications yourself.
            </Section>
            <Section title="What we don't promise">
              We do not guarantee you a job, an interview, or any specific outcome. We promise quality,
              honest work on every application — the hiring decision rests with employers.
            </Section>
            <Section title="Your responsibilities">
              You agree to give us accurate information. We build your applications on what you tell us, so
              honesty on your side keeps your applications strong and truthful.
            </Section>
            <Section title="Payments and plans">
              Paid plans are billed monthly. You can cancel at any time through WhatsApp. Application limits
              reset each billing cycle and do not roll over.
            </Section>
            <Section title="Fair use">
              Application limits are per person. Accounts that abuse the service or submit false information
              may be paused.
            </Section>
            <Section title="Contact">
              Questions about these terms? Message us on WhatsApp and a real person will help.
            </Section>
          </div>
        </article>
      </div>
    </main>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="mb-2 text-lg font-bold text-ink">{title}</h2>
      <p>{children}</p>
    </section>
  );
}
