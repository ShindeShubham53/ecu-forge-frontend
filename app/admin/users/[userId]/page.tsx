'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  AlertTriangle,
  Award,
  BookOpen,
  ChevronLeft,
  ClipboardCheck,
  CreditCard,
  Info,
  LayoutDashboard,
  PlayCircle,
  RefreshCw,
} from 'lucide-react';
import { useAuth } from '../../../../context/AuthContext';
import { api } from '../../../../services/api';
import type {
  CertificateItem,
  CourseProgress,
  CoursePurchase,
  LearnerActivity,
  Page,
  PaymentItem,
  QuizAttemptItem,
} from '../../../../types/adminActivity';

// ---------------------------------------------------------------------------------------------------------------
// Formatting
// ---------------------------------------------------------------------------------------------------------------
const fmtDate = (iso: string | null | undefined, withTime = true) =>
  iso
    ? new Date(iso).toLocaleString('en-IN', withTime ? { dateStyle: 'medium', timeStyle: 'short' } : { dateStyle: 'medium' })
    : '—';

const fmtMoney = (amount: number, currency: string) => {
  try {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency, maximumFractionDigits: 2 }).format(amount);
  } catch {
    return `${amount} ${currency}`;
  }
};

const fmtMoneyMap = (m: Record<string, number>) => {
  const entries = Object.entries(m);
  return entries.length ? entries.map(([c, a]) => fmtMoney(a, c)).join(' + ') : fmtMoney(0, 'INR');
};

const fmtDuration = (s: number | null | undefined) => {
  if (s === null || s === undefined) return '—';
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return h ? `${h}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}` : `${m}:${String(sec).padStart(2, '0')}`;
};

const ACTIVITY_SOURCE: Record<string, string> = {
  lecture_progress: 'lecture progress update',
  quiz_attempt: 'quiz attempt',
  enrollment: 'course enrollment',
  payment_order: 'payment order',
  certificate: 'certificate issued',
};

const NOT_RECORDED: Record<string, string> = {
  last_login: 'Last login time',
  watch_session_history: 'Video watch-session history (only the latest state per lecture is kept)',
  failed_vs_pending_payment_status: 'Failed vs. pending vs. abandoned payments (all stay "order created")',
  refund_status: 'Refund status',
  payment_capture_time: 'Payment capture time (only the order creation time is stored)',
  quiz_answers: 'Individual quiz answers (only the score is stored)',
};

// ---------------------------------------------------------------------------------------------------------------
// Small UI pieces
// ---------------------------------------------------------------------------------------------------------------
type Tone = 'green' | 'red' | 'amber' | 'slate' | 'blue';
const TONE: Record<Tone, string> = {
  green: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  red: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
  amber: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
  slate: 'bg-brand-surface-light text-brand-silver border-brand-border',
  blue: 'bg-sky-500/10 text-sky-400 border-sky-500/30',
};

const Badge: React.FC<{ tone: Tone; children: React.ReactNode }> = ({ tone, children }) => (
  <span className={`inline-flex items-center whitespace-nowrap rounded border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${TONE[tone]}`}>
    {children}
  </span>
);

const Card: React.FC<{ title?: string; icon?: React.ReactNode; children: React.ReactNode; className?: string }> = ({ title, icon, children, className = '' }) => (
  <section className={`rounded-2xl border border-brand-border bg-brand-surface p-4 sm:p-6 ${className}`}>
    {title && (
      <h2 className="mb-4 flex items-center gap-2 text-sm font-black uppercase tracking-wide text-white">
        {icon}
        {title}
      </h2>
    )}
    {children}
  </section>
);

const Notice: React.FC<{ children: React.ReactNode; tone?: 'info' | 'warn' }> = ({ children, tone = 'info' }) => (
  <div
    className={`flex gap-2 rounded-xl border p-3 text-xs leading-relaxed ${
      tone === 'warn' ? 'border-amber-500/30 bg-amber-500/5 text-amber-200' : 'border-brand-border bg-brand-dark text-brand-silver'
    }`}
  >
    {tone === 'warn' ? <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" /> : <Info className="mt-0.5 h-4 w-4 shrink-0 text-brand-green" />}
    <div>{children}</div>
  </div>
);

const Empty: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <p className="rounded-xl border border-dashed border-brand-border p-6 text-center text-xs text-brand-silver">{children}</p>
);

