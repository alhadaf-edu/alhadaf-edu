'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  Sparkles, 
  Send, 
  CheckCircle2, 
  ExternalLink, 
  Youtube, 
  Twitter, 
  Mail, 
  MapPin,
  GraduationCap
} from 'lucide-react';
import IslamicPattern from './IslamicPattern';
import AdSenseSlot from '../common/AdSenseSlot';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail('');
      setTimeout(() => setSubscribed(false), 5000);
    }
  };

  return (
    <footer className="relative mt-20 border-t border-[#E0E3FD] dark:border-[#373261] bg-[#1A1736] text-[#B3ADE1] overflow-hidden">
      {/* Footer Top: Newsletter Banner */}
      <div className="relative border-b border-[#242045] bg-[#242045]/80 py-10 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-center md:text-right max-w-xl">
            <h3 className="text-xl sm:text-2xl font-black text-white flex items-center justify-center md:justify-start gap-2 font-heading">
              <Sparkles className="h-6 w-6 text-[#F57005]" />
              <span>اشترك في نشرة "الْهَدَّاف" التعليمية</span>
            </h3>
            <p className="mt-1.5 text-xs sm:text-sm text-[#d0d5f9] leading-relaxed">
              احصل على ملخصات الدروس، نماذج الاختبارات، وتجميعات التحصيلي والقدرات فور صدورها مباشرة إلى بريدك الإلكتروني.
            </p>
          </div>

          <form onSubmit={handleSubscribe} className="w-full md:w-auto flex-1 max-w-md">
            <div className="relative flex items-center">
              <input
                type="email"
                required
                placeholder="أدخل بريدك الإلكتروني..."
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-2xl border border-[#4F5DE4]/30 bg-[#1A1736] py-3 pr-4 pl-28 text-xs sm:text-sm text-white placeholder-[#697585] focus:border-[#F57005] focus:outline-none focus:ring-1 focus:ring-[#F57005]"
              />
              <button
                type="submit"
                className="absolute left-1.5 flex items-center gap-1.5 rounded-xl bg-[#F57005] hover:bg-[#ea580c] text-white px-4 py-2 text-xs font-bold transition-all shadow-md"
              >
                <span>اشتراك</span>
                <Send className="h-3.5 w-3.5" />
              </button>
            </div>
            {subscribed && (
              <p className="mt-2 text-xs text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>شكراً لاشتراكك! ستصلك رسائلنا الدورية قريباً.</span>
              </p>
            )}
          </form>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          
          {/* Column 1: Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-[#4F5DE4]/40 bg-[#242045] p-1 shadow-sm">
                <Image
                  src="/logo.png"
                  alt="شعار منصة الهَدَّاف"
                  width={48}
                  height={48}
                  className="object-contain"
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-black text-white font-heading">
                  الهَدَّاف
                </span>
                <span className="rounded-lg bg-[#4F5DE4]/20 text-[#aab5f5] px-2 py-0.5 text-xs font-black border border-[#4F5DE4]/30">
                  التعليمي
                </span>
              </div>
            </div>

            <p className="text-xs sm:text-sm leading-relaxed text-[#B3ADE1]">
              المنصة الرائدة في تقديم الشروحات المرئية والملخصات والاختبارات التفاعلية للمناهج الدراسية الرسمية في الوطن العربي (مصر، السعودية، الإمارات، الكويت، الأردن، وغيرها)، مساندين للطلاب في تحقيق التميز والدرجات الكاملة.
            </p>

            <div className="flex items-center gap-3 pt-2">
              <a
                href="https://www.youtube.com/channel/UCb9BGNPlPd2dzg9lJsIaFYQ"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-600/10 text-red-500 hover:bg-red-600 hover:text-white transition-all"
                title="قناة الهداف على YouTube"
              >
                <Youtube className="h-4 w-4" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-600/10 text-sky-400 hover:bg-sky-500 hover:text-white transition-all"
                title="حساب المنصة على X"
              >
                <Twitter className="h-4 w-4" />
              </a>
              <a
                href="https://telegram.org"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600/10 text-blue-400 hover:bg-blue-500 hover:text-white transition-all"
                title="قناة التيليجرام"
              >
                <Send className="h-4 w-4" />
              </a>
              <a
                href="mailto:alhadaafpro@gmail.com"
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-600/10 text-gold-400 hover:bg-gold-500 hover:text-slate-950 transition-all"
                title="تواصل بالبريد الإلكتروني"
              >
                <Mail className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Column 2: Stages */}
          <div>
            <h4 className="text-sm font-black text-white mb-4 border-r-2 border-gold-500 pr-2">
              المراحل التعليمية
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li>
                <Link href="/curriculum?stage=elementary" className="hover:text-gold-400 transition-colors">
                  المرحلة الابتدائية (1 - 6)
                </Link>
              </li>
              <li>
                <Link href="/curriculum?stage=middle" className="hover:text-gold-400 transition-colors">
                  المرحلة المتوسطة (1 - 3)
                </Link>
              </li>
              <li>
                <Link href="/curriculum?stage=secondary" className="hover:text-gold-400 transition-colors">
                  المرحلة الثانوية (مسارات)
                </Link>
              </li>
              <li>
                <Link href="/quizzes" className="hover:text-gold-400 transition-colors">
                  بنك الاختبارات والتحصيلي
                </Link>
              </li>
              <li>
                <Link href="/videos" className="hover:text-gold-400 transition-colors">
                  قوائم تشغيل YouTube
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Quick Links */}
          <div>
            <h4 className="text-sm font-black text-white mb-4 border-r-2 border-gold-500 pr-2">
              روابط سريعة
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li>
                <Link href="/about" className="hover:text-gold-400 transition-colors">
                  عن منصة الْهَدَّاف
                </Link>
              </li>
              <li>
                <Link href="/blog" className="hover:text-gold-400 transition-colors">
                  المقالات والنصائح الدراسية
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-gold-400 transition-colors">
                  الأسئلة الشائعة (FAQ)
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-gold-400 transition-colors">
                  تواصل معنا والدعم الفني
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-gold-400 transition-colors">
                  سياسة الخصوصية
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-gold-400 transition-colors">
                  شروط الاستخدام
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Saudi Portals */}
          <div>
            <h4 className="text-sm font-black text-white mb-4 border-r-2 border-gold-500 pr-2">
              بوابات تعليمية رسمية
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li>
                <a href="https://moe.gov.sa" target="_blank" rel="noopener noreferrer" className="flex items-center justify-between hover:text-gold-400 transition-colors">
                  <span>وزارة التعليم السعودية</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              </li>
              <li>
                <a href="https://schools.madrasati.sa" target="_blank" rel="noopener noreferrer" className="flex items-center justify-between hover:text-gold-400 transition-colors">
                  <span>منصة مدرستي</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              </li>
              <li>
                <a href="https://qiyas.etec.gov.sa" target="_blank" rel="noopener noreferrer" className="flex items-center justify-between hover:text-gold-400 transition-colors">
                  <span>المركز الوطني للقياس</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              </li>
              <li>
                <a href="https://noor.moe.gov.sa" target="_blank" rel="noopener noreferrer" className="flex items-center justify-between hover:text-gold-400 transition-colors">
                  <span>نظام نور المركزي</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              </li>
            </ul>
          </div>

        </div>

        {/* Footer Ad */}
        <div className="mt-8">
          <AdSenseSlot slotType="footerBanner" />
        </div>

        {/* Bottom Line */}
        <div className="mt-8 border-t border-slate-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>
            جميع الحقوق محفوظة لمنصة الْهَدَّاف التعليمية © {new Date().getFullYear()} م
          </p>
          <div className="flex items-center gap-1 text-slate-400">
            <span>صُنعت بكل فخر لدعم أجيال المستقبل في المملكة العربية السعودية 🇸🇦</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
