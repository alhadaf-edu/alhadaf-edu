'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useLessons } from '@/context/LessonsContext';
import { useAuth } from '@/context/AuthContext';
import { STAGES, SUBJECTS } from '@/lib/curriculumData';
import GradeBadge from '@/components/common/GradeBadge';
import AdSenseSlot from '@/components/common/AdSenseSlot';
import IslamicPattern from '@/components/layout/IslamicPattern';
import { uploadToCloudinary } from '@/lib/cloudinary';
import { 
  Award, 
  HelpCircle, 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  ArrowLeft, 
  Trophy, 
  Plus, 
  Trash2, 
  Image as ImageIcon, 
  X, 
  Check, 
  FileText,
  AlertCircle
} from 'lucide-react';
import { Quiz, Question, StageType } from '@/types';

import { ARAB_COUNTRIES } from '@/lib/curriculumData';

export default function QuizzesPage() {
  const { quizzes, lessons, addQuiz, deleteQuiz, selectedCountry } = useLessons();
  const { isAdmin, user, profile } = useAuth();

  const activeCountryCode = profile?.country || selectedCountry || 'sa';
  const activeCountryInfo = ARAB_COUNTRIES.find(c => c.code === activeCountryCode) || ARAB_COUNTRIES[0];

  const filteredQuizzes = quizzes.filter(q => {
    if (isAdmin) return true;
    if (!q.country || q.country === 'general') return true;
    return q.country === activeCountryCode;
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingImgIdx, setUploadingImgIdx] = useState<number | null>(null);

  // New Quiz form state
  const [quizTitle, setQuizTitle] = useState('');
  const [quizDescription, setQuizDescription] = useState('');
  const [quizStage, setQuizStage] = useState<StageType>('secondary');
  const [quizGrade, setQuizGrade] = useState<number>(2);
  const [quizSubjectId, setQuizSubjectId] = useState<string>('physics-sec');
  const [quizDuration, setQuizDuration] = useState<number>(15);
  const [quizPassingScore, setQuizPassingScore] = useState<number>(60);
  const [quizLessonId, setQuizLessonId] = useState<string>('');

  const [questions, setQuestions] = useState<Question[]>([
    {
      id: `q_${Date.now()}_1`,
      question: '',
      imageUrl: '',
      options: ['', '', '', ''],
      correctAnswerIndex: 0,
      explanation: '',
      points: 25,
    }
  ]);

  const handleOpenCreateModal = () => {
    setQuizTitle('');
    setQuizDescription('');
    setQuizStage('secondary');
    setQuizGrade(2);
    setQuizSubjectId('physics-sec');
    setQuizDuration(15);
    setQuizPassingScore(60);
    setQuizLessonId('');
    setQuestions([
      {
        id: `q_${Date.now()}_1`,
        question: '',
        imageUrl: '',
        options: ['', '', '', ''],
        correctAnswerIndex: 0,
        explanation: '',
        points: 25,
      }
    ]);
    setIsModalOpen(true);
  };

  const handleAddQuestion = () => {
    setQuestions([
      ...questions,
      {
        id: `q_${Date.now()}_${questions.length + 1}`,
        question: '',
        imageUrl: '',
        options: ['', '', '', ''],
        correctAnswerIndex: 0,
        explanation: '',
        points: 25,
      }
    ]);
  };

  const handleRemoveQuestion = (idx: number) => {
    if (questions.length === 1) return;
    setQuestions(questions.filter((_, i) => i !== idx));
  };

  const handleQuestionChange = (idx: number, field: keyof Question, value: any) => {
    const updated = [...questions];
    updated[idx] = { ...updated[idx], [field]: value };
    setQuestions(updated);
  };

  const handleOptionChange = (qIdx: number, optIdx: number, value: string) => {
    const updated = [...questions];
    const opts = [...updated[qIdx].options];
    opts[optIdx] = value;
    updated[qIdx] = { ...updated[qIdx], options: opts };
    setQuestions(updated);
  };

  const handleImageUpload = async (qIdx: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingImgIdx(qIdx);
    try {
      const res = await uploadToCloudinary(file, 'alhadaf_quiz_images');
      handleQuestionChange(qIdx, 'imageUrl', res.url);
    } catch (err) {
      console.error(err);
    } finally {
      setUploadingImgIdx(null);
    }
  };

  const handleSaveQuiz = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quizTitle.trim()) return;

    // Validate questions
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.question.trim() && !q.imageUrl) {
        alert(`يرجى كتابة نص السؤال أو إرفاق صورة للسؤال رقم ${i + 1}`);
        return;
      }
      if (q.options.some(opt => !opt.trim())) {
        alert(`يرجى إدخال جميع الخيارات الأربعة للسؤال رقم ${i + 1}`);
        return;
      }
    }

    setSaving(true);
    const newQuiz: Quiz = {
      id: `quiz_${Date.now()}`,
      title: quizTitle.trim(),
      description: quizDescription.trim(),
      stage: quizStage,
      gradeNumber: quizGrade,
      subjectId: quizSubjectId,
      lessonId: quizLessonId || undefined,
      durationMinutes: Number(quizDuration) || 15,
      passingScore: Number(quizPassingScore) || 60,
      createdAt: new Date().toISOString().split('T')[0],
      questions,
    };

    await addQuiz(newQuiz);
    setSaving(false);
    setIsModalOpen(false);
    setQuizTitle('');
    setQuizDescription('');
    setQuizLessonId('');
    setQuestions([
      {
        id: 'q_1',
        question: '',
        options: ['', '', '', ''],
        correctAnswerIndex: 0,
        explanation: '',
        points: 25,
      }
    ]);
  };

  const isUserAdmin = isAdmin || user?.email?.toLowerCase() === 'alhadaafpro@gmail.com';

  return (
    <div className="min-h-screen py-10 bg-slate-50/60 dark:bg-slate-950/40">
      
      {/* Header Banner */}
      <div className="relative bg-gradient-to-r from-amber-950 via-primary-950 to-slate-950 text-white py-14 overflow-hidden mb-10">
        <IslamicPattern variant="stars" opacity={0.07} />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-gold-400/30 bg-gold-500/10 px-4 py-1.5 text-xs font-bold text-gold-300 mb-3 backdrop-blur-md">
            <span className="text-base leading-none">{activeCountryInfo.flag}</span>
            <span>محاكاة {activeCountryInfo.examHighlight}</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black font-heading text-white">
            بنك الاختبارات التفاعلية — {activeCountryInfo.name}
          </h1>
          <p className="mt-3 text-xs sm:text-base text-slate-200 max-w-2xl mx-auto leading-relaxed">
            {activeCountryInfo.examTagline}
          </p>

          {/* Admin Create Button */}
          {isUserAdmin && (
            <div className="mt-6">
              <button
                onClick={handleOpenCreateModal}
                className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-gold-500 to-amber-500 hover:from-gold-600 hover:to-amber-600 text-slate-950 px-6 py-3 text-xs font-black shadow-xl transition-all hover:scale-105"
              >
                <Plus className="h-4 w-4" />
                <span>إضافة اختبار جديد وتحديد الأسئلة</span>
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Top Ad */}
        <AdSenseSlot slotType="headerBanner" />

        {/* Quizzes List Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredQuizzes.map((quiz) => {
            const quizCountry = ARAB_COUNTRIES.find(c => c.code === quiz.country);
            return (
              <div
                key={quiz.id}
                className="flex flex-col justify-between rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative group"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-1.5">
                      <GradeBadge stage={quiz.stage} gradeNumber={quiz.gradeNumber} size="sm" />
                      {quizCountry && (
                        <span className="text-sm" title={quizCountry.name}>
                          {quizCountry.flag}
                        </span>
                      )}
                    </div>
                    <span className="flex items-center gap-1 text-[11px] font-bold text-slate-400">
                      <Clock className="h-3 w-3" />
                      <span>{quiz.durationMinutes || 15} دقيقة</span>
                    </span>
                  </div>

                <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 leading-snug">
                  {quiz.title}
                </h3>

                <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                  {quiz.description || 'اختبار تقييمي شامل يركز على المهارات الأساسية ونواتج التعلم المستهدفة.'}
                </p>

                <div className="mt-4 flex items-center gap-4 text-xs font-semibold text-slate-600 dark:text-slate-400">
                  <span className="flex items-center gap-1 text-primary-600 dark:text-gold-400 font-bold">
                    <HelpCircle className="h-3.5 w-3.5" />
                    <span>{quiz.questions?.length || 0} أسئلة</span>
                  </span>
                  <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>نسبة النجاح: {quiz.passingScore || 60}%</span>
                  </span>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
                <Link
                  href={`/quizzes/${quiz.id}`}
                  className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-gold-500 to-amber-500 hover:from-gold-600 hover:to-amber-600 text-slate-950 py-2.5 text-xs font-black shadow-md transition-all"
                >
                  <Award className="h-4 w-4" />
                  <span>بدء الاختبار الآن</span>
                </Link>

                {isUserAdmin && (
                  <button
                    onClick={() => {
                      if (confirm('هل أنت متأكد من حذف هذا الاختبار؟')) {
                        deleteQuiz(quiz.id);
                      }
                    }}
                    className="p-2.5 rounded-xl text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                    title="حذف الاختبار"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
        </div>

        {/* Modal: Full Quiz Creator for Admin */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-xs animate-fade-in overflow-y-auto">
            <div className="relative w-full max-w-4xl overflow-hidden rounded-3xl bg-white dark:bg-slate-900 shadow-2xl border border-slate-200 dark:border-slate-800 my-8">
              
              {/* Modal Header */}
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 px-6 py-4 bg-slate-50 dark:bg-slate-950">
                <div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white font-heading flex items-center gap-2">
                    <Award className="h-5 w-5 text-gold-500" />
                    <span>إنشاء اختبار تقييمي جديد وإعداد الأسئلة</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    يمكنك إدخال نصوص الأسئلة أو إرفاق صور للأسئلة مع الخيارات والشروحات.
                  </p>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-full p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSaveQuiz} className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
                
                {/* 1. Basic Quiz Info */}
                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4 bg-slate-50/50 dark:bg-slate-800/40 space-y-4">
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    1. البيانات الأساسية للاختبار:
                  </h4>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      عنوان الاختبار:
                    </label>
                    <input
                      type="text"
                      required
                      value={quizTitle}
                      onChange={(e) => setQuizTitle(e.target.value)}
                      placeholder="مثال: اختبار درس حركة الكواكب والجاذبية - فيزياء 2"
                      className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-2.5 text-xs text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      وصف الاختبار:
                    </label>
                    <input
                      type="text"
                      value={quizDescription}
                      onChange={(e) => setQuizDescription(e.target.value)}
                      placeholder="وصف موجز للمهارات التي يقيسها الاختبار..."
                      className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-2.5 text-xs text-slate-900 dark:text-white"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        المرحلة:
                      </label>
                      <select
                        value={quizStage}
                        onChange={(e) => setQuizStage(e.target.value as StageType)}
                        className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-2.5 text-xs text-slate-900 dark:text-white"
                      >
                        {STAGES.map((s) => (
                          <option key={s.id} value={s.id}>{s.name}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        الصف:
                      </label>
                      <select
                        value={quizGrade}
                        onChange={(e) => setQuizGrade(Number(e.target.value))}
                        className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-2.5 text-xs text-slate-900 dark:text-white"
                      >
                        {[1, 2, 3, 4, 5, 6].map((num) => (
                          <option key={num} value={num}>الصف {num}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        المادة:
                      </label>
                      <select
                        value={quizSubjectId}
                        onChange={(e) => setQuizSubjectId(e.target.value)}
                        className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-2.5 text-xs text-slate-900 dark:text-white"
                      >
                        {SUBJECTS.map((sub) => (
                          <option key={sub.id} value={sub.id}>{sub.name}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        مدة الاختبار (بالدقائق):
                      </label>
                      <input
                        type="number"
                        min={1}
                        value={quizDuration}
                        onChange={(e) => setQuizDuration(Number(e.target.value))}
                        className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-2.5 text-xs text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>

                  {/* Link with specific Lesson */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      ربط الاختبار بدرس معين (اختياري):
                    </label>
                    <select
                      value={quizLessonId}
                      onChange={(e) => setQuizLessonId(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-2.5 text-xs text-slate-900 dark:text-white"
                    >
                      <option value="">اختبار عام للمادة / بدون ربط بدرس محدد</option>
                      {lessons.map((les) => (
                        <option key={les.id} value={les.id}>
                          {les.title}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* 2. Questions Builder */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <HelpCircle className="h-4 w-4 text-gold-500" />
                      <span>قائمة الأسئلة ({questions.length})</span>
                    </h4>

                    <button
                      type="button"
                      onClick={handleAddQuestion}
                      className="flex items-center gap-1 text-xs font-bold bg-primary-600 hover:bg-primary-700 text-white px-3 py-1.5 rounded-xl shadow"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      <span>إضافة سؤال جديد</span>
                    </button>
                  </div>

                  {questions.map((q, qIdx) => (
                    <div
                      key={q.id}
                      className="rounded-2xl border border-slate-200 dark:border-slate-700 p-4 bg-slate-50/70 dark:bg-slate-800/60 space-y-3 relative"
                    >
                      <div className="flex items-center justify-between">
                        <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-gold-500 text-slate-950 text-xs font-black">
                          {qIdx + 1}
                        </span>

                        {questions.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveQuestion(qIdx)}
                            className="text-rose-500 hover:text-rose-700 text-xs font-bold flex items-center gap-1"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            <span>حذف السؤال</span>
                          </button>
                        )}
                      </div>

                      {/* Question Text */}
                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                          نص السؤال:
                        </label>
                        <textarea
                          rows={2}
                          value={q.question}
                          onChange={(e) => handleQuestionChange(qIdx, 'question', e.target.value)}
                          placeholder="اكتب نص السؤال هنا..."
                          className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-2.5 text-xs text-slate-900 dark:text-white resize-none"
                        />
                      </div>

                      {/* Question Image Attachment */}
                      <div className="rounded-xl border border-dashed border-slate-300 dark:border-slate-700 p-3 bg-white/50 dark:bg-slate-900/50">
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                          إرفاق صورة للسؤال (مسألة رياضية / رسم بياني / خريطة):
                        </label>
                        <div className="flex flex-wrap items-center gap-3">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleImageUpload(qIdx, e)}
                            className="text-xs text-slate-500 file:py-1 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-gold-500 file:text-slate-950"
                          />
                          {uploadingImgIdx === qIdx && (
                            <span className="text-xs text-amber-500 font-bold animate-pulse">جاري رفع الصورة...</span>
                          )}
                        </div>
                        {q.imageUrl && (
                          <div className="mt-2 relative h-28 w-48 rounded-xl overflow-hidden border border-slate-300 dark:border-slate-700">
                            <img src={q.imageUrl} alt="معاينة" className="h-full w-full object-contain bg-slate-900" />
                            <button
                              type="button"
                              onClick={() => handleQuestionChange(qIdx, 'imageUrl', '')}
                              className="absolute top-1 left-1 rounded-full bg-rose-600 p-1 text-white"
                              title="حذف الصورة"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        )}
                      </div>

                      {/* 4 Options */}
                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                          الخيارات الأربعة (حدد الإجابة الصحيحة بالنقر على الدائرة):
                        </label>
                        <div className="space-y-2">
                          {q.options.map((opt, optIdx) => (
                            <div key={optIdx} className="flex items-center gap-2">
                              <input
                                type="radio"
                                name={`correct_ans_${q.id}`}
                                checked={q.correctAnswerIndex === optIdx}
                                onChange={() => handleQuestionChange(qIdx, 'correctAnswerIndex', optIdx)}
                                className="h-4 w-4 text-gold-500 focus:ring-gold-400 cursor-pointer"
                                title="اختر كإجابة صحيحة"
                              />
                              <span className="text-xs font-bold text-slate-500 w-4">
                                {['أ', 'ب', 'ج', 'د'][optIdx]}:
                              </span>
                              <input
                                type="text"
                                value={opt}
                                onChange={(e) => handleOptionChange(qIdx, optIdx, e.target.value)}
                                placeholder={`الخيار ${['أ', 'ب', 'ج', 'د'][optIdx]}`}
                                className="flex-1 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-2 text-xs text-slate-900 dark:text-white"
                              />
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Explanation */}
                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                          التوضيح والشرح النموذجي للحل:
                        </label>
                        <input
                          type="text"
                          value={q.explanation || ''}
                          onChange={(e) => handleQuestionChange(qIdx, 'explanation', e.target.value)}
                          placeholder="سبب اختيار هذه الإجابة وتفسير القاعدة..."
                          className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-2 text-xs text-slate-900 dark:text-white"
                        />
                      </div>

                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={handleAddQuestion}
                    className="w-full py-3 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-gold-500 text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-gold-500 transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Plus className="h-4 w-4" />
                    <span>+ إضافة سؤال آخر للاختبار</span>
                  </button>
                </div>

                {/* Submit Actions */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="rounded-xl border border-slate-300 dark:border-slate-700 px-5 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-300"
                  >
                    إلغاء
                  </button>

                  <button
                    type="submit"
                    disabled={saving}
                    className="rounded-xl bg-gradient-to-r from-gold-500 to-amber-500 hover:from-gold-600 hover:to-amber-600 text-slate-950 font-black px-7 py-2.5 text-xs shadow-lg transition-all disabled:opacity-50"
                  >
                    {saving ? 'جاري الحفظ...' : 'حفظ ونشر الاختبار'}
                  </button>
                </div>

              </form>

            </div>
          </div>
        )}

        {/* Bottom Banner */}
        <div className="mt-12">
          <AdSenseSlot slotType="footerBanner" />
        </div>

      </div>
    </div>
  );
}
