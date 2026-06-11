// app/api/auth/[...nextauth]/route.js
import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import { PrismaAdapter } from "@auth/prisma-adapter"
import prisma from "../../../lib/prisma" // Verifica que la ruta a tu prisma.js sea la correcta

const ALLOWED_DOMAINS = ["mail.udp.cl", "udp.cl"]

export const authOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_ID || "",
      clientSecret: process.env.GOOGLE_SECRET || "",
    })
  ],
  session: {
    strategy: "jwt",
  },
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

    // 🔥 MODIFICADO: Esta callback ahora busca datos reales y frescos en Supabase
    async jwt({ token }) {
      if (token?.email) {
        const dbUser = await prisma.user.findUnique({
          where: { email: token.email },
        })
        
        if (dbUser) {
          // Si el usuario existe, guardamos sus datos reales en el Token
          token.id = dbUser.id
          token.role = dbUser.role
          token.careerId = dbUser.careerId // Enlaza el Onboarding en tiempo real
        } else {
          // 🚨 Si borraste el usuario de la DB, vaciamos el token para forzar el deslogueo
          return {}
        }
      }
      return token
    },

    // 🔥 MODIFICADO: Valida que si el token está vacío, destruya la sesión activa
    async session({ session, token }) {
      // Si el token no tiene email (porque el usuario fue eliminado de la DB), cerramos sesión
      if (!token || !token.email) {
        return null 
      }
      
      if (token && session.user) {
        session.user.role = token.role || "ESTUDIANTE"
        session.user.id = token.id
        session.user.careerId = token.careerId // El Frontend ahora verá el cambio al instante
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