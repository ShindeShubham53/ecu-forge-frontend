import React from 'react';
import Link from 'next/link';
import { LegalPage, LegalValue, Section } from '../../components/LegalPage';
import { DeleteAccountForm } from './DeleteAccountForm';

export const metadata = {
  title: 'Delete Your Account | ECU FORGE MASTERCLASS',
  description: 'How to delete your ECU FORGE MASTERCLASS account and what happens to your data.',
};

export default function DeleteAccountPage() {
  return (
    <LegalPage
      title="Delete Your Account"
      intro={
        <p>
          You can permanently delete your ECU FORGE MASTERCLASS learner account at any time, from this page or from the mobile
          app. Deletion takes effect immediately and cannot be undone.
        </p>
      }
    >
      <Section id="how" title="How to delete your account">
        <ul>
          <li>
            <b>In the mobile app:</b> Profile &rarr; Account &rarr; Delete account. You will confirm with your password.
          </li>
          <li>
            <b>On this website:</b> sign in, then use the form below. For your security, you may be asked to sign in again
            first.
          </li>
          <li>
            <b>Can&apos;t sign in?</b> Email <LegalValue k="supportEmail" /> from the email address on your account and ask us
            to delete it. We will verify that the request comes from the account owner before deleting anything.
          </li>
        </ul>
      </Section>

      <Section id="deleted" title="What is deleted">
        <ul>
          <li>Your name, email address and password are removed from your account; you can no longer sign in.</li>
          <li>Your lecture progress and quiz attempts.</li>
          <li>Your name on any certificates; those certificates are marked as no longer valid.</li>
          <li>You lose access to all courses on the account, including purchased courses.</li>
        </ul>
      </Section>

      <Section id="retained" title="What we keep, and why">
        <ul>
          <li>
            <b>Purchase records</b> (Razorpay order and payment IDs, amount, date and course) are kept for accounting, tax,
            refund and fraud-prevention purposes for <LegalValue k="paymentRecordRetention" />. They no longer include your
            name or email.
          </li>
          <li>
            <b>Anonymised certificate and enrollment records</b>, without your name, so our course and payment records stay
            consistent.
          </li>
          <li>Razorpay keeps its own records of your payments under its policies.</li>
        </ul>
        <p>
          Course videos and materials are not affected. More detail is in our{' '}
          <Link href="/privacy" className="text-brand-green underline">Privacy Policy</Link>.
        </p>
      </Section>

      <Section id="request" title="Delete my account">
        <DeleteAccountForm />
      </Section>
    </LegalPage>
  );
}
