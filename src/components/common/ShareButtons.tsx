'use client';

import React, { useState } from 'react';
import { Share2, Check, Copy, MessageCircle, Twitter, Send } from 'lucide-react';

interface ShareButtonsProps {
  title: string;
  url?: string;
}

export default function ShareButtons({ title, url }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);
  const shareUrl = typeof window !== 'undefined' ? (url || window.location.href) : '';

  const handleCopy = () => {
    if (typeof navigator !== 'undefined') {
      navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(`${title}\n${shareUrl}`)}`;
  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(shareUrl)}`;
  const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(title)}`;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1">
        <Share2 className="h-3.5 w-3.5" />
        <span>مشاركة:</span>
      </span>

      {/* WhatsApp */}
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex h-8 items-center gap-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 px-2.5 text-xs font-semibold transition-colors"
        title="مشاركة عبر واتساب"
      >
        <MessageCircle className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">واتساب</span>
      </a>

      {/* X / Twitter */}
      <a
        href={twitterUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex h-8 items-center gap-1.5 rounded-lg bg-sky-500/10 hover:bg-sky-500/20 text-sky-600 dark:text-sky-400 px-2.5 text-xs font-semibold transition-colors"
        title="مشاركة عبر تويتر"
      >
        <Twitter className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">تويتر</span>
      </a>

      {/* Telegram */}
      <a
        href={telegramUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex h-8 items-center gap-1.5 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 px-2.5 text-xs font-semibold transition-colors"
        title="مشاركة عبر تليجرام"
      >
        <Send className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">تليجرام</span>
      </a>

      {/* Copy link */}
      <button
        onClick={handleCopy}
        className="flex h-8 items-center gap-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 px-2.5 text-xs font-semibold transition-colors"
        title="نسخ الرابط"
      >
        {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
        <span>{copied ? 'تم النسخ!' : 'نسخ'}</span>
      </button>
    </div>
  );
}
