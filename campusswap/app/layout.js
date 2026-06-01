import './globals.css'
import Provider from './Provider'

export const metadata = {
  title: {
    default: 'CampusSwap',
    template: '%s · CampusSwap',
  },
  description: 'Red de Colaboración Académica exclusiva para la Universidad Diego Portales. Centraliza apuntes, gana Karma y estudia mejor.',
  keywords: ['CampusSwap', 'UDP', 'Universidad Diego Portales', 'apuntes', 'académico'],
  authors: [{ name: 'Grupo 7 — Ingeniería de Software 2026' }],
  robots: {
    index: false,   // Private app — keep out of search engines
    follow: false,
  },
  themeColor: '#060410',
  viewport: {
    width: 'device-width',
    initialScale: 1,
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        {/* Google Fonts — preconnect for performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;1,9..40,300&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <Provider>
          {children}
        </Provider>
      </body>
    </html>
  )
}