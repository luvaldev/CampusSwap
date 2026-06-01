import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"

const ALLOWED_DOMAINS = ["@mail.udp.cl"]

function isAllowedEmail(email = "") {
  return ALLOWED_DOMAINS.some((domain) => email.endsWith(domain))
}

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_ID,
      clientSecret: process.env.GOOGLE_SECRET,
      authorization: {
        params: {
          // Force account selection so users can switch between institutional accounts
          prompt: "select_account",
          hd: "mail.udp.cl", // Google Workspace domain hint (shows only UDP accounts)
        },
      },
    }),
  ],

  callbacks: {
    /**
     * Called whenever a sign-in attempt is made.
     * Returning false sends the user to the error page with AccessDenied.
     */
    async signIn({ user, account, profile }) {
      if (account?.provider === "google") {
        const email = profile?.email || user?.email || ""
        return isAllowedEmail(email)
      }
      // Allow other providers (if added later)
      return true
    },

    /**
     * Enrich the JWT with extra fields we need on the client.
     * Called every time a JWT is created or updated.
     */
    async jwt({ token, account, profile }) {
      if (account && profile) {
        token.accessToken = account.access_token
        token.provider = account.provider
        // Store a normalized role — future-proof for admin/staff distinction
        const email = token.email || ""
        token.role = email.endsWith("@mail.udp.cl") ? "staff" : "student"
      }
      return token
    },

    /**
     * Called whenever a session is checked (client-side useSession, etc.).
     * Expose only what the frontend needs.
     */
    async session({ session, token }) {
      if (session?.user) {
        session.user.role = token.role
        session.user.provider = token.provider
      }
      return session
    },
  },

  pages: {
    signIn: "/",
    error: "/",
  },

  session: {
    strategy: "jwt",
    // Sessions expire after 8 hours — appropriate for a study-session tool
    maxAge: 8 * 60 * 60,
  },

  // Enable debug logs only in development
  debug: process.env.NODE_ENV === "development",
})

export { handler as GET, handler as POST }