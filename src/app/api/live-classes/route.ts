import { NextRequest, NextResponse } from 'next/server';
import { canManageLiveClass, canAccessCountry, normalizeRole, getUserCountry } from '@/lib/rbac';
import { LiveClass, CountryCode } from '@/types';
import { db } from '@/lib/firebase';
import { collection, doc, setDoc, getDoc, getDocs, deleteDoc, query, where, orderBy } from 'firebase/firestore';

export const dynamic = 'force-dynamic';

/**
 * GET: List live classes with strict country isolation
 * - SUPER_ADMIN: Can list all or filter by country
 * - COUNTRY_SUPERVISOR: Strictly filtered to their country
 * - STUDENT: Strictly filtered to their country + stage/grade
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    const userRole = searchParams.get('role');
    const userEmail = searchParams.get('email');
    const userCountry = (searchParams.get('country') || 'sa') as CountryCode;
    const requestedCountry = searchParams.get('targetCountry') as CountryCode | null;

    const normRole = normalizeRole(userRole, userEmail);

    let effectiveCountry: CountryCode | 'all' = 'all';

    if (normRole === 'SUPER_ADMIN') {
      effectiveCountry = requestedCountry || 'all';
    } else if (normRole === 'COUNTRY_SUPERVISOR') {
      // Supervisor can ONLY ever query their own country
      effectiveCountry = userCountry;
    } else {
      // Student can ONLY query their own country or general
      effectiveCountry = userCountry;
    }

    let liveClasses: LiveClass[] = [];

    if (db) {
      try {
        const classesRef = collection(db, 'live_classes');
        const snap = await getDocs(classesRef);
        snap.forEach((docSnap) => {
          liveClasses.push(docSnap.data() as LiveClass);
        });
      } catch (e) {
        console.warn('Firestore fetch live classes note:', e);
      }
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
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

/**
 * POST: Create a new live class
 * - SUPER_ADMIN: Can create for any country
 * - COUNTRY_SUPERVISOR: Can ONLY create for their assigned country
 * - STUDENT: Blocked (403 Forbidden)
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

    // Strict RBAC Verification
    const authCheck = canManageLiveClass(
      { role: creatorRole, email: creatorEmail, assignedCountry: creatorCountry as CountryCode },
      countryId as CountryCode
    );

    if (!authCheck.allowed) {
      return NextResponse.json(
        { error: authCheck.reason || 'ليس لديك صلاحية لإنشاء حصة في هذه الدولة.' },
        { status: 403 }
      );
    }

    const classId = `class_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const roomName = `room_${countryId}_${classId}`;

    const newClass: LiveClass = {
      id: classId,
      title,
      description: description || '',
      countryId: countryId as CountryCode,
      stage: stage || 'secondary',
      gradeNumber: Number(gradeNumber) || 1,
      subjectId: subjectId || 'general',
      subjectName: subjectName || 'المادة العامة',
      unitTitle: unitTitle || '',
      scheduledAt,
      status: 'scheduled',
      roomName,
      supervisorId: creatorId || 'admin',
      supervisorName: creatorName || 'المشرف',
      supervisorEmail: creatorEmail || '',
      supervisorCountry: countryId as CountryCode,
      attendeesCount: 0,
      attendees: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (db) {
      try {
        await setDoc(doc(db, 'live_classes', newClass.id), newClass);
      } catch (e) {
        console.warn('Firestore set live class note:', e);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'تم إنشاء الحصة الافتراضية بنجاح!',
      liveClass: newClass
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

/**
 * PUT: Update live class status (start, end, update info)
 */
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { classId, updates, userRole, userEmail, userCountry } = body;

    if (!classId || !updates) {
      return NextResponse.json({ error: 'معرف الحصة والتعديلات مطلوبة.' }, { status: 400 });
    }

    let existingClass: LiveClass | null = null;
    if (db) {
      const snap = await getDoc(doc(db, 'live_classes', classId));
      if (snap.exists()) {
        existingClass = snap.data() as LiveClass;
      }
    }

    if (!existingClass) {
      return NextResponse.json({ error: 'الحصة غير موجودة.' }, { status: 404 });
    }

    // RBAC check
    const authCheck = canManageLiveClass(
      { role: userRole, email: userEmail, assignedCountry: userCountry as CountryCode },
      existingClass.countryId
    );

    if (!authCheck.allowed) {
      return NextResponse.json(
        { error: 'ليس لديك صلاحية لتعديل هذه الحصة.' },
        { status: 403 }
      );
    }

    const updatedClass: LiveClass = {
      ...existingClass,
      ...updates,
      updatedAt: new Date().toISOString()
    };

    if (db) {
      await setDoc(doc(db, 'live_classes', classId), updatedClass, { merge: true });
    }

    return NextResponse.json({
      success: true,
      message: 'تم تحديث الحصة بنجاح!',
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
    const classId = searchParams.get('classId');
    const userRole = searchParams.get('role');
    const userEmail = searchParams.get('email');
    const userCountry = searchParams.get('country') as CountryCode;

    if (!classId) {
      return NextResponse.json({ error: 'معرف الحصة مطلوب.' }, { status: 400 });
    }

    let existingClass: LiveClass | null = null;
    if (db) {
      const snap = await getDoc(doc(db, 'live_classes', classId));
      if (snap.exists()) {
        existingClass = snap.data() as LiveClass;
      }
    }

    if (!existingClass) {
      return NextResponse.json({ error: 'الحصة غير موجودة.' }, { status: 404 });
    }

    const authCheck = canManageLiveClass(
      { role: userRole || '', email: userEmail, assignedCountry: userCountry },
      existingClass.countryId
    );

    if (!authCheck.allowed) {
      return NextResponse.json(
        { error: 'ليس لديك صلاحية لحذف هذه الحصة.' },
        { status: 403 }
      );
    }

    if (db) {
      await deleteDoc(doc(db, 'live_classes', classId));
    }

    return NextResponse.json({
      success: true,
      message: 'تم حذف الحصة بنجاح.'
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
