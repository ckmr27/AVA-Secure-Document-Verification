import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"

export async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })

  if (!token) {
    return NextResponse.redirect(new URL("/login", req.url))
  }

  const pathname = req.nextUrl.pathname

  if (pathname.startsWith("/dashboard/admin") && token.role !== "ADMIN") {
    return NextResponse.redirect(new URL("/dashboard/user", req.url))
  }

  if (pathname.startsWith("/dashboard/user") && token.role !== "USER") {
    return NextResponse.redirect(new URL("/dashboard/admin", req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/dashboard/:path*"],
}
