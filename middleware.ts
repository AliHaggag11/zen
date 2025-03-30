import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextRequest, NextResponse } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  // If user is signed in and trying to access the home page, 
  // redirect them to the dashboard
  if (session && req.nextUrl.pathname === '/') {
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }

  // If user is not signed in and trying to access protected routes,
  // redirect them to the login page
  const protectedRoutes = ['/dashboard', '/mood-tracker', '/profile', '/wellness', '/chat']
  if (!session && protectedRoutes.some(route => req.nextUrl.pathname.startsWith(route))) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  // If user is signed in and trying to access auth pages,
  // redirect them to the dashboard
  const authRoutes = ['/login', '/register']
  if (session && authRoutes.some(route => req.nextUrl.pathname.startsWith(route))) {
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }

  return res
}

// Specify which paths middleware will run on
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\.svg).*)'],
} 