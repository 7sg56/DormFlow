import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

/**
 * Server-side token refresh endpoint
 * This endpoint can read httpOnly cookies and call the backend refresh endpoint
 */
export async function POST() {
    try {
        const cookieStore = await cookies();
        const refreshToken = cookieStore.get('refresh_token')?.value;

        if (!refreshToken) {
            return NextResponse.json(
                { success: false, error: 'No refresh token' },
                { status: 401 }
            );
        }

        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

        const response = await fetch(`${API_URL}/auth/refresh`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refresh_token: refreshToken }),
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
            // Clear cookies on refresh failure
            cookieStore.delete('token');
            cookieStore.delete('refresh_token');
            cookieStore.delete('user');
            return NextResponse.json(
                { success: false, error: 'Refresh failed' },
                { status: response.status }
            );
        }

        // Update cookies with new tokens
        if (data.data?.access_token) {
            cookieStore.set('token', data.data.access_token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                path: '/',
                maxAge: 60 * 60, // 1 hour
            });
        }

        if (data.data?.refresh_token) {
            cookieStore.set('refresh_token', data.data.refresh_token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                path: '/',
                maxAge: 60 * 60 * 24 * 7, // 7 days
            });
        }

        // Note: user cookie is not updated here as it doesn't change during token refresh
        // The user cookie is non-httpOnly and accessible to client-side for sidebar

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Token refresh error:', error);
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}
