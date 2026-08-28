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
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-primary-600 dark:text-gold-400 bg-primary-50 dark:bg-slate-900 px-3 py-1 rounded-full mb-2">
              <span className="text-sm leading-none">{countryInfo.flag}</span>
              <span>دليل مناهج {countryInfo.name}</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white font-heading">
              تصفح المقررات حسب المرحلة والصف
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              مناهج معتمدة وشروحات مفصلة لكل المواد الدراسية في {countryInfo.name}
            </p>
          </div>

          {/* Stage Selector Tabs */}
          <div className="flex rounded-2xl bg-slate-100 dark:bg-slate-900 p-1.5 border border-slate-200 dark:border-slate-800">
            {stages.map((stage) => (
              <button
                key={stage.id}
                onClick={() => setActiveStage(stage.id as StageType)}
                className={`px-4 py-2 text-xs sm:text-sm font-bold rounded-xl transition-all whitespace-nowrap ${
                  activeStage === stage.id
                    ? 'bg-primary-600 text-white shadow-md'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800'
                }`}
              >
                {stage.name}
              </button>
            ))}
          </div>
        </div>

        {/* Stage Overview Banner */}
        {currentStageInfo && (
          <div className="rounded-3xl bg-gradient-to-r from-primary-900 to-indigo-950 text-white p-6 sm:p-8 mb-8 relative overflow-hidden shadow-xl">
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <span className="inline-block rounded-lg bg-gold-500/20 text-gold-400 border border-gold-400/30 px-3 py-1 text-xs font-bold mb-2">
                  {countryInfo.flag} {currentStageInfo.name}
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-white font-heading">
                  مقررات {currentStageInfo.name} — {countryInfo.name}
                </h3>
                <p className="text-xs sm:text-sm text-slate-200 mt-1 max-w-2xl">
                  {currentStageInfo.description}
                </p>
              </div>

              {/* Grades Badges */}
              <div className="flex flex-wrap gap-2">
                {stageGrades.map((g) => (
                  <Link
                    key={g.id}
                    href={`/curriculum?stage=${activeStage}&grade=${g.gradeNumber}`}
                    className="rounded-xl bg-white/10 hover:bg-gold-500 hover:text-slate-950 px-3.5 py-2 text-xs font-bold border border-white/15 transition-all"
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
                className="group rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm hover:shadow-xl hover:border-primary-400 dark:hover:border-gold-400/50 transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${subject.color} text-white shadow-md group-hover:scale-110 transition-transform duration-300`}>
                      <IconComponent className="h-6 w-6" />
                    </div>
                    <span className="text-[10px] font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-full">
                      {countryInfo.flag} {subject.code}
                    </span>
                  </div>

                  <h4 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-gold-400 transition-colors">
                    {subject.name}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed line-clamp-2">
                    {subject.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-xs text-slate-400 font-medium">
                    الصفوف ({subject.grades.join(' ، ')})
                  </span>
                  <Link
                    href={`/curriculum?stage=${activeStage}&subject=${subject.id}`}
                    className="flex items-center gap-1 text-xs font-bold text-primary-600 dark:text-gold-400 group-hover:translate-x-[-4px] transition-transform"
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
