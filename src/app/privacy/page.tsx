import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import Logo from '@/components/ui/Logo';

export const metadata = { title: 'Privacy Policy — JobDeyEasy' };

export default function PrivacyPage() {
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
          <h1 className="text-3xl font-extrabold">Privacy Policy</h1>
          <p className="mt-2 text-sm text-muted">Last updated: {new Date().getFullYear()}</p>

          <div className="mt-8 space-y-8 text-[0.95rem] leading-relaxed text-muted">
            <Section title="What we collect">
              We collect the information you give us during signup and onboarding: your name, email,
              WhatsApp number, and the career details you share so we can prepare your applications.
            </Section>
            <Section title="How we use it">
              Your information is used solely to source jobs, tailor your CV and cover letters, and deliver
              your applications. We never sell your data.
            </Section>
            <Section title="Your CV and documents">
              We will never share your CV or personal documents with a third party without your explicit
              permission. Your materials belong to you.
            </Section>
            <Section title="Data security">
              Your data is stored securely with our infrastructure provider. Access is limited to the team
              members preparing your applications.
            </Section>
            <Section title="Your rights">
              You can request a copy of your data or ask us to delete it at any time by messaging us on
              WhatsApp.
            </Section>
            <Section title="Contact">
              Questions about your privacy? Reach us any time on WhatsApp — a real person will respond.
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
