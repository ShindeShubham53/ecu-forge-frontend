'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { BrandLogo } from '../../components/BrandLogo';
import { safeNextPath } from '../../services/safeNext';
import { Lock, Mail, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await login(email, password);
      // Optional same-site return path (e.g. /login?next=/delete-account); default stays /dashboard.
      const next = safeNextPath(new URLSearchParams(window.location.search).get('next'));
      router.push(next ?? '/dashboard');
    } catch (err: any) {
      setError(err.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-8 bg-brand-surface p-8 rounded-3xl border border-brand-border/80 shadow-2xl relative">
        <div className="text-center space-y-3">
          <div className="inline-block">
            <BrandLogo size="md" />
          </div>
          <h2 className="text-2xl font-black text-white uppercase font-sans tracking-tight pt-2">
            Learner & Admin Portal
          </h2>
          <p className="text-xs text-brand-silver">
            Sign in to access your ECU masterclasses, progress & certificates.
          </p>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-mono">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-xs font-mono text-brand-silver font-bold uppercase">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-brand-silver absolute left-3.5 top-3.5" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="user@domain.com"
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-brand-dark border border-brand-border text-white text-sm focus:outline-none focus:border-brand-green transition-colors"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-mono text-brand-silver font-bold uppercase">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-brand-silver absolute left-3.5 top-3.5" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-brand-dark border border-brand-border text-white text-sm focus:outline-none focus:border-brand-green transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-brand-green text-black font-extrabold text-sm hover:bg-emerald-400 disabled:opacity-50 transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(0,255,102,0.2)]"
          >
            {loading ? 'Authenticating...' : 'Sign In to Portal'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center text-xs text-brand-silver pt-2 border-t border-brand-border/60">
          New to ECU FORGE?{' '}
          <Link href="/register" className="text-brand-green font-bold hover:underline">
            Create an Account
          </Link>
        </div>
      </div>
    </div>
  );
}
