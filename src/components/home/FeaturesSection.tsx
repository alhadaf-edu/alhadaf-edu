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

export default function FeaturesSection() {
  const { selectedCountry } = useLessons();
  const { profile } = useAuth();

  const activeCountryCode = profile?.country || selectedCountry || 'sa';
  const country = getCountryInfo(activeCountryCode);

  const features = [
    {
      icon: Layers,
      title: `شرح متوافق 100% مع مناهج ${country.shortName}`,
      desc: `إعداد ومراجعة نخبة من المعلمين المعتمدين وفق أحدث طبعات ومقررات وزارة التربية والتعليم (${country.academicYear}).`,
      color: 'from-blue-600 to-indigo-600',
    },
    {
      icon: Trophy,
      title: `بنك أسئلة لـ ${country.examHighlight}`,
      desc: `آلاف الأسئلة المحاكية للامتحانات الرسمية ونماذج الاختبارات مع شروحات بالفيديو والحلول النموذجية.`,
      color: 'from-amber-500 to-yellow-600',
    },
    {
      icon: FileText,
      title: 'مذكرات وملخصات PDF جاهزة للمعاينة والاستعراض',
      desc: 'أوراق عمل، مراجعات ليلة الامتحان، وخرائط مفاهيم ملونة ومعتمدة للمطالعة الفورية بجودة عالية.',
      color: 'from-emerald-600 to-teal-600',
    },
    {
      icon: Smartphone,
      title: 'تجربة تعليمية متكاملة وسلسة',
      desc: 'تصميم فائق السرعة متجاوب مع الهواتف والأجهزة اللوحية والمكتبية مع دعم الوضع الليلي وتخصيص المنهج.',
      color: 'from-purple-600 to-pink-600',
    },
  ];

  return (
    <section className="py-16 sm:py-24 bg-white dark:bg-slate-900/50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-primary-600 dark:text-gold-400 bg-primary-50 dark:bg-slate-900 px-3 py-1 rounded-full mb-2">
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

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="group relative flex flex-col items-start p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/80 hover:bg-white dark:hover:bg-slate-900 hover:shadow-xl transition-all duration-300"
              >
                <div className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr ${item.color} text-white shadow-md mb-4 group-hover:scale-110 transition-transform`}>
                  <Icon className="h-6 w-6" />
                </div>
                
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {item.title}
                </h3>

                <p className="mt-2 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                  {item.desc}
                </p>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