const Table: React.FC<{ head: string[]; children: React.ReactNode }> = ({ head, children }) => (
  <div className="overflow-x-auto rounded-xl border border-brand-border">
    <table className="w-full min-w-[640px] border-collapse text-left text-xs">
      <thead>
        <tr className="border-b border-brand-border bg-brand-dark font-mono uppercase text-brand-silver">
          {head.map((h) => (
            <th key={h} className="p-3 font-semibold">
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="divide-y divide-brand-border/50">{children}</tbody>
    </table>
  </div>
);

const Td: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <td className={`p-3 align-top text-brand-metallic ${className}`}>{children}</td>
);

const Mono: React.FC<{ children: React.ReactNode }> = ({ children }) => <span className="break-all font-mono text-[11px] text-brand-silver">{children}</span>;

const Stat: React.FC<{ label: string; value: React.ReactNode; hint?: string }> = ({ label, value, hint }) => (
  <div className="rounded-xl border border-brand-border bg-brand-dark p-4">
    <p className="font-mono text-[10px] uppercase tracking-wider text-brand-silver">{label}</p>
    <p className="mt-1 text-xl font-black text-white">{value}</p>
    {hint && <p className="mt-1 text-[11px] text-brand-silver">{hint}</p>}
  </div>
);

const ProgressBar: React.FC<{ percent: number }> = ({ percent }) => (
  <div className="h-2 w-full overflow-hidden rounded-full bg-brand-dark" role="progressbar" aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100}>
    <div className="h-full rounded-full bg-brand-green" style={{ width: `${Math.min(100, Math.max(0, percent))}%` }} />
  </div>
);

const statusTone = (status: string): Tone => (status === 'active' ? 'green' : status === 'deleted' ? 'slate' : 'red');

// ---------------------------------------------------------------------------------------------------------------
// Sections
// ---------------------------------------------------------------------------------------------------------------
const TABS = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'purchases', label: 'Purchases & Enrollment', icon: CreditCard },
  { id: 'progress', label: 'Course Progress', icon: BookOpen },
  { id: 'video', label: 'Video Activity', icon: PlayCircle },
  { id: 'quizzes', label: 'Quiz Results', icon: ClipboardCheck },
  { id: 'certificates', label: 'Certificates', icon: Award },
] as const;
type TabId = (typeof TABS)[number]['id'];

