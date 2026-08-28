'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useLessons } from '@/context/LessonsContext';
import IslamicPattern from '@/components/layout/IslamicPattern';
import { ARAB_COUNTRIES, getStagesForCountry } from '@/lib/curriculumData';
import { CountryCode, StageType } from '@/types';
import { User, Mail, Lock, UserPlus, AlertCircle, Globe2 } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const { registerWithEmail, loginWithGoogle, user } = useAuth();
  const { setSelectedCountry } = useLessons();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [country, setCountry] = useState<CountryCode>('sa');
  const [stage, setStage] = useState<StageType>('secondary');
  const [gradeNumber, setGradeNumber] = useState<number>(2);
  const [loading, setLoading] = useState(false);
  const [googlePending, setGooglePending] = useState(false);
  const [error, setError] = useState('');

  // After Google sign-up, redirect to select-curriculum
  useEffect(() => {
    if (googlePending && user) {
      setGooglePending(false);
      router.push('/auth/select-curriculum');
    }
  }, [user, googlePending, router]);

  const stages = getStagesForCountry(country);

  const handleCountryChange = (code: CountryCode) => {
    setCountry(code);
    const newStages = getStagesForCountry(code);
    setStage(newStages[0]?.id || 'secondary');
    setGradeNumber(1);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await registerWithEmail(name.trim(), email.trim(), password, country, stage, gradeNumber);
      setSelectedCountry(country);
      router.push('/curriculum');
    } catch (err: any) {
      console.error('Registration error:', err);
      if (err.code === 'auth/email-already-in-use') {
        setError('هذا البريد الإلكتروني مسجل بالفعل، يرجى تسجيل الدخول.');
      } else if (err.code === 'auth/weak-password') {
        setError('كلمة المرور ضعيفة، يرجى إدخال 6 خانات على الأقل.');
      } else {
        setError(err.message || 'حدث خطأ أثناء إنشاء الحساب.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setError('');
    setLoading(true);
    try {
      setGooglePending(true);
      await loginWithGoogle();
      // redirect handled by useEffect above
    } catch (err: any) {
      setGooglePending(false);
      setError('تعذر التسجيل بواسطة Google.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-10 flex items-center justify-center bg-slate-50/70 dark:bg-slate-950/70 relative">
      <IslamicPattern variant="stars" opacity={0.05} />

      <div className="relative w-full max-w-lg px-4 sm:px-6">
        <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/95 p-8 shadow-2xl backdrop-blur-xl">

          {/* Logo & Title */}
          <div className="text-center mb-7">
            <Link href="/" className="inline-block group mb-3">
              <div className="relative mx-auto flex h-18 w-18 items-center justify-center overflow-hidden rounded-3xl border-2 border-gold-500/40 bg-slate-950 p-1.5 shadow-glow transition-transform duration-300 group-hover:scale-105">
                <Image
                  src="/logo.png"
                  alt="شعار منصة الهَدَّاف"
                  width={64}
                  height={64}
                  className="object-contain"
                  priority
                />
              </div>
            </Link>
            <h1 className="text-xl font-black text-slate-900 dark:text-white font-heading">
              إنشاء حساب طالب جديد
            </h1>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              اختر دولتك ومنهجك الدراسي ليُخصَّص لك المحتوى تلقائياً
            </p>
          </div>

          {error && (
            <div className="mb-5 flex items-center gap-2 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 p-3.5 text-xs text-rose-700 dark:text-rose-300">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Google Sign-in */}
          <button
            type="button"
            onClick={handleGoogle}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 p-3 text-xs font-bold text-slate-700 dark:text-slate-200 shadow-sm transition-all"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
            <span>التسجيل السريع بحساب Google</span>
          </button>

          <div className="relative my-5 flex items-center justify-center">
            <div className="border-t border-slate-200 dark:border-slate-800 w-full" />
            <span className="bg-white dark:bg-slate-900 px-3 text-[11px] font-bold text-slate-400">
              أو بالبريد الإلكتروني
            </span>
          </div>

          <form onSubmit={handleRegister} className="space-y-4">
            {/* Full Name */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                الاسم الكامل:
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="محمد أحمد"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 py-2.5 pr-10 pl-3 text-xs text-slate-900 dark:text-white focus:border-primary-500 focus:outline-none"
                />
                <User className="absolute right-3 top-3 h-4 w-4 text-slate-400" />
              </div>
            </div>

            {/* Country Selection – REQUIRED */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Globe2 className="h-3.5 w-3.5 text-primary-500" />
                اختر دولتك / منهجك الدراسي:
                <span className="text-rose-500 font-black">*</span>
              </label>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {ARAB_COUNTRIES.filter(c => c.code !== 'general').map((c) => (
                  <button
                    key={c.code}
                    type="button"
                    onClick={() => handleCountryChange(c.code)}
                    className={`flex flex-col items-center justify-center gap-1 rounded-xl border-2 py-2.5 px-1 text-center transition-all text-[10px] font-bold leading-tight cursor-pointer ${
                      country === c.code
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 shadow-sm'
                        : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 hover:border-primary-300 hover:bg-primary-50/50 dark:hover:bg-primary-900/20'
                    }`}
                  >
                    <span className="text-xl">{c.flag}</span>
                    <span>{c.name.replace('المملكة العربية ', '').replace('جمهورية ', '').replace(' العربية المتحدة', '').replace(' الأردنية الهاشمية', '')}</span>
                  </button>
                ))}
                {/* General */}
                <button
                  type="button"
                  onClick={() => handleCountryChange('general')}
                  className={`flex flex-col items-center justify-center gap-1 rounded-xl border-2 py-2.5 px-1 text-center transition-all text-[10px] font-bold leading-tight cursor-pointer col-span-2 sm:col-span-4 ${
                    country === 'general'
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 shadow-sm'
                      : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 hover:border-primary-300'
                  }`}
                >
                  <span className="text-xl">🌐</span>
                  <span>مناهج عربية عامة (غير محدد)</span>
                </button>
              </div>
            </div>

            {/* Stage */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                المرحلة الدراسية:
              </label>
              <select
                value={stage}
                onChange={(e) => { setStage(e.target.value as StageType); setGradeNumber(1); }}
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 py-2.5 px-3 text-xs text-slate-900 dark:text-white focus:border-primary-500 focus:outline-none"
              >
                {stages.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>

            {/* Grade Number */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                الصف الدراسي:
              </label>
              <select
                value={gradeNumber}
                onChange={(e) => setGradeNumber(Number(e.target.value))}
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 py-2.5 px-3 text-xs text-slate-900 dark:text-white focus:border-primary-500 focus:outline-none"
              >
                {Array.from({ length: stages.find(s => s.id === stage)?.gradesCount || 3 }, (_, i) => i + 1).map((g) => (
                  <option key={g} value={g}>الصف {g === 1 ? 'الأول' : g === 2 ? 'الثاني' : g === 3 ? 'الثالث' : g === 4 ? 'الرابع' : g === 5 ? 'الخامس' : 'السادس'}</option>
                ))}
              </select>
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                البريد الإلكتروني:
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 py-2.5 pr-10 pl-3 text-xs text-slate-900 dark:text-white focus:border-primary-500 focus:outline-none"
                />
                <Mail className="absolute right-3 top-3 h-4 w-4 text-slate-400" />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                كلمة المرور:
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  placeholder="•••••••• (6 خانات على الأقل)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 py-2.5 pr-10 pl-3 text-xs text-slate-900 dark:text-white focus:border-primary-500 focus:outline-none"
                />
                <Lock className="absolute right-3 top-3 h-4 w-4 text-slate-400" />
              </div>
            </div>

            {/* Selected country summary */}
            {country && country !== 'general' && (
              <div className="rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 p-3 text-xs text-emerald-700 dark:text-emerald-300">
                ✅ سيتم ربط حسابك تلقائياً بمنهج{' '}
                <strong>{ARAB_COUNTRIES.find(c => c.code === country)?.name}</strong> وعرض المحتوى المناسب لك مباشرة عند تسجيل الدخول.
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary-600 to-indigo-700 hover:from-primary-700 hover:to-indigo-800 text-white py-3 text-xs font-bold shadow-md transition-all disabled:opacity-50"
            >
              {loading ? (
                <span>جاري إنشاء الحساب...</span>
              ) : (
                <>
                  <UserPlus className="h-4 w-4" />
                  <span>إنشاء الحساب الآن</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800 text-center text-xs text-slate-500 dark:text-slate-400">
            <span>لديك حساب بالفعل؟ </span>
            <Link href="/auth/login" className="font-bold text-primary-600 dark:text-gold-400 hover:underline">
              تسجيل الدخول
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}
