import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import './globals.css'

// ✅ Vercel Analytics
import { Analytics } from '@vercel/analytics/react'

export const metadata: Metadata = {
  title: 'Viyaan Future',
  description: 'Reflect with your future self.',
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#0a0a0c] text-white antialiased">
        {children}

        {/* ✅ Analytics (tracks users automatically) */}
        <Analytics />
      </body>
    </html>
  )
}