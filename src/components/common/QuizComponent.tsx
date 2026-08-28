'use client';

import React, { useState } from 'react';
import { Quiz, QuizResult } from '@/types';
import { CheckCircle2, XCircle, Award, RotateCcw, ArrowLeft, ArrowRight, HelpCircle, Check, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useAuth } from '@/context/AuthContext';

interface QuizComponentProps {
  quiz: Quiz;
  onComplete?: (result: QuizResult) => void;
}

export default function QuizComponent({ quiz, onComplete }: QuizComponentProps) {
  const { saveQuizResult } = useAuth();
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [reviewMode, setReviewMode] = useState<boolean>(false);

  const questions = quiz.questions || [];
  const currentQuestion = questions[currentStep];

  const handleSelectOption = (questionIndex: number, optionIndex: number) => {
    if (isSubmitted) return;
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionIndex]: optionIndex,
    }));
  };

  const handleNext = () => {
    if (currentStep < questions.length - 1) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleSubmit = () => {
    setIsSubmitted(true);
    let correctCount = 0;
    const userAnswersArray: number[] = [];

    questions.forEach((q, idx) => {
      const selected = selectedAnswers[idx];
      userAnswersArray.push(selected !== undefined ? selected : -1);
      if (selected === q.correctAnswerIndex) {
        correctCount++;
      }
    });

    const scorePercentage = Math.round((correctCount / questions.length) * 100);
    const passed = scorePercentage >= (quiz.passingScore || 60);

    const result: QuizResult = {
      quizId: quiz.id,
      quizTitle: quiz.title,
      score: correctCount,
      totalQuestions: questions.length,
      percentage: scorePercentage,
      passed,
      completedAt: new Date().toISOString(),
      userAnswers: userAnswersArray,
    };

    saveQuizResult(result);
    if (onComplete) onComplete(result);

    if (passed) {
      try {
        confetti({
          particleCount: 120,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#f59e0b', '#10b981', '#1e3a5f', '#3b82f6'],
        });
      } catch (e) {
        // confetti fallback
      }
    }
  };

  const handleReset = () => {
    setSelectedAnswers({});
    setIsSubmitted(false);
    setReviewMode(false);
    setCurrentStep(0);
  };

  if (questions.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 text-center">
        <HelpCircle className="mx-auto h-12 w-12 text-slate-400" />
        <p className="mt-3 text-sm font-medium text-slate-600 dark:text-slate-300">
          لم تتم إضافة أسئلة لهذا الاختبار بعد.
        </p>
      </div>
    );
  }

  // Calculate score summary
  let correctCount = 0;
  questions.forEach((q, idx) => {
    if (selectedAnswers[idx] === q.correctAnswerIndex) correctCount++;
  });
  const scorePercentage = Math.round((correctCount / questions.length) * 100);
  const passed = scorePercentage >= (quiz.passingScore || 60);
  const answeredCount = Object.keys(selectedAnswers).length;

  if (isSubmitted && !reviewMode) {
    return (
      <div className="relative overflow-hidden rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/95 p-6 sm:p-8 shadow-xl text-center">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-tr from-amber-500 to-yellow-400 text-white shadow-glow">
          <Award className="h-10 w-10" />
        </div>

        <h3 className="mt-4 text-2xl font-black text-slate-900 dark:text-white">
          {passed ? '🎉 مبروك! لقد اجتزت الاختبار بنجاح' : '👏 أحسنت المحاولة! يمكنك مراجعة الإجابات وإعادة الاختبار'}
        </h3>
        
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          {quiz.title}
        </p>

        {/* Score Circle / Box */}
        <div className="my-6 inline-flex flex-col items-center justify-center rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 px-8 py-4">
          <div className="text-4xl font-black text-primary-600 dark:text-gold-400">
            {scorePercentage}%
          </div>
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1">
            حصلت على {correctCount} من إجمالي {questions.length} إجابة صحيحة
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={() => setReviewMode(true)}
            className="flex items-center gap-2 rounded-xl bg-primary-600 hover:bg-primary-700 text-white px-5 py-2.5 text-sm font-bold shadow-md transition-all"
          >
            <Sparkles className="h-4 w-4 text-gold-400" />
            <span>مراجعة الإجابات والشرح</span>
          </button>

          <button
            onClick={handleReset}
            className="flex items-center gap-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 px-5 py-2.5 text-sm font-semibold transition-all"
          >
            <RotateCcw className="h-4 w-4" />
            <span>إعادة الاختبار</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/95 p-6 shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Award className="h-5 w-5 text-gold-500" />
            <span>{quiz.title}</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            السؤال {currentStep + 1} من {questions.length}
          </p>
        </div>

        <div className="text-left">
          <span className="inline-flex items-center rounded-full bg-primary-50 dark:bg-primary-950/60 px-3 py-1 text-xs font-bold text-primary-600 dark:text-gold-400 border border-primary-100 dark:border-primary-800">
            أجبت على {answeredCount} / {questions.length}
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="my-4 h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
        <div
          className="h-full bg-gradient-to-r from-primary-500 to-gold-500 transition-all duration-300"
          style={{ width: `${((currentStep + 1) / questions.length) * 100}%` }}
        />
      </div>

      {/* Question Card */}
      <div className="my-6">
        <h4 className="text-base sm:text-lg font-bold text-slate-800 dark:text-slate-100 leading-relaxed">
          {currentQuestion.question}
        </h4>

        {/* Question Image if present */}
        {currentQuestion.imageUrl && (
          <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-2 max-w-lg mx-auto">
            <img
              src={currentQuestion.imageUrl}
              alt="صورة السؤال"
              className="w-full h-auto max-h-72 object-contain rounded-xl"
            />
          </div>
        )}

        {/* Options */}
        <div className="mt-5 space-y-3">
          {currentQuestion.options.map((option, optIdx) => {
            const isSelected = selectedAnswers[currentStep] === optIdx;
            const isCorrect = currentQuestion.correctAnswerIndex === optIdx;
            
            let btnStyle = 'border-slate-200 dark:border-slate-800 hover:border-primary-400 dark:hover:border-slate-600 bg-slate-50/50 dark:bg-slate-800/40 text-slate-800 dark:text-slate-200';
            
            if (reviewMode) {
              if (isCorrect) {
                btnStyle = 'border-emerald-500 bg-emerald-50/80 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-200 font-bold';
              } else if (isSelected && !isCorrect) {
                btnStyle = 'border-rose-500 bg-rose-50/80 dark:bg-rose-950/50 text-rose-800 dark:text-rose-200';
              }
            } else if (isSelected) {
              btnStyle = 'border-primary-600 dark:border-gold-500 bg-primary-50/80 dark:bg-slate-800 text-primary-700 dark:text-gold-300 font-bold shadow-sm';
            }

            return (
              <button
                key={optIdx}
                type="button"
                onClick={() => handleSelectOption(currentStep, optIdx)}
                disabled={reviewMode}
                className={`flex w-full items-center justify-between rounded-xl border p-4 text-right text-sm transition-all duration-200 ${btnStyle}`}
              >
                <div className="flex items-center gap-3">
                  <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border text-xs font-bold ${
                    isSelected 
                      ? 'border-primary-600 bg-primary-600 text-white dark:border-gold-500 dark:bg-gold-500 dark:text-slate-950'
                      : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400'
                  }`}>
                    {['أ', 'ب', 'ج', 'د', 'هـ'][optIdx] || optIdx + 1}
                  </span>
                  <span>{option}</span>
                </div>

                {reviewMode && isCorrect && (
                  <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                )}
                {reviewMode && isSelected && !isCorrect && (
                  <XCircle className="h-5 w-5 text-rose-500" />
                )}
              </button>
            );
          })}
        </div>

        {/* Explanation in Review Mode */}
        {reviewMode && currentQuestion.explanation && (
          <div className="mt-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 p-4 text-xs text-amber-900 dark:text-amber-200">
            <span className="font-bold block mb-1">💡 التوضيح والشرح:</span>
            {currentQuestion.explanation}
          </div>
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
        <button
          onClick={handlePrev}
          disabled={currentStep === 0}
          className="flex items-center gap-1 text-xs font-bold text-slate-600 dark:text-slate-400 disabled:opacity-30 hover:text-primary-600 dark:hover:text-gold-400 transition-colors"
        >
          <ArrowRight className="h-4 w-4" />
          <span>السؤال السابق</span>
        </button>

        <div className="flex items-center gap-2">
          {currentStep === questions.length - 1 && !reviewMode ? (
            <button
              onClick={handleSubmit}
              disabled={answeredCount === 0}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white px-5 py-2 text-xs font-black shadow-md disabled:opacity-50 transition-all"
            >
              <Check className="h-4 w-4" />
              <span>إنهاء الاختبار وعرض النتيجة</span>
            </button>
          ) : (
            <button
              onClick={handleNext}
              disabled={currentStep === questions.length - 1}
              className="flex items-center gap-1 text-xs font-bold text-slate-600 dark:text-slate-400 disabled:opacity-30 hover:text-primary-600 dark:hover:text-gold-400 transition-colors"
            >
              <span>السؤال التالي</span>
              <ArrowLeft className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
