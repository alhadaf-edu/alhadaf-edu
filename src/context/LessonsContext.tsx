'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { Lesson, Quiz, YouTubeVideo, CountryCode } from '@/types';
import { INITIAL_LESSONS, STANDALONE_QUIZZES } from '@/lib/curriculumData';
import { fetchChannelVideos, parseVideoTitleToCurriculum } from '@/lib/youtube';
import { db } from '@/lib/firebase';
import { collection, getDocs, doc, setDoc, deleteDoc } from 'firebase/firestore';

interface LessonsContextType {
  lessons: Lesson[];
  quizzes: Quiz[];
  loading: boolean;
  selectedCountry: CountryCode;
  setSelectedCountry: (country: CountryCode) => void;
  syncMode: 'auto' | 'manual';
  setSyncMode: (mode: 'auto' | 'manual') => void;
  addLesson: (lesson: Lesson) => Promise<void>;
  updateLesson: (id: string, updated: Partial<Lesson>) => Promise<void>;
  deleteLesson: (id: string) => Promise<void>;
  addQuiz: (quiz: Quiz) => Promise<void>;
  updateQuiz: (id: string, updated: Partial<Quiz>) => Promise<void>;
  deleteQuiz: (id: string) => Promise<void>;
  getQuizById: (id: string) => Quiz | undefined;
  syncWithYouTube: () => Promise<{ success: boolean; count: number; message: string }>;
  getLessonById: (id: string) => Lesson | undefined;
}

const LessonsContext = createContext<LessonsContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'alhadaf_persisted_lessons_v2';
const QUIZZES_STORAGE_KEY = 'alhadaf_persisted_quizzes_v2';
const COUNTRY_STORAGE_KEY = 'alhadaf_selected_country_v2';
const SYNC_MODE_STORAGE_KEY = 'alhadaf_sync_mode_v1';

