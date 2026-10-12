import React from 'react';
import Link from 'next/link';
import { AlertTriangle } from 'lucide-react';
import { LEGAL, LegalKey, hasPendingLegalTodos, isTodo } from '../content/legal';

/** Renders a business/legal value; unresolved TODOs are highlighted so they cannot go unnoticed. */
export const LegalValue: React.FC<{ k: LegalKey }> = ({ k }) => {
  const value = LEGAL[k];
  return isTodo(value) ? (
    <mark className="bg-amber-400/15 text-amber-300 px-1 rounded not-italic">[{value}]</mark>
  ) : (
    <>{value}</>
  );
};

export const LegalPage: React.FC<{ title: string; intro?: React.ReactNode; children: React.ReactNode }> = ({ title, intro, children }) => (
  <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
    {hasPendingLegalTodos() && (
      <div role="status" className="mb-8 p-4 rounded-xl border border-amber-500/40 bg-amber-500/10 text-amber-200 text-sm flex gap-3">
        <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
        <p>
          <b>Draft — pending owner review.</b> Some business and legal details on this page are still placeholders and are
          highlighted below.
        </p>
      </div>
    )}
    <p className="text-xs font-mono uppercase tracking-widest text-brand-green">
      {LEGAL.brand} · Powered by {LEGAL.poweredBy}
    </p>
    <h1 className="mt-2 text-3xl sm:text-4xl font-black text-white">{title}</h1>
    <p className="mt-2 text-sm text-brand-silver">
      Effective date: <LegalValue k="effectiveDate" />
    </p>
    {intro && <div className="mt-6 text-brand-silver leading-relaxed">{intro}</div>}
    <div className="mt-10 space-y-10">{children}</div>
    <nav aria-label="Policies" className="mt-14 pt-6 border-t border-brand-border flex flex-wrap gap-x-6 gap-y-2 text-sm">
      <Link href="/privacy" className="text-brand-silver hover:text-brand-green">Privacy Policy</Link>
      <Link href="/terms" className="text-brand-silver hover:text-brand-green">Terms &amp; Conditions</Link>
      <Link href="/refund-policy" className="text-brand-silver hover:text-brand-green">Refund Policy</Link>
      <Link href="/delete-account" className="text-brand-silver hover:text-brand-green">Delete Account</Link>
    </nav>
  </div>
);

export const Section: React.FC<{ id?: string; title: string; children: React.ReactNode }> = ({ id, title, children }) => (
  <section id={id} aria-labelledby={id ? `${id}-title` : undefined} className="space-y-3">
    <h2 id={id ? `${id}-title` : undefined} className="text-xl font-bold text-white">
      {title}
    </h2>
    <div className="space-y-3 text-brand-silver leading-relaxed [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1.5 [&_b]:text-white">{children}</div>
  </section>
);
