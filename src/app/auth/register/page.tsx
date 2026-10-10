'use client';

import React, { useState, useEffect, useRef } from 'react';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useLessons } from '@/context/LessonsContext';
import IslamicPattern from '@/components/layout/IslamicPattern';
import TelegramLoginButton from '@/components/auth/TelegramLoginButton';
import { ARAB_COUNTRIES, getStagesForCountry } from '@/lib/curriculumData';
import { CountryCode, StageType } from '@/types';
import { 
  User, Mail, Lock, UserPlus, AlertCircle, Globe2, Phone,
  MessageSquare, CheckCircle2, ArrowLeft, RefreshCw, ShieldCheck, LogIn
} from 'lucide-react';
import type { ConfirmationResult } from 'firebase/auth';
import { CountryCode, StageType, TelegramUser } from '@/types';
import { User, Mail, Lock, UserPlus, AlertCircle, Globe2 } from 'lucide-react';

const COUNTRY_CODES = [
  { code: '+20',  flag: '🇪🇬', name: 'مصر' },
  { code: '+966', flag: '🇸🇦', name: 'السعودية' },
  { code: '+971', flag: '🇦🇪', name: 'الإمارات' },
  { code: '+965', flag: '🇰🇼', name: 'الكويت' },
  { code: '+974', flag: '🇶🇦', name: 'قطر' },
  { code: '+973', flag: '🇧🇭', name: 'البحرين' },
  { code: '+968', flag: '🇴🇲', name: 'عُمان' },
  { code: '+962', flag: '🇯🇴', name: 'الأردن' },
  { code: '+961', flag: '🇱🇧', name: 'لبنان' },
  { code: '+963', flag: '🇸🇾', name: 'سوريا' },
  { code: '+964', flag: '🇮🇶', name: 'العراق' },
  { code: '+218', flag: '🇱🇾', name: 'ليبيا' },
  { code: '+216', flag: '🇹🇳', name: 'تونس' },
  { code: '+213', flag: '🇩🇿', name: 'الجزائر' },
  { code: '+212', flag: '🇲🇦', name: 'المغرب' },
  { code: '+249', flag: '🇸🇩', name: 'السودان' },
  { code: '+967', flag: '🇾🇪', name: 'اليمن' },
];

type RegisterTab = 'email' | 'phone';
type PhoneStep = 'input' | 'otp';

