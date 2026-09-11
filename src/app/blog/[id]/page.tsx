'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { 
  Calendar, 
  Clock, 
  User, 
  ArrowRight, 
  Share2, 
  BookOpen, 
  Sparkles, 
  CheckCircle2, 
  ArrowLeft,
  GraduationCap
} from 'lucide-react';
import { getArticleById, ALL_BLOG_ARTICLES, BlogArticle } from '@/lib/blogData';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import AdSenseSlot from '@/components/common/AdSenseSlot';
import ShareButtons from '@/components/common/ShareButtons';

interface ArticlePageProps {
  params: { id: string };
}

export default function ArticlePage({ params }: ArticlePageProps) {
  const [article, setArticle] = useState<BlogArticle | undefined>(() => getArticleById(params.id));

  useEffect(() => {
    // If not found in memory, try fetching from Firestore
    if (!article && db) {
      getDoc(doc(db, 'articles', params.id)).then((snap) => {
        if (snap.exists()) {
          setArticle(snap.data() as BlogArticle);
        }
      }).catch(e => console.warn(e));
    }
  }, [params.id, article]);

  if (!article) {
    return (
      <div className="min-h-screen py-20 text-center">
        <h2 className="text-xl font-bold">المقال غير موجود</h2>
        <Link href="/blog" className="mt-4 inline-block text-emerald-500 font-bold">
          العودة لقائمة المقالات
        </Link>
      </div>
    );
  }

  const relatedArticles = ALL_BLOG_ARTICLES.filter(a => a.id !== article.id).slice(0, 3);

  return (
    <div className="min-h-screen py-8 sm:py-12 bg-slate-50/50 dark:bg-slate-950/40">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400 mb-6 flex-wrap">
          <Link href="/" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
            الرئيسية
          </Link>
          <span>/</span>
          <Link href="/blog" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
            المدونة والمقالات
          </Link>
          <span>/</span>
          <span className="text-slate-800 dark:text-slate-200 font-bold truncate max-w-[200px] sm:max-w-md">
            {article.title}
          </span>
        </nav>

        {/* Top Ad */}
        <AdSenseSlot slotType="headerBanner" />

        {/* Article Header Card */}
        <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-6 sm:p-10 shadow-sm space-y-6">
          
          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60 px-3.5 py-1 text-xs font-bold">
              {article.category}
            </span>
            <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4 text-slate-400" />
                <span>{article.date}</span>
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-slate-400" />
                <span>{article.readTime}</span>
              </span>
              {article.author && (
                <span className="flex items-center gap-1.5">
                  <User className="h-4 w-4 text-slate-400" />
                  <span>{article.author}</span>
                </span>
              )}
            </div>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 dark:text-white font-heading leading-snug">
            {article.title}
          </h1>

          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed font-medium border-r-4 border-emerald-500 pr-4 bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl">
            {article.excerpt}
          </p>

          {/* Featured Image */}
          <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-slate-900 shadow-md">
            <img
              src={article.image}
              alt={article.title}
              className="h-full w-full object-cover"
            />
          </div>

          {/* Article Body Content */}
          <div className="space-y-6 text-sm sm:text-base text-slate-700 dark:text-slate-300 leading-loose pt-4">
            {article.content.map((paragraph, idx) => (
              <p key={idx} className="leading-relaxed">
                {paragraph}
              </p>
            ))}
          </div>

          {/* Study Tips Box (if available) */}
          {article.tips && article.tips.length > 0 && (
            <div className="rounded-2xl border border-emerald-500/30 bg-emerald-50/50 dark:bg-emerald-950/30 p-6 space-y-4">
              <h3 className="text-base font-black text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-emerald-500" />
                <span>نصائح ذهبية للتطبيق الفوري:</span>
              </h3>
              <ul className="space-y-2.5">
                {article.tips.map((tip, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Social Share & Back Button */}
          <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4">
            <ShareButtons title={article.title} />
            <Link
              href="/blog"
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            >
              <span>العودة لكل المقالات</span>
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </div>

        </div>

        {/* Bottom Ad */}
        <AdSenseSlot slotType="inArticle" />

        {/* Related Articles */}
        <div className="my-10 space-y-6">
          <h2 className="text-xl font-black text-slate-900 dark:text-white font-heading flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-emerald-500" />
            <span>مقالات وإرشادات مقترحة</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {relatedArticles.map((rel) => (
              <Link
                key={rel.id}
                href={`/blog/${rel.id}`}
                className="group flex flex-col justify-between rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm hover:shadow-lg transition-all hover:-translate-y-1"
              >
                <div>
                  <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-800 mb-3">
                    <img src={rel.image} alt={rel.title} className="h-full w-full object-cover group-hover:scale-105 transition-transform" />
                  </div>
                  <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                    {rel.category}
                  </span>
                  <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white line-clamp-2 mt-1 group-hover:text-emerald-600 transition-colors">
                    {rel.title}
                  </h3>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-3 border-t border-slate-100 dark:border-slate-800 mt-3">
                  <span>{rel.date}</span>
                  <span className="flex items-center gap-1 font-bold text-emerald-600 group-hover:translate-x-[-3px] transition-transform">
                    قراءة ←
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
