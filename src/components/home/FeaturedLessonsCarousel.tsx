'use client';

import React, { useRef } from 'react';
import Link from 'next/link';
import { Lesson } from '@/types';
import LessonCard from '../common/LessonCard';
import { Sparkles, ChevronRight, ChevronLeft, ArrowLeft } from 'lucide-react';
import { useLessons } from '@/context/LessonsContext';
import { useAuth } from '@/context/AuthContext';
import { getCountryInfo } from '@/lib/curriculumData';

interface FeaturedLessonsCarouselProps {
  initialLessons?: Lesson[];
}

export default function FeaturedLessonsCarousel({ initialLessons }: FeaturedLessonsCarouselProps) {
  const { lessons, selectedCountry } = useLessons();
  const { profile, isAdmin } = useAuth();

  const activeCountryCode = profile?.country || selectedCountry || 'sa';
  const country = getCountryInfo(activeCountryCode);

  const allLessons = lessons.length > 0 ? lessons : (initialLessons || []);
  
  // Filter lessons strictly for active country unless admin or general
  const displayLessons = allLessons.filter(l => {
    if (isAdmin || activeCountryCode === 'general') return true;
    const lessonCountry = l.country || 'sa';
    return lessonCountry === activeCountryCode;
  });

  const scrollRef = useRef<HTMLDivElement>(null);

  const handleScroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = direction === 'left' ? -350 : 350;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  if (displayLessons.length === 0) return null;

  return (
    <section className="py-16 bg-slate-50/50 dark:bg-slate-950/40 border-y border-slate-200/80 dark:border-slate-800">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-600 dark:text-gold-400 bg-amber-50 dark:bg-amber-950/40 px-3 py-1 rounded-full mb-2">
              <Sparkles className="h-4 w-4" />
              <span>{country.flag} شروحات تعليمية متميزة</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-heading">
              أبرز دروس وشروحات مناهج {country.name}
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              دروس ومذكرات للمناهج {country.demonym} لشرح أهم الوحدات والمفاهيم ونماذج الاختبارات.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Scroll Buttons */}
            <div className="hidden sm:flex items-center gap-1.5">
              <button
                onClick={() => handleScroll('right')}
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shadow-xs"
                aria-label="التالي"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
              <button
                onClick={() => handleScroll('left')}
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shadow-xs"
                aria-label="السابق"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
            </div>

            <Link
              href="/curriculum"
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 transition-colors shadow-xs"
            >
              <span>عرض كل دروس {country.shortName}</span>
              <ArrowLeft className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>

        {/* Carousel Container */}
        <div
          ref={scrollRef}
          className="flex gap-6 overflow-x-auto pb-4 pt-1 snap-x scrollbar-none"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {displayLessons.map((lesson) => (
            <div
              key={lesson.id}
              className="w-[280px] sm:w-[320px] shrink-0 snap-start"
            >
              <LessonCard lesson={lesson} />
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
