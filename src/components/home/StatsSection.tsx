'use client';

import React from 'react';
import { Video, HelpCircle, Users, Award } from 'lucide-react';
import { useLessons } from '@/context/LessonsContext';
import { useAuth } from '@/context/AuthContext';
import { getCountryInfo } from '@/lib/curriculumData';

export default function StatsSection() {
  const { selectedCountry, lessons, quizzes } = useLessons();
  const { profile } = useAuth();

  const activeCountryCode = profile?.country || selectedCountry || 'sa';
  const country = getCountryInfo(activeCountryCode);

  const stats = [
    {
      icon: Video,
      value: `+${Math.max(lessons.length * 10, 1500).toLocaleString('ar-EG')}`,
      label: 'درس وشرح مرئي',
      desc: `تغطية شاملة لمناهج ${country.shortName}`,
      color: 'text-blue-600 dark:text-blue-400',
      bg: 'bg-blue-50 dark:bg-blue-950/60',
    },
    {
      icon: HelpCircle,
      value: `+${Math.max(quizzes.length * 50, 450).toLocaleString('ar-EG')}`,
      label: 'اختبار تقييمي ذكي',
      desc: 'تصحيح فوري وشرح تفصيلي',
      color: 'text-amber-600 dark:text-amber-400',
      bg: 'bg-amber-50 dark:bg-amber-950/60',
    },
    {
      icon: Users,
      value: '+85,000',
      label: 'طالب وطالبة مسجلين',
      desc: `من مختلف محافظات ومناطق ${country.shortName}`,
      color: 'text-emerald-600 dark:text-emerald-400',
      bg: 'bg-emerald-50 dark:bg-emerald-950/60',
    },
    {
      icon: Award,
      value: '99.4%',
      label: 'نسبة تفوق ورضا الطلاب',
      desc: `درجات ممتازة في الامتحانات الرسمية`,
      color: 'text-purple-600 dark:text-purple-400',
      bg: 'bg-purple-50 dark:bg-purple-950/60',
    },
  ];

  return (
    <section className="relative -mt-10 z-20 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div
              key={idx}
              className="flex flex-col items-center sm:items-start p-5 sm:p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl shadow-xl shadow-slate-200/40 dark:shadow-none hover:-translate-y-1 transition-all duration-300"
            >
              <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${stat.bg} ${stat.color} mb-3 shadow-inner`}>
                <Icon className="h-6 w-6" />
              </div>
              <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-heading">
                {stat.value}
              </div>
              <div className="text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-200 mt-0.5">
                {stat.label}
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5 text-center sm:text-right">
                {stat.desc}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
