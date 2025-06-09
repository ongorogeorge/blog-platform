import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  // Admin panel protection
  if (request.nextUrl.pathname.startsWith("/admin")) {
    // Skip authentication check for the login page
    if (request.nextUrl.pathname === "/admin/login") {
      return NextResponse.next()
    }

    const adminAuth = request.cookies.get("admin-auth")?.value

    if (!adminAuth || adminAuth !== "authenticated") {
      return NextResponse.redirect(new URL("/admin/login", request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/admin/:path*"],
}
