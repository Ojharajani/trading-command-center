'use client'

import React from 'react'
import { usePathname } from 'next/navigation'
import { Sidebar } from './sidebar'
import { Header } from './header'

const authRoutes = ['/login', '/register']

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isAuthPage = authRoutes.includes(pathname)

  if (isAuthPage) {
    return <>{children}</>
  }

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className="ml-[260px] transition-all duration-300">
        <Header />
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
