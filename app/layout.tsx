import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Biclaw - Website Analysis & Optimization',
  description: 'Analyze, optimize, and compete with top 1% websites. Professional website audits for SEO, performance, security, and more.',
  keywords: 'website audit, SEO analysis, performance optimization, website optimization',
  openGraph: {
    title: 'Biclaw - Website Analysis & Optimization',
    description: 'Analyze your website and stay competitive with top-performing sites.',
    type: 'website',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#3b82f6',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="bg-background">
      <body className={`${inter.className} bg-background text-foreground`}>
        {children}
      </body>
    </html>
  )
}
