'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Certificate } from '../../../types';
import { api } from '../../../services/api';
import { ShieldCheck, Award, CheckCircle2, AlertTriangle, ExternalLink } from 'lucide-react';
import Link from 'next/link';

export default function CertificateVerificationPage() {
  const params = useParams();
  const certId = params?.certificateId as string;

  const [certificate, setCertificate] = useState<Certificate | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchVerification = async () => {
      try {
        const res = await api.get(`/certificates/verify/${certId}`);
        if (res.data.success) {
          setCertificate(res.data.data);
        }
      } catch (err: any) {
        setError(err.response?.data?.message || 'Certificate ID invalid or not found.');
      } finally {
        setLoading(false);
      }
    };

    if (certId) fetchVerification();
  }, [certId]);

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-2xl bg-brand-surface border border-brand-border rounded-3xl p-8 md:p-12 shadow-2xl space-y-8 text-center relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 bg-brand-green/10 blur-[80px] pointer-events-none"></div>

        {loading ? (
          <div className="space-y-4">
            <div className="w-16 h-16 rounded-full bg-brand-dark animate-pulse mx-auto"></div>
            <p className="text-sm font-mono text-brand-silver">Verifying Certificate Signature...</p>
          </div>
        ) : certificate && !certificate.revoked ? (
          <div className="space-y-6">
            <div className="w-20 h-20 rounded-full bg-brand-green/20 border-2 border-brand-green text-brand-green flex items-center justify-center mx-auto shadow-[0_0_30px_rgba(0,255,102,0.3)]">
              <ShieldCheck className="w-10 h-10" />
            </div>

            <div className="space-y-2">
              <span className="px-3 py-1 rounded bg-emerald-500/10 text-brand-green font-mono text-xs font-bold border border-emerald-500/30">
                VERIFIED ACCREDITED CERTIFICATE
              </span>
              <h1 className="text-2xl md:text-3xl font-black text-white font-sans uppercase">
                Official Certification Valid
              </h1>
              <p className="text-xs font-mono text-brand-silver">
                Issued by ECU FORGE MASTERCLASS • Powered by MECH-MOTO
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-brand-dark border border-brand-border text-left font-mono text-xs space-y-3">
              <div className="flex justify-between border-b border-brand-border/60 pb-2">
                <span className="text-brand-silver">Certificate Code:</span>
                <span className="text-brand-green font-bold text-sm">{certificate.certificate_code}</span>
              </div>
              <div className="flex justify-between border-b border-brand-border/60 pb-2">
                <span className="text-brand-silver">Certified Engineer:</span>
                <span className="text-white font-bold">{certificate.user_name}</span>
              </div>
              <div className="flex justify-between border-b border-brand-border/60 pb-2">
                <span className="text-brand-silver">Masterclass Title:</span>
                <span className="text-white font-bold">{certificate.course_title}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-brand-silver">Issue Date:</span>
                <span className="text-white font-bold">{new Date(certificate.issue_date).toLocaleDateString()}</span>
              </div>
            </div>

            <div className="pt-2">
              <Link
                href="/courses"
                className="px-6 py-3 rounded-xl bg-brand-green text-black font-extrabold text-sm hover:bg-emerald-400 transition-colors inline-block"
              >
                Explore ECU Masterclasses
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="w-20 h-20 rounded-full bg-rose-500/20 border-2 border-rose-500 text-rose-500 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-10 h-10" />
            </div>

            <div className="space-y-2">
              <span className="px-3 py-1 rounded bg-rose-500/10 text-rose-400 font-mono text-xs font-bold">
                INVALID / UNVERIFIED
              </span>
              <h1 className="text-2xl font-black text-white">Certificate Not Found</h1>
              <p className="text-sm text-brand-silver max-w-md mx-auto">
                {error || 'The requested certificate code could not be verified in the cryptographic database.'}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
