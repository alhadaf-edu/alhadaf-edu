'use client';

import React, { useEffect } from 'react';
import { useAdSense } from '@/context/AdSenseContext';

interface AdSenseSlotProps {
  slotType: 'headerBanner' | 'sidebarSticky' | 'inArticle' | 'preRollBanner' | 'footerBanner';
  slotId?: string;
  format?: 'auto' | 'fluid' | 'rectangle' | 'horizontal' | 'vertical';
  className?: string;
}

export default function AdSenseSlot({
  slotType,
  slotId = '1234567890',
  format = 'auto',
  className = '',
}: AdSenseSlotProps) {
  const { settings } = useAdSense();

  const isEnabled = settings[slotType];

  useEffect(() => {
    if (isEnabled && typeof window !== 'undefined') {
      try {
        ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
      } catch (e) {
        // Adsbygoogle initialization handled safely
      }
    }
  }, [isEnabled]);

  if (!isEnabled) return null;

  return (
    <div className={`my-4 overflow-hidden rounded-xl bg-slate-50/75 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 p-2 text-center transition-all ${className}`}>
      <div className="flex items-center justify-between px-2 pb-1 text-[11px] font-medium text-slate-400 dark:text-slate-500">
        <span>إعلان تعليمي</span>
        <span>Google AdSense</span>
      </div>
      
      {/* Real Ad Unit or Educational Sponsor Unit */}
      <div className="relative min-h-[90px] flex items-center justify-center rounded-lg bg-white/60 dark:bg-slate-800/50 p-2 shadow-inner">
        {settings.adClient && settings.adClient !== 'ca-pub-0000000000000000' ? (
          <ins
            className="adsbygoogle"
            style={{ display: 'block', minHeight: '90px', width: '100%' }}
            data-ad-client={settings.adClient}
            data-ad-slot={slotId}
            data-ad-format={format}
            data-full-width-responsive="true"
          />
        ) : (
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 text-slate-500 dark:text-slate-400 py-3">
            <div className="w-9 h-9 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-600 dark:text-amber-400 font-bold text-sm">
              🎯
            </div>
            <div className="text-center sm:text-right">
              <p className="text-xs font-bold text-slate-700 dark:text-slate-200">منصة الهداف - الشريك التعليمي المعتمد للمناهج السعودية</p>
              <p className="text-[11px] text-slate-500">انضم لأكثر من 50,000 طالب متفوق واستعد لاختبارات التحصيلي والقدرات</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
