import type { Metadata } from 'next'
import localFont from 'next/font/local'
import './globals.css'
import { Providers } from '@/components/providers'
import { AuthProvider } from '@/components/auth-provider'
import { ThemeProvider } from '@/components/theme-provider'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { AmbientParticles } from '@/components/effects/ambient-particles'
import { CursorGlow } from '@/components/effects/cursor-glow'
import { NoiseOverlay } from '@/components/effects/page-transitions'
import { ErrorBoundary } from '@/components/error-boundary'

const geistSans = localFont({
src: './fonts/GeistVF.woff',
variable: '--font-geist-sans',
weight: '100 900',
})
const geistMono = localFont({
src: './fonts/GeistMonoVF.woff',
variable: '--font-geist-mono',
weight: '100 900',
})

export const metadata: Metadata = {
title: 'NeoGallery — Виртуальные выставки цифрового искусства',
description:
'Иммерсивная платформа виртуальных выставок с 3D-навигацией, гибридной монетизацией и адаптивным опытом',
keywords: ['виртуальная выставка', 'цифровое искусство', '3D галерея', 'NFT'],
}

export default function RootLayout({
children,
}: Readonly<{
children: React.ReactNode
}>) {
return (
<html lang="ru" suppressHydrationWarning>
<body
className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}
>
<a href="#main-content" className="skip-link">
Перейти к контенту
</a>
<Providers>
<AuthProvider>
<ThemeProvider>
<AmbientParticles />
<CursorGlow />
<NoiseOverlay />
<Header />
<ErrorBoundary>
<main id="main-content" className="relative z-10 min-h-[calc(100vh-8rem)]">
{children}
</main>
</ErrorBoundary>
<Footer />
</ThemeProvider>
</AuthProvider>
</Providers>
</body>
</html>
)
}
