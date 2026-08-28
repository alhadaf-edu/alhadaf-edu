'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { YouTubeVideo } from '@/types';
import { Youtube, Play, ExternalLink, Calendar, X } from 'lucide-react';

interface LatestYouTubeVideosProps {
  videos: YouTubeVideo[];
}

export default function LatestYouTubeVideos({ videos }: LatestYouTubeVideosProps) {
  const [activeVideoId, setActiveVideoId] = useState<string | null>(null);

  const activeVideo = videos.find((v) => v.id === activeVideoId);

  if (videos.length === 0) return null;

  return (
    <section className="py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 px-3 py-1 rounded-full mb-2">
              <Youtube className="h-4 w-4" />
              <span>مزامنة مباشرة مع قناة الْهَدَّاف على YouTube</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white font-heading">
              أحدث الفيديوهات والشروحات المرفوعة
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              تابع الشروحات اليومية مباشرة فور رفعها على القناة الرسمية.
            </p>
          </div>

          <a
            href="https://www.youtube.com/channel/UCb9BGNPlPd2dzg9lJsIaFYQ?sub_confirmation=1"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-xl bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 text-xs font-bold shadow-md shadow-red-600/20 transition-all hover:scale-105"
          >
            <Youtube className="h-4 w-4" />
            <span>اشتراك في القناة مجاناً</span>
          </a>
        </div>

        {/* Videos Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {videos.slice(0, 6).map((video) => (
            <div
              key={video.id}
              className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/90 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
            >
              {/* Thumbnail with overlay */}
              <div className="relative aspect-video w-full overflow-hidden bg-slate-950">
                <Image
                  src={video.thumbnailUrl || `https://i.ytimg.com/vi/${video.id}/hqdefault.jpg`}
                  alt={video.title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors" />

                {/* Play Button */}
                <button
                  onClick={() => setActiveVideoId(video.id)}
                  className="absolute inset-0 flex items-center justify-center"
                  aria-label={`تشغيل ${video.title}`}
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-600 text-white shadow-lg transition-transform duration-300 group-hover:scale-110">
                    <Play className="h-6 w-6 fill-current pr-0.5" />
                  </div>
                </button>

                {video.duration && (
                  <div className="absolute bottom-2.5 left-2.5 rounded bg-black/70 px-2 py-0.5 text-[11px] font-semibold text-white">
                    {video.duration}
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex flex-1 flex-col p-4">
                <h3 className="line-clamp-2 text-sm font-bold text-slate-800 dark:text-slate-100 group-hover:text-primary-600 dark:group-hover:text-gold-400 transition-colors leading-snug">
                  {video.title}
                </h3>

                <p className="mt-2 line-clamp-2 text-xs text-slate-500 dark:text-slate-400">
                  {video.description}
                </p>

                <div className="mt-auto pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-400">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>{new Date(video.publishedAt).toLocaleDateString('ar-SA')}</span>
                  </span>

                  <button
                    onClick={() => setActiveVideoId(video.id)}
                    className="font-bold text-red-600 dark:text-red-400 hover:underline flex items-center gap-1"
                  >
                    <span>مشاهدة الآن</span>
                    <span>←</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Modal Player */}
        {activeVideo && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-fade-in">
            <div className="relative w-full max-w-4xl overflow-hidden rounded-3xl bg-slate-900 shadow-2xl border border-slate-700">
              
              <div className="flex items-center justify-between bg-slate-950 px-6 py-4 border-b border-slate-800">
                <h3 className="text-sm sm:text-base font-bold text-white truncate max-w-[80%]">
                  {activeVideo.title}
                </h3>
                <button
                  onClick={() => setActiveVideoId(null)}
                  className="rounded-full bg-slate-800 p-1.5 text-slate-400 hover:text-white transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="relative aspect-video w-full bg-black">
                <iframe
                  src={`https://www.youtube.com/embed/${activeVideo.id}?autoplay=1&rel=0`}
                  title={activeVideo.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="absolute inset-0 h-full w-full border-0"
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-slate-950/80 text-xs">
                <a
                  href={`https://www.youtube.com/watch?v=${activeVideo.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-gold-400 hover:underline font-bold"
                >
                  <span>فتح في YouTube</span>
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>

                <button
                  onClick={() => setActiveVideoId(null)}
                  className="rounded-xl bg-slate-800 px-4 py-2 font-bold text-white hover:bg-slate-700"
                >
                  إغلاق
                </button>
              </div>

            </div>
          </div>
        )}

      </div>
    </section>
  );
}
