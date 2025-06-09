import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import Header from "@/components/layout/header"
import Footer from "@/components/layout/footer"
import { Toaster } from "@/components/ui/toaster"
import CookieConsentModal from "@/components/cookie-consent/cookie-consent-modal"
import VercelAnalytics from "@/components/analytics/vercel-analytics"
import { Suspense } from "react"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: {
    default: "George Ongoro Blog",
    template: "%s | George Ongoro Blog",
  },
  description: "Personal blog by George Ongoro sharing insights on various topics",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://blog.ongoro.top"),
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <div className="flex flex-col min-h-screen">
            <Header />
            <Suspense>
              <main className="flex-1">{children}</main>
            </Suspense>
            <Footer />
          </div>
          <Toaster />
          <CookieConsentModal />
          <VercelAnalytics />
        </ThemeProvider>
      </body>
    </html>
  )
}
