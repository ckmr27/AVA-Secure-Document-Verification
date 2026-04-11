import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"

export async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })

  if (!token) {
    return NextResponse.redirect(new URL("/", req.url))
  }

  const pathname = req.nextUrl.pathname

  // Apply rate limiting to all API routes
  if (pathname.startsWith("/api")) {
    // Import rateLimit dynamically or use a simple check if possible 
    // Wait, middleware has limited support for dynamic imports of certain libraries.
    // However, since we are using prisma, we might have issues in Edge runtime.
    // NEXT.js middleware usually runs in Edge. Prisma doesn't run in Edge unless using Accelerate.
    
    // Check if we are in a runtime that supports Prisma
    // If not, we might need a different approach for middleware rate limiting.
  }

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
