import { withAuth } from "next-auth/middleware"

export default withAuth({
  // Si el usuario no está logueado, se le devuelve a la página raíz
  pages: {
    signIn: "/",
  },
})

// Especificamos qué rutas queremos proteger
export const config = {
  matcher: [
    // Protege la ruta /dashboard y TODO lo que esté dentro de ella
    "/dashboard/:path*"
  ]
}