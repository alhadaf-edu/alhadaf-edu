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
  MoreHorizontal,
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

  const {
    user,
    profile,
    isAdmin,
    isModerator,
    logout,
  } = useAuth();

  const { theme, toggleTheme } = useTheme();

  const {
    selectedCountry,
    setSelectedCountry,
  } = useLessons();

  const canAccessAdmin = isAdmin || isModerator;

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [curriculumDropdown, setCurriculumDropdown] = useState(false);
  const [moreDropdown, setMoreDropdown] = useState(false);
  const [userDropdown, setUserDropdown] = useState(false);
  const [countryDropdown, setCountryDropdown] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [scrolled, setScrolled] = useState(false);

  const countryRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  /*
   * ============================
   * Scroll effect
   * ============================
   */
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 15);
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  /*
   * ============================
   * Close menus when route changes
   * ============================
   */
  useEffect(() => {
    setMobileMenuOpen(false);
    setCurriculumDropdown(false);
    setMoreDropdown(false);
    setUserDropdown(false);
    setCountryDropdown(false);
    setSearchOpen(false);
  }, [pathname]);

  /*
   * ============================
   * Close dropdowns on outside click
   * ============================
   */
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const target = e.target as Node;

      if (
        countryRef.current &&
        !countryRef.current.contains(target)
      ) {
        setCountryDropdown(false);
      }

      if (
        searchRef.current &&
        !searchRef.current.contains(target)
      ) {
        setSearchOpen(false);
      }
    };

    document.addEventListener('mousedown', handler);

    return () => {
      document.removeEventListener('mousedown', handler);
    };
  }, []);

  /*
   * ============================
   * Search
   * ============================
   */
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();

    const query = searchQuery.trim();

    if (!query) return;

    router.push(
      `/search?q=${encodeURIComponent(query)}`
    );

    setSearchQuery('');
    setSearchOpen(false);
  };

  /*
   * ============================
   * Country / curriculum
   * ============================
   */
  const currentCountry =
    ARAB_COUNTRIES.find(
      (c) => c.code === selectedCountry
    ) || ARAB_COUNTRIES[0];

  const stages = getStagesForCountry(selectedCountry);

  /*
   * ============================
   * Main desktop navigation
   *
   * Important:
   * Keep only the most important links visible.
   * Secondary links are inside "المزيد".
   * This prevents overlap on laptop screens.
   * ============================
   */
  const mainNavLinks = [
    {
      name: 'الرئيسية',
      href: '/',
    },
    {
      name: 'المناهج الدراسية',
      href: '/curriculum',
      hasDropdown: true,
    },
    {
      name: 'الحصص المباشرة',
      href: '/live-classes',
      icon: Radio,
      highlight: true,
    },
    {
      name: 'مكتبة الفيديو',
      href: '/videos',
      icon: Video,
    },
  ];

  /*
   * ============================
   * Secondary navigation
   * ============================
   */
  const moreLinks = [
    {
      name: 'بنك الاختبارات',
      href: '/quizzes',
      icon: FileQuestion,
    },
    {
      name: 'المقالات',
      href: '/blog',
      icon: BookOpen,
    },
    {
      name: 'من نحن',
      href: '/about',
      icon: Info,
    },
    {
      name: 'تواصل معنا',
      href: '/contact',
      icon: Phone,
    },
  ];

  return (
    <header
      className={`
        sticky top-0 z-50 w-full
        transition-all duration-300
        ${
          scrolled
            ? `
              bg-white/95
              dark:bg-[#1A1736]/95
              shadow-tiqdr
              backdrop-blur-md
              border-b
              border-[#E0E3FD]/60
              dark:border-[#373261]
            `
            : `
              bg-white/90
              dark:bg-[#1A1736]/90
              backdrop-blur-sm
              border-b
              border-[#E0E3FD]/40
              dark:border-[#242045]
            `
        }
      `}
    >
      {/* =====================================================
          MAIN HEADER
          ===================================================== */}
      <div
        className="
          mx-auto
          flex
          max-w-[1440px]
          items-center
          justify-between
          px-3
          sm:px-4
          lg:px-5
          xl:px-6
          h-16
          sm:h-20
          gap-1.5
          sm:gap-3
        "
      >
        {/* ===================================================
            BRAND
            =================================================== */}
        <Link
          href="/"
          className="
            flex
            items-center
            gap-2
            sm:gap-3
            group
            shrink-0
          "
        >
          {/* Logo */}
          <div
            className="
              relative
              flex
              h-10
              w-10
              sm:h-12
              sm:w-12
              shrink-0
              items-center
              justify-center
              overflow-hidden
              rounded-2xl
              border
              border-[#4F5DE4]/20
              bg-[#F1F2FD]
              dark:bg-[#242045]
              shadow-sm
              p-1.5
              transition-transform
              duration-300
              group-hover:scale-105
            "
          >
            <Image
              src="/logo.png"
              alt="شعار منصة الهَدَّاف"
              width={48}
              height={48}
              className="object-contain"
              priority
            />
          </div>

          {/* Brand text */}
          <div className="flex min-w-0 flex-col">
            <div className="flex items-center gap-1.5">
              <span
                className="
                  text-base
                  sm:text-xl
                  lg:text-xl
                  xl:text-2xl
                  font-black
                  tracking-tight
                  text-[#2A254D]
                  dark:text-white
                  font-heading
                "
              >
                الهَدَّاف
              </span>

              <span
                className="
                  rounded-md
                  bg-[#4F5DE4]/10
                  text-[#4F5DE4]
                  dark:bg-[#4F5DE4]/20
                  dark:text-[#aab5f5]
                  px-2
                  py-0.5
                  text-[10px]
                  sm:text-xs
                  font-black
                  border
                  border-[#4F5DE4]/20
                "
              >
                التعليمي
              </span>
            </div>

            <p
              className="
                text-[10px]
                sm:text-[11px]
                font-semibold
                text-[#697585]
                dark:text-[#B3ADE1]
                leading-tight
                flex
                items-center
                gap-1.5
                mt-0.5
              "
            >
              <span>{currentCountry.flag}</span>

              <span>
                مناهج{' '}
                {currentCountry.name
                  .replace('المملكة العربية ', '')
                  .replace('جمهورية ', '')
                  .replace('دولة ', '')
                  .replace('سلطنة ', '')}
              </span>
            </p>
          </div>
        </Link>

        {/* ===================================================
            DESKTOP NAVIGATION
            =================================================== */}
        <nav
          className="
            hidden
            lg:flex
            min-w-0
            flex-1
            items-center
            justify-center
            gap-0.5
            xl:gap-1
            mx-2
            p-1
            rounded-2xl
            bg-slate-100/80
            dark:bg-slate-900/80
            border
            border-slate-200/80
            dark:border-slate-800
            overflow-visible
          "
        >
          {mainNavLinks.map((link, idx) => {
            const isActive =
              pathname === link.href ||
              (
                link.href !== '/' &&
                pathname.startsWith(link.href)
              );

            /*
             * Curriculum dropdown
             */
            if (link.hasDropdown) {
              return (
                <React.Fragment key={link.name}>
                  {idx > 0 && (
                    <span
                      className="
                        h-4
                        w-px
                        bg-slate-300
                        dark:bg-slate-700
                        shrink-0
                        mx-0.5
                      "
                    />
                  )}

                  <div
                    className="relative"
                    onMouseEnter={() =>
                      setCurriculumDropdown(true)
                    }
                    onMouseLeave={() =>
                      setCurriculumDropdown(false)
                    }
                  >
                    <button
                      type="button"
                      onClick={() =>
                        setCurriculumDropdown(
                          !curriculumDropdown
                        )
                      }
                      className={`
                        flex
                        items-center
                        gap-1
                        px-2.5
                        xl:px-3
                        py-2
                        text-[11px]
                        xl:text-sm
                        font-bold
                        rounded-xl
                        transition-all
                        whitespace-nowrap
                        border
                        ${
                          isActive
                            ? `
                              text-[#4F5DE4]
                              dark:text-[#aab5f5]
                              bg-white
                              dark:bg-[#242045]
                              border-[#4F5DE4]/40
                              shadow-sm
                            `
                            : `
                              text-slate-700
                              dark:text-slate-200
                              border-transparent
                              hover:border-slate-300
                              dark:hover:border-slate-700
                              hover:bg-white/90
                              dark:hover:bg-slate-800/90
                            `
                        }
                      `}
                    >
                      <span>{link.name}</span>

                      <ChevronDown
                        className={`
                          h-3.5
                          w-3.5
                          transition-transform
                          duration-200
                          ${
                            curriculumDropdown
                              ? 'rotate-180'
                              : ''
                          }
                        `}
                      />
                    </button>

                    {/* Curriculum dropdown */}
                    {curriculumDropdown && (
                      <div
                        className="
                          absolute
                          top-full
                          right-0
                          mt-1
                          w-72
                          rounded-2xl
                          border
                          border-slate-200
                          dark:border-slate-800
                          bg-white
                          dark:bg-slate-900
                          p-3
                          shadow-2xl
                          animate-fade-in
                          z-[70]
                        "
                      >
                        <div
                          className="
                            text-[10px]
                            font-bold
                            text-slate-400
                            px-2
                            py-1
                            mb-1
                            uppercase
                            tracking-wider
                          "
                        >
                          {isAdmin
                            ? 'كافة المراحل الدراسية'
                            : `مراحل ${currentCountry.flag} ${
                                currentCountry.name
                                  .replace(
                                    'المملكة العربية ',
                                    ''
                                  )
                                  .replace(
                                    'جمهورية ',
                                    ''
                                  )
                              }`}
                        </div>

                        {stages.map((stage) => (
                          <div
                            key={stage.id}
                            className="
                              mb-1
                              last:mb-0
                            "
                          >
                            <Link
                              href={`/curriculum?stage=${stage.id}`}
                              className="
                                flex
                                items-center
                                justify-between
                                rounded-xl
                                p-2.5
                                hover:bg-slate-50
                                dark:hover:bg-slate-800
                                transition-colors
                                group/item
                              "
                            >
                              <div
                                className="
                                  flex
                                  items-center
                                  gap-2.5
                                "
                              >
                                <div
                                  className="
                                    flex
                                    h-7
                                    w-7
                                    items-center
                                    justify-center
                                    rounded-lg
                                    bg-primary-50
                                    dark:bg-slate-800
                                    text-primary-600
                                    dark:text-gold-400
                                  "
                                >
                                  <GraduationCap
                                    className="h-3.5 w-3.5"
                                  />
                                </div>

                                <div>
                                  <h4
                                    className="
                                      text-xs
                                      font-bold
                                      text-slate-800
                                      dark:text-slate-100
                                      group-hover/item:text-primary-600
                                      dark:group-hover/item:text-gold-400
                                    "
                                  >
                                    {stage.name}
                                  </h4>

                                  <span
                                    className="
                                      text-[10px]
                                      text-slate-400
                                    "
                                  >
                                    {stage.gradesCount}{' '}
                                    صفوف دراسية
                                  </span>
                                </div>
                              </div>

                              <span
                                className="
                                  text-slate-400
                                  text-xs
                                "
                              >
                                ←
                              </span>
                            </Link>
                          </div>
                        ))}

                        <div
                          className="
                            mt-2
                            border-t
                            border-slate-100
                            dark:border-slate-800
                            pt-2
                          "
                        >
                          <Link
                            href="/curriculum"
                            className="
                              flex
                              items-center
                              justify-center
                              gap-1
                              text-xs
                              font-bold
                              text-primary-600
                              dark:text-gold-400
                              py-1.5
                              hover:underline
                            "
                          >
                            <span>
                              عرض دليل المناهج بالكامل
                            </span>

                            <span>←</span>
                          </Link>
                        </div>
                      </div>
                    )}
                  </div>
                </React.Fragment>
              );
            }

            const Icon = link.icon;

            return (
              <React.Fragment key={link.name}>
                {idx > 0 && (
                  <span
                    className="
                      h-4
                      w-px
                      bg-slate-300
                      dark:bg-slate-700
                      shrink-0
                      mx-0.5
                    "
                  />
                )}

                <Link
                  href={link.href}
                  className={`
                    flex
                    items-center
                    gap-1
                    px-2.5
                    xl:px-3
                    py-2
                    text-[11px]
                    xl:text-sm
                    font-bold
                    rounded-xl
                    transition-all
                    whitespace-nowrap
                    border
                    ${
                      isActive
                        ? `
                          text-[#4F5DE4]
                          dark:text-[#aab5f5]
                          bg-white
                          dark:bg-[#242045]
                          border-[#4F5DE4]/40
                          shadow-sm
                        `
                        : link.highlight
                        ? `
                          text-red-600
                          dark:text-red-400
                          border-red-200
                          dark:border-red-900/40
                          bg-red-50/50
                          dark:bg-red-950/30
                          hover:bg-red-100
                          dark:hover:bg-red-900/50
                        `
                        : `
                          text-slate-700
                          dark:text-slate-200
                          border-transparent
                          hover:border-slate-300
                          dark:hover:border-slate-700
                          hover:bg-white/90
                          dark:hover:bg-slate-800/90
                        `
                    }
                  `}
                >
                  {Icon && (
                    <Icon
                      className="
                        h-4
                        w-4
                        shrink-0
                        opacity-80
                      "
                    />
                  )}

                  <span>{link.name}</span>
                </Link>
              </React.Fragment>
            );
          })}

          {/* Separator */}
          <span
            className="
              h-4
              w-px
              bg-slate-300
              dark:bg-slate-700
              shrink-0
              mx-0.5
            "
          />

          {/* =================================================
              MORE DROPDOWN
              ================================================= */}
          <div
            className="relative"
            onMouseEnter={() =>
              setMoreDropdown(true)
            }
            onMouseLeave={() =>
              setMoreDropdown(false)
            }
          >
            <button
              type="button"
              onClick={() =>
                setMoreDropdown(!moreDropdown)
              }
              className={`
                flex
                items-center
                gap-1
                px-2.5
                xl:px-3
                py-2
                text-[11px]
                xl:text-sm
                font-bold
                rounded-xl
                transition-all
                whitespace-nowrap
                border
                ${
                  ['/quizzes', '/blog', '/about', '/contact']
                    .includes(pathname)
                    ? `
                      text-[#4F5DE4]
                      dark:text-[#aab5f5]
                      bg-white
                      dark:bg-[#242045]
                      border-[#4F5DE4]/40
                      shadow-sm
                    `
                    : `
                      text-slate-700
                      dark:text-slate-200
                      border-transparent
                      hover:border-slate-300
                      dark:hover:border-slate-700
                      hover:bg-white/90
                      dark:hover:bg-slate-800/90
                    `
                }
              `}
            >
              <MoreHorizontal
                className="
                  h-4
                  w-4
                  opacity-70
                "
              />

              <span>المزيد</span>

              <ChevronDown
                className={`
                  h-3.5
                  w-3.5
                  transition-transform
                  duration-200
                  ${
                    moreDropdown
                      ? 'rotate-180'
                      : ''
                  }
                `}
              />
            </button>

            {moreDropdown && (
              <div
                className="
                  absolute
                  top-full
                  right-0
                  mt-1
                  w-56
                  rounded-2xl
                  border
                  border-[#E0E3FD]
                  dark:border-[#373261]
                  bg-white
                  dark:bg-[#242045]
                  p-2
                  shadow-xl
                  animate-fade-in
                  z-[70]
                "
              >
                {moreLinks.map((link) => {
                  const MoreIcon = link.icon;

                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={`
                        flex
                        items-center
                        gap-2.5
                        rounded-xl
                        px-3
                        py-2.5
                        text-xs
                        font-bold
                        transition-colors
                        ${
                          pathname === link.href
                            ? `
                              text-[#4F5DE4]
                              dark:text-[#aab5f5]
                              bg-[#F1F2FD]
                              dark:bg-[#1A1736]
                            `
                            : `
                              text-[#2A254D]
                              dark:text-slate-200
                              hover:bg-[#F1F2FD]
                              dark:hover:bg-[#1A1736]
                              hover:text-[#4F5DE4]
                              dark:hover:text-[#aab5f5]
                            `
                        }
                      `}
                    >
                      <MoreIcon
                        className="
                          h-4
                          w-4
                          text-[#4F5DE4]
                        "
                      />

                      <span>{link.name}</span>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </nav>

        {/* ===================================================
            SEPARATOR
            =================================================== */}
        <div
          className="
            hidden
            lg:block
            h-8
            w-px
            bg-slate-200
            dark:bg-slate-800
            mx-1
            shrink-0
          "
        />

        {/* ===================================================
            RIGHT SIDE ACTIONS
            =================================================== */}
        <div
          className="
            flex
            items-center
            gap-1.5
            sm:gap-2
            shrink-0
          "
        >
          {/* =================================================
              COUNTRY SWITCHER
              ================================================= */}
          <div
            className="relative"
            ref={countryRef}
          >
            {isAdmin ? (
              <>
                <button
                  type="button"
                  onClick={() =>
                    setCountryDropdown(
                      !countryDropdown
                    )
                  }
                  title="تبديل المنهج / الدولة"
                  aria-label="تبديل المنهج والدولة"
                  aria-expanded={countryDropdown}
                  className="
                    flex
                    items-center
                    gap-1.5
                    rounded-xl
                    border
                    border-slate-200
                    dark:border-slate-700
                    bg-slate-50
                    dark:bg-slate-900
                    hover:bg-slate-100
                    dark:hover:bg-slate-800
                    px-2.5
                    py-2
                    text-xs
                    font-bold
                    text-slate-700
                    dark:text-slate-200
                    transition-colors
                  "
                >
                  <span
                    className="
                      text-base
                      leading-none
                    "
                  >
                    {currentCountry.flag}
                  </span>

                  <span
                    className="
                      hidden
                      2xl:inline
                      max-w-[80px]
                      truncate
                    "
                  >
                    {currentCountry.name
                      .replace(
                        'المملكة العربية ',
                        ''
                      )
                      .replace(
                        'جمهورية ',
                        ''
                      )
                      .replace(
                        ' الأردنية الهاشمية',
                        ''
                      )
                      .replace(
                        ' العربية المتحدة',
                        ''
                      )}
                  </span>

                  <ChevronDown
                    className={`
                      h-3.5
                      w-3.5
                      text-slate-400
                      transition-transform
                      ${
                        countryDropdown
                          ? 'rotate-180'
                          : ''
                      }
                    `}
                  />
                </button>

                {countryDropdown && (
                  <div
                    className="
                      absolute
                      left-0
                      top-full
                      mt-2
                      w-64
                      rounded-2xl
                      border
                      border-slate-200
                      dark:border-slate-800
                      bg-white
                      dark:bg-slate-900
                      p-2
                      shadow-2xl
                      animate-fade-in
                      z-[80]
                    "
                  >
                    <div
                      className="
                        text-[10px]
                        font-bold
                        text-slate-400
                        px-2
                        py-1
                        mb-1
                        flex
                        items-center
                        gap-1.5
                      "
                    >
                      <Globe2
                        className="h-3 w-3"
                      />

                      تبديل المنهج (للمشرف)
                    </div>

                    <div className="space-y-0.5">
                      {ARAB_COUNTRIES.map((c) => (
                        <button
                          key={c.code}
                          type="button"
                          onClick={() => {
                            setSelectedCountry(
                              c.code
                            );
                            setCountryDropdown(
                              false
                            );
                          }}
                          className={`
                            w-full
                            flex
                            items-center
                            gap-2.5
                            rounded-xl
                            px-3
                            py-2
                            text-xs
                            font-bold
                            text-right
                            transition-colors
                            ${
                              selectedCountry ===
                              c.code
                                ? `
                                  bg-primary-50
                                  dark:bg-primary-900/30
                                  text-primary-700
                                  dark:text-primary-300
                                `
                                : `
                                  text-slate-700
                                  dark:text-slate-200
                                  hover:bg-slate-50
                                  dark:hover:bg-slate-800
                                `
                            }
                          `}
                        >
                          <span className="text-base">
                            {c.flag}
                          </span>

                          <span
                            className="
                              flex-1
                              text-right
                            "
                          >
                            {c.name}
                          </span>

                          {selectedCountry ===
                            c.code && (
                            <span
                              className="
                                text-primary-500
                                text-[10px]
                              "
                            >
                              ✓ محدد
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              user &&
              profile?.country && (
                <div
                  title={`
                    منهجك:
                    ${
                      ARAB_COUNTRIES.find(
                        (c) =>
                          c.code ===
                          profile.country
                      )?.name || ''
                    }
                  `}
                  className="
                    flex
                    items-center
                    gap-1.5
                    rounded-xl
                    border
                    border-slate-200
                    dark:border-slate-700
                    bg-slate-50
                    dark:bg-slate-900
                    px-2.5
                    py-2
                    text-xs
                    font-bold
                    text-slate-600
                    dark:text-slate-300
                  "
                >
                  <span
                    className="
                      text-base
                      leading-none
                    "
                  >
                    {ARAB_COUNTRIES.find(
                      (c) =>
                        c.code ===
                        profile.country
                    )?.flag || '🌐'}
                  </span>

                  <span
                    className="
                      hidden
                      xl:inline
                      text-[10px]
                      max-w-[60px]
                      truncate
                    "
                  >
                    {ARAB_COUNTRIES.find(
                      (c) =>
                        c.code ===
                        profile.country
                    )?.name
                      .replace(
                        'المملكة العربية ',
                        ''
                      )
                      .replace(
                        'جمهورية ',
                        ''
                      )
                      .replace(
                        ' الأردنية الهاشمية',
                        ''
                      )
                      .replace(
                        ' العربية المتحدة',
                        ''
                      ) ||
                      'منهجي'}
                  </span>
                </div>
              )
            )}
          </div>

          {/* =================================================
              SEARCH
              ================================================= */}
          <div
            className="
              relative
              flex
              items-center
            "
            ref={searchRef}
          >
            {/* Search popup */}
            {searchOpen && (
              <form
                onSubmit={handleSearch}
                className="
                  absolute
                  right-0
                  top-full
                  mt-2
                  w-[min(20rem,calc(100vw-2rem))]
                  rounded-2xl
                  border
                  border-slate-200
                  dark:border-slate-700
                  bg-white
                  dark:bg-slate-900
                  p-2
                  shadow-2xl
                  z-[90]
                  flex
                  items-center
                  gap-2
                  animate-fade-in
                "
              >
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="ابحث عن درس أو مذكرة..."
                  value={searchQuery}
                  onChange={(e) =>
                    setSearchQuery(
                      e.target.value
                    )
                  }
                  className="
                    flex-1
                    min-w-0
                    rounded-xl
                    border
                    border-slate-200
                    dark:border-slate-700
                    bg-slate-50
                    dark:bg-slate-800
                    px-3
                    py-2.5
                    text-xs
                    text-slate-800
                    dark:text-slate-200
                    placeholder-slate-400
                    focus:outline-none
                    focus:ring-2
                    focus:ring-primary-500
                  "
                  autoFocus
                />

                <button
                  type="submit"
                  className="
                    rounded-xl
                    bg-primary-600
                    hover:bg-primary-700
                    text-white
                    p-2.5
                    shrink-0
                    transition-colors
                  "
                  title="بحث"
                  aria-label="بحث"
                >
                  <Search
                    className="h-4 w-4"
                  />
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setSearchOpen(false)
                  }
                  className="
                    rounded-xl
                    bg-slate-100
                    dark:bg-slate-800
                    text-slate-500
                    p-2.5
                    shrink-0
                    hover:bg-slate-200
                    dark:hover:bg-slate-700
                  "
                  title="إغلاق"
                  aria-label="إغلاق البحث"
                >
                  <X
                    className="h-4 w-4"
                  />
                </button>
              </form>
            )}

            {/* Search button */}
            <button
              type="button"
              onClick={() => {
                setSearchOpen(
                  !searchOpen
                );

                setTimeout(() => {
                  searchInputRef.current?.focus();
                }, 100);
              }}
              title="بحث في المنصة"
              aria-label="بحث في المنصة"
              aria-expanded={searchOpen}
              className="
                flex
                h-9
                w-9
                items-center
                justify-center
                rounded-xl
                border
                border-slate-200
                dark:border-slate-800
                bg-slate-50
                dark:bg-slate-900
                text-slate-600
                dark:text-slate-300
                hover:bg-slate-100
                dark:hover:bg-slate-800
                hover:border-primary-300
                dark:hover:border-primary-700
                transition-all
                shrink-0
              "
            >
              <Search
                className="h-4 w-4"
              />
            </button>
          </div>

          {/* =================================================
              DARK MODE
              ================================================= */}
          <button
            type="button"
            onClick={toggleTheme}
            title={
              theme === 'dark'
                ? 'تفعيل الوضع النهاري'
                : 'تفعيل الوضع الليلي'
            }
            aria-label={
              theme === 'dark'
                ? 'تفعيل الوضع النهاري'
                : 'تفعيل الوضع الليلي'
            }
            className="
              flex
              h-8
              w-8
              sm:h-8.5
              sm:w-8.5
              items-center
              justify-center
              rounded-xl
              border
              border-slate-200
              dark:border-slate-800
              bg-slate-50
              dark:bg-slate-900
              text-slate-600
              dark:text-gold-400
              hover:bg-slate-100
              dark:hover:bg-slate-800
              transition-colors
              shrink-0
            "
          >
            {theme === 'dark' ? (
              <Sun
                className="h-3.5 w-3.5"
              />
            ) : (
              <Moon
                className="h-3.5 w-3.5"
              />
            )}
          </button>

          {/* =================================================
              ADMIN BUTTON
              ================================================= */}
          {canAccessAdmin && (
            <Link
              href="/admin"
              className="
                flex
                items-center
                justify-center
                gap-1.5
                rounded-xl
                bg-[#4F5DE4]
                hover:bg-[#3d49cb]
                text-white
                font-bold
                h-9
                w-9
                xl:w-auto
                xl:h-auto
                xl:px-2.5
                xl:py-2
                text-xs
                shadow-md
                transition-all
                hover:scale-105
                shrink-0
                whitespace-nowrap
              "
              title={
                isAdmin
                  ? 'لوحة تحكم المشرف العام'
                  : `لوحة تحكم مشرف منهج ${
                      ARAB_COUNTRIES.find(
                        (c) =>
                          c.code ===
                          profile?.assignedCountry
                      )?.name || ''
                    }`
              }
              aria-label={
                isAdmin
                  ? 'لوحة الإدارة'
                  : 'لوحة المشرف'
              }
            >
              <ShieldCheck
                className="
                  h-4
                  w-4
                  text-[#fed7aa]
                "
              />

              <span className="hidden xl:inline">
                {isAdmin
                  ? 'لوحة الإدارة'
                  : 'المشرف'}
              </span>
            </Link>
          )}

          {/* =================================================
              USER MENU
              ================================================= */}
          {user ? (
            <div
              className="
                relative
                shrink-0
              "
            >
              <button
                type="button"
                onClick={() =>
                  setUserDropdown(
                    !userDropdown
                  )
                }
                aria-expanded={userDropdown}
                className="
                  flex
                  items-center
                  gap-1.5
                  rounded-xl
                  border
                  border-[#E0E3FD]
                  dark:border-[#373261]
                  bg-[#F1F2FD]
                  dark:bg-[#242045]
                  p-1.5
                  xl:pr-2.5
                  text-xs
                  font-bold
                  text-[#2A254D]
                  dark:text-slate-200
                  hover:bg-[#E0E3FD]/60
                  dark:hover:bg-[#1A1736]
                  transition-colors
                  shrink-0
                "
              >
                <div
                  className="
                    flex
                    h-7
                    w-7
                    items-center
                    justify-center
                    rounded-full
                    bg-[#4F5DE4]
                    text-white
                    text-xs
                    font-black
                    shadow-sm
                  "
                >
                  {profile?.displayName?.charAt(0) ||
                    'ط'}
                </div>

                <span
                  className="
                    max-w-[90px]
                    truncate
                    hidden
                    xl:inline
                    text-xs
                    font-bold
                  "
                >
                  {profile?.displayName ||
                    'حسابي'}
                </span>

                <ChevronDown
                  className="
                    h-3.5
                    w-3.5
                    text-slate-400
                  "
                />
              </button>

              {/* User dropdown */}
              {userDropdown && (
                <div
                  className="
                    absolute
                    left-0
                    mt-2
                    w-56
                    rounded-2xl
                    border
                    border-[#E0E3FD]
                    dark:border-[#373261]
                    bg-white
                    dark:bg-[#242045]
                    p-2
                    shadow-xl
                    animate-fade-in
                    z-[90]
                  "
                >
                  {/* User information */}
                  <div
                    className="
                      px-3
                      py-2
                      border-b
                      border-slate-100
                      dark:border-slate-800
                      mb-1
                    "
                  >
                    <p
                      className="
                        text-xs
                        font-bold
                        text-slate-900
                        dark:text-white
                        truncate
                      "
                    >
                      {profile?.displayName}
                    </p>

                    <p
                      className="
                        text-[10px]
                        text-slate-400
                        truncate
                      "
                    >
                      {profile?.email}
                    </p>

                    {isModerator &&
                      profile?.assignedCountry && (
                        <p
                          className="
                            text-[10px]
                            text-[#4F5DE4]
                            dark:text-[#aab5f5]
                            font-bold
                            mt-1
                            bg-[#F1F2FD]
                            dark:bg-[#1A1736]
                            p-1
                            rounded-lg
                          "
                        >
                          🛡️ مشرف منهج:{' '}
                          {
                            ARAB_COUNTRIES.find(
                              (c) =>
                                c.code ===
                                profile.assignedCountry
                            )?.name
                          }
                        </p>
                      )}

                    {!isModerator &&
                      profile?.country && (
                        <p
                          className="
                            text-[10px]
                            text-[#4F5DE4]
                            font-semibold
                            mt-0.5
                          "
                        >
                          {
                            ARAB_COUNTRIES.find(
                              (c) =>
                                c.code ===
                                profile.country
                            )?.flag
                          }{' '}
                          {
                            ARAB_COUNTRIES.find(
                              (c) =>
                                c.code ===
                                profile.country
                            )?.name.replace(
                              'المملكة العربية ',
                              ''
                            )
                          }
                        </p>
                      )}
                  </div>

                  {/* User links */}
                  <div className="space-y-0.5">
                    <Link
                      href="/profile"
                      className="
                        flex
                        items-center
                        gap-2
                        rounded-xl
                        px-3
                        py-2
                        text-xs
                        text-[#2A254D]
                        dark:text-slate-200
                        hover:bg-[#F1F2FD]
                        dark:hover:bg-[#1A1736]
                        font-medium
                      "
                    >
                      <UserIcon
                        className="
                          h-4
                          w-4
                          text-[#4F5DE4]
                        "
                      />

                      <span>
                        الملف الشخصي
                      </span>
                    </Link>

                    <Link
                      href="/profile?tab=saved"
                      className="
                        flex
                        items-center
                        gap-2
                        rounded-xl
                        px-3
                        py-2
                        text-xs
                        text-[#2A254D]
                        dark:text-slate-200
                        hover:bg-[#F1F2FD]
                        dark:hover:bg-[#1A1736]
                        font-medium
                      "
                    >
                      <Bookmark
                        className="
                          h-4
                          w-4
                          text-[#F57005]
                        "
                      />

                      <span>
                        الدروس المحفوظة
                      </span>
                    </Link>

                    {canAccessAdmin && (
                      <Link
                        href="/admin"
                        className="
                          flex
                          items-center
                          gap-2
                          rounded-xl
                          px-3
                          py-2
                          text-xs
                          text-[#4F5DE4]
                          dark:text-[#aab5f5]
                          hover:bg-[#F1F2FD]
                          dark:hover:bg-[#1A1736]
                          font-bold
                        "
                      >
                        <ShieldCheck
                          className="
                            h-4
                            w-4
                          "
                        />

                        <span>
                          {isAdmin
                            ? 'لوحة تحكم المشرف العام'
                            : 'لوحة تحكم المشرف'}
                        </span>
                      </Link>
                    )}
                  </div>

                  {/* Logout */}
                  <div
                    className="
                      border-t
                      border-slate-100
                      dark:border-slate-800
                      pt-1
                      mt-1
                    "
                  >
                    <button
                      type="button"
                      onClick={() => logout()}
                      className="
                        flex
                        w-full
                        items-center
                        gap-2
                        rounded-xl
                        px-3
                        py-2
                        text-xs
                        text-rose-600
                        hover:bg-rose-50
                        dark:hover:bg-rose-950/40
                        font-bold
                      "
                    >
                      <LogOut
                        className="
                          h-4
                          w-4
                        "
                      />

                      <span>
                        تسجيل الخروج
                      </span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* =================================================
               LOGIN / REGISTER
               ================================================= */
            <div
              className="
                flex
                items-center
                gap-1.5
                sm:gap-2
              "
            >
              <Link
                href="/auth/login"
                className="
                  hidden
                  sm:inline-flex
                  items-center
                  gap-1
                  rounded-xl
                  border
                  border-slate-200
                  dark:border-slate-700
                  bg-white
                  dark:bg-slate-900
                  hover:bg-slate-50
                  dark:hover:bg-slate-800
                  text-[#2A254D]
                  dark:text-slate-200
                  font-bold
                  px-3
                  py-2
                  text-xs
                  transition-colors
                  shadow-xs
                "
              >
                <span>
                  تسجيل دخول
                </span>
              </Link>

              <Link
                href="/auth/register"
                className="
                  flex
                  items-center
                  gap-1.5
                  rounded-xl
                  bg-[#F57005]
                  hover:bg-[#ea580c]
                  text-white
                  font-bold
                  px-3.5
                  sm:px-4
                  py-2
                  text-xs
                  shadow-md
                  shadow-[#F57005]/20
                  hover:shadow-lg
                  transition-all
                  duration-200
                  whitespace-nowrap
                "
              >
                <UserIcon
                  className="
                    h-3.5
                    w-3.5
                  "
                />

                <span>
                  إنشاء حساب
                </span>
              </Link>
            </div>
          )}

          {/* =================================================
              MOBILE MENU BUTTON
              ================================================= */}
          <button
            type="button"
            onClick={() =>
              setMobileMenuOpen(
                !mobileMenuOpen
              )
            }
            aria-label="القائمة"
            aria-expanded={mobileMenuOpen}
            className="
              flex
              lg:hidden
              h-8
              w-8
              sm:h-9
              sm:w-9
              items-center
              justify-center
              rounded-xl
              border
              border-slate-200
              dark:border-slate-800
              text-slate-700
              dark:text-slate-200
              hover:bg-slate-100
              dark:hover:bg-slate-800
              transition-colors
            "
          >
            {mobileMenuOpen ? (
              <X
                className="h-5 w-5"
              />
            ) : (
              <Menu
                className="h-5 w-5"
              />
            )}
          </button>
        </div>
      </div>

      {/* =====================================================
          MOBILE DRAWER
          ===================================================== */}
      {mobileMenuOpen && (
        <div
          className="
            lg:hidden
            border-t
            border-slate-200
            dark:border-slate-800
            bg-white
            dark:bg-slate-950
            px-4
            pt-4
            pb-6
            space-y-3
            shadow-2xl
            animate-fade-in
          "
        >
          {/* Mobile search */}
          <form
            onSubmit={handleSearch}
            className="relative"
          >
            <input
              type="text"
              placeholder="ابحث عن درس، مادة، صف..."
              value={searchQuery}
              onChange={(e) =>
                setSearchQuery(
                  e.target.value
                )
              }
              className="
                w-full
                rounded-xl
                border
                border-slate-200
                dark:border-slate-700
                bg-slate-50
                dark:bg-slate-900
                py-2.5
                pr-10
                pl-3
                text-xs
                text-slate-800
                dark:text-slate-200
                focus:outline-none
                focus:ring-2
                focus:ring-primary-500
              "
            />

            <Search
              className="
                absolute
                right-3.5
                top-3
                h-4
                w-4
                text-slate-400
              "
            />
          </form>

          {/* =================================================
              MOBILE ADMIN COUNTRY SWITCHER
              ================================================= */}
          {isAdmin && (
            <div>
              <p
                className="
                  text-[10px]
                  font-bold
                  text-slate-400
                  px-1
                  mb-2
                  flex
                  items-center
                  gap-1.5
                "
              >
                <Globe2
                  className="h-3 w-3"
                />

                تبديل المنهج (للمشرف):
              </p>

              <div
                className="
                  grid
                  grid-cols-4
                  gap-1.5
                "
              >
                {ARAB_COUNTRIES.map((c) => (
                  <button
                    key={c.code}
                    type="button"
                    onClick={() =>
                      setSelectedCountry(
                        c.code
                      )
                    }
                    className={`
                      flex
                      flex-col
                      items-center
                      gap-0.5
                      rounded-xl
                      border-2
                      py-2
                      text-[9px]
                      font-bold
                      transition-all
                      ${
                        selectedCountry ===
                        c.code
                          ? `
                            border-primary-500
                            bg-primary-50
                            dark:bg-primary-900/30
                            text-primary-700
                            dark:text-primary-300
                          `
                          : `
                            border-slate-200
                            dark:border-slate-700
                            text-slate-600
                            dark:text-slate-400
                            hover:border-primary-300
                          `
                      }
                    `}
                  >
                    <span
                      className="text-lg"
                    >
                      {c.flag}
                    </span>

                    <span
                      className="
                        leading-tight
                        text-center
                      "
                    >
                      {c.name
                        .replace(
                          'المملكة العربية ',
                          ''
                        )
                        .replace(
                          'جمهورية ',
                          ''
                        )
                        .replace(
                          ' الأردنية الهاشمية',
                          ''
                        )
                        .replace(
                          ' العربية المتحدة',
                          ''
                        )
                        .replace(
                          'مناهج ومهارات عربية عامة',
                          'عام'
                        )}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* =================================================
              MOBILE NAV LINKS
              ================================================= */}
          <div
            className="
              space-y-1
              pt-1
            "
          >
            {[
              ...mainNavLinks,
              ...moreLinks,
            ].map((link) => {
              const Icon = link.icon;

              const isActive =
                pathname === link.href ||
                (
                  link.href !== '/' &&
                  pathname.startsWith(
                    link.href
                  )
                );

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`
                    flex
                    items-center
                    justify-between
                    rounded-xl
                    px-3.5
                    py-2.5
                    text-sm
                    font-bold
                    transition-colors
                    ${
                      isActive
                        ? `
                          bg-[#F1F2FD]
                          dark:bg-[#242045]
                          text-[#4F5DE4]
                          dark:text-[#aab5f5]
                        `
                        : `
                          text-slate-800
                          dark:text-slate-200
                          hover:bg-slate-100
                          dark:hover:bg-slate-900
                        `
                    }
                  `}
                >
                  <div
                    className="
                      flex
                      items-center
                      gap-2
                    "
                  >
                    {Icon && (
                      <Icon
                        className="
                          h-4
                          w-4
                          opacity-70
                        "
                      />
                    )}

                    <span>
                      {link.name}
                    </span>
                  </div>

                  <span
                    className="
                      text-slate-400
                      text-xs
                    "
                  >
                    ←
                  </span>
                </Link>
              );
            })}

            {/* Mobile admin */}
            {canAccessAdmin && (
              <Link
                href="/admin"
                className="
                  flex
                  items-center
                  justify-between
                  rounded-xl
                  px-3.5
                  py-2.5
                  text-sm
                  font-bold
                  text-amber-600
                  dark:text-gold-400
                  bg-amber-50
                  dark:bg-slate-900
                  mt-2
                "
              >
                <div
                  className="
                    flex
                    items-center
                    gap-2
                  "
                >
                  <ShieldCheck
                    className="
                      h-4
                      w-4
                    "
                  />

                  <span>
                    {isAdmin
                      ? 'لوحة تحكم المشرف العام'
                      : 'لوحة تحكم المشرف'}
                  </span>
                </div>

                <span className="text-xs">
                  ←
                </span>
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}