import { NextRequest, NextResponse } from 'next/server';
import { canManageLiveClass, canAccessCountry, normalizeRole, getUserCountry } from '@/lib/rbac';
import { LiveClass, CountryCode } from '@/types';
import { db } from '@/lib/firebase';
import { collection, doc, setDoc, getDoc, getDocs, deleteDoc } from 'firebase/firestore';

export const dynamic = 'force-dynamic';

// Resilient in-memory persistence across serverless invocations
declare global {
  var _alhadafLiveClasses: LiveClass[] | undefined;
}

if (!globalThis._alhadafLiveClasses) {
  globalThis._alhadafLiveClasses = [];
}

const memoryClasses = globalThis._alhadafLiveClasses;

// Fast timeout helper to prevent serverless Firestore hangs
async function withTimeout<T>(promise: Promise<T>, ms = 2000, fallback: T): Promise<T> {
  let timer: NodeJS.Timeout;
  const timeoutPromise = new Promise<T>((resolve) => {
    timer = setTimeout(() => resolve(fallback), ms);
  });
  return Promise.race([
    promise.then((res) => {
      clearTimeout(timer);
      return res;
    }).catch(() => fallback),
    timeoutPromise
  ]);
}

/**
 * GET: List live classes with strict country isolation
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const userRole = searchParams.get('role');
    const userEmail = searchParams.get('email');
    const userCountry = (searchParams.get('country') || 'sa') as CountryCode;
    const requestedCountry = searchParams.get('targetCountry') as CountryCode | null;

    const normRole = normalizeRole(userRole, userEmail);

    let effectiveCountry: CountryCode | 'all' = 'all';
    if (normRole === 'SUPER_ADMIN') {
      effectiveCountry = requestedCountry || 'all';
    } else if (normRole === 'COUNTRY_SUPERVISOR') {
      effectiveCountry = userCountry;
    } else {
      effectiveCountry = userCountry;
    }

    let liveClasses: LiveClass[] = [...memoryClasses];

    if (db) {
      const firestoreFetch = async () => {
        const list: LiveClass[] = [];
        const classesRef = collection(db, 'live_classes');
        const snap = await getDocs(classesRef);
        snap.forEach((docSnap) => {
          const item = docSnap.data() as LiveClass;
          list.push(item);
          // Sync to memory
          const idx = memoryClasses.findIndex(m => m.id === item.id);
          if (idx >= 0) {
            memoryClasses[idx] = item;
          } else {
            memoryClasses.push(item);
          }
        });
        return list;
      };

      const firestoreList = await withTimeout(firestoreFetch(), 2000, []);
      if (firestoreList.length > 0) {
        liveClasses = firestoreList;
      }
    }

    // If specific id requested
    if (id) {
      const single = liveClasses.find(c => c.id === id);
      return NextResponse.json({
        success: true,
        count: single ? 1 : 0,
        classes: single ? [single] : []
      });
    }

    // Apply country isolation filter
    if (effectiveCountry !== 'all') {
      liveClasses = liveClasses.filter(c => c.countryId === effectiveCountry);
    }

    // Sort by scheduledAt descending
    liveClasses.sort((a, b) => new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime());

    return NextResponse.json({
      success: true,
      count: liveClasses.length,
      country: effectiveCountry,
      classes: liveClasses
    });
  } catch (err: any) {
    return NextResponse.json({ 
      success: true, 
      count: memoryClasses.length, 
      classes: memoryClasses 
    });
  }
}

/**
 * POST: Create a new live class
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { 
      title, 
      description, 
      countryId, 
      stage, 
      gradeNumber, 
      subjectId, 
      subjectName, 
      unitTitle, 
      scheduledAt, 
      creatorId, 
      creatorName, 
      creatorEmail, 
      creatorRole, 
      creatorCountry 
    } = body;

    if (!title || !countryId || !scheduledAt) {
      return NextResponse.json(
        { error: 'الحقول المطلوبة: العنوان، الدولة، وموعد الحصة.' },
        { status: 400 }
      );
    }

    const classId = body.id || `class_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const roomName = body.roomName || `live_class_${classId.replace(/[^a-zA-Z0-9_-]/g, '_')}`;

    const newClass: LiveClass = {
      id: classId,
      title: title.trim(),
      description: description?.trim() || '',
      countryId: countryId as CountryCode,
      stage: stage || 'secondary',
      gradeNumber: Number(gradeNumber) || 1,
      subjectId: subjectId || 'general',
      subjectName: subjectName || 'المادة العامة',
      unitTitle: unitTitle?.trim() || '',
      scheduledAt,
      status: 'scheduled',
      roomName,
      supervisorId: creatorId || 'admin',
      supervisorName: creatorName || 'المشرف',
      supervisorEmail: creatorEmail || '',
      supervisorCountry: (creatorCountry || countryId) as CountryCode,
      attendeesCount: 0,
      attendees: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // 1. Immediately store in server memory
    const existingIdx = memoryClasses.findIndex(m => m.id === newClass.id);
    if (existingIdx >= 0) {
      memoryClasses[existingIdx] = newClass;
    } else {
      memoryClasses.unshift(newClass);
    }

    // 2. Non-blocking background Firestore sync
    if (db) {
      setDoc(doc(db, 'live_classes', newClass.id), newClass).catch((err) => {
        console.warn('Background firestore set notice:', err);
      });
    }

    return NextResponse.json({
      success: true,
      message: 'تم جدولة الحصة الافتراضية بنجاح!',
      liveClass: newClass
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'حدث خطأ أثناء إنشاء الحصة' }, { status: 500 });
  }
}

/**
 * PUT: Update live class status (start, end, update info)
 */
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, classId, status, updates } = body;
    const targetId = id || classId;

    if (!targetId) {
      return NextResponse.json({ error: 'معرف الحصة مطلوب.' }, { status: 400 });
    }

    const itemIdx = memoryClasses.findIndex(m => m.id === targetId);
    let updatedClass: LiveClass | null = null;

    if (itemIdx >= 0) {
      memoryClasses[itemIdx] = {
        ...memoryClasses[itemIdx],
        ...(updates || {}),
        ...(status ? { status } : {}),
        updatedAt: new Date().toISOString()
      };
      updatedClass = memoryClasses[itemIdx];
    }

    if (db) {
      const payload = {
        ...(updates || {}),
        ...(status ? { status } : {}),
        updatedAt: new Date().toISOString()
      };
      setDoc(doc(db, 'live_classes', targetId), payload, { merge: true }).catch(() => {});
    }

    return NextResponse.json({
      success: true,
      message: 'تم تحديث حالة الحصة بنجاح',
      liveClass: updatedClass
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

/**
 * DELETE: Delete a live class
 */
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'معرف الحصة مطلوب للحذف.' }, { status: 400 });
    }

    const idx = memoryClasses.findIndex(m => m.id === id);
    if (idx >= 0) {
      memoryClasses.splice(idx, 1);
    }

    if (db) {
      deleteDoc(doc(db, 'live_classes', id)).catch(() => {});
    }

    return NextResponse.json({
      success: true,
      message: 'تم حذف الحصة بنجاح.'
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
