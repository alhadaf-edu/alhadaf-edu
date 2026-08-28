import React from 'react';
import type { Metadata } from 'next';
import IslamicPattern from '@/components/layout/IslamicPattern';
import { ShieldCheck, Lock, Eye, FileText } from 'lucide-react';

export const metadata: Metadata = {
  title: 'سياسة الخصوصية | منصة الهداف التعليمية',
  description: 'سياسة الخصوصية وحماية بيانات المستخدمين وملفات تعريف الارتباط في منصة الهداف التعليمية.',
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen py-10 bg-slate-50/60 dark:bg-slate-950/40">
      
      {/* Banner */}
      <div className="relative bg-gradient-to-r from-slate-950 via-primary-950 to-slate-950 text-white py-14 overflow-hidden mb-12">
        <IslamicPattern variant="stars" opacity={0.05} />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-gold-400/30 bg-gold-500/10 px-4 py-1 text-xs font-bold text-gold-300 mb-3">
            <ShieldCheck className="h-4 w-4" />
            <span>حماية الخصوصية والأمان</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black font-heading text-white">
            سياسة الخصوصية (Privacy Policy)
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-slate-300">
            تاريخ آخر تحديث: {new Date().getFullYear()}م
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 sm:p-10 shadow-sm space-y-6 text-slate-700 dark:text-slate-300 text-xs sm:text-sm leading-relaxed">
          
          <section>
            <h2 className="text-base font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
              <Lock className="h-4 w-4 text-gold-500" />
              <span>1. مقدمة والتزام المنصة</span>
            </h2>
            <p>
              نحن في منصة "الهداف" التعليمية نولي خصوصية زوارنا ومستخدمينا أهمية بالغة. توضح هذه الوثيقة أنواع المعلومات الشخصية التي يتم جمعها وكيفية استخدامها وحمايتها وفق الأنظمة السارية في المملكة العربية السعودية.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
              <Eye className="h-4 w-4 text-gold-500" />
              <span>2. المعلومات التي نجمعها</span>
            </h2>
            <p>
              - معلومات الحساب: مثل الاسم، البريد الإلكتروني، والمرحلة الدراسية عند قيامك بإنشاء حساب أو تسجيل الدخول عبر Google.<br />
              - بيانات الاستخدام: مثل تقدمك في الاختبارات التفاعلية، الدروس المحفوظة، وإحصائيات تصفح الصفحات لتحسين تجربتك التعليمية.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
              <FileText className="h-4 w-4 text-gold-500" />
              <span>3. إعلانات Google AdSense وملفات تعريف الارتباط (Cookies)</span>
            </h2>
            <p>
              - تستخدم المنصة خدمات Google AdSense لعرض الإعلانات.<br />
              - تستخدم Google ملفات تعريف الارتباط لعرض الإعلانات للمستخدمين استناداً إلى زياراتهم السابقة لموقعنا أو مواقع أخرى على شبكة الإنترنت.<br />
              - يمكن للمستخدمين تعطيل استخدام ملفات تعريف الارتباط للإعلانات المخصصة عن طريق زيارة إعدادات إعلانات Google.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-gold-500" />
              <span>4. أمن البيانات وحمايتها</span>
            </h2>
            <p>
              نطبق إجراءات أمنية وتشفيرية متطورة عبر بروتوكولات HTTPS و Firebase Auth لضمان سرية بياناتك وعدم مشاركتها أو بيعها لأي جهة خارجية إطلاقاً.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-slate-900 dark:text-white mb-2">
              5. التواصل والاستفسار
            </h2>
            <p>
              إذا كان لديك أي استفسار بشأن سياسة الخصوصية، يمكنك التواصل معنا عبر البريد الإلكتروني: <a href="mailto:alhadaafpro@gmail.com" className="text-primary-600 dark:text-gold-400 font-bold hover:underline">alhadaafpro@gmail.com</a>.
            </p>
          </section>

        </div>
      </div>
    </div>
  );
}
