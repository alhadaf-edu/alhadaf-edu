'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { getStagesForCountry, getSubjectsForCountry, getGradesForCountry, ARAB_COUNTRIES } from '@/lib/curriculumData';
import { useLessons } from '@/context/LessonsContext';
import { useAuth } from '@/context/AuthContext';
import { StageType, CountryCode } from '@/types';
import { 
  BookOpen, 
  Calculator, 
  FlaskConical, 
  Atom, 
  Cpu, 
  Languages, 
  HeartHandshake, 
  Globe2, 
  BookA, 
  ArrowLeft,
  GraduationCap
} from 'lucide-react';

const ICON_MAP: Record<string, any> = {
  Calculator,
  FlaskConical,
  Atom,
  Cpu,
  Languages,
  HeartHandshake,
  Globe2,
  BookA,
  BookOpen,
};

export default function CurriculumExplorer() {
  const { selectedCountry } = useLessons();
  const { profile } = useAuth();

  const activeCountryCode: CountryCode = profile?.country || selectedCountry || 'sa';
  const countryInfo = ARAB_COUNTRIES.find(c => c.code === activeCountryCode) || ARAB_COUNTRIES[0];

  const stages = getStagesForCountry(activeCountryCode);
  const [activeStage, setActiveStage] = useState<StageType>('middle');

  useEffect(() => {
    if (!stages.some(s => s.id === activeStage)) {
      setActiveStage(stages[0]?.id || 'middle');
    }
  }, [activeCountryCode, stages, activeStage]);

  const filteredSubjects = getSubjectsForCountry(activeCountryCode, activeStage);
  const currentStageInfo = stages.find((s) => s.id === activeStage);
  const stageGrades = getGradesForCountry(activeCountryCode, activeStage);

  return (
    <section className="py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#4F5DE4] dark:text-[#aab5f5] bg-[#F1F2FD] dark:bg-[#242045] px-3.5 py-1.5 rounded-full mb-2 border border-[#E0E3FD] dark:border-[#373261]">
              <span className="text-sm leading-none">{countryInfo.flag}</span>
              <span>دليل مناهج {countryInfo.name}</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-[#2A254D] dark:text-white font-heading">
              تصفح المقررات حسب المرحلة والصف
            </h2>
            <p className="text-xs sm:text-sm text-[#697585] dark:text-[#B3ADE1] mt-1">
              مناهج معتمدة وشروحات مفصلة لكل المواد الدراسية في {countryInfo.name}
            </p>
          </div>

          {/* Stage Selector Tabs */}
          <div className="flex rounded-2xl bg-[#F1F2FD] dark:bg-[#1A1736] p-1.5 border border-[#E0E3FD] dark:border-[#373261]">
            {stages.map((stage) => (
              <button
                key={stage.id}
                onClick={() => setActiveStage(stage.id as StageType)}
                className={`px-4 py-2 text-xs sm:text-sm font-bold rounded-xl transition-all whitespace-nowrap ${
                  activeStage === stage.id
                    ? 'bg-[#4F5DE4] text-white shadow-md'
                    : 'text-[#697585] dark:text-[#B3ADE1] hover:bg-[#E0E3FD]/60 dark:hover:bg-[#242045]'
                }`}
              >
                {stage.name}
              </button>
            ))}
          </div>
        </div>

        {/* Stage Overview Banner */}
        {currentStageInfo && (
          <div className="rounded-3xl bg-gradient-to-r from-[#242045] via-[#2A254D] to-[#1A1736] text-white p-6 sm:p-8 mb-8 relative overflow-hidden shadow-tiqdr border border-[#4F5DE4]/20">
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <span className="inline-block rounded-xl bg-[#F57005]/20 text-[#F57005] border border-[#F57005]/30 px-3 py-1 text-xs font-bold mb-2">
                  {countryInfo.flag} {currentStageInfo.name}
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-white font-heading">
                  مقررات {currentStageInfo.name} — {countryInfo.name}
                </h3>
                <p className="text-xs sm:text-sm text-[#d0d5f9] mt-1 max-w-2xl">
                  {currentStageInfo.description}
                </p>
              </div>

              {/* Grades Badges */}
              <div className="flex flex-wrap gap-2">
                {stageGrades.map((g) => (
                  <Link
                    key={g.id}
                    href={`/curriculum?stage=${activeStage}&grade=${g.gradeNumber}`}
                    className="rounded-xl bg-[#4F5DE4]/20 hover:bg-[#F57005] hover:text-white px-3.5 py-2 text-xs font-bold border border-[#4F5DE4]/30 hover:border-[#F57005] transition-all"
                  >
                    {g.name}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Subjects Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {filteredSubjects.map((subject) => {
            const IconComponent = ICON_MAP[subject.iconName] || BookOpen;

            return (
              <div
                key={subject.id}
                className="group rounded-3xl border border-[#E0E3FD] dark:border-[#373261] bg-white dark:bg-[#242045] p-6 shadow-tiqdr hover:shadow-tiqdr-hover hover:border-[#4F5DE4] dark:hover:border-[#7c8bee] hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${subject.color} text-white shadow-md group-hover:scale-110 transition-transform duration-300`}>
                      <IconComponent className="h-6 w-6" />
                    </div>
                    <span className="text-[10px] font-bold text-[#4F5DE4] dark:text-[#aab5f5] bg-[#F1F2FD] dark:bg-[#1A1736] px-2.5 py-1 rounded-full border border-[#E0E3FD] dark:border-[#373261]">
                      {countryInfo.flag} {subject.code}
                    </span>
                  </div>

                  <h4 className="text-base font-bold text-[#2A254D] dark:text-white group-hover:text-[#4F5DE4] dark:group-hover:text-[#aab5f5] transition-colors">
                    {subject.name}
                  </h4>
                  <p className="text-xs text-[#697585] dark:text-[#B3ADE1] mt-1.5 leading-relaxed line-clamp-2">
                    {subject.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-[#E0E3FD]/60 dark:border-[#373261] flex items-center justify-between">
                  <span className="text-xs text-[#697585] dark:text-[#B3ADE1] font-medium">
                    الصفوف ({subject.grades.join(' ، ')})
                  </span>
                  <Link
                    href={`/curriculum?stage=${activeStage}&subject=${subject.id}`}
                    className="flex items-center gap-1 text-xs font-bold text-[#4F5DE4] dark:text-[#aab5f5] group-hover:translate-x-[-4px] transition-transform"
                  >
                    <span>استعرض الدروس</span>
                    <ArrowLeft className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
