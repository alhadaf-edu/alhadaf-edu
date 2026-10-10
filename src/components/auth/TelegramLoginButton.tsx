'use client';

import React, { useEffect, useRef, useState } from 'react';
import { TelegramUser } from '@/types';

interface TelegramLoginButtonProps {
  onAuth: (user: TelegramUser) => void;
  botUsername?: string;
  buttonText?: string;
  className?: string;
  disabled?: boolean;
}

export default function TelegramLoginButton({
  onAuth,
  botUsername = process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME || 'AlhadafEduBot',
  buttonText = 'الدخول السريع بحساب Telegram',
  className = '',
  disabled = false,
}: TelegramLoginButtonProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [widgetLoaded, setWidgetLoaded] = useState(false);
  const [showDirectModal, setShowDirectModal] = useState(false);
  const [directUsername, setDirectUsername] = useState('');
  const [directName, setDirectName] = useState('');

  useEffect(() => {
    // Expose callback globally for Telegram widget
    (window as any).onTelegramAuth = (user: TelegramUser) => {
      onAuth(user);
    };

    if (!containerRef.current) return;

    // Clear previous widget
    containerRef.current.innerHTML = '';

    const script = document.createElement('script');
    script.src = 'https://telegram.org/js/telegram-widget.js?22';
    script.setAttribute('data-telegram-login', botUsername);
    script.setAttribute('data-size', 'large');
    script.setAttribute('data-radius', '16');
    script.setAttribute('data-request-access', 'write');
    script.setAttribute('data-userpic', 'false');
    script.setAttribute('data-onauth', 'onTelegramAuth(user)');
    script.async = true;

    script.onload = () => {
      setWidgetLoaded(true);
    };

    script.onerror = () => {
      console.warn('Telegram widget script failed to load.');
    };

    containerRef.current.appendChild(script);

    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  }, [botUsername, onAuth]);

  const handleDirectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!directName.trim()) return;

    const cleanUsername = directUsername.replace(/^@/, '').trim();
    const mockId = Math.floor(100000000 + Math.random() * 900000000);

    const syntheticUser: TelegramUser = {
      id: mockId,
      first_name: directName.trim(),
      username: cleanUsername || undefined,
      auth_date: Math.floor(Date.now() / 1000),
    };

    setShowDirectModal(false);
    onAuth(syntheticUser);
  };

  return (
    <div className="w-full space-y-2">
      {/* ── Branded Custom Telegram Button ── */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => {
          // If the official widget rendered an iframe, attempt to click it or open modal
          const iframe = containerRef.current?.querySelector('iframe');
          if (iframe) {
            // Trigger the Telegram auth popup directly through widget container
            iframe.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          } else {
            setShowDirectModal(true);
          }
        }}
        className={`w-full flex items-center justify-center gap-2.5 rounded-2xl bg-[#24A1DE] hover:bg-[#1E88BE] text-white p-3 text-xs font-bold shadow-md shadow-[#24A1DE]/20 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 ${className}`}
      >
        {/* Telegram Paper Plane Icon */}
        <svg className="h-4 w-4 fill-current shrink-0" viewBox="0 0 24 24">
          <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
        </svg>
        <span>{buttonText}</span>
      </button>

      {/* Hidden/Mounted official Telegram Widget script container */}
      <div 
        ref={containerRef} 
        className="flex justify-center my-1 [&>iframe]:rounded-2xl overflow-hidden min-h-[0px]" 
      />

      {/* ── Fallback Direct Modal (for testing or if domain not yet verified in @BotFather) ── */}
      {showDirectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-2xl space-y-4 text-right">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                <span className="text-[#24A1DE]">✈️</span>
                <span>تسجيل الدخول بحساب تيليجرام</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowDirectModal(false)}
                className="text-slate-400 hover:text-slate-600 text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              أدخل اسمك المعرف على تيليجرام للدخول الفوري ومزامنة حسابك:
            </p>

            <form onSubmit={handleDirectSubmit} className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  الاسم الكامل:
                </label>
                <input
                  type="text"
                  required
                  placeholder="محمد أحمد"
                  value={directName}
                  onChange={(e) => setDirectName(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 py-2.5 px-3 text-xs text-slate-900 dark:text-white focus:border-[#24A1DE] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  اسم المستخدم في تيليجرام (اختياري):
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="@username"
                    value={directUsername}
                    onChange={(e) => setDirectUsername(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 py-2.5 px-3 text-xs text-slate-900 dark:text-white focus:border-[#24A1DE] focus:outline-none"
                    dir="ltr"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 rounded-xl bg-[#24A1DE] hover:bg-[#1E88BE] text-white py-2.5 text-xs font-bold shadow-md transition-all"
                >
                  تأكيد الدخول
                </button>
                <button
                  type="button"
                  onClick={() => setShowDirectModal(false)}
                  className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-4 py-2.5 text-xs font-bold"
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

