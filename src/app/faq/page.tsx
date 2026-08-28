'use client';

import React, { useState } from 'react';
import IslamicPattern from '@/components/layout/IslamicPattern';
import { FAQS } from '@/lib/curriculumData';
import { HelpCircle, ChevronDown, Sparkles } from 'lucide-react';

export default function FAQPage() {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  const toggle = (idx: number) => {
    setOpenIdx(openIdx === idx ? null : idx);
  };

  return (
    <div className="min-h-screen py-10 bg-slate-50/60 dark:bg-slate-950/40">
      
      {/* Banner */}
      <div className="relative bg-gradient-to-r from-primary-950 via-primary-900 to-indigo-950 text-white py-14 overflow-hidden mb-12">
        <IslamicPattern variant="stars" opacity={0.06} />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-gold-400/30 bg-gold-500/10 px-4 py-1 text-xs font-bold text-gold-300 mb-3">
            <HelpCircle className="h-4 w-4" />
            <span>إجابات على كافة تساؤلاتكم</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black font-heading text-white">
            الأسئلة الشائعة (FAQ)
          </h1>
          <p className="mt-3 text-xs sm:text-base text-slate-200 max-w-xl mx-auto">
            كل ما تود معرفته حول منصة الهداف التعليمية، المناهج، تحميل المذكرات، واستخدام بنك الاختبارات.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 space-y-4">
        {FAQS.map((faq, idx) => {
          const isOpen = openIdx === idx;
          return (
            <div
              key={idx}
              className="overflow-hidden rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm transition-all"
            >
              <button
                onClick={() => toggle(idx)}
                className="flex w-full items-center justify-between p-5 text-right font-bold text-slate-900 dark:text-white hover:text-primary-600 dark:hover:text-gold-400 transition-colors"
              >
                <span className="text-sm sm:text-base">{faq.question}</span>
                <ChevronDown className={`h-5 w-5 shrink-0 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180 text-gold-500' : ''}`} />
              </button>

              {isOpen && (
                <div className="border-t border-slate-100 dark:border-slate-800/80 p-5 pt-3 text-xs sm:text-sm leading-relaxed text-slate-600 dark:text-slate-300 bg-slate-50/50 dark:bg-slate-800/30">
                  {faq.answer}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
