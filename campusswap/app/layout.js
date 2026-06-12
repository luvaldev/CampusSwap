import './globals.css'
import Provider from './Provider'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'

export const metadata = {
  title: 'CampusSwap — Red Académica UDP',
  description: 'Plataforma de colaboración académica exclusiva para la comunidad de la Universidad Diego Portales. Comparte apuntes, modera contenido y gana Karma Points.',
  openGraph: {
    title: 'CampusSwap — Red Académica UDP',
    description: 'Comparte apuntes, modera contenido y gana Karma Points.',
    type: 'website',
    locale: 'es_CL',
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                if (localStorage.theme === 'light' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: light)').matches)) {
                  document.documentElement.classList.remove('dark')
                } else {
                  document.documentElement.classList.add('dark')
                }
              } catch (_) {}
            `,
          }}
        />
      </head>
      <body className={`${GeistSans.variable} ${GeistMono.variable}`}>
        <Provider>
          {children}
        </Provider>
      </body>
    </html>
  )
}