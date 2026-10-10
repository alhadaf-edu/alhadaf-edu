'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import IslamicPattern from '@/components/layout/IslamicPattern';
import { 
  Mail, Lock, LogIn, AlertCircle, Phone, 
  MessageSquare, CheckCircle2, ArrowLeft, RefreshCw, ShieldCheck, UserPlus
} from 'lucide-react';
import type { ConfirmationResult } from 'firebase/auth';
import { ARAB_COUNTRIES } from '@/lib/curriculumData';

// ── Phone country codes ────────────────────────────────────────────────────
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

type LoginTab = 'email' | 'phone';
type PhoneStep = 'input' | 'otp';

export default function LoginPage() {
  const router = useRouter();
  const { 
    loginWithGoogle, 
    loginWithEmail, 
    sendPhoneOTP, 
    confirmPhoneOTP, 
    checkPhoneNumberExists,
    user, 
    needsCurriculumSelection 
  } = useAuth();

  // ── Shared ─────────────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState<LoginTab>('email');
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [googlePending, setGooglePending] = useState(false);
  const [error, setError] = useState('');

  // ── Email tab ──────────────────────────────────────────────────────────
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // ── Phone tab ──────────────────────────────────────────────────────────
  const [countryDialCode, setCountryDialCode] = useState('+20'); // مصر افتراضي
  const [localPhone, setLocalPhone] = useState(''); // الرقم بدون كود الدولة
  const [phoneStep, setPhoneStep] = useState<PhoneStep>('input');
  const [notRegistered, setNotRegistered] = useState(false);
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [confirmation, setConfirmation] = useState<ConfirmationResult | null>(null);
  const [otpTimer, setOtpTimer] = useState(0);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);
  const recaptchaContainerId = 'recaptcha-container';

  // ── Redirect after Google login ─────────────────────────────────────────
  useEffect(() => {
    if (googlePending && user) {
      setGooglePending(false);
      if (needsCurriculumSelection) {
        router.push('/auth/select-curriculum');
      } else {
        router.push('/curriculum');
      }
    }
  }, [user, googlePending, needsCurriculumSelection, router]);

  // ── OTP countdown timer ─────────────────────────────────────────────────
  useEffect(() => {
    if (otpTimer > 0) {
      const id = setTimeout(() => setOtpTimer(t => t - 1), 1000);
      return () => clearTimeout(id);
    }
  }, [otpTimer]);

  // ── Handlers ────────────────────────────────────────────────────────────
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
      setGooglePending(true);
      await loginWithGoogle(rememberMe);
    } catch (err: any) {
      setGooglePending(false);
      setError('تعذر تسجيل الدخول بـ Google، حاول مرة أخرى.');
      setLoading(false);
    }
  };

  // ── Cleanup reCAPTCHA on unmount ───────────────────────────────────────
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && (window as any).__recaptchaVerifier) {
        try {
          (window as any).__recaptchaVerifier.clear();
        } catch {}
        delete (window as any).__recaptchaVerifier;
      }
    };
  }, []);

  /** Build full E.164 phone number: +201012345678 */
  const fullPhone = `${countryDialCode}${localPhone.replace(/^0+/, '')}`;

  const handleSendOTP = async () => {
    if (!localPhone || localPhone.length < 7) {
      setError('أدخل رقم الهاتف بشكل صحيح');
      return;
    }
    setError('');
    setNotRegistered(false);
    setLoading(true);

    try {
      // 1. التحقق أولاً: هل رقم الهاتف مسجل بالفعل في المنصة؟
      const isRegistered = await checkPhoneNumberExists(fullPhone);
      if (!isRegistered) {
        setNotRegistered(true);
        setError('هذا الرقم غير مسجل في المنصة. يرجى إنشاء حساب جديد أولاً للاستفادة من خدمات المنصة.');
        setLoading(false);
        return;
      }

      // 2. إذا كان الرقم مسجلاً، نرسل رمز التحقق للدخول
      const result = await sendPhoneOTP(fullPhone, recaptchaContainerId);
      setConfirmation(result);
      setPhoneStep('otp');
      setOtpTimer(60);
      setTimeout(() => otpRefs.current[0]?.focus(), 200);
    } catch (err: any) {
      console.error('OTP send error:', err);
      const code = err.code || '';
      const msg = err.message || '';

      if (code === 'auth/operation-not-allowed') {
        setError('خدمة الهاتف مقيدة في Firebase: تأكد من تفعيل Phone في Sign-in method، وإضافة دولتك إلى SMS region policy أو استخدام رقم اختبار (Phone numbers for testing) في لوحة Firebase.');
      } else if (code === 'auth/unauthorized-domain') {
        setError('هذا النطاق غير مصرح به في Firebase. يرجى إضافة رابط الموقع الحالي إلى Authorized Domains في Firebase Console.');
      } else if (code === 'auth/invalid-phone-number') {
        setError('رقم الهاتف غير صحيح. تأكد من اختيار كود الدولة الصحيح وكتابة الرقم بدون أصفار إضافية.');
      } else if (code === 'auth/too-many-requests') {
        setError('تم حظر المحاولات مؤقتاً بسبب تكرار الطلبات. يرجى الانتظار 5 دقائق والمحاولة مجدداً.');
      } else if (code === 'auth/quota-exceeded') {
        setError('تم تجاوز الحد اليومي للرسائل القصيرة في Firebase.');
      } else if (code === 'auth/captcha-check-failed') {
        setError('فشل التحقق الأمني (reCAPTCHA). يرجى الضغط مرة أخرى لإعادة المحاولة.');
      } else if (msg.includes('already been rendered')) {
        setError('حدث تعارض في التحقق الأمني. يرجى الضغط مرة أخرى.');
      } else {
        setError(msg || 'تعذر إرسال رمز التحقق. يرجى التأكد من الرقم والمحاولة مجدداً.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleOtpInput = (idx: number, val: string) => {
    if (!/^\d*$/.test(val)) return; // أرقام فقط
    const digits = [...otpDigits];
    digits[idx] = val.slice(-1); // حرف واحد فقط
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

  const handleVerifyOTP = async () => {
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
      await confirmPhoneOTP(confirmation, code);
      // onAuthStateChanged in AuthContext fires → profile built → redirect
      if (needsCurriculumSelection) {
        router.push('/auth/select-curriculum');
      } else {
        router.push('/curriculum');
      }
    } catch (err: any) {
      if (err.code === 'auth/invalid-verification-code') {
        setError('رمز التحقق غير صحيح. تأكد من الأرقام وحاول مرة أخرى.');
      } else if (err.code === 'auth/code-expired') {
        setError('انتهت صلاحية الرمز. اضغط "إعادة إرسال" للحصول على رمز جديد.');
        setPhoneStep('input');
      } else {
        setError(err.message || 'خطأ في التحقق. حاول مرة أخرى.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setOtpDigits(['', '', '', '', '', '']);
    setError('');
    setPhoneStep('input');
    await handleSendOTP();
  };

  const selectedCountry = COUNTRY_CODES.find(c => c.code === countryDialCode);

  return (
    <div className="min-h-screen py-16 flex items-center justify-center bg-slate-50/70 dark:bg-slate-950/70 relative">
      <IslamicPattern variant="stars" opacity={0.05} />

      {/* Invisible reCAPTCHA container — required by Firebase */}
      <div id={recaptchaContainerId} />

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
            <div className="mb-5 flex items-center gap-2 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 p-3.5 text-xs text-rose-700 dark:text-rose-300">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Google Sign-in */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 p-3 text-xs font-bold text-slate-700 dark:text-slate-200 shadow-sm transition-all disabled:opacity-50"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
            </svg>
            <span>الدخول السريع باستخدام حساب Google</span>
          </button>

          {/* Divider */}
          <div className="relative my-6 flex items-center justify-center">
            <div className="border-t border-slate-200 dark:border-slate-800 w-full" />
            <span className="bg-white dark:bg-slate-900 px-3 text-[11px] font-bold text-slate-400">
              أو
            </span>
          </div>

          {/* ── Tabs ── */}
          <div className="flex rounded-2xl border border-slate-200 dark:border-slate-700 p-1 mb-6 gap-1">
            <button
              type="button"
              onClick={() => { setActiveTab('email'); setError(''); }}
              className={`flex-1 flex items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-bold transition-all duration-200 ${
                activeTab === 'email'
                  ? 'bg-primary-600 text-white shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              }`}
            >
              <Mail className="h-3.5 w-3.5" />
              <span>البريد الإلكتروني</span>
            </button>
            <button
              type="button"
              onClick={() => { setActiveTab('phone'); setError(''); setPhoneStep('input'); }}
              className={`flex-1 flex items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-bold transition-all duration-200 ${
                activeTab === 'phone'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              }`}
            >
              <Phone className="h-3.5 w-3.5" />
              <span>رقم الهاتف (SMS)</span>
            </button>
          </div>

          {/* ═══════════════ EMAIL TAB ═══════════════ */}
          {activeTab === 'email' && (
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
          )}

          {/* ═══════════════ PHONE TAB ═══════════════ */}
          {activeTab === 'phone' && (
            <div className="space-y-5">

              {/* ── Step 1: Enter Phone ── */}
              {phoneStep === 'input' && (
                <>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      رقم الهاتف:
                    </label>

                    <div className="flex gap-2">
                      {/* Country Code Selector */}
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

                      {/* Phone Number Input */}
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
                      <p className="mt-1.5 text-[11px] text-slate-400 dark:text-slate-500 text-center" dir="ltr">
                        الرقم الكامل: <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">{fullPhone}</span>
                      </p>
                    )}
                  </div>

                  {/* Info note */}
                  <div className="flex items-start gap-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 p-3">
                    <MessageSquare className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                    <p className="text-[11px] text-emerald-700 dark:text-emerald-300 leading-relaxed">
                      سيتم إرسال رمز تحقق مكوّن من <strong>6 أرقام</strong> عبر <strong>رسالة SMS</strong> إلى رقم هاتفك.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleSendOTP}
                    disabled={loading || !localPhone}
                    className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white py-3 text-xs font-bold shadow-md transition-all disabled:opacity-50"
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                        </svg>
                        جاري إرسال الرمز...
                      </span>
                    ) : (
                      <>
                        <MessageSquare className="h-4 w-4" />
                        <span>إرسال رمز التحقق</span>
                      </>
                    )}
                  </button>

                  {notRegistered && (
                    <div className="rounded-2xl border border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/40 p-4 text-center space-y-2.5 animate-scale-in">
                      <p className="text-xs font-bold text-amber-800 dark:text-amber-200">
                        رقم الهاتف <span className="font-mono dir-ltr font-black" dir="ltr">{fullPhone}</span> غير مسجل حتى الآن.
                      </p>
                      <Link
                        href={`/auth/register?tab=phone&phone=${localPhone}&dial=${encodeURIComponent(countryDialCode)}`}
                        className="inline-flex items-center justify-center gap-2 w-full rounded-xl bg-amber-600 hover:bg-amber-700 text-white py-2.5 text-xs font-bold transition-all shadow-sm"
                      >
                        <UserPlus className="h-4 w-4" />
                        <span>إنشاء حساب جديد بهذا الرقم الآن</span>
                        <ArrowLeft className="h-4 w-4" />
                      </Link>
                    </div>
                  )}
                </>
              )}

              {/* ── Step 2: Enter OTP ── */}
              {phoneStep === 'otp' && (
                <>
                  {/* Success note */}
                  <div className="flex items-start gap-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 p-3">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-[11px] text-emerald-700 dark:text-emerald-300 font-bold">
                        تم إرسال رمز التحقق SMS!
                      </p>
                      <p className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-0.5" dir="ltr">
                        {fullPhone}
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-3 text-center">
                      أدخل رمز التحقق المكوّن من 6 أرقام:
                    </label>

                    {/* OTP boxes — RTL-friendly but input is LTR */}
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

                    {/* Timer / Resend */}
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
                          onClick={handleResendOTP}
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
                    onClick={handleVerifyOTP}
                    disabled={loading || otpDigits.join('').length < 6}
                    className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white py-3 text-xs font-bold shadow-md transition-all disabled:opacity-50"
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                        </svg>
                        جاري التحقق...
                      </span>
                    ) : (
                      <>
                        <ShieldCheck className="h-4 w-4" />
                        <span>تأكيد الدخول بالرمز</span>
                      </>
                    )}
                  </button>

                  {/* Back button */}
                  <button
                    type="button"
                    onClick={() => { setPhoneStep('input'); setOtpDigits(['','','','','','']); setError(''); }}
                    className="w-full text-center text-xs text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 flex items-center justify-center gap-1"
                  >
                    <ArrowLeft className="h-3 w-3" />
                    تغيير رقم الهاتف
                  </button>
                </>
              )}
            </div>
          )}

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
