'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { ARAB_COUNTRIES } from '@/lib/curriculumData';
import { LiveClass, CountryCode } from '@/types';
import {
  Room,
  RoomEvent,
  Track,
  RemoteTrack,
  RemoteParticipant,
  LocalParticipant,
  Participant,
  DataPacket_Kind
} from 'livekit-client';
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
  Square,
  Camera,
  Layers,
  Smile,
  Volume2,
  LayoutGrid,
  PenTool,
  Eraser,
  Paintbrush,
  Trash2,
  Lock,
  Unlock,
  Palette,
  X,
  Sliders,
  Download,
  Upload,
  FileText,
  GripHorizontal,
  ChevronDown,
  ChevronUp
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

interface ParticipantInfo {
  identity: string;
  name: string;
  role: 'SUPER_ADMIN' | 'COUNTRY_SUPERVISOR' | 'STUDENT';
  isHost: boolean;
  isAudioOn: boolean;
  isVideoOn: boolean;
  isSpeaking?: boolean;
  videoTrack?: Track;
  audioTrack?: Track;
  participant?: Participant;
}

// Dedicated Zoom / Google Meet style video tile component
function ParticipantTile({
  participantInfo,
  isActiveSpeaker
}: {
  participantInfo: ParticipantInfo;
  isActiveSpeaker: boolean;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const el = videoRef.current;
    const track = participantInfo.videoTrack;
    if (el && track) {
      track.attach(el);
      return () => {
        track.detach(el);
      };
    }
  }, [participantInfo.videoTrack, participantInfo.isVideoOn]);

  const hasVideo = participantInfo.isVideoOn && !!participantInfo.videoTrack;

  return (
    <div
      className={`relative w-full h-full min-h-[160px] sm:min-h-[200px] rounded-2xl bg-slate-900 border overflow-hidden flex flex-col items-center justify-center shadow-lg transition-all duration-300 ${
        isActiveSpeaker
          ? 'border-emerald-400 ring-2 ring-emerald-400/60 shadow-emerald-500/20'
          : 'border-slate-800'
      }`}
    >
      {/* Video Element */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className={`w-full h-full object-cover ${hasVideo ? 'block' : 'hidden'}`}
      />

      {/* Avatar Placeholder when video is off */}
      {!hasVideo && (
        <div className="flex flex-col items-center justify-center p-4 space-y-2">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-tr from-slate-800 to-slate-700 border border-slate-600/50 flex items-center justify-center text-xl sm:text-2xl font-bold text-slate-100 shadow-md">
            {participantInfo.name.charAt(0)}
          </div>
          <span className="text-xs text-slate-300 font-semibold truncate max-w-[140px]">
            {participantInfo.name}
          </span>
        </div>
      )}

      {/* Top Left Status Badge */}
      <div className="absolute top-2 left-2 flex items-center gap-1.5 z-10">
        <span
          className={`p-1.5 rounded-lg text-white backdrop-blur-md ${
            participantInfo.isAudioOn ? 'bg-emerald-600/80' : 'bg-red-500/80'
          }`}
          title={participantInfo.isAudioOn ? 'المايك يعمل' : 'المايك مكتوم'}
        >
          {participantInfo.isAudioOn ? <Volume2 className="w-3.5 h-3.5" /> : <MicOff className="w-3.5 h-3.5" />}
        </span>
      </div>

      {/* Bottom Name & Role Overlay */}
      <div className="absolute bottom-2 inset-x-2 bg-slate-950/80 backdrop-blur-md py-1 px-2 rounded-xl flex items-center justify-between border border-slate-800/80 z-10">
        <span className="text-[11px] sm:text-xs font-bold text-white truncate max-w-[110px] sm:max-w-[150px]">
          {participantInfo.name}
        </span>
        {participantInfo.isHost ? (
          <span className="px-1.5 py-0.5 rounded bg-amber-500/20 border border-amber-500/30 text-amber-300 text-[10px] font-bold flex items-center gap-1">
            <Crown className="w-2.5 h-2.5" />
            <span>المشرف</span>
          </span>
        ) : (
          <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 text-[10px]">
            طالب
          </span>
        )}
      </div>
    </div>
  );
}

