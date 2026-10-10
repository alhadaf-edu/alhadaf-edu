'use client';

import React, { useEffect, useRef, useState } from 'react';
import { TelegramUser } from '@/types';

interface TelegramLoginButtonProps {
  onAuth: (user: TelegramUser) => void;
  botUsername?: string;
  buttonText?: string;
  className?: string;
  disabled?: boolean;
  mode?: 'login' | 'register';
}

/**
 * Deterministically hash an identifier (phone number or telegram username)
 * into a consistent positive integer so the user always logs into the same account.
 */
function generateDeterministicTelegramId(input: string): number {
  const clean = input.toLowerCase().replace(/[@\s\-\+\(\)]/g, '').trim();
  let hash = 5381;
  for (let i = 0; i < clean.length; i++) {
    hash = ((hash << 5) + hash) + clean.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash % 899999999) + 100000000;
}

export default function TelegramLoginButton({
  onAuth,
  botUsername = process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME || 'AlhadafEduBot',
  buttonText = 'الدخول السريع بحساب Telegram',
  className = '',
  disabled = false,
  mode = 'login',
}: TelegramLoginButtonProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [showModal, setShowModal] = useState(false);
  const [identifier, setIdentifier] = useState('');
  const [fullName, setFullName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Also listen for official widget callbacks if loaded
  useEffect(() => {
    (window as any).onTelegramAuth = (user: TelegramUser) => {
      setShowModal(false);
      onAuth(user);
    };

    if (!containerRef.current) return;
    containerRef.current.innerHTML = '';

    try {
      const script = document.createElement('script');
      script.src = 'https://telegram.org/js/telegram-widget.js?22';
      script.setAttribute('data-telegram-login', botUsername);
      script.setAttribute('data-size', 'medium');
      script.setAttribute('data-radius', '12');
      script.setAttribute('data-request-access', 'write');
      script.setAttribute('data-userpic', 'false');
      script.setAttribute('data-onauth', 'onTelegramAuth(user)');
      script.async = true;
      containerRef.current.appendChild(script);
    } catch {}

    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  }, [botUsername, onAuth]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const cleanInput = identifier.trim();
    if (!cleanInput) {
      setError('يرجى إدخال رقم الهاتف أو اسم المستخدم على تيليجرام.');
      return;
    }

    if (mode === 'register' && !fullName.trim()) {
      setError('يرجى إدخال اسمك الكامل.');
      return;
    }

    setSubmitting(true);

    try {
      const isUsername = cleanInput.startsWith('@') || !/^\+?[0-9\s\-]+$/.test(cleanInput);
      const cleanUsername = cleanInput.replace(/^@/, '').trim();
      const detId = generateDeterministicTelegramId(cleanInput);

      const displayName = fullName.trim() || (isUsername ? cleanUsername : `طالب ${cleanInput.slice(-4)}`);

      const syntheticUser: TelegramUser = {
        id: detId,
        first_name: displayName,
        username: isUsername ? cleanUsername : undefined,
        auth_date: Math.floor(Date.now() / 1000),
      };

      // Store phone number into localStorage if it was a phone number
      if (!isUsername && typeof window !== 'undefined') {
        try {
          localStorage.setItem('alhadaf_tg_phone', cleanInput.replace(/[\s\-]/g, ''));
        } catch {}
      }

      setShowModal(false);
      onAuth(syntheticUser);
    } catch (err: any) {
      setError('حدث خطأ أثناء معالجة البيانات، حاول مرة أخرى.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full">
      {/* ── Branded Custom Telegram Button ── */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => {
          setError('');
          setShowModal(true);
        }}
        className={`w-full flex items-center justify-center gap-2.5 rounded-2xl bg-[#24A1DE] hover:bg-[#1E88BE] text-white p-3 text-xs font-bold shadow-md shadow-[#24A1DE]/20 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 cursor-pointer ${className}`}
      >
        {/* Telegram Paper Plane Icon */}
        <svg className="h-4 w-4 fill-current shrink-0" viewBox="0 0 24 24">
          <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
        </svg>
        <span>{buttonText}</span>
      </button>

      {/* ── Interactive Modal for Instant Telegram / Phone Login ── */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div 
            className="w-full max-w-md rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-2xl space-y-4 text-right animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#24A1DE]/10 text-[#24A1DE]">
                  <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24">
                    <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                  </svg>
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900 dark:text-white">
                    {mode === 'register' ? 'إنشاء حساب عبر Telegram / الهاتف' : 'تسجيل الدخول عبر Telegram / الهاتف'}
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    دخول سريع ومجاني بدون انتظار رمز SMS
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                aria-label="إغلاق"
              >
                ✕
              </button>
            </div>

            {/* Error banner */}
            {error && (
              <div className="rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 p-2.5 text-xs text-rose-600 dark:text-rose-400">
                {error}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-3.5">
              {mode === 'register' && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    الاسم الكامل: <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="محمد أحمد علي"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 py-2.5 px-3 text-xs text-slate-900 dark:text-white focus:border-[#24A1DE] focus:outline-none"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  رقم الهاتف أو معرّف تيليجرام: <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="01012345678 أو @username"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 py-2.5 px-3 text-xs text-slate-900 dark:text-white focus:border-[#24A1DE] focus:outline-none"
                  dir="ltr"
                />
                <p className="mt-1 text-[10px] text-slate-500 dark:text-slate-400">
                  يمكنك كتابة رقم هاتفك أو اسم مستخدم تيليجرام الخاص بك للدخول إلى حسابك في أي وقت.
                </p>
              </div>

              {/* Optional widget container (if bot verified) */}
              <div ref={containerRef} className="flex justify-center overflow-hidden min-h-[0px]" />

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 rounded-xl bg-[#24A1DE] hover:bg-[#1E88BE] text-white py-2.5 text-xs font-bold shadow-md shadow-[#24A1DE]/25 transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                >
                  {submitting ? (
                    <span>جاري تسجيل الدخول...</span>
                  ) : (
                    <>
                      <span>{mode === 'register' ? 'إنشاء الحساب الآن' : 'تسجيل الدخول الآن'}</span>
                      <span>←</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-750 text-slate-600 dark:text-slate-300 px-4 py-2.5 text-xs font-bold transition-colors cursor-pointer"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
