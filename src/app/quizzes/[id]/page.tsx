'use client';

import React from 'react';
import Link from 'next/link';
import { useLessons } from '@/context/LessonsContext';
import { STANDALONE_QUIZZES, INITIAL_LESSONS } from '@/lib/curriculumData';
import QuizComponent from '@/components/common/QuizComponent';
import GradeBadge from '@/components/common/GradeBadge';
import AdSenseSlot from '@/components/common/AdSenseSlot';
import { Award, ArrowRight, BookOpen, Clock, Sparkles } from 'lucide-react';

interface QuizPageProps {
  params: { id: string };
}

export default function StandaloneQuizPage({ params }: QuizPageProps) {
  const { quizzes, getQuizById, lessons } = useLessons();

  const quiz = getQuizById(params.id) ||
    quizzes.find(q => q.id === params.id || q.lessonId === params.id) ||
    STANDALONE_QUIZZES.find(q => q.id === params.id) ||
    lessons.find(l => l.quiz?.id === params.id)?.quiz ||
    quizzes[0];

  if (!quiz) {
    return (
      <div className="min-h-screen py-20 text-center">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">الاختبار غير موجود</h2>
        <Link href="/quizzes" className="mt-4 inline-block text-gold-500 font-bold">
          العودة لبنك الاختبارات
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-10 bg-slate-50/60 dark:bg-slate-950/40">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        
        {/* Navigation */}
        <div className="mb-6 flex items-center justify-between">
          <Link
            href="/quizzes"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-primary-600 dark:text-slate-400 dark:hover:text-gold-400 transition-colors"
          >
            <ArrowRight className="h-4 w-4" />
            <span>العودة لبنك الاختبارات</span>
          </Link>

          <GradeBadge stage={quiz.stage} gradeNumber={quiz.gradeNumber} size="sm" />
        </div>

        {/* Top Ad */}
        <AdSenseSlot slotType="headerBanner" />

        {/* Main Quiz Runner Box */}
        <div className="mt-6">
          <QuizComponent quiz={quiz} />
        </div>

        {/* Bottom Banner */}
        <div className="mt-8">
          <AdSenseSlot slotType="footerBanner" />
        </div>

      </div>
    </div>
  );
}
