import type { UserRole } from './rbac-config';

export { getNavItemsForRole, getQuickActionsForRole } from './rbac-config';

export interface UserInfo {
  userId: string;
  email: string;
  role: UserRole;
  is_active: boolean;
  last_login?: string;
  created_at: string;
  assigned_hostel_id?: string;
  technician_id?: string;
  student?: {
    student_id: string;
    reg_no: string;
    first_name: string;
    last_name: string;
  };
  technician?: {
    technician_id: string;
    name: string;
    specialization: string;
    hostel_id?: string;
  };
}

/**
 * Parse the `user` cookie (non-httpOnly, set by server actions).
 * Returns the raw user object or null.
 */
function readUserCookie(): { user_id: string; email: string; role: string } | null {
  if (typeof window === 'undefined') return null;

  const match = document.cookie.match(/(^|;)\s*user\s*=\s*([^;]+)/);
  if (!match) return null;

  try {
    return JSON.parse(decodeURIComponent(match[2]));
  } catch {
    return null;
  }
}

/**
 * Get user role from cookie (client only)
 */
export function getUserRole(): UserRole | null {
  const user = readUserCookie();
  return (user?.role as UserRole) || null;
}

/**
 * Get assigned hostel ID for warden (reads from cookie)
 * Note: The basic user cookie only has user_id/email/role.
 * For hostel assignment, the dashboard page should fetch /auth/warden/my-hostel.
 */
export function getAssignedHostel(): string | null {
  // This info is not in the user cookie; pages should call the API directly.
  return null;
}

/**
 * Get current user info from cookie (client only)
 */
export function getUserInfo(): UserInfo | null {
  const user = readUserCookie();
  if (!user) return null;

  return {
    userId: user.user_id,
    email: user.email,
    role: user.role as UserRole,
    is_active: true,
    created_at: '',
  };
}

/**
 * Clear auth cookies (client-side)
 */
export function clearAuth(): void {
  if (typeof window === 'undefined') return;

  // Clear cookies by setting them to expire in the past
  document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
  document.cookie = 'refresh_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
  document.cookie = 'user=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
}

/**
 * Check if user is authenticated (checks for user cookie)
 */
export function isAuthenticated(): boolean {
  return readUserCookie() !== null;
}
