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

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
  user?: {
    user_id: string;
    email: string;
    role: string;
  };
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
const TOKEN_KEY = 'dormflow_access_token';
const REFRESH_TOKEN_KEY = 'dormflow_refresh_token';
const USER_KEY = 'dormflow_user';

/**
 * Get user role from stored data
 */
export function getUserRole(): UserRole | null {
  if (typeof window === 'undefined') return null;

  try {
    const userData = localStorage.getItem(USER_KEY);
    if (!userData) return null;

    const user = JSON.parse(userData) as UserInfo;
    return user.role;
  } catch (error) {
    console.error('Error getting user role:', error);
    return null;
  }
}

/**
 * Get assigned hostel ID for warden
 */
export function getAssignedHostel(): string | null {
  if (typeof window === 'undefined') return null;

  try {
    const userData = localStorage.getItem(USER_KEY);
    if (!userData) return null;

    const user = JSON.parse(userData) as UserInfo;
    return user.assigned_hostel_id || null;
  } catch (error) {
    console.error('Error getting assigned hostel:', error);
    return null;
  }
}

/**
 * Get current user info
 */
export function getUserInfo(): UserInfo | null {
  if (typeof window === 'undefined') return null;

  try {
    const userData = localStorage.getItem(USER_KEY);
    if (!userData) return null;

    return JSON.parse(userData) as UserInfo;
  } catch (error) {
    console.error('Error getting user info:', error);
    return null;
  }
}

/**
 * Get access token
 */
export function getAccessToken(): string | null {
  if (typeof window === 'undefined') return null;

  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch (error) {
    console.error('Error getting access token:', error);
    return null;
  }
}

/**
 * Get refresh token
 */
export function getRefreshToken(): string | null {
  if (typeof window === 'undefined') return null;

  try {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  } catch (error) {
    console.error('Error getting refresh token:', error);
    return null;
  }
}

/**
 * Set auth tokens
 */
export function setAuthTokens(tokens: AuthTokens): void {
  if (typeof window === 'undefined') return;

  try {
    if (tokens.access_token) {
      localStorage.setItem(TOKEN_KEY, tokens.access_token);
    }
    if (tokens.refresh_token) {
      localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refresh_token);
    }
    if (tokens.user) {
      localStorage.setItem(USER_KEY, JSON.stringify(tokens.user));
    }
  } catch (error) {
    console.error('Error setting auth tokens:', error);
  }
}

/**
 * Clear auth data
 */
export function clearAuth(): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  } catch (error) {
    console.error('Error clearing auth:', error);
  }
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
  return getAccessToken() !== null;
}

/**
 * Fetch API with auth headers
 */
export async function fetchApi<T>(
  endpoint: string,
  options?: RequestInit & { requireAuth?: boolean }
): Promise<T | null> {
  const {
    requireAuth = true,
    method = 'GET',
    headers = {},
    body,
  } = options || {};

  const url = `${API_URL}${endpoint}`;

  const requestHeaders: HeadersInit = {
    'Content-Type': 'application/json',
    ...headers,
  };

  if (requireAuth) {
    const token = getAccessToken();
    if (token) {
      (requestHeaders as Record<string, string>)['Authorization'] = `Bearer ${token}`;
    }
  }

  try {
    const response = await fetch(url, {
      method,
      headers: requestHeaders,
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      if (response.status === 401) {
        // Token expired, try to refresh
        const refreshed = await tryRefreshToken();
        if (refreshed) {
          // Retry with new token
          const newToken = getAccessToken();
          if (newToken) {
            (requestHeaders as Record<string, string>)['Authorization'] = `Bearer ${newToken}`;
          }
          const retryResponse = await fetch(url, {
            method,
            headers: requestHeaders,
            body: body ? JSON.stringify(body) : undefined,
          });
          if (!retryResponse.ok) {
            return null;
          }
          return await retryResponse.json();
        }
      }
      // Redirect to login on auth failure
      if (typeof window !== 'undefined') {
        clearAuth();
        window.location.href = '/login';
      }
      return null;
    }

    const data = await response.json();
    return (data as { success?: boolean; data?: T }).success ? (data as { success?: boolean; data?: T }).data ?? null : null;
  } catch (error) {
    console.error('API fetch error:', error);
    return null;
  }
}

/**
 * Try to refresh the access token
 */
async function tryRefreshToken(): Promise<boolean> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return false;

  try {
    const response = await fetch(`${API_URL}/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });

    if (!response.ok) return false;

    const data = await response.json();
    if (!data.success) return false;

    setAuthTokens(data.data);
    return true;
  } catch (error) {
    console.error('Token refresh error:', error);
    return false;
  }
}

/**
 * Login function
 */
export async function login(email: string, password: string): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (data.success) {
      setAuthTokens(data.data);
      return { success: true };
    }

    return { success: false, error: (data as { error?: string }).error || 'Login failed' };
  } catch (error) {
    console.error('Login error:', error);
    return { success: false, error: 'An error occurred during login' };
  }
}

/**
 * Register function
 */
export async function register(
  email: string,
  password: string,
  studentId?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, role: 'student', student_id: studentId }),
    });

    const data = await response.json();

    if (data.success) {
      setAuthTokens(data.data);
      return { success: true };
    }

    return { success: false, error: (data as { error?: string }).error || 'Registration failed' };
  } catch (error) {
    console.error('Registration error:', error);
    return { success: false, error: 'An error occurred during registration' };
  }
}

/**
 * Logout function
 */
export async function logout(): Promise<void> {
  try {
    const token = getAccessToken();
    if (token) {
      await fetch(`${API_URL}/auth/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
    }
    clearAuth();
    if (typeof window !== 'undefined') {
      window.location.href = '/';
    }
  } catch (error) {
    console.error('Logout error:', error);
    // Clear local auth even if API call fails
    clearAuth();
    if (typeof window !== 'undefined') {
      window.location.href = '/';
    }
  }
}
