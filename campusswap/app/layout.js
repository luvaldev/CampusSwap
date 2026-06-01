import './globals.css'
import Provider from './Provider'
import { Inter, Outfit } from 'next/font/google'

// Cargamos las fuentes optimizadas
const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const outfit = Outfit({ subsets: ['latin'], variable: '--font-outfit' })

export const metadata = {
  title: 'CampusSwap',
  description: 'Red de Colaboración Académica Exclusiva',
}

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body className={`${inter.variable} ${outfit.variable} font-sans bg-[#0a0514] text-[#ccd6f6] min-h-screen`}>
        <Provider>
          {children}
        </Provider>
      </body>
    </html>
  )
}