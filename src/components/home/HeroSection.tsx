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
import { useScrollReveal } from '@/hooks/useScrollReveal';

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

  // Scroll-reveal refs
  const { ref: badgeRef,   isVisible: badgeVisible }   = useScrollReveal({ threshold: 0.1 });
  const { ref: headingRef, isVisible: headingVisible } = useScrollReveal({ threshold: 0.1 });
  const { ref: descRef,    isVisible: descVisible }    = useScrollReveal({ threshold: 0.1 });
  const { ref: bulletsRef, isVisible: bulletsVisible } = useScrollReveal({ threshold: 0.1 });
  const { ref: ctaRef,     isVisible: ctaVisible }     = useScrollReveal({ threshold: 0.1 });
  const { ref: cardRef,    isVisible: cardVisible }    = useScrollReveal({ threshold: 0.1 });

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
    <section className="relative overflow-hidden bg-gradient-to-b from-[#1A1736] via-[#242045] to-[#2A254D] text-white pt-12 pb-20 lg:pt-18 lg:pb-28">
      {/* Soft Glow Orbs — animated */}
      <div className="absolute top-1/4 -right-48 h-96 w-96 rounded-full bg-[#F57005]/15 blur-3xl pointer-events-none animate-pulse-soft" />
      <div className="absolute bottom-10 -left-48 h-96 w-96 rounded-full bg-[#4F5DE4]/25 blur-3xl pointer-events-none animate-pulse-soft" style={{ animationDelay: '1.2s' }} />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Main Content */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-right">
            
            {/* Top Badge */}
            <div
              ref={badgeRef as React.RefObject<HTMLDivElement>}
              className={`reveal ${badgeVisible ? 'visible' : ''} inline-flex items-center gap-2.5 rounded-full border border-[#4F5DE4]/40 bg-[#4F5DE4]/15 px-4 py-1.5 backdrop-blur-md`}
            >
              <span className="text-lg leading-none">{countryInfo.flag}</span>
              <span className="text-xs sm:text-sm font-bold text-[#E0E3FD]">
                منصة الهداف التعليمي (alhadaaf) — مناهج {countryInfo.name}
              </span>
            </div>

            {/* Headline */}
            <h1
              ref={headingRef as React.RefObject<HTMLHeadingElement>}
              className={`reveal ${headingVisible ? 'visible' : ''} stagger-2 text-2xl sm:text-4xl lg:text-5xl font-black font-heading text-white leading-normal sm:leading-snug lg:leading-tight`}
            >
              <span>الهَدَّاف التعليمي — طريقك نحو</span>
              <span className="block mt-1 sm:mt-2 text-transparent bg-clip-text bg-gradient-to-l from-[#F57005] via-[#fb923c] to-[#fde68a]">
                القمة والدرجات الكاملة
              </span>
            </h1>

            {/* Description */}
            <p
              ref={descRef as React.RefObject<HTMLParagraphElement>}
              className={`reveal ${descVisible ? 'visible' : ''} stagger-3 text-sm sm:text-lg text-[#d0d5f9] leading-relaxed max-w-2xl mx-auto lg:mx-0 font-normal`}
            >
              {countryInfo.description}. شروحات فيديو مميزة، مذكرات وملخصات PDF جاهزة للتحميل، واختبارات تقييمية ذكية لكل المراحل.
            </p>

            {/* Quick Benefits */}
            <div
              ref={bulletsRef as React.RefObject<HTMLDivElement>}
              className={`reveal ${bulletsVisible ? 'visible' : ''} stagger-4 grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2`}
            >
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-200">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                <span>مواكبة لمناهج {countryInfo.flag} المعتمدة</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-200">
                <CheckCircle2 className="h-4 w-4 text-[#F57005] shrink-0" />
                <span>شروحات فيديو تفاعلية</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-200">
                <CheckCircle2 className="h-4 w-4 text-[#7c8bee] shrink-0" />
                <span>بنك أسئلة واختبارات</span>
              </div>
            </div>

            {/* CTA Buttons */}
            <div
              ref={ctaRef as React.RefObject<HTMLDivElement>}
              className={`reveal ${ctaVisible ? 'visible' : ''} stagger-5 flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-4`}
            >
              <Link
                href="/curriculum"
                className="flex items-center gap-2 rounded-2xl bg-[#4F5DE4] hover:bg-[#3d49cb] text-white px-7 py-3.5 text-sm font-black shadow-lg shadow-[#4F5DE4]/30 transition-all duration-300 hover:scale-105 hover:shadow-xl"
              >
                <BookOpen className="h-4 w-4" />
                <span>تصفح دروس {countryInfo.name}</span>
                <ArrowLeft className="h-4 w-4" />
              </Link>

              <Link
                href="/quizzes"
                className="flex items-center gap-2 rounded-2xl border border-[#F57005]/40 bg-[#F57005]/15 hover:bg-[#F57005]/30 px-6 py-3.5 text-sm font-bold text-white backdrop-blur-md transition-all duration-300 hover:scale-105"
              >
                <Award className="h-4 w-4 text-[#F57005]" />
                <span>تحدي الاختبارات التقييمية</span>
              </Link>
            </div>
          </div>

          {/* Quick Navigator Box */}
          <div className="lg:col-span-5">
            <div
              ref={cardRef as React.RefObject<HTMLDivElement>}
              className={`reveal-scale ${cardVisible ? 'visible' : ''} relative rounded-3xl border border-[#4F5DE4]/30 bg-[#242045]/90 p-6 sm:p-8 backdrop-blur-xl shadow-2xl shadow-black/50`}
            >
              <div className="flex items-center justify-between border-b border-[#4F5DE4]/20 pb-4 mb-6">
                <div>
                  <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2 font-heading">
                    <TrendingUp className="h-5 w-5 text-[#F57005]" />
                    <span>الانتقال السريع لدروسك</span>
                  </h3>
                  <p className="text-xs text-[#B3ADE1] mt-0.5">
                    اختر مرحلتك ومادتك في مناهج {countryInfo.name}
                  </p>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#4F5DE4]/20 text-[#7c8bee] animate-float">
                  <PlayCircle className="h-5 w-5" />
                </div>
              </div>

              <form onSubmit={handleQuickJump} className="space-y-4">
                {/* Stage Selector */}
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
                        className={`rounded-xl py-2 px-1 text-center text-xs font-bold transition-all duration-200 ${
                          selectedStage === st.id
                            ? 'bg-[#F57005] text-white font-black shadow-md scale-105'
                            : 'bg-[#1A1736]/70 text-[#E0E3FD] hover:bg-[#1A1736] hover:scale-105'
                        }`}
                      >
                        {st.name.replace('المرحلة ', '')}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Grade Selector */}
                <div>
                  <label className="block text-xs font-bold text-slate-200 mb-1.5">
                    2. الصف الدراسي:
                  </label>
                  <select
                    value={selectedGrade}
                    onChange={(e) => setSelectedGrade(e.target.value)}
                    className="w-full rounded-xl border border-[#4F5DE4]/40 bg-[#1A1736] py-2.5 px-3 text-xs font-bold text-white focus:border-[#F57005] focus:outline-none transition-colors"
                  >
                    {filteredGrades.map((g) => (
                      <option key={g.id} value={g.gradeNumber} className="bg-[#1A1736] text-white">
                        {g.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Subject Selector */}
                <div>
                  <label className="block text-xs font-bold text-slate-200 mb-1.5">
                    3. المادة:
                  </label>
                  <select
                    value={selectedSubject}
                    onChange={(e) => setSelectedSubject(e.target.value)}
                    className="w-full rounded-xl border border-[#4F5DE4]/40 bg-[#1A1736] py-2.5 px-3 text-xs font-bold text-white focus:border-[#F57005] focus:outline-none transition-colors"
                  >
                    <option value="" className="bg-[#1A1736] text-white">جميع المواد المتاحة</option>
                    {filteredSubjects.map((sub) => (
                      <option key={sub.id} value={sub.id} className="bg-[#1A1736] text-white">
                        {sub.name}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#F57005] hover:bg-[#ea580c] text-white py-3 text-xs font-black shadow-lg shadow-[#F57005]/25 transition-all duration-300 hover:scale-[1.03] hover:shadow-xl animate-pulse-soft"
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
