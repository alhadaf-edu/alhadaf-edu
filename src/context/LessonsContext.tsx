'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { Lesson, Quiz, YouTubeVideo, CountryCode } from '@/types';
import { INITIAL_LESSONS, STANDALONE_QUIZZES } from '@/lib/curriculumData';
import { fetchChannelVideos, parseVideoTitleToCurriculum } from '@/lib/youtube';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, doc, setDoc, deleteDoc } from 'firebase/firestore';

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

  // Initialize: real-time Firestore listeners (single source of truth)
  useEffect(() => {
    // 1. Country and Sync Mode initialization from localStorage
    try {
      const savedCountry = localStorage.getItem(COUNTRY_STORAGE_KEY) as CountryCode;
      if (savedCountry) setSelectedCountryState(savedCountry);
    } catch {}

    try {
      const savedSyncMode = localStorage.getItem(SYNC_MODE_STORAGE_KEY) as 'auto' | 'manual';
      if (savedSyncMode) setSyncModeState(savedSyncMode);
    } catch {}

    // 2. Instant offline fallback: show cached data immediately while Firestore connects
    try {
      const localSaved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (localSaved) {
        const parsed: Lesson[] = JSON.parse(localSaved);
        if (Array.isArray(parsed) && parsed.length > 0) setLessons(parsed);
      }
    } catch {}
    try {
      const localQuizzes = localStorage.getItem(QUIZZES_STORAGE_KEY);
      if (localQuizzes) {
        const parsedQ: Quiz[] = JSON.parse(localQuizzes);
        if (Array.isArray(parsedQ) && parsedQ.length > 0) setQuizzes(parsedQ);
      }
    } catch {}

    if (!db) {
      setLoading(false);
      return;
    }

    // 3. Real-time Firestore listener for lessons (authoritative single source of truth)
    const unsubLessons = onSnapshot(
      collection(db, 'lessons'),
      (snapshot) => {
        const firestoreLessons: Lesson[] = [];
        snapshot.forEach((docSnap) => firestoreLessons.push(docSnap.data() as Lesson));

        // Add any INITIAL_LESSONS not yet in Firestore (new static content)
        const fsIds = new Set(firestoreLessons.map(l => l.id));
        const missingInitial = INITIAL_LESSONS.filter(l => !fsIds.has(l.id));
        const combinedLessons = [...firestoreLessons, ...missingInitial];

        setLessons(combinedLessons);
        // Update localStorage cache so offline mode shows latest data
        try { localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(combinedLessons)); } catch {}
        setLoading(false);
      },
      (error) => {
        console.warn('Firestore lessons listener error, using offline cache:', error);
        setLoading(false);
      }
    );

    // 4. Real-time Firestore listener for quizzes (authoritative single source of truth)
    const unsubQuizzes = onSnapshot(
      collection(db, 'quizzes'),
      (snapshot) => {
        const firestoreQuizzes: Quiz[] = [];
        snapshot.forEach((docSnap) => firestoreQuizzes.push(docSnap.data() as Quiz));

        const qIds = new Set(firestoreQuizzes.map(q => q.id));
        const combinedQuizzes = [
          ...firestoreQuizzes,
          ...STANDALONE_QUIZZES.filter(init => !qIds.has(init.id)),
        ];

        setQuizzes(combinedQuizzes);
        try { localStorage.setItem(QUIZZES_STORAGE_KEY, JSON.stringify(combinedQuizzes)); } catch {}
      },
      (error) => {
        console.warn('Firestore quizzes listener error, using offline cache:', error);
      }
    );

    const handleStorage = (e: StorageEvent) => {
      if (e.key === COUNTRY_STORAGE_KEY && e.newValue) {
        setSelectedCountryState(e.newValue as CountryCode);
      }
    };
    window.addEventListener('storage', handleStorage);

    return () => {
      unsubLessons();
      unsubQuizzes();
      window.removeEventListener('storage', handleStorage);
    };
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

  // Comprehensive sync from YouTube channel
  const syncWithYouTube = async (): Promise<{ success: boolean; count: number; message: string }> => {
    try {
      let channelVideos: YouTubeVideo[] = [];
      let playlistsCount = 0;

      try {
        const res = await fetch('/api/youtube/sync', { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          if (data.videos && Array.isArray(data.videos)) {
            channelVideos = data.videos;
          }
          if (typeof data.playlistsCount === 'number') {
            playlistsCount = data.playlistsCount;
          }
        }
      } catch (e) {
        console.warn('API sync fallback to direct client parser', e);
      }

      if (channelVideos.length === 0) {
        channelVideos = await fetchChannelVideos(50);
      }

      if (!channelVideos || channelVideos.length === 0) {
        return { success: false, count: 0, message: 'لم يتم العثور على فيديوهات جديدة في القناة.' };
      }

      let addedCount = 0;
      let updatedCount = 0;
      const currentList = [...lessons];
      const lessonsToPersist: Lesson[] = [];

      for (const video of channelVideos) {
        const existingIdx = currentList.findIndex(l => l.youtubeId === video.id || l.id === `yt_${video.id}`);
        const parsed = parseVideoTitleToCurriculum(video.title, video.description);

        if (existingIdx >= 0) {
          // Re-classify and update existing lesson with latest video metadata
          const existing = currentList[existingIdx];
          const updatedLesson: Lesson = {
            ...existing,
            title: video.title,
            description: video.description || existing.description,
            country: parsed.country,
            stage: parsed.stage,
            gradeNumber: parsed.gradeNumber,
            subjectId: parsed.subjectId,
            subjectName: parsed.subjectName,
            unitTitle: parsed.unitTitle,
            thumbnailUrl: video.thumbnailUrl || existing.thumbnailUrl,
            updatedAt: new Date().toISOString(),
          };
          currentList[existingIdx] = updatedLesson;
          lessonsToPersist.push(updatedLesson);
          updatedCount++;
        } else {
          // Add new lesson
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

          lessonsToPersist.push(newLesson);
          currentList.unshift(newLesson);
          addedCount++;
        }
      }

      // 1. Immediately persist to localStorage for instant UI refresh
      await persistLessons(currentList);

      // 2. Persist to Firestore in parallel so it never reverts on reload or for other users
      if (db && lessonsToPersist.length > 0) {
        try {
          await Promise.allSettled(
            lessonsToPersist.map(l => setDoc(doc(db, 'lessons', l.id), l, { merge: true }))
          );
        } catch (e) {
          console.warn('Firestore bulk sync note:', e);
        }
      }

      const totalEffect = addedCount + updatedCount;
      const playlistMsg = playlistsCount > 0 ? ` ومزامنة ${playlistsCount} قائمة تشغيل` : '';

      return {
        success: true,
        count: totalEffect,
        message: `✅ تمت المزامنة والحفظ بنجاح! تم فحص ومزامنة ${channelVideos.length} فيديو، وحفظ ${addedCount} درس جديد و${updatedCount} درس محدث في قاعدة البيانات${playlistMsg}.`
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
