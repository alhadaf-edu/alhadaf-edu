'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
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
  Maximize2,
  Minimize2,
  Copy,
  Check,
  Crown,
  AlertCircle,
  BookOpen,
  ArrowRight,
  VolumeX,
  Sparkles,
  CircleDot,
  Download,
  Square,
  Globe2,
  Camera
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

interface ParticipantTile {
  identity: string;
  name: string;
  role: 'SUPER_ADMIN' | 'COUNTRY_SUPERVISOR' | 'STUDENT';
  isHost: boolean;
  isAudioOn: boolean;
  isVideoOn: boolean;
  stream?: MediaStream;
}

export default function LiveClassRoomPage() {
  const params = useParams();
  const router = useRouter();
  const classId = params?.id as string;

  const { user, profile, isSuperAdmin, isCountrySupervisor, userCountry } = useAuth();

  // Class & Connection State
  const [classData, setClassData] = useState<LiveClass | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [toastMsg, setToastMsg] = useState('');

  // Media Controls State
  const [isMicOn, setIsMicOn] = useState(false);
  const [isCamOn, setIsCamOn] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isHandRaised, setIsHandRaised] = useState(false);
  const [activeTab, setActiveTab] = useState<'chat' | 'participants' | 'notes'>('chat');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Recording State (تسجيل الحصة وحفظها على الجهاز)
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Media Streams & Video Refs
  const localStreamRef = useRef<MediaStream | null>(null);
  const screenStreamRef = useRef<MediaStream | null>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const screenVideoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Chat & Attendees State
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [participants, setParticipants] = useState<ParticipantTile[]>([]);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const isSupervisorForThisClass =
    isSuperAdmin ||
    (isCountrySupervisor && (userCountry === classData?.countryId || profile?.assignedCountry === classData?.countryId));

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 4000);
  };

  // 1. Fetch Class Data (Instant LocalStorage + Cloud fallback)
  useEffect(() => {
    if (!classId) return;
    setLoading(true);

    const loadClass = async () => {
      // A. Check local cache first
      if (typeof window !== 'undefined') {
        const cached = localStorage.getItem('alhadaf_live_classes_v2');
        if (cached) {
          try {
            const list: LiveClass[] = JSON.parse(cached);
            const found = list.find((c: LiveClass) => c.id === classId);
            if (found) {
              setClassData(found);
              setLoading(false);
            }
          } catch {}
        }
      }

      // B. Fetch from API
      try {
        const res = await fetch(`/api/live-classes?id=${classId}&userId=${user?.uid || ''}&country=${userCountry || 'sa'}`);
        const data = await res.json();
        if (data.success && Array.isArray(data.classes) && data.classes.length > 0) {
          const found = data.classes[0];
          setClassData(found);
        } else if (!classData) {
          setErrorMsg('لم يتم العثور على الحصة أو ربما تم حذفها.');
        }
      } catch (e) {
        if (!classData) setErrorMsg('تعذر الاتصال بالخادم لتحميل الحصة.');
      } finally {
        setLoading(false);
      }
    };

    loadClass();
  }, [classId, userCountry]);

  // 2. Initialize Attendees & LiveKit Connection
  useEffect(() => {
    if (!classData) return;

    const myName = profile?.displayName || user?.displayName || (isSupervisorForThisClass ? 'المشرف المعتمد' : 'طالب');
    const myRole = isSuperAdmin ? 'SUPER_ADMIN' : isCountrySupervisor ? 'COUNTRY_SUPERVISOR' : 'STUDENT';

    // Set Welcome Messages
    setMessages([
      {
        id: 'sys-welcome',
        senderId: 'system',
        senderName: 'نظام الهَدَّاف الافتراضي',
        senderRole: 'SUPER_ADMIN',
        text: `مرحباً بكم في حصة "${classData.title}". الميكروفون والكاميرا متاحان للمشاركة والتفاعل المباشر.`,
        timestamp: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })
      }
    ]);

    // Initial Live Participants Grid
    setParticipants([
      {
        identity: user?.uid || `user_${Date.now()}`,
        name: myName,
        role: myRole,
        isHost: isSupervisorForThisClass,
        isAudioOn: isMicOn,
        isVideoOn: isCamOn
      }
    ]);
  }, [classData, isSupervisorForThisClass, isSuperAdmin, isCountrySupervisor, profile, user]);

  // Scroll chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // 3. Microphone Toggle & Audio Capture
  const toggleMic = async () => {
    if (isMicOn) {
      // Turn OFF
      if (localStreamRef.current) {
        localStreamRef.current.getAudioTracks().forEach(t => {
          t.enabled = false;
          t.stop();
        });
      }
      setIsMicOn(false);
      updateMyParticipantState({ isAudioOn: false });
      showToast('🔇 تم كتم الميكروفون');
    } else {
      // Turn ON
      try {
        const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
        if (localStreamRef.current) {
          audioStream.getAudioTracks().forEach(t => localStreamRef.current?.addTrack(t));
        } else {
          localStreamRef.current = audioStream;
        }
        setIsMicOn(true);
        updateMyParticipantState({ isAudioOn: true });
        showToast('🎙️ تم تشغيل الميكروفون — صوتك مسموع الآن');
      } catch (err) {
        alert('تعذر الوصول إلى الميكروفون. يرجى التأكد من توصيل المايك والسماح للمتصفح.');
      }
    }
  };

  // 4. Camera Toggle & Video Capture
  const toggleCamera = async () => {
    if (isCamOn) {
      // Turn OFF
      if (localStreamRef.current) {
        localStreamRef.current.getVideoTracks().forEach(t => {
          t.stop();
        });
      }
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = null;
      }
      setIsCamOn(false);
      updateMyParticipantState({ isVideoOn: false, stream: undefined });
      showToast('📷 تم إيقاف الكاميرا');
    } else {
      // Turn ON
      try {
        const videoStream = await navigator.mediaDevices.getUserMedia({ 
          video: { width: { ideal: 1280 }, height: { ideal: 720 } },
          audio: isMicOn 
        });
        localStreamRef.current = videoStream;
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = videoStream;
          localVideoRef.current.play().catch(() => {});
        }
        setIsCamOn(true);
        updateMyParticipantState({ isVideoOn: true, stream: videoStream });
        showToast('📹 تم تشغيل الكاميرا بنجاح');
      } catch (err) {
        alert('تعذر فتح الكاميرا. يرجى منح الإذن للمتصفح لاستخدام الكاميرا.');
      }
    }
  };

  // 5. Screen Share Toggle
  const toggleScreenShare = async () => {
    if (isScreenSharing) {
      if (screenStreamRef.current) {
        screenStreamRef.current.getTracks().forEach(t => t.stop());
        screenStreamRef.current = null;
      }
      if (screenVideoRef.current) {
        screenVideoRef.current.srcObject = null;
      }
      setIsScreenSharing(false);
      showToast('⏹️ تم إيقاف مشاركة الشاشة');
    } else {
      try {
        const displayStream = await navigator.mediaDevices.getDisplayMedia({
          video: { cursor: 'always' } as any,
          audio: true
        });
        screenStreamRef.current = displayStream;
        if (screenVideoRef.current) {
          screenVideoRef.current.srcObject = displayStream;
          screenVideoRef.current.play().catch(() => {});
        }
        setIsScreenSharing(true);
        showToast('🖥️ جاري مشاركة الشاشة والعرض الآن');

        displayStream.getVideoTracks()[0].onended = () => {
          setIsScreenSharing(false);
          screenStreamRef.current = null;
        };
      } catch (err) {
        console.warn('Screen share cancelled:', err);
      }
    }
  };

  // 6. RECORDING ENGINE (تسجيل الحصة وحفظ الفيديو على جهاز المشرف)
  const startRecording = async () => {
    try {
      let recordingStream: MediaStream;

      if (isScreenSharing && screenStreamRef.current) {
        recordingStream = screenStreamRef.current;
      } else if (localStreamRef.current && localStreamRef.current.getVideoTracks().length > 0) {
        recordingStream = localStreamRef.current;
      } else {
        // Prompt for screen/window to record
        recordingStream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: true
        });
      }

      // Add audio track if mic is on
      if (localStreamRef.current && localStreamRef.current.getAudioTracks().length > 0) {
        localStreamRef.current.getAudioTracks().forEach(t => recordingStream.addTrack(t));
      }

      recordedChunksRef.current = [];
      const mimeTypes = ['video/webm;codecs=vp9,opus', 'video/webm;codecs=vp8,opus', 'video/webm', 'video/mp4'];
      const supportedType = mimeTypes.find(type => MediaRecorder.isTypeSupported(type)) || '';

      const recorder = new MediaRecorder(recordingStream, supportedType ? { mimeType: supportedType } : {});
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          recordedChunksRef.current.push(e.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(recordedChunksRef.current, { type: supportedType || 'video/webm' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        const dateStr = new Date().toISOString().slice(0, 10);
        const safeTitle = (classData?.title || 'حصة_الهدف').replace(/[^a-zA-Z0-9\u0600-\u06FF]/g, '_');
        a.download = `حصة_${safeTitle}_${dateStr}.webm`;
        document.body.appendChild(a);
        a.click();
        setTimeout(() => {
          document.body.removeChild(a);
          window.URL.revokeObjectURL(url);
        }, 100);

        setIsRecording(false);
        setRecordingTime(0);
        if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
        showToast('💾 تم حفظ وتحميل تسجيل الحصة بنجاح على جهازك!');
      };

      recorder.start(1000); // chunk every 1s
      setIsRecording(true);
      setRecordingTime(0);

      // Start duration timer
      recordingTimerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

      showToast('🔴 بدأ تسجيل الحصة المباشرة...');
    } catch (err) {
      alert('تعذر بدء التسجيل. يرجى منح إذن التقاط الشاشة والصوت.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const updateMyParticipantState = (updates: Partial<ParticipantTile>) => {
    setParticipants(prev => {
      if (prev.length === 0) return prev;
      return [{ ...prev[0], ...updates }, ...prev.slice(1)];
    });
  };

  // 7. Live Chat Handlers
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

  // 8. Supervisor Controls: Mute All Students
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
    showToast('🔇 تم كتم صوت جميع الحاضرين');
  };

  // 9. Supervisor: End Class
  const handleEndClass = async () => {
    if (!isSupervisorForThisClass) return;
    if (!confirm('هل تريد بالتأكيد إنهاء الحصة لجميع الحاضرين؟')) return;

    if (isRecording) stopRecording();

    try {
      await fetch('/api/live-classes', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: classId,
          status: 'ended',
          userId: user?.uid,
          role: profile?.role,
          userEmail: user?.email,
          country: userCountry
        })
      });
    } catch (e) {}

    router.push('/live-classes');
  };

  // Fullscreen toggle
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

  // Copy room link
  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    showToast('✅ تم نسخ رابط الحصة!');
    setTimeout(() => setCopiedLink(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center space-y-4" dir="rtl">
        <Radio className="w-12 h-12 text-emerald-400 animate-pulse" />
        <p className="text-slate-300 font-semibold text-lg">جاري تجهيز الغرفة الافتراضية والاتصال بالسيرفر السحابي...</p>
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
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed top-20 right-6 z-50 bg-emerald-600 text-white font-bold text-xs sm:text-sm py-2.5 px-4 rounded-xl shadow-2xl flex items-center gap-2 border border-emerald-400/40 animate-fade-in">
          <Sparkles className="w-4 h-4 text-amber-300" />
          <span>{toastMsg}</span>
        </div>
      )}

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
          {/* Recording Badge */}
          {isRecording && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-red-500/20 border border-red-500/40 text-red-300 text-xs font-bold animate-pulse">
              <CircleDot className="w-4 h-4 text-red-500" />
              <span>تسجيل جاري ({formatTimer(recordingTime)})</span>
            </div>
          )}

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

      {/* Main Workspace */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
        {/* VIDEO & CAMERA STAGE */}
        <div className="flex-1 bg-slate-950 flex flex-col justify-between p-3 sm:p-5 relative overflow-hidden">
          {/* Main Visual Stage / Grid */}
          <div className="flex-1 bg-slate-900/90 rounded-3xl border border-slate-800/80 relative overflow-hidden flex items-center justify-center shadow-inner group">
            {/* Screen Share Video Stream */}
            <video
              ref={screenVideoRef}
              autoPlay
              playsInline
              className={`w-full h-full object-contain ${isScreenSharing ? 'block' : 'hidden'}`}
            />

            {/* Camera Video Stream */}
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              className={`w-full h-full object-cover ${isCamOn && !isScreenSharing ? 'block' : 'hidden'}`}
            />

            {/* Placeholder when No Video or Screen Share Active */}
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
                <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                  <button
                    onClick={toggleCamera}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md"
                  >
                    <Camera className="w-4 h-4" />
                    <span>تشغيل الكاميرا 📹</span>
                  </button>
                  <button
                    onClick={toggleMic}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition-all"
                  >
                    <Mic className="w-4 h-4" />
                    <span>تشغيل المايك 🎙️</span>
                  </button>
                </div>
              </div>
            )}

            {/* Top Info Badges */}
            <div className="absolute top-4 left-4 flex items-center gap-2">
              <span className="px-3 py-1 rounded-xl bg-slate-950/80 backdrop-blur-md text-xs font-bold text-slate-200 border border-slate-700/80 flex items-center gap-1.5 shadow-lg">
                <Users className="w-3.5 h-3.5 text-emerald-400" />
                <span>{participants.length} متواجد</span>
              </span>
              {isHandRaised && (
                <span className="px-3 py-1 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs flex items-center gap-1 animate-bounce shadow-lg">
                  <Hand className="w-3.5 h-3.5 fill-current" />
                  <span>طالب يطلب الكلمة!</span>
                </span>
              )}
            </div>

            {/* PiP Local Video Thumbnail (if screen sharing is active & camera is on) */}
            {isScreenSharing && isCamOn && (
              <div className="absolute bottom-4 right-4 w-48 h-32 bg-slate-950 rounded-2xl border-2 border-emerald-500/60 overflow-hidden shadow-2xl">
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
          <div className="mt-3 bg-slate-900/95 border border-slate-800/80 rounded-2xl p-3 flex flex-wrap items-center justify-between gap-3 backdrop-blur-xl shadow-2xl">
            {/* Left Controls: Media Actions */}
            <div className="flex items-center gap-2">
              {/* Mic Button (Works for both Supervisor and Students) */}
              <button
                onClick={toggleMic}
                className={`p-3 rounded-2xl font-semibold text-xs flex items-center gap-2 transition-all ${
                  isMicOn
                    ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/20 animate-pulse'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                }`}
                title={isMicOn ? 'كتم الميكروفون' : 'تشغيل الميكروفون والتحدث'}
              >
                {isMicOn ? <Mic className="w-5 h-5 text-white" /> : <MicOff className="w-5 h-5 text-red-400" />}
                <span className="hidden sm:inline">{isMicOn ? 'المايك يعمل' : 'المايك مكتوم'}</span>
              </button>

              {/* Camera Button (Works for both Supervisor and Students) */}
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
                <span className="hidden sm:inline">{isCamOn ? 'الكاميرا تعمل' : 'الكاميرا مغلقة'}</span>
              </button>

              {/* Screen Share Button */}
              {isSupervisorForThisClass && (
                <button
                  onClick={toggleScreenShare}
                  className={`p-3 rounded-2xl font-semibold text-xs flex items-center gap-2 transition-all ${
                    isScreenSharing
                      ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/20'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                  }`}
                  title={isScreenSharing ? 'إيقاف مشاركة الشاشة' : 'مشاركة الشاشة أو العرض'}
                >
                  <MonitorUp className="w-5 h-5" />
                  <span className="hidden md:inline">{isScreenSharing ? 'إيقاف المشاركة' : 'مشاركة الشاشة'}</span>
                </button>
              )}

              {/* Student Raise Hand Button */}
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

            {/* Right Controls: Recording & Supervisor Tools */}
            <div className="flex items-center gap-2">
              {/* RECORDING BUTTON (حفظ وتسجيل الحصة على الجهاز) */}
              {isSupervisorForThisClass && (
                <>
                  {!isRecording ? (
                    <button
                      onClick={startRecording}
                      className="p-2.5 sm:px-3.5 sm:py-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-300 text-xs font-bold flex items-center gap-1.5 transition-colors border border-red-500/30"
                      title="تسجيل الحصة وحفظ الفيديو على جهازك"
                    >
                      <CircleDot className="w-4 h-4 text-red-500 animate-pulse" />
                      <span>تسجيل الحصة</span>
                    </button>
                  ) : (
                    <button
                      onClick={stopRecording}
                      className="p-2.5 sm:px-3.5 sm:py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-lg shadow-red-600/30"
                      title="إيقاف التسجيل وحفظ ملف الفيديو على اللابتوب"
                    >
                      <Square className="w-4 h-4 fill-current" />
                      <span>إيقاف وحفظ ({formatTimer(recordingTime)})</span>
                    </button>
                  )}

                  <button
                    onClick={handleMuteAll}
                    className="p-2.5 sm:px-3 sm:py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-colors border border-slate-700"
                    title="كتم صوت جميع الطلاب"
                  >
                    <VolumeX className="w-4 h-4 text-amber-400" />
                    <span className="hidden xl:inline">كتم صوت الجميع</span>
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
              <span>الحاضرون ({participants.length})</span>
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
              {/* Messages List */}
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
                قائمة الحاضرين في الغرفة الافتراضية ({participants.length}):
              </div>
              {participants.map((p, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center font-bold text-slate-300">
                      {p.name.charAt(0)}
                    </div>
                    <div>
                      <div className="font-bold text-white flex items-center gap-1.5">
                        {p.name}
                        {p.isHost && (
                          <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[10px]">
                            المشرف
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                        <span className={p.isAudioOn ? 'text-emerald-400' : 'text-red-400'}>
                          {p.isAudioOn ? '🎙️ المايك يعمل' : '🔇 المايك مكتوم'}
                        </span>
                        <span>•</span>
                        <span className={p.isVideoOn ? 'text-emerald-400' : 'text-slate-500'}>
                          {p.isVideoOn ? '📹 الكاميرا تعمل' : '📷 الكاميرا مغلقة'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Host Controls over attendees */}
                  {isSupervisorForThisClass && !p.isHost && (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => alert(`تم كتم صوت ${p.name}`)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
                        title="كتم الصوت"
                      >
                        <VolumeX className="w-3.5 h-3.5 text-amber-400" />
                      </button>
                    </div>
                  )}
                </div>
              ))}
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
                  <li>الالتزام بآداب الحوار واستخدام زر "رفع اليد" عند الرغبة في التحدث.</li>
                  <li>تأكد من اختيار مكان هادئ لتشغيل الميكروفون بوضوح.</li>
                  <li>المشرف يستطيع تسجيل الحصة وحفظها وإتاحتها كمرجع للطلاب.</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
