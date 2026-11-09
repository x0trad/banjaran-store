import type { Metadata } from 'next'
import './globals.css'
import { Toaster } from 'react-hot-toast'

export const metadata: Metadata = {
  title: { default: 'Banjaran — Born from the Mountains', template: '%s | Banjaran' },
  description: 'Malaysian outdoor clothing brand. Tees for the trail, the summit, and the streets.',
  keywords: ['banjaran', 'outdoor clothing', 'hiking tee', 'malaysia', 'mountain apparel'],
  openGraph: {
    type: 'website',
    locale: 'en_MY',
    url: process.env.NEXT_PUBLIC_APP_URL,
    siteName: 'Banjaran',
    title: 'Banjaran — Born from the Mountains',
    description: 'Malaysian outdoor clothing brand. Tees for the trail, the summit, and the streets.',
  },
  twitter: { card: 'summary_large_image' },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: { fontFamily: 'var(--font-inter)', fontSize: '14px' },
            success: { iconTheme: { primary: '#1f5e44', secondary: '#fff' } },
          }}
        />
      </body>
    </html>
  )
}
