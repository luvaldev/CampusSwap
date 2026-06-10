import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"

const ALLOWED_DOMAINS = ["mail.udp.cl", "udp.cl"]

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_ID || "",
      clientSecret: process.env.GOOGLE_SECRET || "",
    })
  ],
  callbacks: {
    async signIn({ account, profile }) {
      if (account?.provider === "google") {
        if (!profile || !profile.email) return false 
        
        const domain = profile.email.split("@")[1]
        
        if (ALLOWED_DOMAINS.includes(domain)) {
          return true
        } else {
          return "/?error=AccessDenied"
        }
      }
      return false
    },
    async jwt({ token, user }) {
      if (user && user.email) {
        const domain = user.email.split("@")[1]
        token.role = domain === "mail.udp.cl" ? "ESTUDIANTE" : "STAFF"
      }
      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.role = token.role || "ESTUDIANTE"
      }
      return session
    }
  },
  pages: {
    signIn: '/'
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: true, 
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }