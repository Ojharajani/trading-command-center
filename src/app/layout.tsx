import type { Metadata } from "next"
import "./globals.css"
import { ThemeProvider } from "@/components/providers/theme-provider"
import { StoreProvider } from "@/lib/store"
import { ToastProvider } from "@/components/ui/toast"
import { AppShell } from "@/components/layout/app-shell"

export const metadata: Metadata = {
  title: "Trading Command Center",
  description: "Professional trading analytics, journal, and risk management platform",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body className="min-h-screen antialiased">
        <ThemeProvider>
          <StoreProvider>
            <ToastProvider>
              <AppShell>
                {children}
              </AppShell>
            </ToastProvider>
          </StoreProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
