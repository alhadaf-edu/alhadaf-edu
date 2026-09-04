import { NextRequest, NextResponse } from 'next/server';
import { createLiveKitToken } from '@/lib/livekit';
import { canManageLiveClass, normalizeRole } from '@/lib/rbac';
import { CountryCode } from '@/types';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { 
      roomName, 
      userId, 
      userName, 
      userRole, 
      userEmail, 
      userCountry = 'sa', 
      classCountry = 'sa',
      isHostRequest = false 
    } = body;

    if (!roomName || !userId) {
      return NextResponse.json(
        { error: 'roomName and userId are required' },
        { status: 400 }
      );
    }

    const normRole = normalizeRole(userRole, userEmail);

    // If attempting to join as Host/Supervisor, verify RBAC authorization
    if (isHostRequest) {
      const check = canManageLiveClass(
        { role: normRole, email: userEmail, assignedCountry: userCountry as CountryCode },
        classCountry as CountryCode
      );

      if (!check.allowed) {
        return NextResponse.json(
          { error: check.reason || 'ليس لديك صلاحية لإدارة هذه الحصة المباشرة.' },
          { status: 403 }
        );
      }
    }

    // Generate Token
    const result = await createLiveKitToken({
      roomName,
      userId,
      userName: userName || 'مشارك',
      userRole: normRole,
      userEmail,
      userCountry: userCountry as CountryCode,
      classCountry: classCountry as CountryCode,
    });

    return NextResponse.json(result);
  } catch (err: any) {
    console.error('Error generating LiveKit token:', err);
    return NextResponse.json(
      { error: err.message || 'حدث خطأ أثناء إنشاء تصريح الدخول للغرفة الافتراضية.' },
      { status: 500 }
    );
  }
}
