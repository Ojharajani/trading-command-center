'use client'

import React from 'react'
import { usePathname } from 'next/navigation'
import { Sidebar } from './sidebar'
import { Header } from './header'

const authRoutes = ['/login', '/register', '/forgot-password', '/reset-password']

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isAuthPage = authRoutes.includes(pathname)

  if (isAuthPage) {
    return <>{children}</>
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Ambient background mesh — subtle in dark mode */}
      <div className="fixed inset-0 gradient-mesh pointer-events-none" />

      <Sidebar />
      <div className="ml-[260px] transition-all duration-300 relative">
        <Header />
        <main className="p-6 relative">
          {children}
        </main>
      </div>
    </div>
  )
}
