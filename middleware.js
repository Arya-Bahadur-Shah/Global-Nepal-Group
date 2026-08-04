import { NextResponse } from 'next/server'
import { verifySessionToken, SESSION_COOKIE } from '@/lib/session'

export async function middleware(req) {
  const { pathname } = req.nextUrl

  // Redirect legacy /solutions route to /software-solutions
  if (pathname === '/solutions') {
    const url = req.nextUrl.clone()
    url.pathname = '/software-solutions'
    return NextResponse.redirect(url, 301)
  }
  if (pathname.startsWith('/solutions/')) {
    const url = req.nextUrl.clone()
    url.pathname = pathname.replace('/solutions/', '/software-solutions/')
    return NextResponse.redirect(url, 301)
  }

  if (pathname.startsWith('/admin/login')) return NextResponse.next()

  const token = req.cookies.get(SESSION_COOKIE)?.value
  const session = await verifySessionToken(token)
  if (!session) {
    const url = req.nextUrl.clone()
    url.pathname = '/admin/login'
    url.searchParams.set('next', pathname)
    return NextResponse.redirect(url)
  }
  return NextResponse.next()
}

export const config = { matcher: ['/admin/:path*', '/solutions', '/solutions/:path*'] }