export function LessonsProvider({ children }: { children: React.ReactNode }) {
  const [lessons, setLessons] = useState<Lesson[]>(INITIAL_LESSONS);
  const [quizzes, setQuizzes] = useState<Quiz[]>(STANDALONE_QUIZZES);
  const [selectedCountry, setSelectedCountryState] = useState<CountryCode>('sa');
  const [syncMode, setSyncModeState] = useState<'auto' | 'manual'>('manual');
  const [loading, setLoading] = useState<boolean>(true);

  const setSelectedCountry = (country: CountryCode) => {
    setSelectedCountryState(country);
    try {
      localStorage.setItem(COUNTRY_STORAGE_KEY, country);
    } catch {}
  };

  const setSyncMode = (mode: 'auto' | 'manual') => {
    setSyncModeState(mode);
    try {
      localStorage.setItem(SYNC_MODE_STORAGE_KEY, mode);
    } catch {}
  };

  // Initialize and load saved lessons, quizzes, and country
  useEffect(() => {
    // 1. Country initialization
    try {
      const savedCountry = localStorage.getItem(COUNTRY_STORAGE_KEY) as CountryCode;
      if (savedCountry) {
        setSelectedCountryState(savedCountry);
      }
    } catch {}

    const loadStoredData = async () => {
      let combinedLessons = [...INITIAL_LESSONS];
      let combinedQuizzes = [...STANDALONE_QUIZZES];

      // 2. Load Lessons from LocalStorage & merge new initial lessons
      try {
        const localSaved = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (localSaved) {
          const parsed: Lesson[] = JSON.parse(localSaved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            const parsedIds = new Set(parsed.map(p => p.id));
            combinedLessons = [
              ...parsed,
              ...INITIAL_LESSONS.filter(init => !parsedIds.has(init.id))
            ];
          }
        }
      } catch (err) {
        console.warn('LocalStorage lessons read error:', err);
      }

      // 3. Load Quizzes from LocalStorage & merge new initial quizzes
      try {
        const localQuizzes = localStorage.getItem(QUIZZES_STORAGE_KEY);
        if (localQuizzes) {
          const parsedQ: Quiz[] = JSON.parse(localQuizzes);
          if (Array.isArray(parsedQ) && parsedQ.length > 0) {
            const parsedQIds = new Set(parsedQ.map(q => q.id));
            combinedQuizzes = [
              ...parsedQ,
              ...STANDALONE_QUIZZES.filter(init => !parsedQIds.has(init.id))
            ];
          }
        }
      } catch (err) {
        console.warn('LocalStorage quizzes read error:', err);
      }

      // 4. Try Loading from Firestore
      if (db) {
        try {
          // Lessons
          const snapshot = await getDocs(collection(db, 'lessons'));
          if (!snapshot.empty) {
            const firestoreLessons: Lesson[] = [];
            snapshot.forEach((docSnap) => {
              firestoreLessons.push(docSnap.data() as Lesson);
            });
            const ids = new Set(firestoreLessons.map(l => l.id));
            combinedLessons = [
              ...firestoreLessons,
              ...combinedLessons.filter(l => !ids.has(l.id))
            ];
          }

          // Quizzes
          const quizSnapshot = await getDocs(collection(db, 'quizzes'));
          if (!quizSnapshot.empty) {
            const firestoreQuizzes: Quiz[] = [];
            quizSnapshot.forEach((docSnap) => {
              firestoreQuizzes.push(docSnap.data() as Quiz);
            });
            const qIds = new Set(firestoreQuizzes.map(q => q.id));
            combinedQuizzes = [
              ...firestoreQuizzes,
              ...combinedQuizzes.filter(q => !qIds.has(q.id))
            ];
          }
        } catch (error) {
          // Firestore offline fallback
        }
      }

      setLessons(combinedLessons);
      setQuizzes(combinedQuizzes);

      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(combinedLessons));
        localStorage.setItem(QUIZZES_STORAGE_KEY, JSON.stringify(combinedQuizzes));
      } catch {}

      setLoading(false);
    };

    loadStoredData();

    const handleStorage = (e: StorageEvent) => {
      if (e.key === LOCAL_STORAGE_KEY && e.newValue) {
        try { setLessons(JSON.parse(e.newValue)); } catch {}
      }
      if (e.key === QUIZZES_STORAGE_KEY && e.newValue) {
        try { setQuizzes(JSON.parse(e.newValue)); } catch {}
      }
      if (e.key === COUNTRY_STORAGE_KEY && e.newValue) {
        setSelectedCountryState(e.newValue as CountryCode);
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const persistLessons = async (updatedLessons: Lesson[]) => {
    setLessons(updatedLessons);
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedLessons));
    } catch (e) {
      console.warn('Failed to save lessons to localStorage', e);
    }
  };

  const persistQuizzes = async (updatedQuizzes: Quiz[]) => {
    setQuizzes(updatedQuizzes);
    try {
      localStorage.setItem(QUIZZES_STORAGE_KEY, JSON.stringify(updatedQuizzes));
    } catch (e) {
      console.warn('Failed to save quizzes to localStorage', e);
    }
  };

  const addLesson = async (newLesson: Lesson) => {
    const lessonWithCountry = {
      ...newLesson,
      country: newLesson.country || selectedCountry || 'sa',
    };
    const updated = [lessonWithCountry, ...lessons.filter(l => l.id !== lessonWithCountry.id)];
    await persistLessons(updated);

    if (db) {
      try {
        await setDoc(doc(db, 'lessons', lessonWithCountry.id), lessonWithCountry);
      } catch (e) {
        console.warn('Firestore lesson add fallback:', e);
      }
    }
  };

  const updateLesson = async (id: string, updatedFields: Partial<Lesson>) => {
    const updated = lessons.map(l => l.id === id ? { ...l, ...updatedFields } : l);
    await persistLessons(updated);

    if (db) {
      try {
        const target = updated.find(l => l.id === id);
        if (target) {
          await setDoc(doc(db, 'lessons', id), target, { merge: true });
        }
      } catch (e) {
        console.warn('Firestore lesson update fallback:', e);
      }
    }
  };

  const deleteLesson = async (id: string) => {
    const updated = lessons.filter(l => l.id !== id);
    await persistLessons(updated);

    if (db) {
      try {
        await deleteDoc(doc(db, 'lessons', id));
      } catch (e) {
        console.warn('Firestore lesson delete fallback:', e);
      }
    }
  };

  // Quizzes CRUD
  const addQuiz = async (newQuiz: Quiz) => {
    const quizWithCountry = {
      ...newQuiz,
      country: newQuiz.country || selectedCountry || 'sa',
    };
    const updated = [quizWithCountry, ...quizzes.filter(q => q.id !== quizWithCountry.id)];
    await persistQuizzes(updated);

    if (db) {
      try {
        await setDoc(doc(db, 'quizzes', quizWithCountry.id), quizWithCountry);
      } catch (e) {
        console.warn('Firestore quiz add fallback:', e);
      }
    }

    if (quizWithCountry.lessonId) {
      await updateLesson(quizWithCountry.lessonId, { quiz: quizWithCountry });
    }
  };

  const updateQuiz = async (id: string, updatedFields: Partial<Quiz>) => {
    const updated = quizzes.map(q => q.id === id ? { ...q, ...updatedFields } : q);
    await persistQuizzes(updated);

    if (db) {
      try {
        const target = updated.find(q => q.id === id);
        if (target) {
          await setDoc(doc(db, 'quizzes', id), target, { merge: true });
        }
      } catch (e) {
        console.warn('Firestore quiz update fallback:', e);
      }
    }
  };

  const deleteQuiz = async (id: string) => {
    const target = quizzes.find(q => q.id === id);
    const updated = quizzes.filter(q => q.id !== id);
    await persistQuizzes(updated);

    if (db) {
      try {
        await deleteDoc(doc(db, 'quizzes', id));
      } catch (e) {
        console.warn('Firestore quiz delete fallback:', e);
      }
    }

    if (target?.lessonId) {
      const lessonTarget = lessons.find(l => l.id === target.lessonId);
      if (lessonTarget) {
        await updateLesson(target.lessonId, { quiz: undefined });
      }
    }
  };

  const getQuizById = (id: string): Quiz | undefined => {
    return quizzes.find(q => q.id === id);
  };

  // Smart sync from YouTube channel (blazing fast via server endpoint + parallel Firestore writes)
  const syncWithYouTube = async (): Promise<{ success: boolean; count: number; message: string }> => {
    try {
      let channelVideos: YouTubeVideo[] = [];
      try {
        const res = await fetch('/api/youtube/sync', { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          if (data.videos && Array.isArray(data.videos)) {
            channelVideos = data.videos;
          }
        }
      } catch (e) {
        console.warn('API sync fallback to direct client parser', e);
      }

      if (channelVideos.length === 0) {
        channelVideos = await fetchChannelVideos(35);
      }

      if (!channelVideos || channelVideos.length === 0) {
        return { success: false, count: 0, message: 'لم يتم العثور على فيديوهات جديدة في القناة.' };
      }

      let addedCount = 0;
      const currentList = [...lessons];
      const newLessonsToAdd: Lesson[] = [];

      for (const video of channelVideos) {
        const exists = currentList.some(l => l.youtubeId === video.id || l.id === `yt_${video.id}`);
        if (!exists) {
          const parsed = parseVideoTitleToCurriculum(video.title, video.description);
          
          const newLesson: Lesson = {
            id: `yt_${video.id}`,
            title: video.title,
            description: video.description || `شرح ${parsed.unitTitle} في مادة ${parsed.subjectName}.`,
            country: parsed.country,
            stage: parsed.stage,
            gradeNumber: parsed.gradeNumber,
            subjectId: parsed.subjectId,
            subjectName: parsed.subjectName,
            term: 1,
            unitTitle: parsed.unitTitle,
            youtubeId: video.id,
            youtubeUrl: `https://www.youtube.com/watch?v=${video.id}`,
            thumbnailUrl: video.thumbnailUrl || `https://i.ytimg.com/vi/${video.id}/hqdefault.jpg`,
            duration: video.duration || '18:00',
            viewsCount: 1200,
            likesCount: 95,
            createdAt: video.publishedAt || new Date().toISOString(),
          };

          newLessonsToAdd.push(newLesson);
          currentList.unshift(newLesson);
          addedCount++;
        }
      }

      if (newLessonsToAdd.length > 0) {
        await persistLessons(currentList);

        // Fast parallel Firestore writes
        if (db) {
          try {
            await Promise.allSettled(
              newLessonsToAdd.map(nl => setDoc(doc(db, 'lessons', nl.id), nl))
            );
          } catch (e) {
            console.warn('Firestore bulk sync note:', e);
          }
        }
      }

      return {
        success: true,
        count: addedCount,
        message: addedCount > 0 
          ? `تمت المزامنة بنجاح! تم استيراد ${addedCount} درس جديد وتصنيفها تلقائياً بحسب الدولة والمنهج.` 
          : 'كافة دروس القناة الحالية متزامنة ومصنفة بالكامل.'
      };
    } catch (err: any) {
      return { success: false, count: 0, message: err.message || 'حدث خطأ أثناء المزامنة.' };
    }
  };

  const getLessonById = (id: string): Lesson | undefined => {
    return lessons.find(l => l.id === id);
  };

  return (
    <LessonsContext.Provider
      value={{
        lessons,
        quizzes,
        loading,
        selectedCountry,
        setSelectedCountry,
        syncMode,
        setSyncMode,
        addLesson,
        updateLesson,
        deleteLesson,
        addQuiz,
        updateQuiz,
        deleteQuiz,
        getQuizById,
        syncWithYouTube,
        getLessonById,
      }}
    >
      {children}
    </LessonsContext.Provider>
  );
}

export function useLessons() {
  const context = useContext(LessonsContext);
  if (!context) {
    throw new Error('useLessons must be used within a LessonsProvider');
  }
  return context;
}
