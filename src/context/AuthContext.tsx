'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  User, 
  onAuthStateChanged, 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut as firebaseSignOut,
  updateProfile,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
  ConfirmationResult as FirebaseConfirmationResult,
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, collection, getDocs, query, where } from 'firebase/firestore';
import { auth, googleProvider, db, RecaptchaVerifier, signInWithPhoneNumber } from '@/lib/firebase';
import { QuizResult, UserProfile, CountryCode, StageType, UserRole, TelegramUser } from '@/types';
import { normalizeRole } from '@/lib/rbac';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  isAdmin: boolean;
  isModerator: boolean;
  isSuperAdmin: boolean;
  isCountrySupervisor: boolean;
  isStudent: boolean;
  userCountry: CountryCode;
  loading: boolean;
  needsCurriculumSelection: boolean;
  loginWithGoogle: (rememberMe?: boolean) => Promise<void>;
  loginWithTelegram: (telegramUser: TelegramUser, rememberMe?: boolean) => Promise<void>;
  loginWithEmail: (email: string, pass: string, rememberMe?: boolean) => Promise<void>;
  registerWithEmail: (
    name: string, 
    email: string, 
    pass: string, 
    country?: CountryCode, 
    stage?: StageType, 
    gradeNumber?: number
  ) => Promise<void>;
  /** Check if a phone number is already registered in the platform */
  checkPhoneNumberExists: (phone: string) => Promise<boolean>;
  /** Step 1: Send OTP SMS — returns confirmation for step 2 */
  sendPhoneOTP: (phone: string, recaptchaContainerId: string) => Promise<FirebaseConfirmationResult>;
  /** Step 2 (Login): Verify OTP code for existing registered user */
  confirmPhoneOTP: (confirmation: FirebaseConfirmationResult, code: string) => Promise<void>;
  /** Step 2 (Register): Verify OTP code and save new student profile */
  registerWithPhone: (
    confirmation: FirebaseConfirmationResult,
    code: string,
    metadata: {
      name: string;
      country: CountryCode;
      stage: StageType;
      gradeNumber: number;
    }
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

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        const isAdminUser = currentUser.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase();

        // 1. Instant Cache-First profile resolution (0 ms delay)
        let initialProfile: UserProfile;
        const savedData = typeof window !== 'undefined' ? localStorage.getItem(`alhadaf_user_${currentUser.uid}`) : null;

        if (savedData) {
          try {
            initialProfile = JSON.parse(savedData) as UserProfile;
            if (isAdminUser) initialProfile.role = 'superadmin';
          } catch {
            initialProfile = {
              uid: currentUser.uid,
              email: currentUser.email || '',
              displayName: currentUser.displayName || currentUser.email?.split('@')[0] || 'مشترك',
              photoURL: currentUser.photoURL || undefined,
              role: isAdminUser ? 'superadmin' : 'student',
              status: 'active',
              savedLessons: [],
              quizHistory: [],
              createdAt: new Date().toISOString()
            };
          }
        } else {
          initialProfile = {
            uid: currentUser.uid,
            email: currentUser.email || '',
            displayName: currentUser.displayName || currentUser.email?.split('@')[0] || 'مشترك',
            photoURL: currentUser.photoURL || undefined,
            role: isAdminUser ? 'superadmin' : 'student',
            status: 'active',
            savedLessons: [],
            quizHistory: [],
            createdAt: new Date().toISOString()
          };
        }

        if (!isAdminUser && !initialProfile.country) {
          setNeedsCurriculumSelection(true);
        } else {
          setNeedsCurriculumSelection(false);
        }

        if (initialProfile.country && !isAdminUser) {
          try { localStorage.setItem(COUNTRY_STORAGE_KEY, initialProfile.country); } catch {}
        }

        // Set state and release loading spinner IMMEDIATELY
        setProfile(initialProfile);
        setLoading(false);

        // 2. Background Firestore sync (non-blocking)
        if (db) {
          const userDocRef = doc(db, 'users', currentUser.uid);
          getDoc(userDocRef).then((userSnap) => {
            if (userSnap.exists()) {
              const remoteProfile = userSnap.data() as UserProfile;
              if (isAdminUser) remoteProfile.role = 'superadmin';
              setProfile(remoteProfile);
              try {
                localStorage.setItem(`alhadaf_user_${currentUser.uid}`, JSON.stringify(remoteProfile));
                upsertUserInLocalList(remoteProfile);
              } catch {}
            } else {
              syncProfileToFirestore(initialProfile);
            }
          }).catch((err) => {
            console.warn('Background profile sync note:', err);
          });
        }
      } else {
        setProfile(null);
        setNeedsCurriculumSelection(false);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const loginWithGoogle = async (rememberMe: boolean = true) => {
    if (!auth || !googleProvider) throw new Error('Firebase Auth not available');
    try {
      await setPersistence(auth, rememberMe ? browserLocalPersistence : browserSessionPersistence);
      if (typeof window !== 'undefined') {
        localStorage.setItem('alhadaf_remember_me', rememberMe ? 'true' : 'false');
      }
    } catch (e) {
      console.warn('Set persistence note:', e);
    }
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

  const loginWithTelegram = async (telegramUser: TelegramUser, rememberMe: boolean = true) => {
    if (!auth) throw new Error('Firebase Auth not available');
    try {
      await setPersistence(auth, rememberMe ? browserLocalPersistence : browserSessionPersistence);
      if (typeof window !== 'undefined') {
        localStorage.setItem('alhadaf_remember_me', rememberMe ? 'true' : 'false');
      }
    } catch (e) {
      console.warn('Set persistence note:', e);
    }

    const tgEmail = `tg_${telegramUser.id}@telegram.alhadaf.edu`;
    const tgPassword = `TG_ALHADAF_${telegramUser.id}_AUTH_2026`;
    const displayName = `${telegramUser.first_name || ''} ${telegramUser.last_name || ''}`.trim() || telegramUser.username || `طالب تيليجرام ${telegramUser.id}`;

    let fbUser: User;
    try {
      const res = await signInWithEmailAndPassword(auth, tgEmail, tgPassword);
      fbUser = res.user;
    } catch (loginErr: any) {
      if (
        loginErr.code === 'auth/user-not-found' ||
        loginErr.code === 'auth/invalid-credential' ||
        loginErr.code === 'auth/wrong-password'
      ) {
        const createRes = await createUserWithEmailAndPassword(auth, tgEmail, tgPassword);
        fbUser = createRes.user;
        try {
          await updateProfile(fbUser, {
            displayName,
            photoURL: telegramUser.photo_url || undefined,
          });
        } catch {}
      } else {
        throw loginErr;
      }
    }

    // Load or create Firestore user profile
    const isAdminUser = fbUser.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase();
    let existingData: UserProfile | null = null;
    if (db) {
      try {
        const snap = await getDoc(doc(db, 'users', fbUser.uid));
        if (snap.exists()) {
          existingData = snap.data() as UserProfile;
        }
      } catch {}
    }

    const userProfile: UserProfile = existingData || {
      uid: fbUser.uid,
      email: '',
      displayName,
      photoURL: telegramUser.photo_url || undefined,
      telegramId: telegramUser.id,
      telegramUsername: telegramUser.username || undefined,
      role: isAdminUser ? 'superadmin' : 'student',
      status: 'active',
      savedLessons: [],
      quizHistory: [],
      createdAt: new Date().toISOString(),
    };

    if (isAdminUser) userProfile.role = 'superadmin';
    if (telegramUser.photo_url && !userProfile.photoURL) {
      userProfile.photoURL = telegramUser.photo_url;
    }
    if (telegramUser.username && !userProfile.telegramUsername) {
      userProfile.telegramUsername = telegramUser.username;
    }

    setProfile(userProfile);
    if (!isAdminUser && !userProfile.country) {
      setNeedsCurriculumSelection(true);
    } else {
      setNeedsCurriculumSelection(false);
    }

    try {
      localStorage.setItem(`alhadaf_user_${fbUser.uid}`, JSON.stringify(userProfile));
      if (userProfile.country) {
        localStorage.setItem(COUNTRY_STORAGE_KEY, userProfile.country);
      }
      upsertUserInLocalList(userProfile);
    } catch {}

    await syncProfileToFirestore(userProfile);
  };

  const loginWithEmail = async (email: string, pass: string, rememberMe: boolean = true) => {
    if (!auth) throw new Error('Firebase Auth not available');
    try {
      await setPersistence(auth, rememberMe ? browserLocalPersistence : browserSessionPersistence);
      if (typeof window !== 'undefined') {
        localStorage.setItem('alhadaf_remember_me', rememberMe ? 'true' : 'false');
      }
    } catch (e) {
      console.warn('Set persistence note:', e);
    }
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
    try {
      await setPersistence(auth, browserLocalPersistence);
      if (typeof window !== 'undefined') {
        localStorage.setItem('alhadaf_remember_me', 'true');
      }
    } catch (e) {
      console.warn('Set persistence note:', e);
    }
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

  /**
   * Step 1 — Send OTP via Firebase Phone Auth (SMS).
   * Robust reCAPTCHA lifecycle: ensures container element is clean
   * and previous widgets are destroyed before creating a new verifier.
   */
  const sendPhoneOTP = async (
    phone: string,
    recaptchaContainerId: string
  ): Promise<FirebaseConfirmationResult> => {
    if (!auth) throw new Error('Firebase Auth not available');
    if (typeof window === 'undefined') throw new Error('Window not available');

    // 1. Locate container in DOM
    const container = document.getElementById(recaptchaContainerId);
    if (!container) {
      throw new Error(`حاوية reCAPTCHA #${recaptchaContainerId} غير موجودة في الصفحة.`);
    }

    // 2. Clear any existing RecaptchaVerifier
    const existing = (window as any).__recaptchaVerifier;
    if (existing) {
      try {
        existing.clear();
      } catch (e) {
        console.warn('reCAPTCHA clear note:', e);
      }
      delete (window as any).__recaptchaVerifier;
    }

    // 3. Replace container with a clean clone to strip any internal grecaptcha widget IDs
    // This prevents "reCAPTCHA has already been rendered in this element" error completely
    const freshContainer = container.cloneNode(false) as HTMLElement;
    freshContainer.innerHTML = '';
    freshContainer.id = recaptchaContainerId;
    container.parentNode?.replaceChild(freshContainer, container);

    // 4. Create fresh invisible RecaptchaVerifier
    const verifier = new RecaptchaVerifier(auth, freshContainer, {
      size: 'invisible',
      callback: () => {
        // reCAPTCHA solved
      },
      'expired-callback': () => {
        try {
          verifier.clear();
        } catch {}
        delete (window as any).__recaptchaVerifier;
      },
    });

    (window as any).__recaptchaVerifier = verifier;

    // 5. Send SMS with Firebase
    try {
      const confirmation = await signInWithPhoneNumber(auth, phone, verifier);
      return confirmation;
    } catch (err: any) {
      // On failure, clear verifier and DOM so subsequent retry starts clean
      try {
        verifier.clear();
      } catch {}
      delete (window as any).__recaptchaVerifier;
      if (freshContainer) {
        freshContainer.innerHTML = '';
      }
      throw err;
    }
  };

  /**
   * Check if phone number already exists in Firestore users or local storage.
   */
  const checkPhoneNumberExists = async (phone: string): Promise<boolean> => {
    if (!phone) return false;
    const clean = phone.trim();

    // 1. Fast check in local storage cache
    const localUsers = getAllUsersLocal();
    if (localUsers.some(u => u.phoneNumber === clean)) {
      return true;
    }

    // 2. Query Firestore users collection
    if (db) {
      try {
        const q1 = query(collection(db, 'users'), where('phoneNumber', '==', clean));
        const snap1 = await getDocs(q1);
        if (!snap1.empty) return true;

        // Alternate with/without leading '+' in case of format differences
        const alt = clean.startsWith('+') ? clean.slice(1) : `+${clean}`;
        const q2 = query(collection(db, 'users'), where('phoneNumber', '==', alt));
        const snap2 = await getDocs(q2);
        if (!snap2.empty) return true;
      } catch (err) {
        console.warn('checkPhoneNumberExists Firestore query error:', err);
      }
    }

    return false;
  };

  /**
   * Step 2 (Login) — Verify OTP code for existing registered user.
   */
  const confirmPhoneOTP = async (
    confirmation: FirebaseConfirmationResult,
    code: string
  ): Promise<void> => {
    if (!auth) throw new Error('Firebase Auth not available');

    const result = await confirmation.confirm(code);
    const fbUser = result.user;

    if (fbUser) {
      const isAdminUser = fbUser.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase();
      let existingData: UserProfile | null = null;

      if (db) {
        try {
          const userDocRef = doc(db, 'users', fbUser.uid);
          const snap = await getDoc(userDocRef);
          if (snap.exists()) {
            existingData = snap.data() as UserProfile;
          } else if (fbUser.phoneNumber) {
            // Check by phone number in case registered previously under different doc ID
            const q = query(collection(db, 'users'), where('phoneNumber', '==', fbUser.phoneNumber));
            const phoneSnap = await getDocs(q);
            if (!phoneSnap.empty) {
              existingData = phoneSnap.docs[0].data() as UserProfile;
            }
          }
        } catch (err) {
          console.warn('Error fetching user profile by phone:', err);
        }
      }

      const userProfile: UserProfile = existingData || {
        uid: fbUser.uid,
        email: fbUser.email || '',
        displayName: fbUser.displayName || fbUser.phoneNumber || 'مشترك',
        phoneNumber: fbUser.phoneNumber || undefined,
        role: isAdminUser ? 'superadmin' : 'student',
        status: 'active',
        savedLessons: [],
        quizHistory: [],
        createdAt: new Date().toISOString(),
      };

      if (isAdminUser) userProfile.role = 'superadmin';
      if (!userProfile.phoneNumber && fbUser.phoneNumber) {
        userProfile.phoneNumber = fbUser.phoneNumber;
      }

      setProfile(userProfile);
      if (userProfile.country) {
        setNeedsCurriculumSelection(false);
      }
      try {
        localStorage.setItem(`alhadaf_user_${fbUser.uid}`, JSON.stringify(userProfile));
        if (userProfile.country) {
          localStorage.setItem(COUNTRY_STORAGE_KEY, userProfile.country);
        }
        upsertUserInLocalList(userProfile);
      } catch {}
      await syncProfileToFirestore(userProfile);
    }
  };

  /**
   * Step 2 (Register) — Verify OTP code and save new student profile with country & grade.
   */
  const registerWithPhone = async (
    confirmation: FirebaseConfirmationResult,
    code: string,
    metadata: {
      name: string;
      country: CountryCode;
      stage: StageType;
      gradeNumber: number;
    }
  ): Promise<void> => {
    if (!auth) throw new Error('Firebase Auth not available');

    const result = await confirmation.confirm(code);
    const fbUser = result.user;

    if (fbUser) {
      if (metadata.name) {
        try {
          await updateProfile(fbUser, { displayName: metadata.name.trim() });
        } catch {}
      }

      const newProfile: UserProfile = {
        uid: fbUser.uid,
        email: fbUser.email || '',
        displayName: metadata.name.trim() || fbUser.phoneNumber || 'مشترك',
        phoneNumber: fbUser.phoneNumber || undefined,
        country: metadata.country,
        stage: metadata.stage,
        gradeNumber: metadata.gradeNumber,
        role: 'student',
        status: 'active',
        savedLessons: [],
        quizHistory: [],
        createdAt: new Date().toISOString(),
      };

      setProfile(newProfile);
      setNeedsCurriculumSelection(false);
      try {
        localStorage.setItem(`alhadaf_user_${fbUser.uid}`, JSON.stringify(newProfile));
        localStorage.setItem(COUNTRY_STORAGE_KEY, metadata.country);
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
    if (typeof window !== 'undefined') {
      localStorage.removeItem('alhadaf_remember_me');
    }
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

  const normalized = normalizeRole(profile?.role, user?.email);
  const isSuperAdmin = normalized === 'SUPER_ADMIN';
  const isCountrySupervisor = normalized === 'COUNTRY_SUPERVISOR';
  const isStudent = normalized === 'STUDENT';
  const isAdmin = isSuperAdmin;
  const isModerator = isCountrySupervisor;
  const userCountry: CountryCode = (profile?.assignedCountry || profile?.countryId || profile?.country || 'sa') as CountryCode;

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        isAdmin,
        isModerator,
        isSuperAdmin,
        isCountrySupervisor,
        isStudent,
        userCountry,
        loading,
        needsCurriculumSelection,
        loginWithGoogle,
        loginWithTelegram,
        loginWithEmail,
        registerWithEmail,
        checkPhoneNumberExists,
        sendPhoneOTP,
        confirmPhoneOTP,
        registerWithPhone,
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