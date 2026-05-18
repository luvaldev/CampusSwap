import './globals.css'
import Provider from './Provider'

export const metadata = {
  title: 'CampusSwap',
  description: 'Red de Colaboración Académica Exclusiva',
}

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      {/* Colores basados en tu tema oscuro */}
      <body className="bg-[#0a0514] text-[#ccd6f6] min-h-screen">
        <Provider>
          {children}
        </Provider>
      </body>
    </html>
  )
}
