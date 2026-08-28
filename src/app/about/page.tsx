'use client';

import React from 'react';
import IslamicPattern from '@/components/layout/IslamicPattern';
import { Target, Sparkles, BookOpen, Compass, ShieldCheck, HeartHandshake, Globe2 } from 'lucide-react';
import Link from 'next/link';
import { useLessons } from '@/context/LessonsContext';
import { useAuth } from '@/context/AuthContext';
import { getCountryInfo, ARAB_COUNTRIES } from '@/lib/curriculumData';

export default function AboutPage() {
  const { selectedCountry } = useLessons();
  const { profile } = useAuth();

  const activeCountryCode = profile?.country || selectedCountry || 'sa';
  const country = getCountryInfo(activeCountryCode);

  return (
    <div className="min-h-screen py-10 bg-slate-50/60 dark:bg-slate-950/40">
      
      {/* Hero Banner */}
      <div className="relative bg-gradient-to-r from-primary-950 via-primary-900 to-indigo-950 text-white py-16 overflow-hidden mb-12">
        <IslamicPattern variant="stars" opacity={0.07} />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-gold-400/30 bg-gold-500/10 px-4 py-1.5 text-xs font-bold text-gold-300 mb-3 backdrop-blur-md">
            <span className="text-base leading-none">{country.flag}</span>
            <span>رؤيتنا ورسالتنا التعليمية في {country.name}</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black font-heading text-white">
            عن منصة "الهَدَّاف" التعليمية
          </h1>
          <p className="mt-3 text-xs sm:text-base text-slate-200 max-w-2xl mx-auto leading-relaxed">
            المنصة التعليمية المتكاملة لتقديم الشروحات المرئية، المذكرات الرقمية، والاختبارات التفاعلية الذكية لطلاب {country.name}.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Mission & Vision Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Vision */}
          <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 shadow-sm">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gold-500/10 text-gold-500 mb-4">
              <Target className="h-6 w-6" />
            </div>
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white font-heading">
                رؤيتنا
              </h3>
              <span className="text-xs px-2 py-0.5 rounded-md bg-gold-500/15 text-gold-600 dark:text-gold-400 font-bold">
                {country.flag} {country.shortName}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              {country.vision}
            </p>
          </div>

          {/* Mission */}
          <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 shadow-sm">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-50 dark:bg-primary-950 text-primary-600 dark:text-gold-400 mb-4">
              <Compass className="h-6 w-6" />
            </div>
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white font-heading">
                رسالتنا
              </h3>
              <span className="text-xs px-2 py-0.5 rounded-md bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300 font-bold">
                {country.flag} المناهج {country.demonym}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              {country.mission}
            </p>
          </div>
        </div>

        {/* Core Values */}
        <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 shadow-sm">
          <h3 className="text-xl font-black text-slate-900 dark:text-white mb-6 font-heading text-center">
            قيمنا ومبادئنا التعليمية
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="text-center p-4">
              <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 dark:bg-slate-800 text-blue-600 dark:text-blue-400 mb-3">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <h4 className="text-sm font-bold text-slate-800 dark:text-white">الدقة والموثوقية</h4>
              <p className="mt-1 text-xs text-slate-500">محتوى علمي معتمد ومواكب لطبعات وزارة التربية والتعليم الحديثة ({country.academicYear}).</p>
            </div>

            <div className="text-center p-4">
              <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 dark:bg-slate-800 text-amber-600 dark:text-gold-400 mb-3">
                <Sparkles className="h-5 w-5" />
              </div>
              <h4 className="text-sm font-bold text-slate-800 dark:text-white">الابتكار والتيسير</h4>
              <p className="mt-1 text-xs text-slate-500">استخدام الرسوم التوضيحية والخرائط الذهنية لترسيخ المفاهيم بسرعة ويسر.</p>
            </div>

            <div className="text-center p-4">
              <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 mb-3">
                <HeartHandshake className="h-5 w-5" />
              </div>
              <h4 className="text-sm font-bold text-slate-800 dark:text-white">التعليم المجاني للجميع</h4>
              <p className="mt-1 text-xs text-slate-500">إتاحة العلم والمعرفة بدون مقابل لتمكين كل طالب عربي من بلوغ التفوق.</p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="rounded-3xl bg-gradient-to-r from-primary-900 to-indigo-900 p-8 text-center text-white shadow-xl">
          <h3 className="text-xl sm:text-2xl font-black font-heading mb-2">
            ابدأ رحلتك التعليمية الآن في مناهج {country.name}
          </h3>
          <p className="text-xs sm:text-sm text-slate-200 max-w-lg mx-auto mb-6">
            آلاف الطلاب يستفيدون يومياً من شروحات الهَدَّاف واختباراتها التفاعلية.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/curriculum"
              className="rounded-2xl bg-gold-500 hover:bg-gold-600 text-slate-950 font-black px-6 py-3 text-xs shadow-md transition-all"
            >
              استعراض مقررات {country.shortName}
            </Link>
            <Link
              href="/quizzes"
              className="rounded-2xl border border-white/20 bg-white/10 hover:bg-white/20 text-white font-bold px-6 py-3 text-xs backdrop-blur-md transition-all"
            >
              بدء الاختبارات التقييمية
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
