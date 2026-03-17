import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

/**
 * Basic JWT format validation
 * Checks if a token has the expected JWT structure (header.payload.signature)
 */
function isValidJwtFormat(token: string | undefined): boolean {
    if (!token || typeof token !== 'string') {
        return false
    }
    // JWT should have 3 parts separated by dots
    const parts = token.split('.')
    return parts.length === 3 && parts.every(part => part.length > 0)
}

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl
    const tokenCookie = request.cookies.get('token')
    const token = tokenCookie?.value

    // Check if token has valid JWT format
    const hasValidToken = token && isValidJwtFormat(token)

    // Protect dashboard routes
    if (pathname.startsWith('/dashboard') && !hasValidToken) {
        const loginUrl = new URL('/login', request.url)
        loginUrl.searchParams.set('redirect', pathname)
        return NextResponse.redirect(loginUrl)
    }

    // Redirect authenticated users away from login and signup
    if (hasValidToken) {
        if (pathname === '/login' || pathname === '/signup') {
            return NextResponse.redirect(new URL('/dashboard', request.url))
        }
    }

    // Redirect root to dashboard (which will redirect to login if no token)
    if (pathname === '/') {
        return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    return NextResponse.next()
}

export const config = {
    matcher: ['/dashboard/:path*', '/login', '/signup', '/'],
}
