'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { INITIAL_LESSONS, STANDALONE_QUIZZES } from '@/lib/curriculumData';
import LessonCard from '@/components/common/LessonCard';
import IslamicPattern from '@/components/layout/IslamicPattern';
import { 
  User, 
  Bookmark, 
  Award, 
  CheckCircle2, 
  Flame, 
  ShieldCheck, 
  BookOpen, 
  Clock, 
  LogIn,
  Sparkles
} from 'lucide-react';
import Link from 'next/link';

export default function ProfilePage() {
  const { user, profile, isAdmin, loading } = useAuth();
  const [activeTab, setActiveTab] = useState<'saved' | 'quizzes' | 'badges'>('saved');

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-600 border-t-transparent" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen py-20 flex items-center justify-center bg-slate-50/60 dark:bg-slate-950/40">
        <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 text-center max-w-md mx-4 shadow-xl">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-50 dark:bg-slate-800 text-primary-600 dark:text-gold-400 mb-4">
            <User className="h-8 w-8" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            يرجى تسجيل الدخول لعرض ملفك الشخصي
          </h2>
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            سجل دخولك لتتمكن من متابعة دروسك المحفوظة ونتائج اختباراتك التقييمية.
          </p>
          <Link
            href="/auth/login"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-primary-600 hover:bg-primary-700 text-white px-6 py-2.5 text-xs font-bold shadow transition-all"
          >
            <LogIn className="h-4 w-4" />
            <span>تسجيل الدخول الآن</span>
          </Link>
        </div>
      </div>
    );
  }

  const savedLessonIds = profile?.savedLessons || [];
  const savedLessons = INITIAL_LESSONS.filter((l) => savedLessonIds.includes(l.id));
  const quizHistory = profile?.quizHistory || [];

  const passedQuizzesCount = quizHistory.filter((q) => q.passed).length;
  const avgScore = quizHistory.length > 0 
    ? Math.round(quizHistory.reduce((acc, q) => acc + q.percentage, 0) / quizHistory.length) 
    : 0;

  return (
    <div className="min-h-screen py-10 bg-slate-50/60 dark:bg-slate-950/40">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Profile Header Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-primary-900 via-primary-800 to-indigo-950 text-white p-6 sm:p-10 shadow-2xl mb-10">
          <IslamicPattern variant="stars" opacity={0.06} />

          <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6">
            
            <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-right">
              {/* User Avatar */}
              <div className="relative flex h-20 w-20 shrink-0 items-center justify-center rounded-3xl bg-gradient-to-tr from-gold-400 to-amber-500 text-slate-950 font-black text-3xl shadow-glow">
                {profile?.displayName?.charAt(0) || 'ط'}
              </div>

              <div>
                <div className="flex items-center justify-center sm:justify-start gap-2">
                  <h1 className="text-2xl font-black font-heading text-white">
                    {profile?.displayName || 'طالب متميز'}
                  </h1>
                  {isAdmin && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-500 text-slate-950 px-2.5 py-0.5 text-[11px] font-black">
                      <ShieldCheck className="h-3 w-3" />
                      <span>مشرف النظام</span>
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-300 mt-1">
                  {user.email}
                </p>

                <div className="mt-3 flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  <span className="rounded-full bg-white/10 px-3 py-1 text-[11px] font-semibold text-gold-300 backdrop-blur-xs">
                    🇸🇦 المنهج السعودي
                  </span>
                  <span className="rounded-full bg-white/10 px-3 py-1 text-[11px] font-semibold text-slate-200 backdrop-blur-xs">
                    عضو منذ {new Date().getFullYear()}م
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Actions if Admin */}
            {isAdmin && (
              <Link
                href="/admin"
                className="flex items-center gap-2 rounded-2xl bg-gold-500 hover:bg-gold-600 text-slate-950 font-black px-5 py-2.5 text-xs shadow-lg transition-all"
              >
                <ShieldCheck className="h-4 w-4" />
                <span>دخول لوحة تحكم المشرف</span>
              </Link>
            )}

          </div>

          {/* Quick Metrics Bar */}
          <div className="relative z-10 mt-8 grid grid-cols-2 sm:grid-cols-4 gap-4 border-t border-white/15 pt-6 text-center">
            <div>
              <div className="text-2xl font-black text-gold-400 font-heading">
                {savedLessons.length}
              </div>
              <div className="text-xs text-slate-300 mt-0.5">دروس محفوظة</div>
            </div>
            <div>
              <div className="text-2xl font-black text-emerald-400 font-heading">
                {quizHistory.length}
              </div>
              <div className="text-xs text-slate-300 mt-0.5">اختبارات مكتملة</div>
            </div>
            <div>
              <div className="text-2xl font-black text-sky-400 font-heading">
                {avgScore}%
              </div>
              <div className="text-xs text-slate-300 mt-0.5">متوسط الدرجات</div>
            </div>
            <div>
              <div className="text-2xl font-black text-amber-400 font-heading flex items-center justify-center gap-1">
                <Flame className="h-5 w-5 text-amber-400" />
                <span>3 أيام</span>
              </div>
              <div className="text-xs text-slate-300 mt-0.5">سلسلة التعلم اليومي</div>
            </div>
          </div>

        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 mb-8">
          <button
            onClick={() => setActiveTab('saved')}
            className={`flex items-center gap-2 pb-3.5 px-4 text-xs sm:text-sm font-bold border-b-2 transition-all ${
              activeTab === 'saved'
                ? 'border-primary-600 text-primary-600 dark:border-gold-400 dark:text-gold-400'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Bookmark className="h-4 w-4" />
            <span>الدروس المحفوظة ({savedLessons.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('quizzes')}
            className={`flex items-center gap-2 pb-3.5 px-4 text-xs sm:text-sm font-bold border-b-2 transition-all ${
              activeTab === 'quizzes'
                ? 'border-primary-600 text-primary-600 dark:border-gold-400 dark:text-gold-400'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Award className="h-4 w-4" />
            <span>نتائج الاختبارات ({quizHistory.length})</span>
          </button>
        </div>

        {/* Tab 1: Saved Lessons */}
        {activeTab === 'saved' && (
          <div>
            {savedLessons.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {savedLessons.map((lesson) => (
                  <LessonCard key={lesson.id} lesson={lesson} />
                ))}
              </div>
            ) : (
              <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-12 text-center">
                <Bookmark className="mx-auto h-12 w-12 text-slate-300 dark:text-slate-600" />
                <h3 className="mt-3 text-base font-bold text-slate-800 dark:text-white">
                  لم تحفظ أية دروس بعد
                </h3>
                <p className="mt-1 text-xs text-slate-500">
                  أثناء تصفح الدروس، اضغط على زر الحفظ للرجوع إليها في أي وقت بسهولة.
                </p>
                <Link
                  href="/curriculum"
                  className="mt-4 inline-flex items-center gap-1 rounded-xl bg-primary-600 text-white px-4 py-2 text-xs font-bold shadow"
                >
                  استكشف المناهج
                </Link>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Quiz Results History */}
        {activeTab === 'quizzes' && (
          <div>
            {quizHistory.length > 0 ? (
              <div className="space-y-4">
                {quizHistory.map((res, idx) => (
                  <div
                    key={idx}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs"
                  >
                    <div>
                      <h4 className="text-sm font-bold text-slate-800 dark:text-white">
                        {res.quizTitle}
                      </h4>
                      <p className="text-xs text-slate-400 mt-1">
                        أجبت على {res.score} من {res.totalQuestions} بشكل صحيح • {new Date(res.completedAt).toLocaleDateString('ar-SA')}
                      </p>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-left sm:text-right">
                        <span className={`text-base font-black ${res.passed ? 'text-emerald-500' : 'text-rose-500'}`}>
                          {res.percentage}%
                        </span>
                        <span className={`block text-[10px] font-bold ${res.passed ? 'text-emerald-600' : 'text-rose-600'}`}>
                          {res.passed ? 'تم الاجتياز بنجاح' : 'يحتاج إلى مراجعة'}
                        </span>
                      </div>

                      <Link
                        href={`/quizzes/${res.quizId}`}
                        className="rounded-xl border border-slate-200 dark:border-slate-700 px-3 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
                      >
                        إعادة الاختبار
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-12 text-center">
                <Award className="mx-auto h-12 w-12 text-slate-300 dark:text-slate-600" />
                <h3 className="mt-3 text-base font-bold text-slate-800 dark:text-white">
                  لم تجرِ أية اختبارات بعد
                </h3>
                <p className="mt-1 text-xs text-slate-500">
                  اختبر معلوماتك في بنك الأسئلة الشامل لقياس فهمك لمقرراتك.
                </p>
                <Link
                  href="/quizzes"
                  className="mt-4 inline-flex items-center gap-1 rounded-xl bg-gold-500 text-slate-950 font-black px-5 py-2.5 text-xs shadow"
                >
                  بدء أول اختبار
                </Link>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
