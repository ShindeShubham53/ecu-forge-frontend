import React from 'react';
import { PolicyView } from '../../components/PolicyView';
import { REFUND_POLICY } from '../../content/legal';

export const metadata = {
  title: 'Refund & Cancellation Policy | ECU FORGE MASTERCLASS',
  description: REFUND_POLICY.summary,
};

export default function RefundPolicyPage() {
  return <PolicyView policy={REFUND_POLICY} />;
}
