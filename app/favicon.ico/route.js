import { getSite } from '@/lib/content'
import { NextResponse } from 'next/server'

export async function GET(request) {
  try {
    const site = await getSite()
    const faviconUrl = site.favicon || site.logo || '/assets/logo/gng.png'

    // If it's a relative path, resolve against current origin
    if (faviconUrl.startsWith('/')) {
      const origin = request.nextUrl?.origin || 'http://localhost:3000'
      return NextResponse.redirect(`${origin}${faviconUrl}`, 302)
    }

    return NextResponse.redirect(faviconUrl, 302)
  } catch {
    return NextResponse.redirect('/assets/logo/gng.png', 302)
  }
}
