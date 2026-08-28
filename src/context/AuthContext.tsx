'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  User, 
  onAuthStateChanged, 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut as firebaseSignOut,
  updateProfile
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, collection, getDocs } from 'firebase/firestore';
import { auth, googleProvider, db } from '@/lib/firebase';
import { QuizResult, UserProfile, CountryCode, StageType, UserRole } from '@/types';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  isAdmin: boolean;
  isModerator: boolean;
  loading: boolean;
  needsCurriculumSelection: boolean;
  loginWithGoogle: () => Promise<void>;
  loginWithEmail: (email: string, pass: string) => Promise<void>;
  registerWithEmail: (
    name: string, 
    email: string, 
    pass: string, 
    country?: CountryCode, 
    stage?: StageType, 
    gradeNumber?: number
  ) => Promise<void>;
  logout: () => Promise<void>;
  saveQuizResult: (result: QuizResult) => Promise<void>;
  toggleSaveLesson: (lessonId: string) => Promise<void>;
  isLessonSaved: (lessonId: string) => boolean;
  updateUserProfile: (data: Partial<UserProfile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'alhadaafpro@gmail.com';
const COUNTRY_STORAGE_KEY = 'alhadaf_selected_country_v2';
const ALL_USERS_KEY = 'alhadaf_all_users_v1';

// ── helpers ────────────────────────────────────────────────────────────────
function getAllUsersLocal(): UserProfile[] {
  try {
    const raw = localStorage.getItem(ALL_USERS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function upsertUserInLocalList(profile: UserProfile) {
  try {
    const list = getAllUsersLocal();
    const idx = list.findIndex(u => u.uid === profile.uid);
    if (idx >= 0) {
      list[idx] = profile;
    } else {
      list.unshift(profile);
    }
    localStorage.setItem(ALL_USERS_KEY, JSON.stringify(list));
  } catch {}
}

async function syncProfileToFirestore(profile: UserProfile) {
  if (!db) return;
  try {
    const userRef = doc(db, 'users', profile.uid);
    await setDoc(userRef, profile, { merge: true });
  } catch (err) {
    console.warn('Firestore user profile sync notice:', err);
  }
}
// ──────────────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [needsCurriculumSelection, setNeedsCurriculumSelection] = useState<boolean>(false);

  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        const isAdminUser = currentUser.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase();
        
        // 1. Try to load from Firestore first
        let firestoreProfile: UserProfile | null = null;
        if (db) {
          try {
            const userDocRef = doc(db, 'users', currentUser.uid);
            const userSnap = await getDoc(userDocRef);
            if (userSnap.exists()) {
              firestoreProfile = userSnap.data() as UserProfile;
            }
          } catch (err) {
            console.warn('Firestore fetch user error:', err);
          }
        }

        // 2. Load stored local profile or fallback
        const savedData = localStorage.getItem(`alhadaf_user_${currentUser.uid}`);
        let userProfile: UserProfile;
        
        if (firestoreProfile) {
          userProfile = firestoreProfile;
          if (isAdminUser) userProfile.role = 'superadmin';
        } else if (savedData) {
          userProfile = JSON.parse(savedData) as UserProfile;
          if (!userProfile.role || userProfile.role === ('admin' as string)) {
            userProfile.role = isAdminUser ? 'superadmin' : (userProfile.role as UserRole) || 'student';
          }
          if (isAdminUser) userProfile.role = 'superadmin';
        } else {
          userProfile = {
            uid: currentUser.uid,
            email: currentUser.email || '',
            displayName: currentUser.displayName || currentUser.email?.split('@')[0] || 'مشترك جديد',
            photoURL: currentUser.photoURL || undefined,
            role: isAdminUser ? 'superadmin' : 'student',
            status: 'active',
            savedLessons: [],
            quizHistory: [],
            createdAt: new Date().toISOString()
          };
        }

        if (!userProfile.status) userProfile.status = 'active';

        if (!isAdminUser && !userProfile.country) {
          setNeedsCurriculumSelection(true);
        } else {
          setNeedsCurriculumSelection(false);
        }

        if (userProfile.country && !isAdminUser) {
          try { localStorage.setItem(COUNTRY_STORAGE_KEY, userProfile.country); } catch {}
        }
        
        setProfile(userProfile);

        // Save to LocalStorage & Firestore
        try {
          localStorage.setItem(`alhadaf_user_${currentUser.uid}`, JSON.stringify(userProfile));
          upsertUserInLocalList(userProfile);
        } catch {}

        await syncProfileToFirestore(userProfile);

      } else {
        setProfile(null);
        setNeedsCurriculumSelection(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loginWithGoogle = async () => {
    if (!auth || !googleProvider) throw new Error('Firebase Auth not available');
    const res = await signInWithPopup(auth, googleProvider);
    if (res.user) {
      const isAdminUser = res.user.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase();
      const existingRef = db ? doc(db, 'users', res.user.uid) : null;
      let existingData: UserProfile | null = null;
      if (existingRef) {
        try {
          const snap = await getDoc(existingRef);
          if (snap.exists()) existingData = snap.data() as UserProfile;
        } catch {}
      }

      const userProfile: UserProfile = existingData || {
        uid: res.user.uid,
        email: res.user.email || '',
        displayName: res.user.displayName || res.user.email?.split('@')[0] || 'مشترك جديد',
        photoURL: res.user.photoURL || undefined,
        role: isAdminUser ? 'superadmin' : 'student',
        status: 'active',
        savedLessons: [],
        quizHistory: [],
        createdAt: new Date().toISOString(),
      };

      if (isAdminUser) userProfile.role = 'superadmin';

      setProfile(userProfile);
      try {
        localStorage.setItem(`alhadaf_user_${res.user.uid}`, JSON.stringify(userProfile));
        upsertUserInLocalList(userProfile);
      } catch {}
      await syncProfileToFirestore(userProfile);
    }
  };

  const loginWithEmail = async (email: string, pass: string) => {
    if (!auth) throw new Error('Firebase Auth not available');
    await signInWithEmailAndPassword(auth, email, pass);
  };

  const registerWithEmail = async (
    name: string, 
    email: string, 
    pass: string,
    country: CountryCode = 'sa',
    stage: StageType = 'secondary',
    gradeNumber: number = 2
  ) => {
    if (!auth) throw new Error('Firebase Auth not available');
    const res = await createUserWithEmailAndPassword(auth, email, pass);
    if (res.user) {
      await updateProfile(res.user, { displayName: name });
      
      const newProfile: UserProfile = {
        uid: res.user.uid,
        email: res.user.email || email,
        displayName: name,
        role: email.toLowerCase() === ADMIN_EMAIL.toLowerCase() ? 'superadmin' : 'student',
        status: 'active',
        country,
        stage,
        gradeNumber,
        savedLessons: [],
        quizHistory: [],
        createdAt: new Date().toISOString(),
      };

      setProfile(newProfile);
      try {
        localStorage.setItem(`alhadaf_user_${res.user.uid}`, JSON.stringify(newProfile));
        localStorage.setItem(COUNTRY_STORAGE_KEY, country);
        upsertUserInLocalList(newProfile);
      } catch {}

      await syncProfileToFirestore(newProfile);
    }
  };

  const updateUserProfile = async (data: Partial<UserProfile>) => {
    if (!profile) return;
    const updated = { ...profile, ...data };
    setProfile(updated);
    if (data.country) setNeedsCurriculumSelection(false);
    try {
      localStorage.setItem(`alhadaf_user_${profile.uid}`, JSON.stringify(updated));
      upsertUserInLocalList(updated);
      if (data.country) localStorage.setItem(COUNTRY_STORAGE_KEY, data.country);
    } catch {}
    await syncProfileToFirestore(updated);
  };

  const logout = async () => {
    if (auth) await firebaseSignOut(auth);
    setUser(null);
    setProfile(null);
    setNeedsCurriculumSelection(false);
  };

  const saveQuizResult = async (result: QuizResult) => {
    if (!profile) return;
    const updatedHistory = [result, ...(profile.quizHistory || [])];
    const updatedProfile = { ...profile, quizHistory: updatedHistory };
    setProfile(updatedProfile);
    try {
      localStorage.setItem(`alhadaf_user_${profile.uid}`, JSON.stringify(updatedProfile));
      upsertUserInLocalList(updatedProfile);
    } catch {}
    await syncProfileToFirestore(updatedProfile);
  };

  const toggleSaveLesson = async (lessonId: string) => {
    if (!profile) return;
    const saved = profile.savedLessons || [];
    const isSaved = saved.includes(lessonId);
    const newSaved = isSaved ? saved.filter(id => id !== lessonId) : [...saved, lessonId];
    const updatedProfile = { ...profile, savedLessons: newSaved };
    setProfile(updatedProfile);
    try {
      localStorage.setItem(`alhadaf_user_${profile.uid}`, JSON.stringify(updatedProfile));
      upsertUserInLocalList(updatedProfile);
    } catch {}
    await syncProfileToFirestore(updatedProfile);
  };

  const isLessonSaved = (lessonId: string): boolean => {
    return !!profile?.savedLessons?.includes(lessonId);
  };

  const isAdmin = profile?.role === 'superadmin' ||
    !!(user?.email && user.email.toLowerCase() === ADMIN_EMAIL.toLowerCase());

  const isModerator = profile?.role === 'moderator';

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        isAdmin,
        isModerator,
        loading,
        needsCurriculumSelection,
        loginWithGoogle,
        loginWithEmail,
        registerWithEmail,
        logout,
        saveQuizResult,
        toggleSaveLesson,
        isLessonSaved,
        updateUserProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}