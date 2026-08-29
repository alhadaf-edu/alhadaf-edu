'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useAdSense } from '@/context/AdSenseContext';
import { useLessons } from '@/context/LessonsContext';
import { STAGES, SUBJECTS, ARAB_COUNTRIES, getStagesForCountry, getSubjectsForCountry } from '@/lib/curriculumData';
import { Lesson, Quiz, Question, StageType, CountryCode, UserProfile, UserRole, UserStatus } from '@/types';
import { extractYouTubeId } from '@/lib/youtube';
import { uploadToCloudinary } from '@/lib/cloudinary';
import { db } from '@/lib/firebase';
import { collection, getDocs, doc, setDoc, deleteDoc, updateDoc } from 'firebase/firestore';
import IslamicPattern from '@/components/layout/IslamicPattern';
import { 
  ShieldCheck, 
  BookOpen, 
  Video, 
  HelpCircle, 
  DollarSign, 
  TrendingUp, 
  Plus, 
  Trash2, 
  Edit3, 
  RefreshCw, 
  Check, 
  Eye, 
  FileText, 
  Save, 
  X,
  ExternalLink,
  Sparkles,
  Globe2,
  Filter,
  Sliders,
  CheckCircle2,
  Link2,
  Users,
  UserCog,
  UserX,
  AlertTriangle,
  Ban,
  Crown,
  ShieldOff,
  Mail,
  Calendar,
  Search,
  ChevronDown
} from 'lucide-react';
import Link from 'next/link';

