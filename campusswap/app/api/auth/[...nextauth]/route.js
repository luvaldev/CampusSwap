import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"

const ALLOWED_DOMAINS = ["mail.udp.cl", "udp.cl"] // Permitimos ambos

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    })
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account.provider === "google") {
        const email = profile.email
        const domain = email.split("@")[1]
        
        // Verifica si el dominio está en la lista permitida
        if (ALLOWED_DOMAINS.includes(domain)) {
          return true
        } else {
          // Redirige al login con el flag de error
          return "/?error=AccessDenied"
        }
      }
      return false
    },
    async jwt({ token, user }) {
      if (user) {
        // Asignación correcta de roles
        const domain = user.email.split("@")[1]
        token.role = domain === "mail.udp.cl" ? "ESTUDIANTE" : "STAFF"
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.role = token.role
      }
      return session
    }
  },
  pages: {
    signIn: '/'
  },
  secret: process.env.NEXTAUTH_SECRET,
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }