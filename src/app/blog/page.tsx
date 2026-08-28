'use client';

import React from 'react';
import Link from 'next/link';
import IslamicPattern from '@/components/layout/IslamicPattern';
import AdSenseSlot from '@/components/common/AdSenseSlot';
import { BookOpenText, Calendar, Clock, ArrowLeft, Sparkles, Trophy } from 'lucide-react';
import { useLessons } from '@/context/LessonsContext';
import { useAuth } from '@/context/AuthContext';
import { getCountryInfo } from '@/lib/curriculumData';

export default function BlogPage() {
  const { selectedCountry } = useLessons();
  const { profile } = useAuth();

  const activeCountryCode = profile?.country || selectedCountry || 'sa';
  const country = getCountryInfo(activeCountryCode);

  const saArticles = [
    {
      id: '1',
      title: 'أسرار الحصول على 95+ في اختبار التحصيلي (العلمي) بخطوات عملية',
      excerpt: 'دليل شامل يشرح آلية تقسيم المواد (الرياضيات، الفيزياء، الكيمياء، الأحياء) وأفضل الاستراتيجيات لإدارة وقت الاختبار واسترجاع القوانين بدقة.',
      date: '2026-02-15',
      readTime: '6 دقائق',
      category: 'التحصيلي والقدرات 🇸🇦',
      image: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&auto=format&fit=crop&q=80',
    },
    {
      id: '2',
      title: 'كيف تذاكر رياضيات المسارات بذكاء وتحل المسائل المعقدة؟',
      excerpt: 'طرق مبسطة لفهم تمثيل الدوال والمتباينات والمصفوفات باستخدام الخرائط الذهنية وحل المسائل خطوة بخطوة في المناهج السعودية.',
      date: '2026-02-10',
      readTime: '5 دقائق',
      category: 'نصائح دراسية',
      image: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&auto=format&fit=crop&q=80',
    },
    {
      id: '3',
      title: 'دليلك الشامل لنظام المسارات التخصصية في المرحلة الثانوية',
      excerpt: 'كل ما يحتاجه طلاب المرحلة الثانوية لمعرفة مميزات مسار علوم الحاسب والهندسة ومسار الصحة والحياة ومتطلبات القبول الجامعي.',
      date: '2026-02-05',
      readTime: '8 دقائق',
      category: 'المسارات الثانوية',
      image: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&auto=format&fit=crop&q=80',
    }
  ];

  const egArticles = [
    {
      id: 'eg1',
      title: 'خطة المراجعة النهائية للثانوية العامة وكيفية حصد الدرجات النهائية',
      excerpt: 'استراتيجيات تفصيلية لتنظيم وقت المذاكرة وحل أسئلة الامتحانات الوزارية للسنوات السابقة في الفيزياء والكيمياء واللغة العربية.',
      date: '2026-02-15',
      readTime: '7 دقائق',
      category: 'الثانوية العامة 🇪🇬',
      image: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&auto=format&fit=crop&q=80',
    },
    {
      id: 'eg2',
      title: 'أهم القواعد لإتقان الجبر والهندسة وحساب المثلثات للمرحلة الإعدادية',
      excerpt: 'طرق سحرية لتبسيط براهين الهندسة ونظريات التشابه وحل تدريبات كتاب المدرسة وامتحانات المحافظات بسهولة.',
      date: '2026-02-10',
      readTime: '5 دقائق',
      category: 'الشهادة الإعدادية',
      image: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&auto=format&fit=crop&q=80',
    },
    {
      id: 'eg3',
      title: 'طريقة المذاكرة الفعالة لامتحانات الشهور ونهاية العام في المنهج المصري',
      excerpt: 'نصائح المعلمين الأوائل في تلخيص المواد وعمل خرائط ذهنية لكل درس في الدراسات والعلوم واللغة العربية.',
      date: '2026-02-05',
      readTime: '6 دقائق',
      category: 'نصائح وتفوق',
      image: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&auto=format&fit=crop&q=80',
    }
  ];

  const articles = activeCountryCode === 'eg' ? egArticles : saArticles;

  return (
    <div className="min-h-screen py-10 bg-slate-50/60 dark:bg-slate-950/40">
      
      {/* Banner */}
      <div className="relative bg-gradient-to-r from-primary-950 via-slate-950 to-indigo-950 text-white py-14 overflow-hidden mb-10">
        <IslamicPattern variant="stars" opacity={0.06} />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-gold-400/30 bg-gold-500/10 px-4 py-1.5 text-xs font-bold text-gold-300 mb-3 backdrop-blur-md">
            <span className="text-base leading-none">{country.flag}</span>
            <span>مدونة الهَدَّاف التعليمية — {country.name}</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black font-heading text-white">
            المقالات والنصائح الدراسية ({country.shortName})
          </h1>
          <p className="mt-3 text-xs sm:text-base text-slate-200 max-w-xl mx-auto">
            إرشادات تربوية، استراتيجيات الاستعداد لـ {country.examHighlight}، ومقالات إثرائية لدعم تفوقك الدراسي.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Top Ad */}
        <AdSenseSlot slotType="headerBanner" />

        {/* Articles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 my-8">
          {articles.map((article) => (
            <div
              key={article.id}
              className="flex flex-col justify-between overflow-hidden rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group"
            >
              <div>
                <div className="relative aspect-video w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
                  <img
                    src={article.image}
                    alt={article.title}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute top-3 right-3 rounded-xl bg-slate-900/80 px-3 py-1 text-[11px] font-bold text-gold-400 backdrop-blur-md">
                    {article.category}
                  </div>
                </div>

                <div className="p-6">
                  <div className="flex items-center gap-4 text-[11px] text-slate-400 mb-3">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" />
                      <span>{article.date}</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      <span>{article.readTime}</span>
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 dark:text-white leading-snug group-hover:text-primary-600 dark:group-hover:text-gold-400 transition-colors">
                    {article.title}
                  </h3>

                  <p className="mt-2 text-xs leading-relaxed text-slate-500 dark:text-slate-400 line-clamp-3">
                    {article.excerpt}
                  </p>
                </div>
              </div>

              <div className="p-6 pt-0 border-t border-slate-100 dark:border-slate-800/60 mt-4">
                <Link
                  href="/curriculum"
                  className="flex items-center justify-between text-xs font-bold text-primary-600 dark:text-gold-400 group-hover:underline pt-4"
                >
                  <span>استكشف الشروحات ذات الصلة</span>
                  <ArrowLeft className="h-3.5 w-3.5 group-hover:-translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Ad */}
        <AdSenseSlot slotType="footerBanner" />

      </div>
    </div>
  );
}
