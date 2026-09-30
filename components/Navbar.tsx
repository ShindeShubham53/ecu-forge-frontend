'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
import { BrandLogo } from './BrandLogo';
import { BookOpen, User as UserIcon, LogOut, ShieldAlert, LayoutDashboard, Menu, X, ChevronRight } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, logout, isAdmin } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-brand-bg/90 backdrop-blur-md border-b border-brand-border/60 transition-all duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Brand Logo */}
          <Link href="/">
            <BrandLogo size="md" />
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-8">
            <Link
              href="/courses"
              className="text-sm font-medium text-brand-silver hover:text-brand-green transition-colors flex items-center gap-2"
            >
              <BookOpen className="w-4 h-4 text-brand-green" />
              Courses
            </Link>
            <Link
              href="/#why-us"
              className="text-sm font-medium text-brand-silver hover:text-brand-green transition-colors"
            >
              Why ECU Forge
            </Link>
            <Link
              href="/#categories"
              className="text-sm font-medium text-brand-silver hover:text-brand-green transition-colors"
            >
              Categories
            </Link>
            <Link
              href="/#faq"
              className="text-sm font-medium text-brand-silver hover:text-brand-green transition-colors"
            >
              FAQ
            </Link>
          </div>

          {/* User Auth CTAs */}
          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-3 px-4 py-2 rounded-xl bg-brand-surface border border-brand-border hover:border-brand-green/50 text-white text-sm font-medium transition-all"
                >
                  <div className="w-7 h-7 rounded-full bg-brand-green/20 border border-brand-green text-brand-green flex items-center justify-center font-bold text-xs">
                    {user.full_name?.charAt(0) || 'U'}
                  </div>
                  <span>{user.full_name}</span>
                  {isAdmin && (
                    <span className="text-[10px] px-2 py-0.5 rounded bg-brand-green/20 text-brand-green font-mono border border-brand-green/30">
                      ADMIN
                    </span>
                  )}
                </button>

                {/* Dropdown Menu */}
                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-brand-surface border border-brand-border rounded-xl shadow-2xl py-2 z-50">
                    <div className="px-4 py-2 border-b border-brand-border/60">
                      <p className="text-xs text-brand-silver">Signed in as</p>
                      <p className="text-sm font-bold text-white truncate">{user.email}</p>
                    </div>

                    <Link
                      href="/dashboard"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-brand-silver hover:text-white hover:bg-brand-surface-light transition-colors"
                    >
                      <LayoutDashboard className="w-4 h-4 text-brand-green" />
                      Learner Dashboard
                    </Link>

                    {isAdmin && (
                      <Link
                        href="/admin"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-brand-green hover:bg-brand-green/10 transition-colors font-semibold"
                      >
                        <ShieldAlert className="w-4 h-4" />
                        Admin Dashboard
                      </Link>
                    )}

                    <div className="border-t border-brand-border/60 my-1"></div>

                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        logout();
                      }}
                      className="w-full text-left flex items-center gap-2.5 px-4 py-2.5 text-sm text-rose-400 hover:bg-rose-500/10 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  href="/login"
                  className="px-4 py-2 text-sm font-medium text-brand-silver hover:text-white transition-colors"
                >
                  Log In
                </Link>
                <Link
                  href="/register"
                  className="px-5 py-2.5 rounded-xl bg-brand-green text-black font-bold text-sm hover:bg-emerald-400 hover:shadow-[0_0_20px_rgba(0,255,102,0.4)] transition-all flex items-center gap-1.5"
                >
                  Get Started
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-brand-silver hover:text-white hover:bg-brand-surface"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-brand-border bg-brand-surface px-4 pt-2 pb-6 space-y-3">
          <Link
            href="/courses"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-base font-medium text-brand-silver hover:text-brand-green"
          >
            Courses Catalog
          </Link>
          <Link
            href="/#why-us"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-base font-medium text-brand-silver hover:text-brand-green"
          >
            Why ECU Forge
          </Link>
          {user ? (
            <>
              <Link
                href="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 text-base font-medium text-brand-green"
              >
                Learner Dashboard
              </Link>
              {isAdmin && (
                <Link
                  href="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block py-2 text-base font-medium text-emerald-400"
                >
                  Admin Dashboard
                </Link>
              )}
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  logout();
                }}
                className="w-full text-left py-2 text-base font-medium text-rose-400"
              >
                Sign Out
              </button>
            </>
          ) : (
            <div className="pt-4 flex flex-col gap-2">
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full py-2.5 text-center text-sm font-bold text-white bg-brand-surface-light rounded-xl border border-brand-border"
              >
                Log In
              </Link>
              <Link
                href="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full py-2.5 text-center text-sm font-bold text-black bg-brand-green rounded-xl"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};
