'use client';

import React, { useEffect, useState } from 'react';
import { Video, HelpCircle, Users, Globe2 } from 'lucide-react';
import { useLessons } from '@/context/LessonsContext';
import { useAuth } from '@/context/AuthContext';
import { getCountryInfo, ARAB_COUNTRIES } from '@/lib/curriculumData';
import { db } from '@/lib/firebase';
import { collection, getCountFromServer, getDocs } from 'firebase/firestore';

export default function StatsSection() {
  const { selectedCountry, lessons, quizzes } = useLessons();
  const { profile } = useAuth();
  const [usersCount, setUsersCount] = useState<number>(0);

  const activeCountryCode = profile?.country || selectedCountry || 'sa';
  const country = getCountryInfo(activeCountryCode);

  // Real counts
  const countryLessonsCount = lessons.filter(l => l.country === activeCountryCode).length;
  const totalLessonsCount = lessons.length;
  const countryQuizzesCount = quizzes.filter(q => q.country === activeCountryCode).length;
  const totalQuizzesCount = quizzes.length;

  useEffect(() => {
    let isMounted = true;
    const fetchRealUsersCount = async () => {
      if (!db) return;
      try {
        // Try getting real registered users count from Firestore
        const usersCol = collection(db, 'users');
        const snap = await getDocs(usersCol);
        if (isMounted) {
          setUsersCount(snap.size);
        }
      } catch {
        // Fallback if permission error
        if (isMounted) setUsersCount(0);
      }
    };
    fetchRealUsersCount();
    return () => { isMounted = false; };
  }, []);

  const stats = [
    {
      icon: Video,
      value: (countryLessonsCount > 0 ? countryLessonsCount : totalLessonsCount).toLocaleString('ar-EG'),
      label: 'درس وشرح مرئي',
      desc: countryLessonsCount > 0 
        ? `شروحات حقيقية لمناهج ${country.shortName}` 
        : `إجمالي الدروس المتاحة بالمنصة`,
      color: 'text-blue-600 dark:text-blue-400',
      bg: 'bg-blue-50 dark:bg-blue-950/60',
    },
    {
      icon: HelpCircle,
      value: (countryQuizzesCount > 0 ? countryQuizzesCount : totalQuizzesCount).toLocaleString('ar-EG'),
      label: 'اختبار تقييمي ذكي',
      desc: countryQuizzesCount > 0 
        ? `اختبارات تفاعلية لمناهج ${country.shortName}` 
        : `إجمالي الاختبارات التفاعلية`,
      color: 'text-amber-600 dark:text-amber-400',
      bg: 'bg-amber-50 dark:bg-amber-950/60',
    },
    {
      icon: Users,
      value: usersCount.toLocaleString('ar-EG'),
      label: 'مشترك مسجل بالمنصة',
      desc: 'بيانات حقيقية للمستخدمين المسجلين',
      color: 'text-emerald-600 dark:text-emerald-400',
      bg: 'bg-emerald-50 dark:bg-emerald-950/60',
    },
    {
      icon: Globe2,
      value: `${ARAB_COUNTRIES.length.toLocaleString('ar-EG')}`,
      label: 'مناهج عربية معتمدة',
      desc: 'مصر، السعودية، الإمارات، وغيرها',
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
              className="flex flex-col items-center sm:items-start p-5 sm:p-6 rounded-3xl border border-[#E0E3FD] dark:border-[#373261] bg-white dark:bg-[#242045] backdrop-blur-xl shadow-tiqdr hover:shadow-tiqdr-hover hover:-translate-y-1 transition-all duration-300"
            >
              <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${stat.bg} ${stat.color} mb-3 shadow-inner`}>
                <Icon className="h-6 w-6" />
              </div>
              <div className="text-2xl sm:text-3xl font-black text-[#2A254D] dark:text-white font-heading">
                {stat.value}
              </div>
              <div className="text-xs sm:text-sm font-bold text-[#2A254D] dark:text-[#d0d5f9] mt-0.5">
                {stat.label}
              </div>
              <div className="text-[11px] text-[#697585] dark:text-[#B3ADE1] mt-0.5 text-center sm:text-right">
                {stat.desc}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
