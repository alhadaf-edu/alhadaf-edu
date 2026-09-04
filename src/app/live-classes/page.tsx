'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { ARAB_COUNTRIES, STAGES, SUBJECTS, getStagesForCountry, getSubjectsForCountry } from '@/lib/curriculumData';
import { LiveClass, LiveClassStatus, CountryCode, StageType } from '@/types';
import { 
  Radio, 
  Video, 
  Calendar, 
  Clock, 
  Users, 
  Sparkles, 
  Plus, 
  Play, 
  CheckCircle2, 
  AlertCircle, 
  Trash2, 
  ExternalLink, 
  ShieldCheck, 
  Globe2, 
  BookOpen, 
  Search, 
  Filter,
  X,
  Share2,
  Lock,
  Copy,
  Check
} from 'lucide-react';
import Link from 'next/link';
import IslamicPattern from '@/components/layout/IslamicPattern';

const LIVE_CLASSES_STORAGE_KEY = 'alhadaf_live_classes_v3';

// Helper to determine accurate real-time status based on time and manual actions
function resolveClassStatus(item: LiveClass): 'live' | 'scheduled' | 'ended' {
  const manualStatus = (item.status || '').toLowerCase();
  if (manualStatus === 'ended') return 'ended';
  if (manualStatus === 'live') return 'live';

  const scheduledTime = new Date(item.scheduledAt).getTime();
  const now = Date.now();

  // If scheduled time has arrived or passed within 2 hours: it is LIVE now
  if (now >= scheduledTime && now < scheduledTime + 2 * 60 * 60 * 1000) {
    return 'live';
  }
  // If more than 2 hours passed: it is automatically ENDED
  if (now >= scheduledTime + 2 * 60 * 60 * 1000) {
    return 'ended';
  }
  // If scheduled time is in the future: strictly SCHEDULED (مجدولة)
  return 'scheduled';
}

