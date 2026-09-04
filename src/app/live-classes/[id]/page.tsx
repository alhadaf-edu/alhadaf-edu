'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { ARAB_COUNTRIES } from '@/lib/curriculumData';
import { LiveClass, LiveClassAttendee, CountryCode } from '@/types';
import {
  Radio,
  Mic,
  MicOff,
  Video as VideoIcon,
  VideoOff,
  MonitorUp,
  Hand,
  MessageSquare,
  Users,
  Send,
  ShieldCheck,
  PhoneOff,
  Settings,
  Maximize2,
  Minimize2,
  Copy,
  Check,
  Crown,
  AlertCircle,
  HelpCircle,
  BookOpen,
  ArrowRight,
  VolumeX,
  UserX,
  Sparkles,
  Smile
} from 'lucide-react';
import Link from 'next/link';

interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: 'SUPER_ADMIN' | 'COUNTRY_SUPERVISOR' | 'STUDENT';
  text: string;
  timestamp: string;
  country?: CountryCode;
}

export default function LiveClassRoomPage() {
  const params = useParams();
  const router = useRouter();
  const classId = params?.id as string;

  const { user, profile, isSuperAdmin, isCountrySupervisor, isStudent, userCountry } = useAuth();

  // Room & Class Data
  const [classData, setClassData] = useState<LiveClass | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  // Media Controls State
  const [isMicOn, setIsMicOn] = useState(false);
  const [isCamOn, setIsCamOn] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isHandRaised, setIsHandRaised] = useState(false);
  const [activeTab, setActiveTab] = useState<'chat' | 'participants' | 'notes'>('chat');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Chat State
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Attendees State
  const [attendees, setAttendees] = useState<LiveClassAttendee[]>([]);

  // Video Refs
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const screenVideoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Determine permissions
  const isSupervisorForThisClass = 
    isSuperAdmin || 
    (isCountrySupervisor && (userCountry === classData?.countryId || profile?.assignedCountry === classData?.countryId));

  // Fetch Class Details
  useEffect(() => {
    if (!classId) return;
    setLoading(true);

    const loadData = async () => {
      try {
        const res = await fetch(`/api/live-classes?id=${classId}&userId=${user?.uid || ''}&country=${userCountry || 'sa'}`);
        const data = await res.json();
        if (data.success && Array.isArray(data.classes)) {
          const found = data.classes.find((c: LiveClass) => c.id === classId);
          if (found) {
            setClassData(found);
            // Default demo messages
            setMessages([
              {
                id: 'sys-1',
                senderId: 'system',
                senderName: 'نظام المنصة',
                senderRole: 'SUPER_ADMIN',
                text: `مرحباً بكم في حصة "${found.title}". يرجى الالتزام بآداب الحوار والتركيز مع المشرف.`,
                timestamp: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })
              }
            ]);

            // Initial attendee list
            setAttendees([
              {
                id: found.supervisorId || 'supervisor-1',
                userId: found.supervisorId || 'supervisor-1',
                name: found.supervisorName || 'المشرف المعتمد',
                userName: found.supervisorName || 'المشرف المعتمد',
                userRole: 'COUNTRY_SUPERVISOR',
                role: 'COUNTRY_SUPERVISOR',
                userCountry: found.countryId,
                country: found.countryId,
                joinedAt: new Date().toISOString(),
                isHost: true
              },
              ...(user ? [{
                id: user.uid,
                userId: user.uid,
                name: profile?.displayName || user.displayName || 'أنت (طالب)',
                userName: profile?.displayName || user.displayName || 'أنت (طالب)',
                userRole: (profile?.role || 'STUDENT') as any,
                role: (profile?.role || 'STUDENT') as any,
                userCountry: userCountry || 'sa',
                country: userCountry || 'sa',
                joinedAt: new Date().toISOString(),
                isHost: isSupervisorForThisClass
              }] : [])
            ]);
          } else {
            setErrorMsg('الحصة غير موجودة أو تم حذفها.');
          }
        }
      } catch (e) {
        setErrorMsg('تعذر تحميل بيانات الحصة.');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [classId, user, profile, isSupervisorForThisClass, userCountry]);

  // Scroll Chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle Copy Link
  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  // Toggle Fullscreen
  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  // Handle Camera Toggle (Browser Media Stream)
  const toggleCamera = async () => {
    if (isCamOn) {
      if (localVideoRef.current && localVideoRef.current.srcObject) {
        const stream = localVideoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(t => t.stop());
        localVideoRef.current.srcObject = null;
      }
      setIsCamOn(false);
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: isMicOn });
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
        setIsCamOn(true);
      } catch (err) {
        alert('تعذر الوصول إلى الكاميرا. يرجى منح الإذن من إعدادات المتصفح.');
      }
    }
  };

  // Handle Mic Toggle
  const toggleMic = async () => {
    setIsMicOn(prev => !prev);
  };

  // Handle Screen Share Toggle
  const toggleScreenShare = async () => {
    if (isScreenSharing) {
      if (screenVideoRef.current && screenVideoRef.current.srcObject) {
        const stream = screenVideoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(t => t.stop());
        screenVideoRef.current.srcObject = null;
      }
      setIsScreenSharing(false);
    } else {
      try {
        const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        if (screenVideoRef.current) {
          screenVideoRef.current.srcObject = stream;
        }
        setIsScreenSharing(true);
        stream.getVideoTracks()[0].onended = () => {
          setIsScreenSharing(false);
        };
      } catch (err) {
        console.warn('Screen share cancelled or failed:', err);
      }
    }
  };

  // Send Chat Message
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      senderId: user?.uid || 'guest',
      senderName: profile?.displayName || user?.displayName || (isSupervisorForThisClass ? 'المشرف' : 'طالب'),
      senderRole: (isSuperAdmin ? 'SUPER_ADMIN' : isCountrySupervisor ? 'COUNTRY_SUPERVISOR' : 'STUDENT'),
      text: inputText.trim(),
      timestamp: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
      country: userCountry
    };

    setMessages(prev => [...prev, newMsg]);
    setInputText('');
  };

  // Supervisor: Mute All Students
  const handleMuteAll = () => {
    if (!isSupervisorForThisClass) return;
    setMessages(prev => [
      ...prev,
      {
        id: `sys-${Date.now()}`,
        senderId: 'system',
        senderName: 'المشرف',
        senderRole: 'COUNTRY_SUPERVISOR',
        text: '🔇 قام المشرف بكتم صوت جميع الطلاب للحفاظ على هدوء الشرح.',
        timestamp: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

  // Supervisor: End Class
  const handleEndClass = async () => {
    if (!isSupervisorForThisClass) return;
    if (!confirm('هل تريد بالتأكيد إنهاء الحصة لجميع الحاضرين؟')) return;

    try {
      await fetch('/api/live-classes', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: classId,
          status: 'ENDED',
          userId: user?.uid,
          role: profile?.role,
          userEmail: user?.email,
          country: userCountry
        })
      });
      router.push('/live-classes');
    } catch (e) {
      router.push('/live-classes');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center space-y-4" dir="rtl">
        <Radio className="w-12 h-12 text-emerald-400 animate-pulse" />
        <p className="text-slate-300 font-semibold text-lg">جاري الاتصال بالغرفة الافتراضية وتجهيز البث...</p>
      </div>
    );
  }

  if (errorMsg || !classData) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6 space-y-6" dir="rtl">
        <AlertCircle className="w-16 h-16 text-red-500" />
        <h2 className="text-2xl font-bold">{errorMsg || 'تعذر العثور على الحصة'}</h2>
        <Link
          href="/live-classes"
          className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-2xl shadow-lg transition-all"
        >
          العودة لدليل الحصص المباشرة
        </Link>
      </div>
    );
  }

  const countryObj = ARAB_COUNTRIES.find(c => (c.code || c.id) === classData.countryId);

  return (
    <div 
      ref={containerRef}
      className="min-h-screen bg-slate-950 text-slate-100 flex flex-col select-none overflow-hidden" 
      dir="rtl"
    >
      {/* Top Header Bar */}
      <header className="h-16 bg-slate-900/95 border-b border-slate-800 px-4 sm:px-6 flex items-center justify-between z-20 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <Link
            href="/live-classes"
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            title="العودة للحصص"
          >
            <ArrowRight className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-2.5 w-2.5 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
              </span>
              <h1 className="text-sm sm:text-base font-bold text-white truncate max-w-xs sm:max-w-md">
                {classData.title}
              </h1>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span>{countryObj?.flag} {countryObj?.name}</span>
              <span>•</span>
              <span className="text-emerald-400">{classData.subjectName}</span>
              {classData.unitTitle && (
                <>
                  <span>•</span>
                  <span>{classData.unitTitle}</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Right Header Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700 text-xs font-medium text-slate-300">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>المشرف: <strong className="text-white">{classData.supervisorName || 'المشرف المعتمد'}</strong></span>
          </div>

          <button
            onClick={handleCopyLink}
            className="p-2 sm:px-3 sm:py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-colors border border-slate-700"
            title="نسخ رابط الغرفة"
          >
            {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            <span className="hidden sm:inline">{copiedLink ? 'تم النسخ' : 'رابط الحصة'}</span>
          </button>

          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            title="ملء الشاشة"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* Main Workspace: Video on left/center, Sidebar on right */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
        {/* VIDEO & PRESENTATION STAGE */}
        <div className="flex-1 bg-slate-950 flex flex-col justify-between p-3 sm:p-5 relative overflow-hidden">
          {/* Main Visual Screen */}
          <div className="flex-1 bg-slate-900/90 rounded-3xl border border-slate-800/80 relative overflow-hidden flex items-center justify-center shadow-inner group">
            {/* Screen Share Track */}
            <video
              ref={screenVideoRef}
              autoPlay
              playsInline
              className={`w-full h-full object-contain ${isScreenSharing ? 'block' : 'hidden'}`}
            />

            {/* Camera Track */}
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              className={`w-full h-full object-cover ${isCamOn && !isScreenSharing ? 'block' : 'hidden'}`}
            />

            {/* Placeholder when No Video / Screen Active */}
            {!isCamOn && !isScreenSharing && (
              <div className="text-center p-8 space-y-4 max-w-md">
                <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-emerald-500/20 to-teal-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto shadow-2xl relative">
                  <Radio className="w-12 h-12 text-emerald-400 animate-pulse" />
                  <div className="absolute -bottom-2 px-3 py-0.5 rounded-full bg-emerald-500 text-[10px] font-bold text-slate-950 shadow-md">
                    بث مباشر
                  </div>
                </div>
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-white">{classData.title}</h3>
                  <p className="text-xs text-slate-400">
                    بإشراف {isSupervisorForThisClass ? 'حضرتك (مشرف الغرفة)' : `المشرف ${classData.supervisorName || 'المعتمد'}`}
                  </p>
                </div>
                {isSupervisorForThisClass ? (
                  <p className="text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 py-2 px-4 rounded-xl">
                    💡 يمكنك بدء تشغيل الكاميرا 📹 أو مشاركة الشاشة 🖥️ من شريط الأدوات بالأسفل
                  </p>
                ) : (
                  <p className="text-xs text-slate-400 bg-slate-800/50 py-2 px-4 rounded-xl">
                    🎙️ استمع إلى شرح المشرف وتفاعل عبر المحادثة المباشرة على اليمين
                  </p>
                )}
              </div>
            )}

            {/* Floating Top-Left Badges */}
            <div className="absolute top-4 left-4 flex items-center gap-2">
              <span className="px-3 py-1 rounded-xl bg-slate-950/80 backdrop-blur-md text-xs font-bold text-slate-200 border border-slate-700/80 flex items-center gap-1.5 shadow-lg">
                <Users className="w-3.5 h-3.5 text-emerald-400" />
                <span>{attendees.length} متواجد</span>
              </span>
              {isHandRaised && (
                <span className="px-3 py-1 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs flex items-center gap-1 animate-bounce shadow-lg">
                  <Hand className="w-3.5 h-3.5 fill-current" />
                  <span>طالب يطلب الكلمة!</span>
                </span>
              )}
            </div>

            {/* Floating PiP Local Video Thumbnail (if screen sharing is active and camera is on) */}
            {isScreenSharing && isCamOn && (
              <div className="absolute bottom-4 right-4 w-44 h-28 bg-slate-950 rounded-2xl border-2 border-emerald-500/60 overflow-hidden shadow-2xl">
                <video
                  ref={localVideoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
              </div>
            )}
          </div>

          {/* BOTTOM CONTROLS BAR */}
          <div className="mt-3 bg-slate-900/90 border border-slate-800/80 rounded-2xl p-3 flex items-center justify-between backdrop-blur-xl shadow-2xl">
            {/* Left Controls: Media Actions */}
            <div className="flex items-center gap-2">
              {/* Mic Button */}
              <button
                onClick={toggleMic}
                className={`p-3 rounded-2xl font-semibold text-xs flex items-center gap-2 transition-all ${
                  isMicOn
                    ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/20'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                }`}
                title={isMicOn ? 'كتم الميكروفون' : 'تشغيل الميكروفون'}
              >
                {isMicOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5 text-red-400" />}
                <span className="hidden md:inline">{isMicOn ? 'المايك يعمل' : 'المايك مكتوم'}</span>
              </button>

              {/* Camera Button */}
              <button
                onClick={toggleCamera}
                className={`p-3 rounded-2xl font-semibold text-xs flex items-center gap-2 transition-all ${
                  isCamOn
                    ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/20'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                }`}
                title={isCamOn ? 'إيقاف الكاميرا' : 'تشغيل الكاميرا'}
              >
                {isCamOn ? <VideoIcon className="w-5 h-5" /> : <VideoOff className="w-5 h-5 text-red-400" />}
                <span className="hidden md:inline">{isCamOn ? 'الكاميرا تعمل' : 'الكاميرا مغلقة'}</span>
              </button>

              {/* Screen Share Button (Supervisors / Host) */}
              {isSupervisorForThisClass && (
                <button
                  onClick={toggleScreenShare}
                  className={`p-3 rounded-2xl font-semibold text-xs flex items-center gap-2 transition-all ${
                    isScreenSharing
                      ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/20'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                  }`}
                  title={isScreenSharing ? 'إيقاف المشاركة' : 'مشاركة الشاشة أو العرض'}
                >
                  <MonitorUp className="w-5 h-5" />
                  <span className="hidden md:inline">{isScreenSharing ? 'إيقاف المشاركة' : 'مشاركة الشاشة'}</span>
                </button>
              )}

              {/* Student Raise Hand */}
              {!isSupervisorForThisClass && (
                <button
                  onClick={() => setIsHandRaised(!isHandRaised)}
                  className={`p-3 rounded-2xl font-semibold text-xs flex items-center gap-2 transition-all ${
                    isHandRaised
                      ? 'bg-amber-500 text-slate-950 font-bold'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                  }`}
                  title={isHandRaised ? 'خفض اليد' : 'رفع اليد للاستئذان'}
                >
                  <Hand className="w-5 h-5" />
                  <span className="hidden md:inline">{isHandRaised ? 'اليد مرفوعة' : 'رفع اليد'}</span>
                </button>
              )}
            </div>

            {/* Supervisor Extra Controls (Mute All / End Class) */}
            <div className="flex items-center gap-2">
              {isSupervisorForThisClass && (
                <>
                  <button
                    onClick={handleMuteAll}
                    className="p-2.5 sm:px-3 sm:py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-colors border border-slate-700"
                    title="كتم صوت جميع الطلاب"
                  >
                    <VolumeX className="w-4 h-4 text-amber-400" />
                    <span className="hidden lg:inline">كتم صوت الجميع</span>
                  </button>

                  <button
                    onClick={handleEndClass}
                    className="p-2.5 sm:px-4 sm:py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-lg shadow-red-600/20"
                    title="إنهاء الحصة لجميع الحاضرين"
                  >
                    <PhoneOff className="w-4 h-4" />
                    <span>إنهاء الحصة</span>
                  </button>
                </>
              )}

              {!isSupervisorForThisClass && (
                <Link
                  href="/live-classes"
                  className="p-2.5 sm:px-4 sm:py-2.5 rounded-xl bg-red-600/80 hover:bg-red-600 text-white text-xs font-bold flex items-center gap-1.5 transition-all"
                  title="مغادرة الحصة"
                >
                  <PhoneOff className="w-4 h-4" />
                  <span>مغادرة</span>
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* SIDEBAR: CHAT & PARTICIPANTS & NOTES */}
        <div className="w-full lg:w-96 bg-slate-900 border-t lg:border-t-0 lg:border-r border-slate-800 flex flex-col h-80 lg:h-auto z-10">
          {/* Sidebar Tabs */}
          <div className="flex items-center border-b border-slate-800 bg-slate-950/60 p-2 gap-1">
            <button
              onClick={() => setActiveTab('chat')}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'chat'
                  ? 'bg-slate-800 text-emerald-400 border border-emerald-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>المحادثة ({messages.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('participants')}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'participants'
                  ? 'bg-slate-800 text-emerald-400 border border-emerald-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>الحاضرون ({attendees.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('notes')}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'notes'
                  ? 'bg-slate-800 text-emerald-400 border border-emerald-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>الملاحظات</span>
            </button>
          </div>

          {/* TAB 1: LIVE CHAT */}
          {activeTab === 'chat' && (
            <div className="flex-1 flex flex-col justify-between overflow-hidden">
              {/* Messages Scroll Area */}
              <div className="flex-1 p-4 overflow-y-auto space-y-3.5 scrollbar-thin scrollbar-thumb-slate-800">
                {messages.map((m) => {
                  const isMe = m.senderId === user?.uid;
                  const isHost = m.senderRole === 'SUPER_ADMIN' || m.senderRole === 'COUNTRY_SUPERVISOR';
                  const isSys = m.senderId === 'system';

                  if (isSys) {
                    return (
                      <div key={m.id} className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-center text-xs text-slate-400 space-y-1">
                        <p>{m.text}</p>
                        <span className="text-[10px] text-slate-600">{m.timestamp}</span>
                      </div>
                    );
                  }

                  return (
                    <div
                      key={m.id}
                      className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                    >
                      <div className="flex items-center gap-1.5 mb-1 text-[11px] text-slate-400">
                        {isHost ? (
                          <span className="font-bold text-amber-400 flex items-center gap-1">
                            <Crown className="w-3 h-3" />
                            {m.senderName}
                          </span>
                        ) : (
                          <span className="font-medium text-slate-300">{m.senderName}</span>
                        )}
                        <span className="text-[10px] text-slate-500">{m.timestamp}</span>
                      </div>

                      <div
                        className={`p-3 rounded-2xl max-w-[85%] text-xs sm:text-sm leading-relaxed ${
                          isMe
                            ? 'bg-emerald-600 text-white rounded-br-none'
                            : isHost
                            ? 'bg-slate-800 border border-amber-500/30 text-slate-200 rounded-bl-none'
                            : 'bg-slate-800/90 text-slate-200 rounded-bl-none'
                        }`}
                      >
                        {m.text}
                      </div>
                    </div>
                  );
                })}
                <div ref={chatEndRef} />
              </div>

              {/* Chat Input */}
              <form onSubmit={handleSendMessage} className="p-3 bg-slate-950 border-t border-slate-800 flex items-center gap-2">
                <input
                  type="text"
                  placeholder="اكتب رسالتك للمشرف والطلاب..."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  className="flex-1 bg-slate-900 border border-slate-700/80 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
                <button
                  type="submit"
                  disabled={!inputText.trim()}
                  className="p-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white disabled:opacity-40 transition-colors"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          )}

          {/* TAB 2: PARTICIPANTS */}
          {activeTab === 'participants' && (
            <div className="flex-1 p-4 overflow-y-auto space-y-2.5 scrollbar-thin scrollbar-thumb-slate-800">
              <div className="text-xs font-semibold text-slate-400 mb-2">
                قائمة المسجلين والمتواجدين في الحصة:
              </div>
              {attendees.map((a, idx) => {
                const displayName = a.name || a.userName || 'مشارك';
                return (
                  <div
                    key={idx}
                    className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center font-bold text-slate-300">
                        {displayName.charAt(0)}
                      </div>
                      <div>
                        <div className="font-bold text-white flex items-center gap-1.5">
                          {displayName}
                          {a.isHost && (
                            <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[10px]">
                              المشرف
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-slate-500">
                          انضم {new Date(a.joinedAt).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>

                    {/* Host Controls over attendees */}
                    {isSupervisorForThisClass && !a.isHost && (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => alert(`تم كتم صوت ${displayName}`)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
                          title="كتم الصوت"
                        >
                          <MicOff className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* TAB 3: NOTES & DETAILS */}
          {activeTab === 'notes' && (
            <div className="flex-1 p-4 overflow-y-auto space-y-4 text-xs scrollbar-thin scrollbar-thumb-slate-800">
              <div className="space-y-2 bg-slate-950/70 p-4 rounded-2xl border border-slate-800">
                <h4 className="font-bold text-emerald-400 text-sm">موضوع الحصة:</h4>
                <p className="text-slate-300 leading-relaxed">
                  {classData.description || 'لم يتم إضافة تفاصيل إضافية لهذه الحصة.'}
                </p>
              </div>

              <div className="space-y-2 bg-slate-950/70 p-4 rounded-2xl border border-slate-800">
                <h4 className="font-bold text-slate-200">إرشادات الحضور والمشاركة:</h4>
                <ul className="list-disc list-inside space-y-1.5 text-slate-400">
                  <li>الالتزام بكتم الميكروفون عند التحدث لعدم التشويش على الشرح.</li>
                  <li>استخدم زر "رفع اليد" عند الرغبة في طرح سؤال أو استفسار.</li>
                  <li>تجنب إرسال روابط غير متعلقة بمحتوى الحصة في الدردشة.</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
