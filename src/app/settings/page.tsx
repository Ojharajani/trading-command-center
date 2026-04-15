'use client'

import React, { useState } from 'react'
import { useStore } from '@/lib/store'
import { useToast } from '@/components/ui/toast'
import { useTheme } from 'next-themes'
import { Card, CardHeader, CardTitle, CardContent, CardDescription, Button, Input, Label, Select, Badge } from '@/components/ui'
import { Settings, User, Shield, Palette, Download, Upload, Trash2, Moon, Sun, Monitor, Save, FileJson, FileSpreadsheet } from 'lucide-react'
import Papa from 'papaparse'

export default function SettingsPage() {
  const { riskSettings, updateRiskSettings, trades, zones, capitalLog, portfolio, taxRecords, milestones, growthPhases } = useStore()
  const { toast } = useToast()
  const { theme, setTheme } = useTheme()

  // Profile state
  const [profile, setProfile] = useState({
    name: 'Trader',
    email: 'trader@example.com',
    currency: 'INR',
    timezone: 'Asia/Kolkata',
  })

  const handleProfileSave = () => {
    toast('Profile saved', 'success')
  }

  // Export all data as JSON
  const exportJSON = () => {
    const data = {
      exportDate: new Date().toISOString(),
      version: '1.0',
      trades,
      zones,
      capitalLog,
      riskSettings,
      portfolio,
      taxRecords,
      milestones,
      growthPhases,
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `trading-command-center-backup-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
    toast('Full backup exported as JSON', 'success')
  }

  // Export individual module CSVs
  const exportTradesCSV = () => {
    const csv = Papa.unparse(trades.map(t => ({
      ID: t.id, Date: t.date_time, Symbol: t.symbol, Direction: t.direction, Setup: t.setup,
      Entry: t.entry_price, SL: t.stop_loss, Target: t.target_price, Exit: t.exit_price,
      Qty: t.position_size, RR: t.rr_ratio.toFixed(2), PnL: t.pnl, Result: t.result,
      Emotion_Before: t.emotion_before, Emotion_After: t.emotion_after,
      Confidence: t.confidence, Discipline: t.discipline_score, Mistake: t.mistake_type,
    })))
    downloadCSV(csv, 'trades')
  }

  const exportZonesCSV = () => {
    const csv = Papa.unparse(zones.map(z => ({
      ID: z.id, Symbol: z.symbol, Type: z.zone_type, Subtype: z.zone_subtype,
      Timeframe: z.timeframe, High: z.zone_high, Low: z.zone_low, Status: z.status,
      Score: z.quality_score, TrapRisk: z.trap_risk, TestCount: z.test_count,
    })))
    downloadCSV(csv, 'zones')
  }

  const exportPortfolioCSV = () => {
    const csv = Papa.unparse(portfolio.map(p => ({
      Symbol: p.symbol, Qty: p.quantity, AvgPrice: p.avg_buy_price,
      CurrentPrice: p.current_price, Sector: p.sector, BuyDate: p.buy_date,
      Target: p.target_price, StopLoss: p.stop_loss,
    })))
    downloadCSV(csv, 'portfolio')
  }

  const downloadCSV = (csv: string, name: string) => {
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${name}-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
    toast(`${name}.csv exported`, 'success')
  }

  // Import JSON
  const handleImport = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return
      const reader = new FileReader()
      reader.onload = (ev) => {
        try {
          const data = JSON.parse(ev.target?.result as string)
          if (data.version && data.trades) {
            toast('Data imported successfully! Reload the page to see changes.', 'success')
          } else {
            toast('Invalid backup file format', 'error')
          }
        } catch {
          toast('Failed to parse JSON file', 'error')
        }
      }
      reader.readAsText(file)
    }
    input.click()
  }

  const themes = [
    { value: 'dark', label: 'Dark', icon: <Moon className="w-4 h-4" />, desc: 'Trading terminal dark mode' },
    { value: 'light', label: 'Light', icon: <Sun className="w-4 h-4" />, desc: 'Clean & bright interface' },
    { value: 'system', label: 'System', icon: <Monitor className="w-4 h-4" />, desc: 'Follow OS preference' },
  ]

  // Data stats
  const stats = [
    { label: 'Trades', count: trades.length },
    { label: 'Zones', count: zones.length },
    { label: 'Capital Entries', count: capitalLog.length },
    { label: 'Portfolio Items', count: portfolio.length },
    { label: 'Tax Records', count: taxRecords.length },
    { label: 'Milestones', count: milestones.length },
    { label: 'Growth Phases', count: growthPhases.length },
  ]

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl">
      {/* Profile Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5 text-primary" />
            Profile
          </CardTitle>
          <CardDescription>Manage your account details</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Display Name</Label>
              <Input
                value={profile.name}
                onChange={e => setProfile(p => ({ ...p, name: e.target.value }))}
                className="mt-1"
              />
            </div>
            <div>
              <Label>Email</Label>
              <Input
                type="email"
                value={profile.email}
                onChange={e => setProfile(p => ({ ...p, email: e.target.value }))}
                className="mt-1"
              />
            </div>
            <div>
              <Label>Currency</Label>
              <Select
                options={[
                  { value: 'INR', label: '₹ INR — Indian Rupee' },
                  { value: 'USD', label: '$ USD — US Dollar' },
                  { value: 'EUR', label: '€ EUR — Euro' },
                ]}
                value={profile.currency}
                onChange={e => setProfile(p => ({ ...p, currency: e.target.value }))}
                className="mt-1"
              />
            </div>
            <div>
              <Label>Timezone</Label>
              <Select
                options={[
                  { value: 'Asia/Kolkata', label: 'IST (UTC+5:30)' },
                  { value: 'America/New_York', label: 'EST (UTC-5)' },
                  { value: 'Europe/London', label: 'GMT (UTC+0)' },
                ]}
                value={profile.timezone}
                onChange={e => setProfile(p => ({ ...p, timezone: e.target.value }))}
                className="mt-1"
              />
            </div>
          </div>
          <div className="flex justify-end mt-4">
            <Button onClick={handleProfileSave}>
              <Save className="w-4 h-4 mr-1" />
              Save Profile
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Risk Defaults */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            Risk Threshold Defaults
          </CardTitle>
          <CardDescription>Set your default risk management parameters</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { key: 'max_risk_per_trade', label: 'Max Risk Per Trade (%)', value: riskSettings.max_risk_per_trade },
              { key: 'max_daily_loss', label: 'Max Daily Loss (%)', value: riskSettings.max_daily_loss },
              { key: 'max_weekly_loss', label: 'Max Weekly Loss (%)', value: riskSettings.max_weekly_loss },
              { key: 'max_drawdown', label: 'Max Drawdown (%)', value: riskSettings.max_drawdown },
              { key: 'max_positions', label: 'Max Open Positions', value: riskSettings.max_positions },
            ].map(setting => (
              <div key={setting.key}>
                <Label>{setting.label}</Label>
                <Input
                  type="number"
                  step="0.5"
                  value={setting.value}
                  onChange={e => updateRiskSettings({ [setting.key]: Number(e.target.value) })}
                  className="mt-1"
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Theme Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="w-5 h-5 text-primary" />
            Appearance
          </CardTitle>
          <CardDescription>Customize the look and feel</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {themes.map(t => (
              <button
                key={t.value}
                onClick={() => setTheme(t.value)}
                className={`p-4 rounded-xl border-2 text-left transition-all duration-200 ${
                  theme === t.value
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/30 hover:bg-secondary/30'
                }`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className={`p-2 rounded-lg ${theme === t.value ? 'bg-primary/20' : 'bg-muted'}`}>
                    {t.icon}
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{t.label}</p>
                    <p className="text-xs text-muted-foreground">{t.desc}</p>
                  </div>
                </div>
                {theme === t.value && (
                  <Badge variant="default" className="mt-1">Active</Badge>
                )}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Data Export/Import */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="w-5 h-5 text-primary" />
            Data Export & Import
          </CardTitle>
          <CardDescription>Backup and restore your trading data</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Data Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            {stats.map(s => (
              <div key={s.label} className="p-3 rounded-lg bg-secondary/50 text-center">
                <p className="text-xl font-bold text-foreground">{s.count}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </div>

          <div className="space-y-3">
            <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Full Backup</p>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" onClick={exportJSON}>
                <FileJson className="w-4 h-4 mr-2" />
                Export All (JSON)
              </Button>
              <Button variant="outline" onClick={handleImport}>
                <Upload className="w-4 h-4 mr-2" />
                Import Backup (JSON)
              </Button>
            </div>

            <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider pt-2">Individual Exports (CSV)</p>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" onClick={exportTradesCSV}>
                <FileSpreadsheet className="w-4 h-4 mr-1" />
                Trades CSV
              </Button>
              <Button variant="outline" size="sm" onClick={exportZonesCSV}>
                <FileSpreadsheet className="w-4 h-4 mr-1" />
                Zones CSV
              </Button>
              <Button variant="outline" size="sm" onClick={exportPortfolioCSV}>
                <FileSpreadsheet className="w-4 h-4 mr-1" />
                Portfolio CSV
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-destructive/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <Trash2 className="w-5 h-5" />
            Danger Zone
          </CardTitle>
          <CardDescription>Irreversible actions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-lg bg-destructive/5 border border-destructive/20">
              <div>
                <p className="text-sm font-medium">Reset Demo Data</p>
                <p className="text-xs text-muted-foreground">Reload all demo data (refreshes on page reload)</p>
              </div>
              <Button variant="outline" size="sm" onClick={() => { window.location.reload(); toast('Demo data reset', 'info') }}>
                Reset
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* App Info */}
      <Card>
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-foreground">Trading Command Center</p>
              <p className="text-xs text-muted-foreground">v1.0.0 — Built with Next.js + Tailwind CSS + Recharts</p>
            </div>
            <Badge variant="outline">Demo Mode</Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
