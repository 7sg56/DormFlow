import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl
    const hasToken = request.cookies.has('token')

    // Protect dashboard routes
    if (pathname.startsWith('/dashboard') && !hasToken) {
        return NextResponse.redirect(new URL('/login', request.url))
    }

    // Redirect authenticated users away from login and signup
    if (pathname === '/login' && hasToken) {
        return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    if (pathname === '/signup' && hasToken) {
        return NextResponse.redirect(new URL('/dashboard', request.url))
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
