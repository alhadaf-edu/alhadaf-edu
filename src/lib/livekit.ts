import { AccessToken } from 'livekit-server-sdk';
import { UserRole, CountryCode } from '@/types';
import { normalizeRole } from '@/lib/rbac';

export interface GenerateLiveKitTokenParams {
  roomName: string;
  userId: string;
  userName: string;
  userRole: UserRole | string;
  userEmail?: string | null;
  userCountry: CountryCode;
  classCountry: CountryCode;
}

export interface LiveKitTokenResult {
  token: string;
  roomName: string;
  serverUrl: string;
  identity: string;
  name: string;
  role: 'SUPER_ADMIN' | 'COUNTRY_SUPERVISOR' | 'STUDENT';
  canPublish: boolean;
  canSubscribe: boolean;
  canPublishData: boolean;
  isRoomAdmin: boolean;
}

/**
 * Generates an encrypted LiveKit AccessToken strictly enforcing:
 * - SUPER_ADMIN: Full Host permissions across any room
 * - COUNTRY_SUPERVISOR: Host permissions ONLY if classCountry matches supervisor country
 * - STUDENT: Viewer / Participant only (No RoomAdmin, No delete, No mute authority over others)
 */
export async function createLiveKitToken(params: GenerateLiveKitTokenParams): Promise<LiveKitTokenResult> {
  const { roomName, userId, userName, userRole, userEmail, userCountry, classCountry } = params;

  const apiKey = process.env.LIVEKIT_API_KEY || 'APISsmpoBACKaux';
  const apiSecret = process.env.LIVEKIT_API_SECRET || 'jFNf6fGVcw8JrMKZGGO8IYTu62SjNhNIU5e5tlqBe2PD';
  const livekitUrl = process.env.LIVEKIT_URL || process.env.NEXT_PUBLIC_LIVEKIT_URL || 'wss://alhadaf-edu-m3a2lksh.livekit.cloud';

  const normRole = normalizeRole(userRole, userEmail);

  // Determine permissions based on strict RBAC
  let canPublish = false;
  let canSubscribe = true;
  let canPublishData = true;
  let isRoomAdmin = false;

  if (normRole === 'SUPER_ADMIN') {
    canPublish = true;
    canSubscribe = true;
    canPublishData = true;
    isRoomAdmin = true;
  } else if (normRole === 'COUNTRY_SUPERVISOR') {
    // Country supervisor is Host only if class belongs to their country
    if (userCountry === classCountry) {
      canPublish = true;
      canSubscribe = true;
      canPublishData = true;
      isRoomAdmin = true;
    } else {
      // If a supervisor enters another country's room, they enter only as a listener/observer
      canPublish = false;
      canSubscribe = true;
      canPublishData = true;
      isRoomAdmin = false;
    }
  } else {
    // STUDENT: strictly participant
    canPublish = false; // Students can listen & chat; mic can be enabled by host
    canSubscribe = true;
    canPublishData = true;
    isRoomAdmin = false;
  }

  // Create token with LiveKit SDK
  const at = new AccessToken(apiKey, apiSecret, {
    identity: userId || `user_${Date.now()}`,
    name: userName || 'مشارك',
    metadata: JSON.stringify({
      role: normRole,
      country: userCountry,
      classCountry: classCountry,
      email: userEmail || ''
    }),
  });

  at.addGrant({
    roomJoin: true,
    room: roomName,
    canPublish: canPublish,
    canSubscribe: canSubscribe,
    canPublishData: canPublishData,
    roomAdmin: isRoomAdmin,
    roomCreate: isRoomAdmin,
    roomList: isRoomAdmin,
  });

  const token = await at.toJwt();

  return {
    token,
    roomName,
    serverUrl: livekitUrl,
    identity: userId,
    name: userName,
    role: normRole,
    canPublish,
    canSubscribe,
    canPublishData,
    isRoomAdmin,
  };
}
