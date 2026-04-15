'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, Target, BookOpen, Shield, Wallet,
  Brain, TrendingUp, Receipt, Flag, Rocket, Settings,
  ChevronLeft, ChevronRight, LogOut
} from 'lucide-react'

const navItems = [
  { title: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { title: 'Zone Bank', href: '/zones', icon: Target },
  { title: 'Trading Journal', href: '/journal', icon: BookOpen },
  { title: 'Risk Management', href: '/risk', icon: Shield },
  { title: 'Money Management', href: '/money', icon: Wallet },
  { title: 'Psychology Tracker', href: '/psychology', icon: Brain },
  { title: 'Investment Tracker', href: '/investments', icon: TrendingUp },
  { title: 'Income Tax Tracker', href: '/tax', icon: Receipt },
  { title: 'Progress Roadmap', href: '/progress', icon: Flag },
  { title: 'Growth Roadmap', href: '/growth', icon: Rocket },
  { title: 'Settings', href: '/settings', icon: Settings },
]

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const pathname = usePathname()

  return (
    <aside
      className={`fixed left-0 top-0 z-40 h-screen bg-sidebar-bg border-r border-sidebar-border flex flex-col transition-all duration-300 ease-in-out ${
        collapsed ? 'w-[68px]' : 'w-[260px]'
      }`}
    >
      {/* Logo */}
      <div className="flex items-center h-16 px-4 border-b border-sidebar-border">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
            <TrendingUp className="w-5 h-5 text-primary-foreground" />
          </div>
          {!collapsed && (
            <div className="animate-fade-in overflow-hidden">
              <h1 className="text-sm font-bold text-foreground truncate">Trading Command</h1>
              <p className="text-[10px] text-muted-foreground truncate">Center</p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 relative ${
                isActive
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent'
              }`}
              title={collapsed ? item.title : undefined}
            >
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 bg-primary rounded-r-full" />
              )}
              <Icon className={`w-5 h-5 flex-shrink-0 transition-colors ${isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'}`} />
              {!collapsed && (
                <span className="truncate animate-fade-in">{item.title}</span>
              )}
            </Link>
          )
        })}
      </nav>

      {/* Bottom Controls */}
      <div className="p-3 border-t border-sidebar-border space-y-1">
        <button
          onClick={async () => {
            const { createClient } = await import('@/lib/supabase/client')
            const supabase = createClient()
            await supabase.auth.signOut()
            window.location.href = '/login'
          }}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm text-destructive hover:bg-destructive/10 transition-colors"
          title={collapsed ? 'Logout' : undefined}
        >
          <LogOut className="w-4 h-4" />
          {!collapsed && <span>Logout</span>}
        </button>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          {!collapsed && <span>Collapse</span>}
        </button>
      </div>
    </aside>
  )
}

export function useSidebarWidth() {
  // This is a simple approach - in production you'd use context
  return 260
}
