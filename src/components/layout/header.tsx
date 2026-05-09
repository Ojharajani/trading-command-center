'use client'

import React, { useState, useEffect } from 'react'
import { useTheme } from 'next-themes'
import { usePathname } from 'next/navigation'
import { Sun, Moon, Bell, Search, LayoutDashboard, Target, Landmark, BookOpen, Shield, Wallet, Brain, TrendingUp, Receipt, Flag, Rocket, Settings } from 'lucide-react'

const pageConfig: Record<string, { title: string; icon: React.ElementType; description: string }> = {
  '/dashboard': { title: 'Dashboard', icon: LayoutDashboard, description: 'Overview & analytics' },
  '/zones': { title: 'Zone Bank', icon: Target, description: 'Supply & demand zones' },
  '/accounts': { title: 'Account Master', icon: Landmark, description: 'Trading accounts' },
  '/journal': { title: 'Trading Journal', icon: BookOpen, description: 'Trade log & analysis' },
  '/risk': { title: 'Risk Management', icon: Shield, description: 'Position sizing & risk' },
  '/money': { title: 'Money Management', icon: Wallet, description: 'Capital allocation' },
  '/psychology': { title: 'Psychology Tracker', icon: Brain, description: 'Mental game tracking' },
  '/investments': { title: 'Investment Tracker', icon: TrendingUp, description: 'Portfolio tracking' },
  '/tax': { title: 'Income Tax Tracker', icon: Receipt, description: 'Tax computations' },
  '/progress': { title: 'Progress Roadmap', icon: Flag, description: 'Milestones & goals' },
  '/growth': { title: 'Growth Roadmap', icon: Rocket, description: 'Skill development' },
  '/settings': { title: 'Settings', icon: Settings, description: 'App configuration' },
}

export function Header() {
  const { theme, setTheme } = useTheme()
  const pathname = usePathname()
  const config = pageConfig[pathname] || pageConfig['/dashboard']
  const PageIcon = config.icon
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  return (
    <header className="sticky top-0 z-30 h-16 glass-header border-b border-border/50 flex items-center justify-between px-6">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-xl bg-primary/10">
          <PageIcon className="w-4 h-4 text-primary" />
        </div>
        <div>
          <h1 className="text-base font-semibold text-foreground tracking-tight">{config.title}</h1>
          <p className="text-[11px] text-muted-foreground/70">
            {mounted ? new Date().toLocaleDateString('en-IN', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' }) : '\u00A0'}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* Search */}
        <button className="p-2.5 rounded-xl text-muted-foreground/70 hover:text-foreground hover:bg-accent/50 transition-all duration-200">
          <Search className="w-[18px] h-[18px]" />
        </button>

        {/* Notifications */}
        <button className="p-2.5 rounded-xl text-muted-foreground/70 hover:text-foreground hover:bg-accent/50 transition-all duration-200 relative">
          <Bell className="w-[18px] h-[18px]" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-destructive rounded-full animate-notification ring-2 ring-background" />
        </button>

        {/* Theme Toggle */}
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="p-2.5 rounded-xl text-muted-foreground/70 hover:text-foreground hover:bg-accent/50 transition-all duration-200"
          aria-label="Toggle theme"
        >
          {mounted && (theme === 'dark' ? <Sun className="w-[18px] h-[18px]" /> : <Moon className="w-[18px] h-[18px]" />)}
        </button>

        {/* User Avatar */}
        <div className="w-8 h-8 rounded-xl gradient-primary flex items-center justify-center ml-1 shadow-sm shadow-primary/20">
          <span className="text-[11px] font-bold text-white">TC</span>
        </div>
      </div>
    </header>
  )
}
