'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useLessons } from '@/context/LessonsContext';
import { useAuth } from '@/context/AuthContext';
import AdSenseSlot from '@/components/common/AdSenseSlot';
import { Search, Filter, BookOpen, X, Play, Clock, Eye, Globe2, GraduationCap } from 'lucide-react';
import { ARAB_COUNTRIES, getSubjectsForCountry } from '@/lib/curriculumData';
import { CountryCode, StageType } from '@/types';

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { lessons, loading, selectedCountry } = useLessons();
  const { isAdmin, profile } = useAuth();

  const initialQ = searchParams.get('q') || '';
  const [query, setQuery] = useState(initialQ);
  const [liveQuery, setLiveQuery] = useState(initialQ);
  const [filterCountry, setFilterCountry] = useState<CountryCode | ''>('');
  const [filterStage, setFilterStage] = useState<StageType | ''>('');
  const [filterSubject, setFilterSubject] = useState('');
  const [filterGrade, setFilterGrade] = useState<number | ''>('');

  // Sync URL query param into state
  useEffect(() => {
    const q = searchParams.get('q') || '';
    setQuery(q);
    setLiveQuery(q);
  }, [searchParams]);

  // Default country filter from user profile (non-admin)
  useEffect(() => {
    if (!isAdmin && profile?.country) {
      setFilterCountry(profile.country);
    }
  }, [isAdmin, profile]);

  // Live search debounce
  useEffect(() => {
    const timer = setTimeout(() => setLiveQuery(query), 250);
    return () => clearTimeout(timer);
  }, [query]);

  const availableSubjects = useMemo(() => {
    const country = filterCountry || selectedCountry;
    return getSubjectsForCountry(country as CountryCode, filterStage || undefined);
  }, [filterCountry, selectedCountry, filterStage]);

  const filteredLessons = useMemo(() => {
    const q = liveQuery.trim().toLowerCase();
    return lessons.filter((lesson) => {
      // Country filter strictly
      const lessonCountry = lesson.country || 'sa';
      const targetCountry = filterCountry || (!isAdmin && profile?.country) || (selectedCountry !== 'general' ? selectedCountry : '');
      if (targetCountry && lessonCountry !== targetCountry) return false;

      const matchesSearch = !q ||
        lesson.title.toLowerCase().includes(q) ||
        lesson.description.toLowerCase().includes(q) ||
        lesson.subjectName.toLowerCase().includes(q) ||
        (lesson.unitTitle || '').toLowerCase().includes(q);

      const matchesStage = !filterStage || lesson.stage === filterStage;
      const matchesSubject = !filterSubject || lesson.subjectId === filterSubject;
      const matchesGrade = !filterGrade || lesson.gradeNumber === filterGrade;

      return matchesSearch && matchesStage && matchesSubject && matchesGrade;
    });
  }, [lessons, liveQuery, filterCountry, filterStage, filterSubject, filterGrade, isAdmin, profile]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  const clearFilters = () => {
    setFilterStage('');
    setFilterSubject('');
    setFilterGrade('');
    if (isAdmin) setFilterCountry('');
  };

  const hasActiveFilters = filterStage || filterSubject || filterGrade || (isAdmin && filterCountry);

  const stageNames: Record<StageType, string> = {
    elementary: 'الابتدائية',
    middle: 'المتوسطة / الإعدادية',
    secondary: 'الثانوية',
    primary: 'الابتدائية',
    general: 'عام / لكافة المراحل',
  };

  const gradeLabels = ['الأول', 'الثاني', 'الثالث', 'الرابع', 'الخامس', 'السادس'];

  return (
    <div className="min-h-screen py-10 bg-slate-50/60 dark:bg-slate-950/40">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary-100 dark:bg-primary-900/30 px-4 py-1.5 mb-3">
            <Search className="h-4 w-4 text-primary-600 dark:text-primary-400" />
            <span className="text-xs font-bold text-primary-700 dark:text-primary-300">محرك البحث التعليمي</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-heading mb-2">
            ابحث في دروس منصة الهَدَّاف
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            ابحث بأي كلمة: اسم الدرس، المادة، المرحلة، أو الوحدة الدراسية
            {!isAdmin && profile?.country && (
              <span className="mr-2 text-primary-600 dark:text-gold-400 font-semibold">
                — منهج {ARAB_COUNTRIES.find(c => c.code === profile.country)?.flag}{' '}
                {ARAB_COUNTRIES.find(c => c.code === profile.country)?.name.replace('المملكة العربية ', '').replace('جمهورية ', '')}
              </span>
            )}
          </p>
        </div>

        {/* Search Form */}
        <form
          onSubmit={handleSearch}
          className="mx-auto max-w-2xl rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-3 shadow-md mb-6 flex gap-2"
        >
          <div className="relative flex-1">
            <Search className="absolute right-3.5 top-3.5 h-4 w-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="مثال: رياضيات ثاني متوسط، الأعداد النسبية، فيزياء مسارات..."
              className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 py-2.5 pr-10 pl-4 text-sm text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:border-primary-500 focus:outline-none"
              autoFocus
            />
          </div>
          <button
            type="submit"
            className="flex items-center gap-2 rounded-2xl bg-primary-600 hover:bg-primary-700 text-white px-5 py-2.5 text-sm font-bold shadow transition-colors"
          >
            <Search className="h-4 w-4" />
            <span className="hidden sm:inline">بحث</span>
          </button>
        </form>

        {/* Filters Bar */}
        <div className="mb-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
          <div className="flex items-center gap-2 mb-3">
            <Filter className="h-4 w-4 text-slate-500" />
            <span className="text-xs font-black text-slate-600 dark:text-slate-300">تصفية النتائج:</span>
            {hasActiveFilters && (
              <button onClick={clearFilters} className="flex items-center gap-1 text-xs text-rose-500 hover:underline mr-auto">
                <X className="h-3.5 w-3.5" />إلغاء كل الفلاتر
              </button>
            )}
          </div>

          <div className="flex flex-wrap gap-3">
            {/* Country Filter — admin only */}
            {isAdmin && (
              <div>
                <p className="text-[10px] font-bold text-slate-400 mb-1.5 flex items-center gap-1">
                  <Globe2 className="h-3 w-3" /> الدولة / المنهج:
                </p>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    onClick={() => setFilterCountry('')}
                    className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-colors ${!filterCountry ? 'bg-primary-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'}`}
                  >
                    🌐 الكل
                  </button>
                  {ARAB_COUNTRIES.map((c) => (
                    <button
                      key={c.code}
                      onClick={() => { setFilterCountry(c.code); setFilterSubject(''); }}
                      className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-colors ${filterCountry === c.code ? 'bg-primary-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'}`}
                    >
                      {c.flag} {c.name.replace('المملكة العربية ', '').replace('جمهورية ', '').replace(' الأردنية الهاشمية', '').replace(' العربية المتحدة', '')}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Stage Filter */}
            <div>
              <p className="text-[10px] font-bold text-slate-400 mb-1.5 flex items-center gap-1">
                <GraduationCap className="h-3 w-3" /> المرحلة:
              </p>
              <div className="flex flex-wrap gap-1.5">
                {[{ id: '' as StageType | '', name: 'الكل' }, 
                  { id: 'elementary' as StageType, name: 'الابتدائية' },
                  { id: 'middle' as StageType, name: 'المتوسطة / الإعدادية' },
                  { id: 'secondary' as StageType, name: 'الثانوية' }
                ].map((s) => (
                  <button
                    key={s.id}
                    onClick={() => { setFilterStage(s.id); setFilterSubject(''); setFilterGrade(''); }}
                    className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-colors ${filterStage === s.id ? 'bg-primary-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'}`}
                  >
                    {s.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Grade Filter */}
            {filterStage && (
              <div>
                <p className="text-[10px] font-bold text-slate-400 mb-1.5">الصف:</p>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    onClick={() => setFilterGrade('')}
                    className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-colors ${!filterGrade ? 'bg-primary-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'}`}
                  >
                    الكل
                  </button>
                  {[1,2,3,4,5,6].slice(0, filterStage === 'elementary' ? 6 : 3).map((g) => (
                    <button
                      key={g}
                      onClick={() => setFilterGrade(filterGrade === g ? '' : g)}
                      className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-colors ${filterGrade === g ? 'bg-primary-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'}`}
                    >
                      {gradeLabels[g-1]}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Subject Filter */}
            {availableSubjects.length > 0 && (
              <div>
                <p className="text-[10px] font-bold text-slate-400 mb-1.5">المادة:</p>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    onClick={() => setFilterSubject('')}
                    className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-colors ${!filterSubject ? 'bg-primary-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'}`}
                  >
                    الكل
                  </button>
                  {availableSubjects.map((sub) => (
                    <button
                      key={sub.id}
                      onClick={() => setFilterSubject(filterSubject === sub.id ? '' : sub.id)}
                      className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-colors ${filterSubject === sub.id ? 'bg-primary-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'}`}
                    >
                      {sub.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Ad */}
        <AdSenseSlot slotType="headerBanner" />

        {/* Results */}
        <div className="mt-6">
          <div className="mb-4 flex items-center justify-between">
            <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
              {loading ? (
                <span className="animate-pulse">جاري البحث...</span>
              ) : (
                <>
                  <span className="text-primary-600 dark:text-gold-400">{filteredLessons.length}</span>{' '}
                  نتيجة
                  {liveQuery && <span className="text-slate-500 font-normal mr-1">بحثاً عن "<span className="font-bold text-slate-700 dark:text-slate-200">{liveQuery}</span>"</span>}
                </>
              )}
            </span>
            {filteredLessons.length > 0 && (
              <span className="text-[11px] text-slate-400">مرتبة حسب الأحدث</span>
            )}
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {[1,2,3,4,5,6,7,8].map(i => (
                <div key={i} className="h-52 rounded-2xl animate-pulse bg-slate-200 dark:bg-slate-800" />
              ))}
            </div>
          ) : filteredLessons.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {filteredLessons.map((lesson) => {
                const countryInfo = ARAB_COUNTRIES.find(c => c.code === lesson.country);
                return (
                  <Link
                    key={lesson.id}
                    href={`/lessons/${lesson.id}`}
                    className="group rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden hover:shadow-lg hover:border-primary-300 dark:hover:border-primary-700 transition-all duration-200"
                  >
                    {/* Thumbnail */}
                    <div className="relative aspect-video bg-slate-800 overflow-hidden">
                      <img
                        src={lesson.thumbnailUrl || `https://i.ytimg.com/vi/${lesson.youtubeId}/hqdefault.jpg`}
                        alt={lesson.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-colors" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 backdrop-blur group-hover:bg-primary-600/90 transition-all">
                          <Play className="h-4 w-4 text-white fill-white" />
                        </div>
                      </div>
                      {lesson.duration && (
                        <div className="absolute bottom-2 left-2 flex items-center gap-1 rounded-lg bg-black/70 px-2 py-0.5">
                          <Clock className="h-3 w-3 text-white" />
                          <span className="text-[10px] text-white font-medium">{lesson.duration}</span>
                        </div>
                      )}
                      {countryInfo && (
                        <div className="absolute top-2 right-2 text-lg leading-none" title={countryInfo.name}>
                          {countryInfo.flag}
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="p-3">
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <span className="rounded-lg bg-primary-100 dark:bg-primary-900/30 px-2 py-0.5 text-[10px] font-bold text-primary-700 dark:text-primary-300">
                          {lesson.subjectName}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {stageNames[lesson.stage]} · الصف {gradeLabels[lesson.gradeNumber - 1] || lesson.gradeNumber}
                        </span>
                      </div>
                      <h3 className="text-xs font-bold text-slate-800 dark:text-slate-100 line-clamp-2 group-hover:text-primary-600 dark:group-hover:text-gold-400 leading-snug mb-2">
                        {lesson.title}
                      </h3>
                      <div className="flex items-center gap-3 text-[10px] text-slate-400">
                        <span className="flex items-center gap-1"><Eye className="h-3 w-3" />{lesson.viewsCount?.toLocaleString('ar-EG')}</span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="rounded-3xl border border-dashed border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900/60 py-20 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 mb-4">
                <BookOpen className="h-8 w-8 text-slate-400" />
              </div>
              <h3 className="text-base font-bold text-slate-800 dark:text-white mb-1">
                لم يُوجد نتائج مطابقة
              </h3>
              <p className="text-xs text-slate-500 max-w-xs mx-auto mb-5">
                جرب كلمة مفتاحية أخرى أو قم بتغيير فلاتر البحث لعرض المزيد من الدروس.
              </p>
              <div className="flex items-center justify-center gap-3">
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="flex items-center gap-1.5 rounded-xl border border-slate-300 dark:border-slate-700 px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                  >
                    <X className="h-3.5 w-3.5" /> إلغاء الفلاتر
                  </button>
                )}
                <Link
                  href="/curriculum"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 text-xs font-bold transition-colors"
                >
                  <BookOpen className="h-3.5 w-3.5" />
                  تصفح جميع الدروس
                </Link>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary-600 border-t-transparent rounded-full" />
      </div>
    }>
      <SearchContent />
    </Suspense>
  );
}
