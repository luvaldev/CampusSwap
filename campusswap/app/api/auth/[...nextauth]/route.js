import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_ID,
      clientSecret: process.env.GOOGLE_SECRET,
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account.provider === "google") {
        // Obtenemos el correo
        const userEmail = profile.email || user.email || "";
        
        // Aceptamos tanto cuentas de alumnos (@mail.udp.cl) como de staff (@udp.cl)
        if (userEmail.endsWith("@mail.udp.cl") || userEmail.endsWith("@udp.cl")) {
          return true;
        }
        
        // Si no cumple, se rechaza
        return false;
      }
      return true;
    },
  },
  pages: {
    signIn: '/',
    error: '/', 
  }
})

export { handler as GET, handler as POST }
