'use client';

import React, { useEffect, useState } from 'react';
import { useAdSense } from '@/context/AdSenseContext';
import { Sparkles, Megaphone, ExternalLink, Award, ChevronLeft } from 'lucide-react';
import Link from 'next/link';

interface AdSenseSlotProps {
  slotType: 'headerBanner' | 'sidebarSticky' | 'inArticle' | 'preRollBanner' | 'footerBanner';
  slotId?: string;
  format?: 'auto' | 'fluid' | 'rectangle' | 'horizontal' | 'vertical';
  className?: string;
}

export default function AdSenseSlot({
  slotType,
  slotId = '1234567890',
  format = 'horizontal',
  className = '',
}: AdSenseSlotProps) {
  const { settings } = useAdSense();
  const [adLoaded, setAdLoaded] = useState(false);

  const isEnabled = settings[slotType];
  const publisherId = settings.adClient && settings.adClient !== 'ca-pub-0000000000000000'
    ? settings.adClient
    : 'ca-pub-2318347592935177';

  useEffect(() => {
    if (isEnabled && typeof window !== 'undefined') {
      try {
        ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
      } catch (e) {
        // Adsbygoogle initialization handled safely
      }

      // Check if Google AdSense inserted an ad iframe
      const checkAdTimer = setTimeout(() => {
        const ins = document.getElementById(`ad-ins-${slotType}`);
        if (ins && (ins.innerHTML.trim().length > 0 || ins.getAttribute('data-ad-status') === 'filled')) {
          setAdLoaded(true);
        }
      }, 1500);

      return () => clearTimeout(checkAdTimer);
    }
  }, [isEnabled, slotType]);

  if (!isEnabled) return null;

  // Render slim, animated smooth news/promotional ticker if AdSense has no ad filled yet or in header
  return (
    <div className={`my-2.5 overflow-hidden rounded-2xl border border-[#E0E3FD] dark:border-[#373261] bg-white/95 dark:bg-[#242045]/90 backdrop-blur-md shadow-tiqdr transition-all ${className}`}>
      
      {/* Top micro indicator bar */}
      <div className="flex items-center justify-between px-3.5 py-1 bg-[#F1F2FD]/80 dark:bg-[#1A1736]/60 border-b border-[#E0E3FD]/60 dark:border-[#373261]/60 text-[10px] font-bold text-[#697585] dark:text-[#B3ADE1]">
        <div className="flex items-center gap-1.5 text-[#4F5DE4] dark:text-[#aab5f5]">
          <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>إعلان ورعاية تعليمية معتمدة</span>
        </div>
        <div className="flex items-center gap-2">
          <span>Google AdSense</span>
          <span className="text-slate-300 dark:text-slate-600">•</span>
          <span className="font-mono text-[9px] text-slate-400">pub-2318347592935177</span>
        </div>
      </div>
      
      {/* Content Container (Standard Slim Banner Height: max ~90px, never stretched vertically) */}
      <div className="relative overflow-hidden min-h-[50px] sm:min-h-[60px] max-h-[90px] flex items-center justify-center p-1.5">
        
        {/* Google AdSense official <ins> slot */}
        <ins
          id={`ad-ins-${slotType}`}
          className="adsbygoogle"
          style={{ display: 'block', width: '100%', minHeight: '50px', maxHeight: '90px' }}
          data-ad-client={publisherId}
          data-ad-slot={slotId}
          data-ad-format="horizontal"
          data-full-width-responsive="true"
        />

        {/* Smooth dynamic educational sponsor ticker (Displays seamlessly and moves horizontally) */}
        {!adLoaded && (
          <div className="absolute inset-0 flex items-center bg-gradient-to-r from-[#F1F2FD]/90 via-white dark:from-[#242045]/95 dark:via-[#1A1736]/90 to-[#F1F2FD]/90 px-3 overflow-hidden select-none pointer-events-auto">
            
            {/* Label badge */}
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#4F5DE4] text-white text-xs font-black shrink-0 shadow-sm z-10 mr-2">
              <Megaphone className="h-3.5 w-3.5" />
              <span>شريك التميز</span>
            </div>

            {/* Smooth Infinite Marquee Stream */}
            <div className="flex-1 overflow-hidden relative">
              <div className="animate-marquee-rtl flex items-center gap-8 text-xs font-bold text-[#2A254D] dark:text-white">
                
                {/* Slide Item 1 */}
                <div className="flex items-center gap-2 shrink-0">
                  <span className="flex h-5 w-5 items-center justify-center rounded-lg bg-[#F57005]/20 text-[#F57005] font-black">⭐</span>
                  <span>منصة الهَدَّاف التعليمية — الشروحات النموذجية المعتمدة للمناهج السعودية والمصرية والعربية</span>
                </div>

                <span className="text-[#4F5DE4] opacity-50 shrink-0">•</span>

                {/* Slide Item 2 */}
                <div className="flex items-center gap-2 shrink-0">
                  <span className="flex h-5 w-5 items-center justify-center rounded-lg bg-[#4F5DE4]/20 text-[#4F5DE4] font-black">📚</span>
                  <span>مذكرات وملخصات PDF تفاعلية واختبارات تقييمية ذكية لكافة المراحل</span>
                </div>

                <span className="text-[#4F5DE4] opacity-50 shrink-0">•</span>

                {/* Slide Item 3 */}
                <div className="flex items-center gap-2 shrink-0">
                  <span className="flex h-5 w-5 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-600 font-black">🎓</span>
                  <span>أكثر من 50,000 طالب وطالبة يستعدون لاختبارات التحصيلي والقدرات ونهاية الفصل</span>
                </div>

                <span className="text-[#4F5DE4] opacity-50 shrink-0">•</span>

                {/* Slide Item 4 */}
                <div className="flex items-center gap-2 shrink-0">
                  <span className="flex h-5 w-5 items-center justify-center rounded-lg bg-[#F57005]/20 text-[#F57005] font-black">⚡</span>
                  <span>تابع قناة الهداف على YouTube لشروحات الدروس اليومية بجودة 4K</span>
                </div>

                {/* Duplicate set for seamless continuous loop */}
                <span className="text-[#4F5DE4] opacity-50 shrink-0">•</span>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="flex h-5 w-5 items-center justify-center rounded-lg bg-[#F57005]/20 text-[#F57005] font-black">⭐</span>
                  <span>منصة الهَدَّاف التعليمية — الشروحات النموذجية المعتمدة للمناهج السعودية والمصرية والعربية</span>
                </div>
                <span className="text-[#4F5DE4] opacity-50 shrink-0">•</span>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="flex h-5 w-5 items-center justify-center rounded-lg bg-[#4F5DE4]/20 text-[#4F5DE4] font-black">📚</span>
                  <span>مذكرات وملخصات PDF تفاعلية واختبارات تقييمية ذكية لكافة المراحل</span>
                </div>
              </div>
            </div>

            {/* Quick Action Button */}
            <Link
              href="/curriculum"
              className="hidden md:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#F57005] hover:bg-[#ea580c] text-white text-[11px] font-black transition-all shrink-0 z-10 ml-2 shadow-xs hover:scale-105"
            >
              <span>تصفح المواد</span>
              <ChevronLeft className="h-3 w-3" />
            </Link>
          </div>
        )}

      </div>
    </div>
  );
}
