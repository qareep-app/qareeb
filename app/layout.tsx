import type { Metadata } from 'next'
import { Cairo } from 'next/font/google'
import './globals.css'
import Navbar from '../components/Navbar'
import Splash from '../components/Splash'

const cairo = Cairo({
  subsets: ['arabic', 'latin'],
  weight: ['400', '600', '700', '800'],
  variable: '--font-cairo',
})

export const metadata: Metadata = {
  title: 'قريب | دكانك قريب',
  description: 'سوق مصري محلي يربطك بالبائعين والمحلات القريبة منك مباشرة',
  icons: {
    icon: '/icon.png',
    apple: '/apple-icon.png',
  },
  manifest: '/manifest.json',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ar" dir="rtl" className={`${cairo.variable} h-full`}>
      <body className="min-h-full flex flex-col bg-[#fafaf7] font-sans antialiased pb-20 md:pb-0">
        <Splash>
          <Navbar />
          <div className="flex-1">{children}</div>
        </Splash>
      </body>
    </html>
  )
}