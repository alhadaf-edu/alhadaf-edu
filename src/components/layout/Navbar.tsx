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
  HelpCircle,
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
  const [aboutOpen, setAboutOpen] = useState(false);
  const [curriculumOpen, setCurriculumOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [scrolled, setScrolled] = useState(false);

  const searchRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);
  const countryRef = useRef<HTMLDivElement>(null);
  const aboutRef = useRef<HTMLDivElement>(null);

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
    setAboutOpen(false);
    setCurriculumOpen(false);
  }, [pathname]);

  /* ─── Outside click handler ─── */
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const t = e.target as Node;
      if (searchRef.current && !searchRef.current.contains(t)) setSearchOpen(false);
      if (userRef.current && !userRef.current.contains(t)) setUserOpen(false);
      if (countryRef.current && !countryRef.current.contains(t)) setCountryOpen(false);
      if (aboutRef.current && !aboutRef.current.contains(t)) setAboutOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  /* ─── Search submit ─── */
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

  const isAboutActive = pathname === '/about' || pathname === '/contact';

  /* ─── All links for mobile drawer ─── */
  const mobileMenuLinks = [
    { name: 'الرئيسية',         href: '/',             icon: null,          highlight: false },
    { name: 'الحصص المباشرة',   href: '/live-classes', icon: Radio,         highlight: true  },
    { name: 'المناهج الدراسية', href: '/curriculum',   icon: GraduationCap, highlight: false },
    { name: 'بنك الاختبارات',  href: '/quizzes',      icon: FileQuestion,  highlight: false },
    { name: 'مكتبة الفيديو',    href: '/videos',       icon: Video,         highlight: false },
    { name: 'المقالات',         href: '/blog',          icon: BookOpen,      highlight: false },
    { name: 'من نحن',           href: '/about',         icon: Info,          highlight: false },
    { name: 'تواصل معنا',       href: '/contact',       icon: Phone,         highlight: false },
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
      <div className="mx-auto flex w-full max-w-[1440px] items-center justify-between gap-2 lg:gap-3 px-3 sm:px-4 lg:px-4 xl:px-6 h-16 sm:h-[72px]">

        {/* ════════════════════════════════
            LOGO + BRAND
        ════════════════════════════════ */}
        <Link href="/" className="flex shrink-0 items-center gap-2 sm:gap-2.5 group">
          <div className="relative flex h-9 w-9 sm:h-10 sm:w-10 xl:h-11 xl:w-11 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-[#4F5DE4]/20 bg-[#F1F2FD] dark:bg-[#242045] shadow-xs p-1 transition-transform duration-200 group-hover:scale-105">
            <Image
              src="/logo.png"
              alt="شعار منصة الهَدَّاف"
              width={42}
              height={42}
              priority
              className="object-contain"
            />
          </div>
          <div className="hidden xs:flex flex-col min-w-0">
            <div className="flex items-center gap-1.5">
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-1 sm:gap-1.5">
              <span className="text-base sm:text-lg xl:text-xl font-black tracking-tight text-[#2A254D] dark:text-white font-heading whitespace-nowrap">
                الهَدَّاف
              </span>
              <span className="hidden xl:inline-flex rounded-md bg-[#4F5DE4]/10 text-[#4F5DE4] dark:bg-[#4F5DE4]/20 dark:text-[#aab5f5] px-1.5 py-0.5 text-[9px] font-black border border-[#4F5DE4]/20">
              <span className="inline-flex rounded-md bg-[#4F5DE4]/10 text-[#4F5DE4] dark:bg-[#4F5DE4]/20 dark:text-[#aab5f5] px-1.5 py-0.5 text-[9px] sm:text-[10px] font-black border border-[#4F5DE4]/20 whitespace-nowrap">
                التعليمي
              </span>
            </div>
            <span className="hidden 2xl:flex items-center gap-1 text-[9px] font-semibold text-[#697585] dark:text-[#B3ADE1] leading-tight">
            <span className="hidden sm:flex items-center gap-1 text-[9px] font-semibold text-[#697585] dark:text-[#B3ADE1] leading-tight mt-0.5">
              <span>{currentCountry.flag}</span>
              <span>مناهج {countryName}</span>
            </span>
          </div>
        </Link>

        {/* ════════════════════════════════
            DESKTOP NAVIGATION (تظهر في الكمبيوتر فقط)
            أحجام دقيقة ومسافات متناسقة لمنع أي تداخل
        ════════════════════════════════ */}
        <nav className="hidden lg:flex items-center gap-0.5 xl:gap-1 2xl:gap-1.5 p-1 rounded-2xl bg-slate-100/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 shrink-0">
          
          {/* 1. الرئيسية */}
          <Link
            href="/"
            className={`flex items-center shrink-0 gap-1 px-2 py-1.5 xl:px-2.5 xl:py-1.5 2xl:px-3 2xl:py-2 text-[11px] xl:text-xs 2xl:text-[13px] font-bold rounded-xl transition-all whitespace-nowrap border ${
              isActive('/')
                ? 'bg-white dark:bg-[#242045] text-[#4F5DE4] dark:text-[#aab5f5] border-[#4F5DE4]/40 shadow-xs'
                : 'text-slate-600 dark:text-slate-300 border-transparent hover:border-slate-200 dark:hover:border-slate-700 hover:bg-white/80 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <span>الرئيسية</span>
          </Link>

          {/* 2. المناهج الدراسية */}
          <Link
            href="/curriculum"
            className={`flex items-center shrink-0 gap-1 px-2 py-1.5 xl:px-2.5 xl:py-1.5 2xl:px-3 2xl:py-2 text-[11px] xl:text-xs 2xl:text-[13px] font-bold rounded-xl transition-all whitespace-nowrap border ${
              isActive('/curriculum')
                ? 'bg-white dark:bg-[#242045] text-[#4F5DE4] dark:text-[#aab5f5] border-[#4F5DE4]/40 shadow-xs'
                : 'text-slate-600 dark:text-slate-300 border-transparent hover:border-slate-200 dark:hover:border-slate-700 hover:bg-white/80 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <GraduationCap className="h-3.5 w-3.5 xl:h-4 xl:w-4 opacity-80" />
            <span>المناهج الدراسية</span>
          </Link>

          {/* 3. 🔴 الحصص المباشرة */}
          <Link
            href="/live-classes"
            className={`flex items-center shrink-0 gap-1 px-2 py-1.5 xl:px-2.5 xl:py-1.5 2xl:px-3 2xl:py-2 text-[11px] xl:text-xs 2xl:text-[13px] font-bold rounded-xl transition-all whitespace-nowrap border ${
              isActive('/live-classes')
                ? 'bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 border-red-200 dark:border-red-900/50 shadow-xs'
                : 'text-red-600 dark:text-red-400 border-transparent hover:border-red-200 dark:hover:border-red-900/40 hover:bg-red-50/60 dark:hover:bg-red-950/20'
            }`}
          >
            <Radio className="h-3.5 w-3.5 xl:h-4 xl:w-4 shrink-0 animate-pulse" />
            <span>الحصص المباشرة</span>
          </Link>

          {/* 4. بنك الاختبارات */}
          <Link
            href="/quizzes"
            className={`flex items-center shrink-0 gap-1 px-2 py-1.5 xl:px-2.5 xl:py-1.5 2xl:px-3 2xl:py-2 text-[11px] xl:text-xs 2xl:text-[13px] font-bold rounded-xl transition-all whitespace-nowrap border ${
              isActive('/quizzes')
                ? 'bg-white dark:bg-[#242045] text-[#4F5DE4] dark:text-[#aab5f5] border-[#4F5DE4]/40 shadow-xs'
                : 'text-slate-600 dark:text-slate-300 border-transparent hover:border-slate-200 dark:hover:border-slate-700 hover:bg-white/80 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <FileQuestion className="h-3.5 w-3.5 xl:h-4 xl:w-4 opacity-80" />
            <span>بنك الاختبارات</span>
          </Link>

          {/* 5. مكتبة الفيديو */}
          <Link
            href="/videos"
            className={`flex items-center shrink-0 gap-1 px-2 py-1.5 xl:px-2.5 xl:py-1.5 2xl:px-3 2xl:py-2 text-[11px] xl:text-xs 2xl:text-[13px] font-bold rounded-xl transition-all whitespace-nowrap border ${
              isActive('/videos')
                ? 'bg-white dark:bg-[#242045] text-[#4F5DE4] dark:text-[#aab5f5] border-[#4F5DE4]/40 shadow-xs'
                : 'text-slate-600 dark:text-slate-300 border-transparent hover:border-slate-200 dark:hover:border-slate-700 hover:bg-white/80 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Video className="h-3.5 w-3.5 xl:h-4 xl:w-4 opacity-80" />
            <span>مكتبة الفيديو</span>
          </Link>

          {/* 6. المقالات */}
          <Link
            href="/blog"
            className={`flex items-center shrink-0 gap-1 px-2 py-1.5 xl:px-2.5 xl:py-1.5 2xl:px-3 2xl:py-2 text-[11px] xl:text-xs 2xl:text-[13px] font-bold rounded-xl transition-all whitespace-nowrap border ${
              isActive('/blog')
                ? 'bg-white dark:bg-[#242045] text-[#4F5DE4] dark:text-[#aab5f5] border-[#4F5DE4]/40 shadow-xs'
                : 'text-slate-600 dark:text-slate-300 border-transparent hover:border-slate-200 dark:hover:border-slate-700 hover:bg-white/80 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <BookOpen className="h-3.5 w-3.5 xl:h-4 xl:w-4 opacity-80" />
            <span>المقالات</span>
          </Link>

          {/* 7. زر مدمج: من نحن وتواصل معنا */}
          <div
            ref={aboutRef}
            className="relative shrink-0"
            onMouseEnter={() => setAboutOpen(true)}
            onMouseLeave={() => setAboutOpen(false)}
          >
            <button
              type="button"
              onClick={() => setAboutOpen(!aboutOpen)}
              className={`flex items-center shrink-0 gap-1 px-2 py-1.5 xl:px-2.5 xl:py-1.5 2xl:px-3 2xl:py-2 text-[11px] xl:text-xs 2xl:text-[13px] font-bold rounded-xl transition-all whitespace-nowrap border ${
                isAboutActive
                  ? 'bg-white dark:bg-[#242045] text-[#4F5DE4] dark:text-[#aab5f5] border-[#4F5DE4]/40 shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 border-transparent hover:border-slate-200 dark:hover:border-slate-700 hover:bg-white/80 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <HelpCircle className="h-3.5 w-3.5 xl:h-4 xl:w-4 opacity-80" />
              <span className="hidden 2xl:inline">من نحن وتواصل معنا</span>
              <span className="2xl:hidden">من نحن والتواصل</span>
              <ChevronDown
                className={`h-3 w-3 opacity-60 transition-transform duration-200 ${
                  aboutOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            {aboutOpen && (
              <div className="absolute top-full right-0 mt-1 w-52 rounded-2xl border border-[#E0E3FD] dark:border-[#373261] bg-white dark:bg-[#242045] p-2 shadow-xl animate-fade-in z-50">
                <Link
                  href="/about"
                  onClick={() => setAboutOpen(false)}
                  className={`flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-bold transition-colors ${
                    pathname === '/about'
                      ? 'text-[#4F5DE4] dark:text-[#aab5f5] bg-[#F1F2FD] dark:bg-[#1A1736]'
                      : 'text-[#2A254D] dark:text-slate-200 hover:bg-[#F1F2FD] dark:hover:bg-[#1A1736] hover:text-[#4F5DE4] dark:hover:text-[#aab5f5]'
                  }`}
                >
                  <Info className="h-4 w-4 text-[#4F5DE4]" />
                  <span>من نحن</span>
                </Link>

                <div className="my-1 border-t border-slate-100 dark:border-slate-800" />

                <Link
                  href="/contact"
                  onClick={() => setAboutOpen(false)}
                  className={`flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-bold transition-colors ${
                    pathname === '/contact'
                      ? 'text-[#4F5DE4] dark:text-[#aab5f5] bg-[#F1F2FD] dark:bg-[#1A1736]'
                      : 'text-[#2A254D] dark:text-slate-200 hover:bg-[#F1F2FD] dark:hover:bg-[#1A1736] hover:text-[#4F5DE4] dark:hover:text-[#aab5f5]'
                  }`}
                >
                  <Phone className="h-4 w-4 text-[#4F5DE4]" />
                  <span>تواصل معنا</span>
                </Link>
              </div>
            )}
          </div>
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
                  className="min-w-0 flex-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-xs text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#4F5DE4]"
                />
                <button
                  type="submit"
                  aria-label="تنفيذ البحث"
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#4F5DE4] text-white hover:bg-[#3d49cb] transition-colors"
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
              className="flex h-8.5 w-8.5 sm:h-9 sm:w-9 xl:h-10 xl:w-10 items-center justify-center rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
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
            className="flex h-8.5 w-8.5 sm:h-9 sm:w-9 xl:h-10 xl:w-10 items-center justify-center rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-yellow-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
          >
            {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>

          {/* ── أيقونة تبديل المنهج أو الدولة (تظهر للمشرفين فقط بالشريط العلوي) ── */}
          {canAccessAdmin && (
            <div ref={countryRef} className="relative">
              <button
                type="button"
                onClick={() => setCountryOpen(!countryOpen)}
                title={`تبديل المنهج أو الدولة للمشرف (${currentCountry.name})`}
                aria-label="تبديل المنهج أو الدولة"
                className="flex h-8.5 w-8.5 sm:h-9 sm:w-9 xl:h-10 xl:w-10 items-center justify-center rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all relative"
              >
                <Globe2 className="h-4 w-4 text-[#4F5DE4]" />
                <span className="absolute -bottom-1 -left-1 text-[11px] leading-none">
                  {currentCountry.flag}
                </span>
              </button>

              {countryOpen && (
                <div className="absolute left-0 top-full mt-2 z-[100] w-72 sm:w-80 rounded-2xl border border-[#E0E3FD] dark:border-[#373261] bg-white dark:bg-[#242045] p-3 shadow-2xl animate-fade-in">
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2 mb-2">
                    <span className="text-xs font-black text-[#4F5DE4] dark:text-[#aab5f5] flex items-center gap-1.5">
                      <Globe2 className="h-3.5 w-3.5" />
                      تبديل الدولة / المنهج (خاص بالمشرف)
                    </span>
                    <button
                      type="button"
                      onClick={() => setCountryOpen(false)}
                      className="text-slate-400 hover:text-slate-600 p-1"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 max-h-64 overflow-y-auto">
                    {ARAB_COUNTRIES.map((country) => (
                      <button
                        key={country.code}
                        type="button"
                        onClick={() => {
                          setSelectedCountry(country.code);
                          setCountryOpen(false);
                        }}
                        className={`flex items-center gap-1.5 rounded-xl border p-2 text-[10px] font-bold transition-all text-right ${
                          selectedCountry === country.code
                            ? 'border-[#4F5DE4] bg-[#F1F2FD] dark:bg-[#1A1736] text-[#4F5DE4]'
                            : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-[#4F5DE4]/40'
                        }`}
                      >
                        <span className="text-base shrink-0">{country.flag}</span>
                        <span className="truncate">
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
                </div>
              )}
            </div>
          )}

          {/* ── Admin Link (لوحة الإدارة - للمشرف فقط) ── */}
          {canAccessAdmin && (
            <Link
              href="/admin"
              title={isAdmin ? 'لوحة الإدارة' : 'لوحة المشرف'}
              aria-label="لوحة الإدارة"
              className="hidden sm:flex h-8.5 w-8.5 sm:h-9 sm:w-9 xl:h-10 xl:w-auto items-center justify-center gap-1.5 rounded-xl bg-[#4F5DE4] px-0 xl:px-3 text-white font-bold text-xs shadow-md hover:bg-[#3d49cb] transition-all"
            >
              <ShieldCheck className="h-4 w-4" />
              <span className="hidden xl:inline">لوحة الإدارة</span>
            </Link>
          )}

          {/* ── User Dropdown (عند تسجيل الدخول) ── */}
          {user ? (
            <div ref={userRef} className="relative">
              <button
                type="button"
                onClick={() => setUserOpen(!userOpen)}
                aria-label="حسابي"
                aria-expanded={userOpen}
                className="flex h-8.5 w-8.5 sm:h-9 sm:w-9 xl:h-10 xl:w-10 items-center justify-center rounded-xl border border-[#E0E3FD] dark:border-[#373261] bg-[#F1F2FD] dark:bg-[#242045] text-[#4F5DE4] transition-all"
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
                      className="flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      <UserIcon className="h-4 w-4" />
                      الملف الشخصي
                    </Link>
                    <Link
                      href="/profile?tab=saved"
                      className="flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      <Bookmark className="h-4 w-4" />
                      الدروس المحفوظة
                    </Link>
                    {canAccessAdmin && (
                      <Link
                        href="/admin"
                        className="flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-bold text-[#4F5DE4] hover:bg-[#F1F2FD] dark:hover:bg-[#1A1736]"
                      >
                        <ShieldCheck className="h-4 w-4" />
                        {isAdmin ? 'لوحة الإدارة' : 'لوحة المشرف'}
                      </Link>
                    )}
                    <button
                      type="button"
                      onClick={() => { setUserOpen(false); logout(); }}
                      className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                    >
                      <LogOut className="h-4 w-4" />
                      تسجيل الخروج
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* أزرار الدخول في الكمبيوتر إذا لم يكن مسجل */
            <div className="hidden xl:flex items-center gap-1.5 shrink-0">
              <Link
                href="/auth/login"
                className="px-2.5 py-1.5 text-xs font-bold rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                دخول
              </Link>
              <Link
                href="/auth/register"
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold rounded-xl bg-[#F57005] hover:bg-[#ea580c] text-white shadow-xs transition-all"
              >
                <UserIcon className="h-3.5 w-3.5" />
                <span>حساب جديد</span>
              </Link>
            </div>
          )}

          {/* ── زر القائمة (المزيد) للتيليفون وأندرويد ── */}
          <button
            type="button"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="قائمة المزيد"
            aria-expanded={menuOpen}
            className={`flex lg:hidden h-8.5 w-8.5 sm:h-9 sm:w-9 xl:h-10 xl:w-10 items-center justify-center rounded-xl border transition-all ${
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
          قائمة المزيد للتيليفون وأندرويد (DRAWER)
          تحتوي على جميع الأزرار والخدمات عند فتح الموقع من التيليفون
      ══════════════════════════════════════════════ */}
      {menuOpen && (
        <div className="lg:hidden absolute left-0 right-0 top-full z-[90] border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-[#15132d] shadow-2xl animate-fade-in max-h-[calc(100vh-4rem)] overflow-y-auto">
          <div className="mx-auto w-full px-3 py-4 sm:px-6">

            {/* ── Drawer Header ── */}
            <div className="mb-4 flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
                  قائمة منصة الهَدَّاف
                </h3>
                <p className="mt-0.5 text-[10px] sm:text-xs text-slate-400">
                  جميع الخدمات والأقسام
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

            {/* ── شبكة جميع الأزرار للتيليفون ── */}
            <div className="grid grid-cols-2 gap-2">
              {mobileMenuLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMenuOpen(false)}
                    className={`group flex items-center gap-2.5 rounded-2xl border p-3 transition-all ${
                      link.highlight
                        ? 'border-red-200 dark:border-red-900/50 bg-red-50/50 dark:bg-red-950/20 text-red-600 dark:text-red-400'
                        : isActive(link.href)
                        ? 'border-[#4F5DE4]/30 bg-[#F1F2FD] dark:bg-[#242045] text-[#4F5DE4] dark:text-[#aab5f5]'
                        : 'border-slate-100 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:border-[#4F5DE4]/30 hover:bg-[#F8F8FF] dark:hover:bg-[#242045]'
                    }`}
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white dark:bg-[#1A1736] shadow-xs text-[#4F5DE4] dark:text-[#aab5f5]">
                      {Icon ? (
                        <Icon className={`h-4 w-4 ${link.highlight ? 'text-red-500 animate-pulse' : ''}`} />
                      ) : (
                        <span className="text-xs font-black">🏠</span>
                      )}
                    </div>
                    <span className="text-xs font-bold">{link.name}</span>
                  </Link>
                );
              })}
            </div>

            {/* ── المراحل الدراسية والمناهج ── */}
            <div className="mt-3 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden">
              <button
                type="button"
                onClick={() => setCurriculumOpen(!curriculumOpen)}
                className="flex w-full items-center justify-between px-4 py-3 text-right text-xs font-black text-slate-800 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-900"
              >
                <span className="flex items-center gap-2">
                  <GraduationCap className="h-4 w-4 text-[#4F5DE4]" />
                  المراحل الدراسية في {countryName}
                </span>
                <ChevronDown
                  className={`h-4 w-4 text-slate-400 transition-transform ${curriculumOpen ? 'rotate-180' : ''}`}
                />
              </button>

              {curriculumOpen && (
                <div className="border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 p-2">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
                    {stages.map((stage) => (
                      <Link
                        key={stage.id}
                        href={`/curriculum?stage=${stage.id}`}
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center justify-between rounded-xl px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-800"
                      >
                        <span>{stage.name}</span>
                        <span className="text-[10px] text-slate-400">{stage.gradesCount} صفوف</span>
                      </Link>
                    ))}
                  </div>
                  <Link
                    href="/curriculum"
                    onClick={() => setMenuOpen(false)}
                    className="mt-2 flex items-center justify-center rounded-xl bg-[#4F5DE4] px-4 py-2 text-xs font-bold text-white hover:bg-[#3d49cb]"
                  >
                    عرض جميع المناهج
                  </Link>
                </div>
              )}
            </div>

            {/* ── تبديل الدولة (يظهر للمشرفين فقط في التيليفون أيضاً) ── */}
            {canAccessAdmin && (
              <div className="mt-3 rounded-2xl border border-[#4F5DE4]/20 bg-[#F1F2FD]/50 dark:bg-[#242045]/50 p-3">
                <button
                  type="button"
                  onClick={() => setCountryOpen(!countryOpen)}
                  className="flex w-full items-center justify-between"
                >
                  <span className="flex items-center gap-2 text-xs font-black text-[#4F5DE4] dark:text-[#aab5f5]">
                    <Globe2 className="h-4 w-4" />
                    تبديل المنهج أو الدولة (خاص بالمشرف)
                  </span>
                  <ChevronDown
                    className={`h-4 w-4 text-slate-400 transition-transform ${countryOpen ? 'rotate-180' : ''}`}
                  />
                </button>

                {countryOpen && (
                  <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                    {ARAB_COUNTRIES.map((country) => (
                      <button
                        key={country.code}
                        type="button"
                        onClick={() => {
                          setSelectedCountry(country.code);
                          setCountryOpen(false);
                          setMenuOpen(false);
                        }}
                        className={`flex items-center gap-2 rounded-xl border p-2 text-[10px] font-bold transition-all text-right ${
                          selectedCountry === country.code
                            ? 'border-[#4F5DE4] bg-white dark:bg-[#1A1736] text-[#4F5DE4]'
                            : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                        }`}
                      >
                        <span className="text-base shrink-0">{country.flag}</span>
                        <span className="truncate">
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

            {/* ── لوحة الإدارة للمشرف بالتيليفون ── */}
            {canAccessAdmin && (
              <Link
                href="/admin"
                onClick={() => setMenuOpen(false)}
                className="mt-3 flex items-center justify-center gap-2 rounded-xl bg-[#4F5DE4] px-4 py-2.5 text-xs font-bold text-white shadow-sm"
              >
                <ShieldCheck className="h-4 w-4" />
                <span>لوحة الإدارة</span>
              </Link>
            )}

            {/* ── تسجيل الدخول / حساب جديد بالتيليفون ── */}
            {!user ? (
              <div className="mt-4 flex flex-col sm:flex-row gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <Link
                  href="/auth/login"
                  onClick={() => setMenuOpen(false)}
                  className="flex flex-1 items-center justify-center rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  تسجيل الدخول
                </Link>
                <Link
                  href="/auth/register"
                  onClick={() => setMenuOpen(false)}
                  className="flex flex-1 items-center justify-center rounded-xl bg-[#F57005] px-4 py-2 text-xs font-bold text-white hover:bg-[#ea580c]"
                >
                  إنشاء حساب
                </Link>
              </div>
            ) : (
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div className="text-xs">
                  <p className="font-bold text-slate-800 dark:text-white truncate max-w-[180px]">
                    {profile?.displayName || 'حسابي'}
                  </p>
                  <p className="text-[10px] text-slate-400 truncate max-w-[180px]">
                    {profile?.email}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    logout();
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-rose-600 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/30"
                >
                  <LogOut className="h-4 w-4" />
                  <span>خروج</span>
                </button>
              </div>
            )}

          </div>
        </div>
      )}
    </header>
  );
}
