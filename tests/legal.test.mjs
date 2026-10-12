// Guards for the public legal content (content/legal.ts): structure, placeholders, approved positions and unsupported claims.
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { LEGAL, POLICIES, PRIVACY_POLICY, TERMS, REFUND_POLICY, OWNER_DECISIONS, isTodo, hasPendingLegalTodos } from '../content/legal.ts';

const ROUTES = new Set(['/', '/privacy', '/terms', '/refund-policy', '/delete-account']);

/** All text of a policy, with "proposed" (not-in-effect) blocks reported separately. */
const textOf = (policy) => {
  const live = [];
  const proposed = [];
  for (const s of policy.sections) {
    live.push(s.title);
    for (const b of s.blocks) {
      if (typeof b === 'string') live.push(b);
      else if ('list' in b) live.push(...b.list);
      else if ('h3' in b) live.push(b.h3);
      else if ('note' in b) live.push(b.note);
      else proposed.push(b.proposed);
    }
  }
  return { live: live.join('\n'), proposed: proposed.join('\n') };
};

const sectionText = (policy, id) => {
  const s = policy.sections.find((x) => x.id === id);
  assert.ok(s, `missing section ${id}`);
  return textOf({ sections: [s] }).live;
};

describe('required structure', () => {
  test('Privacy Policy headings', () =>
    assert.deepEqual(PRIVACY_POLICY.sections.map((s) => s.title), [
      '1. Introduction',
      '2. Information We Collect',
      '3. How We Use Information',
      '4. Third-Party Service Providers',
      '5. Data Security',
      '6. Data Retention',
      '7. Account Deletion',
      '8. Your Rights and Requests',
      "9. Children's Privacy",
      '10. Changes to This Privacy Policy',
      '11. Contact and Grievance Information',
    ]));
  test('Terms has 18 sections ending with Contact', () => {
    assert.equal(TERMS.sections.length, 18);
    assert.equal(TERMS.sections.at(-1).title, '18. Contact Information');
  });
  test('Refund Policy has 10 sections ending with Contact', () => {
    assert.equal(REFUND_POLICY.sections.length, 10);
    assert.equal(REFUND_POLICY.sections.at(-1).title, '10. Contact');
  });
  test('section ids are unique per policy', () => {
    for (const p of POLICIES) assert.equal(new Set(p.sections.map((s) => s.id)).size, p.sections.length, p.title);
  });
});

describe('placeholders and links', () => {
  for (const p of POLICIES) {
    const { live, proposed } = textOf(p);
    const all = live + '\n' + proposed;
    test(`${p.title}: every {{placeholder}} is a known LEGAL key`, () => {
      for (const [, key] of all.matchAll(/\{\{([A-Za-z]+)\}\}/g)) assert.ok(key in LEGAL, `unknown key ${key}`);
    });
    test(`${p.title}: every link points to an existing page`, () => {
      for (const [, , href] of all.matchAll(/\[([^\]]+)\]\(([^)\s]+)\)/g)) assert.ok(ROUTES.has(href), `unknown route ${href}`);
    });
    test(`${p.title}: no raw TODO text outside placeholders`, () => assert.doesNotMatch(all, /TODO/));
    test(`${p.title}: no "proposed" (not-in-effect) wording remains`, () => assert.equal(proposed, ''));
  }
  test('owner decisions reference real keys and are still unresolved', () => {
    for (const d of OWNER_DECISIONS) {
      if (d.key in LEGAL) assert.ok(isTodo(LEGAL[d.key]), `${d.key} is resolved: remove it from OWNER_DECISIONS`);
    }
  });
  test('unknown business facts stay placeholders', () => {
    for (const k of ['operatorLegalName', 'postalAddress', 'supportEmail', 'privacyEmail', 'grievanceOfficer', 'jurisdiction', 'paymentRecordRetention', 'parentalConsentProcess'])
      assert.ok(isTodo(LEGAL[k]), `${k} must not be invented`);
  });
  test('launch blockers are listed and keep the draft banner on', () => {
    const blockers = OWNER_DECISIONS.filter((d) => d.launchBlocker).map((d) => d.key);
    assert.ok(blockers.includes('parentalConsentProcess') && blockers.includes('parentalConsentControls'));
    assert.ok(hasPendingLegalTodos());
  });
});

