import React from 'react';
import type { Metadata } from 'next';
import { fetchChannelVideos, fetchPlaylists } from '@/lib/youtube';
import LatestYouTubeVideos from '@/components/home/LatestYouTubeVideos';
import AdSenseSlot from '@/components/common/AdSenseSlot';
import IslamicPattern from '@/components/layout/IslamicPattern';
import { Youtube, PlaySquare, ListVideo, ExternalLink, Sparkles } from 'lucide-react';

export const metadata: Metadata = {
  title: 'مكتبة الفيديو وقوائم التشغيل التعليمية',
  description: 'تصفح كافة الفيديوهات وقوائم التشغيل التعليمية لقناة الهداف على اليوتيوب للمناهج السعودية.',
};

export const revalidate = 3600;

export default async function VideosPage() {
  const [videos, playlists] = await Promise.all([
    fetchChannelVideos(18),
    fetchPlaylists(),
  ]);

  return (
    <div className="min-h-screen py-10 bg-slate-50/60 dark:bg-slate-950/40">
      
      {/* Header Banner */}
      <div className="relative bg-gradient-to-r from-red-950 via-slate-950 to-primary-950 text-white py-14 overflow-hidden mb-10">
        <IslamicPattern variant="stars" opacity={0.06} />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-red-500/30 bg-red-600/10 px-4 py-1 text-xs font-bold text-red-400 mb-3">
            <Youtube className="h-4 w-4" />
            <span>قناة الهداف التعليمية الرسمية</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black font-heading text-white">
            مكتبة الشروحات وقوائم التشغيل
          </h1>
          <p className="mt-3 text-xs sm:text-base text-slate-200 max-w-2xl mx-auto">
            مكتبة مرئية شاملة مرتبة بحسب الصفوف والمواد والمواضيع الدراسية لتسهيل الوصول والمشاهدة.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Top Ad */}
        <AdSenseSlot slotType="headerBanner" />

        {/* Playlists Section */}
        <div className="mb-14">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <ListVideo className="h-5 w-5 text-red-600 dark:text-red-400" />
                <span>قوائم التشغيل التعليمية</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                سلاسل الدروس المنظمة بحسب المرحلة والموضوع
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {playlists.map((pl) => (
              <div
                key={pl.id}
                className="group relative flex flex-col overflow-hidden rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/90 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                <div className="relative aspect-video w-full overflow-hidden bg-slate-950">
                  <img
                    src={pl.thumbnail}
                    alt={pl.title}
                    className="h-full w-full object-cover group-hover:scale-105 transition-transform"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                  <div className="absolute bottom-3 right-3 flex items-center gap-1 text-xs font-bold text-white bg-black/60 px-2.5 py-1 rounded-lg backdrop-blur-xs">
                    <PlaySquare className="h-3.5 w-3.5 text-gold-400" />
                    <span>{pl.count} فيديو</span>
                  </div>
                </div>

                <div className="flex flex-1 flex-col p-5">
                  <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 group-hover:text-red-600 transition-colors">
                    {pl.title}
                  </h3>
                  <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                    {pl.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Live Channel Videos Grid */}
        <LatestYouTubeVideos videos={videos} />

        {/* Bottom Banner */}
        <div className="mt-12">
          <AdSenseSlot slotType="footerBanner" />
        </div>

      </div>
    </div>
  );
}
