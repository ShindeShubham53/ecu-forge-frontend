'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../context/AuthContext';
import { Certificate } from '../../../types';
import { api } from '../../../services/api';
import { Award, Search, ExternalLink, ChevronLeft, ShieldCheck } from 'lucide-react';

export default function AdminCertificateManagementPage() {
  const router = useRouter();
  const { user, isAdmin, loading: authLoading } = useAuth();
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && (!user || !isAdmin)) {
      router.push('/dashboard');
      return;
    }

    const fetchCertificates = async () => {
      try {
        const res = await api.get('/admin/certificates');
        if (res.data.success) setCertificates(res.data.data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    if (user && isAdmin) fetchCertificates();
  }, [user, isAdmin, authLoading, router]);

  const filteredCerts = certificates.filter(
    (c) =>
      c.certificate_code.toLowerCase().includes(search.toLowerCase()) ||
      c.user_name.toLowerCase().includes(search.toLowerCase()) ||
      c.course_title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="flex items-center justify-between border-b border-brand-border/60 pb-6">
        <div className="flex items-center gap-3">
          <Link href="/admin" className="p-2 rounded-lg bg-brand-surface text-brand-silver hover:text-white">
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <div>
            <span className="text-brand-green font-mono text-xs font-bold uppercase">ADMINISTRATION</span>
            <h1 className="text-3xl font-black text-white uppercase font-sans">Certificate Audit & Verification</h1>
          </div>
        </div>

        <div className="relative w-72">
          <Search className="w-4 h-4 text-brand-silver absolute left-3 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search certificate ID or learner..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-brand-surface border border-brand-border text-white text-xs font-mono"
          />
        </div>
      </div>

      <div className="rounded-3xl bg-brand-surface border border-brand-border overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-brand-border/80 bg-brand-dark text-xs font-mono text-brand-silver uppercase">
              <th className="p-4">Certificate ID</th>
              <th className="p-4">Learner Name</th>
              <th className="p-4">Course Title</th>
              <th className="p-4">Issue Date</th>
              <th className="p-4 text-right">Verification Link</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-border/40 text-xs font-mono">
            {filteredCerts.map((c) => (
              <tr key={c.id} className="hover:bg-brand-surface-light/50 transition-colors">
                <td className="p-4 font-bold text-brand-green">{c.certificate_code}</td>
                <td className="p-4 text-white font-bold">{c.user_name}</td>
                <td className="p-4 text-brand-silver">{c.course_title}</td>
                <td className="p-4 text-brand-silver">{new Date(c.issue_date).toLocaleDateString()}</td>
                <td className="p-4 text-right">
                  <Link
                    href={`/verify/${c.certificate_code}`}
                    target="_blank"
                    className="px-3 py-1 rounded-lg bg-brand-dark border border-brand-border text-brand-green hover:border-brand-green inline-flex items-center gap-1"
                  >
                    Verify Node <ExternalLink className="w-3 h-3" />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
