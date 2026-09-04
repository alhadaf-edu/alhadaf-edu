'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
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
  const pathname = usePathname();
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  // Don't render general footer inside active live classroom
  const isInsideLiveRoom = pathname?.startsWith('/live-classes/') && pathname !== '/live-classes';
  if (isInsideLiveRoom) return null;

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

            <div className="flex flex-wrap items-center gap-2.5 pt-2">
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
                href="https://t.me/alhadaf_edu"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-600/10 text-sky-400 hover:bg-sky-500 hover:text-white transition-all shadow-sm"
                title="قناة التيليجرام الرسمية (@alhadaf_edu)"
              >
                <Send className="h-4 w-4" />
              </a>
              <a
                href="https://t.me/alhadaaf_edu"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600/10 text-blue-400 hover:bg-blue-500 hover:text-white transition-all shadow-sm"
                title="مجموعة أبطال الهداف على تيليجرام (@alhadaaf_edu)"
              >
                <div className="relative">
                  <Send className="h-4 w-4" />
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-400 rounded-full"></span>
                </div>
              </a>
              <a
                href="https://www.threads.com/@alhadaf_edu"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/5 text-slate-200 hover:bg-white hover:text-black transition-all shadow-sm"
                title="حساب ثريدز Threads (@alhadaf_edu)"
              >
                <svg className="h-4 w-4 fill-current" viewBox="0 0 192 192" aria-hidden="true">
                  <path d="M141.537 88.9883C140.71 88.5919 139.87 88.2104 139.019 87.8451C137.537 60.5382 122.616 44.905 97.5619 44.745C97.4484 44.7443 97.3355 44.7443 97.222 44.7443C82.2364 44.7443 69.7731 51.1409 62.102 62.7807L75.481 72.7303C80.7945 64.6684 88.3846 60.8354 97.227 60.8354C97.3072 60.8354 97.3879 60.8359 97.4687 60.8365C108.577 60.9069 119.227 67.5854 120.485 86.8521C113.626 86.3263 106.183 86.536 98.2435 87.4808C68.966 90.9663 50.8524 105.474 51.9868 126.96C52.5694 138.006 58.7493 147.241 68.3986 151.493C76.9944 155.281 87.5255 155.452 97.0425 151.954C109.845 147.247 118.064 137.747 122.428 122.753C128.665 131.258 136.93 135.539 146.467 135.539C146.758 135.539 147.05 135.535 147.342 135.526C159.278 135.163 167.337 127.346 168.804 114.736C170.528 99.9174 159.043 91.3195 141.537 88.9883ZM106.182 129.835C102.32 132.88 95.8239 134.809 88.9846 133.565C80.3705 131.998 75.9224 125.792 75.602 119.721C75.1432 110.978 82.2036 103.882 99.6455 101.806C104.99 101.17 110.222 100.999 115.304 101.277C113.886 117.818 109.912 126.883 106.182 129.835Z"/>
                </svg>
              </a>
              <a
                href="mailto:alhadaafpro@gmail.com"
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-600/10 text-gold-400 hover:bg-gold-500 hover:text-slate-950 transition-all shadow-sm"
                title="تواصل بالبريد الإلكتروني (alhadaafpro@gmail.com)"
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
