'use client';

import React from 'react';
import Image from 'next/image';
import { Star, Quote, Sparkles } from 'lucide-react';
import IslamicPattern from '../layout/IslamicPattern';
import { useLessons } from '@/context/LessonsContext';
import { useAuth } from '@/context/AuthContext';
import { getCountryInfo } from '@/lib/curriculumData';

interface TestimonialItem {
  id: string;
  name: string;
  role: string;
  comment: string;
  rating: number;
  avatar: string;
}

const SA_TESTIMONIALS: TestimonialItem[] = [
  {
    id: 'sa1',
    name: 'عبدالله السبيعي',
    role: 'طالب - ثاني ثانوي مسارات 🇸🇦',
    comment: 'شرح الفيزياء والجاذبية ممتاز جداً ومبسط، ساعدني في فهم قوانين كبلر والحصول على الدرجة الكاملة في الاختبار الدوري والتحصيلي.',
    rating: 5,
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 'sa2',
    name: 'سارة القحطاني',
    role: 'طالبة - ثاني متوسط 🇸🇦',
    comment: 'شروحات الرياضيات والأعداد النسبية سهلة ومباشرة، والملخصات أستفيد منها كثيراً في المذاكرة والمراجعة السريعة للاختبارات.',
    rating: 5,
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 'sa3',
    name: 'الأستاذ أحمد الغامدي',
    role: 'معلم دراسات اجتماعية 🇸🇦',
    comment: 'منصة الْهَدَّاف تقدم شروحات تاريخية وجغرافية مرتبة بأسلوب تربوي راقٍ يخدم المعلم والطالب في الميدان التعليمي السعودي.',
    rating: 5,
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 'sa4',
    name: 'أم فيصل الشهري',
    role: 'ولي أمر طالب 🇸🇦',
    comment: 'تسهيل متابعة دروس الابتدائي والرابع والسادس بأسلوب مبسط دون تشتت، شكراً لجهود منصة الْهَدَّاف المتميزة.',
    rating: 5,
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
  },
];

const EG_TESTIMONIALS: TestimonialItem[] = [
  {
    id: 'eg1',
    name: 'عمر الشناوي',
    role: 'طالب - الشهادة الإعدادية 🇪🇬',
    comment: 'شرح الجبر والعلوم في المنهج المصري رائع جداً ومبسط، الامتحانات التفاعلية خلتني متأكد من درجاتي في امتحانات نصف العام.',
    rating: 5,
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 'eg2',
    name: 'مريم الدسوقي',
    role: 'طالبة - الثانوية العامة 🇪🇬',
    comment: 'مذكرات الفيزياء والكيمياء ونماذج امتحانات الثانوية العامة مع الحلول والشرح خلت المذاكرة أسهل بكتير وبدون أي تعقيد.',
    rating: 5,
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 'eg3',
    name: 'الأستاذ محمود إبراهيم',
    role: 'معلم لغة عربية ودراسات 🇪🇬',
    comment: 'منصة الهَدَّاف بتوفر للمنهج المصري شروحات مرئية نموذجية مطابقة لمواصفات وزارة التربية والتعليم وامتحانات الشهور.',
    rating: 5,
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 'eg4',
    name: 'المهندس هاني زهران',
    role: 'ولي أمر طالبين 🇪🇬',
    comment: 'منصة ممتازة جداً بتساعد أولادي في متابعة دروس المرحلة الابتدائية والإعدادية وحل التدريبات بنفسهم بسهولة.',
    rating: 5,
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
  },
];

export default function TestimonialsSection() {
  const { selectedCountry } = useLessons();
  const { profile } = useAuth();

  const activeCountryCode = profile?.country || selectedCountry || 'sa';
  const country = getCountryInfo(activeCountryCode);

  const testimonials = activeCountryCode === 'eg' ? EG_TESTIMONIALS : SA_TESTIMONIALS;

  return (
    <section className="relative py-20 bg-slate-900 text-white overflow-hidden">
      <IslamicPattern variant="subtle" opacity={0.05} />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-gold-400 bg-gold-500/10 border border-gold-400/20 px-3.5 py-1 rounded-full mb-3">
            <span className="text-base leading-none">{country.flag}</span>
            <span>آراء الطلاب والمعلمين في {country.name}</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-white font-heading">
            ماذا يقول مجتمع الهَدَّاف في {country.name}؟
          </h2>
          <p className="mt-3 text-xs sm:text-sm text-slate-300">
            فخورون بمساندة آلاف الطلاب والمعلمين في {country.name} لتحقيق أعلى الدرجات والتفوق الدراسي.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {testimonials.map((item) => (
            <div
              key={item.id}
              className="flex flex-col justify-between rounded-3xl border border-slate-800 bg-slate-950/70 p-6 backdrop-blur-sm transition-all duration-300 hover:border-gold-500/40 hover:-translate-y-1 shadow-lg"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-1 text-amber-400">
                    {[...Array(item.rating)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <Quote className="h-6 w-6 text-slate-700" />
                </div>

                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed italic mb-6">
                  "{item.comment}"
                </p>
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-slate-800/80">
                <div className="relative h-10 w-10 rounded-full overflow-hidden border border-gold-500/30 shrink-0">
                  <Image
                    src={item.avatar}
                    alt={item.name}
                    fill
                    sizes="40px"
                    className="object-cover"
                  />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-white">
                    {item.name}
                  </h4>
                  <p className="text-[11px] text-gold-400 font-medium">
                    {item.role}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
