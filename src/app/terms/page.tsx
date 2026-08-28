import React from 'react';
import type { Metadata } from 'next';
import IslamicPattern from '@/components/layout/IslamicPattern';
import { BookOpen, CheckCircle2 } from 'lucide-react';

export const metadata: Metadata = {
  title: 'شروط الاستخدام | منصة الهداف التعليمية',
  description: 'شروط وأحكام استخدام منصة الهداف التعليمية للمناهج السعودية.',
};

export default function TermsPage() {
  return (
    <div className="min-h-screen py-10 bg-slate-50/60 dark:bg-slate-950/40">
      
      <div className="relative bg-gradient-to-r from-slate-950 via-primary-950 to-slate-950 text-white py-14 overflow-hidden mb-12">
        <IslamicPattern variant="stars" opacity={0.05} />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl sm:text-4xl font-black font-heading text-white">
            شروط وأحكام الاستخدام (Terms of Service)
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-slate-300">
            يرجى قراءة هذه الشروط بعناية قبل استخدام منصة الهداف التعليمية
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 sm:p-10 shadow-sm space-y-6 text-slate-700 dark:text-slate-300 text-xs sm:text-sm leading-relaxed">
          <section>
            <h2 className="text-base font-bold text-slate-900 dark:text-white mb-2">1. القبول بالشروط</h2>
            <p>
              يعد استخدامك لمنصة "الهداف" التعليمية موافقة صريحة وكاملة على كافة الشروط والأحكام والسياسات المتبعة في المنصة.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-slate-900 dark:text-white mb-2">2. الاستخدام التعليمي الشخصي</h2>
            <p>
              كافة المواد والشروحات والملخصات الـ PDF والاختبارات التفاعلية متاحة للاستخدام الشخصي والتعليمي للطلاب والمعلمين، ويحظر إعادة بيعها أو استغلالها تجارياً دون إذن مسبق.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-slate-900 dark:text-white mb-2">3. حقوق الملكية الفكرية</h2>
            <p>
              جميع العلامات التجارية وحقوق النشر المرئية والمكتوبة وتصاميم الهوية الهندسية محفوظة لمنصة الهداف التعليمية، مع الامتثال لكافة حقوق المناهج الصادرة عن وزارة التعليم بالمملكة العربية السعودية.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
