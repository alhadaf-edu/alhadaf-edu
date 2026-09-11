'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import IslamicPattern from '@/components/layout/IslamicPattern';
import AdSenseSlot from '@/components/common/AdSenseSlot';
import { 
  BookOpenText, 
  Calendar, 
  Clock, 
  ArrowLeft, 
  Sparkles, 
  Trophy, 
  Plus, 
  X, 
  Check, 
  Upload, 
  FileText, 
  PenTool,
  CheckCircle2,
  ShieldCheck 
} from 'lucide-react';
import { useLessons } from '@/context/LessonsContext';
import { useAuth } from '@/context/AuthContext';
import { getCountryInfo, ARAB_COUNTRIES } from '@/lib/curriculumData';
import { ALL_BLOG_ARTICLES, BlogArticle, getAllArticles, saveCustomArticle, getCustomArticles } from '@/lib/blogData';
import { db } from '@/lib/firebase';
import { collection, doc, setDoc, onSnapshot } from 'firebase/firestore';

export default function BlogPage() {
  const { selectedCountry } = useLessons();
  const { profile, isAdmin, isModerator, user } = useAuth();
  const isSuperUser = isAdmin || isModerator || user?.email?.toLowerCase() === 'alhadaafpro@gmail.com';

  const activeCountryCode = profile?.country || selectedCountry || 'sa';
  const country = getCountryInfo(activeCountryCode);

  const [articlesList, setArticlesList] = useState<BlogArticle[]>(() => getAllArticles());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [category, setCategory] = useState('');
  const [articleCountry, setArticleCountry] = useState(activeCountryCode);
  const [readTime, setReadTime] = useState('5 دقائق');
  const [imageUrl, setImageUrl] = useState('');
  const [contentBody, setContentBody] = useState('');
  const [tipsBody, setTipsBody] = useState('');

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 4000);
  };

  // Sync with Firestore collection 'articles'
  useEffect(() => {
    if (!db) return;
    try {
      const unsub = onSnapshot(collection(db, 'articles'), (snapshot) => {
        const firestoreArticles: BlogArticle[] = [];
        snapshot.forEach((d) => firestoreArticles.push(d.data() as BlogArticle));
        if (firestoreArticles.length > 0) {
          firestoreArticles.forEach(a => saveCustomArticle(a));
          setArticlesList(getAllArticles(firestoreArticles));
        }
      }, (err) => {
        console.warn('Firestore articles snapshot note:', err);
      });
      return () => unsub();
    } catch (e) {
      console.warn('Articles listener error:', e);
    }
  }, []);

  const handleCreateArticle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !contentBody.trim()) return;

    setSubmitting(true);
    try {
      const paragraphs = contentBody
        .split('\n')
        .map(p => p.trim())
        .filter(p => p.length > 0);

      const tips = tipsBody
        .split('\n')
        .map(t => t.trim())
        .filter(t => t.length > 0);

      const newArticle: BlogArticle = {
        id: `art_${Date.now()}`,
        title: title.trim(),
        excerpt: excerpt.trim() || paragraphs[0]?.slice(0, 150) + '...',
        content: paragraphs,
        tips: tips.length > 0 ? tips : undefined,
        category: category.trim() || (articleCountry === 'sa' ? 'التحصيلي والقدرات 🇸🇦' : 'نصائح دراسية'),
        country: articleCountry,
        readTime: readTime.trim() || '5 دقائق',
        date: new Date().toISOString().split('T')[0],
        author: profile?.displayName || 'إدارة منصة الهَدَّاف',
        image: imageUrl.trim() || 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&auto=format&fit=crop&q=80',
      };

      // Save locally
      saveCustomArticle(newArticle);
      setArticlesList(prev => [newArticle, ...prev]);

      // Save in Firestore
      if (db) {
        try {
          await setDoc(doc(db, 'articles', newArticle.id), newArticle);
        } catch (fErr) {
          console.warn('Firestore article write error:', fErr);
        }
      }

      setSubmitting(false);
      setIsModalOpen(false);
      showToast('✅ تم نشر المقال الجديد بنجاح!');

      // Reset form
      setTitle('');
      setExcerpt('');
      setCategory('');
      setContentBody('');
      setTipsBody('');
      setImageUrl('');
    } catch (err: any) {
      console.error(err);
      setSubmitting(false);
      alert('حدث خطأ أثناء حفظ المقال.');
    }
  };

  // Filter articles for current country or general
  const filteredArticles = articlesList.filter(
    (a) => !a.country || a.country === activeCountryCode || a.country === 'general'
  );

  const articles = filteredArticles.length > 0 ? filteredArticles : articlesList;

  return (
    <div className="min-h-screen py-10 bg-slate-50/60 dark:bg-slate-950/40">
      
      {/* Banner */}
      <div className="relative bg-gradient-to-r from-primary-950 via-slate-950 to-indigo-950 text-white py-14 overflow-hidden mb-10">
        <IslamicPattern variant="stars" opacity={0.06} />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-gold-400/30 bg-gold-500/10 px-4 py-1.5 text-xs font-bold text-gold-300 mb-3 backdrop-blur-md">
            <span className="text-base leading-none">{country.flag}</span>
            <span>مدونة الهَدَّاف التعليمية — {country.name}</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black font-heading text-white">
            المقالات والنصائح الدراسية ({country.shortName})
          </h1>
          <p className="mt-3 text-xs sm:text-base text-slate-200 max-w-xl mx-auto">
            إرشادات تربوية، استراتيجيات الاستعداد لـ {country.examHighlight}، ومقالات إثرائية لدعم تفوقك الدراسي.
          </p>

          {/* Admin Write Article Button */}
          {isSuperUser && (
            <div className="mt-6 flex justify-center">
              <button
                onClick={() => setIsModalOpen(true)}
                className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white px-6 py-3 text-xs sm:text-sm font-black shadow-xl hover:shadow-emerald-500/20 transition-all scale-105"
              >
                <Plus className="h-4 w-4" />
                <PenTool className="h-4 w-4" />
                <span>كتابة وإضافة مقال جديد (للمشرف)</span>
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Top Ad */}
        <AdSenseSlot slotType="headerBanner" />

        {/* Articles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 my-8">
          {articles.map((article) => (
            <Link
              key={article.id}
              href={`/blog/${article.id}`}
              className="flex flex-col justify-between overflow-hidden rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group cursor-pointer"
            >
              <div>
                <div className="relative aspect-video w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
                  <img
                    src={article.image}
                    alt={article.title}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute top-3 right-3 rounded-xl bg-slate-900/80 px-3 py-1 text-[11px] font-bold text-gold-400 backdrop-blur-md">
                    {article.category}
                  </div>
                </div>

                <div className="p-6">
                  <div className="flex items-center gap-4 text-[11px] text-slate-400 mb-3">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" />
                      <span>{article.date}</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      <span>{article.readTime}</span>
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 dark:text-white leading-snug group-hover:text-primary-600 dark:group-hover:text-gold-400 transition-colors">
                    {article.title}
                  </h3>

                  <p className="mt-2 text-xs leading-relaxed text-slate-500 dark:text-slate-400 line-clamp-3">
                    {article.excerpt}
                  </p>
                </div>
              </div>

              <div className="p-6 pt-0 border-t border-slate-100 dark:border-slate-800/60 mt-4">
                <div className="flex items-center justify-between text-xs font-bold text-primary-600 dark:text-gold-400 group-hover:underline pt-4">
                  <span>اقرأ المقال كاملاً</span>
                  <ArrowLeft className="h-3.5 w-3.5 group-hover:-translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Bottom Ad */}
        <AdSenseSlot slotType="footerBanner" />

      </div>

      {/* Modal: Write New Article (Super/Admin Only) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-xs animate-fade-in">
          <div className="relative w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden rounded-3xl bg-white dark:bg-slate-900 shadow-2xl border border-slate-200 dark:border-slate-800">
            
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 px-6 py-4 bg-slate-50 dark:bg-slate-950 shrink-0">
              <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-base">
                <PenTool className="h-5 w-5 text-emerald-500" />
                <span>كتابة ونشر مقال تعليمي جديد</span>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="rounded-full p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateArticle} className="flex-1 overflow-y-auto p-6 space-y-4 text-xs">
              
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">عنوان المقال:</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: خارطة طريق حصد 99+ في اختبار التحصيلي"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 text-xs text-slate-900 dark:text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">المنهج / الدولة:</label>
                  <select
                    value={articleCountry}
                    onChange={(e) => setArticleCountry(e.target.value as any)}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 text-xs text-slate-900 dark:text-white focus:border-emerald-500 focus:outline-none"
                  >
                    <option value="general">🌐 عام (لكافة الدول)</option>
                    {ARAB_COUNTRIES.map(c => (
                      <option key={c.code} value={c.code}>{c.flag} {c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">تصنيف المقال:</label>
                  <input
                    type="text"
                    placeholder="مثال: التحصيلي والقدرات"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 text-xs text-slate-900 dark:text-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">وقت القراءة المقدر:</label>
                  <input
                    type="text"
                    placeholder="مثال: 6 دقائق"
                    value={readTime}
                    onChange={(e) => setReadTime(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 text-xs text-slate-900 dark:text-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">مقدمة / نبذة سريعة (Excerpt):</label>
                <textarea
                  rows={2}
                  placeholder="ملخص قصير للمقال يظهر في البطاقات الرئيسية..."
                  value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 text-xs text-slate-900 dark:text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">رابط صورة المقال (اختياري):</label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 text-xs text-slate-900 dark:text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">محتوى المقال (كل فقرة في سطر منفصل):</label>
                <textarea
                  rows={6}
                  required
                  placeholder="اكتب فقرات المقال هنا بالتفصيل..."
                  value={contentBody}
                  onChange={(e) => setContentBody(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 text-xs text-slate-900 dark:text-white focus:border-emerald-500 focus:outline-none leading-relaxed"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">نصائح وإرشادات سريعة (نصيحة في كل سطر - اختياري):</label>
                <textarea
                  rows={3}
                  placeholder="نصيحة 1&#10;نصيحة 2&#10;نصيحة 3"
                  value={tipsBody}
                  onChange={(e) => setTipsBody(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 text-xs text-slate-900 dark:text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-xl border border-slate-300 dark:border-slate-700 px-4 py-2 font-bold text-slate-700 dark:text-slate-300"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black px-6 py-2.5 shadow-lg transition-all disabled:opacity-50 flex items-center gap-1.5"
                >
                  {submitting ? 'جاري النشر...' : 'نشر المقال على المنصة'}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* Floating Success Toast */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-2xl bg-emerald-600 text-white px-5 py-3 shadow-2xl animate-fade-in text-xs font-bold border border-emerald-400/50 backdrop-blur-md">
          <CheckCircle2 className="w-5 h-5 text-emerald-200 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

    </div>
  );
}
