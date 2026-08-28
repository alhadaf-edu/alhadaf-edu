'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useLessons } from '@/context/LessonsContext';
import { ARAB_COUNTRIES, getStagesForCountry } from '@/lib/curriculumData';
import { CountryCode, StageType } from '@/types';
import IslamicPattern from '@/components/layout/IslamicPattern';
import { GraduationCap, CheckCircle2, ArrowLeft, Sparkles } from 'lucide-react';

export default function SelectCurriculumPage() {
  const router = useRouter();
  const { user, profile, updateUserProfile } = useAuth();
  const { setSelectedCountry } = useLessons();

  const [country, setCountry] = useState<CountryCode>('sa');
  const [stage, setStage] = useState<StageType>('secondary');
  const [gradeNumber, setGradeNumber] = useState<number>(2);
  const [saving, setSaving] = useState(false);

  const stages = getStagesForCountry(country);

  // If not logged in, redirect to login
  useEffect(() => {
    if (!user) {
      router.replace('/auth/login');
    }
  }, [user, router]);

  // If user already has a country and came from normal login, pre-fill
  useEffect(() => {
    if (profile?.country) setCountry(profile.country);
    if (profile?.stage) setStage(profile.stage);
    if (profile?.gradeNumber) setGradeNumber(profile.gradeNumber);
  }, [profile]);

  const handleCountryChange = (code: CountryCode) => {
    setCountry(code);
    const newStages = getStagesForCountry(code);
    setStage(newStages[0]?.id || 'secondary');
    setGradeNumber(1);
  };

  const handleSave = () => {
    setSaving(true);
    updateUserProfile({ country, stage, gradeNumber });
    setSelectedCountry(country);
    setTimeout(() => {
      router.replace('/curriculum');
    }, 600);
  };

  const selectedCountryInfo = ARAB_COUNTRIES.find(c => c.code === country);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center py-10 px-4 relative">
      <IslamicPattern variant="subtle" opacity={0.04} />

      <div className="w-full max-w-2xl relative">

        {/* Header Card */}
        <div className="text-center mb-6">
          <Link href="/" className="inline-block mb-4">
            <div className="mx-auto flex h-16 w-16 items-center justify-center overflow-hidden rounded-3xl border-2 border-gold-500/40 bg-slate-950 p-1.5 shadow-glow">
              <Image src="/logo.png" alt="الهَدَّاف" width={56} height={56} className="object-contain" priority />
            </div>
          </Link>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white font-heading">
            أهلاً بك في الهَدَّاف 👋
          </h1>
          <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            لتحصل على تجربة تعليمية مخصصة لك، اختر دولتك ومرحلتك الدراسية
          </p>
        </div>

        {/* Main Card */}
        <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-2xl">

          {/* Step 1 – Country */}
          <div className="mb-7">
            <div className="flex items-center gap-2 mb-4">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary-600 text-white text-xs font-black">1</div>
              <h2 className="text-sm font-black text-slate-900 dark:text-white">اختر دولتك / منهجك الدراسي</h2>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {ARAB_COUNTRIES.filter(c => c.code !== 'general').map((c) => (
                <button
                  key={c.code}
                  type="button"
                  onClick={() => handleCountryChange(c.code)}
                  className={`relative flex flex-col items-center justify-center gap-1.5 rounded-2xl border-2 py-4 px-2 text-center transition-all duration-200 cursor-pointer ${
                    country === c.code
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 shadow-md scale-[1.03]'
                      : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 hover:border-primary-300 hover:bg-primary-50/50 dark:hover:bg-primary-900/20 hover:scale-[1.02]'
                  }`}
                >
                  {country === c.code && (
                    <span className="absolute top-1.5 left-1.5 text-primary-500">
                      <CheckCircle2 className="h-4 w-4" />
                    </span>
                  )}
                  <span className="text-3xl leading-none">{c.flag}</span>
                  <span className="text-[11px] font-bold leading-tight">
                    {c.name
                      .replace('المملكة العربية ', '')
                      .replace('جمهورية ', '')
                      .replace(' العربية المتحدة', '')
                      .replace(' الأردنية الهاشمية', '')}
                  </span>
                </button>
              ))}
              {/* General */}
              <button
                type="button"
                onClick={() => handleCountryChange('general')}
                className={`relative flex flex-col items-center justify-center gap-1.5 rounded-2xl border-2 py-4 px-2 text-center transition-all duration-200 cursor-pointer col-span-2 sm:col-span-4 ${
                  country === 'general'
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 shadow-md'
                    : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 hover:border-primary-300'
                }`}
              >
                {country === 'general' && (
                  <CheckCircle2 className="absolute top-2 left-2 h-4 w-4 text-primary-500" />
                )}
                <span className="text-2xl">🌐</span>
                <span className="text-[11px] font-bold">مناهج عربية عامة (غير محددة)</span>
              </button>
            </div>
          </div>

          {/* Step 2 – Stage */}
          <div className="mb-7">
            <div className="flex items-center gap-2 mb-4">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary-600 text-white text-xs font-black">2</div>
              <h2 className="text-sm font-black text-slate-900 dark:text-white">اختر مرحلتك الدراسية</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {stages.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => { setStage(s.id); setGradeNumber(1); }}
                  className={`relative flex flex-col items-start gap-1 rounded-2xl border-2 p-4 text-right transition-all duration-200 cursor-pointer ${
                    stage === s.id
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/30 shadow-sm'
                      : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 hover:border-primary-300'
                  }`}
                >
                  {stage === s.id && (
                    <CheckCircle2 className="absolute top-2.5 left-2.5 h-4 w-4 text-primary-500" />
                  )}
                  <div className="flex items-center gap-2">
                    <GraduationCap className={`h-4 w-4 ${stage === s.id ? 'text-primary-600' : 'text-slate-400'}`} />
                    <span className={`text-xs font-black ${stage === s.id ? 'text-primary-700 dark:text-primary-300' : 'text-slate-700 dark:text-slate-200'}`}>
                      {s.name}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 leading-tight pr-6">{s.description}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Step 3 – Grade */}
          <div className="mb-7">
            <div className="flex items-center gap-2 mb-4">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary-600 text-white text-xs font-black">3</div>
              <h2 className="text-sm font-black text-slate-900 dark:text-white">اختر صفك الدراسي</h2>
            </div>

            <div className="flex flex-wrap gap-2">
              {Array.from(
                { length: stages.find(s => s.id === stage)?.gradesCount || 3 },
                (_, i) => i + 1
              ).map((g) => {
                const labels = ['الأول', 'الثاني', 'الثالث', 'الرابع', 'الخامس', 'السادس'];
                return (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setGradeNumber(g)}
                    className={`flex items-center justify-center rounded-xl border-2 px-5 py-2.5 text-xs font-bold transition-all ${
                      gradeNumber === g
                        ? 'border-primary-500 bg-primary-600 text-white shadow-sm'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-primary-300 hover:bg-primary-50 dark:hover:bg-primary-900/20'
                    }`}
                  >
                    الصف {labels[g - 1] || g}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Summary badge */}
          {selectedCountryInfo && (
            <div className="mb-6 flex items-center gap-3 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 px-4 py-3">
              <Sparkles className="h-5 w-5 text-emerald-500 shrink-0" />
              <p className="text-xs text-emerald-700 dark:text-emerald-300 leading-relaxed">
                سيتم عرض مناهج <strong>{selectedCountryInfo.flag} {selectedCountryInfo.name}</strong> تلقائياً في كل زياراتك، ويمكنك تغيير اختيارك في أي وقت من ملفك الشخصي.
              </p>
            </div>
          )}

          {/* CTA Button */}
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full flex items-center justify-center gap-2.5 rounded-2xl bg-gradient-to-r from-primary-600 to-indigo-700 hover:from-primary-700 hover:to-indigo-800 text-white py-4 text-sm font-black shadow-lg transition-all disabled:opacity-70 disabled:scale-95"
          >
            {saving ? (
              <>
                <span className="animate-spin h-4 w-4 border-2 border-white/40 border-t-white rounded-full inline-block" />
                <span>جاري الحفظ وتجهيز منهجك...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="h-5 w-5" />
                <span>تأكيد الاختيار والدخول للمنهج</span>
                <ArrowLeft className="h-4 w-4 rotate-180" />
              </>
            )}
          </button>

          <div className="mt-4 text-center">
            <button
              onClick={() => router.replace('/')}
              className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 underline underline-offset-2 transition-colors"
            >
              تخطي الآن والذهاب للصفحة الرئيسية
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
