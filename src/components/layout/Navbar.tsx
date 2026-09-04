'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { 
  BookOpen, 
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
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { useLessons } from '@/context/LessonsContext';
import { ARAB_COUNTRIES, getStagesForCountry } from '@/lib/curriculumData';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, profile, isAdmin, isModerator, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { selectedCountry, setSelectedCountry } = useLessons();

  const canAccessAdmin = isAdmin || isModerator;

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [curriculumDropdown, setCurriculumDropdown] = useState(false);
  const [aboutDropdown, setAboutDropdown] = useState(false);
  const [userDropdown, setUserDropdown] = useState(false);
  const [countryDropdown, setCountryDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [scrolled, setScrolled] = useState(false);

  const countryRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 15);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
    setCurriculumDropdown(false);
    setAboutDropdown(false);
    setUserDropdown(false);
    setCountryDropdown(false);
  }, [pathname]);

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (countryRef.current && !countryRef.current.contains(e.target as Node)) {
        setCountryDropdown(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  const currentCountry = ARAB_COUNTRIES.find(c => c.code === selectedCountry) || ARAB_COUNTRIES[0];
  const stages = getStagesForCountry(selectedCountry);

  const mainNavLinks = [
    { name: 'الرئيسية', href: '/' },
    { name: 'المناهج الدراسية', href: '/curriculum', hasDropdown: true },
    { name: 'الحصص المباشرة', href: '/live-classes', icon: Radio, highlight: true },
    { name: 'مكتبة الفيديو', href: '/videos', icon: Video },
    { name: 'بنك الاختبارات', href: '/quizzes', icon: FileQuestion },
    { 
      name: currentCountry.code === 'sa' ? 'المقالات والتحصيلي' : currentCountry.code === 'eg' ? 'المقالات والثانوية' : 'المقالات والنصائح', 
      href: '/blog' 
    },
  ];

  const aboutLinks = [
    { name: 'من نحن', href: '/about', icon: Info },
    { name: 'تواصل معنا', href: '/contact', icon: Phone },
  ];

  return (
    <header className={`sticky top-0 z-50 w-full transition-all duration-300 ${
      scrolled 
        ? 'bg-white/95 dark:bg-[#1A1736]/95 shadow-tiqdr backdrop-blur-md border-b border-[#E0E3FD]/60 dark:border-[#373261]' 
        : 'bg-white/90 dark:bg-[#1A1736]/90 backdrop-blur-sm border-b border-[#E0E3FD]/40 dark:border-[#242045]'
    }`}>
      <div className="mx-auto flex max-w-7xl items-center justify-between px-3 sm:px-6 lg:px-8 h-16 sm:h-18">
        
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2.5 sm:gap-3 group shrink-0">
          <div className="relative flex h-10 w-10 sm:h-12 sm:w-12 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-[#4F5DE4]/20 bg-[#F1F2FD] dark:bg-[#242045] shadow-sm p-1 transition-transform duration-300 group-hover:scale-105">
            <Image
              src="/logo.png"
              alt="شعار منصة الهَدَّاف"
              width={48}
              height={48}
              className="object-contain"
              priority
            />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="text-lg sm:text-xl lg:text-2xl font-black tracking-tight text-[#2A254D] dark:text-white font-heading">
                الهَدَّاف
              </span>
              <span className="rounded-lg bg-[#4F5DE4]/10 text-[#4F5DE4] dark:bg-[#4F5DE4]/20 dark:text-[#aab5f5] px-2 py-0.5 text-[10px] font-black border border-[#4F5DE4]/20">
                التعليمي
              </span>
            </div>
            <p className="text-[9px] sm:text-[10px] font-semibold text-[#697585] dark:text-[#B3ADE1] leading-tight flex items-center gap-1 mt-0.5">
              <span>{currentCountry.flag}</span>
              <span>مناهج {currentCountry.name.replace('المملكة العربية ', '').replace('جمهورية ', '').replace('دولة ', '').replace('سلطنة ', '')}</span>
            </p>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-0.5 xl:gap-1">
          {mainNavLinks.map((link) => {
            const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));

            if (link.hasDropdown) {
              return (
                <div 
                  key={link.name} 
                  className="relative"
                  onMouseEnter={() => setCurriculumDropdown(true)}
                  onMouseLeave={() => setCurriculumDropdown(false)}
                >
                  <button
                    onClick={() => setCurriculumDropdown(!curriculumDropdown)}
                    className={`flex items-center gap-1 px-2.5 xl:px-3 py-2 text-xs xl:text-sm font-bold rounded-xl transition-colors ${
                      isActive
                        ? 'text-primary-600 dark:text-gold-400 bg-primary-50 dark:bg-slate-900'
                        : 'text-slate-700 dark:text-slate-200 hover:text-primary-600 dark:hover:text-gold-400 hover:bg-slate-50 dark:hover:bg-slate-900'
                    }`}
                  >
                    <span>{link.name}</span>
                    <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-200 ${curriculumDropdown ? 'rotate-180' : ''}`} />
                  </button>

                  {curriculumDropdown && (
                    <div className="absolute top-full right-0 w-72 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3 shadow-2xl animate-fade-in z-50">
                      <div className="text-[10px] font-bold text-slate-400 px-2 py-1 mb-1 uppercase tracking-wider">
                        {isAdmin ? 'كافة المراحل الدراسية' : `مراحل ${currentCountry.flag} ${currentCountry.name.replace('المملكة العربية ', '').replace('جمهورية ', '')}`}
                      </div>
                      {stages.map((stage) => (
                        <div key={stage.id} className="mb-1 last:mb-0">
                          <Link
                            href={`/curriculum?stage=${stage.id}`}
                            className="flex items-center justify-between rounded-xl p-2.5 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors group/item"
                          >
                            <div className="flex items-center gap-2.5">
                              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary-50 dark:bg-slate-800 text-primary-600 dark:text-gold-400">
                                <GraduationCap className="h-3.5 w-3.5" />
                              </div>
                              <div>
                                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100 group-hover/item:text-primary-600 dark:group-hover/item:text-gold-400">
                                  {stage.name}
                                </h4>
                                <span className="text-[10px] text-slate-400">
                                  {stage.gradesCount} صفوف دراسية
                                </span>
                              </div>
                            </div>
                            <span className="text-slate-400 text-xs">←</span>
                          </Link>
                        </div>
                      ))}
                      <div className="mt-2 border-t border-slate-100 dark:border-slate-800 pt-2">
                        <Link
                          href="/curriculum"
                          className="flex items-center justify-center gap-1 text-xs font-bold text-primary-600 dark:text-gold-400 py-1.5 hover:underline"
                        >
                          <span>عرض دليل المناهج بالكامل</span>
                          <span>←</span>
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              );
            }

            return (
              <Link
                key={link.name}
                href={link.href}
                className={`px-3 py-2 text-xs xl:text-sm font-bold rounded-xl transition-all whitespace-nowrap ${
                  isActive
                    ? 'text-[#4F5DE4] dark:text-[#aab5f5] bg-[#F1F2FD] dark:bg-[#242045]'
                    : 'text-[#2A254D] dark:text-slate-200 hover:text-[#4F5DE4] dark:hover:text-[#aab5f5] hover:bg-[#F1F2FD]/60 dark:hover:bg-[#242045]/60'
                }`}
              >
                {link.name}
              </Link>
            );
          })}

          {/* "عن المنصة" dropdown – replaces من نحن + تواصل معنا */}
          <div
            className="relative"
            onMouseEnter={() => setAboutDropdown(true)}
            onMouseLeave={() => setAboutDropdown(false)}
          >
            <button
              className={`flex items-center gap-1 px-3 py-2 text-xs xl:text-sm font-bold rounded-xl transition-all ${
                ['/about', '/contact'].includes(pathname)
                  ? 'text-[#4F5DE4] dark:text-[#aab5f5] bg-[#F1F2FD] dark:bg-[#242045]'
                  : 'text-[#2A254D] dark:text-slate-200 hover:text-[#4F5DE4] dark:hover:text-[#aab5f5] hover:bg-[#F1F2FD]/60 dark:hover:bg-[#242045]/60'
              }`}
            >
              <span>عن المنصة</span>
              <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-200 ${aboutDropdown ? 'rotate-180' : ''}`} />
            </button>
            {aboutDropdown && (
              <div className="absolute top-full right-0 w-48 rounded-2xl border border-[#E0E3FD] dark:border-[#373261] bg-white dark:bg-[#242045] p-2 shadow-xl animate-fade-in z-50">
                {aboutLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-xs font-bold text-[#2A254D] dark:text-slate-200 hover:bg-[#F1F2FD] dark:hover:bg-[#1A1736] hover:text-[#4F5DE4] dark:hover:text-[#aab5f5] transition-colors"
                  >
                    <link.icon className="h-3.5 w-3.5 text-[#4F5DE4]" />
                    {link.name}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </nav>

        {/* Right-side actions */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">

          {/* Country Switcher — admin sees all, students see their own flag */}
          <div className="relative" ref={countryRef}>
            {isAdmin ? (
              // Admin: full country switcher
              <>
                <button
                  onClick={() => setCountryDropdown(!countryDropdown)}
                  title="تبديل المنهج / الدولة"
                  className="flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 px-2.5 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 transition-colors"
                >
                  <span className="text-base leading-none">{currentCountry.flag}</span>
                  <span className="hidden xl:inline max-w-[80px] truncate">
                    {currentCountry.name.replace('المملكة العربية ', '').replace('جمهورية ', '').replace(' الأردنية الهاشمية', '').replace(' العربية المتحدة', '')}
                  </span>
                  <ChevronDown className={`h-3 w-3 text-slate-400 transition-transform ${countryDropdown ? 'rotate-180' : ''}`} />
                </button>

                {countryDropdown && (
                  <div className="absolute left-0 top-full mt-2 w-64 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-2 shadow-2xl animate-fade-in z-50">
                    <div className="text-[10px] font-bold text-slate-400 px-2 py-1 mb-1 flex items-center gap-1.5">
                      <Globe2 className="h-3 w-3" />
                      تبديل المنهج (للمشرف)
                    </div>
                    <div className="space-y-0.5">
                      {ARAB_COUNTRIES.map((c) => (
                        <button
                          key={c.code}
                          onClick={() => { setSelectedCountry(c.code); setCountryDropdown(false); }}
                          className={`w-full flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-bold text-right transition-colors ${
                            selectedCountry === c.code
                              ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                              : 'text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800'
                          }`}
                        >
                          <span className="text-base">{c.flag}</span>
                          <span className="flex-1 text-right">{c.name}</span>
                          {selectedCountry === c.code && <span className="text-primary-500 text-[10px]">✓ محدد</span>}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              // Student: show their country flag (read-only)
              user && profile?.country && (
                <div
                  title={`منهجك: ${ARAB_COUNTRIES.find(c => c.code === profile.country)?.name || ''}`}
                  className="flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-2.5 py-2 text-xs font-bold text-slate-600 dark:text-slate-300"
                >
                  <span className="text-base leading-none">
                    {ARAB_COUNTRIES.find(c => c.code === profile.country)?.flag || '🌐'}
                  </span>
                  <span className="hidden sm:inline text-[10px] max-w-[60px] truncate">
                    {ARAB_COUNTRIES.find(c => c.code === profile.country)?.name.replace('المملكة العربية ', '').replace('جمهورية ', '').replace(' الأردنية الهاشمية', '').replace(' العربية المتحدة', '') || 'منهجي'}
                  </span>
                </div>
              )
            )}
          </div>

          {/* Quick Search */}
          <form onSubmit={handleSearch} className="hidden xl:flex relative items-center">
            <input
              type="text"
              placeholder="ابحث عن درس..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-32 2xl:w-40 rounded-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 py-1.5 pr-8 pl-3 text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:w-48 focus:border-primary-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-none transition-all duration-300"
            />
            <Search className="absolute right-2.5 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
          </form>

          {/* Dark Mode Toggle */}
          <button
            onClick={toggleTheme}
            title={theme === 'dark' ? 'تفعيل الوضع النهاري' : 'تفعيل الوضع الليلي'}
            className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-gold-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>

          {/* Admin / Moderator shortcut */}
          {canAccessAdmin && (
            <Link
              href="/admin"
              className="hidden md:flex items-center gap-1.5 rounded-xl bg-[#4F5DE4] hover:bg-[#3d49cb] text-white font-bold px-3 py-1.5 text-xs shadow-md transition-all hover:scale-105 whitespace-nowrap"
              title={isAdmin ? 'لوحة تحكم المشرف العام' : `لوحة تحكم مشرف منهج ${ARAB_COUNTRIES.find(c => c.code === profile?.assignedCountry)?.name || ''}`}
            >
              <ShieldCheck className="h-4 w-4 text-[#fed7aa]" />
              <span>{isAdmin ? 'لوحة الإدارة' : 'لوحة المشرف'}</span>
            </Link>
          )}

          {/* User menu / login button */}
          {user ? (
            <div className="relative">
              <button
                onClick={() => setUserDropdown(!userDropdown)}
                className="flex items-center gap-1.5 rounded-xl border border-[#E0E3FD] dark:border-[#373261] bg-[#F1F2FD] dark:bg-[#242045] p-1.5 pr-2 text-xs font-bold text-[#2A254D] dark:text-slate-200 hover:bg-[#E0E3FD]/60 dark:hover:bg-[#1A1736] transition-colors"
              >
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#4F5DE4] text-white text-xs font-bold">
                  {profile?.displayName?.charAt(0) || 'ط'}
                </div>
                <span className="max-w-[70px] sm:max-w-[100px] truncate hidden sm:inline">
                  {profile?.displayName || 'حسابي'}
                </span>
                {isModerator && (
                  <span className="hidden xl:inline text-[9px] bg-[#E0E3FD] text-[#4F5DE4] dark:bg-[#4F5DE4]/20 dark:text-[#aab5f5] font-black px-1.5 py-0.5 rounded-md">
                    مشرف
                  </span>
                )}
                <ChevronDown className="h-3 w-3 text-slate-400" />
              </button>

              {userDropdown && (
                <div className="absolute left-0 mt-2 w-56 rounded-2xl border border-[#E0E3FD] dark:border-[#373261] bg-white dark:bg-[#242045] p-2 shadow-xl animate-fade-in z-50">
                  <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800 mb-1">
                    <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                      {profile?.displayName}
                    </p>
                    <p className="text-[10px] text-slate-400 truncate">{profile?.email}</p>
                    {isModerator && profile?.assignedCountry && (
                      <p className="text-[10px] text-[#4F5DE4] dark:text-[#aab5f5] font-bold mt-1 bg-[#F1F2FD] dark:bg-[#1A1736] p-1 rounded-lg">
                        🛡️ مشرف منهج: {ARAB_COUNTRIES.find(c => c.code === profile.assignedCountry)?.name}
                      </p>
                    )}
                    {!isModerator && profile?.country && (
                      <p className="text-[10px] text-[#4F5DE4] font-semibold mt-0.5">
                        {ARAB_COUNTRIES.find(c => c.code === profile.country)?.flag}{' '}
                        {ARAB_COUNTRIES.find(c => c.code === profile.country)?.name.replace('المملكة العربية ', '')}
                      </p>
                    )}
                  </div>

                  <div className="space-y-0.5">
                    <Link href="/profile" className="flex items-center gap-2 rounded-xl px-3 py-2 text-xs text-[#2A254D] dark:text-slate-200 hover:bg-[#F1F2FD] dark:hover:bg-[#1A1736] font-medium">
                      <UserIcon className="h-4 w-4 text-[#4F5DE4]" />
                      <span>الملف الشخصي</span>
                    </Link>
                    <Link href="/profile?tab=saved" className="flex items-center gap-2 rounded-xl px-3 py-2 text-xs text-[#2A254D] dark:text-slate-200 hover:bg-[#F1F2FD] dark:hover:bg-[#1A1736] font-medium">
                      <Bookmark className="h-4 w-4 text-[#F57005]" />
                      <span>الدروس المحفوظة</span>
                    </Link>
                    {canAccessAdmin && (
                      <Link href="/admin" className="flex items-center gap-2 rounded-xl px-3 py-2 text-xs text-[#4F5DE4] dark:text-[#aab5f5] hover:bg-[#F1F2FD] dark:hover:bg-[#1A1736] font-bold">
                        <ShieldCheck className="h-4 w-4" />
                        <span>{isAdmin ? 'لوحة تحكم المشرف العام' : 'لوحة تحكم المشرف'}</span>
                      </Link>
                    )}
                  </div>

                  <div className="border-t border-slate-100 dark:border-slate-800 pt-1 mt-1">
                    <button
                      onClick={() => logout()}
                      className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 font-bold"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>تسجيل الخروج</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Link
              href="/auth/login"
              className="flex items-center gap-1.5 rounded-xl bg-[#F57005] hover:bg-[#ea580c] text-white font-bold px-3.5 sm:px-5 py-2 text-xs shadow-md shadow-[#F57005]/20 hover:shadow-lg transition-all duration-200 whitespace-nowrap"
            >
              <UserIcon className="h-3.5 w-3.5" />
              <span>دخول / تسجيل</span>
            </Link>
          )}

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex lg:hidden h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="القائمة"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-4 pt-4 pb-6 space-y-3 shadow-2xl animate-fade-in">
          <form onSubmit={handleSearch} className="relative">
            <input
              type="text"
              placeholder="ابحث عن درس، مادة، صف..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 py-2.5 pr-10 pl-3 text-xs text-slate-800 dark:text-slate-200 focus:outline-none"
            />
            <Search className="absolute right-3.5 top-3 h-4 w-4 text-slate-400" />
          </form>

          {/* Admin: country switcher in mobile drawer */}
          {isAdmin && (
            <div>
              <p className="text-[10px] font-bold text-slate-400 px-1 mb-2 flex items-center gap-1.5">
                <Globe2 className="h-3 w-3" /> تبديل المنهج (للمشرف):
              </p>
              <div className="grid grid-cols-4 gap-1.5">
                {ARAB_COUNTRIES.map((c) => (
                  <button
                    key={c.code}
                    onClick={() => setSelectedCountry(c.code)}
                    className={`flex flex-col items-center gap-0.5 rounded-xl border-2 py-2 text-[9px] font-bold transition-all ${
                      selectedCountry === c.code
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-primary-300'
                    }`}
                  >
                    <span className="text-lg">{c.flag}</span>
                    <span className="leading-tight text-center">{c.name.replace('المملكة العربية ', '').replace('جمهورية ', '').replace(' الأردنية الهاشمية', '').replace(' العربية المتحدة', '').replace('مناهج ومهارات عربية عامة', 'عام')}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-1 pt-1">
            {[...mainNavLinks, ...aboutLinks].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="flex items-center justify-between rounded-xl px-3.5 py-2.5 text-sm font-bold text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors"
              >
                <span>{link.name}</span>
                <span className="text-slate-400 text-xs">←</span>
              </Link>
            ))}

            {canAccessAdmin && (
              <Link
                href="/admin"
                className="flex items-center justify-between rounded-xl px-3.5 py-2.5 text-sm font-bold text-amber-600 dark:text-gold-400 bg-amber-50 dark:bg-slate-900 mt-2"
              >
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4" />
                  <span>{isAdmin ? 'لوحة تحكم المشرف العام' : 'لوحة تحكم المشرف'}</span>
                </div>
                <span className="text-xs">←</span>
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
