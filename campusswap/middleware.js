import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const pathname = req.nextUrl.pathname

    // If somehow a non-UDP email got a token, redirect to home
    if (token) {
      const email = token.email || ""
      const isValidDomain =
        email.endsWith("@mail.udp.cl") || email.endsWith("@udp.cl")

      if (!isValidDomain) {
        return NextResponse.redirect(new URL("/?error=AccessDenied", req.url))
      }
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      // Only invoke the middleware function when there is a session
      authorized: ({ token }) => !!token,
    },
    pages: {
      signIn: "/",
      error: "/",
    },
  }
)

// Protect all routes under /dashboard
export const config = {
  matcher: ["/dashboard/:path*"],
}