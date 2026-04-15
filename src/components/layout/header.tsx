'use client'

import React from 'react'
import { useTheme } from 'next-themes'
import { usePathname } from 'next/navigation'
import { Sun, Moon, Bell, Search } from 'lucide-react'

const pageTitles: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/zones': 'Zone Bank',
  '/journal': 'Trading Journal',
  '/risk': 'Risk Management',
  '/money': 'Money Management',
  '/psychology': 'Psychology Tracker',
  '/investments': 'Investment Tracker',
  '/tax': 'Income Tax Tracker',
  '/progress': 'Progress Roadmap',
  '/growth': 'Growth Roadmap',
  '/settings': 'Settings',
}

export function Header() {
  const { theme, setTheme } = useTheme()
  const pathname = usePathname()
  const pageTitle = pageTitles[pathname] || 'Dashboard'

  return (
    <header className="sticky top-0 z-30 h-16 bg-background/80 backdrop-blur-md border-b border-border flex items-center justify-between px-6">
      <div>
        <h1 className="text-lg font-semibold text-foreground">{pageTitle}</h1>
        <p className="text-xs text-muted-foreground">
          {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      <div className="flex items-center gap-3">
        {/* Search */}
        <button className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">
          <Search className="w-5 h-5" />
        </button>

        {/* Notifications */}
        <button className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors relative">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-destructive rounded-full" />
        </button>

        {/* Theme Toggle */}
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>

        {/* User Avatar */}
        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
          <span className="text-xs font-semibold text-primary">TC</span>
        </div>
      </div>
    </header>
  )
}