describe('no unsupported claims in live wording', () => {
  const forbidden = [
    [/100\s*%|completely protected|fully secure/i, 'no absolute security promises'],
    [/\bGST\b/i, 'no GST rules'],
    [/device limit|\bdevices? at (a|one) time/i, 'no device limits (not implemented)'],
    [/\bDRM\b|cannot be (copied|recorded)/i, 'no DRM claims'],
    [/accredit|guarantee(d)? (of )?(employment|a job|placement)/i, 'no accreditation or employment promises'],
    [/within \d+\s*(hours|days)|will be credited (on|by|within)/i, 'no response or bank-credit deadlines'],
    [/refunded automatically|automated refund system (is|exists)/i, 'no automated refund claim'],
    [/age verification|verif(y|ies|ied) (your|the) age|consent (log|record)s? (is|are) kept/i, 'no claimed age/consent controls'],
    [/marketing emails?|newsletter|analytics (is|are) used/i, 'no invented analytics or marketing email'],
    [/download (the )?videos? for offline|offline viewing is/i, 'no offline-download rights'],
  ];
  for (const p of POLICIES) {
    // The certificate disclaimer legitimately says "not ... an accreditation ... or a guarantee of employment".
    const live = textOf(p).live.replace(/It is not a government-recognised qualification[^.]*\./, '');
    for (const [re, why] of forbidden) test(`${p.title}: ${why}`, () => assert.doesNotMatch(live, re));
  }
});

describe('approved positions', () => {
  test('refund: no change-of-mind refunds once access is granted, subject to law', () => {
    const t = sectionText(REFUND_POLICY, 'cancellation');
    assert.match(t, /do not offer cancellations or refunds for a change of mind once access to a paid course has been granted/);
    assert.match(t, /subject to applicable law/);
    assert.match(t, /any refund or other remedy that you are entitled to under applicable law/);
  });
  test('refund: paid-but-not-unlocked, duplicate and failed payments are investigated/verified', () => {
    assert.match(sectionText(REFUND_POLICY, 'not-unlocked'), /investigate and verify the transaction/);
    assert.match(sectionText(REFUND_POLICY, 'duplicate'), /investigate and verify the charges/);
    assert.match(sectionText(REFUND_POLICY, 'failed'), /does not create an enrollment/);
  });
  test('refund: manual review, 7–10 business days to initiate after approval, no credit-date guarantee', () => {
    assert.equal(LEGAL.refundInitiationTime, '7–10 business days');
    assert.match(sectionText(REFUND_POLICY, 'requests'), /reviewed manually by our support team/);
    const t = sectionText(REFUND_POLICY, 'review');
    assert.match(t, /aim to initiate it within \{\{refundInitiationTime\}\} after approval/);
    assert.match(t, /depends on Razorpay, your bank/);
    assert.match(t, /cannot guarantee the date on which the refund will be credited/);
  });
  test('refund: access removal after a refund is manual', () =>
    assert.match(sectionText(REFUND_POLICY, 'access-after-refund'), /it is not removed automatically/));
  test('terms: lifetime access is qualified (course terms, not ownership, no offline right, limited withdrawal)', () => {
    const t = sectionText(TERMS, 'courses');
    assert.match(t, /Unless a course page clearly states a different access period before you buy/);
    assert.match(t, /does not give you ownership of the course content/);
    assert.match(t, /does not include a right to download lecture videos or to use course content offline/);
    assert.match(t, /We will not withdraw access to a course you have validly enrolled in except/);
  });
  test('terms: no promise of lifetime platform availability', () =>
    assert.match(sectionText(TERMS, 'availability'), /not a promise that the Platform, or any individual course, will be operated forever/));
  test('minors: permitted only where the law allows, with legally required consent; process is a placeholder', () => {
    for (const [p, id] of [[TERMS, 'eligibility'], [PRIVACY_POLICY, 'children']]) {
      const t = sectionText(p, id);
      assert.match(t, /under 18 years of age/);
      assert.match(t, /parent or lawful guardian that the law requires/);
      assert.match(t, /\{\{parentalConsentProcess\}\}/);
    }
    assert.match(sectionText(PRIVACY_POLICY, 'children'), /sign-up does not currently ask for your age or date of birth/i);
  });
  test('terms: certificates are explicitly not accreditation / employment guarantees', () =>
    assert.match(sectionText(TERMS, 'certificates'), /not a government-recognised qualification, an accreditation, a professional licence or a guarantee of employment/));
  test('terms: no guaranteed results; non-excludable consumer rights preserved', () => {
    const t = sectionText(TERMS, 'liability');
    assert.match(t, /do not guarantee any particular learning outcome/);
    assert.match(t, /Nothing in these Terms excludes or limits any liability or consumer right that cannot be excluded/);
  });
  test('privacy: payments never claims to store card/CVV/UPI PIN', () =>
    assert.match(textOf(PRIVACY_POLICY).live, /does \*\*not\*\* receive or store your card number, CVV/));
  test('privacy: deletion wording matches the implementation (anonymise, delete progress/quiz, keep anonymised certificates and purchases)', () => {
    const t = sectionText(PRIVACY_POLICY, 'account-deletion');
    assert.match(t, /lecture progress and quiz results are deleted/);
    assert.match(t, /certificate records are kept in anonymised form/);
    assert.match(t, /purchase and enrollment records are kept/);
    assert.match(t, /deletion does not remove every record of a purchase/);
  });
});