export default function LiveClassesPage() {
  const { user, profile, isSuperAdmin, isCountrySupervisor, isStudent, userCountry } = useAuth();

  // State
  const [classes, setClasses] = useState<LiveClass[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCountryFilter, setSelectedCountryFilter] = useState<CountryCode | 'all'>(
    isSuperAdmin ? 'all' : userCountry || 'sa'
  );
  const [activeTab, setActiveTab] = useState<'all' | 'live' | 'upcoming' | 'ended'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string>('');

  // Modal State for Creating/Scheduling Live Class
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalSubmitting, setModalSubmitting] = useState(false);
  const [modalError, setModalError] = useState('');
  const [formCountry, setFormCountry] = useState<CountryCode>(
    isSuperAdmin ? 'sa' : (userCountry || 'sa')
  );
  const [formStage, setFormStage] = useState<StageType>('secondary');
  const [formGrade, setFormGrade] = useState<number>(1);
  const [formSubjectId, setFormSubjectId] = useState<string>('');
  const [formSubjectName, setFormSubjectName] = useState<string>('');
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formUnitTitle, setFormUnitTitle] = useState('');
  const [formScheduledDate, setFormScheduledDate] = useState('');
  const [formScheduledTime, setFormScheduledTime] = useState('');

  // Helper to show temporary toast
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4000);
  };

  // Fetch classes from backend API with instant localStorage cache
  const fetchClasses = useCallback(async () => {
    try {
      // 0. Clean legacy storage keys if any
      if (typeof window !== 'undefined') {
        localStorage.removeItem('alhadaf_live_classes_v2');
        localStorage.removeItem('alhadaf_live_classes');
      }

      // 1. Instant Cache from LocalStorage
      let localList: LiveClass[] = [];
      const cached = typeof window !== 'undefined' ? localStorage.getItem(LIVE_CLASSES_STORAGE_KEY) : null;
      if (cached) {
        try {
          localList = JSON.parse(cached);
          if (Array.isArray(localList) && localList.length > 0) {
            setClasses(localList);
            setLoading(false);
          }
        } catch {}
      }

      // 2. Fetch from API
      const res = await fetch(`/api/live-classes?userId=${user?.uid || ''}&role=${profile?.role || 'STUDENT'}&country=${userCountry || 'sa'}&targetCountry=${selectedCountryFilter}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.classes)) {
        const deletedSet = new Set<string>(Array.isArray(data.deletedIds) ? data.deletedIds : []);

        // Filter out any locally cached class that was deleted on server
        localList = localList.filter((c: LiveClass) => c && c.id && !deletedSet.has(c.id));

        // Merge API with local items using a Map keyed by id
        const map = new Map<string, LiveClass>();
        localList.forEach((c: LiveClass) => {
          if (c && c.id && !deletedSet.has(c.id)) map.set(c.id, c);
        });

        data.classes.forEach((c: LiveClass) => {
          if (c && c.id && !deletedSet.has(c.id)) {
            const existing = map.get(c.id);
            if (!existing) {
              map.set(c.id, c);
            } else {
              const statusOrder: Record<string, number> = { 'ended': 3, 'live': 2, 'scheduled': 1 };
              const existingScore = statusOrder[(existing.status || '').toLowerCase()] || 0;
              const newScore = statusOrder[(c.status || '').toLowerCase()] || 0;
              map.set(c.id, newScore >= existingScore ? c : existing);
            }
          }
        });

        // Apply dynamic resolved status based on exact schedule time
        const resolvedList = Array.from(map.values()).map((c) => {
          const effectiveStatus = resolveClassStatus(c);
          return { ...c, status: effectiveStatus };
        });

        const merged = resolvedList.sort((a, b) => new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime());
        setClasses(merged);
        if (typeof window !== 'undefined') {
          localStorage.setItem(LIVE_CLASSES_STORAGE_KEY, JSON.stringify(merged));
        }
      }
    } catch (e) {
      console.warn('Could not fetch live classes from API:', e);
    } finally {
      setLoading(false);
    }
  }, [selectedCountryFilter, userCountry, user?.uid, profile?.role]);

  // Real-time synchronization across all devices (Polls every 4 seconds)
  useEffect(() => {
    fetchClasses();
    const interval = setInterval(() => {
      fetchClasses();
    }, 4000);
    return () => clearInterval(interval);
  }, [fetchClasses]);

  // Handle Copy Link
  const handleCopyLink = (classId: string) => {
    const url = `${window.location.origin}/live-classes/${classId}`;
    navigator.clipboard.writeText(url);
    setCopiedId(classId);
    showToast('✅ تم نسخ رابط الحصة المباشرة بنجاح!');
    setTimeout(() => setCopiedId(null), 2500);
  };

  // Handle Class Status Change (Start / End)
  const handleStatusChange = async (classId: string, newStatus: LiveClassStatus) => {
    // 1. Instant local update
    const updated = classes.map(c => c.id === classId ? { ...c, status: newStatus } : c);
    setClasses(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem(LIVE_CLASSES_STORAGE_KEY, JSON.stringify(updated));
    }
    showToast(newStatus === 'live' || newStatus === 'LIVE' ? '🔴 تم بدء البث المباشر للحصة!' : '🏁 تم إنهاء الحصة.');

    // 2. Background API call
    try {
      await fetch('/api/live-classes', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: classId,
          status: newStatus,
          userId: user?.uid,
          role: profile?.role,
          userEmail: user?.email,
          country: userCountry
        })
      });
    } catch (e) {
      console.warn('Status sync note:', e);
    }
  };

  // Handle Delete Class
  const handleDeleteClass = async (classId: string) => {
    if (!confirm('هل أنت متأكد من حذف هذه الحصة الافتراضية نهائياً؟')) return;

    // 1. Instant local delete
    const filtered = classes.filter(c => c.id !== classId);
    setClasses(filtered);
    if (typeof window !== 'undefined') {
      localStorage.setItem(LIVE_CLASSES_STORAGE_KEY, JSON.stringify(filtered));
    }
    showToast('🗑️ تم حذف الحصة بنجاح');

    // 2. Background API call
    try {
      await fetch(`/api/live-classes?id=${classId}&userId=${user?.uid}&role=${profile?.role}&userEmail=${user?.email}&country=${userCountry}`, {
        method: 'DELETE'
      });
    } catch (e) {
      console.warn('Delete sync note:', e);
    }
  };

  // Handle Create Class Submission
  const handleCreateClass = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError('');
    if (!formTitle.trim()) {
      setModalError('يرجى كتابة عنوان الحصة');
      return;
    }
    if (!formScheduledDate || !formScheduledTime) {
      setModalError('يرجى تحديد تاريخ ووقت الحصة');
      return;
    }

    setModalSubmitting(true);
    const scheduledDateTime = new Date(`${formScheduledDate}T${formScheduledTime}`).toISOString();
    const classId = `class_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const roomName = `live_class_${classId.replace(/[^a-zA-Z0-9_-]/g, '_')}`;

    const newClassItem: LiveClass = {
      id: classId,
      title: formTitle.trim(),
      description: formDescription.trim(),
      countryId: formCountry,
      stage: formStage,
      gradeNumber: Number(formGrade) || 1,
      subjectId: formSubjectId || 'general',
      subjectName: formSubjectName || 'حصة عامة',
      unitTitle: formUnitTitle.trim() || undefined,
      scheduledAt: scheduledDateTime,
      status: 'scheduled',
      roomName,
      supervisorId: user?.uid || 'supervisor',
      supervisorName: profile?.displayName || user?.displayName || 'المشرف المعتمد',
      supervisorEmail: user?.email || '',
      supervisorCountry: userCountry || formCountry,
      attendeesCount: 0,
      attendees: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // 1. Instant Local State & LocalStorage Persistence (0ms delay)
    const updatedList = [newClassItem, ...classes];
    setClasses(updatedList);
    if (typeof window !== 'undefined') {
      localStorage.setItem(LIVE_CLASSES_STORAGE_KEY, JSON.stringify(updatedList));
    }

    // 2. Close Modal & Reset Form Immediately
    setIsModalOpen(false);
    setFormTitle('');
    setFormDescription('');
    setFormUnitTitle('');
    setFormScheduledDate('');
    setFormScheduledTime('');
    setModalSubmitting(false);
    showToast('🎉 تم جدولة الحصة الافتراضية وحفظها بنجاح!');

    // 3. Background Sync with Server & Firestore
    try {
      fetch('/api/live-classes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: newClassItem.id,
          roomName: newClassItem.roomName,
          title: newClassItem.title,
          description: newClassItem.description,
          countryId: newClassItem.countryId,
          stage: newClassItem.stage,
          gradeNumber: newClassItem.gradeNumber,
          subjectId: newClassItem.subjectId,
          subjectName: newClassItem.subjectName,
          unitTitle: newClassItem.unitTitle,
          scheduledAt: newClassItem.scheduledAt,
          creatorId: newClassItem.supervisorId,
          creatorName: newClassItem.supervisorName,
          creatorEmail: newClassItem.supervisorEmail,
          creatorRole: profile?.role || 'COUNTRY_SUPERVISOR',
          creatorCountry: userCountry || formCountry
        })
      }).catch(err => console.warn('Background sync note:', err));
    } catch (err) {
      console.warn('Network sync notice:', err);
    }
  };

  // Filter Classes
  const countryObj = ARAB_COUNTRIES.find(c => (c.code || c.id) === (isSuperAdmin ? selectedCountryFilter : userCountry));
  const stagesForSelected = getStagesForCountry(formCountry);
  const subjectsForSelected = getSubjectsForCountry(formCountry, formStage, formGrade);

  const filteredClasses = classes.filter(item => {
    // Country Filter
    if (selectedCountryFilter !== 'all' && item.countryId !== selectedCountryFilter) {
      return false;
    }
    const statusNormalized = (item.status || '').toLowerCase();
    // Tab Status Filter
    if (activeTab === 'live' && statusNormalized !== 'live') return false;
    if (activeTab === 'upcoming' && statusNormalized !== 'scheduled') return false;
    if (activeTab === 'ended' && statusNormalized !== 'ended') return false;
    // Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = item.title?.toLowerCase().includes(q);
      const matchSubject = item.subjectName?.toLowerCase().includes(q);
      const matchSupervisor = item.supervisorName?.toLowerCase().includes(q);
      if (!matchTitle && !matchSubject && !matchSupervisor) return false;
    }
    return true;
  });

  const canUserManageClass = (item: LiveClass) => {
    if (isSuperAdmin) return true;
    if (isCountrySupervisor && (userCountry === item.countryId || profile?.assignedCountry === item.countryId)) return true;
    return false;
  };

  const isSupervisorOrAdmin = isSuperAdmin || isCountrySupervisor;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-10 px-4 sm:px-6 lg:px-8 relative overflow-hidden" dir="rtl">
      {/* Background Islamic Pattern */}
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <IslamicPattern />
      </div>

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 left-6 z-50 bg-emerald-600 text-white font-bold text-xs sm:text-sm py-3 px-5 rounded-2xl shadow-2xl flex items-center gap-2 animate-fade-in border border-emerald-400/30">
          <Sparkles className="w-4 h-4 text-amber-300" />
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="max-w-7xl mx-auto relative z-10 space-y-8">
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-emerald-900/40 via-teal-900/30 to-slate-900/60 border border-emerald-500/20 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <span className="flex h-3 w-3 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-500/10 text-red-400 border border-red-500/20 tracking-wide">
                  البث الحي والصفوف الافتراضية
                </span>
                {isSuperAdmin && (
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-300 border border-amber-500/20">
                    👑 المشرف العام
                  </span>
                )}
                {isCountrySupervisor && (
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                    🛡️ مشرف {countryObj?.name || 'الدولة'}
                  </span>
                )}
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight flex items-center gap-3">
                <Radio className="w-9 h-9 text-emerald-400 animate-pulse" />
                الحصص المباشرة والفصول التفاعلية
              </h1>
              <p className="text-slate-300 text-sm sm:text-base max-w-2xl leading-relaxed">
                انضم إلى الحصص التفاعلية المباشرة وتواصل مباشرة مع المشرفين المعتمدين في جميع المناهج والمراحل الدراسية عبر تقنية البث المباشر عالي الجودة.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3">
              {isSupervisorOrAdmin && (
                <button
                  onClick={() => {
                    setFormCountry(isSuperAdmin ? (selectedCountryFilter === 'all' ? 'sa' : selectedCountryFilter) : (userCountry || 'sa'));
                    setIsModalOpen(true);
                  }}
                  className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold px-6 py-3.5 rounded-2xl shadow-lg shadow-emerald-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  <Plus className="w-5 h-5" />
                  <span>جدولة حصة جديدة</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Country Selector & Tabs */}
        <div className="space-y-4">
          {/* Countries Selector Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-slate-800">
            <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5 pl-2 shrink-0">
              <Globe2 className="w-4 h-4 text-emerald-400" />
              الدولة:
            </span>
            {isSuperAdmin && (
              <button
                onClick={() => setSelectedCountryFilter('all')}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all shrink-0 flex items-center gap-2 ${
                  selectedCountryFilter === 'all'
                    ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/25 ring-2 ring-emerald-400/50'
                    : 'bg-slate-900/80 text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-slate-800'
                }`}
              >
                🌐 جميع الدول
              </button>
            )}
            {ARAB_COUNTRIES.map((c) => {
              const cId = c.code || c.id || 'sa';
              // Supervisors only see their own country unless they are Super Admin
              if (!isSuperAdmin && userCountry && cId !== userCountry) {
                return null;
              }
              const isSelected = selectedCountryFilter === cId;
              return (
                <button
                  key={cId}
                  onClick={() => setSelectedCountryFilter(cId)}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all shrink-0 flex items-center gap-2 ${
                    isSelected
                      ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/25 ring-2 ring-emerald-400/50'
                      : 'bg-slate-900/80 text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-slate-800'
                  }`}
                >
                  <span>{c.flag}</span>
                  <span>{c.name}</span>
                </button>
              );
            })}
          </div>

          {/* Search and Status Filters */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-900/60 p-4 rounded-2xl border border-slate-800 backdrop-blur-md">
            {/* Status Tabs */}
            <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
              <button
                onClick={() => setActiveTab('all')}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all shrink-0 ${
                  activeTab === 'all'
                    ? 'bg-slate-800 text-emerald-400 font-bold border border-emerald-500/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                الكل ({classes.length})
              </button>
              <button
                onClick={() => setActiveTab('live')}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all shrink-0 flex items-center gap-2 ${
                  activeTab === 'live'
                    ? 'bg-red-500/20 text-red-400 font-bold border border-red-500/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
                جارية الآن ({classes.filter(c => (c.status || '').toLowerCase() === 'live').length})
              </button>
              <button
                onClick={() => setActiveTab('upcoming')}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all shrink-0 flex items-center gap-1.5 ${
                  activeTab === 'upcoming'
                    ? 'bg-amber-500/20 text-amber-400 font-bold border border-amber-500/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                المجدولة ({classes.filter(c => (c.status || '').toLowerCase() === 'scheduled').length})
              </button>
              <button
                onClick={() => setActiveTab('ended')}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all shrink-0 flex items-center gap-1.5 ${
                  activeTab === 'ended'
                    ? 'bg-slate-800 text-slate-300 font-bold border border-slate-700'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                المنتهية ({classes.filter(c => (c.status || '').toLowerCase() === 'ended').length})
              </button>
            </div>

            {/* Search Input */}
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="ابحث عن حصة أو مادة أو مشرف..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-950/80 border border-slate-700/80 rounded-xl pr-10 pl-4 py-2 text-xs sm:text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>
        </div>

        {/* Classes Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6 animate-pulse space-y-4">
                <div className="h-6 bg-slate-800 rounded-lg w-1/3"></div>
                <div className="h-8 bg-slate-800 rounded-lg w-3/4"></div>
                <div className="h-4 bg-slate-800 rounded-lg w-1/2"></div>
                <div className="h-12 bg-slate-800 rounded-2xl w-full"></div>
              </div>
            ))}
          </div>
        ) : filteredClasses.length === 0 ? (
          <div className="text-center py-20 bg-slate-900/30 border border-slate-800/80 rounded-3xl p-8 backdrop-blur-sm space-y-4">
            <Radio className="w-16 h-16 text-slate-600 mx-auto" />
            <h3 className="text-xl font-bold text-slate-300">لا توجد حصص مباشرة متاحة حالياً</h3>
            <p className="text-slate-500 text-sm max-w-md mx-auto">
              لم يتم جدولة أي حصص تطابق معايير البحث الحالية. يمكنك العودة لاحقاً أو اختيار دولة أخرى.
            </p>
            {isSupervisorOrAdmin && (
              <button
                onClick={() => setIsModalOpen(true)}
                className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-all shadow-md"
              >
                <Plus className="w-4 h-4" />
                <span>جدولة حصة جديدة الآن</span>
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredClasses.map((item) => {
              const itemCountry = ARAB_COUNTRIES.find(c => (c.code || c.id) === item.countryId);
              const statusLower = (item.status || '').toLowerCase();
              const isLive = statusLower === 'live';
              const isScheduled = statusLower === 'scheduled';
              const isEnded = statusLower === 'ended';
              const canManage = canUserManageClass(item);

              return (
                <div
                  key={item.id}
                  className={`group relative bg-slate-900/80 border rounded-3xl p-6 transition-all duration-300 flex flex-col justify-between backdrop-blur-md hover:shadow-2xl ${
                    isLive
                      ? 'border-red-500/40 hover:border-red-500/70 shadow-red-500/10'
                      : isScheduled
                      ? 'border-slate-800 hover:border-emerald-500/40 hover:shadow-emerald-500/5'
                      : 'border-slate-800/60 opacity-80'
                  }`}
                >
                  {/* Top Badges */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between gap-2">
                      {/* Country & Stage */}
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-800 border border-slate-700 text-slate-200 flex items-center gap-1.5">
                          <span>{itemCountry?.flag || '🌐'}</span>
                          <span>{itemCountry?.name || 'عام'}</span>
                        </span>
                        <span className="px-2 py-1 rounded-lg text-xs font-medium bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                          {item.subjectName}
                        </span>
                      </div>

                      {/* Status Indicator */}
                      <div>
                        {isLive && (
                          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-500/20 text-red-400 border border-red-500/30">
                            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
                            مباشر الآن
                          </span>
                        )}
                        {isScheduled && (
                          <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-300 border border-amber-500/20">
                            <Clock className="w-3 h-3" />
                            مجدولة
                          </span>
                        )}
                        {isEnded && (
                          <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-800 text-slate-400 border border-slate-700">
                            <CheckCircle2 className="w-3 h-3" />
                            انتهت
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Title & Info */}
                    <div className="space-y-2">
                      <h2 className="text-lg font-bold text-white group-hover:text-emerald-300 transition-colors line-clamp-2">
                        {item.title}
                      </h2>
                      {item.unitTitle && (
                        <p className="text-xs text-slate-400 flex items-center gap-1">
                          <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
                          <span>الوحدة: {item.unitTitle}</span>
                        </p>
                      )}
                      {item.description && (
                        <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                          {item.description}
                        </p>
                      )}
                    </div>

                    {/* Metadata & Supervisor */}
                    <div className="pt-2 border-t border-slate-800/80 space-y-2 text-xs text-slate-400">
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1.5 text-slate-300">
                          <ShieldCheck className="w-4 h-4 text-emerald-400" />
                          <span>المشرف: <strong className="text-white">{item.supervisorName || 'المشرف المعتمد'}</strong></span>
                        </span>
                        {item.attendeesCount !== undefined && (
                          <span className="flex items-center gap-1 text-slate-400">
                            <Users className="w-3.5 h-3.5" />
                            <span>{item.attendeesCount} حاضر</span>
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5 text-slate-400">
                        <Calendar className="w-3.5 h-3.5 text-slate-500" />
                        <span>
                          {new Date(item.scheduledAt).toLocaleDateString('ar-EG', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </span>
                        <span className="mx-1">•</span>
                        <Clock className="w-3.5 h-3.5 text-slate-500" />
                        <span>
                          {new Date(item.scheduledAt).toLocaleTimeString('ar-EG', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions Area */}
                  <div className="pt-5 space-y-2.5">
                    {/* Enter / Join Room Button */}
                    <Link
                      href={`/live-classes/${item.id}`}
                      className={`w-full py-3 px-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-md ${
                        isLive
                          ? 'bg-red-600 hover:bg-red-500 text-white shadow-red-600/25 animate-pulse'
                          : isScheduled
                          ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/20'
                          : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                      }`}
                    >
                      {isLive ? (
                        <>
                          <Radio className="w-4 h-4" />
                          <span>دخول البث المباشر الآن</span>
                        </>
                      ) : isScheduled ? (
                        <>
                          <Play className="w-4 h-4 fill-current" />
                          <span>الدخول لغرفة الحصة</span>
                        </>
                      ) : (
                        <>
                          <ExternalLink className="w-4 h-4" />
                          <span>عرض تفاصيل الحصة</span>
                        </>
                      )}
                    </Link>

                    {/* Secondary Actions for Supervisor & Admin */}
                    <div className="flex items-center justify-between gap-2 pt-1">
                      <button
                        onClick={() => handleCopyLink(item.id)}
                        className="flex-1 py-1.5 px-3 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-300 text-xs font-medium flex items-center justify-center gap-1.5 border border-slate-700 transition-colors"
                        title="نسخ رابط الحصة"
                      >
                        {copiedId === item.id ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                            <span className="text-emerald-400">تم النسخ!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>مشاركة الرابط</span>
                          </>
                        )}
                      </button>

                      {canManage && (
                        <>
                          {isScheduled && (
                            <button
                              onClick={() => handleStatusChange(item.id, 'live')}
                              className="py-1.5 px-3 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 text-xs font-semibold border border-emerald-500/30 transition-colors"
                              title="بدء البث فوراً"
                            >
                              بدء الحصة
                            </button>
                          )}
                          {isLive && (
                            <button
                              onClick={() => handleStatusChange(item.id, 'ended')}
                              className="py-1.5 px-3 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-300 text-xs font-semibold border border-red-500/30 transition-colors"
                              title="إنهاء الحصة"
                            >
                              إنهاء البث
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteClass(item.id)}
                            className="p-1.5 rounded-xl bg-slate-800/80 hover:bg-red-500/20 text-slate-400 hover:text-red-400 border border-slate-700 hover:border-red-500/30 transition-colors"
                            title="حذف الحصة"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* CREATE / SCHEDULE MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-6 sm:p-8 space-y-6 my-8">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <Radio className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">جدولة حصة افتراضية جديدة</h3>
                  <p className="text-xs text-slate-400">
                    بصفتك {isSuperAdmin ? 'المشرف العام' : `مشرف دولة ${countryObj?.name || ''}`}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {modalError && (
              <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-300 text-sm flex items-center gap-3">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <span>{modalError}</span>
              </div>
            )}

            <form onSubmit={handleCreateClass} className="space-y-4 text-sm">
              {/* Country Selection */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  الدولة التابعة للحصة:
                </label>
                {isSuperAdmin ? (
                  <select
                    value={formCountry}
                    onChange={(e) => setFormCountry(e.target.value as CountryCode)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-slate-200 focus:outline-none focus:border-emerald-500"
                  >
                    {ARAB_COUNTRIES.map((c) => {
                      const cId = c.code || c.id || 'sa';
                      return (
                        <option key={cId} value={cId}>
                          {c.flag} {c.name}
                        </option>
                      );
                    })}
                  </select>
                ) : (
                  <div className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-300 flex items-center justify-between">
                    <span>{countryObj?.flag} {countryObj?.name} (دولتك المصرح لك بإدارتها)</span>
                    <Lock className="w-4 h-4 text-slate-500" />
                  </div>
                )}
              </div>

              {/* Title */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  عنوان الحصة المباشرة: *
                </label>
                <input
                  type="text"
                  required
                  placeholder="مثال: مراجعة شاملة لدرس قوانين الحركة في الفيزياء"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-slate-200 focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Stage & Grade */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">المرحلة الدراسية:</label>
                  <select
                    value={formStage}
                    onChange={(e) => setFormStage(e.target.value as StageType)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-slate-200 focus:outline-none focus:border-emerald-500"
                  >
                    {stagesForSelected.map((st) => (
                      <option key={st.id} value={st.id}>{st.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">الصف الدراسي:</label>
                  <select
                    value={formGrade}
                    onChange={(e) => setFormGrade(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-slate-200 focus:outline-none focus:border-emerald-500"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((g) => (
                      <option key={g} value={g}>الصف {g}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Subject & Unit */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">المادة الدراسية:</label>
                  <select
                    value={formSubjectId}
                    onChange={(e) => {
                      setFormSubjectId(e.target.value);
                      const sub = subjectsForSelected.find(s => s.id === e.target.value);
                      if (sub) setFormSubjectName(sub.name);
                    }}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-slate-200 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="">-- اختر المادة --</option>
                    {subjectsForSelected.map((s) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">الوحدة أو الفصل (اختياري):</label>
                  <input
                    type="text"
                    placeholder="مثال: الوحدة الأولى - الميكانيكا"
                    value={formUnitTitle}
                    onChange={(e) => setFormUnitTitle(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-slate-200 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Date & Time */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">تاريخ الحصة: *</label>
                  <input
                    type="date"
                    required
                    value={formScheduledDate}
                    onChange={(e) => setFormScheduledDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-slate-200 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">توقيت الحصة: *</label>
                  <input
                    type="time"
                    required
                    value={formScheduledTime}
                    onChange={(e) => setFormScheduledTime(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-slate-200 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  وصف وتفاصيل الحصة (اختياري):
                </label>
                <textarea
                  rows={3}
                  placeholder="اكتب نبذة عن المحاور التي سيتم شرحها خلال الحصة..."
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-slate-200 focus:outline-none focus:border-emerald-500"
                ></textarea>
              </div>

              {/* Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-sm transition-colors"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={modalSubmitting}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-sm shadow-lg shadow-emerald-500/20 transition-all disabled:opacity-50"
                >
                  {modalSubmitting ? (
                    <span>جاري الجدولة...</span>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>تأكيد وجدولة الحصة</span>
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
