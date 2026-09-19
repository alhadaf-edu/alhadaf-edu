'use client';

import React from 'react';
import { 
  FileText, 
  Layers, 
  Trophy, 
  Smartphone,
} from 'lucide-react';
import { useLessons } from '@/context/LessonsContext';
import { useAuth } from '@/context/AuthContext';
import { getCountryInfo } from '@/lib/curriculumData';
import { useScrollReveal, useStaggerReveal } from '@/hooks/useScrollReveal';

export default function FeaturesSection() {
  const { selectedCountry } = useLessons();
  const { profile } = useAuth();

  const activeCountryCode = profile?.country || selectedCountry || 'sa';
  const country = getCountryInfo(activeCountryCode);

  // Reveal refs
  const { ref: headerRef, isVisible: headerVisible } = useScrollReveal({ threshold: 0.1 });
  const { ref: cardsRef, isVisible: cardsVisible, delayClass } = useStaggerReveal({ threshold: 0.08 });

  const features = [
    {
      icon: Layers,
      title: `شرح متوافق 100% مع مناهج ${country.shortName}`,
      desc: `إعداد ومراجعة نخبة من المعلمين المعتمدين وفق أحدث طبعات ومقررات وزارة التربية والتعليم (${country.academicYear}).`,
      color: 'from-blue-600 to-indigo-600',
      iconBg: 'bg-blue-50 dark:bg-blue-950/40',
      iconColor: 'text-blue-600 dark:text-blue-400',
    },
    {
      icon: Trophy,
      title: `بنك أسئلة لـ ${country.examHighlight}`,
      desc: `آلاف الأسئلة المحاكية للامتحانات الرسمية ونماذج الاختبارات مع شروحات بالفيديو والحلول النموذجية.`,
      color: 'from-amber-500 to-yellow-600',
      iconBg: 'bg-amber-50 dark:bg-amber-950/40',
      iconColor: 'text-amber-600 dark:text-amber-400',
    },
    {
      icon: FileText,
      title: 'مذكرات وملخصات PDF جاهزة للمعاينة والاستعراض',
      desc: 'أوراق عمل، مراجعات ليلة الامتحان، وخرائط مفاهيم ملونة ومعتمدة للمطالعة الفورية بجودة عالية.',
      color: 'from-emerald-600 to-teal-600',
      iconBg: 'bg-emerald-50 dark:bg-emerald-950/40',
      iconColor: 'text-emerald-600 dark:text-emerald-400',
    },
    {
      icon: Smartphone,
      title: 'تجربة تعليمية متكاملة وسلسة',
      desc: 'تصميم فائق السرعة متجاوب مع الهواتف والأجهزة اللوحية والمكتبية مع دعم الوضع الليلي وتخصيص المنهج.',
      color: 'from-purple-600 to-pink-600',
      iconBg: 'bg-purple-50 dark:bg-purple-950/40',
      iconColor: 'text-purple-600 dark:text-purple-400',
    },
  ];

  return (
    <section className="py-16 sm:py-24 bg-white dark:bg-slate-900/50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div
          ref={headerRef as React.RefObject<HTMLDivElement>}
          className={`reveal ${headerVisible ? 'visible' : ''} text-center max-w-2xl mx-auto mb-16`}
        >
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-primary-600 dark:text-gold-400 bg-primary-50 dark:bg-slate-800 border border-primary-100 dark:border-slate-700 px-4 py-1.5 rounded-full mb-3">
            <span>{country.flag}</span>
            <span>مميزات منصة الهَدَّاف في {country.name}</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white font-heading">
            لماذا يفضل الطلاب منصة الهَدَّاف؟
          </h2>
          <p className="mt-3 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            نوفر لك بيئة تعليمية ذكية ومتكاملة لتصل إلى الدرجات الكاملة في مناهج {country.name} بكل سهولة ويسر.
          </p>
        </div>

        {/* Feature Cards */}
        <div
          ref={cardsRef}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8"
        >
          {features.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className={`reveal ${cardsVisible ? 'visible' : ''} ${delayClass(idx)} group relative flex flex-col items-start p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/80 hover:bg-white dark:hover:bg-slate-900 hover:shadow-xl dark:hover:shadow-card-dark hover:-translate-y-1 transition-all duration-300`}
              >
                {/* Gradient icon badge */}
                <div className={`flex h-13 w-13 items-center justify-center rounded-2xl bg-gradient-to-tr ${item.color} text-white shadow-md mb-5 group-hover:scale-110 group-hover:shadow-lg transition-all duration-300`}>
                  <Icon className="h-6 w-6" />
                </div>
                
                <h3 className="text-base font-bold text-slate-900 dark:text-white leading-snug">
                  {item.title}
                </h3>

                <p className="mt-2 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                  {item.desc}
                </p>

                {/* Subtle bottom accent line */}
                <div className={`absolute bottom-0 right-0 left-0 h-0.5 rounded-b-3xl bg-gradient-to-l ${item.color} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
