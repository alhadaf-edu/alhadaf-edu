'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Lesson } from '@/types';
import GradeBadge from './GradeBadge';
import { Play, FileText, HelpCircle, Eye, Bookmark, Heart, Clock } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface LessonCardProps {
  lesson: Lesson;
  className?: string;
}

export default function LessonCard({ lesson, className = '' }: LessonCardProps) {
  const { toggleSaveLesson, isLessonSaved } = useAuth();
  const saved = isLessonSaved(lesson.id);

  const defaultThumbnail = `https://i.ytimg.com/vi/${lesson.youtubeId}/hqdefault.jpg`;
  const thumbnail = lesson.thumbnailUrl || defaultThumbnail;

  return (
    <div className={`group relative flex flex-col overflow-hidden rounded-3xl border border-[#E0E3FD] dark:border-[#373261] bg-white dark:bg-[#242045] shadow-tiqdr transition-all duration-300 hover:-translate-y-1 hover:shadow-tiqdr-hover hover:border-[#4F5DE4] dark:hover:border-[#7c8bee] ${className}`}>
      {/* Thumbnail Area */}
      <div className="relative aspect-video w-full overflow-hidden bg-slate-950">
        <Image
          src={thumbnail}
          alt={lesson.title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-80 transition-opacity group-hover:opacity-90" />

        {/* Play Icon Overlay */}
        <Link 
          href={`/lessons/${lesson.id}`}
          className="absolute inset-0 flex items-center justify-center"
          aria-label={`مشاهدة درس ${lesson.title}`}
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#4F5DE4]/90 text-white shadow-lg backdrop-blur-sm transition-all duration-300 group-hover:scale-110 group-hover:bg-[#4F5DE4]">
            <Play className="h-6 w-6 fill-current pr-0.5" />
          </div>
        </Link>

        {/* Top Badges */}
        <div className="absolute top-3 right-3 flex items-center gap-2">
          <GradeBadge stage={lesson.stage} gradeNumber={lesson.gradeNumber} size="sm" />
        </div>

        {/* Save Bookmark Button */}
        <button
          onClick={(e) => {
            e.preventDefault();
            toggleSaveLesson(lesson.id);
          }}
          title={saved ? 'إزالة من المحفوظات' : 'حفظ الدرس'}
          className={`absolute top-3 left-3 flex h-8 w-8 items-center justify-center rounded-full backdrop-blur-md transition-colors ${
            saved
              ? 'bg-[#F57005] text-white'
              : 'bg-black/40 text-white hover:bg-black/70'
          }`}
        >
          <Bookmark className={`h-4 w-4 ${saved ? 'fill-current' : ''}`} />
        </button>

        {/* Bottom Info inside Thumbnail */}
        <div className="absolute bottom-2.5 right-3 left-3 flex items-center justify-between text-[11px] font-medium text-white/90">
          <span className="rounded bg-black/60 px-2 py-0.5 backdrop-blur-xs flex items-center gap-1">
            <Clock className="h-3 w-3 text-[#F57005]" />
            {lesson.duration || '20 دقيقة'}
          </span>
          <span className="rounded bg-black/60 px-2 py-0.5 backdrop-blur-xs flex items-center gap-1">
            <Eye className="h-3 w-3 text-slate-300" />
            {(lesson.viewsCount || 1000).toLocaleString('ar-SA')} مشاهدة
          </span>
        </div>
      </div>

      {/* Card Content */}
      <div className="flex flex-1 flex-col p-5">
        {/* Subject and Unit */}
        <div className="mb-2 flex items-center justify-between text-xs">
          <span className="font-bold text-[#4F5DE4] dark:text-[#aab5f5]">
            {lesson.subjectName}
          </span>
          {lesson.unitTitle && (
            <span className="truncate max-w-[150px] text-[11px] text-[#697585] dark:text-[#B3ADE1]">
              {lesson.unitTitle}
            </span>
          )}
        </div>

        {/* Title */}
        <Link href={`/lessons/${lesson.id}`} className="group-hover:text-[#4F5DE4] dark:group-hover:text-[#aab5f5] transition-colors">
          <h3 className="line-clamp-2 text-sm font-bold leading-relaxed text-[#2A254D] dark:text-slate-100">
            {lesson.title}
          </h3>
        </Link>

        {/* Description snippet */}
        <p className="mt-1.5 line-clamp-2 text-xs text-[#697585] dark:text-[#B3ADE1]">
          {lesson.description}
        </p>

        {/* Footer Badges & Actions */}
        <div className="mt-auto pt-4 flex items-center justify-between border-t border-[#E0E3FD]/60 dark:border-[#373261] text-xs">
          <div className="flex items-center gap-2">
            {lesson.pdfUrl && (
              <span className="flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium" title="ملخص PDF متاح">
                <FileText className="h-3.5 w-3.5" />
                <span>ملخص PDF</span>
              </span>
            )}
            {lesson.quiz && (
              <span className="flex items-center gap-1 text-[11px] text-[#F57005] font-medium" title="اختبار تقييمي متاح">
                <HelpCircle className="h-3.5 w-3.5" />
                <span>اختبار</span>
              </span>
            )}
          </div>

          <Link
            href={`/lessons/${lesson.id}`}
            className="inline-flex items-center gap-1 font-bold text-[#4F5DE4] hover:text-[#3d49cb] dark:text-[#aab5f5] text-xs transition-colors"
          >
            <span>ابدأ الدرس</span>
            <span className="text-xs">←</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
