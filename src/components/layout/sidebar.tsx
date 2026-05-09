'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, Target, BookOpen, Shield, Wallet,
  Brain, TrendingUp, Receipt, Flag, Rocket, Settings,
  ChevronLeft, ChevronRight, LogOut, Landmark, Zap
} from 'lucide-react'

const navGroups = [
  {
    label: 'CORE',
    items: [
      { title: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
      { title: 'Zone Bank', href: '/zones', icon: Target },
      { title: 'Account Master', href: '/accounts', icon: Landmark },
      { title: 'Trading Journal', href: '/journal', icon: BookOpen },
    ],
  },
  {
    label: 'ANALYTICS',
    items: [
      { title: 'Risk Management', href: '/risk', icon: Shield },
      { title: 'Money Management', href: '/money', icon: Wallet },
      { title: 'Psychology Tracker', href: '/psychology', icon: Brain },
    ],
  },
  {
    label: 'MANAGEMENT',
    items: [
      { title: 'Investment Tracker', href: '/investments', icon: TrendingUp },
      { title: 'Income Tax Tracker', href: '/tax', icon: Receipt },
      { title: 'Progress Roadmap', href: '/progress', icon: Flag },
      { title: 'Growth Roadmap', href: '/growth', icon: Rocket },
      { title: 'Settings', href: '/settings', icon: Settings },
    ],
  },
]

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const pathname = usePathname()

  return (
    <aside
      className={`fixed left-0 top-0 z-40 h-screen glass-sidebar border-r border-sidebar-border flex flex-col transition-all duration-300 ease-in-out ${
        collapsed ? 'w-[68px]' : 'w-[260px]'
      }`}
    >
      {/* Logo */}
      <div className="flex items-center h-16 px-4 border-b border-sidebar-border">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center flex-shrink-0 shadow-md shadow-primary/20">
            <Zap className="w-5 h-5 text-white" />
          </div>
          {!collapsed && (
            <div className="animate-fade-in overflow-hidden">
              <h1 className="text-sm font-bold text-foreground tracking-tight truncate">Trading Command</h1>
              <p className="text-[10px] text-primary font-semibold tracking-wider truncate">CENTER</p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation Groups */}
      <nav className="flex-1 overflow-y-auto py-3 px-3 space-y-5">
        {navGroups.map((group) => (
          <div key={group.label}>
            {!collapsed && (
              <p className="px-3 mb-2 text-[10px] font-bold text-muted-foreground/60 uppercase tracking-[0.15em]">
                {group.label}
              </p>
            )}
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const isActive = pathname === item.href
                const Icon = item.icon
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 relative ${
                      isActive
                        ? 'bg-primary/10 text-primary shadow-sm'
                        : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
                    }`}
                    title={collapsed ? item.title : undefined}
                  >
                    {isActive && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 nav-active-indicator" />
                    )}
                    <Icon className={`w-[18px] h-[18px] flex-shrink-0 transition-all duration-200 ${
                      isActive ? 'text-primary' : 'text-muted-foreground/70 group-hover:text-foreground'
                    }`} />
                    {!collapsed && (
                      <span className="truncate animate-fade-in">{item.title}</span>
                    )}
                  </Link>
                )
              })}
            </div>
          </div>
        ))}
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
          className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-sm text-destructive/80 hover:text-destructive hover:bg-destructive/10 transition-all duration-200"
          title={collapsed ? 'Logout' : undefined}
        >
          <LogOut className="w-4 h-4" />
          {!collapsed && <span className="font-medium">Logout</span>}
        </button>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-sm text-muted-foreground/60 hover:text-muted-foreground hover:bg-accent/30 transition-all duration-200"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          {!collapsed && <span>Collapse</span>}
        </button>
      </div>
    </aside>
  )
}

export function useSidebarWidth() {
  return 260
}
