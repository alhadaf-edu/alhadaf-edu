'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useLessons } from '@/context/LessonsContext';
import { useAuth } from '@/context/AuthContext';
import { INITIAL_LESSONS } from '@/lib/curriculumData';
import VideoPlayer from '@/components/common/VideoPlayer';
import QuizComponent from '@/components/common/QuizComponent';
import CommentsSection from '@/components/common/CommentsSection';
import ShareButtons from '@/components/common/ShareButtons';
import GradeBadge from '@/components/common/GradeBadge';
import AdSenseSlot from '@/components/common/AdSenseSlot';
import { uploadToCloudinary } from '@/lib/cloudinary';
import { LessonAttachment } from '@/types';
import { 
  FileText, 
  BookOpen, 
  CheckCircle2, 
  HelpCircle, 
  Sparkles, 
  Clock, 
  Eye, 
  ArrowLeft,
  Award,
  Upload,
  Plus,
  Trash2,
  Paperclip,
  Check,
  X,
  Printer,
  ExternalLink
} from 'lucide-react';

interface LessonPageProps {
  params: { id: string };
}

export default function LessonPage({ params }: LessonPageProps) {
  const { getLessonById, lessons, quizzes, updateLesson } = useLessons();
  const { isAdmin, user } = useAuth();
  
  // Find in dynamic lessons or fallback
  const lesson = getLessonById(params.id) || 
    lessons.find(l => l.id === params.id || l.youtubeId === params.id) || 
    INITIAL_LESSONS.find(l => l.id === params.id) || 
    lessons[0] || 
    INITIAL_LESSONS[0];

  // Admin File Upload Modal State
  const [isFileModalOpen, setIsFileModalOpen] = useState(false);
  const [fileTitle, setFileTitle] = useState('');
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // File Viewer Modal State (Preview & Print)
  const [viewingAttachment, setViewingAttachment] = useState<LessonAttachment | null>(null);

  if (!lesson) {
    return (
      <div className="min-h-screen py-20 text-center">
        <h2 className="text-xl font-bold">الدرس غير موجود</h2>
        <Link href="/curriculum" className="mt-4 inline-block text-gold-500 font-bold">
          العودة لدليل المناهج
        </Link>
      </div>
    );
  }

  const isUserAdmin = isAdmin || user?.email?.toLowerCase() === 'alhadaafpro@gmail.com';

  // Find quiz dedicated for this lesson
  const dedicatedQuiz = lesson.quiz || quizzes.find(q => q.lessonId === lesson.id || (q.subjectId === lesson.subjectId && q.stage === lesson.stage));

  // Related lessons in the same country & stage or subject
  const relatedLessons = lessons.filter(
    (l) => l.id !== lesson.id && 
           (l.country || 'sa') === (lesson.country || 'sa') &&
           (l.subjectId === lesson.subjectId || l.stage === lesson.stage)
  ).slice(0, 4);

  const scrollToQuiz = (e: React.MouseEvent) => {
    const quizEl = document.getElementById('lesson-quiz');
    if (quizEl) {
      e.preventDefault();
      quizEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Handle Admin File Upload
  const handleUploadLessonFile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;

    setUploading(true);
    try {
      const res = await uploadToCloudinary(selectedFile, 'alhadaf_lesson_files');
      
      const newAttachment: LessonAttachment = {
        id: `att_${Date.now()}`,
        title: fileTitle.trim() || selectedFile.name,
        url: res.url,
        size: `${(selectedFile.size / (1024 * 1024)).toFixed(1)} MB`,
        type: selectedFile.name.endsWith('.pdf') ? 'pdf' : selectedFile.name.endsWith('.doc') || selectedFile.name.endsWith('.docx') ? 'doc' : 'file',
        uploadedAt: new Date().toISOString().split('T')[0],
      };

      const currentAttachments = lesson.attachments || [];
      const updatedAttachments = [...currentAttachments, newAttachment];

      await updateLesson(lesson.id, {
        attachments: updatedAttachments,
        pdfUrl: !lesson.pdfUrl ? res.url : lesson.pdfUrl,
        pdfTitle: !lesson.pdfTitle ? newAttachment.title : lesson.pdfTitle,
      });

      setSelectedFile(null);
      setFileTitle('');
      setIsFileModalOpen(false);
    } catch (error) {
      console.error('File upload failed:', error);
      alert('حدث خطأ أثناء رفع الملف، يرجى المحاولة مرة أخرى.');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteAttachment = async (attId: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا الملف المرفق؟')) return;
    const currentAttachments = lesson.attachments || [];
    const updated = currentAttachments.filter(a => a.id !== attId);
    await updateLesson(lesson.id, { attachments: updated });
  };

  // Compile all attachments (main pdf + attachments array)
  const allAttachments: LessonAttachment[] = [
    ...(lesson.pdfUrl ? [{
      id: 'main_pdf',
      title: lesson.pdfTitle || `ملخص ومذكرة درس ${lesson.title}.pdf`,
      url: lesson.pdfUrl,
      size: '2.4 MB',
      type: 'pdf' as const,
    }] : (lesson.summaryNotes && lesson.summaryNotes.length > 0 ? [{
      id: 'generated_summary',
      title: `ملخص وأوراق عمل ${lesson.title}.pdf`,
      url: '',
      size: '1.8 MB',
      type: 'pdf' as const,
    }] : [])),
    ...(lesson.attachments || [])
  ];

  // Download Trigger Handler
  const handleDownloadFile = async (att: LessonAttachment) => {
    if (att.url && att.url.startsWith('http')) {
      try {
        const response = await fetch(att.url);
        const blob = await response.blob();
        const blobUrl = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = blobUrl;
        a.download = att.title || 'ملخص_الدرس.pdf';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(blobUrl);
        document.body.removeChild(a);
        return;
      } catch (e) {
        window.open(att.url, '_blank');
        return;
      }
    }

    // If it's the generated summary, open preview modal and trigger print/save as PDF
    setViewingAttachment(att);
  };

  const handlePrintSummary = () => {
    window.print();
  };

  return (
    <div className="min-h-screen py-8 sm:py-12 bg-slate-50/50 dark:bg-slate-950/40">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400 mb-6 flex-wrap">
          <Link href="/" className="hover:text-primary-600 dark:hover:text-gold-400 transition-colors">
            الرئيسية
          </Link>
          <span>/</span>
          <Link href="/curriculum" className="hover:text-primary-600 dark:hover:text-gold-400 transition-colors">
            المناهج
          </Link>
          <span>/</span>
          <Link href={`/curriculum?stage=${lesson.stage}`} className="hover:text-primary-600 dark:hover:text-gold-400 transition-colors">
            {lesson.stage === 'elementary' ? 'الابتدائي' : lesson.stage === 'middle' ? 'المتوسط' : 'الثانوي'}
          </Link>
          <span>/</span>
          <span className="text-slate-800 dark:text-slate-200 font-bold truncate max-w-[200px] sm:max-w-md">
            {lesson.title}
          </span>
        </nav>

        {/* Top Header Banner Ad */}
        <AdSenseSlot slotType="headerBanner" />

        {/* Main 2-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Main Content */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* Embedded Video Player */}
            <VideoPlayer
              youtubeId={lesson.youtubeId}
              title={lesson.title}
            />

            {/* Lesson Title & Info Box */}
            <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-6 sm:p-8 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                <div className="flex items-center gap-2">
                  <GradeBadge stage={lesson.stage} gradeNumber={lesson.gradeNumber} size="md" />
                  <span className="rounded-full bg-primary-50 dark:bg-primary-950/60 text-primary-700 dark:text-gold-400 border border-primary-100 dark:border-primary-800 px-3 py-1 text-xs font-bold">
                    {lesson.subjectName}
                  </span>
                  {lesson.unitTitle && (
                    <span className="hidden sm:inline text-xs text-slate-400">
                      • {lesson.unitTitle}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" />
                    <span>{lesson.duration || '18 دقيقة'}</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <Eye className="h-3.5 w-3.5" />
                    <span>{(lesson.viewsCount || 1500).toLocaleString('ar-SA')} مشاهدة</span>
                  </span>
                </div>
              </div>

              <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-900 dark:text-white font-heading leading-snug">
                {lesson.title}
              </h1>

              <p className="mt-3 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                {lesson.description}
              </p>

              {/* Social Share */}
              <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4">
                <ShareButtons title={lesson.title} />
              </div>
            </div>

            {/* DEDICATED FILES & ATTACHMENTS SECTION */}
            <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-6 sm:p-8 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
                <div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white font-heading flex items-center gap-2">
                    <Paperclip className="h-5 w-5 text-emerald-500" />
                    <span>الملفات والمذكرات المرفقة بالدرس ({allAttachments.length})</span>
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    ملخصات بصيغة PDF، أوراق عمل، ونماذج تدريبية جاهزة للمعاينة والتحميل والطباعة.
                  </p>
                </div>

                {/* Admin Direct Upload Button */}
                {isUserAdmin && (
                  <button
                    onClick={() => setIsFileModalOpen(true)}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2 text-xs shadow-md transition-all shrink-0 hover:scale-105"
                  >
                    <Upload className="h-4 w-4" />
                    <span>رفع ملف / ملخص جديد للدرس</span>
                  </button>
                )}
              </div>

              {/* Files List */}
              {allAttachments.length > 0 ? (
                <div className="space-y-3 pt-2">
                  {allAttachments.map((att) => (
                    <div
                      key={att.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 p-4 transition-all hover:border-emerald-500/40"
                    >
                      <div className="flex items-center gap-3.5">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shadow-xs">
                          <FileText className="h-6 w-6" />
                        </div>
                        <div>
                          <h4 className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100">
                            {att.title}
                          </h4>
                          <span className="text-[10px] text-slate-400">
                            مذكرة وملخص معتمد {att.size ? `• ${att.size}` : ''}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-center">
                        {/* 1. View / Preview File Button */}
                        <button
                          onClick={() => setViewingAttachment(att)}
                          className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 text-xs font-bold shadow transition-all hover:scale-105"
                        >
                          <Eye className="h-4 w-4" />
                          <span>عرض واستعراض الملخص</span>
                        </button>

                        {isUserAdmin && att.id !== 'main_pdf' && att.id !== 'generated_summary' && (
                          <button
                            onClick={() => handleDeleteAttachment(att.id)}
                            className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors"
                            title="حذف الملف"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
                  <FileText className="mx-auto h-10 w-10 text-slate-400" />
                  <p className="text-xs text-slate-500 mt-2">
                    لا توجد ملفات مرفقة بهذا الدرس حالياً.
                  </p>
                  {isUserAdmin && (
                    <button
                      onClick={() => setIsFileModalOpen(true)}
                      className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-emerald-600 hover:underline"
                    >
                      + اضغط هنا لرفع أول ملف ومذكرة للدرس
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Lesson Summary Notes */}
            {lesson.summaryNotes && lesson.summaryNotes.length > 0 && (
              <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-6 sm:p-8 shadow-sm">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-4">
                  <Sparkles className="h-5 w-5 text-gold-500" />
                  <span>ملخص المفاهيم والنقاط الجوهرية</span>
                </h3>

                <ul className="space-y-3">
                  {lesson.summaryNotes.map((note, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                      <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                      <span>{note}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Interactive Lesson Quiz Section */}
            {(lesson.quiz || dedicatedQuiz) && (
              <div id="lesson-quiz" className="space-y-4 scroll-mt-24">
                <div className="flex items-center gap-2">
                  <Award className="h-6 w-6 text-amber-500" />
                  <h3 className="text-xl font-black text-slate-900 dark:text-white font-heading">
                    اختبار تقييم فهم الدرس (تصحيح فوري)
                  </h3>
                </div>
                <QuizComponent quiz={lesson.quiz || dedicatedQuiz!} />
              </div>
            )}

            {/* In-Article Ad */}
            <AdSenseSlot slotType="inArticle" />

            {/* Comments & Discussion */}
            <CommentsSection lessonId={lesson.id} />

          </div>

          {/* Sidebar */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Sticky Sidebar Ad */}
            <AdSenseSlot slotType="sidebarSticky" />

            {/* Dedicated Lesson Quiz Callout */}
            <div className="rounded-3xl bg-gradient-to-br from-slate-950 via-primary-950 to-indigo-950 p-6 text-white text-center shadow-xl border border-slate-800 relative overflow-hidden">
              <div className="relative z-10">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gold-500/20 text-gold-400 mb-3 border border-gold-500/30">
                  <Award className="h-7 w-7" />
                </div>
                <h4 className="text-lg font-black text-white font-heading">
                  هل أنت مستعد للاختبار على هذا الدرس؟
                </h4>
                <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                  اختبر مدى استيعابك للشرح وحل تدريبات الدرس مباشرة مع تصحيح فوري وشرح الحلول.
                </p>

                {lesson.quiz || dedicatedQuiz ? (
                  <button
                    onClick={scrollToQuiz}
                    className="mt-5 w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-gold-500 to-amber-500 hover:from-gold-600 hover:to-amber-600 text-slate-950 font-black py-3 text-xs shadow-lg transition-all hover:scale-105"
                  >
                    <span>بدء اختبار الدرس الآن</span>
                    <ArrowLeft className="h-4 w-4" />
                  </button>
                ) : (
                  <Link
                    href={`/quizzes?stage=${lesson.stage}`}
                    className="mt-5 w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-gold-500 to-amber-500 hover:from-gold-600 hover:to-amber-600 text-slate-950 font-black py-3 text-xs shadow-lg transition-all hover:scale-105"
                  >
                    <span>بدء اختبار الدرس الآن</span>
                    <ArrowLeft className="h-4 w-4" />
                  </Link>
                )}
              </div>
            </div>

            {/* Related Lessons Box */}
            <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-6 shadow-sm">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
                <span className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-primary-600 dark:text-gold-400" />
                  <span>دروس ذات صلة</span>
                </span>
                <Link href="/curriculum" className="text-xs text-gold-500 hover:underline">
                  المزيد
                </Link>
              </h3>

              <div className="space-y-4">
                {relatedLessons.map((rel) => (
                  <div key={rel.id} className="group flex gap-3 items-center">
                    <div className="relative h-16 w-24 shrink-0 overflow-hidden rounded-xl bg-slate-900">
                      <img
                        src={rel.thumbnailUrl || `https://i.ytimg.com/vi/${rel.youtubeId}/hqdefault.jpg`}
                        alt={rel.title}
                        className="h-full w-full object-cover group-hover:scale-105 transition-transform"
                      />
                    </div>
                    <div className="flex-1">
                      <Link href={`/lessons/${rel.id}`} className="line-clamp-2 text-xs font-bold text-slate-800 dark:text-slate-100 group-hover:text-primary-600 dark:group-hover:text-gold-400 transition-colors">
                        {rel.title}
                      </Link>
                      <p className="text-[10px] text-slate-400 mt-1">
                        {rel.subjectName} • {rel.duration || '18 دقيقة'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>

      </div>

      {/* MODAL 1: FILE VIEWER & PREVIEW MODAL (عرض ومعاينة وطباعة الملف) */}
      {viewingAttachment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-xs animate-fade-in">
          <div className="relative w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden rounded-3xl bg-white dark:bg-slate-900 shadow-2xl border border-slate-200 dark:border-slate-800">
            
            {/* Viewer Header */}
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 px-6 py-4 bg-slate-50 dark:bg-slate-950 shrink-0">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600">
                  <FileText className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white font-heading line-clamp-1">
                    {viewingAttachment.title}
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    منصة الهَدَّاف التعليمية • {lesson.subjectName}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrintSummary}
                  className="flex items-center gap-1 text-xs font-bold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 px-3 py-1.5 rounded-xl transition-colors"
                  title="طباعة"
                >
                  <Printer className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">طباعة</span>
                </button>

                {viewingAttachment.url && (
                  <a
                    href={viewingAttachment.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-xs font-bold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 px-3 py-1.5 rounded-xl transition-colors"
                    title="فتح في نافذة كاملة"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">نافذة جديدة</span>
                  </a>
                )}

                <button
                  onClick={() => setViewingAttachment(null)}
                  className="rounded-full p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white"
                  title="إغلاق"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Viewer Body */}
            <div className="flex-1 overflow-y-auto p-6 sm:p-8 bg-slate-100/60 dark:bg-slate-950/60">
              {viewingAttachment.url ? (
                <div className="w-full h-full min-h-[500px] rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                  <iframe
                    src={viewingAttachment.url}
                    className="w-full h-full min-h-[500px] border-0"
                    title="معاينة الملف"
                  />
                </div>
              ) : (
                /* Generated Printable Summary Sheet */
                <div className="mx-auto max-w-2xl bg-white dark:bg-slate-900 rounded-3xl p-8 sm:p-12 shadow-lg border border-slate-200 dark:border-slate-800 space-y-6 text-slate-900 dark:text-slate-100">
                  <div className="flex items-center justify-between border-b-2 border-emerald-500 pb-4">
                    <div className="flex items-center gap-3">
                      <Image src="/logo.png" alt="الهداف" width={44} height={44} className="object-contain" />
                      <div>
                        <h2 className="text-xl font-black font-heading text-emerald-600 dark:text-emerald-400">
                          منصة الهَدَّاف التعليمية
                        </h2>
                        <p className="text-xs text-slate-400">ملخص ومذكرة الشرح المعتمدة</p>
                      </div>
                    </div>
                    <div className="text-left text-xs text-slate-500">
                      <p className="font-bold">{lesson.subjectName}</p>
                      <p>{lesson.stage === 'elementary' ? 'المرحلة الابتدائية' : lesson.stage === 'middle' ? 'المرحلة المتوسطة' : 'المرحلة الثانوية'}</p>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-black text-slate-900 dark:text-white mb-2">
                      {lesson.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                      {lesson.description}
                    </p>
                  </div>

                  {lesson.summaryNotes && lesson.summaryNotes.length > 0 && (
                    <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                      <h4 className="text-sm font-black text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                        <Sparkles className="h-4 w-4" />
                        <span>أبرز المفاهيم والنقاط الجوهرية للدرس:</span>
                      </h4>
                      <ul className="space-y-2.5">
                        {lesson.summaryNotes.map((note, i) => (
                          <li key={i} className="flex items-start gap-2.5 text-xs sm:text-sm leading-relaxed">
                            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600 text-xs font-bold">
                              {i + 1}
                            </span>
                            <span>{note}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="pt-8 border-t border-slate-200 dark:border-slate-800 text-center text-xs text-slate-400 flex items-center justify-between">
                    <span>منصة الهَدَّاف التعليمية 🇸🇦</span>
                    <span>تابع باقي الشروحات والاختبارات على المنصة</span>
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>
      )}

      {/* MODAL 2: ADMIN DIRECT FILE UPLOAD MODAL */}
      {isFileModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-xs animate-fade-in">
          <div className="relative w-full max-w-lg overflow-hidden rounded-3xl bg-white dark:bg-slate-900 shadow-2xl border border-slate-200 dark:border-slate-800">
            
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 px-6 py-4 bg-slate-50 dark:bg-slate-950">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Upload className="h-5 w-5 text-emerald-500" />
                <span>رفع ملف / ملخص جديد لهذا الدرس</span>
              </h3>
              <button
                onClick={() => setIsFileModalOpen(false)}
                className="rounded-full p-1 text-slate-400 hover:text-slate-700 dark:hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleUploadLessonFile} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  اسم أو عنوان الملف:
                </label>
                <input
                  type="text"
                  required
                  placeholder="مثال: مذكرة شرح قوانين كبلر وأوراق العمل.pdf"
                  value={fileTitle}
                  onChange={(e) => setFileTitle(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 text-xs text-slate-900 dark:text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 p-6 text-center bg-slate-50/50 dark:bg-slate-800/40">
                <Upload className="mx-auto h-10 w-10 text-emerald-500 mb-2" />
                <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  اختر الملف المراد إرفاقه (PDF, Word, الصور):
                </p>
                <input
                  type="file"
                  required
                  accept=".pdf,.doc,.docx,.ppt,.pptx,.png,.jpg,.jpeg"
                  onChange={(e) => {
                    const f = e.target.files?.[0] || null;
                    setSelectedFile(f);
                    if (f && !fileTitle) setFileTitle(f.name);
                  }}
                  className="mt-3 text-xs text-slate-500 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-emerald-600 file:text-white cursor-pointer"
                />
                {selectedFile && (
                  <p className="mt-2 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                    تم تحديد: {selectedFile.name} ({(selectedFile.size / (1024 * 1024)).toFixed(2)} MB)
                  </p>
                )}
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsFileModalOpen(false)}
                  className="rounded-xl border border-slate-300 dark:border-slate-700 px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-300"
                >
                  إلغاء
                </button>

                <button
                  type="submit"
                  disabled={uploading || !selectedFile}
                  className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-2 text-xs shadow transition-all disabled:opacity-50 flex items-center gap-1.5"
                >
                  {uploading ? (
                    <span>جاري رفع وتثبيت الملف...</span>
                  ) : (
                    <>
                      <Check className="h-4 w-4" />
                      <span>رفع وحفظ في الدرس</span>
                    </>
                  )}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}
