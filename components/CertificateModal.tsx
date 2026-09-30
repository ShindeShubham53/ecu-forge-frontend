'use client';

import React from 'react';
import { Certificate } from '../types';
import { Award, Download, Share2, CheckCircle2, ShieldCheck, Printer, ExternalLink, X } from 'lucide-react';
import Link from 'next/link';

interface CertificateModalProps {
  certificate: Certificate;
  onClose: () => void;
}

export const CertificateModal: React.FC<CertificateModalProps> = ({ certificate, onClose }) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-brand-surface border border-brand-green/40 rounded-3xl shadow-[0_0_50px_rgba(0,255,102,0.2)] overflow-hidden my-8">
        {/* Top Control Bar */}
        <div className="p-4 bg-brand-dark border-b border-brand-border flex items-center justify-between no-print">
          <div className="flex items-center gap-2 text-xs font-mono text-brand-green">
            <ShieldCheck className="w-4 h-4" />
            <span>VERIFIED ECU FORGE MASTERCLASS ACCREDITATION</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="px-4 py-2 rounded-xl bg-brand-surface border border-brand-border text-xs font-bold text-white hover:border-brand-green flex items-center gap-1.5"
            >
              <Printer className="w-4 h-4 text-brand-green" />
              Print / Save PDF
            </button>
            <Link
              href={`/verify/${certificate.certificate_code}`}
              target="_blank"
              className="px-4 py-2 rounded-xl bg-brand-green text-black font-bold text-xs hover:bg-emerald-400 flex items-center gap-1.5"
            >
              Verify Online
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
            <button onClick={onClose} className="p-2 rounded-lg text-brand-silver hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Certificate Canvas Container */}
        <div id="certificate-print-area" className="p-10 md:p-14 bg-[#080a0e] text-white relative border-[12px] border-brand-surface border-double m-4 rounded-2xl space-y-8 select-none">
          {/* Subtle Background Watermark / Grid */}
          <div className="absolute inset-0 bg-grid-pattern opacity-30 pointer-events-none"></div>

          {/* Top Header */}
          <div className="flex flex-col sm:flex-row items-center justify-between border-b border-brand-border/80 pb-6 relative z-10 gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-brand-green/10 border border-brand-green flex items-center justify-center text-brand-green">
                <Award className="w-7 h-7" />
              </div>
              <div>
                <h1 className="text-2xl font-black tracking-wider uppercase font-sans">
                  ECU FORGE <span className="text-brand-green">MASTERCLASS</span>
                </h1>
                <p className="text-[11px] font-mono text-brand-silver/70 tracking-widest uppercase">
                  Powered by MECH-MOTO Engineering
                </p>
              </div>
            </div>

            <div className="text-center sm:text-right font-mono text-xs text-brand-silver">
              <p className="text-brand-green font-bold">CERTIFICATE ID</p>
              <p className="text-sm font-black text-white tracking-widest">{certificate.certificate_code}</p>
            </div>
          </div>

          {/* Body Section */}
          <div className="text-center space-y-6 py-6 relative z-10">
            <div className="space-y-2">
              <p className="text-xs font-mono uppercase tracking-[0.3em] text-brand-silver">
                THIS IS TO OFFICIALLY CERTIFY THAT
              </p>
              <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight border-b-2 border-brand-green/40 inline-block pb-2 px-6">
                {certificate.user_name}
              </h2>
            </div>

            <p className="text-sm text-brand-silver max-w-xl mx-auto leading-relaxed">
              has successfully completed the comprehensive technical curriculum, practical diagnostics assessments, and masterclass examination for:
            </p>

            <div className="p-6 rounded-2xl bg-brand-surface/60 border border-brand-green/30 max-w-2xl mx-auto shadow-inner">
              <h3 className="text-xl md:text-2xl font-extrabold text-brand-green">
                {certificate.course_title}
              </h3>
            </div>
          </div>

          {/* Footer Metadata & Signatures */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-brand-border/80 relative z-10 text-xs font-mono">
            <div className="space-y-1">
              <p className="text-brand-silver">Date of Issuance:</p>
              <p className="text-white font-bold">{new Date(certificate.issue_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
              <p className="text-[10px] text-emerald-400">Status: Verified Authentic</p>
            </div>

            <div className="text-center space-y-1">
              <div className="font-mono text-sm text-brand-green font-bold tracking-widest border-b border-brand-border pb-1">
                MECH-MOTO BOARD
              </div>
              <p className="text-brand-silver text-[10px]">Technical Education Council</p>
            </div>

            <div className="text-right space-y-1">
              <p className="text-brand-silver">Verification Node:</p>
              <p className="text-white font-bold text-[11px] truncate">verify.ecuforge.com/{certificate.certificate_code}</p>
              <p className="text-[10px] text-brand-silver/70">Cryptographically Signed</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
