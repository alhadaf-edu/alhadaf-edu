'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { 
  BookOpen, 
  Award, 
  ArrowLeft, 
  PlayCircle, 
  CheckCircle2, 
  TrendingUp 
} from 'lucide-react';
import IslamicPattern from '../layout/IslamicPattern';
import { ARAB_COUNTRIES, getStagesForCountry, getGradesForCountry, getSubjectsForCountry } from '@/lib/curriculumData';
import { useLessons } from '@/context/LessonsContext';
import { useAuth } from '@/context/AuthContext';
import { StageType, CountryCode } from '@/types';

export default function HeroSection() {
  const router = useRouter();
  const { selectedCountry } = useLessons();
  const { profile } = useAuth();

  const activeCountryCode: CountryCode = profile?.country || selectedCountry || 'sa';
  const countryInfo = ARAB_COUNTRIES.find(c => c.code === activeCountryCode) || ARAB_COUNTRIES[0];

  const stages = getStagesForCountry(activeCountryCode);
  const [selectedStage, setSelectedStage] = useState<StageType>('middle');
  const [selectedGrade, setSelectedGrade] = useState<string>('1');
  const [selectedSubject, setSelectedSubject] = useState<string>('');

  useEffect(() => {
    if (!stages.some(s => s.id === selectedStage)) {
      setSelectedStage(stages[0]?.id || 'middle');
    }
  }, [activeCountryCode, stages, selectedStage]);

  const filteredGrades = getGradesForCountry(activeCountryCode, selectedStage);
  const filteredSubjects = getSubjectsForCountry(activeCountryCode, selectedStage);

  const handleQuickJump = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(`/curriculum?stage=${selectedStage}&grade=${selectedGrade}${selectedSubject ? `&subject=${selectedSubject}` : ''}`);
  };

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-primary-950 via-primary-900 to-slate-950 text-white pt-12 pb-20 lg:pt-18 lg:pb-28">
      {/* Background Decorative Islamic Patterns */}
      <IslamicPattern variant="stars" opacity={0.06} className="text-white" />
      <div className="absolute top-1/4 -right-48 h-96 w-96 rounded-full bg-gold-500/15 blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 -left-48 h-96 w-96 rounded-full bg-primary-400/20 blur-3xl pointer-events-none" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Main Content */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-right">
            
            {/* Top Badge with Flag & Country */}
            <div className="inline-flex items-center gap-2.5 rounded-full border border-gold-400/30 bg-gold-500/10 px-4 py-1.5 backdrop-blur-md">
              <span className="text-lg leading-none">{countryInfo.flag}</span>
              <span className="text-xs sm:text-sm font-bold text-gold-300">
                منصة الهَدَّاف التعليمية الرسمية لمناهج {countryInfo.name}
              </span>
            </div>

            {/* Headline */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black font-heading tracking-tight leading-[1.2] text-white">
              طريقك نحو <span className="text-transparent bg-clip-text bg-gradient-to-l from-gold-300 via-gold-400 to-amber-200">القمة والدرجات الكاملة</span> في دراستك
            </h1>

            {/* Description */}
            <p className="text-sm sm:text-lg text-slate-200 leading-relaxed max-w-2xl mx-auto lg:mx-0 font-normal">
              {countryInfo.description}. شروحات فيديو مميزة، مذكرات وملخصات PDF جاهزة للتحميل، واختبارات تقييمية ذكية لكل المراحل.
            </p>

            {/* Quick Benefits Bullet points */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-200">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                <span>مواكبة لمناهج {countryInfo.flag} المعتمدة</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-200">
                <CheckCircle2 className="h-4 w-4 text-gold-400 shrink-0" />
                <span>شروحات فيديو تفاعلية</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-200">
                <CheckCircle2 className="h-4 w-4 text-sky-400 shrink-0" />
                <span>بنك أسئلة واختبارات</span>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-4">
              <Link
                href="/curriculum"
                className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-gold-500 to-amber-500 hover:from-gold-600 hover:to-amber-600 text-slate-950 px-7 py-3.5 text-sm font-black shadow-lg shadow-gold-500/20 transition-all hover:scale-105"
              >
                <BookOpen className="h-4 w-4" />
                <span>تصفح دروس {countryInfo.name}</span>
                <ArrowLeft className="h-4 w-4" />
              </Link>

              <Link
                href="/quizzes"
                className="flex items-center gap-2 rounded-2xl border border-white/20 bg-white/10 hover:bg-white/20 px-6 py-3.5 text-sm font-bold text-white backdrop-blur-md transition-all hover:scale-105"
              >
                <Award className="h-4 w-4 text-gold-400" />
                <span>تحدي الاختبارات التقييمية</span>
              </Link>
            </div>
          </div>

          {/* Quick Navigator Box */}
          <div className="lg:col-span-5">
            <div className="relative rounded-3xl border border-white/15 bg-white/10 p-6 sm:p-8 backdrop-blur-xl shadow-2xl shadow-black/40">
              <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
                <div>
                  <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-gold-400" />
                    <span>الانتقال السريع لدروسك</span>
                  </h3>
                  <p className="text-xs text-slate-300 mt-0.5">
                    اختر مرحلتك ومادتك في مناهج {countryInfo.name}
                  </p>
                </div>
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gold-500/20 text-gold-400">
                  <PlayCircle className="h-5 w-5" />
                </div>
              </div>

              <form onSubmit={handleQuickJump} className="space-y-4">
                {/* 1. Stage Selector */}
                <div>
                  <label className="block text-xs font-bold text-slate-200 mb-1.5">
                    1. المرحلة الدراسية:
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {stages.map((st) => (
                      <button
                        key={st.id}
                        type="button"
                        onClick={() => {
                          setSelectedStage(st.id as StageType);
                          setSelectedGrade('1');
                          setSelectedSubject('');
                        }}
                        className={`rounded-xl py-2 px-1 text-center text-xs font-bold transition-all ${
                          selectedStage === st.id
                            ? 'bg-gold-500 text-slate-950 font-black shadow-md'
                            : 'bg-white/10 text-slate-200 hover:bg-white/20'
                        }`}
                      >
                        {st.name.replace('المرحلة ', '')}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 2. Grade Selector */}
                <div>
                  <label className="block text-xs font-bold text-slate-200 mb-1.5">
                    2. الصف الدراسي:
                  </label>
                  <select
                    value={selectedGrade}
                    onChange={(e) => setSelectedGrade(e.target.value)}
                    className="w-full rounded-xl border border-white/20 bg-slate-900/90 py-2.5 px-3 text-xs font-bold text-white focus:border-gold-400 focus:outline-none"
                  >
                    {filteredGrades.map((g) => (
                      <option key={g.id} value={g.gradeNumber} className="bg-slate-900 text-white">
                        {g.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 3. Subject Selector */}
                <div>
                  <label className="block text-xs font-bold text-slate-200 mb-1.5">
                    3. المادة:
                  </label>
                  <select
                    value={selectedSubject}
                    onChange={(e) => setSelectedSubject(e.target.value)}
                    className="w-full rounded-xl border border-white/20 bg-slate-900/90 py-2.5 px-3 text-xs font-bold text-white focus:border-gold-400 focus:outline-none"
                  >
                    <option value="" className="bg-slate-900 text-white">جميع المواد المتاحة</option>
                    {filteredSubjects.map((sub) => (
                      <option key={sub.id} value={sub.id} className="bg-slate-900 text-white">
                        {sub.name}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-gold-500 to-amber-500 hover:from-gold-600 hover:to-amber-600 text-slate-950 py-3 text-xs font-black shadow-lg transition-all hover:scale-[1.02]"
                >
                  <span>عرض الدروس الآن</span>
                  <ArrowLeft className="h-4 w-4" />
                </button>
              </form>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
