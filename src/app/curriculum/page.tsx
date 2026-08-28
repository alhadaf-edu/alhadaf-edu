'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { getStagesForCountry, getGradesForCountry, getSubjectsForCountry, ARAB_COUNTRIES } from '@/lib/curriculumData';
import { useLessons } from '@/context/LessonsContext';
import { useAuth } from '@/context/AuthContext';
import LessonCard from '@/components/common/LessonCard';
import AdSenseSlot from '@/components/common/AdSenseSlot';
import IslamicPattern from '@/components/layout/IslamicPattern';
import { BookOpen, GraduationCap, Globe2, Sparkles } from 'lucide-react';
import { StageType, CountryCode } from '@/types';

function CurriculumPageInner() {
  const searchParams = useSearchParams();
  const { lessons, selectedCountry } = useLessons();
  const { profile } = useAuth();

  const activeCountryCode: CountryCode = profile?.country || selectedCountry || 'sa';
  const countryInfo = ARAB_COUNTRIES.find(c => c.code === activeCountryCode) || ARAB_COUNTRIES[0];

  const stages = getStagesForCountry(activeCountryCode);
  const urlStage = (searchParams.get('stage') as StageType) || stages[0]?.id || 'middle';
  const urlGrade = searchParams.get('grade') ? parseInt(searchParams.get('grade')!) : undefined;
  const urlSubject = searchParams.get('subject') || undefined;

  const [currentStage, setCurrentStage] = useState<StageType>(urlStage);
  const [currentGrade, setCurrentGrade] = useState<number | undefined>(urlGrade);
  const [currentSubject, setCurrentSubject] = useState<string | undefined>(urlSubject);

  useEffect(() => {
    if (!stages.some(s => s.id === currentStage)) {
      setCurrentStage(stages[0]?.id || 'middle');
    }
  }, [activeCountryCode, stages, currentStage]);

  // Filter lessons strictly by country & stage & grade & subject
  const filteredLessons = lessons.filter((lesson) => {
    const lessonCountry = lesson.country || 'sa';
    if (activeCountryCode !== 'general' && lessonCountry !== activeCountryCode) return false;
    if (currentStage && lesson.stage !== currentStage) return false;
    if (currentGrade && lesson.gradeNumber !== currentGrade) return false;
    if (currentSubject && lesson.subjectId !== currentSubject) return false;
    return true;
  });

  const stageGrades = getGradesForCountry(activeCountryCode, currentStage);
  const stageSubjects = getSubjectsForCountry(activeCountryCode, currentStage);
  const currentStageInfo = stages.find((s) => s.id === currentStage);

  return (
    <div className="min-h-screen py-10 bg-slate-50/60 dark:bg-slate-950/40">
      
      {/* Header Banner */}
      <div className="relative bg-gradient-to-r from-primary-950 via-primary-900 to-indigo-950 text-white py-14 overflow-hidden mb-10">
        <IslamicPattern variant="stars" opacity={0.06} />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          
          <div className="inline-flex items-center gap-2 rounded-full border border-gold-400/30 bg-gold-500/10 px-4 py-1.5 text-xs font-bold text-gold-300 mb-4 backdrop-blur-md">
            <span className="text-lg leading-none">{countryInfo.flag}</span>
            <span>مناهج {countryInfo.name}</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black font-heading text-white">
            دليل المقررات والدراسة — {countryInfo.name}
          </h1>
          <p className="mt-3 text-xs sm:text-base text-slate-200 max-w-2xl mx-auto">
            {countryInfo.description}
          </p>

          {/* Stage Switcher */}
          <div className="mt-8 flex flex-wrap rounded-2xl bg-white/10 p-1.5 max-w-xl mx-auto backdrop-blur-md border border-white/15">
            {stages.map((stage) => (
              <button
                key={stage.id}
                onClick={() => {
                  setCurrentStage(stage.id as StageType);
                  setCurrentGrade(undefined);
                  setCurrentSubject(undefined);
                }}
                className={`flex-1 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold text-center transition-all min-w-[120px] ${
                  currentStage === stage.id
                    ? 'bg-gold-500 text-slate-950 shadow-md font-black'
                    : 'text-slate-200 hover:text-white hover:bg-white/5'
                }`}
              >
                {stage.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Top Ad */}
        <AdSenseSlot slotType="headerBanner" />

        {/* Filters Bar: Grades and Subjects */}
        <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-6 shadow-sm mb-8 space-y-5">
          
          {/* Grades Filter */}
          <div>
            <span className="text-xs font-bold text-slate-400 block mb-2.5">
              1. اختر الصف الدراسي ({countryInfo.flag}):
            </span>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setCurrentGrade(undefined)}
                className={`rounded-xl px-4 py-2 text-xs font-bold transition-colors ${
                  !currentGrade
                    ? 'bg-primary-600 text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                كافة الصفوف
              </button>
              {stageGrades.map((g) => (
                <button
                  key={g.id}
                  onClick={() => setCurrentGrade(g.gradeNumber)}
                  className={`rounded-xl px-4 py-2 text-xs font-bold transition-colors ${
                    currentGrade === g.gradeNumber
                      ? 'bg-primary-600 text-white shadow-sm'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                  }`}
                >
                  {g.name}
                </button>
              ))}
            </div>
          </div>

          {/* Subjects Filter */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
            <span className="text-xs font-bold text-slate-400 block mb-2.5">
              2. تصفية حسب المادة:
            </span>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setCurrentSubject(undefined)}
                className={`rounded-xl px-4 py-2 text-xs font-bold transition-colors ${
                  !currentSubject
                    ? 'bg-amber-500 text-slate-950 font-black shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                جميع المواد
              </button>
              {stageSubjects.map((sub) => (
                <button
                  key={sub.id}
                  onClick={() => setCurrentSubject(sub.id)}
                  className={`rounded-xl px-4 py-2 text-xs font-bold transition-colors ${
                    currentSubject === sub.id
                      ? 'bg-amber-500 text-slate-950 font-black shadow-sm'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                  }`}
                >
                  {sub.name}
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* Results Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span>دروس وشروحات {countryInfo.flag} {countryInfo.name}</span>
              <span className="text-sm font-semibold text-primary-600 dark:text-gold-400">({filteredLessons.length})</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {currentStageInfo?.name} {currentGrade ? `• الصف ${currentGrade}` : ''}
            </p>
          </div>
        </div>

        {/* Lessons Grid */}
        {filteredLessons.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredLessons.map((lesson) => (
              <LessonCard key={lesson.id} lesson={lesson} />
            ))}
          </div>
        ) : (
          <div className="rounded-3xl border border-dashed border-slate-300 dark:border-slate-800 p-12 text-center bg-white dark:bg-slate-900/60">
            <BookOpen className="mx-auto h-12 w-12 text-slate-400" />
            <h3 className="mt-4 text-base font-bold text-slate-800 dark:text-white">
              جاري إضافة وتحديث دروس مناهج {countryInfo.name}
            </h3>
            <p className="mt-1 text-xs text-slate-500 max-w-md mx-auto">
              تصل الشروحات الجديدة تباعاً عبر المزامنة، يمكنك استعراض المواد والصفوف الأخرى.
            </p>
            <button
              onClick={() => {
                setCurrentGrade(undefined);
                setCurrentSubject(undefined);
              }}
              className="mt-4 inline-flex items-center gap-1 rounded-xl bg-primary-600 text-white px-4 py-2 text-xs font-bold"
            >
              عرض كافة دروس المرحلة
            </button>
          </div>
        )}

        {/* Bottom Banner */}
        <div className="mt-12">
          <AdSenseSlot slotType="footerBanner" />
        </div>

      </div>
    </div>
  );
}

export default function CurriculumPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div></div>}>
      <CurriculumPageInner />
    </Suspense>
  );
}
