'use client';

import React from 'react';
import Link from 'next/link';
import { BrandLogo } from './BrandLogo';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-brand-dark border-t border-brand-border/60 text-brand-silver">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand Col */}
          <div className="md:col-span-1 space-y-4">
            <BrandLogo size="md" />
            <p className="text-sm text-brand-silver/70 leading-relaxed font-sans">
              The premier online masterclass platform for automotive diagnostic technicians, ECU remapping specialists, and vehicle electronics engineers.
            </p>
            <div className="pt-2 text-xs font-mono text-brand-green/80 uppercase tracking-widest">
              ECU FORGE MASTERCLASS <br />
              <span className="text-white font-bold">Powered by MECH-MOTO</span>
            </div>
          </div>

          {/* Masterclasses */}
          <div>
            <h4 className="text-white font-bold text-sm uppercase tracking-wider mb-4 font-mono">
              Technical Modules
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/courses?category=cat_ecu" className="hover:text-brand-green transition-colors">
                  ECU & Diagnostics
                </Link>
              </li>
              <li>
                <Link href="/courses?category=cat_electronics" className="hover:text-brand-green transition-colors">
                  Automotive Electronics
                </Link>
              </li>
              <li>
                <Link href="/courses?category=cat_electrical" className="hover:text-brand-green transition-colors">
                  Vehicle Electrical Systems
                </Link>
              </li>
              <li>
                <Link href="/courses?category=cat_ev" className="hover:text-brand-green transition-colors">
                  EV & Hybrid Diagnostics
                </Link>
              </li>
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-bold text-sm uppercase tracking-wider mb-4 font-mono">
              Platform
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/courses" className="hover:text-brand-green transition-colors">
                  All Courses
                </Link>
              </li>
              <li>
                <Link href="/#why-us" className="hover:text-brand-green transition-colors">
                  Why ECU Forge
                </Link>
              </li>
              <li>
                <Link href="/#certificate" className="hover:text-brand-green transition-colors">
                  Certificate Verification
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-brand-green transition-colors">
                  Learner Portal
                </Link>
              </li>
            </ul>
          </div>

          {/* Tech Spec / Certification */}
          <div>
            <h4 className="text-white font-bold text-sm uppercase tracking-wider mb-4 font-mono">
              Certification & Integrity
            </h4>
            <p className="text-xs text-brand-silver/70 leading-relaxed mb-4">
              All ECU FORGE certificates are cryptographically indexed with unique verification IDs and powered by MECH-MOTO engineering standards.
            </p>
            <div className="p-3 rounded-lg bg-brand-surface border border-brand-border text-xs text-brand-green font-mono">
              STATUS: ONLINE [v2.4.0]
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-brand-border/60 mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-brand-silver/60">
          <p>© {new Date().getFullYear()} ECU FORGE MASTERCLASS. Powered by MECH-MOTO. All rights reserved.</p>
          <nav aria-label="Legal" className="flex flex-wrap justify-center gap-x-6 gap-y-2 mt-4 sm:mt-0">
            <Link href="/privacy" className="hover:text-brand-green transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-brand-green transition-colors">
              Terms &amp; Conditions
            </Link>
            <Link href="/refund-policy" className="hover:text-brand-green transition-colors">
              Refund Policy
            </Link>
            <Link href="/delete-account" className="hover:text-brand-green transition-colors">
              Delete Account
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  );
};
