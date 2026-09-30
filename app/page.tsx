'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { CourseCard } from '../components/CourseCard';
import { Course } from '../types';
import { api } from '../services/api';
import {
  Cpu,
  Zap,
  ShieldCheck,
  Award,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  Sliders,
  BatteryCharging,
  ShieldAlert,
  ArrowRight,
  Layers,
  Sparkles,
  HelpCircle,
  ChevronDown,
} from 'lucide-react';

export default function LandingPage() {
  const [featuredCourses, setFeaturedCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFaqIndex, setActiveFaqIndex] = useState<number | null>(0);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await api.get('/courses');
        if (res.data.success) {
          setFeaturedCourses(res.data.data.slice(0, 3));
        }
      } catch (e) {
        // Fallback demo courses if API loading
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  const categoriesList = [
    {
      icon: Cpu,
      title: 'ECU & Diagnostics',
      desc: 'TriCore MCUs, MED17/EDC17 architectures, bench connections & EEPROM cloning.',
      slug: 'cat_ecu',
    },
    {
      icon: Zap,
      title: 'Automotive Electronics',
      desc: 'CAN High/Low differential signals, LIN-Bus networks & oscilloscope decoding.',
      slug: 'cat_electronics',
    },
    {
      icon: Sliders,
      title: 'Vehicle Electrical Systems',
      desc: 'Power distribution, relay logic, multiplexing schematics & fault tracing.',
      slug: 'cat_electrical',
    },
    {
      icon: BatteryCharging,
      title: 'EV & Hybrid Systems',
      desc: 'High-voltage safety (1000V), HVIL interlock loops & BMS battery diagnostics.',
      slug: 'cat_ev',
    },
    {
      icon: Layers,
      title: 'Automotive Fundamentals',
      desc: 'Sensor 5V rails, actuator PWM duty cycles, and multimeter testing techniques.',
      slug: 'cat_fundamentals',
    },
    {
      icon: ShieldAlert,
      title: 'Advanced Diagnostics',
      desc: 'Troubleshooting complex DTC codes, immobilizer transfers, and flash tuning.',
      slug: 'cat_advanced',
    },
  ];

  const faqs = [
    {
      q: 'What prior experience is required to enroll in ECU FORGE masterclasses?',
      a: 'Courses are designed for all technical levels. Beginner modules cover basic electrical fundamentals, while Advanced masterclasses assume a baseline understanding of 12V automotive DC electronics and multimeter operations.',
    },
    {
      q: 'Are the certificates accredited and verifiable by employers?',
      a: 'Yes. Every ECU FORGE certificate contains a unique cryptographic ID powered by MECH-MOTO engineering standards. Anyone can verify certificate authenticity at /verify/[certificateId].',
    },
    {
      q: 'How does the video playback and progress tracking work?',
      a: 'All video lectures are hosted via high-speed Cloudflare Stream architecture. Your playback position is automatically synced to your database account so you can pause and resume watching from any device.',
    },
    {
      q: 'Can I access course resources like pinout diagrams and PDF wiring schematics?',
      a: 'Yes! Enrolled students have instant access to downloadable PDF pinouts, ECU component identification maps, and bench cable cheat sheets hosted on Cloudflare R2.',
    },
  ];

  return (
    <div className="space-y-24 pb-20">
      {/* ==================== 1. HERO SECTION ==================== */}
      <section className="relative pt-12 pb-20 md:pt-20 md:pb-32 overflow-hidden border-b border-brand-border/40">
        {/* Background Visual Backdrop */}
        <div className="absolute inset-0 bg-grid-pattern opacity-40 pointer-events-none"></div>
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-brand-green/10 blur-[140px] rounded-full pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-8">
          {/* Top Pill Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-surface border border-brand-green/40 text-brand-green font-mono text-xs font-semibold shadow-[0_0_20px_rgba(0,255,102,0.15)]">
            <Sparkles className="w-4 h-4 text-brand-green" />
            <span>ECU FORGE MASTERCLASS • POWERED BY MECH-MOTO</span>
          </div>

          {/* Headline & Subtitle */}
          <div className="max-w-4xl mx-auto space-y-4">
            <h1 className="text-4xl md:text-7xl font-black tracking-tight text-white uppercase font-sans leading-none">
              Master Automotive <span className="text-brand-green text-shadow-sm">Technology.</span>
            </h1>
            <p className="text-lg md:text-xl text-brand-silver max-w-2xl mx-auto leading-relaxed font-sans">
              Learn automotive diagnostics, ECU technology, electrical systems and advanced vehicle technologies through structured technical masterclasses.
            </p>
          </div>

          {/* Hero Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              href="/courses"
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-brand-green text-black font-extrabold text-base hover:bg-emerald-400 hover:shadow-[0_0_30px_rgba(0,255,102,0.4)] transition-all duration-300 flex items-center justify-center gap-2"
            >
              <BookOpen className="w-5 h-5" />
              Explore Courses
            </Link>
            <Link
              href="/register"
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-brand-surface border border-brand-border text-white font-bold text-base hover:border-brand-green hover:bg-brand-surface-light transition-all duration-300 flex items-center justify-center gap-2"
            >
              Get Started
              <ChevronRight className="w-5 h-5 text-brand-green" />
            </Link>
          </div>

          {/* Telemetry Visual Dashboard Graphic */}
          <div className="pt-10 max-w-5xl mx-auto">
            <div className="p-4 md:p-6 rounded-3xl bg-brand-surface/90 border border-brand-green/30 shadow-[0_0_50px_rgba(0,0,0,0.9)] backdrop-blur-xl relative overflow-hidden text-left space-y-4">
              <div className="flex items-center justify-between border-b border-brand-border/60 pb-3">
                <div className="flex items-center gap-2 font-mono text-xs text-brand-silver">
                  <span className="w-3 h-3 rounded-full bg-brand-green animate-pulse"></span>
                  <span>ECU BENCH DIAGNOSTIC INTERFACE [CAN-BUS 500kbps]</span>
                </div>
                <span className="text-xs font-mono text-brand-green font-bold">MECH-MOTO OS v4.2</span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 font-mono text-xs">
                <div className="p-3 rounded-xl bg-brand-dark border border-brand-border">
                  <p className="text-brand-silver text-[10px]">MCU TYPE</p>
                  <p className="text-brand-green font-bold text-sm">Infineon TriCore TC1796</p>
                </div>
                <div className="p-3 rounded-xl bg-brand-dark border border-brand-border">
                  <p className="text-brand-silver text-[10px]">BENCH VOLTAGE</p>
                  <p className="text-white font-bold text-sm">13.8V DC [0.24A]</p>
                </div>
                <div className="p-3 rounded-xl bg-brand-dark border border-brand-border">
                  <p className="text-brand-silver text-[10px]">CAN-HIGH / LOW</p>
                  <p className="text-white font-bold text-sm">3.48V / 1.52V</p>
                </div>
                <div className="p-3 rounded-xl bg-brand-dark border border-brand-border">
                  <p className="text-brand-silver text-[10px]">SECURITY ACCESS</p>
                  <p className="text-emerald-400 font-bold text-sm">UNLOCK SUCCESS</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== 2. FEATURED COURSES ==================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-4">
          <div>
            <span className="text-brand-green font-mono text-xs font-bold uppercase tracking-widest">
              CURATED MASTERCLASSES
            </span>
            <h2 className="text-3xl md:text-4xl font-black text-white uppercase font-sans mt-1">
              Featured Technical Courses
            </h2>
          </div>
          <Link
            href="/courses"
            className="text-sm font-bold text-brand-green hover:underline flex items-center gap-1 font-mono"
          >
            View All Masterclasses <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-96 rounded-2xl bg-brand-surface animate-pulse"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {featuredCourses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        )}
      </section>

      {/* ==================== 3. WHY ECU FORGE ==================== */}
      <section id="why-us" className="bg-brand-dark py-20 border-y border-brand-border/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-brand-green font-mono text-xs font-bold uppercase tracking-widest">
              THE MECH-MOTO ADVANTAGE
            </span>
            <h2 className="text-3xl md:text-5xl font-black text-white uppercase font-sans">
              Why Engineers Choose ECU FORGE
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 rounded-2xl bg-brand-surface border border-brand-border space-y-4 hover:border-brand-green/50 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-brand-green/10 border border-brand-green/30 text-brand-green flex items-center justify-center">
                <Cpu className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white">Industry-Focused Learning</h3>
              <p className="text-sm text-brand-silver leading-relaxed">
                Real-world diagnostic procedures used in modern workshops, covering Bosch, Siemens, Continental, and Delphi ECUs.
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-brand-surface border border-brand-border space-y-4 hover:border-brand-green/50 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-brand-green/10 border border-brand-green/30 text-brand-green flex items-center justify-center">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white">Expert-Led Training</h3>
              <p className="text-sm text-brand-silver leading-relaxed">
                Lectures engineered directly by senior MECH-MOTO calibration architects with decades of automotive diagnostic experience.
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-brand-surface border border-brand-border space-y-4 hover:border-brand-green/50 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-brand-green/10 border border-brand-green/30 text-brand-green flex items-center justify-center">
                <Award className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white">Verified Certificates</h3>
              <p className="text-sm text-brand-silver leading-relaxed">
                Receive verifiable digital credentials with unique accreditation IDs powered by MECH-MOTO standards upon course completion.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== 4. LEARNING CATEGORIES ==================== */}
      <section id="categories" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="text-brand-green font-mono text-xs font-bold uppercase tracking-widest">
            EXPLORE BY SPECIALIZATION
          </span>
          <h2 className="text-3xl md:text-4xl font-black text-white uppercase font-sans">
            Learning Categories
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {categoriesList.map((cat, idx) => {
            const IconComp = cat.icon;
            return (
              <Link
                key={idx}
                href="/courses"
                className="p-6 rounded-2xl bg-brand-surface border border-brand-border hover:border-brand-green hover:shadow-[0_0_20px_rgba(0,255,102,0.15)] transition-all duration-300 group flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-lg bg-brand-dark border border-brand-border text-brand-green flex items-center justify-center group-hover:scale-110 transition-transform">
                    <IconComp className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-bold text-white group-hover:text-brand-green transition-colors">
                    {cat.title}
                  </h3>
                  <p className="text-xs text-brand-silver leading-relaxed">{cat.desc}</p>
                </div>
                <div className="pt-4 flex items-center gap-1 text-xs font-mono text-brand-green font-bold group-hover:translate-x-1 transition-transform">
                  <span>Explore Modules</span>
                  <ChevronRight className="w-4 h-4" />
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* ==================== 5. HOW IT WORKS ==================== */}
      <section className="bg-brand-surface py-20 border-y border-brand-border/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-brand-green font-mono text-xs font-bold uppercase tracking-widest">
              THE METHODOLOGY
            </span>
            <h2 className="text-3xl md:text-4xl font-black text-white uppercase font-sans">
              How It Works
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-6 gap-4 text-center font-mono">
            {['Browse', 'Enroll', 'Learn', 'Practice', 'Complete', 'Get Certified'].map((step, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-brand-dark border border-brand-border space-y-2">
                <span className="text-2xl font-black text-brand-green">0{idx + 1}</span>
                <p className="text-xs text-white font-bold uppercase">{step}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ==================== 6. CERTIFICATE SECTION ==================== */}
      <section id="certificate" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 md:p-14 rounded-3xl bg-gradient-to-r from-brand-surface via-brand-dark to-brand-surface border border-brand-green/40 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-10">
          <div className="space-y-4 max-w-xl">
            <span className="px-3 py-1 rounded bg-brand-green/20 text-brand-green font-mono text-xs font-bold">
              INDUSTRY CREDENTIALS
            </span>
            <h2 className="text-3xl md:text-4xl font-black text-white uppercase font-sans">
              Earn Accredited Certificates
            </h2>
            <p className="text-sm text-brand-silver leading-relaxed">
              Every masterclass completion unlocks an official ECU FORGE Certificate powered by MECH-MOTO. Certificates include unique verification codes for employer validation.
            </p>
            <div className="pt-2">
              <Link
                href="/verify/ECU-2026-EV99X4"
                className="px-6 py-3 rounded-xl bg-brand-green text-black font-bold text-sm hover:bg-emerald-400 transition-colors inline-flex items-center gap-2"
              >
                Sample Verification Demo <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          <div className="w-full md:w-80 p-6 rounded-2xl bg-black border border-brand-green/30 font-mono text-xs space-y-3 shadow-2xl">
            <div className="text-brand-green font-bold">ECU FORGE MASTERCLASS</div>
            <div className="text-white text-sm font-extrabold">Certificate of Completion</div>
            <div className="text-brand-silver">Recipient: David Vance</div>
            <div className="p-2 rounded bg-brand-surface text-[10px] text-emerald-400 border border-brand-border">
              VERIFICATION ID: ECU-2026-EV99X4
            </div>
            <div className="text-[10px] text-brand-silver/60">Powered by MECH-MOTO</div>
          </div>
        </div>
      </section>

      {/* ==================== 7. FAQ ==================== */}
      <section id="faq" className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center space-y-2">
          <span className="text-brand-green font-mono text-xs font-bold uppercase">FREQUENTLY ASKED QUESTIONS</span>
          <h2 className="text-3xl font-black text-white uppercase">Questions & Answers</h2>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              onClick={() => setActiveFaqIndex(activeFaqIndex === idx ? null : idx)}
              className="p-6 rounded-2xl bg-brand-surface border border-brand-border hover:border-brand-green/40 transition-colors cursor-pointer space-y-3"
            >
              <div className="flex items-center justify-between text-base font-bold text-white">
                <span>{faq.q}</span>
                <ChevronDown
                  className={`w-5 h-5 text-brand-green transition-transform duration-300 ${
                    activeFaqIndex === idx ? 'rotate-180' : ''
                  }`}
                />
              </div>
              {activeFaqIndex === idx && (
                <p className="text-sm text-brand-silver leading-relaxed pt-2 border-t border-brand-border/40">
                  {faq.a}
                </p>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
