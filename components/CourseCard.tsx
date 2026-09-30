'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Course } from '../types';
import { Clock, BookOpen, ChevronRight, Zap, CheckCircle2 } from 'lucide-react';

interface CourseCardProps {
  course: Course;
}

export const CourseCard: React.FC<CourseCardProps> = ({ course }) => {
  const isFree = course.price === 0;

  return (
    <div className="group relative bg-brand-surface border border-brand-border/80 rounded-2xl overflow-hidden hover:border-brand-green/60 hover:shadow-[0_0_25px_rgba(0,255,102,0.15)] transition-all duration-300 flex flex-col justify-between">
      <div>
        {/* Course Thumbnail Image */}
        <div className="relative h-48 w-full overflow-hidden bg-brand-dark">
          <img
            src={course.thumbnail_url}
            alt={course.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-brand-surface via-transparent to-black/40"></div>

          {/* Category Badge */}
          <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-brand-dark/90 backdrop-blur-md border border-brand-green/40 text-brand-green font-mono text-xs font-semibold">
            {course.category_name || 'ECU Technical'}
          </div>

          {/* Level Badge */}
          <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-black/80 backdrop-blur-md border border-white/20 text-white font-mono text-[11px]">
            {course.level}
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-3">
          <h3 className="text-lg font-bold text-white group-hover:text-brand-green transition-colors line-clamp-2 leading-snug">
            {course.title}
          </h3>

          <p className="text-sm text-brand-silver/80 line-clamp-2 leading-relaxed">
            {course.short_description || course.description}
          </p>

          {/* Metadata Stats */}
          <div className="flex items-center gap-4 pt-2 text-xs font-mono text-brand-silver/70 border-t border-brand-border/40">
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-brand-green" />
              <span>{course.duration_hours} Hours</span>
            </div>
            <div className="flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-brand-green" />
              <span>{course.modules_count || 3} Modules</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer / Price & CTA */}
      <div className="p-5 pt-0 flex items-center justify-between border-t border-brand-border/40 mt-4">
        <div>
          {isFree ? (
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-emerald-500/10 text-brand-green font-extrabold text-sm border border-brand-green/30">
              <Zap className="w-3.5 h-3.5" /> FREE
            </span>
          ) : (
            <div className="flex flex-col">
              <span className="text-xs text-brand-silver font-mono">Masterclass Fee</span>
              <span className="text-xl font-black text-white font-mono tracking-tight">
                ₹{course.price.toLocaleString('en-IN')}
              </span>
            </div>
          )}
        </div>

        <Link
          href={`/courses/${course.id}`}
          className="px-4 py-2 rounded-xl bg-brand-surface-light border border-brand-border text-white text-sm font-bold hover:bg-brand-green hover:text-black hover:border-brand-green transition-all duration-200 flex items-center gap-1 group-hover:translate-x-0.5"
        >
          View Course
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
};
