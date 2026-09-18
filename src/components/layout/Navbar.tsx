'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';

import {
  Search,
  Sun,
  Moon,
  Menu,
  X,
  User as UserIcon,
  ShieldCheck,
  GraduationCap,
  Bookmark,
  LogOut,
  ChevronDown,
  Video,
  FileQuestion,
  Globe2,
  Info,
  Phone,
  Radio,
  BookOpen,
} from 'lucide-react';

import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { useLessons } from '@/context/LessonsContext';

import {
  ARAB_COUNTRIES,
  getStagesForCountry,
} from '@/lib/curriculumData';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();

  const { user, profile, isAdmin, isModerator, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { selectedCountry, setSelectedCountry } = useLessons();

  const canAccessAdmin = isAdmin || isModerator;

  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const [countryOpen, setCountryOpen] = useState(false);
  const [curriculumOpen, setCurriculumOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [scrolled, setScrolled] = useState(false);

  const searchRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);
  const countryRef = useRef<HTMLDivElement>(null);

  /* ─── Current country ─── */
  const currentCountry =
    ARAB_COUNTRIES.find((c) => c.code === selectedCountry) || ARAB_COUNTRIES[0];
  const stages = getStagesForCountry(selectedCountry);

  const countryName = currentCountry.name
    .replace('المملكة العربية ', '')
    .replace('جمهورية ', '')
    .replace('دولة ', '')
    .replace('سلطنة ', '');

  /* ─── Scroll shadow ─── */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  /* ─── Close all menus on route change ─── */
  useEffect(() => {
    setMenuOpen(false);
    setSearchOpen(false);
    setUserOpen(false);
    setCountryOpen(false);
    setCurriculumOpen(false);
  }, [pathname]);

  /* ─── Outside click ─── */
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const t = e.target as Node;
      if (searchRef.current && !searchRef.current.contains(t)) setSearchOpen(false);
      if (userRef.current && !userRef.current.contains(t)) setUserOpen(false);
      if (countryRef.current && !countryRef.current.contains(t)) setCountryOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  /* ─── Search ─── */
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchQuery.trim();
    if (!q) return;
    router.push(`/search?q=${encodeURIComponent(q)}`);
    setSearchQuery('');
    setSearchOpen(false);
  };

  const isActive = (href: string) =>
    pathname === href || (href !== '/' && pathname.startsWith(href));

  /* ─── Menu links (shown in hamburger drawer) ─── */
  const menuLinks = [
    { name: 'المناهج الدراسية', href: '/curriculum', icon: GraduationCap },
    { name: 'مكتبة الفيديو',    href: '/videos',     icon: Video          },
    { name: 'بنك الاختبارات',  href: '/quizzes',    icon: FileQuestion   },
    { name: 'المقالات',         href: '/blog',        icon: BookOpen       },
    { name: 'من نحن',           href: '/about',       icon: Info           },
    { name: 'تواصل معنا',       href: '/contact',     icon: Phone          },
  ];

  /* ══════════════════════════════════════════════
     RENDER
  ══════════════════════════════════════════════ */
  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        scrolled
          ? 'bg-white/95 dark:bg-[#1A1736]/95 backdrop-blur-xl shadow-lg border-b border-[#E0E3FD] dark:border-[#373261]'
          : 'bg-white/90 dark:bg-[#1A1736]/90 backdrop-blur-md border-b border-[#E0E3FD]/70 dark:border-[#242045]'
      }`}
    >
      {/* ── Inner container ── */}
      <div className="mx-auto flex w-full max-w-[1440px] items-center gap-2 px-3 sm:px-4 lg:px-6 h-16 sm:h-[72px]">

        {/* ════════════════════════════════
            LOGO + BRAND
        ════════════════════════════════ */}
        <Link href="/" className="flex shrink-0 items-center gap-2 sm:gap-3 group">
          <div className="relative flex h-10 w-10 sm:h-12 sm:w-12 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-[#4F5DE4]/20 bg-[#F1F2FD] dark:bg-[#242045] shadow-sm p-1.5 transition-transform duration-300 group-hover:scale-105">
            <Image
              src="/logo.png"
              alt="شعار منصة الهَدَّاف"
              width={48}
              height={48}
              priority
              className="object-contain"
            />
          </div>
          <div className="hidden xs:flex flex-col min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-base sm:text-lg lg:text-xl font-black tracking-tight text-[#2A254D] dark:text-white font-heading whitespace-nowrap">
                الهَدَّاف
              </span>
              <span className="hidden sm:inline-flex rounded-md bg-[#4F5DE4]/10 text-[#4F5DE4] dark:bg-[#4F5DE4]/20 dark:text-[#aab5f5] px-1.5 py-0.5 text-[9px] sm:text-[10px] font-black border border-[#4F5DE4]/20">
                التعليمي
              </span>
            </div>
            <span className="hidden md:flex items-center gap-1 text-[9px] lg:text-[10px] font-semibold text-[#697585] dark:text-[#B3ADE1] leading-tight">
              <span>{currentCountry.flag}</span>
              <span>مناهج {countryName}</span>
            </span>
          </div>
        </Link>

        {/* ════════════════════════════════
            ALWAYS-VISIBLE NAV LINKS
            الرئيسية + الحصص المباشرة فقط
        ════════════════════════════════ */}
        <nav className="flex min-w-0 flex-1 items-center justify-center gap-1 sm:gap-2 overflow-hidden">
          {/* الرئيسية */}
          <Link
            href="/"
            className={`flex shrink-0 items-center justify-center rounded-xl px-2 sm:px-3 lg:px-4 py-2 text-[11px] sm:text-xs lg:text-sm font-bold whitespace-nowrap transition-all ${
              isActive('/')
                ? 'bg-[#F1F2FD] dark:bg-[#242045] text-[#4F5DE4] dark:text-[#aab5f5] border border-[#4F5DE4]/20'
                : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            الرئيسية
          </Link>

          {/* 🔴 الحصص المباشرة */}
          <Link
            href="/live-classes"
            className={`flex shrink-0 items-center gap-1.5 rounded-xl px-2 sm:px-3 lg:px-4 py-2 text-[11px] sm:text-xs lg:text-sm font-bold whitespace-nowrap transition-all ${
              isActive('/live-classes')
                ? 'bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/40'
                : 'text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30'
            }`}
          >
            <Radio className="h-4 w-4 shrink-0" />
            <span className="hidden sm:inline">الحصص المباشرة</span>
            <span className="sm:hidden">مباشر</span>
          </Link>
        </nav>

        {/* ════════════════════════════════
            RIGHT-SIDE ACTIONS
        ════════════════════════════════ */}
        <div className="flex shrink-0 items-center gap-1 sm:gap-1.5">

          {/* ── Search ── */}
          <div ref={searchRef} className="relative">
            {searchOpen && (
              <form
                onSubmit={handleSearch}
                className="absolute right-0 top-full mt-2 z-[100] flex w-[calc(100vw-1rem)] max-w-[360px] items-center gap-2 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-2 shadow-2xl animate-fade-in"
              >
                <input
                  autoFocus
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="ابحث عن درس أو مادة..."
                  className="min-w-0 flex-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2.5 text-xs text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#4F5DE4]"
                />
                <button
                  type="submit"
                  aria-label="تنفيذ البحث"
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#4F5DE4] text-white hover:bg-[#3d49cb] transition-colors"
                >
                  <Search className="h-4 w-4" />
                </button>
              </form>
            )}
            <button
              type="button"
              onClick={() => setSearchOpen(!searchOpen)}
              aria-label="البحث"
              title="البحث"
              className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
            >
              {searchOpen ? <X className="h-4 w-4" /> : <Search className="h-4 w-4" />}
            </button>
          </div>

          {/* ── Theme Toggle ── */}
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={theme === 'dark' ? 'تفعيل الوضع النهاري' : 'تفعيل الوضع الليلي'}
            title={theme === 'dark' ? 'الوضع النهاري' : 'الوضع الليلي'}
            className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-yellow-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
          >
            {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>

          {/* ── Admin Link (للمشرف فقط) ── */}
          {canAccessAdmin && (
            <Link
              href="/admin"
              title={isAdmin ? 'لوحة الإدارة' : 'لوحة المشرف'}
              aria-label="لوحة الإدارة"
              className="flex h-9 w-9 sm:h-10 sm:w-10 lg:w-auto items-center justify-center gap-1.5 rounded-xl bg-[#4F5DE4] px-0 lg:px-3 text-white font-bold text-xs shadow-md hover:bg-[#3d49cb] transition-all"
            >
              <ShieldCheck className="h-4 w-4" />
              <span className="hidden lg:inline">لوحة الإدارة</span>
            </Link>
          )}

          {/* ── User Dropdown (عند تسجيل الدخول) ── */}
          {user && (
            <div ref={userRef} className="relative">
              <button
                type="button"
                onClick={() => setUserOpen(!userOpen)}
                aria-label="حسابي"
                aria-expanded={userOpen}
                className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl border border-[#E0E3FD] dark:border-[#373261] bg-[#F1F2FD] dark:bg-[#242045] text-[#4F5DE4] transition-all"
              >
                <UserIcon className="h-4 w-4" />
              </button>

              {userOpen && (
                <div className="absolute left-0 top-full mt-2 z-[100] w-60 rounded-2xl border border-[#E0E3FD] dark:border-[#373261] bg-white dark:bg-[#242045] p-2 shadow-2xl animate-fade-in">
                  <div className="border-b border-slate-100 dark:border-slate-800 px-3 py-2.5">
                    <p className="truncate text-xs font-black text-slate-900 dark:text-white">
                      {profile?.displayName || 'حسابي'}
                    </p>
                    <p className="mt-0.5 truncate text-[10px] text-slate-400">
                      {profile?.email}
                    </p>
                  </div>
                  <div className="mt-1 space-y-0.5">
                    <Link
                      href="/profile"
                      className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      <UserIcon className="h-4 w-4" />
                      الملف الشخصي
                    </Link>
                    <Link
                      href="/profile?tab=saved"
                      className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      <Bookmark className="h-4 w-4" />
                      الدروس المحفوظة
                    </Link>
                    {canAccessAdmin && (
                      <Link
                        href="/admin"
                        className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-xs font-bold text-[#4F5DE4] hover:bg-[#F1F2FD] dark:hover:bg-[#1A1736]"
                      >
                        <ShieldCheck className="h-4 w-4" />
                        {isAdmin ? 'لوحة الإدارة' : 'لوحة المشرف'}
                      </Link>
                    )}
                    <button
                      type="button"
                      onClick={() => { setUserOpen(false); logout(); }}
                      className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-xs font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                    >
                      <LogOut className="h-4 w-4" />
                      تسجيل الخروج
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── Hamburger (يظهر في جميع الشاشات) ── */}
          <button
            type="button"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="فتح القائمة"
            aria-expanded={menuOpen}
            className={`flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl border transition-all ${
              menuOpen
                ? 'border-[#4F5DE4] bg-[#4F5DE4] text-white'
                : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>

        </div>{/* end right actions */}
      </div>{/* end inner container */}

      {/* ══════════════════════════════════════════════
          HAMBURGER DRAWER
          يظهر في جميع الشاشات عند الضغط على ☰
      ══════════════════════════════════════════════ */}
      {menuOpen && (
        <div className="absolute left-0 right-0 top-full z-[90] border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-[#15132d] shadow-2xl animate-fade-in">
          <div className="mx-auto w-full max-w-[1440px] px-3 py-4 sm:px-6 lg:py-5">

            {/* ── Drawer Header ── */}
            <div className="mb-4 flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
                  قائمة منصة الهَدَّاف
                </h3>
                <p className="mt-0.5 text-[10px] sm:text-xs text-slate-400">
                  جميع خدمات وروابط المنصة
                </p>
              </div>
              <button
                type="button"
                onClick={() => setMenuOpen(false)}
                className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* ── Links Grid ── */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-2">
              {menuLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`group flex items-center gap-3 rounded-2xl border p-3 transition-all ${
                      isActive(link.href)
                        ? 'border-[#4F5DE4]/30 bg-[#F1F2FD] dark:bg-[#242045] text-[#4F5DE4] dark:text-[#aab5f5]'
                        : 'border-slate-100 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:border-[#4F5DE4]/30 hover:bg-[#F8F8FF] dark:hover:bg-[#242045]'
                    }`}
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#F1F2FD] dark:bg-[#1A1736] text-[#4F5DE4] transition-transform group-hover:scale-105">
                      <Icon className="h-4 w-4" />
                    </div>
                    <span className="text-xs font-bold">{link.name}</span>
                  </Link>
                );
              })}
            </div>

            {/* ── Curriculum / Stages Accordion ── */}
            <div className="mt-4 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden">
              <button
                type="button"
                onClick={() => setCurriculumOpen(!curriculumOpen)}
                className="flex w-full items-center justify-between px-4 py-3 text-right text-xs font-black text-slate-800 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-900"
              >
                <span className="flex items-center gap-2">
                  <GraduationCap className="h-4 w-4 text-[#4F5DE4]" />
                  المناهج والمراحل الدراسية
                </span>
                <ChevronDown
                  className={`h-4 w-4 text-slate-400 transition-transform ${curriculumOpen ? 'rotate-180' : ''}`}
                />
              </button>

              {curriculumOpen && (
                <div className="border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 p-2">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1">
                    {stages.map((stage) => (
                      <Link
                        key={stage.id}
                        href={`/curriculum?stage=${stage.id}`}
                        className="flex items-center justify-between rounded-xl px-3 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-800"
                      >
                        <span>{stage.name}</span>
                        <span className="text-[10px] text-slate-400">{stage.gradesCount} صفوف</span>
                      </Link>
                    ))}
                  </div>
                  <Link
                    href="/curriculum"
                    className="mt-2 flex items-center justify-center rounded-xl bg-[#4F5DE4] px-4 py-2.5 text-xs font-bold text-white hover:bg-[#3d49cb]"
                  >
                    عرض جميع المناهج
                  </Link>
                </div>
              )}
            </div>

            {/* ── Country Switcher (Admin only) ── */}
            {isAdmin && (
              <div
                ref={countryRef}
                className="mt-4 rounded-2xl border border-[#4F5DE4]/20 bg-[#F1F2FD]/50 dark:bg-[#242045]/50 p-3"
              >
                <button
                  type="button"
                  onClick={() => setCountryOpen(!countryOpen)}
                  className="flex w-full items-center justify-between"
                >
                  <span className="flex items-center gap-2 text-xs font-black text-[#4F5DE4] dark:text-[#aab5f5]">
                    <Globe2 className="h-4 w-4" />
                    تبديل المنهج / الدولة
                  </span>
                  <ChevronDown
                    className={`h-4 w-4 text-slate-400 transition-transform ${countryOpen ? 'rotate-180' : ''}`}
                  />
                </button>

                {countryOpen && (
                  <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2">
                    {ARAB_COUNTRIES.map((country) => (
                      <button
                        key={country.code}
                        type="button"
                        onClick={() => {
                          setSelectedCountry(country.code);
                          setCountryOpen(false);
                        }}
                        className={`flex flex-col items-center justify-center gap-1 rounded-xl border p-2.5 text-[10px] font-bold transition-all ${
                          selectedCountry === country.code
                            ? 'border-[#4F5DE4] bg-white dark:bg-[#1A1736] text-[#4F5DE4]'
                            : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-[#4F5DE4]/40'
                        }`}
                      >
                        <span className="text-xl">{country.flag}</span>
                        <span className="text-center">
                          {country.name
                            .replace('المملكة العربية ', '')
                            .replace('جمهورية ', '')
                            .replace(' الأردنية الهاشمية', '')
                            .replace(' العربية المتحدة', '')
                            .replace('مناهج ومهارات عربية عامة', 'عام')}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ── Login / Register (عند عدم تسجيل الدخول) ── */}
            {!user && (
              <div className="mt-4 flex flex-col sm:flex-row gap-2">
                <Link
                  href="/auth/login"
                  className="flex flex-1 items-center justify-center rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  تسجيل الدخول
                </Link>
                <Link
                  href="/auth/register"
                  className="flex flex-1 items-center justify-center rounded-xl bg-[#F57005] px-4 py-2.5 text-xs font-bold text-white hover:bg-[#ea580c]"
                >
                  إنشاء حساب
                </Link>
              </div>
            )}

          </div>
        </div>
      )}
    </header>
  );
}