export default function RegisterPage() {
  const router = useRouter();
  const { 
    registerWithEmail, 
    loginWithGoogle, 
    checkPhoneNumberExists,
    sendPhoneOTP, 
    registerWithPhone,
    user 
  } = useAuth();
  const { registerWithEmail, loginWithGoogle, loginWithTelegram, user } = useAuth();
  const { setSelectedCountry } = useLessons();

  const [activeTab, setActiveTab] = useState<RegisterTab>('phone'); // الهاتف كخيار افتراضي حديث
  const [loading, setLoading] = useState(false);
  const [googlePending, setGooglePending] = useState(false);
  const [error, setError] = useState('');

  // ── Shared Curriculum Fields ──────────────────────────────────────────
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [country, setCountry] = useState<CountryCode>('eg'); // مصر افتراضي
  const [stage, setStage] = useState<StageType>('secondary');
  const [gradeNumber, setGradeNumber] = useState<number>(1);
  const [loading, setLoading] = useState(false);
  const [socialPending, setSocialPending] = useState(false);
  const [error, setError] = useState('');

  // ── Email Tab Fields ──────────────────────────────────────────────────
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // ── Phone Tab Fields ──────────────────────────────────────────────────
  const [countryDialCode, setCountryDialCode] = useState('+20');
  const [localPhone, setLocalPhone] = useState('');
  const [phoneStep, setPhoneStep] = useState<PhoneStep>('input');
  const [alreadyExists, setAlreadyExists] = useState(false);
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [confirmation, setConfirmation] = useState<ConfirmationResult | null>(null);
  const [otpTimer, setOtpTimer] = useState(0);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);
  const recaptchaContainerId = 'recaptcha-register-container';

  // Read URL search params on client mount to prefill from Login redirect
  // After Social sign-up, redirect to select-curriculum or curriculum
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get('tab');
      const phoneParam = params.get('phone');
      const dialParam = params.get('dial');

      if (tabParam === 'phone' || tabParam === 'email') {
        setActiveTab(tabParam);
      }
      if (phoneParam) {
        setLocalPhone(phoneParam);
      }
      if (dialParam) {
        setCountryDialCode(dialParam);
      }
    }
  }, []);

  // Cleanup reCAPTCHA on unmount
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && (window as any).__recaptchaVerifier) {
        try { (window as any).__recaptchaVerifier.clear(); } catch {}
        delete (window as any).__recaptchaVerifier;
      }
    };
  }, []);

  // OTP countdown
  useEffect(() => {
    if (otpTimer > 0) {
      const id = setTimeout(() => setOtpTimer(t => t - 1), 1000);
      return () => clearTimeout(id);
    }
  }, [otpTimer]);

  // After Google sign-up redirect
  useEffect(() => {
    if (googlePending && user) {
      setGooglePending(false);
    if (socialPending && user) {
      setSocialPending(false);
      router.push('/auth/select-curriculum');
    }
  }, [user, googlePending, router]);
  }, [user, socialPending, router]);

  const stages = getStagesForCountry(country);

  const handleCountryChange = (code: CountryCode) => {
    setCountry(code);
    const newStages = getStagesForCountry(code);
    setStage(newStages[0]?.id || 'secondary');
    setGradeNumber(1);

    // Auto update phone dial code if matching country found
    const matchingDial = COUNTRY_CODES.find(c => {
      if (code === 'eg') return c.code === '+20';
      if (code === 'sa') return c.code === '+966';
      if (code === 'ae') return c.code === '+971';
      if (code === 'kw') return c.code === '+965';
      if (code === 'qa') return c.code === '+974';
      if (code === 'bh') return c.code === '+973';
      if (code === 'om') return c.code === '+968';
      if (code === 'jo') return c.code === '+962';
      return false;
    });
    if (matchingDial) {
      setCountryDialCode(matchingDial.code);
    }
  };

  const handleEmailRegister = async (e: React.FormEvent) => {
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
      setSocialPending(true);
      await loginWithGoogle();
    } catch (err: any) {
      setGooglePending(false);
      setSocialPending(false);
      setError('تعذر التسجيل بواسطة Google.');
      setLoading(false);
    }
  };

  const fullPhone = `${countryDialCode}${localPhone.replace(/^0+/, '')}`;

  const handleSendPhoneOTP = async () => {
    if (!name.trim()) {
      setError('يرجى كتابة الاسم الكامل أولاً');
      return;
    }
    if (!localPhone || localPhone.length < 7) {
      setError('يرجى إدخال رقم هاتف صحيح');
      return;
    }
  const handleTelegramAuth = async (tgUser: TelegramUser) => {
    setError('');
    setAlreadyExists(false);
    setLoading(true);

    try {
      // 1. التحقق: هل الرقم مسجل مسبقاً؟
      const exists = await checkPhoneNumberExists(fullPhone);
      if (exists) {
        setAlreadyExists(true);
        setError('هذا الرقم مسجل بالفعل في المنصة! يمكنك تسجيل الدخول به مباشرة.');
        setLoading(false);
        return;
      }

      // 2. إرسال OTP
      const result = await sendPhoneOTP(fullPhone, recaptchaContainerId);
      setConfirmation(result);
      setPhoneStep('otp');
      setOtpTimer(60);
      setTimeout(() => otpRefs.current[0]?.focus(), 200);
      setSocialPending(true);
      await loginWithTelegram(tgUser, true);
    } catch (err: any) {
      console.error('Phone OTP send error:', err);
      const code = err.code || '';
      const msg = err.message || '';

      if (code === 'auth/billing-not-enabled') {
        setError('إرسال رسائل SMS الحقيقية يتطلب تفعيل خطة Blaze (Pay as you go) في Firebase. يمكنك بدلاً من ذلك إضافة رقمك كرقم تجريبي (Phone numbers for testing) في لوحة Firebase للتسجيل به مجاناً وبدون بطاقة.');
      } else if (code === 'auth/operation-not-allowed') {
        setError('خدمة الهاتف مقيدة في Firebase: تأكد من تفعيل Phone في Sign-in method، وإضافة دولتك إلى SMS region policy أو استخدام رقم اختبار (Phone numbers for testing).');
      } else if (code === 'auth/unauthorized-domain') {
        setError('هذا النطاق غير مصرح به في Firebase. يرجى إضافة رابط الموقع إلى Authorized Domains في Firebase Console.');
      } else if (code === 'auth/invalid-phone-number') {
        setError('رقم الهاتف غير صحيح. تأكد من اختيار كود الدولة الصحيح.');
      } else if (code === 'auth/too-many-requests') {
        setError('تم حظر المحاولات مؤقتاً بسبب تكرار الطلبات. يرجى الانتظار 5 دقائق.');
      } else if (code === 'auth/quota-exceeded') {
        setError('تم تجاوز الحد اليومي للرسائل القصيرة في Firebase.');
      } else {
        setError(msg || 'تعذر إرسال رمز التحقق. تأكد من الرقم وحاول مجدداً.');
      }
    } finally {
      console.error('Telegram register error:', err);
      setSocialPending(false);
      setError('تعذر التسجيل بواسطة Telegram.');
      setLoading(false);
    }
  };

  const handleOtpInput = (idx: number, val: string) => {
    if (!/^\d*$/.test(val)) return;
    const digits = [...otpDigits];
    digits[idx] = val.slice(-1);
    setOtpDigits(digits);
    setError('');
    if (val && idx < 5) {
      otpRefs.current[idx + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (idx: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otpDigits[idx] && idx > 0) {
      otpRefs.current[idx - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length === 6) {
      setOtpDigits(pasted.split(''));
      otpRefs.current[5]?.focus();
    }
  };

  const handleVerifyAndRegister = async () => {
    const code = otpDigits.join('');
    if (code.length < 6) {
      setError('أدخل الرمز المكوّن من 6 أرقام كاملاً');
      return;
    }
    if (!confirmation) {
      setError('انتهت صلاحية الجلسة. أعد إرسال الرمز.');
      return;
    }
    setError('');
    setLoading(true);

    try {
      await registerWithPhone(confirmation, code, {
        name: name.trim(),
        country,
        stage,
        gradeNumber,
      });
      setSelectedCountry(country);
      router.push('/curriculum');
    } catch (err: any) {
      console.error('Register OTP verify error:', err);
      if (err.code === 'auth/invalid-verification-code') {
        setError('رمز التحقق غير صحيح. تأكد من الأرقام وحاول مرة أخرى.');
      } else if (err.code === 'auth/code-expired') {
        setError('انتهت صلاحية الرمز. اضغط "إعادة إرسال" للحصول على رمز جديد.');
        setPhoneStep('input');
      } else {
        setError(err.message || 'خطأ في تأكيد الرمز. حاول مجدداً.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-10 flex items-center justify-center bg-slate-50/70 dark:bg-slate-950/70 relative">
      <IslamicPattern variant="stars" opacity={0.05} />

      {/* Invisible reCAPTCHA container for Register */}
      <div id={recaptchaContainerId} />

      <div className="relative w-full max-w-lg px-4 sm:px-6">
        <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/95 p-8 shadow-2xl backdrop-blur-xl">

          {/* Logo & Title */}
          <div className="text-center mb-6">
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
              أنشئ حسابك برقم الهاتف أو البريد لتخصيص محتوى دروسك ومناهجك فوراً
              اختر دولتك ومنهجك الدراسي ليُخصَّص لك المحتوى التفاعلي تلقائياً
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-5 flex items-center gap-2 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 p-3.5 text-xs text-rose-700 dark:text-rose-300">
            <div className="mb-5 flex items-center gap-2 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 p-3.5 text-xs text-rose-700 dark:text-rose-300 animate-scale-in">
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
          {/* ── Quick Social Sign-up Buttons ── */}
          <div className="space-y-2.5 mb-5">
            {/* Google Sign-in */}
            <button
              type="button"
              onClick={handleGoogle}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 p-3 text-xs font-bold text-slate-700 dark:text-slate-200 shadow-sm transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
            >
              <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span>التسجيل السريع بحساب Google</span>
            </button>

            {/* Telegram Sign-in */}
            <TelegramLoginButton
              onAuth={handleTelegramAuth}
              disabled={loading}
              buttonText="التسجيل السريع بحساب Telegram"
            />
          </div>

          <div className="relative my-5 flex items-center justify-center">
            <div className="border-t border-slate-200 dark:border-slate-800 w-full" />
            <span className="bg-white dark:bg-slate-900 px-3 text-[11px] font-bold text-slate-400">
              أو أنشئ حساباً جديداً
              أو بالبريد الإلكتروني واختيار المنهج
            </span>
          </div>

          {/* ── Tabs (Phone vs Email) ── */}
          <div className="flex rounded-2xl border border-slate-200 dark:border-slate-700 p-1 mb-6 gap-1">
            <button
              type="button"
              onClick={() => { setActiveTab('phone'); setError(''); setAlreadyExists(false); }}
              className={`flex-1 flex items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-bold transition-all duration-200 ${
                activeTab === 'phone'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              }`}
            >
              <Phone className="h-3.5 w-3.5" />
              <span>برقم الهاتف (SMS)</span>
            </button>
            <button
              type="button"
              onClick={() => { setActiveTab('email'); setError(''); setAlreadyExists(false); }}
              className={`flex-1 flex items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-bold transition-all duration-200 ${
                activeTab === 'email'
                  ? 'bg-primary-600 text-white shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              }`}
            >
              <Mail className="h-3.5 w-3.5" />
              <span>بالبريد الإلكتروني</span>
            </button>
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

          {/* ═══════════════ PHONE REGISTRATION TAB ═══════════════ */}
          {activeTab === 'phone' && (
            <div className="space-y-4">
              {phoneStep === 'input' && (
                <>
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
                        className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 py-2.5 pr-10 pl-3 text-xs text-slate-900 dark:text-white focus:border-emerald-500 focus:outline-none"
                      />
                      <User className="absolute right-3 top-3 h-4 w-4 text-slate-400" />
                    </div>
                  </div>

                  {/* Phone Input with Country Code */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      رقم الهاتف:
                    </label>
                    <div className="flex gap-2">
                      <div className="relative">
                        <select
                          value={countryDialCode}
                          onChange={(e) => setCountryDialCode(e.target.value)}
                          className="appearance-none h-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 py-2.5 pr-3 pl-8 text-xs font-bold text-slate-900 dark:text-white focus:border-emerald-500 focus:outline-none cursor-pointer"
                          style={{ minWidth: '90px' }}
                        >
                          {COUNTRY_CODES.map(c => (
                            <option key={c.code} value={c.code}>
                              {c.flag} {c.code}
                            </option>
                          ))}
                        </select>
                        <div className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 text-slate-400">
                          ▾
                        </div>
                      </div>

                      <div className="relative flex-1">
                        <input
                          type="tel"
                          placeholder="01012345678"
                          value={localPhone}
                          onChange={(e) => setLocalPhone(e.target.value.replace(/\D/g, ''))}
                          className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 py-2.5 pr-10 pl-3 text-xs text-slate-900 dark:text-white focus:border-emerald-500 focus:outline-none"
                          dir="ltr"
                          maxLength={15}
                        />
                        <Phone className="absolute right-3 top-3 h-4 w-4 text-slate-400" />
                      </div>
                    </div>

                    {localPhone && (
                      <p className="mt-1 text-[11px] text-slate-400 dark:text-slate-500 text-center" dir="ltr">
                        الرقم المسجل: <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">{fullPhone}</span>
                      </p>
                    )}
                  </div>

                  {/* Country Selection */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                      <Globe2 className="h-3.5 w-3.5 text-emerald-500" />
                      اختر دولتك / منهجك الدراسي:
                      <span className="text-rose-500 font-black">*</span>
                    </label>
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                      {ARAB_COUNTRIES.filter(c => c.code !== 'general').map((c) => (
                        <button
                          key={c.code}
                          type="button"
                          onClick={() => handleCountryChange(c.code)}
                          className={`flex flex-col items-center justify-center gap-1 rounded-xl border-2 py-2 px-1 text-center transition-all text-[10px] font-bold leading-tight cursor-pointer ${
                            country === c.code
                              ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 shadow-sm'
                              : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 hover:border-emerald-300'
                          }`}
                        >
                          <span className="text-xl">{c.flag}</span>
                          <span>{c.name.replace('المملكة العربية ', '').replace('جمهورية ', '').replace(' العربية المتحدة', '').replace(' الأردنية الهاشمية', '')}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Stage & Grade Selectors */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        المرحلة الدراسية:
                      </label>
                      <select
                        value={stage}
                        onChange={(e) => { setStage(e.target.value as StageType); setGradeNumber(1); }}
                        className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 py-2.5 px-3 text-xs text-slate-900 dark:text-white focus:border-emerald-500 focus:outline-none"
                      >
                        {stages.map((s) => (
                          <option key={s.id} value={s.id}>{s.name}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        الصف الدراسي:
                      </label>
                      <select
                        value={gradeNumber}
                        onChange={(e) => setGradeNumber(Number(e.target.value))}
                        className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 py-2.5 px-3 text-xs text-slate-900 dark:text-white focus:border-emerald-500 focus:outline-none"
                      >
                        {Array.from({ length: stages.find(s => s.id === stage)?.gradesCount || 3 }, (_, i) => i + 1).map((g) => (
                          <option key={g} value={g}>الصف {g === 1 ? 'الأول' : g === 2 ? 'الثاني' : g === 3 ? 'الثالث' : g === 4 ? 'الرابع' : g === 5 ? 'الخامس' : 'السادس'}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Submit / Send OTP button */}
            {/* Country Selection */}
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
                    onClick={handleSendPhoneOTP}
                    disabled={loading || !name.trim() || !localPhone}
                    className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white py-3 text-xs font-bold shadow-md transition-all disabled:opacity-50"
                    onClick={() => handleCountryChange(c.code)}
                    className={`flex flex-col items-center justify-center gap-1 rounded-xl border-2 py-2 px-1 text-center transition-all text-[10px] font-bold leading-tight cursor-pointer ${
                      country === c.code
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 shadow-sm'
                        : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 hover:border-primary-300'
                    }`}
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                        </svg>
                        جاري إرسال رمز التحقق...
                      </span>
                    ) : (
                      <>
                        <MessageSquare className="h-4 w-4" />
                        <span>إرسال رمز التحقق (SMS)</span>
                      </>
                    )}
                    <span className="text-xl">{c.flag}</span>
                    <span>{c.name.replace('المملكة العربية ', '').replace('جمهورية ', '').replace(' العربية المتحدة', '').replace(' الأردنية الهاشمية', '')}</span>
                  </button>

                  {/* If phone already exists in DB -> prompt to login */}
                  {alreadyExists && (
                    <div className="rounded-2xl border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/40 p-4 text-center space-y-2 animate-scale-in">
                      <p className="text-xs font-bold text-blue-900 dark:text-blue-200">
                        هذا الرقم مسجل بالفعل في منصة الهَدَّاف!
                      </p>
                      <Link
                        href="/auth/login"
                        className="inline-flex items-center justify-center gap-2 w-full rounded-xl bg-blue-600 hover:bg-blue-700 text-white py-2.5 text-xs font-bold transition-all shadow-sm"
                      >
                        <LogIn className="h-4 w-4" />
                        <span>تسجيل الدخول الآن بحسابك المسجل</span>
                        <ArrowLeft className="h-4 w-4" />
                      </Link>
                    </div>
                  )}
                </>
              )}

              {/* ── Step 2: Enter OTP on Register ── */}
              {phoneStep === 'otp' && (
                <div className="space-y-4">
                  <div className="flex items-start gap-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 p-3">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-[11px] text-emerald-700 dark:text-emerald-300 font-bold">
                        تم إرسال رمز التحقق إلى هاتفك!
                      </p>
                      <p className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-0.5" dir="ltr">
                        {fullPhone}
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-3 text-center">
                      أدخل رمز التحقق (6 أرقام) لإتمام التسجيل:
                    </label>

                    <div className="flex gap-2 justify-center" dir="ltr" onPaste={handleOtpPaste}>
                      {otpDigits.map((digit, idx) => (
                        <input
                          key={idx}
                          ref={el => { otpRefs.current[idx] = el; }}
                          type="text"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          maxLength={1}
                          value={digit}
                          onChange={(e) => handleOtpInput(idx, e.target.value)}
                          onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                          className={`w-11 h-12 text-center text-lg font-black rounded-xl border-2 transition-all duration-150 focus:outline-none bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white ${
                            digit
                              ? 'border-emerald-500 dark:border-emerald-400 bg-emerald-50 dark:bg-emerald-950/40'
                              : 'border-slate-300 dark:border-slate-700 focus:border-emerald-400'
                          }`}
                        />
                      ))}
                    </div>

                    <div className="mt-3 text-center">
                      {otpTimer > 0 ? (
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                          إعادة الإرسال متاحة بعد{' '}
                          <span className="font-bold text-emerald-600 dark:text-emerald-400">
                            {otpTimer}s
                          </span>
                        </p>
                      ) : (
                        <button
                          type="button"
                          onClick={() => { setPhoneStep('input'); setOtpDigits(['','','','','','']); }}
                          className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 mx-auto"
                        >
                          <RefreshCw className="h-3 w-3" />
                          إعادة إرسال الرمز
                        </button>
                      )}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleVerifyAndRegister}
                    disabled={loading || otpDigits.join('').length < 6}
                    className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white py-3 text-xs font-bold shadow-md transition-all disabled:opacity-50"
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                        </svg>
                        جاري تأكيد الحساب...
                      </span>
                    ) : (
                      <>
                        <ShieldCheck className="h-4 w-4" />
                        <span>تأكيد الرمز وتفعيل الحساب الآن</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => { setPhoneStep('input'); setOtpDigits(['','','','','','']); setError(''); }}
                    className="w-full text-center text-xs text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 flex items-center justify-center gap-1"
                  >
                    <ArrowLeft className="h-3 w-3" />
                    تعديل بيانات التسجيل أو رقم الهاتف
                  </button>
                </div>
              )}
                ))}
              </div>
            </div>
          )}

          {/* ═══════════════ EMAIL REGISTRATION TAB ═══════════════ */}
          {activeTab === 'email' && (
            <form onSubmit={handleEmailRegister} className="space-y-4">
              {/* Full Name */}
            {/* Stage & Grade Selectors */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  الاسم الكامل:
                  المرحلة الدراسية:
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

              {/* Country Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <Globe2 className="h-3.5 w-3.5 text-primary-500" />
                  اختر دولتك / منهجك الدراسي:
                  <span className="text-rose-500 font-black">*</span>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  الصف الدراسي:
                </label>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {ARAB_COUNTRIES.filter(c => c.code !== 'general').map((c) => (
                    <button
                      key={c.code}
                      type="button"
                      onClick={() => handleCountryChange(c.code)}
                      className={`flex flex-col items-center justify-center gap-1 rounded-xl border-2 py-2 px-1 text-center transition-all text-[10px] font-bold leading-tight cursor-pointer ${
                        country === c.code
                          ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 shadow-sm'
                          : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 hover:border-primary-300'
                      }`}
                    >
                      <span className="text-xl">{c.flag}</span>
                      <span>{c.name.replace('المملكة العربية ', '').replace('جمهورية ', '').replace(' العربية المتحدة', '').replace(' الأردنية الهاشمية', '')}</span>
                    </button>
                <select
                  value={gradeNumber}
                  onChange={(e) => setGradeNumber(Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 py-2.5 px-3 text-xs text-slate-900 dark:text-white focus:border-primary-500 focus:outline-none"
                >
                  {Array.from({ length: stages.find(s => s.id === stage)?.gradesCount || 3 }, (_, i) => i + 1).map((g) => (
                    <option key={g} value={g}>الصف {g === 1 ? 'الأول' : g === 2 ? 'الثاني' : g === 3 ? 'الثالث' : g === 4 ? 'الرابع' : g === 5 ? 'الخامس' : 'السادس'}</option>
                  ))}
                </div>
                </select>
              </div>
            </div>

              {/* Stage & Grade Selectors */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
          )}

          {/* Footer Link */}
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