export default function AdminDashboardPage() {
  const { user, isAdmin, isModerator, profile, loading: authLoading } = useAuth();
  const { settings: adSettings, updateSettings: updateAdSettings } = useAdSense();
  const { 
    lessons, 
    quizzes, 
    addLesson, 
    updateLesson, 
    deleteLesson, 
    syncWithYouTube, 
    selectedCountry,
    syncMode,
    setSyncMode 
  } = useLessons();

  const [activeTab, setActiveTab] = useState<'overview' | 'lessons' | 'quizzes' | 'youtube' | 'ads' | 'users'>('overview');
  
  // Country isolation filter in Admin Dashboard ('all' or specific CountryCode)
  const [adminCountry, setAdminCountry] = useState<CountryCode | 'all'>('all');

  // Lesson modal state
  const [editingLesson, setEditingLesson] = useState<Partial<Lesson> | null>(null);
  const [isLessonModalOpen, setIsLessonModalOpen] = useState(false);

  // YouTube Sync state
  const [syncing, setSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState('');

  // AdSense config state
  const [adClientId, setAdClientId] = useState(adSettings.adClient || '');
  const [adsSavedNotice, setAdsSavedNotice] = useState(false);

  // File upload state for lesson modal
  const [uploadingPdf, setUploadingPdf] = useState(false);

  // ─── USER MANAGEMENT STATE ────────────────────────────────────────────────
  const [allUsers, setAllUsers] = useState<UserProfile[]>([]);
  const [usersSearch, setUsersSearch] = useState('');
  const [usersRoleFilter, setUsersRoleFilter] = useState<UserRole | 'all'>('all');
  const [assignModeratorUser, setAssignModeratorUser] = useState<UserProfile | null>(null);
  const [assignedCountryForMod, setAssignedCountryForMod] = useState<CountryCode>('sa');
  const [userActionMsg, setUserActionMsg] = useState('');

  const [usersLoading, setUsersLoading] = useState(false);

  const ALL_USERS_KEY = 'alhadaf_all_users_v1';

  const loadUsers = useCallback(() => {
    // 1. Instant: load from localStorage first (0ms)
    try {
      const raw = localStorage.getItem(ALL_USERS_KEY);
      const cachedList: UserProfile[] = raw ? JSON.parse(raw) : [];
      if (cachedList.length > 0) setAllUsers(cachedList);
    } catch {}

    // 2. Background: fetch from Firestore and update
    if (!db) return;
    setUsersLoading(true);
    getDocs(collection(db, 'users')).then((querySnapshot) => {
      if (!querySnapshot.empty) {
        const list: UserProfile[] = [];
        querySnapshot.forEach(docSnap => list.push(docSnap.data() as UserProfile));
        setAllUsers(list);
        try { localStorage.setItem(ALL_USERS_KEY, JSON.stringify(list)); } catch {}
      }
    }).catch((err) => {
      console.warn('Firestore fetch users notice:', err);
    }).finally(() => {
      setUsersLoading(false);
    });
  }, []);

  useEffect(() => {
    if (isAdmin || isModerator) loadUsers();
  }, [isAdmin, isModerator, loadUsers]);

  const saveAllUsers = async (list: UserProfile[]) => {
    try {
      localStorage.setItem(ALL_USERS_KEY, JSON.stringify(list));
      list.forEach(u => {
        localStorage.setItem(`alhadaf_user_${u.uid}`, JSON.stringify(u));
      });
      setAllUsers([...list]);
    } catch {}
  };

  const handleAssignModerator = async () => {
    if (!assignModeratorUser) return;
    const targetUser = assignModeratorUser;
    const country = assignedCountryForMod;
    const countryName = ARAB_COUNTRIES.find(c => c.code === country)?.name || country;

    // 1. Close modal and set feedback IMMEDIATELY
    setAssignModeratorUser(null);

    // 2. Update local state and localStorage
    const updated = allUsers.map(u => 
      u.uid === targetUser.uid
        ? { ...u, role: 'moderator' as UserRole, assignedCountry: country }
        : u
    );
    saveAllUsers(updated);
    setUserActionMsg(`✅ تم تعيين ${targetUser.displayName} مشرفاً على ${countryName} بنجاح`);
    setTimeout(() => setUserActionMsg(''), 4000);

    // 3. Persist to Firestore in background
    if (db) {
      try {
        await setDoc(doc(db, 'users', targetUser.uid), {
          role: 'moderator',
          assignedCountry: country,
        }, { merge: true });
      } catch (err) {
        console.warn('Firestore update role error:', err);
      }
    }
  };

  const handleRevokeModerator = async (uid: string) => {
    const updated = allUsers.map(u =>
      u.uid === uid ? { ...u, role: 'student' as UserRole, assignedCountry: undefined } : u
    );
    saveAllUsers(updated);
    setUserActionMsg('تم إلغاء صفة المشرف وتحويل الحساب إلى طالب');
    setTimeout(() => setUserActionMsg(''), 4000);

    if (db) {
      try {
        await setDoc(doc(db, 'users', uid), {
          role: 'student',
          assignedCountry: null as any,
        }, { merge: true });
      } catch (err) {
        console.warn('Firestore revoke role error:', err);
      }
    }
  };

  const handleWarnUser = async (uid: string) => {
    const warnMsg = prompt('اكتب رسالة التنبيه للمستخدم:');
    if (!warnMsg) return;
    const updated = allUsers.map(u =>
      u.uid === uid ? { ...u, status: 'warned' as UserStatus, warnMessage: warnMsg } : u
    );
    saveAllUsers(updated);
    setUserActionMsg('تم إرسال التنبيه للمستخدم');
    setTimeout(() => setUserActionMsg(''), 4000);

    if (db) {
      try {
        await setDoc(doc(db, 'users', uid), {
          status: 'warned',
          warnMessage: warnMsg,
        }, { merge: true });
      } catch (err) {
        console.warn('Firestore warn user error:', err);
      }
    }
  };

  const handleBanUser = async (uid: string, name: string) => {
    if (!confirm(`هل تريد حظر المستخدم "${name}" نهائياً؟`)) return;
    const updated = allUsers.map(u =>
      u.uid === uid ? { ...u, status: 'banned' as UserStatus } : u
    );
    saveAllUsers(updated);
    setUserActionMsg(`تم حظر المستخدم "${name}"`);
    setTimeout(() => setUserActionMsg(''), 4000);

    if (db) {
      try {
        await setDoc(doc(db, 'users', uid), {
          status: 'banned',
        }, { merge: true });
      } catch (err) {
        console.warn('Firestore ban user error:', err);
      }
    }
  };

  const handleUnbanUser = async (uid: string) => {
    const updated = allUsers.map(u =>
      u.uid === uid ? { ...u, status: 'active' as UserStatus, warnMessage: undefined } : u
    );
    saveAllUsers(updated);
    setUserActionMsg('تم إلغاء الحظر وتفعيل الحساب');
    setTimeout(() => setUserActionMsg(''), 4000);

    if (db) {
      try {
        await setDoc(doc(db, 'users', uid), {
          status: 'active',
          warnMessage: null as any,
        }, { merge: true });
      } catch (err) {
        console.warn('Firestore unban user error:', err);
      }
    }
  };

  const handleDeleteUser = async (uid: string, name: string) => {
    if (!confirm(`هل تريد حذف المستخدم "${name}" نهائياً؟ لا يمكن التراجع.`)) return;
    const updated = allUsers.filter(u => u.uid !== uid);
    saveAllUsers(updated);
    try { localStorage.removeItem(`alhadaf_user_${uid}`); } catch {}
    setUserActionMsg(`تم حذف المستخدم "${name}"`);
    setTimeout(() => setUserActionMsg(''), 4000);

    if (db) {
      try {
        await deleteDoc(doc(db, 'users', uid));
      } catch (err) {
        console.warn('Firestore delete user error:', err);
      }
    }
  };

  const filteredUsers = allUsers.filter(u => {
    const matchSearch = usersSearch === '' || 
      u.displayName?.toLowerCase().includes(usersSearch.toLowerCase()) ||
      u.email?.toLowerCase().includes(usersSearch.toLowerCase());
    const matchRole = usersRoleFilter === 'all' || u.role === usersRoleFilter;
    return matchSearch && matchRole;
  });

  const moderators = allUsers.filter(u => u.role === 'moderator');
  // ─────────────────────────────────────────────────────────────────────────

  // Block only if still loading AND admin status not yet determined
  if (authLoading && !isAdmin && !isModerator) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-amber-500 border-t-transparent" />
      </div>
    );
  }

  // Admin / Moderator protection
  if (!authLoading && !isAdmin && !isModerator) {
    return (
      <div className="min-h-screen py-20 flex items-center justify-center bg-slate-50/60 dark:bg-slate-950/40">
        <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 text-center max-w-md mx-4 shadow-xl">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 mb-4">
            <ShieldCheck className="h-8 w-8" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            منطقة المشرفين فقط
          </h2>
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            هذه الصفحة مخصصة لمديري ومشرفي منصة الهَدَّاف التعليمية.
          </p>
          <Link
            href="/auth/login"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-primary-600 hover:bg-primary-700 text-white px-6 py-2.5 text-xs font-bold shadow"
          >
            تسجيل الدخول كمشرف
          </Link>
        </div>
      </div>
    );
  }

  // If moderator, lock adminCountry to their assigned country
  const effectiveCountry: CountryCode | 'all' = isModerator && profile?.assignedCountry
    ? profile.assignedCountry
    : adminCountry;

  // Filter lessons & quizzes by effectiveCountry (respects moderator restriction)
  const filteredLessons = lessons.filter(l => {
    if (effectiveCountry === 'all') return true;
    return (l.country || 'sa') === effectiveCountry;
  });

  const filteredQuizzes = quizzes.filter(q => {
    if (effectiveCountry === 'all') return true;
    return (q.country || 'sa') === effectiveCountry;
  });

  const activeCountryInfo = effectiveCountry !== 'all' 
    ? ARAB_COUNTRIES.find(c => c.code === effectiveCountry)
    : null;

  // --- Handlers for Lessons ---
  const handleOpenAddLesson = () => {
    const defaultCountry: CountryCode = adminCountry === 'all' ? 'eg' : adminCountry;
    const stages = getStagesForCountry(defaultCountry);
    const subjects = getSubjectsForCountry(defaultCountry, stages[0]?.id);
    
    setEditingLesson({
      id: `lesson_${Date.now()}`,
      title: '',
      description: '',
      stage: stages[0]?.id || 'secondary',
      gradeNumber: 1,
      subjectId: subjects[0]?.id || 'physics-sec',
      subjectName: subjects[0]?.name || 'الفيزياء',
      country: defaultCountry,
      term: 1,
      unitTitle: 'الوحدة الأولى',
      youtubeUrl: '',
      youtubeId: '',
      thumbnailUrl: '',
      duration: '20 دقيقة',
      pdfUrl: '',
      pdfTitle: '',
      viewsCount: 100,
      likesCount: 15,
      createdAt: new Date().toISOString(),
    });
    setIsLessonModalOpen(true);
  };

  const handleSaveLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLesson || !editingLesson.title) return;

    const ytId = extractYouTubeId(editingLesson.youtubeUrl || '') || editingLesson.youtubeId || 'hHAHtNUyHPM';
    const targetCountry = editingLesson.country || (adminCountry === 'all' ? 'eg' : adminCountry);
    const subObj = getSubjectsForCountry(targetCountry, editingLesson.stage).find(s => s.id === editingLesson.subjectId);
    const subjectName = subObj ? subObj.name : (editingLesson.subjectName || 'عام');

    const fullLesson: Lesson = {
      id: editingLesson.id || `lesson_${Date.now()}`,
      title: editingLesson.title,
      description: editingLesson.description || '',
      stage: editingLesson.stage || 'secondary',
      gradeNumber: Number(editingLesson.gradeNumber) || 1,
      subjectId: editingLesson.subjectId || 'physics-sec',
      subjectName,
      country: targetCountry,
      term: Number(editingLesson.term) as any || 1,
      unitTitle: editingLesson.unitTitle || 'الوحدة الأولى',
      youtubeId: ytId,
      youtubeUrl: editingLesson.youtubeUrl || `https://www.youtube.com/watch?v=${ytId}`,
      thumbnailUrl: editingLesson.thumbnailUrl || `https://i.ytimg.com/vi/${ytId}/hqdefault.jpg`,
      duration: editingLesson.duration || '20 دقيقة',
      pdfUrl: editingLesson.pdfUrl,
      pdfTitle: editingLesson.pdfTitle,
      viewsCount: editingLesson.viewsCount || 50,
      likesCount: editingLesson.likesCount || 5,
      createdAt: editingLesson.createdAt || new Date().toISOString(),
    };

    const exists = lessons.some(l => l.id === fullLesson.id);
    if (exists) {
      await updateLesson(fullLesson.id, fullLesson);
    } else {
      await addLesson(fullLesson);
    }

    setIsLessonModalOpen(false);
    setEditingLesson(null);
  };

  const handleDeleteLesson = async (id: string) => {
    if (confirm('هل أنت متأكد من حذف هذا الدرس نهائياً من المنصة؟')) {
      await deleteLesson(id);
    }
  };

  // --- Handlers for Cloudinary Uploads ---
  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editingLesson) return;
    setUploadingPdf(true);
    try {
      const res = await uploadToCloudinary(file, 'alhadaf_summaries');
      setEditingLesson({
        ...editingLesson,
        pdfUrl: res.url,
        pdfTitle: file.name,
      });
    } catch (err) {
      console.error(err);
    } finally {
      setUploadingPdf(false);
    }
  };

  // --- Handlers for YouTube Sync ---
  const handleSyncYouTube = async () => {
    setSyncing(true);
    setSyncMessage('');
    try {
      const res = await syncWithYouTube();
      setSyncMessage(res.message);
    } catch (err: any) {
      setSyncMessage('حدث خطأ أثناء المزامنة، يرجى إعادة المحاولة.');
    } finally {
      setSyncing(false);
    }
  };

  // --- Handlers for AdSense Settings ---
  const handleSaveAds = () => {
    updateAdSettings({ adClient: adClientId });
    setAdsSavedNotice(true);
    setTimeout(() => setAdsSavedNotice(false), 4000);
  };

  return (
    <div className="min-h-screen py-10 bg-slate-50/60 dark:bg-slate-950/40">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Admin Header */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-950 via-primary-950 to-indigo-950 text-white p-6 sm:p-8 shadow-xl mb-8 border border-slate-800">
          <IslamicPattern variant="stars" opacity={0.06} />
          
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/20 text-gold-400 border border-gold-400/30 px-3 py-0.5 text-xs font-black mb-2">
                <ShieldCheck className="h-4 w-4" />
                <span>لوحة التحكم الرئيسية للمشرف</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black font-heading text-white">
                إدارة منصة الهَدَّاف التعليمية
              </h1>
              <p className="text-xs text-slate-300 mt-1">
                مرحباً بك ({user?.email}) • خيارات النشر والتحكم في وضع المزامنة وإضافة الفيديوهات
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              {syncMode === 'auto' && (
                <button
                  onClick={handleSyncYouTube}
                  disabled={syncing}
                  className="flex items-center gap-2 rounded-2xl bg-red-600 hover:bg-red-700 text-white px-4 py-2.5 text-xs font-bold shadow transition-all disabled:opacity-50"
                >
                  <RefreshCw className={`h-4 w-4 ${syncing ? 'animate-spin' : ''}`} />
                  <span>{syncing ? 'جاري المزامنة...' : 'مزامنة فيديوهات YouTube'}</span>
                </button>
              )}

              <button
                onClick={handleOpenAddLesson}
                className="flex items-center gap-2 rounded-2xl bg-gold-500 hover:bg-gold-600 text-slate-950 px-5 py-2.5 text-xs font-black shadow-lg hover:shadow-gold-500/20 transition-all scale-105"
              >
                <Plus className="h-4.5 w-4.5" />
                <span>إضافة درس وتخصيص فيديو احترافي</span>
              </button>
            </div>
          </div>
        </div>

        {/* 🎛️ SYNC MODE TOGGLE CARD (التبديل بين المزامنة التلقائية والوضع اليدوي) */}
        <div className="mb-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-sm font-black text-slate-900 dark:text-white">
                <Sliders className="h-4.5 w-4.5 text-primary-600 dark:text-gold-400" />
                <span>وضع إضافة ونشر الفيديوهات على المنصة:</span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                اختر طريقة جلب وتعيين فيديوهات الدروس للمناهج والدول.
              </p>
            </div>

            <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl shrink-0">
              <button
                onClick={() => setSyncMode('manual')}
                className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all ${
                  syncMode === 'manual'
                    ? 'bg-amber-500 text-slate-950 shadow font-black'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                <Link2 className="h-4 w-4" />
                <span>✍️ الوضع اليدوي وتخصيص الفيديوهات (موصى به)</span>
              </button>

              <button
                onClick={() => setSyncMode('auto')}
                className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all ${
                  syncMode === 'auto'
                    ? 'bg-primary-600 text-white shadow font-black'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                <RefreshCw className="h-4 w-4" />
                <span>⚡ المزامنة التلقائية لقناة YouTube</span>
              </button>
            </div>
          </div>

          {syncMode === 'manual' ? (
            <div className="mt-4 flex items-center gap-2 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 p-3.5 text-xs font-bold text-amber-800 dark:text-amber-200">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-amber-600" />
              <span>الوضع اليدوي مفعّل: تتيح لك شاشة الإضافة الاحترافية وضع روابط الفيديوهات مباشرة للمناهج والدول والمراحل والمواد بكل حرية ودقة.</span>
            </div>
          ) : (
            <div className="mt-4 flex items-center gap-2 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 p-3.5 text-xs font-bold text-blue-800 dark:text-blue-200">
              <RefreshCw className="h-4 w-4 shrink-0 text-blue-600" />
              <span>وضع المزامنة التلقائية مفعّل: يتم سحب وتصنيف فيديوهات قناة YouTube تلقائياً بحسب العناوين.</span>
            </div>
          )}
        </div>

        {/* Sync Message Alert */}
        {syncMessage && (
          <div className="mb-6 flex items-center gap-2 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 p-4 text-xs font-bold text-emerald-800 dark:text-emerald-200 animate-fade-in">
            <Check className="h-4 w-4 shrink-0" />
            <span>{syncMessage}</span>
          </div>
        )}

        {/* 🌍 COUNTRY ISOLATION SWITCHER (فصل وإدارة المناهج حسب الدولة) */}
        <div className="mb-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm">
          <div className="flex items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2 text-xs font-black text-slate-700 dark:text-slate-200">
              <Globe2 className="h-4 w-4 text-primary-600 dark:text-gold-400" />
              <span>تخصيص لوحة التحكم حسب المنهج والدولة:</span>
            </div>
            {activeCountryInfo && (
              <span className="text-xs font-bold text-primary-600 dark:text-gold-400">
                يتم عرض بيانات: {activeCountryInfo.flag} {activeCountryInfo.name}
              </span>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setAdminCountry('all')}
              className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold transition-all ${
                adminCountry === 'all'
                  ? 'bg-primary-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              <span>🌐 كافة الدول والمناهج ({lessons.length})</span>
            </button>
            {ARAB_COUNTRIES.map((c) => {
              const cCount = lessons.filter(l => (l.country || 'sa') === c.code).length;
              return (
                <button
                  key={c.code}
                  onClick={() => setAdminCountry(c.code)}
                  className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold transition-all ${
                    adminCountry === c.code
                      ? 'bg-primary-600 text-white shadow-sm'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                  }`}
                >
                  <span className="text-sm">{c.flag}</span>
                  <span>{c.name.replace('المملكة العربية ', '').replace('جمهورية ', '').replace('دولة ', '').replace('سلطنة ', '')} ({cCount})</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex rounded-2xl bg-white dark:bg-slate-900 p-1.5 border border-slate-200/80 dark:border-slate-800 mb-6 shadow-sm overflow-x-auto gap-1">
          {[
            { id: 'overview', label: 'الرؤية الشاملة', icon: TrendingUp, adminOnly: false },
            { id: 'lessons', label: `الدروس والفيديوهات (${filteredLessons.length})`, icon: Video, adminOnly: false },
            { id: 'quizzes', label: `الاختبارات (${filteredQuizzes.length})`, icon: HelpCircle, adminOnly: false },
            { id: 'youtube', label: 'YouTube', icon: RefreshCw, adminOnly: true },
            { id: 'ads', label: 'AdSense', icon: DollarSign, adminOnly: true },
            { id: 'users', label: `المستخدمون (${allUsers.length})`, icon: Users, adminOnly: true },
          ].filter(t => !t.adminOnly || isAdmin).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-3 px-3 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? tab.id === 'users'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-primary-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* --- TAB 1: OVERVIEW & STATS --- */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600">
                    <Video className="h-6 w-6" />
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                    {adminCountry === 'all' ? 'الكل' : activeCountryInfo?.flag}
                  </span>
                </div>
                <div className="text-3xl font-black text-slate-900 dark:text-white font-heading">
                  {filteredLessons.length}
                </div>
                <div className="text-xs font-bold text-slate-500 mt-1">
                  الدروس المرفوعة {adminCountry !== 'all' ? `لـ ${activeCountryInfo?.name}` : 'كلياً'}
                </div>
              </div>

              <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600">
                    <HelpCircle className="h-6 w-6" />
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                    {adminCountry === 'all' ? 'الكل' : activeCountryInfo?.flag}
                  </span>
                </div>
                <div className="text-3xl font-black text-slate-900 dark:text-white font-heading">
                  {filteredQuizzes.length}
                </div>
                <div className="text-xs font-bold text-slate-500 mt-1">
                  الاختبارات التفاعلية المخصصة
                </div>
              </div>

              <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600">
                    <FileText className="h-6 w-6" />
                  </div>
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full">PDF</span>
                </div>
                <div className="text-3xl font-black text-slate-900 dark:text-white font-heading">
                  {filteredLessons.filter(l => l.pdfUrl || l.pdfTitle).length}
                </div>
                <div className="text-xs font-bold text-slate-500 mt-1">
                  المذكرات والملخصات المرفوقة
                </div>
              </div>

              <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-50 dark:bg-purple-950/60 text-purple-600">
                    <Eye className="h-6 w-6" />
                  </div>
                  <span className="text-[10px] font-bold text-purple-600 bg-purple-50 dark:bg-purple-950/60 px-2 py-0.5 rounded-full">مشاهدات</span>
                </div>
                <div className="text-3xl font-black text-slate-900 dark:text-white font-heading">
                  {filteredLessons.reduce((acc, curr) => acc + (curr.viewsCount || 0), 0).toLocaleString('ar-EG')}
                </div>
                <div className="text-xs font-bold text-slate-500 mt-1">
                  مجموع المشاهدات للدروس
                </div>
              </div>
            </div>
          </div>
        )}

        {/* --- TAB 2: LESSONS MANAGEMENT --- */}
        {activeTab === 'lessons' && (
          <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  قائمة الدروس والمقررات ({filteredLessons.length})
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  إدارة، تعديل، أو إضافة شروحات وفيديوهات جديدة {adminCountry !== 'all' ? `لمنهج ${activeCountryInfo?.name}` : ''}
                </p>
              </div>

              <button
                onClick={handleOpenAddLesson}
                className="flex items-center gap-1.5 rounded-xl bg-gold-500 hover:bg-gold-600 text-slate-950 font-black px-4 py-2 text-xs shadow"
              >
                <Plus className="h-4 w-4" />
                <span>إضافة وتخصيص فيديو لدرس</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-bold">
                    <th className="py-3 px-2">عنوان الدرس والفيديو</th>
                    <th className="py-3 px-2">الدولة / المنهج</th>
                    <th className="py-3 px-2">المرحلة والصف</th>
                    <th className="py-3 px-2">المادة</th>
                    <th className="py-3 px-2">رابط YouTube</th>
                    <th className="py-3 px-2 text-left">إجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {filteredLessons.map((lesson) => {
                    const cInfo = ARAB_COUNTRIES.find(c => c.code === (lesson.country || 'sa'));
                    return (
                      <tr key={lesson.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                        <td className="py-3.5 px-2 font-bold text-slate-800 dark:text-slate-100 max-w-xs truncate">
                          {lesson.title}
                        </td>
                        <td className="py-3.5 px-2 font-bold">
                          <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-[11px]">
                            <span>{cInfo?.flag || '🇸🇦'}</span>
                            <span>{cInfo?.name.replace('المملكة العربية ', '').replace('جمهورية ', '') || 'السعودية'}</span>
                          </span>
                        </td>
                        <td className="py-3.5 px-2 text-slate-500">
                          {lesson.stage === 'elementary' ? 'الابتدائي' : lesson.stage === 'middle' ? 'الإعدادي/المتوسط' : 'الثانوي'} • الصف {lesson.gradeNumber}
                        </td>
                        <td className="py-3.5 px-2">
                          <span className="rounded-md bg-primary-50 dark:bg-slate-800 px-2 py-0.5 text-[11px] font-bold text-primary-600 dark:text-gold-400">
                            {lesson.subjectName}
                          </span>
                        </td>
                        <td className="py-3.5 px-2 text-slate-500">
                          {lesson.youtubeId ? (
                            <a 
                              href={lesson.youtubeUrl || `https://www.youtube.com/watch?v=${lesson.youtubeId}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-red-600 font-bold flex items-center gap-1 hover:underline"
                            >
                              <Video className="h-3.5 w-3.5" /> مشاهدة
                            </a>
                          ) : (
                            <span className="text-slate-400">غير مرتبط</span>
                          )}
                        </td>
                        <td className="py-3.5 px-2 text-left">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => { setEditingLesson(lesson); setIsLessonModalOpen(true); }}
                              className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-800"
                              title="تعديل"
                            >
                              <Edit3 className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteLesson(lesson.id)}
                              className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 dark:hover:bg-slate-800"
                              title="حذف"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* --- TAB 3: QUIZZES MANAGEMENT --- */}
        {activeTab === 'quizzes' && (
          <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  إدارة بنك الاختبارات ({filteredQuizzes.length})
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  إدارة الاختبارات والأسئلة التقييمية {adminCountry !== 'all' ? `لمنهج ${activeCountryInfo?.name}` : ''}
                </p>
              </div>

              <Link
                href="/quizzes"
                className="flex items-center gap-1.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-bold px-4 py-2 text-xs shadow"
              >
                <Plus className="h-4 w-4" />
                <span>إضافة اختبار وتحديد الأسئلة</span>
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredQuizzes.map((quiz) => {
                const cInfo = ARAB_COUNTRIES.find(c => c.code === (quiz.country || 'sa'));
                return (
                  <div key={quiz.id} className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4 bg-slate-50/50 dark:bg-slate-800/40 flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm">{cInfo?.flag || '🇸🇦'}</span>
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white">{quiz.title}</h4>
                      </div>
                      <p className="text-[11px] text-slate-500">
                        {quiz.questions?.length || 0} أسئلة • المدة: {quiz.durationMinutes || 15} دقيقة
                      </p>
                    </div>

                    <Link href={`/quizzes/${quiz.id}`} className="text-xs font-bold text-primary-600 dark:text-gold-400 hover:underline">
                      معاينة الاختبار
                    </Link>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* --- TAB 4: YOUTUBE SYNC & MODE --- */}
        {activeTab === 'youtube' && (
          <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-sm space-y-6">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Video className="h-5 w-5 text-red-600" />
                <span>مزامنة قناة YouTube الرسمية</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                سحب وتصنيف الفيديوهات بحسب عناوين الشروحات والدول والمناهج.
              </p>
            </div>

            <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">معرف القناة (Channel ID):</h4>
                <p className="text-xs text-slate-500 font-mono">UCb9BGNPlPd2dzg9lJsIaFYQ</p>
              </div>
              <a
                href="https://www.youtube.com/channel/UCb9BGNPlPd2dzg9lJsIaFYQ"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-bold text-red-600 hover:underline flex items-center gap-1"
              >
                <span>فتح القناة على YouTube</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>

            <button
              onClick={handleSyncYouTube}
              disabled={syncing}
              className="flex items-center gap-2 rounded-xl bg-red-600 hover:bg-red-700 text-white px-6 py-3 text-xs font-bold shadow transition-all disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${syncing ? 'animate-spin' : ''}`} />
              <span>{syncing ? 'جاري فحص وتحديث الدروس...' : 'بدء المزامنة الآن'}</span>
            </button>
          </div>
        )}

        {/* --- TAB 5: ADSENSE --- */}
        {activeTab === 'ads' && (
          <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-sm space-y-6">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-gold-500" />
                <span>إدارة إعلانات Google AdSense</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                تفعيل وتعطيل مواضع الإعلانات وتحديث معرف الناشر.
              </p>
            </div>

            <div className="max-w-md">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                معرف الناشر (Google AdSense Client ID):
              </label>
              <input
                type="text"
                value={adClientId}
                onChange={(e) => setAdClientId(e.target.value)}
                placeholder="ca-pub-XXXXXXXXXXXXXXXX"
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 text-xs text-slate-900 dark:text-white"
              />
            </div>

            <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
              {[
                { key: 'headerBanner', title: 'إعلان الترويسة العلوي (Header Banner)', desc: 'يظهر في أعلى صفحات الموقع' },
                { key: 'sidebarSticky', title: 'إعلان الشريط الجانبي الثابت (Sticky Sidebar)', desc: 'يظهر بجانب مشغل الفيديو' },
                { key: 'inArticle', title: 'إعلان بين الأقسام والدروس (In-Article)', desc: 'يظهر بين محتوى الصفحة' },
                { key: 'footerBanner', title: 'إعلان التذييل (Footer Banner)', desc: 'يظهر أعلى الفوتر مباشرة' },
              ].map((slot) => (
                <div key={slot.key} className="flex items-center justify-between p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
                  <div>
                    <h5 className="text-xs font-bold text-slate-900 dark:text-white">{slot.title}</h5>
                    <p className="text-[11px] text-slate-500">{slot.desc}</p>
                  </div>

                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={!!(adSettings as any)[slot.key]}
                      onChange={(e) => updateAdSettings({ [slot.key]: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gold-500"></div>
                  </label>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-3 pt-4">
              <button
                onClick={handleSaveAds}
                className="flex items-center gap-2 rounded-xl bg-gold-500 hover:bg-gold-600 text-slate-950 font-black px-6 py-2.5 text-xs shadow transition-all"
              >
                <Save className="h-4 w-4" />
                <span>حفظ التعديلات</span>
              </button>

              {adsSavedNotice && (
                <span className="text-xs text-emerald-500 font-bold flex items-center gap-1">
                  <Check className="h-4 w-4" />
                  <span>تم حفظ الإعدادات بنجاح!</span>
                </span>
              )}
            </div>
          </div>
        )}

        {/* ─── TAB 6: USERS MANAGEMENT (شاشة إدارة المشتركين والمشرفين) ─── */}
        {activeTab === 'users' && isAdmin && (
          <div className="space-y-6">

            {/* Action Feedback Banner */}
            {userActionMsg && (
              <div className="flex items-center gap-2 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 p-4 text-xs font-bold text-emerald-800 dark:text-emerald-200 animate-fade-in">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                <span>{userActionMsg}</span>
              </div>
            )}

            {/* 👑 MODERATORS PANEL */}
            <div className="rounded-3xl border border-indigo-200 dark:border-indigo-800 bg-indigo-50/50 dark:bg-indigo-950/30 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-600/10 text-indigo-600 dark:text-indigo-400">
                    <UserCog className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-900 dark:text-white">مشرفو المناهج المعيّنون</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">يقتصر إشراف كل مشرف على منهج الدولة المخصصة له فقط</p>
                  </div>
                </div>
                <span className="text-xs font-black text-indigo-600 dark:text-indigo-400 bg-indigo-100 dark:bg-indigo-900/60 px-3 py-1 rounded-full">
                  {moderators.length} مشرف معتمد
                </span>
              </div>

              {moderators.length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-xs rounded-2xl border border-dashed border-indigo-200 dark:border-indigo-800/60 bg-white/60 dark:bg-slate-900/40">
                  <Crown className="h-8 w-8 mx-auto mb-2 text-indigo-400 opacity-40" />
                  <p className="font-bold text-slate-600 dark:text-slate-400">لم يتم تعيين أي مشرف منهج حتى الآن.</p>
                  <p className="text-[11px] mt-1">اختر أي مشترك من الجدول أدناه واضغط على زر &quot;تعيين مشرف&quot; لتحديد دولته ومنهجه.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {moderators.map(mod => {
                    const cInfo = ARAB_COUNTRIES.find(c => c.code === mod.assignedCountry);
                    return (
                      <div key={mod.uid} className="rounded-2xl border border-indigo-200 dark:border-indigo-700/70 bg-white dark:bg-slate-900 p-4 flex flex-col gap-3 shadow-xs">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 font-black text-sm shrink-0">
                            {mod.displayName?.charAt(0)?.toUpperCase() || 'M'}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-black text-slate-900 dark:text-white truncate">{mod.displayName}</p>
                            <p className="text-[10px] text-slate-400 truncate">{mod.email}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-800 dark:text-indigo-200 bg-indigo-50 dark:bg-indigo-950/60 rounded-xl px-3 py-2 border border-indigo-100 dark:border-indigo-800">
                          <span className="text-base">{cInfo?.flag || '🌐'}</span>
                          <span className="truncate">مشرف منهج: {cInfo?.name || mod.assignedCountry}</span>
                        </div>

                        <button
                          onClick={() => handleRevokeModerator(mod.uid)}
                          className="flex items-center justify-center gap-1.5 text-[11px] font-bold text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl py-1.5 transition-all border border-red-200 dark:border-red-800"
                        >
                          <ShieldOff className="h-3.5 w-3.5" />
                          <span>إلغاء صفة المشرف</span>
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* 📋 ALL SUBSCRIBERS TABLE */}
            <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
              <div className="p-5 border-b border-slate-100 dark:border-slate-800">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600">
                      <Users className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-slate-900 dark:text-white">قائمة المشتركين والحسابات</h3>
                      <p className="text-xs text-slate-500">إجمالي {allUsers.length} مشترك مسجل بالمنصة</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {/* Search Input */}
                    <div className="relative min-w-[200px]">
                      <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                      <input
                        type="text"
                        placeholder="بحث بالاسم أو البريد..."
                        value={usersSearch}
                        onChange={e => setUsersSearch(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 pr-9 pl-3 py-2 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/30"
                      />
                    </div>

                    {/* Role Filter */}
                    <select
                      value={usersRoleFilter}
                      onChange={e => setUsersRoleFilter(e.target.value as any)}
                      className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 focus:outline-none"
                    >
                      <option value="all">كل الأدوار ({allUsers.length})</option>
                      <option value="student">الطلاب</option>
                      <option value="teacher">المعلمون</option>
                      <option value="moderator">مشرفو المناهج</option>
                      <option value="superadmin">المشرف العام</option>
                    </select>

                    <button
                      onClick={loadUsers}
                      disabled={usersLoading}
                      className="flex items-center gap-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 px-3.5 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 transition-all disabled:opacity-60"
                    >
                      <RefreshCw className={`h-3.5 w-3.5 ${usersLoading ? 'animate-spin' : ''}`} />
                      <span>{usersLoading ? 'جاري التحديث...' : 'تحديث'}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Table Body */}
              {filteredUsers.length === 0 ? (
                <div className="text-center py-16 text-slate-400">
                  <Users className="h-10 w-10 mx-auto mb-3 opacity-30" />
                  <p className="text-sm font-bold text-slate-600 dark:text-slate-400">لا توجد حسابات مطابقة لمعايير البحث</p>
                  <p className="text-xs text-slate-400 mt-1">يتم تسجيل وحفظ الحسابات تلقائياً عند قيام المستخدمين بالتسجيل في المنصة</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/50">
                        <th className="px-4 py-3.5 text-right font-black text-slate-700 dark:text-slate-300">المشترك</th>
                        <th className="px-4 py-3.5 text-right font-black text-slate-700 dark:text-slate-300">المنهج / الدولة</th>
                        <th className="px-4 py-3.5 text-right font-black text-slate-700 dark:text-slate-300">الرتبة والدور</th>
                        <th className="px-4 py-3.5 text-right font-black text-slate-700 dark:text-slate-300">حالة الحساب</th>
                        <th className="px-4 py-3.5 text-right font-black text-slate-700 dark:text-slate-300">تاريخ التسجيل</th>
                        <th className="px-4 py-3.5 text-center font-black text-slate-700 dark:text-slate-300">إجراءات المشرف العام</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {filteredUsers.map(u => {
                        const countryInfo = ARAB_COUNTRIES.find(c => c.code === u.country);
                        const isSuperAdmin = u.role === 'superadmin';
                        const isMod = u.role === 'moderator';
                        return (
                          <tr 
                            key={u.uid} 
                            className={`hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors ${
                              u.status === 'banned' ? 'bg-red-50/30 dark:bg-red-950/10 opacity-70' : ''
                            }`}
                          >
                            {/* User details */}
                            <td className="px-4 py-3.5">
                              <div className="flex items-center gap-2.5">
                                <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl font-black text-xs ${
                                  isSuperAdmin ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300' :
                                  isMod ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300' :
                                  'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
                                }`}>
                                  {u.displayName?.charAt(0)?.toUpperCase() || '?'}
                                </div>
                                <div className="min-w-0">
                                  <p className="font-bold text-slate-900 dark:text-white truncate max-w-[150px]">{u.displayName || 'مشترك'}</p>
                                  <p className="text-[10px] text-slate-400 truncate max-w-[150px]">{u.email}</p>
                                  {u.warnMessage && (
                                    <p className="text-[10px] text-orange-600 font-bold mt-0.5 truncate max-w-[150px]">
                                      ⚠️ تنبيه: {u.warnMessage}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </td>

                            {/* Country / Curriculum */}
                            <td className="px-4 py-3.5">
                              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100/70 dark:bg-slate-800 px-2.5 py-1 rounded-xl">
                                <span>{countryInfo?.flag || '🌐'}</span>
                                <span>{countryInfo?.shortName || u.country || 'عام'}</span>
                              </span>
                            </td>

                            {/* Role */}
                            <td className="px-4 py-3.5">
                              <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-black ${
                                isSuperAdmin ? 'bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300 border border-amber-300/40' :
                                isMod ? 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-800 dark:text-indigo-300 border border-indigo-300/40' :
                                u.role === 'teacher' ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300' :
                                'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                              }`}>
                                {isSuperAdmin ? '👑 مشرف عام' :
                                 isMod ? `🛡️ مشرف: ${ARAB_COUNTRIES.find(c=>c.code===u.assignedCountry)?.shortName || u.assignedCountry}` :
                                 u.role === 'teacher' ? '👨‍🏫 معلم' :
                                 '🎓 طالب'}
                              </span>
                            </td>

                            {/* Status */}
                            <td className="px-4 py-3.5">
                              <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-black ${
                                u.status === 'banned' ? 'bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-300' :
                                u.status === 'warned' ? 'bg-orange-100 dark:bg-orange-900/40 text-orange-800 dark:text-orange-300' :
                                'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300'
                              }`}>
                                {u.status === 'banned' ? '🚫 محظور' :
                                 u.status === 'warned' ? '⚠️ منبّه' :
                                 '✅ نشط'}
                              </span>
                            </td>

                            {/* Registration Date */}
                            <td className="px-4 py-3.5 text-[11px] text-slate-400">
                              {u.createdAt ? new Date(u.createdAt).toLocaleDateString('ar-EG', { year: 'numeric', month: 'short', day: 'numeric' }) : '—'}
                            </td>

                            {/* Actions */}
                            <td className="px-4 py-3.5">
                              {isSuperAdmin ? (
                                <span className="text-[10px] text-slate-400 italic block text-center">المشرف العام (محمي)</span>
                              ) : (
                                <div className="flex items-center justify-center gap-1.5 flex-wrap">
                                  {/* Assign as Moderator Button */}
                                  {!isMod ? (
                                    <button
                                      onClick={() => { setAssignModeratorUser(u); setAssignedCountryForMod(u.country || 'sa'); }}
                                      title="تعيين كمشرف وتحديد منهجه"
                                      className="flex items-center gap-1 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 hover:bg-indigo-100 text-indigo-700 dark:text-indigo-300 px-2.5 py-1.5 text-[11px] font-black transition-all border border-indigo-200 dark:border-indigo-800"
                                    >
                                      <Crown className="h-3 w-3" />
                                      <span>تعيين مشرف</span>
                                    </button>
                                  ) : (
                                    <button
                                      onClick={() => handleRevokeModerator(u.uid)}
                                      title="إلغاء صلاحية الإشراف"
                                      className="flex items-center gap-1 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-600 dark:text-slate-300 px-2.5 py-1.5 text-[11px] font-bold transition-all"
                                    >
                                      <ShieldOff className="h-3 w-3" />
                                      <span>إلغاء</span>
                                    </button>
                                  )}

                                  {/* Warn Button */}
                                  {u.status !== 'banned' && (
                                    <button
                                      onClick={() => handleWarnUser(u.uid)}
                                      title="إرسال تنبيه للمستخدم"
                                      className="flex items-center gap-1 rounded-xl bg-orange-50 dark:bg-orange-900/30 hover:bg-orange-100 text-orange-700 dark:text-orange-300 px-2.5 py-1.5 text-[11px] font-bold transition-all border border-orange-200 dark:border-orange-800"
                                    >
                                      <AlertTriangle className="h-3 w-3" />
                                      <span>تنبيه</span>
                                    </button>
                                  )}

                                  {/* Ban / Unban Button */}
                                  {u.status === 'banned' ? (
                                    <button
                                      onClick={() => handleUnbanUser(u.uid)}
                                      title="رفع الحظر عن الحساب"
                                      className="flex items-center gap-1 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 hover:bg-emerald-100 text-emerald-700 dark:text-emerald-300 px-2.5 py-1.5 text-[11px] font-bold transition-all border border-emerald-200 dark:border-emerald-800"
                                    >
                                      <Check className="h-3 w-3" />
                                      <span>فك الحظر</span>
                                    </button>
                                  ) : (
                                    <button
                                      onClick={() => handleBanUser(u.uid, u.displayName || u.email)}
                                      title="حظر المشترك نهائياً"
                                      className="flex items-center gap-1 rounded-xl bg-red-50 dark:bg-red-900/30 hover:bg-red-100 text-red-700 dark:text-red-300 px-2.5 py-1.5 text-[11px] font-bold transition-all border border-red-200 dark:border-red-800"
                                    >
                                      <Ban className="h-3 w-3" />
                                      <span>حظر</span>
                                    </button>
                                  )}

                                  {/* Delete Button */}
                                  <button
                                    onClick={() => handleDeleteUser(u.uid, u.displayName || u.email)}
                                    title="حذف المشترك نهائياً"
                                    className="flex items-center gap-1 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-red-50 hover:text-red-600 text-slate-500 px-2 py-1.5 text-[11px] font-bold transition-all"
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </button>
                                </div>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── 🛡️ ASSIGN CURRICULUM MODERATOR MODAL (مودال تعيين مشرف وتحديد دولته) ── */}
        {assignModeratorUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
            <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-2xl p-6 relative">
              
              {/* Close Button */}
              <button
                onClick={() => setAssignModeratorUser(null)}
                className="absolute top-5 left-5 rounded-full p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="h-5 w-5" />
              </button>

              {/* Modal Header */}
              <div className="flex items-center gap-3 mb-5">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600/10 text-indigo-600">
                  <Crown className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white">تعيين مشرف لمنهج دولة معينة</h3>
                  <p className="text-xs text-slate-500">حدد الدولة التي سيشرف عليها هذا المستخدم بشكل حصري</p>
                </div>
              </div>

              {/* Target User Info */}
              <div className="rounded-2xl bg-indigo-50/80 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 p-3.5 mb-5 flex items-center gap-3">
                <div className="h-10 w-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-black shrink-0 text-sm">
                  {assignModeratorUser.displayName?.charAt(0)?.toUpperCase() || '?'}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-black text-slate-900 dark:text-white truncate">{assignModeratorUser.displayName}</p>
                  <p className="text-[11px] text-slate-500 truncate">{assignModeratorUser.email}</p>
                </div>
              </div>

              {/* Country Selection Grid */}
              <div className="mb-5">
                <label className="block text-xs font-black text-slate-800 dark:text-slate-200 mb-2">
                  اختر المنهج المخصص لإشرافه:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-2 gap-2">
                  {ARAB_COUNTRIES.filter(c => c.code !== 'general').map(c => (
                    <button
                      key={c.code}
                      type="button"
                      onClick={() => setAssignedCountryForMod(c.code)}
                      className={`flex items-center gap-2 rounded-2xl p-3 text-xs font-bold transition-all border text-right ${
                        assignedCountryForMod === c.code
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-md font-black'
                          : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-indigo-300'
                      }`}
                    >
                      <span className="text-xl shrink-0">{c.flag}</span>
                      <span className="truncate">{c.name.replace('المملكة العربية ', '').replace('جمهورية ', '').replace('دولة ', '').replace('سلطنة ', '')}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Notice */}
              <div className="rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 p-3.5 mb-6 text-xs text-amber-800 dark:text-amber-300 font-bold leading-relaxed">
                🔒 صلاحيات المشرف: سيتمكن فقط من إضافة وتعديل وحذف الدروس والاختبارات الخاصة بمنهج <span className="font-black underline">{ARAB_COUNTRIES.find(c=>c.code===assignedCountryForMod)?.name}</span>، ولن تظهر له بيانات باقي المناهج أو إعدادات لوحة المشرف العام.
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setAssignModeratorUser(null)}
                  className="flex-1 rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50"
                >
                  إلغاء
                </button>
                <button
                  type="button"
                  onClick={handleAssignModerator}
                  className="flex-1 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 text-xs font-black shadow-md transition-all"
                >
                  🛡️ اعتماد وتعيين المشرف
                </button>
              </div>
            </div>
          </div>
        )}

        {/* --- 🎬 PROFESSIONAL MANUAL LESSON & VIDEO ASSIGNMENT MODAL --- */}
        {isLessonModalOpen && editingLesson && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-fade-in overflow-y-auto">
            <div className="relative w-full max-w-3xl overflow-hidden rounded-3xl bg-white dark:bg-slate-900 shadow-2xl border border-slate-200 dark:border-slate-700 my-8">
              
              {/* Modal Header */}
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 px-6 py-4 bg-slate-50/50 dark:bg-slate-800/40">
                <div className="flex items-center gap-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-600/10 text-primary-600 dark:text-gold-400">
                    <Video className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      {editingLesson.id?.startsWith('lesson_') ? 'شاشة إضافة وتخصيص فيديو لدرس' : 'تعديل وتخصيص بيانات الدرس'}
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      حدد الدولة والمرحلة والصف والمادة ثم ضع رابط الفيديو
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setIsLessonModalOpen(false)}
                  className="rounded-full p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleSaveLesson} className="p-6 space-y-5 max-h-[78vh] overflow-y-auto">
                
                {/* 1. Country / Curriculum Selection */}
                <div className="rounded-2xl border border-primary-100 dark:border-slate-800 bg-primary-50/30 dark:bg-slate-800/30 p-4">
                  <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-2 flex items-center gap-1.5">
                    <Globe2 className="h-4 w-4 text-primary-600 dark:text-gold-400" />
                    <span>اختر الدولة والمنهج التعليمي:</span>
                  </label>
                  <select
                    value={editingLesson.country || 'eg'}
                    onChange={(e) => {
                      const c = e.target.value as CountryCode;
                      const stages = getStagesForCountry(c);
                      const subjs = getSubjectsForCountry(c, stages[0]?.id);
                      setEditingLesson({
                        ...editingLesson,
                        country: c,
                        stage: stages[0]?.id || 'secondary',
                        subjectId: subjs[0]?.id || 'physics-sec',
                        subjectName: subjs[0]?.name || 'الفيزياء',
                      });
                    }}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-3 text-xs font-bold text-slate-900 dark:text-white shadow-xs"
                  >
                    {ARAB_COUNTRIES.map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.flag} {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 2. Stage & Grade & Subject Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      المرحلة الدراسية:
                    </label>
                    <select
                      value={editingLesson.stage || 'secondary'}
                      onChange={(e) => {
                        const stg = e.target.value as StageType;
                        const subjs = getSubjectsForCountry(editingLesson.country || 'eg', stg);
                        setEditingLesson({
                          ...editingLesson,
                          stage: stg,
                          subjectId: subjs[0]?.id || 'physics-sec',
                          subjectName: subjs[0]?.name || 'الفيزياء',
                        });
                      }}
                      className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 text-xs font-bold text-slate-900 dark:text-white"
                    >
                      {getStagesForCountry(editingLesson.country || 'eg').map((s) => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      الصف الدراسي:
                    </label>
                    <select
                      value={editingLesson.gradeNumber || 1}
                      onChange={(e) => setEditingLesson({ ...editingLesson, gradeNumber: Number(e.target.value) })}
                      className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 text-xs font-bold text-slate-900 dark:text-white"
                    >
                      {[1, 2, 3, 4, 5, 6].map((num) => (
                        <option key={num} value={num}>الصف {num}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      المادة الدراسية:
                    </label>
                    <select
                      value={editingLesson.subjectId || ''}
                      onChange={(e) => {
                        const sId = e.target.value;
                        const subjs = getSubjectsForCountry(editingLesson.country || 'eg', editingLesson.stage);
                        const subObj = subjs.find(s => s.id === sId);
                        setEditingLesson({ 
                          ...editingLesson, 
                          subjectId: sId, 
                          subjectName: subObj ? subObj.name : 'عام' 
                        });
                      }}
                      className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 text-xs font-bold text-slate-900 dark:text-white"
                    >
                      {getSubjectsForCountry(editingLesson.country || 'eg', editingLesson.stage).map((sub) => (
                        <option key={sub.id} value={sub.id}>{sub.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* 3. Title & Unit / Term */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      عنوان الدرس الشامل:
                    </label>
                    <input
                      type="text"
                      required
                      value={editingLesson.title || ''}
                      onChange={(e) => setEditingLesson({ ...editingLesson, title: e.target.value })}
                      placeholder="مثال: شرح التيار الكهربي وقوانين كيرشوف"
                      className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 text-xs font-bold text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      اسم الفصل / الوحدة:
                    </label>
                    <input
                      type="text"
                      value={editingLesson.unitTitle || ''}
                      onChange={(e) => setEditingLesson({ ...editingLesson, unitTitle: e.target.value })}
                      placeholder="الوحدة الأولى"
                      className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 text-xs font-bold text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                {/* 4. YouTube Link Input */}
                <div className="rounded-2xl border border-red-200 dark:border-red-950/60 bg-red-50/40 dark:bg-red-950/20 p-4">
                  <label className="block text-xs font-bold text-red-700 dark:text-red-300 mb-1 flex items-center gap-1.5">
                    <Video className="h-4 w-4 text-red-600" />
                    <span>رابط فيديو الدرس من YouTube:</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={editingLesson.youtubeUrl || editingLesson.youtubeId || ''}
                    onChange={(e) => {
                      const url = e.target.value;
                      const ytId = extractYouTubeId(url) || url;
                      setEditingLesson({
                        ...editingLesson,
                        youtubeUrl: url,
                        youtubeId: ytId,
                        thumbnailUrl: ytId ? `https://i.ytimg.com/vi/${ytId}/hqdefault.jpg` : editingLesson.thumbnailUrl
                      });
                    }}
                    placeholder="ضع رابط الفيديو هنا: https://www.youtube.com/watch?v=..."
                    className="w-full rounded-xl border border-red-300 dark:border-red-800 bg-white dark:bg-slate-900 p-3 text-xs font-bold text-slate-900 dark:text-white shadow-xs"
                  />
                  {editingLesson.youtubeId && (
                    <div className="mt-2 text-[11px] font-bold text-emerald-600 flex items-center gap-1">
                      <Check className="h-3.5 w-3.5" />
                      <span>معرف الفيديو المكتشف: {editingLesson.youtubeId}</span>
                    </div>
                  )}
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    شرح وتفاصيل الدرس:
                  </label>
                  <textarea
                    rows={3}
                    value={editingLesson.description || ''}
                    onChange={(e) => setEditingLesson({ ...editingLesson, description: e.target.value })}
                    placeholder="اكتب شرح ومواضيع الدرس..."
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 text-xs text-slate-900 dark:text-white"
                  />
                </div>

                {/* Cloudinary PDF Upload */}
                <div className="rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 p-4 bg-slate-50/50 dark:bg-slate-800/50">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    ملخص الدرس وأوراق العمل (PDF Upload):
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={handlePdfUpload}
                      className="text-xs text-slate-500 file:mr-0 file:ml-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-primary-600 file:text-white"
                    />
                    {uploadingPdf && <span className="text-xs text-amber-500 font-bold">جاري الرفع...</span>}
                  </div>
                  {editingLesson.pdfUrl && (
                    <div className="mt-2 text-xs text-emerald-600 font-bold truncate">
                      ✓ الملف جاهز ومرفوع: {editingLesson.pdfTitle || editingLesson.pdfUrl}
                    </div>
                  )}
                </div>

                {/* Submit buttons */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsLessonModalOpen(false)}
                    className="rounded-xl border border-slate-300 dark:border-slate-700 px-5 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-300"
                  >
                    إلغاء
                  </button>

                  <button
                    type="submit"
                    className="rounded-xl bg-gold-500 hover:bg-gold-600 text-slate-950 font-black px-7 py-2.5 text-xs shadow-md"
                  >
                    حفظ ونشر الدرس على المنصة 🚀
                  </button>
                </div>
              </form>

            </div>
          </div>
        )}

      </div>
    </div>
  );
}
