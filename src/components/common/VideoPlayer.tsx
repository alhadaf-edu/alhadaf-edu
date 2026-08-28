'use client';

import React, { useState } from 'react';
import { Maximize2, Minimize2, ExternalLink, Lightbulb, Volume2 } from 'lucide-react';

interface VideoPlayerProps {
  youtubeId: string;
  title: string;
  className?: string;
}

export default function VideoPlayer({ youtubeId, title, className = '' }: VideoPlayerProps) {
  const [isTheater, setIsTheater] = useState(false);

  return (
    <div className={`relative flex flex-col overflow-hidden rounded-2xl bg-black shadow-2xl border border-slate-800 ${isTheater ? 'w-full max-w-7xl mx-auto' : ''} ${className}`}>
      {/* Player Frame */}
      <div className="relative aspect-video w-full">
        <iframe
          src={`https://www.youtube.com/embed/${youtubeId}?autoplay=0&rel=0&modestbranding=1&enablejsapi=1&origin=${typeof window !== 'undefined' ? window.location.origin : ''}`}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          className="absolute inset-0 h-full w-full border-0"
        />
      </div>

      {/* Video Control Bar */}
      <div className="flex items-center justify-between bg-slate-900 px-4 py-2.5 text-xs text-slate-300 border-t border-slate-800">
        <div className="flex items-center gap-2">
          <span className="inline-block h-2 w-2 rounded-full bg-red-500 animate-pulse" />
          <span className="font-semibold text-white truncate max-w-[280px] sm:max-w-md">
            {title}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsTheater(!isTheater)}
            className="hidden sm:flex items-center gap-1 text-slate-400 hover:text-white transition-colors"
            title={isTheater ? 'الوضع العادي' : 'وضع المسرح'}
          >
            {isTheater ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            <span>{isTheater ? 'تصغير' : 'مسرح'}</span>
          </button>

          <a
            href={`https://www.youtube.com/watch?v=${youtubeId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-gold-400 hover:text-gold-300 transition-colors"
          >
            <span>المشاهدة على YouTube</span>
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
}
