import React from 'react';
import Link from 'next/link';
import { AlertTriangle, FileText } from 'lucide-react';
import { LEGAL, LegalKey, PolicyBlock, PolicyDocument, hasPendingLegalTodos, isTodo } from '../content/legal';

/**
 * Light, document-style layout for the public policy pages (/privacy, /terms, /refund-policy).
 * Content comes from content/legal.ts; unresolved owner details are highlighted, never hidden.
 */

const Placeholder: React.FC<{ k: LegalKey }> = ({ k }) => {
  const value = LEGAL[k];
  if (!isTodo(value)) return <>{value}</>;
  return (
    <mark className="rounded bg-amber-100 px-1 py-0.5 text-amber-900 ring-1 ring-amber-300" title="Owner review required">
      [{value.replace(/^TODO:\s*/, 'To be confirmed: ')}]
    </mark>
  );
};

const TOKEN = /(\*\*[^*]+\*\*|\[[^\]]+\]\([^)\s]+\)|\{\{[A-Za-z]+\}\})/g;

/** Renders **bold**, [label](/path) and {{legalKey}} inside policy text. */
const Inline: React.FC<{ text: string }> = ({ text }) => (
  <>
    {text.split(TOKEN).map((part, i) => {
      if (!part) return null;
      if (part.startsWith('**'))
        return (
          <strong key={i} className="font-semibold text-slate-900">
            <Inline text={part.slice(2, -2)} />
          </strong>
        );
      const link = part.match(/^\[([^\]]+)\]\(([^)\s]+)\)$/);
      if (link) {
        return (
          <Link key={i} href={link[2]} className="font-medium text-emerald-700 underline underline-offset-2 hover:text-emerald-800">
            {link[1]}
          </Link>
        );
      }
      const key = part.match(/^\{\{([A-Za-z]+)\}\}$/);
      if (key && key[1] in LEGAL) return <Placeholder key={i} k={key[1] as LegalKey} />;
      return <React.Fragment key={i}>{part}</React.Fragment>;
    })}
  </>
);

const Block: React.FC<{ block: PolicyBlock }> = ({ block }) => {
  if (typeof block === 'string') return <p><Inline text={block} /></p>;
  if ('h3' in block) return <h3 className="pt-2 text-base font-semibold text-slate-900">{block.h3}</h3>;
  if ('list' in block) {
    return (
      <ul className="list-disc space-y-2 pl-5 marker:text-emerald-600">
        {block.list.map((item, i) => (
          <li key={i}><Inline text={item} /></li>
        ))}
      </ul>
    );
  }
  if ('note' in block) {
    return (
      <p className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-slate-800">
        <Inline text={block.note} />
      </p>
    );
  }
  return (
    <div className="rounded-lg border-2 border-dashed border-amber-400 bg-amber-50 p-4 text-amber-950" role="note">
      <p className="mb-1 text-xs font-bold uppercase tracking-wider text-amber-800">Owner approval required — not in effect</p>
      <p><Inline text={block.proposed} /></p>
    </div>
  );
};

const ContactCard: React.FC = () => (
  <div className="rounded-xl border border-slate-200 bg-slate-50 p-5 text-sm leading-relaxed">
    <p className="font-semibold text-slate-900">
      {LEGAL.brand} — operated by {LEGAL.poweredBy}
    </p>
    <dl className="mt-3 grid gap-x-6 gap-y-2 sm:grid-cols-[max-content_1fr]">
      <dt className="text-slate-500">Legal entity</dt>
      <dd><Placeholder k="operatorLegalName" /></dd>
      <dt className="text-slate-500">Address</dt>
      <dd><Placeholder k="postalAddress" /></dd>
      <dt className="text-slate-500">Support</dt>
      <dd><Placeholder k="supportEmail" /></dd>
      <dt className="text-slate-500">Privacy</dt>
      <dd><Placeholder k="privacyEmail" /></dd>
      <dt className="text-slate-500">Grievance officer</dt>
      <dd><Placeholder k="grievanceOfficer" /></dd>
    </dl>
  </div>
);

const RELATED = [
  { href: '/privacy', label: 'Privacy Policy' },
  { href: '/terms', label: 'Terms & Conditions' },
  { href: '/refund-policy', label: 'Refund & Cancellation Policy' },
  { href: '/delete-account', label: 'Delete Your Account' },
];

export const PolicyView: React.FC<{ policy: PolicyDocument }> = ({ policy }) => (
  <div className="bg-slate-50 text-slate-700">
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-14">
      {hasPendingLegalTodos() && (
        <div role="status" className="mb-6 flex gap-3 rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" aria-hidden />
          <p>
            <b>Draft — pending owner review.</b> Some business details and decisions on this page are still being confirmed
            and are highlighted below.
          </p>
        </div>
      )}

      <header className="border-b border-slate-200 pb-6">
        <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-emerald-700">
          <span className="inline-block h-1.5 w-6 rounded-full bg-brand-green" aria-hidden />
          {LEGAL.brand} · Powered by {LEGAL.poweredBy}
        </p>
        <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">{policy.title}</h1>
        <p className="mt-3 text-base text-slate-600">{policy.summary}</p>
        <p className="mt-4 flex flex-wrap gap-x-6 gap-y-1 text-sm text-slate-500">
          <span>Last updated: {LEGAL.lastUpdated}</span>
          <span>
            Effective date: <Placeholder k="effectiveDate" />
          </span>
        </p>
      </header>

      <nav aria-label="On this page" className="mt-6 rounded-xl border border-slate-200 bg-white p-5">
        <p className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-900">
          <FileText className="h-4 w-4 text-emerald-700" aria-hidden /> On this page
        </p>
        <ol className="grid gap-x-6 gap-y-1.5 text-sm sm:grid-cols-2">
          {policy.sections.map((s) => (
            <li key={s.id}>
              <a href={`#${s.id}`} className="text-slate-600 hover:text-emerald-700 hover:underline">
                {s.title}
              </a>
            </li>
          ))}
        </ol>
      </nav>

      <article className="mt-6 rounded-2xl border border-slate-200 bg-white px-5 py-8 shadow-sm sm:px-10 sm:py-10">
        <div className="space-y-10">
          {policy.sections.map((s) => (
            <section key={s.id} id={s.id} aria-labelledby={`${s.id}-title`} className="scroll-mt-24 space-y-3 text-[15px] leading-7">
              <h2 id={`${s.id}-title`} className="text-xl font-bold text-slate-900">
                {s.title}
              </h2>
              {s.blocks.map((b, i) => (
                <Block key={i} block={b} />
              ))}
              {s.id === 'contact' && <ContactCard />}
            </section>
          ))}
        </div>
      </article>

      <nav aria-label="Related policies" className="mt-8">
        <p className="text-sm font-semibold text-slate-900">Related policies</p>
        <ul className="mt-2 flex flex-wrap gap-2">
          {RELATED.filter((r) => r.href !== policy.slug).map((r) => (
            <li key={r.href}>
              <Link
                href={r.href}
                className="inline-block rounded-full border border-slate-300 bg-white px-4 py-1.5 text-sm text-slate-700 hover:border-emerald-600 hover:text-emerald-700"
              >
                {r.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  </div>
);
