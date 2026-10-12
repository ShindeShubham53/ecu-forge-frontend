import React from 'react';
import { PolicyView } from '../../components/PolicyView';
import { PRIVACY_POLICY } from '../../content/legal';

export const metadata = {
  title: 'Privacy Policy | ECU FORGE MASTERCLASS',
  description: PRIVACY_POLICY.summary,
};

export default function PrivacyPolicyPage() {
  return <PolicyView policy={PRIVACY_POLICY} />;
}