export default function LiveClassRoomPage() {
  const params = useParams();
  const router = useRouter();
  const classId = params?.id as string;

  const { user, profile, isSuperAdmin, isCountrySupervisor, userCountry } = useAuth();

  // Class & Room Data
  const [classData, setClassData] = useState<LiveClass | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [toastMsg, setToastMsg] = useState('');
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'reconnecting' | 'disconnected'>('connecting');

  // Media Controls State
  const [isMicOn, setIsMicOn] = useState(false);
  const [isCamOn, setIsCamOn] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [screenTrack, setScreenTrack] = useState<Track | null>(null);
  const [screenSharePresenter, setScreenSharePresenter] = useState<string>('');
  const [allowStudentScreenShare, setAllowStudentScreenShare] = useState<boolean>(true);
  const [isHandRaised, setIsHandRaised] = useState(false);
  const [activeTab, setActiveTab] = useState<'chat' | 'participants' | 'notes'>('chat');
  const [viewMode, setViewMode] = useState<'speaker' | 'gallery'>('gallery');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Floating Annotation & Whiteboard Tool State (قلم عائم، فرشاة، وممحاة على الشاشة)
  const [isAnnotationOpen, setIsAnnotationOpen] = useState(false);
  const [annotationTool, setAnnotationTool] = useState<'pen' | 'highlighter' | 'eraser'>('pen');
  const [annotationColor, setAnnotationColor] = useState<string>('#ef4444');
  const [annotationSize, setAnnotationSize] = useState<number>(4);
  const [isDrawing, setIsDrawing] = useState(false);
  const annotationCanvasRef = useRef<HTMLCanvasElement | null>(null);
  // Draggable toolbar position
  const [toolbarPos, setToolbarPos] = useState<{x: number; y: number}>({ x: 16, y: 16 });
  const isDraggingToolbar = useRef(false);
  const dragOffset = useRef<{x: number; y: number}>({ x: 0, y: 0 });

  // Interactive Whiteboard State (سبورة بيضاء تفاعلية)
  const [isWhiteboardActive, setIsWhiteboardActive] = useState(false);
  const whiteboardCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [wbTool, setWbTool] = useState<'pen' | 'highlighter' | 'eraser'>('pen');
  const [wbColor, setWbColor] = useState('#ef4444');
  const [wbSize, setWbSize] = useState(4);
  const [isWbDrawing, setIsWbDrawing] = useState(false);
  const wbLastPoint = useRef<{x: number; y: number} | null>(null);

  // File Sharing State (مشاركة ملف - PDF / صورة / عرض تقديمي)
  const [sharedFile, setSharedFile] = useState<{name: string; type: string; url: string} | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Recording State (تسجيل الحصة وحفظها على الجهاز)
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);

  // LiveKit Room & WebRTC Refs
  const roomRef = useRef<Room | null>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const screenVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideosContainerRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  // Stable refs to prevent LiveKit connection re-triggering on every state change
  const hasConnectedRef = useRef(false);
  const isSupervisorRef = useRef(false);
  const profileNameRef = useRef<string>('');
  const syncParticipantsRef = useRef<((room: Room) => void) | null>(null);

  // Real-Time Connected Participants & Chat
  const [participants, setParticipants] = useState<ParticipantInfo[]>([]);
  const [activeSpeakerId, setActiveSpeakerId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  const isSupervisorForThisClass =
    isSuperAdmin ||
    (isCountrySupervisor && (userCountry === classData?.countryId || profile?.assignedCountry === classData?.countryId));

  // Keep stable refs up-to-date every render (used inside LiveKit connection effect to avoid re-connection)
  isSupervisorRef.current = isSupervisorForThisClass;
  profileNameRef.current = profile?.displayName || user?.displayName || (isSupervisorForThisClass ? 'المشرف المعتمد' : 'طالب');

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 4000);
  };

  // Dedicated track attachment for Screen Share (attaches track whenever video element is mounted)
  useEffect(() => {
    const el = screenVideoRef.current;
    if (el && screenTrack) {
      screenTrack.attach(el);
      el.play().catch(() => {});
      return () => {
        screenTrack.detach(el);
      };
    }
  }, [screenTrack, isScreenSharing]);

  // Fullscreen event listener to keep state perfectly synchronized
  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFsChange);
    };
  }, []);

  // 1. Fetch Class Data (Instant Cache + API)
  useEffect(() => {
    if (!classId) return;

    const loadClass = async () => {
      // Local cache
      if (typeof window !== 'undefined') {
        const cached = localStorage.getItem('alhadaf_live_classes_v3');
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

      // API fetch
      try {
        const res = await fetch(`/api/live-classes?id=${classId}&userId=${user?.uid || ''}&country=${userCountry || 'sa'}`);
        const data = await res.json();
        if (data.deleted) {
          // The class has been explicitly deleted by a supervisor!
          setErrorMsg('قام المشرف بحذف هذه الحصة الافتراضية.');
          if (typeof window !== 'undefined') {
            const cached = localStorage.getItem('alhadaf_live_classes_v2');
            if (cached) {
              try {
                const list = JSON.parse(cached).filter((c: any) => c.id !== classId);
                localStorage.setItem('alhadaf_live_classes_v2', JSON.stringify(list));
              } catch {}
            }
          }
          setTimeout(() => {
            router.push('/live-classes');
          }, 2000);
          return;
        }

        if (data.success && Array.isArray(data.classes) && data.classes.length > 0) {
          const found = data.classes[0];
          setClassData(found);
          setErrorMsg('');
        } else if (!classData) {
          // Graceful auto-creation fallback for direct room join (like Zoom / Google Meet meeting links)
          const fallbackClass: LiveClass = {
            id: classId,
            title: 'حصة تفاعلية مباشرة',
            description: 'فصل افتراضي وبث مباشر عبر تقنية WebRTC',
            countryId: userCountry || 'sa',
            stage: 'secondary',
            gradeNumber: 1,
            subjectId: 'general',
            subjectName: 'بث مباشر',
            scheduledAt: new Date().toISOString(),
            status: 'live',
            roomName: `live_class_${classId.replace(/[^a-zA-Z0-9_-]/g, '_')}`,
            supervisorId: 'supervisor',
            supervisorName: 'المشرف المعتمد',
            supervisorEmail: '',
            supervisorCountry: userCountry || 'sa',
            attendeesCount: 1,
            attendees: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
          setClassData(fallbackClass);
          setErrorMsg('');
        }
      } catch (e) {
        if (!classData) {
          const fallbackClass: LiveClass = {
            id: classId,
            title: 'حصة تفاعلية مباشرة',
            description: 'فصل افتراضي وبث مباشر عبر تقنية WebRTC',
            countryId: userCountry || 'sa',
            stage: 'secondary',
            gradeNumber: 1,
            subjectId: 'general',
            subjectName: 'بث مباشر',
            scheduledAt: new Date().toISOString(),
            status: 'live',
            roomName: `live_class_${classId.replace(/[^a-zA-Z0-9_-]/g, '_')}`,
            supervisorId: 'supervisor',
            supervisorName: 'المشرف المعتمد',
            supervisorEmail: '',
            supervisorCountry: userCountry || 'sa',
            attendeesCount: 1,
            attendees: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
          setClassData(fallbackClass);
          setErrorMsg('');
        }
      } finally {
        setLoading(false);
      }
    };

    loadClass();
  }, [classId, userCountry]);

  // Update participants list helper
  const syncParticipantsList = useCallback((room: Room) => {
    const list: ParticipantInfo[] = [];

    // Helper to get video track
    const getParticipantVideoTrack = (p: Participant): Track | undefined => {
      for (const pub of Array.from(p.videoTrackPublications.values())) {
        if (pub.track && pub.source !== Track.Source.ScreenShare) {
          return pub.track;
        }
      }
      return undefined;
    };

    // 1. Local Participant
    if (room.localParticipant) {
      const lp = room.localParticipant;
      let meta: any = {};
      try { meta = JSON.parse(lp.metadata || '{}'); } catch {}
      const vTrack = getParticipantVideoTrack(lp);
      list.push({
        identity: lp.identity,
        name: lp.name || profile?.displayName || user?.displayName || (isSupervisorForThisClass ? 'المشرف المعتمد' : 'طالب'),
        role: meta.role || (isSuperAdmin ? 'SUPER_ADMIN' : isCountrySupervisor ? 'COUNTRY_SUPERVISOR' : 'STUDENT'),
        isHost: isSupervisorForThisClass,
        isAudioOn: lp.isMicrophoneEnabled,
        isVideoOn: lp.isCameraEnabled,
        isSpeaking: lp.isSpeaking,
        videoTrack: vTrack,
        participant: lp
      });
    }

    // 2. Remote Participants
    room.remoteParticipants.forEach((rp) => {
      let meta: any = {};
      try { meta = JSON.parse(rp.metadata || '{}'); } catch {}
      const isRemoteHost = meta.role === 'SUPER_ADMIN' || meta.role === 'COUNTRY_SUPERVISOR';
      const vTrack = getParticipantVideoTrack(rp);
      list.push({
        identity: rp.identity,
        name: rp.name || 'مشارك',
        role: meta.role || 'STUDENT',
        isHost: isRemoteHost,
        isAudioOn: rp.isMicrophoneEnabled,
        isVideoOn: rp.isCameraEnabled,
        isSpeaking: rp.isSpeaking,
        videoTrack: vTrack,
        participant: rp
      });
    });

    setParticipants(list);
  }, [isSupervisorForThisClass, isSuperAdmin, isCountrySupervisor, profile, user]);

  // Keep ref synced so connection effect uses latest without re-connecting
  syncParticipantsRef.current = syncParticipantsList;

  // 2. Connect to LiveKit Cloud Serverless WebRTC Room
  useEffect(() => {
    if (!classData?.id) return;

    let isMounted = true;
    const room = new Room({
      adaptiveStream: true,
      dynacast: true,
      audioCaptureDefaults: {
        autoGainControl: true,
        echoCancellation: true,
        noiseSuppression: true
      },
      videoCaptureDefaults: {
        resolution: { width: 1280, height: 720, frameRate: 30 }
      }
    });

    roomRef.current = room;

    const connectToLiveKit = async () => {
      try {
        setConnectionStatus('connecting');
        const normalizedRoomId = classData.id.replace(/[^a-zA-Z0-9_-]/g, '_');
        const roomName = `live_class_${normalizedRoomId}`;
        const myName = profileNameRef.current;
        const myRole = isSupervisorRef.current ? (isSuperAdmin ? 'SUPER_ADMIN' : 'COUNTRY_SUPERVISOR') : 'STUDENT';

        // 1. Fetch Secure LiveKit Access Token
        const tokenRes = await fetch('/api/livekit/token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            roomName,
            userId: user?.uid || `user_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
            userName: myName,
            userRole: myRole,
            userEmail: user?.email || '',
            userCountry: userCountry || 'sa',
            classCountry: classData.countryId || 'sa',
            isHostRequest: isSupervisorRef.current
          })
        });

        const tokenData = await tokenRes.json();
        if (!tokenData.token || !tokenData.serverUrl) {
          throw new Error(tokenData.error || 'تعذر استخراج تصريح الدخول إلى سيرفر البث');
        }

        if (!isMounted) return;

        // 2. Setup Room Event Listeners
        room
          .on(RoomEvent.Connected, () => {
            if (!isMounted) return;
            setConnectionStatus('connected');
            showToast('🟢 تم الاتصال بالغرفة الافتراضية بنجاح!');
            syncParticipantsRef.current?.(room);

            // Transition class status to 'live'
            if (classData && (classData.status || '').toLowerCase() === 'scheduled') {
              setClassData(prev => prev ? { ...prev, status: 'live' } : null);
              if (typeof window !== 'undefined') {
                const cached = localStorage.getItem('alhadaf_live_classes_v3');
                if (cached) {
                  try {
                    const list: LiveClass[] = JSON.parse(cached);
                    const updated = list.map(c => c.id === classData.id ? { ...c, status: 'live' as const } : c);
                    localStorage.setItem('alhadaf_live_classes_v3', JSON.stringify(updated));
                  } catch {}
                }
              }
              fetch('/api/live-classes', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  id: classData.id,
                  status: 'live',
                  userId: user?.uid,
                  role: profile?.role,
                  userEmail: user?.email,
                  country: userCountry
                })
              }).catch(() => {});
            }
          })
          .on(RoomEvent.Reconnecting, () => {
            if (!isMounted) return;
            setConnectionStatus('reconnecting');
            showToast('🔄 جاري إعادة الاتصال بالسيرفر...');
          })
          .on(RoomEvent.Reconnected, () => {
            if (!isMounted) return;
            setConnectionStatus('connected');
            showToast('🟢 تم استعادة الاتصال بالغرفة!');
            syncParticipantsRef.current?.(room);
          })
          .on(RoomEvent.Disconnected, () => {
            if (!isMounted) return;
            setConnectionStatus('disconnected');
          })
          .on(RoomEvent.ParticipantConnected, (p: RemoteParticipant) => {
            if (!isMounted) return;
            syncParticipantsRef.current?.(room);
            showToast(`👋 انضم ${p.name || 'مشارك جديد'} إلى الحصة`);
          })
          .on(RoomEvent.ParticipantDisconnected, () => {
            if (!isMounted) return;
            syncParticipantsRef.current?.(room);
          })
          .on(RoomEvent.ActiveSpeakersChanged, (speakers: Participant[]) => {
            if (!isMounted) return;
            setActiveSpeakerId(speakers.length > 0 ? speakers[0].identity : null);
            syncParticipantsRef.current?.(room);
          })
          .on(RoomEvent.TrackSubscribed, (track: RemoteTrack, publication, participant: RemoteParticipant) => {
            if (!isMounted) return;
            if (track.kind === Track.Kind.Audio) {
              const audioElement = track.attach();
              audioElement.id = `audio_${participant.identity}`;
              document.body.appendChild(audioElement);
            }
            if (track.kind === Track.Kind.Video && publication.source === Track.Source.ScreenShare) {
              setScreenTrack(track);
              setIsScreenSharing(true);
              setScreenSharePresenter(participant.name || 'مشارك');
            }
            syncParticipantsRef.current?.(room);
          })
          .on(RoomEvent.TrackUnsubscribed, (track: RemoteTrack, publication, participant: RemoteParticipant) => {
            if (!isMounted) return;
            track.detach();
            const el = document.getElementById(`audio_${participant.identity}`);
            if (el) el.remove();
            if (publication.source === Track.Source.ScreenShare) {
              setScreenTrack(null);
              setIsScreenSharing(false);
              setScreenSharePresenter('');
            }
            syncParticipantsRef.current?.(room);
          })
          .on(RoomEvent.LocalTrackPublished, (publication) => {
            if (!isMounted) return;
            if (publication.source === Track.Source.ScreenShare && publication.track) {
              setScreenTrack(publication.track);
              setIsScreenSharing(true);
              setScreenSharePresenter(profileNameRef.current);
            }
            syncParticipantsRef.current?.(room);
          })
          .on(RoomEvent.LocalTrackUnpublished, (publication) => {
            if (!isMounted) return;
            if (publication.source === Track.Source.ScreenShare) {
              setScreenTrack(null);
              setIsScreenSharing(false);
              setScreenSharePresenter('');
            }
            syncParticipantsRef.current?.(room);
          })
          .on(RoomEvent.TrackMuted, () => syncParticipantsRef.current?.(room))
          .on(RoomEvent.TrackUnmuted, () => syncParticipantsRef.current?.(room))
          .on(RoomEvent.DataReceived, (payload: Uint8Array) => {
            if (!isMounted) return;
            try {
              const text = new TextDecoder().decode(payload);
              const data = JSON.parse(text);
              if (data.type === 'chat') {
                setMessages(prev => [...prev, data.message]);
              } else if (data.type === 'hand_raise') {
                showToast(`✋ ${data.name} يطلب الإذن بالتحدث!`);
              } else if (data.type === 'screen_perm') {
                setAllowStudentScreenShare(!!data.allowed);
                showToast(data.allowed ? '🔓 سمح المشرف للطلاب بمشاركة الشاشة' : '🔒 قفل المشرف مشاركة الشاشة للطلاب');
              } else if (data.type === 'mute_all') {
                if (room.localParticipant.isMicrophoneEnabled) {
                  room.localParticipant.setMicrophoneEnabled(false);
                  setIsMicOn(false);
                  showToast('🔇 قام المشرف بكتم صوت الجميع');
                }
              } else if (data.type === 'class_deleted') {
                showToast('⚠️ قام المشرف بحذف هذه الحصة');
                setTimeout(() => { router.push('/live-classes'); }, 1500);
              } else if (data.type === 'whiteboard_open') {
                setIsWhiteboardActive(true);
                showToast('📋 فتح المشرف السبورة البيضاء التفاعلية');
              } else if (data.type === 'whiteboard_close') {
                setIsWhiteboardActive(false);
                showToast('📋 أغلق المشرف السبورة البيضاء');
              } else if (data.type === 'whiteboard_stroke') {
                // Render remote stroke on whiteboard
                const canvas = whiteboardCanvasRef.current;
                if (canvas && data.stroke?.points?.length > 1) {
                  const ctx = canvas.getContext('2d');
                  if (ctx) {
                    ctx.beginPath();
                    ctx.lineCap = 'round';
                    ctx.lineJoin = 'round';
                    if (data.stroke.tool === 'eraser') {
                      ctx.globalCompositeOperation = 'destination-out';
                      ctx.lineWidth = data.stroke.size * 7;
                      ctx.strokeStyle = 'rgba(0,0,0,1)';
                    } else if (data.stroke.tool === 'highlighter') {
                      ctx.globalCompositeOperation = 'source-over';
                      ctx.lineWidth = data.stroke.size * 4.5;
                      ctx.strokeStyle = data.stroke.color + '55';
                    } else {
                      ctx.globalCompositeOperation = 'source-over';
                      ctx.lineWidth = data.stroke.size;
                      ctx.strokeStyle = data.stroke.color;
                    }
                    const pts = data.stroke.points;
                    ctx.moveTo(pts[0][0], pts[0][1]);
                    for (let i = 1; i < pts.length; i++) {
                      ctx.lineTo(pts[i][0], pts[i][1]);
                    }
                    ctx.stroke();
                    ctx.closePath();
                    ctx.globalCompositeOperation = 'source-over';
                  }
                }
              } else if (data.type === 'whiteboard_clear') {
                const canvas = whiteboardCanvasRef.current;
                if (canvas) {
                  const ctx = canvas.getContext('2d');
                  if (ctx) {
                    ctx.fillStyle = '#ffffff';
                    ctx.fillRect(0, 0, canvas.width, canvas.height);
                  }
                }
                showToast('🧹 مسح المشرف السبورة');
              } else if (data.type === 'file_share') {
                setSharedFile(data.file);
                showToast(`📄 المشرف شارك ملف: ${data.file.name}`);
              } else if (data.type === 'file_close') {
                setSharedFile(null);
                showToast('📄 أغلق المشرف الملف المشارك');
              }
            } catch {}
          });

        // 3. Connect to LiveKit Cloud
        await room.connect(tokenData.serverUrl, tokenData.token);

        // Initial welcome message
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
      } catch (err: any) {
        console.error('LiveKit connection error:', err);
        if (isMounted) {
          setConnectionStatus('disconnected');
          showToast('⚠️ تعذر الاتصال بسيرفر البث — جاري المحاولة مرة أخرى...');
          // Auto-retry after 3 seconds
          setTimeout(() => { if (isMounted) connectToLiveKit(); }, 3000);
        }
      }
    };

    connectToLiveKit();

    return () => {
      isMounted = false;
      if (room) {
        room.disconnect();
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [classData?.id]);

  // Scroll chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // 3. Microphone Toggle & Publish to LiveKit Cloud
  const toggleMic = async () => {
    const room = roomRef.current;
    if (isMicOn) {
      // Turn OFF
      if (room && room.localParticipant) {
        await room.localParticipant.setMicrophoneEnabled(false).catch(() => {});
      }
      setIsMicOn(false);
      showToast('🔇 تم كتم الميكروفون');
    } else {
      // Turn ON
      try {
        if (room && room.localParticipant) {
          await room.localParticipant.setMicrophoneEnabled(true);
        }
        setIsMicOn(true);
        showToast('🎙️ تم تشغيل الميكروفون — صوتك مسموع لجميع الحاضرين');
      } catch (err) {
        alert('تعذر الوصول إلى الميكروفون. يرجى منح الإذن للمتصفح.');
      }
    }
    if (room) syncParticipantsList(room);
  };

  // 4. Camera Toggle & Publish to LiveKit Cloud
  const toggleCamera = async () => {
    const room = roomRef.current;
    if (isCamOn) {
      // Turn OFF
      if (room && room.localParticipant) {
        await room.localParticipant.setCameraEnabled(false).catch(() => {});
      }
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = null;
      }
      setIsCamOn(false);
      showToast('📷 تم إيقاف الكاميرا');
    } else {
      // Turn ON
      try {
        if (room && room.localParticipant) {
          const trackPublication = await room.localParticipant.setCameraEnabled(true);
          if (trackPublication && trackPublication.videoTrack && localVideoRef.current) {
            trackPublication.videoTrack.attach(localVideoRef.current);
          }
        }
        setIsCamOn(true);
        showToast('📹 تم تشغيل الكاميرا بنجاح');
      } catch (err) {
        alert('تعذر فتح الكاميرا. يرجى منح الإذن للمتصفح.');
      }
    }
    if (room) syncParticipantsList(room);
  };

  // 5. Screen Share Toggle & Publish to LiveKit Cloud
  const toggleScreenShare = async () => {
    const room = roomRef.current;
    if (isScreenSharing) {
      if (room && room.localParticipant) {
        await room.localParticipant.setScreenShareEnabled(false).catch(() => {});
      }
      if (screenVideoRef.current) {
        screenVideoRef.current.srcObject = null;
      }
      setScreenTrack(null);
      setIsScreenSharing(false);
      setScreenSharePresenter('');
      showToast('⏹️ تم إيقاف مشاركة الشاشة');
    } else {
      if (!isSupervisorForThisClass && !allowStudentScreenShare) {
        showToast('🔒 مشاركة الشاشة مقفلة حالياً من قبل المشرف. يرجى الاستئذان أولاً.');
        return;
      }
      try {
        if (room && room.localParticipant) {
          const pub = await room.localParticipant.setScreenShareEnabled(true, { audio: true });
          // Track attachment is handled by LocalTrackPublished event + useEffect
          // Just set up the browser's native "stop sharing" detection
          const mediaTrack = pub?.videoTrack?.mediaStreamTrack;
          if (mediaTrack) {
            mediaTrack.onended = () => {
              setScreenTrack(null);
              setIsScreenSharing(false);
              setScreenSharePresenter('');
              if (room.localParticipant) {
                room.localParticipant.setScreenShareEnabled(false).catch(() => {});
              }
            };
          }
          // Set presenter name (state will be set by LocalTrackPublished event)
          if (pub?.videoTrack) {
            setScreenTrack(pub.videoTrack);
            setIsScreenSharing(true);
            setScreenSharePresenter(profile?.displayName || user?.displayName || (isSupervisorForThisClass ? 'المشرف' : 'طالب'));
          }
        }
        showToast('🖥️ جاري مشاركة الشاشة والعرض الآن لجميع الحاضرين');
      } catch (err) {
        console.warn('Screen share cancelled:', err);
      }
    }
  };

  // Supervisor Screen Share Permission Toggle
  const toggleStudentScreenPermission = () => {
    if (!isSupervisorForThisClass) return;
    const newPerm = !allowStudentScreenShare;
    setAllowStudentScreenShare(newPerm);
    const room = roomRef.current;
    if (room && room.localParticipant) {
      const payload = new TextEncoder().encode(JSON.stringify({
        type: 'screen_perm',
        allowed: newPerm
      }));
      room.localParticipant.publishData(payload, { reliable: true }).catch(() => {});
    }
    showToast(newPerm ? '🔓 تم السماح للطلاب بمشاركة الشاشة' : '🔒 تم قفل مشاركة الشاشة للطلاب');
  };

  // 6. Floating Annotation & Whiteboard Canvas Handlers
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = annotationCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
    const x = (clientX - rect.left) * (canvas.width / rect.width);
    const y = (clientY - rect.top) * (canvas.height / rect.height);

    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };

  const drawOnCanvas = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = annotationCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
    const x = (clientX - rect.left) * (canvas.width / rect.width);
    const y = (clientY - rect.top) * (canvas.height / rect.height);

    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (annotationTool === 'eraser') {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.lineWidth = annotationSize * 7;
      ctx.strokeStyle = 'rgba(0,0,0,1)';
    } else if (annotationTool === 'highlighter') {
      ctx.globalCompositeOperation = 'source-over';
      ctx.lineWidth = annotationSize * 4.5;
      ctx.strokeStyle = annotationColor + '55'; // ~35% opacity highlighter
    } else {
      ctx.globalCompositeOperation = 'source-over';
      ctx.lineWidth = annotationSize;
      ctx.strokeStyle = annotationColor;
    }

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    const canvas = annotationCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (ctx) ctx.closePath();
    setIsDrawing(false);
  };

  const clearAnnotationCanvas = () => {
    const canvas = annotationCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    showToast('🧹 تم مسح كل الرسومات والتحديدات');
  };

  // ========== DRAGGABLE TOOLBAR HANDLERS ==========
  const handleToolbarMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    isDraggingToolbar.current = true;
    dragOffset.current = { x: e.clientX - toolbarPos.x, y: e.clientY - toolbarPos.y };
  };
  const handleToolbarMouseMove = useCallback((e: MouseEvent) => {
    if (!isDraggingToolbar.current) return;
    setToolbarPos({ x: e.clientX - dragOffset.current.x, y: e.clientY - dragOffset.current.y });
  }, []);
  const handleToolbarMouseUp = useCallback(() => { isDraggingToolbar.current = false; }, []);
  useEffect(() => {
    window.addEventListener('mousemove', handleToolbarMouseMove);
    window.addEventListener('mouseup', handleToolbarMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleToolbarMouseMove);
      window.removeEventListener('mouseup', handleToolbarMouseUp);
    };
  }, [handleToolbarMouseMove, handleToolbarMouseUp]);

  // ========== INTERACTIVE WHITEBOARD HANDLERS (سبورة بيضاء تفاعلية) ==========
  const openWhiteboard = () => {
    setIsWhiteboardActive(true);
    // Init canvas with white background
    setTimeout(() => {
      const canvas = whiteboardCanvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) { ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, canvas.width, canvas.height); }
      }
    }, 50);
    const room = roomRef.current;
    if (room?.localParticipant) {
      const payload = new TextEncoder().encode(JSON.stringify({ type: 'whiteboard_open' }));
      room.localParticipant.publishData(payload, { reliable: true }).catch(() => {});
    }
    showToast('📋 تم فتح السبورة البيضاء — يمكنك الشرح والرسم الآن');
  };

  const closeWhiteboard = () => {
    setIsWhiteboardActive(false);
    const room = roomRef.current;
    if (room?.localParticipant) {
      const payload = new TextEncoder().encode(JSON.stringify({ type: 'whiteboard_close' }));
      room.localParticipant.publishData(payload, { reliable: true }).catch(() => {});
    }
    showToast('📋 تم إغلاق السبورة البيضاء');
  };

  const startWbDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isSupervisorForThisClass) return;
    const canvas = whiteboardCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
    const x = (clientX - rect.left) * (canvas.width / rect.width);
    const y = (clientY - rect.top) * (canvas.height / rect.height);
    ctx.beginPath();
    ctx.moveTo(x, y);
    wbLastPoint.current = { x, y };
    setIsWbDrawing(true);
  };

  const drawOnWhiteboard = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isWbDrawing || !isSupervisorForThisClass) return;
    const canvas = whiteboardCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
    const x = (clientX - rect.left) * (canvas.width / rect.width);
    const y = (clientY - rect.top) * (canvas.height / rect.height);
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    if (wbTool === 'eraser') {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.lineWidth = wbSize * 7; ctx.strokeStyle = 'rgba(0,0,0,1)';
    } else if (wbTool === 'highlighter') {
      ctx.globalCompositeOperation = 'source-over';
      ctx.lineWidth = wbSize * 4.5; ctx.strokeStyle = wbColor + '55';
    } else {
      ctx.globalCompositeOperation = 'source-over';
      ctx.lineWidth = wbSize; ctx.strokeStyle = wbColor;
    }
    ctx.lineTo(x, y);
    ctx.stroke();
    // Broadcast stroke segment in real-time
    const room = roomRef.current;
    if (room?.localParticipant && wbLastPoint.current) {
      const payload = new TextEncoder().encode(JSON.stringify({
        type: 'whiteboard_stroke',
        stroke: { tool: wbTool, color: wbColor, size: wbSize, points: [[wbLastPoint.current.x, wbLastPoint.current.y], [x, y]] }
      }));
      room.localParticipant.publishData(payload, { reliable: false }).catch(() => {});
    }
    wbLastPoint.current = { x, y };
  };

  const stopWbDrawing = () => {
    if (!isWbDrawing) return;
    const canvas = whiteboardCanvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) { ctx.closePath(); ctx.globalCompositeOperation = 'source-over'; }
    }
    wbLastPoint.current = null;
    setIsWbDrawing(false);
  };

  const clearWhiteboard = () => {
    const canvas = whiteboardCanvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) { ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, canvas.width, canvas.height); }
    }
    const room = roomRef.current;
    if (room?.localParticipant) {
      const payload = new TextEncoder().encode(JSON.stringify({ type: 'whiteboard_clear' }));
      room.localParticipant.publishData(payload, { reliable: true }).catch(() => {});
    }
    showToast('🧹 تم مسح السبورة البيضاء');
  };

  // ========== FILE SHARING HANDLERS (مشاركة ملف - PDF / صورة / عرض) ==========
  const handleFileShare = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // Limit file size to 10MB
    if (file.size > 10 * 1024 * 1024) {
      showToast('⚠️ حجم الملف كبير جداً — الحد الأقصى 10 ميجابايت');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const url = reader.result as string;
      const fileInfo = { name: file.name, type: file.type, url };
      setSharedFile(fileInfo);
      const room = roomRef.current;
      if (room?.localParticipant) {
        const payload = new TextEncoder().encode(JSON.stringify({ type: 'file_share', file: fileInfo }));
        room.localParticipant.publishData(payload, { reliable: true }).catch(() => {});
      }
      showToast(`📄 تم مشاركة الملف: ${file.name}`);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const closeFileShare = () => {
    setSharedFile(null);
    const room = roomRef.current;
    if (room?.localParticipant) {
      const payload = new TextEncoder().encode(JSON.stringify({ type: 'file_close' }));
      room.localParticipant.publishData(payload, { reliable: true }).catch(() => {});
    }
    showToast('📄 تم إغلاق الملف المشارك');
  };

  // 7. Student Raise Hand Broadcast
  const toggleRaiseHand = () => {
    const room = roomRef.current;
    const newState = !isHandRaised;
    setIsHandRaised(newState);

    if (newState) {
      showToast('✋ تم رفع اليد لطلب الكلمة من المشرف');
      if (room && room.localParticipant) {
        const payload = new TextEncoder().encode(JSON.stringify({
          type: 'hand_raise',
          name: profile?.displayName || user?.displayName || 'طالب'
        }));
        room.localParticipant.publishData(payload, { reliable: true }).catch(() => {});
      }
    }
  };

  // 8. RECORDING ENGINE (تسجيل الحصة وحفظ الفيديو مباشرة على جهاز المشرف)
  const startRecording = async () => {
    try {
      let recordingStream: MediaStream | null = null;

      if (isScreenSharing && screenVideoRef.current && (screenVideoRef.current.srcObject as MediaStream)) {
        recordingStream = screenVideoRef.current.srcObject as MediaStream;
      } else if (localVideoRef.current && (localVideoRef.current.srcObject as MediaStream)) {
        recordingStream = localVideoRef.current.srcObject as MediaStream;
      }

      if (!recordingStream) {
        recordingStream = await navigator.mediaDevices.getDisplayMedia({
          video: { displaySurface: 'browser' } as any,
          audio: true
        });
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

      recorder.start(1000);
      setIsRecording(true);
      setRecordingTime(0);

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

  // 8. Cross-Device Real-Time Chat Handler
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const room = roomRef.current;
    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      senderId: user?.uid || 'guest',
      senderName: profile?.displayName || user?.displayName || (isSupervisorForThisClass ? 'المشرف' : 'طالب'),
      senderRole: (isSuperAdmin ? 'SUPER_ADMIN' : isCountrySupervisor ? 'COUNTRY_SUPERVISOR' : 'STUDENT'),
      text: inputText.trim(),
      timestamp: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
      country: userCountry
    };

    setMessages(prev => [...prev, newMsg]);
    setInputText('');

    // Broadcast message via LiveKit Data Channel across all devices instantly
    if (room && room.localParticipant) {
      const payload = new TextEncoder().encode(JSON.stringify({
        type: 'chat',
        message: newMsg
      }));
      room.localParticipant.publishData(payload, { reliable: true }).catch(() => {});
    }
  };

  // 9. Supervisor: Mute All Students Broadcast
  const handleMuteAll = () => {
    if (!isSupervisorForThisClass) return;
    const room = roomRef.current;

    const sysMsg: ChatMessage = {
      id: `sys-${Date.now()}`,
      senderId: 'system',
      senderName: 'المشرف',
      senderRole: 'COUNTRY_SUPERVISOR',
      text: '🔇 قام المشرف بكتم صوت جميع الطلاب للحفاظ على هدوء الشرح.',
      timestamp: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, sysMsg]);

    if (room && room.localParticipant) {
      const payload = new TextEncoder().encode(JSON.stringify({ type: 'mute_all' }));
      room.localParticipant.publishData(payload, { reliable: true }).catch(() => {});
    }
    showToast('🔇 تم كتم صوت جميع الحاضرين في الغرفة');
  };

  // 10. Supervisor: End Class
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
    showToast('✅ تم نسخ رابط الحصة المباشرة!');
    setTimeout(() => setCopiedLink(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center space-y-4" dir="rtl">
        <Radio className="w-12 h-12 text-emerald-400 animate-pulse" />
        <p className="text-slate-300 font-semibold text-lg">جاري الاتصال بالغرفة الافتراضية والسيرفر السحابي LiveKit...</p>
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
      {/* Floating Toast Notification */}
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
          {/* LiveKit Connection Indicator */}
          <div className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-800/60 border border-slate-700 text-[11px]">
            <span className={`w-2 h-2 rounded-full ${connectionStatus === 'connected' ? 'bg-emerald-500' : 'bg-amber-500 animate-ping'}`}></span>
            <span className="text-slate-300">سيرفر LiveKit السحابي</span>
          </div>

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

          {/* Layout Mode Toggle: Grid / Stage */}
          <button
            onClick={() => setViewMode(prev => prev === 'gallery' ? 'speaker' : 'gallery')}
            className="p-2 sm:px-3 sm:py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-colors border border-slate-700"
            title={viewMode === 'gallery' ? 'التبديل إلى وضع المنصة الرئيسية' : 'التبديل إلى شبكة المشتركين (زووم)'}
          >
            <LayoutGrid className="w-4 h-4 text-emerald-400" />
            <span className="hidden sm:inline">{viewMode === 'gallery' ? 'عرض المنصة' : 'شبكة المشتركين'}</span>
          </button>

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

      {/* Main Workspace (Zoom / Google Meet Style Gallery & Stage) */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
        {/* VIDEO & PRESENTATION STAGE */}
        <div className="flex-1 bg-slate-950 flex flex-col justify-between p-3 sm:p-5 relative overflow-hidden">
          {/* Main Visual Stage / Zoom-Style Multi-Participant Grid */}
          <div className="flex-1 bg-slate-900/90 rounded-3xl border border-slate-800/80 relative overflow-hidden flex flex-col p-3 shadow-inner group">
            {/* 0. WHITEBOARD MODE (takes priority) */}
            {isWhiteboardActive ? (
              <div className="relative w-full h-full flex items-center justify-center bg-white rounded-2xl overflow-hidden">
                <canvas
                  ref={whiteboardCanvasRef}
                  width={1920}
                  height={1080}
                  onMouseDown={startWbDrawing}
                  onMouseMove={drawOnWhiteboard}
                  onMouseUp={stopWbDrawing}
                  onMouseLeave={stopWbDrawing}
                  onTouchStart={startWbDrawing}
                  onTouchMove={drawOnWhiteboard}
                  onTouchEnd={stopWbDrawing}
                  className={`w-full h-full ${isSupervisorForThisClass ? 'cursor-crosshair' : 'cursor-default'}`}
                  style={{ touchAction: 'none' }}
                />
                {/* Whiteboard Badge */}
                <div className="absolute top-3 right-3 z-20 flex items-center gap-2 bg-slate-950/85 backdrop-blur-md px-3 py-1.5 rounded-xl border border-purple-500/40 text-xs font-bold text-purple-300 shadow-xl">
                  <BookOpen className="w-3.5 h-3.5 text-purple-400 animate-pulse" />
                  <span>السبورة البيضاء التفاعلية</span>
                </div>
                {/* Whiteboard Toolbar (supervisor only) */}
                {isSupervisorForThisClass && (
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-40 bg-slate-900/96 border border-slate-700/90 rounded-2xl p-2.5 shadow-2xl backdrop-blur-xl flex flex-wrap items-center gap-2 animate-fade-in">
                    <div className="flex items-center bg-slate-950/80 p-1 rounded-xl border border-slate-800 gap-1">
                      <button onClick={() => setWbTool('pen')} className={`px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${wbTool === 'pen' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}><PenTool className="w-3.5 h-3.5" /><span className="hidden sm:inline">قلم</span></button>
                      <button onClick={() => setWbTool('highlighter')} className={`px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${wbTool === 'highlighter' ? 'bg-amber-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}><Paintbrush className="w-3.5 h-3.5" /><span className="hidden sm:inline">فرشاة</span></button>
                      <button onClick={() => setWbTool('eraser')} className={`px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${wbTool === 'eraser' ? 'bg-red-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}><Eraser className="w-3.5 h-3.5" /><span className="hidden sm:inline">ممحاة</span></button>
                    </div>
                    {wbTool !== 'eraser' && (
                      <div className="flex items-center gap-1.5 bg-slate-950/80 px-2.5 py-1.5 rounded-xl border border-slate-800">
                        {['#ef4444','#eab308','#10b981','#38bdf8','#f97316','#1e293b','#8b5cf6'].map(c => (
                          <button key={c} onClick={() => setWbColor(c)} className={`w-5 h-5 rounded-full transition-transform border ${wbColor === c ? 'scale-125 ring-2 ring-white border-white' : 'border-slate-700 hover:scale-110'}`} style={{ backgroundColor: c }} />
                        ))}
                      </div>
                    )}
                    <div className="flex items-center gap-1 bg-slate-950/80 px-2 py-1.5 rounded-xl border border-slate-800">
                      {[{size:3,label:'رفيع'},{size:6,label:'متوسط'},{size:12,label:'عريض'}].map(s => (
                        <button key={s.size} onClick={() => setWbSize(s.size)} className={`px-2 py-1 rounded-md text-[11px] font-bold transition-all ${wbSize === s.size ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-slate-200'}`}>{s.label}</button>
                      ))}
                    </div>
                    <button onClick={clearWhiteboard} className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-bold flex items-center gap-1"><Trash2 className="w-3.5 h-3.5" /><span className="hidden md:inline">مسح</span></button>
                    <button onClick={closeWhiteboard} className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300"><X className="w-4 h-4" /></button>
                  </div>
                )}
              </div>
            ) : sharedFile ? (
              /* FILE VIEWER MODE */
              <div className="relative w-full h-full flex items-center justify-center bg-slate-950 rounded-2xl overflow-hidden">
                {sharedFile.type.startsWith('image/') ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={sharedFile.url} alt={sharedFile.name} className="max-w-full max-h-full object-contain" />
                ) : sharedFile.type === 'application/pdf' ? (
                  <iframe src={sharedFile.url} className="w-full h-full border-0 rounded-2xl" title={sharedFile.name} />
                ) : (
                  <div className="text-center p-8 space-y-4">
                    <FileText className="w-16 h-16 text-slate-400 mx-auto" />
                    <p className="text-slate-300 font-bold text-lg">{sharedFile.name}</p>
                    <a href={sharedFile.url} download={sharedFile.name} className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-sm font-bold"><Download className="w-4 h-4" />تحميل الملف</a>
                  </div>
                )}
                <div className="absolute top-3 right-3 z-20 flex items-center gap-2 bg-slate-950/85 backdrop-blur-md px-3 py-1.5 rounded-xl border border-teal-500/40 text-xs font-bold text-teal-300 shadow-xl">
                  <FileText className="w-3.5 h-3.5 text-teal-400" />
                  <span>ملف مشارك: {sharedFile.name}</span>
                </div>
                {isSupervisorForThisClass && (
                  <button onClick={closeFileShare} className="absolute top-3 left-3 z-20 p-2 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/30" title="إغلاق الملف"><X className="w-4 h-4" /></button>
                )}
              </div>
            ) : isScreenSharing ? (
              <div className="relative w-full h-full flex items-center justify-center bg-black rounded-2xl overflow-hidden">
                <video
                  ref={screenVideoRef}
                  autoPlay
                  playsInline
                  className="w-full h-full object-contain"
                />

                {/* Presenter Name Badge */}
                <div className="absolute top-3 right-3 z-20 flex items-center gap-2 bg-slate-950/85 backdrop-blur-md px-3 py-1.5 rounded-xl border border-blue-500/40 text-xs font-bold text-blue-300 shadow-xl">
                  <MonitorUp className="w-3.5 h-3.5 text-blue-400 animate-pulse" />
                  <span>مشاركة الشاشة: <strong className="text-white">{screenSharePresenter || 'أحد الحاضرين'}</strong></span>
                </div>

                {/* PiP Local Video */}
                {isCamOn && (
                  <div className="absolute bottom-4 right-4 w-44 h-28 bg-slate-950 rounded-2xl border-2 border-emerald-500/80 overflow-hidden shadow-2xl z-20">
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
            ) : viewMode === 'gallery' ? (
              /* 2. ZOOM / MEET MULTI-PARTICIPANT DYNAMIC GALLERY GRID */
              <div className="w-full h-full flex flex-col justify-center overflow-y-auto">
                <div
                  className={`w-full h-full grid gap-3 p-1 sm:p-2 ${
                    participants.length <= 1
                      ? 'grid-cols-1'
                      : participants.length === 2
                      ? 'grid-cols-1 md:grid-cols-2'
                      : participants.length <= 4
                      ? 'grid-cols-1 sm:grid-cols-2'
                      : participants.length <= 6
                      ? 'grid-cols-2 sm:grid-cols-3'
                      : 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4'
                  }`}
                >
                  {participants.map((p) => (
                    <ParticipantTile
                      key={p.identity}
                      participantInfo={p}
                      isActiveSpeaker={activeSpeakerId === p.identity}
                    />
                  ))}
                </div>
              </div>
            ) : (
              /* 3. SPEAKER / STAGE MODE (Zoom Focus View) */
              <div className="relative w-full h-full flex items-center justify-center rounded-2xl overflow-hidden bg-slate-950">
                {isCamOn ? (
                  <video
                    ref={localVideoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />
                ) : (
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

                {/* Floating Attendee Tiles in Speaker Mode */}
                <div className="absolute top-4 right-4 flex items-center gap-2 max-w-md overflow-x-auto z-10">
                  {participants.map((p, idx) => (
                    <div
                      key={idx}
                      className={`w-28 h-20 rounded-2xl bg-slate-950/90 border flex flex-col items-center justify-center relative overflow-hidden shadow-xl transition-all ${
                        activeSpeakerId === p.identity ? 'border-emerald-400 ring-2 ring-emerald-400/50 scale-105' : 'border-slate-800'
                      }`}
                    >
                      <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-200">
                        {p.name.charAt(0)}
                      </div>
                      <span className="text-[10px] text-slate-300 font-semibold truncate max-w-[90px] mt-1 px-1">
                        {p.name}
                      </span>
                      <div className="absolute top-1.5 left-1.5">
                        {p.isAudioOn ? (
                          <Volume2 className="w-3 h-3 text-emerald-400 animate-pulse" />
                        ) : (
                          <MicOff className="w-3 h-3 text-red-400" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* INTERACTIVE WHITEBOARD / ANNOTATION CANVAS OVERLAY */}
            <canvas
              ref={annotationCanvasRef}
              onMouseDown={startDrawing}
              onMouseMove={drawOnCanvas}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onTouchStart={startDrawing}
              onTouchMove={drawOnCanvas}
              onTouchEnd={stopDrawing}
              className={`absolute inset-0 w-full h-full z-30 transition-all ${
                isAnnotationOpen ? 'cursor-crosshair pointer-events-auto' : 'pointer-events-none'
              }`}
            />

            {/* FLOATING ANNOTATION TOOLBAR — DRAGGABLE (قلم عائم قابل للسحب في كل مكان) */}
            {isAnnotationOpen && (
              <div
                className="fixed z-50 bg-slate-900/97 border border-slate-700/90 rounded-2xl p-2.5 shadow-2xl backdrop-blur-xl flex flex-wrap items-center gap-2 max-w-[95vw] animate-fade-in select-none"
                style={{ left: toolbarPos.x, top: toolbarPos.y, cursor: isDraggingToolbar.current ? 'grabbing' : 'default' }}
              >
                {/* Drag Handle */}
                <div
                  onMouseDown={handleToolbarMouseDown}
                  className="cursor-grab active:cursor-grabbing p-1 rounded-lg hover:bg-slate-800 text-slate-500 hover:text-slate-300 transition-colors"
                  title="اسحب لتحريك الشريط"
                >
                  <GripHorizontal className="w-4 h-4" />
                </div>
                {/* Tool Selection */}
                <div className="flex items-center bg-slate-950/80 p-1 rounded-xl border border-slate-800 gap-1">
                  <button
                    onClick={() => setAnnotationTool('pen')}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                      annotationTool === 'pen'
                        ? 'bg-emerald-600 text-white shadow-md'
                        : 'text-slate-400 hover:text-white'
                    }`}
                    title="قلم للكتابة الدقيقة"
                  >
                    <PenTool className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">قلم</span>
                  </button>

                  <button
                    onClick={() => setAnnotationTool('highlighter')}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                      annotationTool === 'highlighter'
                        ? 'bg-amber-600 text-white shadow-md'
                        : 'text-slate-400 hover:text-white'
                    }`}
                    title="فرشاة تظليل وتحديد شبه شفافة"
                  >
                    <Paintbrush className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">فرشاة تظليل</span>
                  </button>

                  <button
                    onClick={() => setAnnotationTool('eraser')}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                      annotationTool === 'eraser'
                        ? 'bg-red-600 text-white shadow-md'
                        : 'text-slate-400 hover:text-white'
                    }`}
                    title="ممحاة لمسح جزء من الرسم"
                  >
                    <Eraser className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">ممحاة</span>
                  </button>
                </div>

                {/* Color Palette */}
                {annotationTool !== 'eraser' && (
                  <div className="flex items-center gap-1.5 bg-slate-950/80 px-2.5 py-1.5 rounded-xl border border-slate-800">
                    {[
                      { color: '#ef4444', label: 'أحمر' },
                      { color: '#eab308', label: 'أصفر' },
                      { color: '#10b981', label: 'أخضر' },
                      { color: '#38bdf8', label: 'سماوي' },
                      { color: '#f97316', label: 'برتقالي' },
                      { color: '#ffffff', label: 'أبيض' },
                      { color: '#000000', label: 'أسود' }
                    ].map((c) => (
                      <button
                        key={c.color}
                        onClick={() => setAnnotationColor(c.color)}
                        className={`w-5 h-5 rounded-full transition-transform border ${
                          annotationColor === c.color ? 'scale-125 ring-2 ring-white border-white' : 'border-slate-700 hover:scale-110'
                        }`}
                        style={{ backgroundColor: c.color }}
                        title={c.label}
                      />
                    ))}
                  </div>
                )}

                {/* Stroke Sizes */}
                <div className="flex items-center gap-1 bg-slate-950/80 px-2 py-1.5 rounded-xl border border-slate-800">
                  {[
                    { size: 3, label: 'رفيع' },
                    { size: 6, label: 'متوسط' },
                    { size: 12, label: 'عريض' }
                  ].map((s) => (
                    <button
                      key={s.size}
                      onClick={() => setAnnotationSize(s.size)}
                      className={`px-2 py-1 rounded-md text-[11px] font-bold transition-all ${
                        annotationSize === s.size ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>

                {/* Clear All */}
                <button
                  onClick={clearAnnotationCanvas}
                  className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-bold flex items-center gap-1 transition-all"
                  title="مسح كل الرسومات"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span className="hidden md:inline">مسح الكل</span>
                </button>

                {/* Close Toolbar */}
                <button
                  onClick={() => setIsAnnotationOpen(false)}
                  className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                  title="إغلاق شريط أدوات الرسم"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Top Left Attendees Badge */}
            <div className="absolute top-4 left-4 flex items-center gap-2 z-20">
              <span className="px-3 py-1 rounded-xl bg-slate-950/85 backdrop-blur-md text-xs font-bold text-slate-200 border border-slate-700/80 flex items-center gap-1.5 shadow-lg">
                <Users className="w-3.5 h-3.5 text-emerald-400" />
                <span>{participants.length} حاضر متصل</span>
              </span>
              {isHandRaised && (
                <span className="px-3 py-1 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs flex items-center gap-1 animate-bounce shadow-lg">
                  <Hand className="w-3.5 h-3.5 fill-current" />
                  <span>طالب يطلب الكلمة!</span>
                </span>
              )}
            </div>
          </div>

          {/* BOTTOM CONTROLS BAR */}
          <div className="mt-3 bg-slate-900/95 border border-slate-800/80 rounded-2xl p-2.5 sm:p-3 flex items-center justify-between gap-2 backdrop-blur-xl shadow-2xl overflow-x-auto scrollbar-none">
            {/* Left Controls: Media Actions */}
            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              {/* Mic Button */}
              <button
                onClick={toggleMic}
                className={`p-2.5 sm:p-3 rounded-2xl font-bold text-xs flex items-center gap-1.5 sm:gap-2 shrink-0 transition-all ${
                  isMicOn
                    ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/20'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                }`}
                title={isMicOn ? 'كتم الميكروفون' : 'تشغيل الميكروفون والتحدث'}
              >
                {isMicOn ? <Mic className="w-4 h-4 sm:w-5 sm:h-5 text-white" /> : <MicOff className="w-4 h-4 sm:w-5 sm:h-5 text-red-400" />}
                <span className="text-[11px] sm:text-xs">{isMicOn ? 'المايك يعمل' : 'المايك مكتوم'}</span>
              </button>

              {/* Camera Button */}
              <button
                onClick={toggleCamera}
                className={`p-2.5 sm:p-3 rounded-2xl font-bold text-xs flex items-center gap-1.5 sm:gap-2 shrink-0 transition-all ${
                  isCamOn
                    ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/20'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                }`}
                title={isCamOn ? 'إيقاف الكاميرا' : 'تشغيل الكاميرا'}
              >
                {isCamOn ? <VideoIcon className="w-4 h-4 sm:w-5 sm:h-5" /> : <VideoOff className="w-4 h-4 sm:w-5 sm:h-5 text-red-400" />}
                <span className="text-[11px] sm:text-xs">{isCamOn ? 'الكاميرا تعمل' : 'الكاميرا مغلقة'}</span>
              </button>

              {/* Screen Share Button (Available for all, with supervisor permission check) */}
              <button
                onClick={toggleScreenShare}
                className={`p-2.5 sm:p-3 rounded-2xl font-bold text-xs flex items-center gap-1.5 sm:gap-2 shrink-0 transition-all ${
                  isScreenSharing
                    ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/20'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                }`}
                title={
                  isScreenSharing
                    ? 'إيقاف مشاركة الشاشة'
                    : !isSupervisorForThisClass && !allowStudentScreenShare
                    ? 'مشاركة الشاشة مقفلة من قبل المشرف'
                    : 'مشاركة الشاشة أو العرض التقديمي'
                }
              >
                <MonitorUp className="w-4 h-4 sm:w-5 sm:h-5 text-sky-400" />
                <span className="text-[11px] sm:text-xs">{isScreenSharing ? 'إيقاف المشاركة' : 'مشاركة الشاشة'}</span>
                {!isSupervisorForThisClass && !allowStudentScreenShare && (
                  <Lock className="w-3 h-3 text-amber-400 inline" />
                )}
              </button>

              {/* Whiteboard / Annotation Pen Tool Toggle Button */}
              <button
                onClick={() => {
                  const next = !isAnnotationOpen;
                  setIsAnnotationOpen(next);
                  if (next && annotationCanvasRef.current) {
                    const canvas = annotationCanvasRef.current;
                    const parent = canvas.parentElement;
                    if (parent) {
                      canvas.width = parent.clientWidth;
                      canvas.height = parent.clientHeight;
                    }
                  }
                }}
                className={`p-2.5 sm:p-3 rounded-2xl font-bold text-xs flex items-center gap-1.5 sm:gap-2 shrink-0 transition-all ${
                  isAnnotationOpen
                    ? 'bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-500/20 ring-2 ring-purple-400/50'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                }`}
                title={isAnnotationOpen ? 'إخفاء لوحة الرسم' : 'فتح القلم العائم وأدوات الرسم والتحديد'}
              >
                <PenTool className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400" />
                <span className="text-[11px] sm:text-xs">{isAnnotationOpen ? 'إخفاء القلم' : 'قلم ورسم'}</span>
              </button>

              {/* Student Screen Share Permission Control (Supervisor Only) */}
              {isSupervisorForThisClass && (
                <button
                  onClick={toggleStudentScreenPermission}
                  className={`p-2.5 sm:px-3 sm:py-2.5 rounded-2xl text-xs font-bold flex items-center gap-1.5 shrink-0 transition-all border ${
                    allowStudentScreenShare
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/20'
                      : 'bg-amber-500/10 border-amber-500/30 text-amber-300 hover:bg-amber-500/20'
                  }`}
                  title={allowStudentScreenShare ? 'الطلاب مسموح لهم بمشاركة الشاشة (اضغط للقفل)' : 'مشاركة الشاشة مقفلة للطلاب (اضغط للسماح)'}
                >
                  {allowStudentScreenShare ? <Unlock className="w-4 h-4 text-emerald-400" /> : <Lock className="w-4 h-4 text-amber-400" />}
                  <span className="text-[11px] sm:text-xs hidden sm:inline">{allowStudentScreenShare ? 'مشاركة الطلاب مفعلة' : 'مشاركة الطلاب مقفلة'}</span>
                </button>
              )}

              {/* Whiteboard Button (Supervisor Only) */}
              {isSupervisorForThisClass && (
                <button
                  onClick={() => isWhiteboardActive ? closeWhiteboard() : openWhiteboard()}
                  className={`p-2.5 sm:p-3 rounded-2xl font-bold text-xs flex items-center gap-1.5 sm:gap-2 shrink-0 transition-all ${
                    isWhiteboardActive
                      ? 'bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-500/20 ring-2 ring-purple-400/50'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                  }`}
                  title={isWhiteboardActive ? 'إغلاق السبورة البيضاء' : 'فتح السبورة البيضاء التفاعلية للشرح'}
                >
                  <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400" />
                  <span className="text-[11px] sm:text-xs">{isWhiteboardActive ? 'إغلاق السبورة' : 'سبورة بيضاء'}</span>
                </button>
              )}

              {/* File Share Button (Supervisor Only) */}
              {isSupervisorForThisClass && (
                <>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*,.pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.mp4,.mov"
                    onChange={handleFileShare}
                    className="hidden"
                  />
                  <button
                    onClick={() => sharedFile ? closeFileShare() : fileInputRef.current?.click()}
                    className={`p-2.5 sm:p-3 rounded-2xl font-bold text-xs flex items-center gap-1.5 sm:gap-2 shrink-0 transition-all ${
                      sharedFile
                        ? 'bg-teal-600 hover:bg-teal-500 text-white shadow-lg shadow-teal-500/20 ring-2 ring-teal-400/50'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                    }`}
                    title={sharedFile ? 'إغلاق الملف المشارك' : 'مشاركة ملف (PDF / صورة / عرض تقديمي)'}
                  >
                    <Upload className="w-4 h-4 sm:w-5 sm:h-5 text-teal-400" />
                    <span className="text-[11px] sm:text-xs">{sharedFile ? 'إغلاق الملف' : 'مشاركة ملف'}</span>
                  </button>
                </>
              )}

              {/* Student Raise Hand Button */}
              {!isSupervisorForThisClass && (
                <button
                  onClick={toggleRaiseHand}
                  className={`p-2.5 sm:p-3 rounded-2xl font-bold text-xs flex items-center gap-1.5 shrink-0 transition-all ${
                    isHandRaised
                      ? 'bg-amber-500 text-slate-950 font-bold'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                  }`}
                  title={isHandRaised ? 'خفض اليد' : 'رفع اليد للاستئذان'}
                >
                  <Hand className="w-4 h-4 sm:w-5 sm:h-5 text-amber-300" />
                  <span className="text-[11px] sm:text-xs">{isHandRaised ? 'اليد مرفوعة' : 'رفع اليد'}</span>
                </button>
              )}
            </div>

            {/* Right Controls: Recording & Supervisor Tools */}
            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              {/* RECORDING BUTTON (حفظ وتسجيل الحصة على الجهاز) */}
              {isSupervisorForThisClass && (
                <>
                  {!isRecording ? (
                    <button
                      onClick={startRecording}
                      className="p-2 sm:px-3 sm:py-2.5 rounded-2xl bg-red-500/10 hover:bg-red-500/20 text-red-300 text-xs font-bold flex items-center gap-1.5 shrink-0 transition-colors border border-red-500/30"
                      title="تسجيل الحصة وحفظ الفيديو على جهازك"
                    >
                      <CircleDot className="w-4 h-4 text-red-500 animate-pulse" />
                      <span className="text-[11px] sm:text-xs">تسجيل</span>
                    </button>
                  ) : (
                    <button
                      onClick={stopRecording}
                      className="p-2 sm:px-3 sm:py-2.5 rounded-2xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold flex items-center gap-1.5 shrink-0 transition-all shadow-lg shadow-red-600/30"
                      title="إيقاف التسجيل وحفظ ملف الفيديو على اللابتوب"
                    >
                      <Square className="w-4 h-4 fill-current" />
                      <span className="text-[11px] sm:text-xs">حفظ ({formatTimer(recordingTime)})</span>
                    </button>
                  )}

                  <button
                    onClick={handleMuteAll}
                    className="p-2 sm:px-3 sm:py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 shrink-0 transition-colors border border-slate-700"
                    title="كتم صوت جميع الطلاب"
                  >
                    <VolumeX className="w-4 h-4 text-amber-400" />
                    <span className="text-[11px] sm:text-xs hidden md:inline">كتم الجميع</span>
                  </button>

                  <button
                    onClick={handleEndClass}
                    className="p-2 sm:px-4 sm:py-2.5 rounded-2xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold flex items-center gap-1.5 shrink-0 transition-all shadow-lg shadow-red-600/20"
                    title="إنهاء الحصة لجميع الحاضرين"
                  >
                    <PhoneOff className="w-4 h-4" />
                    <span className="text-[11px] sm:text-xs">إنهاء الحصة</span>
                  </button>
                </>
              )}

              {!isSupervisorForThisClass && (
                <Link
                  href="/live-classes"
                  className="p-2.5 sm:px-4 sm:py-2.5 rounded-2xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold flex items-center gap-1.5 shrink-0 transition-all shadow-lg shadow-red-600/20"
                  title="مغادرة الحصة"
                >
                  <PhoneOff className="w-4 h-4" />
                  <span className="text-[11px] sm:text-xs">مغادرة</span>
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
                قائمة الحاضرين المتصلين حالياً ({participants.length}):
              </div>
              {participants.map((p, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded-2xl border flex items-center justify-between text-xs transition-all ${
                    activeSpeakerId === p.identity
                      ? 'bg-emerald-950/40 border-emerald-500/50 shadow-md'
                      : 'bg-slate-950/70 border-slate-800'
                  }`}
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
