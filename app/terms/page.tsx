import React from 'react';
import { PolicyView } from '../../components/PolicyView';
import { TERMS } from '../../content/legal';

export const metadata = {
  title: 'Terms & Conditions | ECU FORGE MASTERCLASS',
  description: TERMS.summary,
};

export default function TermsPage() {
  return <PolicyView policy={TERMS} />;
}
