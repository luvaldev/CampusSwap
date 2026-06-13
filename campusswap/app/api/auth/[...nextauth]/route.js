// app/api/auth/[...nextauth]/route.js
import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import CredentialsProvider from "next-auth/providers/credentials"
import { PrismaAdapter } from "@auth/prisma-adapter"
import prisma from "../../../lib/prisma" // Verifica que la ruta a tu prisma.js sea la correcta

const ALLOWED_DOMAINS = ["mail.udp.cl", "udp.cl"]

export const authOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_ID || "",
      clientSecret: process.env.GOOGLE_SECRET || "",
    }),
    CredentialsProvider({
      name: "Guest",
      credentials: {
        isGuest: { label: "Guest", type: "text" }
      },
      async authorize(credentials) {
        if (credentials.isGuest === "true") {
          let guestUser = await prisma.user.findUnique({ where: { email: "guest@campusswap.cl" } })
          if (!guestUser) {
            guestUser = await prisma.user.create({
              data: {
                email: "guest@campusswap.cl",
                name: "Invitado Anónimo",
                role: "GUEST",
              }
            })
          }
          return { id: guestUser.id, name: guestUser.name, email: guestUser.email, role: guestUser.role }
        }
        return null
      }
    })
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === "google") {
        if (!profile || !profile.email) return false
        const domain = profile.email.split("@")[1]
        
        const isInstitutional = ALLOWED_DOMAINS.includes(domain)
        
        if (isInstitutional) {
          // Si el usuario es institucional y acaba de crearse, aseguramos rol ESTUDIANTE
          if (user && user.id && user.role === "GUEST") {
            await prisma.user.update({ where: { id: user.id }, data: { role: "ESTUDIANTE" } })
          }
          return true
        } else {
          return "/?error=AccessDenied"
        }
      }
      
      if (account?.provider === "credentials") {
        return true
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
          token.picture = dbUser.image || null // Enlaza la foto de perfil o la limpia
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
        session.user.image = token.picture || null // Asegurarse de limpiar la imagen si no hay
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