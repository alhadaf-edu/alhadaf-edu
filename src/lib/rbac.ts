import { UserRole, CountryCode, UserProfile } from '@/types';

export interface RBACContext {
  userId: string;
  userEmail: string;
  userName: string;
  role: UserRole;
  countryId?: CountryCode;
  assignedCountry?: CountryCode;
  gradeNumber?: number;
}

/**
 * Normalizes any legacy or new role name into standard internal roles:
 * - 'SUPER_ADMIN' (المشرف العام)
 * - 'COUNTRY_SUPERVISOR' (مشرف الدولة)
 * - 'STUDENT' (الطالب)
 */
export function normalizeRole(role?: string | null, email?: string | null): 'SUPER_ADMIN' | 'COUNTRY_SUPERVISOR' | 'STUDENT' {
  const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'alhadaafpro@gmail.com';
  if (email && email.toLowerCase() === adminEmail.toLowerCase()) {
    return 'SUPER_ADMIN';
  }

  if (!role) return 'STUDENT';

  const r = role.toLowerCase().trim();
  if (r === 'superadmin' || r === 'super_admin' || r === 'admin') {
    return 'SUPER_ADMIN';
  }
  if (r === 'moderator' || r === 'country_supervisor' || r === 'supervisor' || r === 'teacher') {
    // Note: 'teacher' legacy role is safely migrated to 'COUNTRY_SUPERVISOR'
    return 'COUNTRY_SUPERVISOR';
  }
  return 'STUDENT';
}

/**
 * Gets user country with fallback
 */
export function getUserCountry(profile?: Partial<UserProfile> | null): CountryCode {
  return (profile?.assignedCountry || profile?.countryId || profile?.country || 'sa') as CountryCode;
}

/**
 * Checks if a user has Super Admin authority
 */
export function isSuperAdmin(role?: string | null, email?: string | null): boolean {
  return normalizeRole(role, email) === 'SUPER_ADMIN';
}

/**
 * Checks if a user has Country Supervisor authority
 */
export function isCountrySupervisor(role?: string | null, email?: string | null): boolean {
  return normalizeRole(role, email) === 'COUNTRY_SUPERVISOR';
}

/**
 * Checks if a user is a Student
 */
export function isStudent(role?: string | null, email?: string | null): boolean {
  return normalizeRole(role, email) === 'STUDENT';
}

/**
 * Server & Client permission check:
 * Validates if the user is authorized to perform action on a resource owned by targetCountry
 */
export function canAccessCountry(
  user: { role: UserRole | string; email?: string | null; assignedCountry?: CountryCode; countryId?: CountryCode; country?: CountryCode },
  targetCountry: CountryCode
): boolean {
  const normRole = normalizeRole(user.role, user.email);
  
  // Super admin can access and manage all countries without restriction
  if (normRole === 'SUPER_ADMIN') {
    return true;
  }

  // Country supervisor can only access their assigned country
  if (normRole === 'COUNTRY_SUPERVISOR') {
    const userCountry = getUserCountry(user as any);
    return userCountry === targetCountry;
  }

  // Student can only access their country
  const studentCountry = getUserCountry(user as any);
  return studentCountry === targetCountry || targetCountry === 'general';
}

/**
 * Permission check for creating or modifying live classes
 */
export function canManageLiveClass(
  user: { role: UserRole | string; email?: string | null; assignedCountry?: CountryCode; countryId?: CountryCode; country?: CountryCode },
  classCountry: CountryCode
): { allowed: boolean; reason?: string } {
  const normRole = normalizeRole(user.role, user.email);

  if (normRole === 'STUDENT') {
    return {
      allowed: false,
      reason: 'عذراً، الطلاب لا يملكون صلاحية إنشاء أو تعديل الحصص المباشرة.'
    };
  }

  if (normRole === 'SUPER_ADMIN') {
    return { allowed: true };
  }

  if (normRole === 'COUNTRY_SUPERVISOR') {
    const userCountry = getUserCountry(user as any);
    if (userCountry !== classCountry) {
      return {
        allowed: false,
        reason: `عذراً، لا تملك صلاحية إدارة حصص هذه الدولة (${classCountry.toUpperCase()}). صلاحيتك مقتصرة على دولة (${userCountry.toUpperCase()}).`
      };
    }
    return { allowed: true };
  }

  return { allowed: false, reason: 'غير مصرح لك بتنفيذ هذه العملية.' };
}
