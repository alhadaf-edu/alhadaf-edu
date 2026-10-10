'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import IslamicPattern from '@/components/layout/IslamicPattern';
import TelegramLoginButton from '@/components/auth/TelegramLoginButton';
import { Mail, Lock, LogIn, AlertCircle } from 'lucide-react';
import { TelegramUser } from '@/types';

export default function LoginPage() {
  const router = useRouter();
  const { 
    loginWithGoogle, 
    loginWithTelegram, 
    loginWithEmail, 
    user, 
    needsCurriculumSelection 
  } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [socialPending, setSocialPending] = useState(false);
  const [error, setError] = useState('');

  // ── Redirect after Social / Telegram login ──────────────────────────────
  useEffect(() => {
    if (socialPending && user) {
      setSocialPending(false);
      if (needsCurriculumSelection) {
        router.push('/auth/select-curriculum');
      } else {
        router.push('/curriculum');
      }
    }
  }, [user, socialPending, needsCurriculumSelection, router]);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await loginWithEmail(email.trim(), password, rememberMe);
      router.push('/curriculum');
    } catch (err: any) {
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found') {
        setError('البريد الإلكتروني أو كلمة المرور غير صحيحة.');
      } else if (err.code === 'auth/too-many-requests') {
        setError('تم تعليق الحساب مؤقتاً بسبب محاولات متكررة. حاول لاحقاً.');
      } else {
        setError(err.message || 'حدث خطأ أثناء تسجيل الدخول.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    setLoading(true);
    try {
      setSocialPending(true);
      await loginWithGoogle(rememberMe);
    } catch (err: any) {
      setSocialPending(false);
      setError('تعذر تسجيل الدخول بـ Google، حاول مرة أخرى.');
      setLoading(false);
    }
  };

  const handleTelegramAuth = async (tgUser: TelegramUser) => {
    setError('');
    setLoading(true);
    try {
      setSocialPending(true);
      await loginWithTelegram(tgUser, rememberMe);
    } catch (err: any) {
      console.error('Telegram auth error:', err);
      setSocialPending(false);
      setError('تعذر تسجيل الدخول بواسطة Telegram. يرجى المحاولة مرة أخرى.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-16 flex items-center justify-center bg-slate-50/70 dark:bg-slate-950/70 relative">
      <IslamicPattern variant="stars" opacity={0.05} />

      <div className="relative w-full max-w-md px-4 sm:px-6">

        {/* Card */}
        <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/95 p-8 shadow-2xl backdrop-blur-xl">

          {/* Logo & Header */}
          <div className="text-center mb-7">
            <Link href="/" className="inline-block group mb-3">
              <div className="relative mx-auto flex h-20 w-20 items-center justify-center overflow-hidden rounded-3xl border-2 border-gold-500/40 bg-slate-950 p-1.5 shadow-glow transition-transform duration-300 group-hover:scale-105">
                <Image
                  src="/logo.png"
                  alt="شعار منصة الهَدَّاف"
                  width={72}
                  height={72}
                  className="object-contain"
                  priority
                />
              </div>
            </Link>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white font-heading">
              تسجيل الدخول إلى «الهَدَّاف»
            </h1>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              تابع دروسك المحفوظة ونتائج اختباراتك التفاعلية
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-5 flex items-center gap-2 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 p-3.5 text-xs text-rose-700 dark:text-rose-300 animate-scale-in">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* ── Quick Social Login Buttons ── */}
          <div className="space-y-2.5 mb-6">
            {/* Google Sign-in */}
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 p-3 text-xs font-bold text-slate-700 dark:text-slate-200 shadow-sm transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
            >
              <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
              </svg>
              <span>الدخول السريع بحساب Google</span>
            </button>

            {/* Telegram Sign-in */}
            <TelegramLoginButton
              onAuth={handleTelegramAuth}
              disabled={loading}
              mode="login"
              buttonText="الدخول السريع بحساب Telegram"
            />
          </div>

          {/* Divider */}
          <div className="relative my-6 flex items-center justify-center">
            <div className="border-t border-slate-200 dark:border-slate-800 w-full" />
            <span className="bg-white dark:bg-slate-900 px-3 text-[11px] font-bold text-slate-400">
              أو بالبريد الإلكتروني
            </span>
          </div>

          {/* Email/Password Form */}
          <form onSubmit={handleEmailLogin} className="space-y-4">
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

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                كلمة المرور:
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 py-2.5 pr-10 pl-3 text-xs text-slate-900 dark:text-white focus:border-primary-500 focus:outline-none"
                />
                <Lock className="absolute right-3 top-3 h-4 w-4 text-slate-400" />
              </div>
            </div>

            <div className="flex items-center gap-2 py-1 px-0.5">
              <input
                type="checkbox"
                id="rememberMeCheckbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-primary-600 cursor-pointer"
              />
              <label htmlFor="rememberMeCheckbox" className="text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer select-none">
                تذكر تسجيل دخولي في المرة القادمة
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary-600 hover:bg-primary-700 text-white py-3 text-xs font-bold shadow-md transition-all disabled:opacity-50"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                  جاري تسجيل الدخول...
                </span>
              ) : (
                <>
                  <LogIn className="h-4 w-4" />
                  <span>تسجيل الدخول</span>
                </>
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800 text-center text-xs text-slate-500 dark:text-slate-400">
            <span>ليس لديك حساب بعد؟ </span>
            <Link href="/auth/register" className="font-bold text-primary-600 dark:text-gold-400 hover:underline">
              أنشئ حساباً مجانياً
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}
