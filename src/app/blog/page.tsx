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
      title: 'خارطة طريق حصد 98+ في اختبار التحصيلي (العلمي) من الصفر حتى ليلة الامتحان',
      excerpt: 'دليل تكتيكي يفكك أسئلة قياس للسنوات السابقة في الرياضيات والفيزياء والكيمياء والأحياء. كيفية إدارة 110 ثانية لكل سؤال، واستراتيجية الحذف الذكي، وجدول الـ 60 يوماً للمراجعة المركزة.',
      date: '2026-03-01',
      readTime: '7 دقائق',
      category: 'التحصيلي العلمي 🇸🇦',
      image: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&auto=format&fit=crop&q=80',
    },
    {
      id: '2',
      title: 'الذكاء الاصطناعي في خدمة الطالب: كيف تستخدم التلخيص التفاعلي لحفظ قوانين الفيزياء والكيمياء؟',
      excerpt: 'استراتيجيات تحويل المعادلات الصعبة ومفاهيم الديناميكا الحرارية والكيمياء العضوية إلى بطاقات استرجاع نشط (Active Recall) وخرائط ذهنية رقمية تضمن عدم النسيان أثناء الاختبارات النهائية.',
      date: '2026-02-28',
      readTime: '6 دقائق',
      category: 'تقنيات المذاكرة الحديثة',
      image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=80',
    },
    {
      id: '3',
      title: 'أسرار فك شفرات اختبار القدرات العامة (القسم الكمي واللفظي) بدون آلة حاسبة',
      excerpt: 'طرق الحل السريع للمسائل الحسابية، النسب المئوية، سلاسل الأعداد، التناظر اللفظي واستيعاب المقروء بأقل مجهود ذهني وخلال 45 ثانية لكل سؤال.',
      date: '2026-02-24',
      readTime: '8 دقائق',
      category: 'القدرات العامة',
      image: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&auto=format&fit=crop&q=80',
    },
    {
      id: '4',
      title: 'دليل مسارات الثانوية العامة: مقارنة شاملة بين مسار علوم الحاسب، الصحة والحياة، وإدارة الأعمال',
      excerpt: 'كيف تختار مسارك التخصصي بدقة ليتوافق مع رغبتك الجامعية ووظائف المستقبل؟ تفاصيل المواد المشتركة والتخصصية واحتساب المعدل التراكمي الموزون.',
      date: '2026-02-20',
      readTime: '9 دقائق',
      category: 'نظام المسارات',
      image: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&auto=format&fit=crop&q=80',
    },
    {
      id: '5',
      title: 'جدول الـ 30 يوماً للمراجعة النهائية: كيف تنهي منهج 3 مواد في أسبوعين بتركيز فائق؟',
      excerpt: 'خطة تطبيقية تستخدم أسلوب بومودورو المطور وجلسات التركيز العميق (Deep Work) للتغلب على التسويف والمماطلة ومضاعفة سرعة الاستيعاب بنسبة 200%.',
      date: '2026-02-16',
      readTime: '5 دقائق',
      category: 'إدارة الوقت والتفوق',
      image: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=800&auto=format&fit=crop&q=80',
    },
    {
      id: '6',
      title: 'أهم 50 خطأ شائع يقع فيه الطلاب في اختبارات نهاية الفصل وكيف تتجنبها تماماً',
      excerpt: 'تحليل دقيق للأخطاء المتكررة في قراءة رأس السؤال، التسرع في التظليل، والارتباك مع المسائل ذات المعطيات الزائدة، ونصائح التعامل مع قلق ليلة الامتحان.',
      date: '2026-02-12',
      readTime: '6 دقائق',
      category: 'إرشادات الاختبارات',
      image: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=800&auto=format&fit=crop&q=80',
    }
  ];

  const egArticles = [
    {
      id: 'eg1',
      title: 'روشتة الأوائل للثانوية العامة: نظام البابل شيت وكيفية حصد الدرجات النهائية',
      excerpt: 'استراتيجيات تفصيلية لتنظيم وقت المذاكرة وحل أسئلة الامتحانات الوزارية للسنوات السابقة ونماذج الوزارة الاسترشادية في الفيزياء والكيمياء واللغة العربية.',
      date: '2026-03-01',
      readTime: '7 دقائق',
      category: 'الثانوية العامة 🇪🇬',
      image: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&auto=format&fit=crop&q=80',
    },
    {
      id: 'eg2',
      title: 'الذكاء الاصطناعي في تلخيص البلاغة والنحو وقواعد الإعراب للمرحلة الثانوية',
      excerpt: 'أساليب مبتكرة لتبسيط معاني الاستعارة والكناية والمحسنات البديعية وتثبيت ثوابت الإعراب دون لبس أو حفظ أصم.',
      date: '2026-02-27',
      readTime: '6 دقائق',
      category: 'اللغة العربية',
      image: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=800&auto=format&fit=crop&q=80',
    },
    {
      id: 'eg3',
      title: 'أهم القواعد لإتقان الجبر والهندسة الفراغية وحساب المثلثات للشهادة الإعدادية والثانوية',
      excerpt: 'طرق سحرية لتبسيط براهين الهندسة ونظريات التشابه وحل تدريبات كتاب المدرسة وامتحانات المحافظات بسهولة ودقة.',
      date: '2026-02-22',
      readTime: '5 دقائق',
      category: 'الرياضيات',
      image: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&auto=format&fit=crop&q=80',
    },
    {
      id: 'eg4',
      title: 'كيف تذاكر الكيمياء والفيزياء بالنظام الحديث: الفهم والتطبيق بدلاً من الحفظ',
      excerpt: 'تحليل أفكار مسائل الكيمياء الكهربية والكيمياء العضوية والدوائر الكهربية وقوانين كيرشوف بطريقة تفاعلية سلسة ومباشرة.',
      date: '2026-02-18',
      readTime: '8 دقائق',
      category: 'العلوم التجريبية',
      image: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=800&auto=format&fit=crop&q=80',
    },
    {
      id: 'eg5',
      title: 'خطة الـ 40 يوماً للمراجعة الشاملة لطلاب الشهادة الإعدادية في كافة المواد',
      excerpt: 'جدول تفصيلي لإنهاء الدراسات والعلوم والإنجليزية مع حل 10 نماذج امتحانات سابقة لكل محافظة للحصول على مجموع الالتحاق بالثانوي العام.',
      date: '2026-02-14',
      readTime: '6 دقائق',
      category: 'الشهادة الإعدادية',
      image: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&auto=format&fit=crop&q=80',
    },
    {
      id: 'eg6',
      title: 'دليل التغذية والنوم السليم لزيادة التركيز والذاكرة خلال فترات الامتحانات',
      excerpt: 'أهم الأطعمة التي تحفز خلايا الدماغ، مشروبات الطاقة الطبيعية، وكيفية ضبط الساعة البيولوجية للاستيقاظ بنشاط صباح يوم الاختبار.',
      date: '2026-02-10',
      readTime: '5 دقائق',
      category: 'صحة الطالب وتفوقه',
      image: 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=800&auto=format&fit=crop&q=80',
    }
  ];

  const generalArticles = [
    {
      id: 'gen1',
      title: 'دليلك الشامل للتفوق في المناهج العربية المطورة وأسلوب التعليم الرقمي الحديث',
      excerpt: 'كيف تستفيد من منصات التعليم الافتراضية وحصص البث المباشر وبنوك الأسئلة التفاعلية للحصول على أعلى الدرجات والقبول في أرقى الجامعات.',
      date: '2026-03-01',
      readTime: '7 دقائق',
      category: 'إرشادات عامة 🌐',
      image: 'https://images.unsplash.com/photo-1501504905252-473c47e087f8?w=800&auto=format&fit=crop&q=80',
    },
    ...saArticles.slice(0, 3),
    ...egArticles.slice(0, 2)
  ];

  const articles = activeCountryCode === 'eg' ? egArticles : activeCountryCode === 'sa' ? saArticles : generalArticles;

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