function Overview({ data }: { data: LearnerActivity }) {
  const { profile: p, overview: o } = data;
  return (
    <div className="space-y-6">
      <Card title="Learner profile">
        <dl className="grid gap-4 text-xs sm:grid-cols-2 lg:grid-cols-3">
          {[
            ['Name', p.full_name],
            ['Email', p.email],
            ['Role', <Badge key="r" tone={p.role === 'ADMIN' ? 'green' : 'slate'}>{p.role}</Badge>],
            ['Account status', <Badge key="s" tone={statusTone(p.status)}>{p.status}</Badge>],
            ['Registered', fmtDate(p.created_at)],
            ['Last login', <span key="l" className="text-brand-silver">Not recorded by the current system</span>],
            [
              'Last recorded learning activity',
              p.last_recorded_activity ? (
                <span key="a">
                  {fmtDate(p.last_recorded_activity.at)}{' '}
                  <span className="text-brand-silver">({ACTIVITY_SOURCE[p.last_recorded_activity.source] ?? p.last_recorded_activity.source})</span>
                </span>
              ) : (
                'No learning activity recorded'
              ),
            ],
            ['User ID', <Mono key="i">{p.id}</Mono>],
          ].map(([label, value]) => (
            <div key={label as string}>
              <dt className="font-mono text-[10px] uppercase tracking-wider text-brand-silver">{label}</dt>
              <dd className="mt-1 break-words text-white">{value}</dd>
            </div>
          ))}
        </dl>
      </Card>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Enrolled courses" value={o.enrolled_courses} />
        <Stat
          label="Successful paid purchases"
          value={o.successful_purchases}
          hint={`${fmtMoneyMap(o.amount_paid_by_currency)} captured`}
        />
        <Stat
          label="Overall progress"
          value={`${o.overall_progress_percent}%`}
          hint={`${o.overall_completed_lectures} of ${o.overall_total_lectures} lectures`}
        />
        <Stat label="Completed courses" value={o.completed_courses} hint="All current lectures completed" />
        <Stat label="Quiz attempts" value={o.quiz_attempts} />
        <Stat label="Certificates" value={o.certificates_total} hint={`${o.certificates_valid} valid · ${o.certificates_revoked} revoked`} />
        <Stat
          label="Unconfirmed orders"
          value={o.payment_records.order_created_unconfirmed}
          hint="Orders created, never captured — not counted as purchases"
        />
        <Stat
          label="Possible duplicate payments"
          value={o.duplicate_captured_payments}
          hint={o.duplicate_captured_payments ? `${fmtMoneyMap(o.duplicate_amount_by_currency)} — review` : 'None'}
        />
      </div>

      <Card title="How these figures are calculated" icon={<Info className="h-4 w-4 text-brand-green" />}>
        <ul className="list-disc space-y-1 pl-5 text-xs text-brand-silver">
          <li>Paid purchases count courses with at least one payment in the <b>captured</b> state. Orders that were only created are never counted.</li>
          <li>Amount paid uses the first captured payment per course; any further captured payment for the same course is listed as a possible duplicate.</li>
          <li>Overall progress = completed lectures ÷ current lectures across all enrolled courses, read live from the progress records.</li>
          <li>A course is complete when every current lecture is completed (the same lecture rule used for certificates).</li>
        </ul>
        <p className="mt-4 font-mono text-[10px] uppercase tracking-wider text-brand-silver">Not recorded by the current system</p>
        <ul className="mt-2 flex flex-wrap gap-2">
          {data.not_recorded.map((k) => (
            <li key={k}>
              <Badge tone="slate">{NOT_RECORDED[k] ?? k}</Badge>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}

const ENROLLMENT_TYPE: Record<CoursePurchase['enrollment_type'], { label: string; tone: Tone }> = {
  paid: { label: 'Paid enrollment', tone: 'green' },
  free: { label: 'Free-course enrollment', tone: 'blue' },
  no_matching_payment: { label: 'Enrolled — no matching payment record', tone: 'amber' },
  not_enrolled: { label: 'Not enrolled', tone: 'slate' },
};

const FLAG_LABEL: Record<string, string> = {
  multiple_captured_payments: 'More than one captured payment for this course — possible duplicate',
  captured_payment_without_enrollment: 'Captured payment but no enrollment — investigate',
  enrollment_payment_reference_unmatched: 'Enrollment payment reference does not match a captured payment record',
};

const PAYMENT_STATE: Record<PaymentItem['state'], { label: string; tone: Tone }> = {
  captured: { label: 'Captured — successful', tone: 'green' },
  order_created: { label: 'Order created — no confirmed payment', tone: 'amber' },
  unknown: { label: 'Unknown status', tone: 'red' },
};

function Purchases({ data, payments, onMore, loadingMore }: { data: LearnerActivity; payments: Page<PaymentItem>; onMore: () => void; loadingMore: boolean }) {
  return (
    <div className="space-y-6">
      <Card title="Courses: purchase & enrollment" icon={<CreditCard className="h-4 w-4 text-brand-green" />}>
        {data.purchases.length === 0 ? (
          <Empty>No enrollments or payment records for this learner.</Empty>
        ) : (
          <div className="space-y-3">
            {data.purchases.map((c) => {
              const t = ENROLLMENT_TYPE[c.enrollment_type];
              return (
                <article key={c.course_id} className="rounded-xl border border-brand-border bg-brand-dark p-4" data-testid="purchase-row">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h3 className="font-bold text-white">{c.course_title ?? 'Unknown course'}</h3>
                      <Mono>{c.course_id}</Mono>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Badge tone={t.tone}>{t.label}</Badge>
                      <Badge tone={c.has_access ? 'green' : 'slate'}>{c.has_access ? 'Has access' : 'No access'}</Badge>
                    </div>
                  </div>
                  <dl className="mt-3 grid gap-3 text-xs sm:grid-cols-2 lg:grid-cols-4">
                    <div>
                      <dt className="text-brand-silver">Enrolled</dt>
                      <dd className="text-white">{c.enrolled ? fmtDate(c.enrolled_at) : 'No'}</dd>
                    </div>
                    <div>
                      <dt className="text-brand-silver">Course price</dt>
                      <dd className="text-white">{c.course_price === null ? '—' : c.course_price > 0 ? fmtMoney(c.course_price, 'INR') : 'Free'}</dd>
                    </div>
                    <div>
                      <dt className="text-brand-silver">Captured payment</dt>
                      <dd className="text-white">
                        {c.purchase_payment ? (
                          <>
                            {fmtMoney(c.purchase_payment.amount, c.purchase_payment.currency)}
                            <br />
                            <Mono>order {c.purchase_payment.razorpay_order_id}</Mono>
                            <br />
                            <Mono>payment {c.purchase_payment.razorpay_payment_id ?? '—'}</Mono>
                            <br />
                            <span className="text-brand-silver">Order created {fmtDate(c.purchase_payment.order_created_at)}</span>
                          </>
                        ) : (
                          'None'
                        )}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-brand-silver">Other records</dt>
                      <dd className="text-white">
                        {c.unconfirmed_orders} unconfirmed order{c.unconfirmed_orders === 1 ? '' : 's'}
                        <br />
                        <span className="text-brand-silver">Refund status: not recorded</span>
                        {c.enrollment_type === 'no_matching_payment' && c.enrollment_payment_reference && (
                          <>
                            <br />
                            <Mono>enrollment ref {c.enrollment_payment_reference}</Mono>
                          </>
                        )}
                      </dd>
                    </div>
                  </dl>
                  {c.flags.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {c.flags.map((f) => (
                        <Notice key={f} tone="warn">
                          {FLAG_LABEL[f] ?? f}
                          {f === 'multiple_captured_payments' &&
                            c.duplicate_captured_payments.map((d) => (
                              <span key={d.payment_record_id} className="block">
                                {fmtMoney(d.amount, d.currency)} · <Mono>{d.razorpay_payment_id ?? d.razorpay_order_id}</Mono> · {fmtDate(d.order_created_at)}
                              </span>
                            ))}
                        </Notice>
                      ))}
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </Card>

      <Card title={`All payment records (${payments.total})`} icon={<CreditCard className="h-4 w-4 text-brand-green" />}>
        <div className="mb-4">
          <Notice>
            The system stores only two payment states: <b>captured</b> (successful, verified) and <b>order created</b>. A failed, pending or abandoned checkout all remain
            &quot;order created&quot; and cannot be told apart. The date shown is when the order was created; capture time and refunds are not recorded.
          </Notice>
        </div>
        {payments.items.length === 0 ? (
          <Empty>No payment records.</Empty>
        ) : (
          <>
            <Table head={['Order created', 'Course', 'Amount', 'Status', 'Razorpay order / payment', 'Counted']}>
              {payments.items.map((p) => (
                <tr key={p.payment_record_id} data-testid="payment-item">
                  <Td>{fmtDate(p.order_created_at)}</Td>
                  <Td>{p.course_title}</Td>
                  <Td className="whitespace-nowrap text-white">{fmtMoney(p.amount, p.currency)}</Td>
                  <Td>
                    <Badge tone={PAYMENT_STATE[p.state].tone}>{p.state === 'unknown' ? `Unknown: ${p.status}` : PAYMENT_STATE[p.state].label}</Badge>
                  </Td>
                  <Td>
                    <Mono>{p.razorpay_order_id}</Mono>
                    <br />
                    <Mono>{p.razorpay_payment_id ?? '—'}</Mono>
                  </Td>
                  <Td>
                    {p.counted_as_purchase ? (
                      <Badge tone="green">Purchase</Badge>
                    ) : p.possible_duplicate ? (
                      <Badge tone="amber">Possible duplicate</Badge>
                    ) : (
                      <Badge tone="slate">Not counted</Badge>
                    )}
                  </Td>
                </tr>
              ))}
            </Table>
            <MoreButton shown={payments.items.length} total={payments.total} onMore={onMore} loading={loadingMore} />
          </>
        )}
      </Card>
    </div>
  );
}

const MoreButton: React.FC<{ shown: number; total: number; onMore: () => void; loading: boolean }> = ({ shown, total, onMore, loading }) =>
  shown < total ? (
    <div className="mt-4 flex items-center justify-between gap-3 text-xs text-brand-silver">
      <span>
        Showing {shown} of {total}
      </span>
      <button
        onClick={onMore}
        disabled={loading}
        className="rounded-lg border border-brand-border bg-brand-dark px-4 py-2 font-bold text-white hover:border-brand-green disabled:opacity-50"
      >
        {loading ? 'Loading…' : 'Load more'}
      </button>
    </div>
  ) : null;

function CourseProgressSection({ courses }: { courses: CourseProgress[] }) {
  if (courses.length === 0) return <Empty>This learner is not enrolled in any course.</Empty>;
  return (
    <div className="space-y-6">
      {courses.map((c) => (
        <Card key={c.course_id}>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="font-bold text-white">{c.course_title}</h3>
              <Mono>{c.course_id}</Mono>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge tone={c.lectures_complete ? 'green' : 'slate'}>{c.lectures_complete ? 'Course complete' : 'In progress'}</Badge>
              {c.has_quiz ? (
                <Badge tone={c.quiz?.passed ? 'green' : 'amber'}>{c.quiz?.passed ? 'Quiz passed' : 'Quiz not passed'}</Badge>
              ) : (
                <Badge tone="slate">No quiz</Badge>
              )}
              {c.certificate ? (
                <Badge tone={c.certificate.revoked ? 'red' : 'green'}>{c.certificate.revoked ? 'Certificate revoked' : 'Certificate issued'}</Badge>
              ) : (
                <Badge tone={c.certificate_eligible ? 'blue' : 'slate'}>{c.certificate_eligible ? 'Eligible for certificate' : 'Not yet eligible'}</Badge>
              )}
            </div>
          </div>
          <div className="mt-4 space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-brand-silver">
                {c.completed_lectures} of {c.total_lectures} lectures completed
              </span>
              <span className="font-bold text-white">{c.progress_percent}%</span>
            </div>
            <ProgressBar percent={c.progress_percent} />
            <p className="text-[11px] text-brand-silver">
              Last progress update: {fmtDate(c.last_progress_update_at)}
              {c.completed_at && <> · Completed: {fmtDate(c.completed_at)}</>}
              {c.stored_progress_percent !== c.progress_percent && (
                <> · Stored enrollment progress {c.stored_progress_percent}% (updates on the learner&apos;s next progress save)</>
              )}
            </p>
            {!c.certificate && !c.certificate_eligible && c.certificate_eligibility_reason && (
              <p className="text-[11px] text-brand-silver">Certificate: {c.certificate_eligibility_reason}</p>
            )}
            {c.quiz && (
              <p className="text-[11px] text-brand-silver">
                Course quiz: {c.quiz.title} (pass mark {c.quiz.passing_percentage}%)
              </p>
            )}
          </div>
          <div className="mt-4">
            {c.lectures.length === 0 ? (
              <Empty>This course has no lectures yet.</Empty>
            ) : (
              <Table head={['#', 'Lecture', 'Module', 'Status', 'Last saved position', 'Last update']}>
                {c.lectures.map((l, i) => (
                  <tr key={l.lecture_id}>
                    <Td>{i + 1}</Td>
                    <Td className="text-white">{l.title}</Td>
                    <Td>{l.module_title}</Td>
                    <Td>
                      <Badge tone={l.is_completed ? 'green' : l.started ? 'amber' : 'slate'}>
                        {l.is_completed ? 'Completed' : l.started ? 'Started' : 'Not started'}
                      </Badge>
                    </Td>
                    <Td>
                      {fmtDuration(l.last_position_seconds)}
                      {l.duration_seconds > 0 && <span className="text-brand-silver"> / {fmtDuration(l.duration_seconds)}</span>}
                    </Td>
                    <Td>{fmtDate(l.last_updated_at)}</Td>
                  </tr>
                ))}
              </Table>
            )}
          </div>
        </Card>
      ))}
    </div>
  );
}

function VideoActivity({ courses }: { courses: CourseProgress[] }) {
  const withActivity = courses.map((c) => ({ ...c, lectures: c.lectures.filter((l) => l.started) })).filter((c) => c.lectures.length > 0);
  return (
    <div className="space-y-6">
      <Notice tone="warn">
        <b>Watch-session history is not recorded by the current system.</b> For each lecture, only the latest saved state is stored: the last playback position, the
        server-verified watch time and the time of the last update. A lecture marked complete does not mean every second was watched; completion follows the server&apos;s
        verified-watch rule.
      </Notice>
      {withActivity.length === 0 ? (
        <Empty>No video activity recorded for this learner.</Empty>
      ) : (
        withActivity.map((c) => (
          <Card key={c.course_id} title={c.course_title} icon={<PlayCircle className="h-4 w-4 text-brand-green" />}>
            <Table head={['Lecture', 'Completion', 'Last position', 'Verified watch time', 'Watched (reported)', 'Last update']}>
              {c.lectures.map((l) => (
                <tr key={l.lecture_id}>
                  <Td className="text-white">{l.title}</Td>
                  <Td>
                    <Badge tone={l.is_completed ? 'green' : 'amber'}>{l.is_completed ? 'Completed' : 'Not completed'}</Badge>
                  </Td>
                  <Td>
                    {fmtDuration(l.last_position_seconds)}
                    {l.duration_seconds > 0 && <span className="text-brand-silver"> / {fmtDuration(l.duration_seconds)}</span>}
                  </Td>
                  <Td>{fmtDuration(l.verified_watch_seconds)}</Td>
                  <Td>{l.watched_percent === null ? '—' : `${l.watched_percent}%`}</Td>
                  <Td>{fmtDate(l.last_updated_at)}</Td>
                </tr>
              ))}
            </Table>
          </Card>
        ))
      )}
    </div>
  );
}

function QuizResults({ data, attempts, onMore, loadingMore }: { data: LearnerActivity; attempts: Page<QuizAttemptItem>; onMore: () => void; loadingMore: boolean }) {
  return (
    <div className="space-y-6">
      <Card title="Quiz summary" icon={<ClipboardCheck className="h-4 w-4 text-brand-green" />}>
        {data.quiz_summary.length === 0 ? (
          <Empty>No quiz attempts recorded.</Empty>
        ) : (
          <Table head={['Quiz', 'Course', 'Attempts', 'Best score', 'Result', 'Last attempt']}>
            {data.quiz_summary.map((q) => (
              <tr key={q.quiz_id}>
                <Td className="text-white">{q.quiz_title ?? 'Unknown quiz'}</Td>
                <Td>{q.course_title ?? '—'}</Td>
                <Td>{q.attempts}</Td>
                <Td>{q.best_percentage === null ? '—' : `${q.best_percentage}%`}</Td>
                <Td>
                  <Badge tone={q.passed_any_attempt ? 'green' : 'red'}>{q.passed_any_attempt ? 'Passed' : 'Not passed'}</Badge>
                </Td>
                <Td>{fmtDate(q.last_attempt_at)}</Td>
              </tr>
            ))}
          </Table>
        )}
      </Card>
      <Card title={`All attempts (${attempts.total})`} icon={<ClipboardCheck className="h-4 w-4 text-brand-green" />}>
        <div className="mb-4">
          <Notice>Results are shown exactly as graded at the time of each attempt. Individual answers are not stored.</Notice>
        </div>
        {attempts.items.length === 0 ? (
          <Empty>No quiz attempts recorded.</Empty>
        ) : (
          <>
            <Table head={['Attempted', 'Quiz', 'Course', 'Score', 'Percentage', 'Result']}>
              {attempts.items.map((a) => (
                <tr key={a.attempt_id} data-testid="quiz-attempt">
                  <Td>{fmtDate(a.attempted_at)}</Td>
                  <Td className="text-white">{a.quiz_title}</Td>
                  <Td>{a.course_title}</Td>
                  <Td>
                    {a.score} / {a.max_score}
                  </Td>
                  <Td>{a.percentage}%</Td>
                  <Td>
                    <Badge tone={a.passed ? 'green' : 'red'}>{a.passed ? 'Pass' : 'Fail'}</Badge>
                  </Td>
                </tr>
              ))}
            </Table>
            <MoreButton shown={attempts.items.length} total={attempts.total} onMore={onMore} loading={loadingMore} />
          </>
        )}
      </Card>
    </div>
  );
}

function Certificates({ certificates, deleted }: { certificates: CertificateItem[]; deleted: boolean }) {
  return (
    <Card title="Certificates" icon={<Award className="h-4 w-4 text-brand-green" />}>
      {deleted && (
        <div className="mb-4">
          <Notice>This account was deleted. Its certificates were anonymised and revoked by the account-deletion process and cannot be reactivated.</Notice>
        </div>
      )}
      {certificates.length === 0 ? (
        <Empty>No certificates issued.</Empty>
      ) : (
        <Table head={['Course', 'Certificate code', 'Issued', 'Status', 'Course lectures', 'Verification']}>
          {certificates.map((c) => (
            <tr key={c.id} data-testid="certificate-row">
              <Td className="text-white">
                {c.course_title}
                <br />
                <Mono>{c.course_id}</Mono>
              </Td>
              <Td>
                <Mono>{c.certificate_code}</Mono>
              </Td>
              <Td>{fmtDate(c.issue_date, false)}</Td>
              <Td>
                <Badge tone={c.revoked ? 'red' : 'green'}>{c.revoked ? 'Revoked' : 'Valid'}</Badge>
              </Td>
              <Td>{c.course_lectures_complete === null ? 'Not enrolled' : c.course_lectures_complete ? 'All completed' : 'Incomplete'}</Td>
              <Td>
                <Link href={`/verify/${encodeURIComponent(c.certificate_code)}`} className="text-brand-green underline underline-offset-2" target="_blank">
                  Public verification page
                </Link>
              </Td>
            </tr>
          ))}
        </Table>
      )}
    </Card>
  );
}

// ---------------------------------------------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------------------------------------------
export default function AdminLearnerDetailsPage() {
  const router = useRouter();
  const params = useParams<{ userId: string }>();
  const userId = params?.userId;
  const { user, isAdmin, loading: authLoading } = useAuth();

  const [data, setData] = useState<LearnerActivity | null>(null);
  const [payments, setPayments] = useState<Page<PaymentItem> | null>(null);
  const [attempts, setAttempts] = useState<Page<QuizAttemptItem> | null>(null);
  const [error, setError] = useState<{ status?: number; message: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState<'payments' | 'quizzes' | null>(null);
  const [tab, setTab] = useState<TabId>('overview');

  const load = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await api.get(`/admin/users/${encodeURIComponent(userId)}/activity`);
      const d: LearnerActivity = res.data.data;
      setData(d);
      setPayments(d.payments);
      setAttempts(d.quiz_attempts);
    } catch (err: any) {
      const status = err?.response?.status;
      setError({
        status,
        message:
          status === 404
            ? 'This user does not exist.'
            : status === 400
            ? 'Invalid user id.'
            : status === 401 || status === 403
            ? 'You do not have permission to view this learner.'
            : err?.response?.data?.message || 'Could not load learner activity. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (!authLoading && (!user || !isAdmin)) {
      router.push('/dashboard');
      return;
    }
    if (user && isAdmin) load();
  }, [user, isAdmin, authLoading, router, load]);

  const loadMore = async (kind: 'payments' | 'quizzes') => {
    const current = kind === 'payments' ? payments : attempts;
    if (!current || !userId) return;
    setLoadingMore(kind);
    try {
      const path = kind === 'payments' ? 'payments' : 'quiz-attempts';
      const res = await api.get(`/admin/users/${encodeURIComponent(userId)}/${path}`, {
        params: { page: current.page + 1, pageSize: current.page_size },
      });
      const next = res.data.data;
      if (kind === 'payments') setPayments((p) => (p ? { ...next, items: [...p.items, ...next.items] } : next));
      else setAttempts((a) => (a ? { ...next, items: [...a.items, ...next.items] } : next));
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Could not load more records.');
    } finally {
      setLoadingMore(null);
    }
  };

  const goBack = () => {
    // Return to the list (search is restored there); fall back to a direct link.
    if (typeof window !== 'undefined' && window.history.length > 1) router.back();
    else router.push('/admin/users');
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-center gap-3 border-b border-brand-border/60 pb-6">
        <button
          onClick={goBack}
          className="flex items-center gap-1 rounded-lg bg-brand-surface px-3 py-2 text-xs font-bold text-brand-silver hover:text-white"
          data-testid="back-to-users"
        >
          <ChevronLeft className="h-4 w-4" /> User Management
        </button>
        <div className="min-w-0">
          <span className="font-mono text-xs font-bold uppercase text-brand-green">ADMINISTRATION · LEARNER DETAILS</span>
          <h1 className="break-words font-sans text-2xl font-black uppercase text-white sm:text-3xl" data-testid="learner-name">
            {data ? data.profile.full_name : loading ? 'Loading…' : 'Learner'}
          </h1>
        </div>
        {data && (
          <div className="ml-auto flex flex-wrap gap-2">
            <Badge tone={data.profile.role === 'ADMIN' ? 'green' : 'slate'}>{data.profile.role}</Badge>
            <Badge tone={statusTone(data.profile.status)}>{data.profile.status}</Badge>
          </div>
        )}
      </div>

      {loading && !data && (
        <div className="space-y-3" aria-busy="true" data-testid="learner-loading">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-24 animate-pulse rounded-2xl border border-brand-border bg-brand-surface" />
          ))}
        </div>
      )}

      {error && (
        <Card>
          <div className="flex flex-col items-center gap-3 py-6 text-center" data-testid="learner-error">
            <AlertTriangle className="h-8 w-8 text-amber-400" />
            <p className="text-sm text-white">{error.message}</p>
            <div className="flex gap-2">
              {error.status !== 404 && error.status !== 400 && (
                <button onClick={load} className="flex items-center gap-1 rounded-lg bg-brand-green px-4 py-2 text-xs font-bold text-black">
                  <RefreshCw className="h-3.5 w-3.5" /> Retry
                </button>
              )}
              <Link href="/admin/users" className="rounded-lg border border-brand-border px-4 py-2 text-xs font-bold text-white">
                Back to User Management
              </Link>
            </div>
          </div>
        </Card>
      )}

      {data && payments && attempts && (
        <>
          {data.profile.is_deleted_account && (
            <Notice tone="warn">
              This account was deleted by its owner. Personal details were anonymised and cannot be recovered; learning progress and quiz results were removed, and purchase and
              enrollment records are retained. Deleted accounts cannot be reactivated.
            </Notice>
          )}
          {!data.profile.is_deleted_account && data.profile.status !== 'active' && (
            <Notice tone="warn">This account is deactivated: the learner cannot sign in or access courses until it is activated again.</Notice>
          )}

          <nav className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0" aria-label="Learner sections">
            <ul className="flex min-w-max gap-2 border-b border-brand-border/60" role="tablist">
              {TABS.map((t) => {
                const Icon = t.icon;
                const active = tab === t.id;
                return (
                  <li key={t.id}>
                    <button
                      role="tab"
                      aria-selected={active}
                      onClick={() => setTab(t.id)}
                      data-testid={`tab-${t.id}`}
                      className={`flex items-center gap-2 border-b-2 px-3 py-3 text-xs font-bold uppercase tracking-wide transition-colors ${
                        active ? 'border-brand-green text-brand-green' : 'border-transparent text-brand-silver hover:text-white'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      {t.label}
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div role="tabpanel" data-testid={`panel-${tab}`}>
            {tab === 'overview' && <Overview data={data} />}
            {tab === 'purchases' && <Purchases data={data} payments={payments} onMore={() => loadMore('payments')} loadingMore={loadingMore === 'payments'} />}
            {tab === 'progress' && <CourseProgressSection courses={data.course_progress} />}
            {tab === 'video' && <VideoActivity courses={data.course_progress} />}
            {tab === 'quizzes' && <QuizResults data={data} attempts={attempts} onMore={() => loadMore('quizzes')} loadingMore={loadingMore === 'quizzes'} />}
            {tab === 'certificates' && <Certificates certificates={data.certificates} deleted={data.profile.is_deleted_account} />}
          </div>
        </>
      )}
    </div>
  );
}
