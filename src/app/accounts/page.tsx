'use client'

import React, { useState } from 'react'
import { useStore } from '@/lib/store'
import { useToast } from '@/components/ui/toast'
import { Card, CardHeader, CardTitle, CardContent, Button, Badge, Input, Label, Select, Dialog, Table, TableHeader, TableBody, TableRow, TableHead, TableCell, StatCard, Textarea } from '@/components/ui'
import { formatCurrency, formatNumber } from '@/lib/utils'
import { Account, AccountType, Segment } from '@/lib/types'
import { Landmark, Plus, Edit2, Trash2, DollarSign, Shield, TrendingUp, Activity } from 'lucide-react'

const accountTypes: AccountType[] = ['Self', 'Family', 'HUF', 'Algo', 'Prop', 'Live', 'Demo']
const segments: Segment[] = ['Cash', 'Futures', 'Options', 'CFD', 'NSE EQ', 'NSE F&O', 'MCX', 'Forex', 'Prop']

export default function AccountsPage() {
  const { accounts, trades, addAccount, updateAccount } = useStore()
  const { toast } = useToast()
  const [showDialog, setShowDialog] = useState(false)
  const [editingAccount, setEditingAccount] = useState<Account | null>(null)
  const [form, setForm] = useState<Partial<Account>>({
    account_name: '', broker: '', account_type: 'Self', segment: 'Cash',
    initial_capital: 0, current_balance: 0,
    max_risk_per_trade: 1, max_daily_loss: 3, max_weekly_loss: 7,
    max_drawdown: 15, max_positions: 3, is_active: true, notes: '',
  })

  const totalCapital = accounts.reduce((s, a) => s + a.current_balance, 0)
  const activeAccounts = accounts.filter(a => a.is_active)
  const totalInitial = accounts.reduce((s, a) => s + a.initial_capital, 0)
  const totalGain = totalCapital - totalInitial

  const openAdd = () => {
    setEditingAccount(null)
    setForm({
      account_name: '', broker: '', account_type: 'Self', segment: 'Cash',
      initial_capital: 0, current_balance: 0,
      max_risk_per_trade: 1, max_daily_loss: 3, max_weekly_loss: 7,
      max_drawdown: 15, max_positions: 3, is_active: true, notes: '',
    })
    setShowDialog(true)
  }

  const openEdit = (account: Account) => {
    setEditingAccount(account)
    setForm({ ...account })
    setShowDialog(true)
  }

  const handleSave = () => {
    if (!form.account_name || !form.broker) {
      toast('Account name and broker are required', 'error')
      return
    }
    if (editingAccount) {
      updateAccount(editingAccount.account_id, form)
      toast('Account updated', 'success')
    } else {
      addAccount(form as Omit<Account, 'account_id' | 'created_at'>)
      toast('Account added', 'success')
    }
    setShowDialog(false)
  }

  // Per-account trade stats
  const getAccountStats = (accountId: string) => {
    const acctTrades = trades.filter(t => t.account_id === accountId)
    const wins = acctTrades.filter(t => t.e_result === 'Win').length
    const closed = acctTrades.filter(t => t.e_result).length
    return {
      tradeCount: acctTrades.length,
      openTrades: acctTrades.filter(t => !t.e_result).length,
      winRate: closed > 0 ? (wins / closed) * 100 : 0,
      totalPnl: acctTrades.reduce((s, t) => s + (t.e_net_pnl || 0), 0),
    }
  }

  const setF = (key: string, value: unknown) => setForm(f => ({ ...f, [key]: value }))

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard title="Total Capital" value={formatCurrency(totalCapital)} icon={<DollarSign className="w-5 h-5 text-primary" />} />
        <StatCard title="Active Accounts" value={activeAccounts.length} icon={<Landmark className="w-5 h-5 text-success" />} />
        <StatCard title="Total Gain/Loss" value={formatCurrency(totalGain)} icon={<TrendingUp className="w-5 h-5 text-success" />} trend={totalGain >= 0 ? 'up' : 'down'} />
        <StatCard title="Total Trades" value={trades.length} icon={<Activity className="w-5 h-5 text-primary" />} />
      </div>

      {/* Toolbar */}
      <div className="flex justify-end">
        <Button size="sm" onClick={openAdd}><Plus className="w-4 h-4 mr-1" /> Add Account</Button>
      </div>

      {/* Account Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {accounts.map(account => {
          const stats = getAccountStats(account.account_id)
          const growth = account.initial_capital > 0 ? ((account.current_balance - account.initial_capital) / account.initial_capital) * 100 : 0
          return (
            <Card key={account.account_id} className="card-hover relative overflow-hidden">
              {/* Active indicator */}
              {account.is_active && <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary to-primary/50" />}
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Landmark className="w-4 h-4 text-primary" />
                      {account.account_name}
                    </CardTitle>
                    <p className="text-xs text-muted-foreground mt-0.5">{account.broker} • {account.segment}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Badge variant={account.is_active ? 'success' : 'secondary'}>
                      {account.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                    <Button variant="ghost" size="icon" onClick={() => openEdit(account)}><Edit2 className="w-3.5 h-3.5" /></Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* Balance */}
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">Current Balance</p>
                    <p className="text-xl font-bold">{formatCurrency(account.current_balance)}</p>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-semibold ${growth >= 0 ? 'text-success' : 'text-destructive'}`}>
                      {growth >= 0 ? '+' : ''}{growth.toFixed(1)}%
                    </p>
                    <p className="text-[10px] text-muted-foreground">from {formatCurrency(account.initial_capital)}</p>
                  </div>
                </div>

                {/* Risk Limits */}
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="p-1.5 rounded bg-secondary/50">
                    <p className="text-[10px] text-muted-foreground">Risk/Trade</p>
                    <p className="text-xs font-bold">{account.max_risk_per_trade}%</p>
                  </div>
                  <div className="p-1.5 rounded bg-secondary/50">
                    <p className="text-[10px] text-muted-foreground">Daily Loss</p>
                    <p className="text-xs font-bold">{account.max_daily_loss}%</p>
                  </div>
                  <div className="p-1.5 rounded bg-secondary/50">
                    <p className="text-[10px] text-muted-foreground">Max DD</p>
                    <p className="text-xs font-bold">{account.max_drawdown}%</p>
                  </div>
                </div>

                {/* Trade Stats */}
                <div className="flex items-center justify-between text-xs border-t border-border pt-2">
                  <span className="text-muted-foreground">{stats.tradeCount} trades ({stats.openTrades} open)</span>
                  <span className={stats.winRate >= 50 ? 'text-success font-medium' : 'text-destructive font-medium'}>
                    WR: {stats.winRate.toFixed(0)}%
                  </span>
                  <span className={`font-mono font-medium ${stats.totalPnl >= 0 ? 'text-success' : 'text-destructive'}`}>
                    {formatCurrency(stats.totalPnl)}
                  </span>
                </div>

                {/* Account type badge */}
                <div className="flex gap-1.5">
                  <Badge variant="outline" className="text-[10px]">{account.account_type}</Badge>
                  <Badge variant="outline" className="text-[10px]">{account.account_id}</Badge>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={showDialog} onClose={() => setShowDialog(false)} title={editingAccount ? `Edit Account — ${editingAccount.account_id}` : 'Add Account'} maxWidth="max-w-2xl">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Account Name *</Label><Input value={form.account_name || ''} onChange={e => setF('account_name', e.target.value)} placeholder="My Trading A/C" /></div>
            <div><Label>Broker *</Label><Input value={form.broker || ''} onChange={e => setF('broker', e.target.value)} placeholder="Zerodha, FXTM..." /></div>
            <div><Label>Account Type</Label><Select options={accountTypes.map(t => ({ value: t, label: t }))} value={form.account_type || 'Self'} onChange={e => setF('account_type', e.target.value)} /></div>
            <div><Label>Segment</Label><Select options={segments.map(s => ({ value: s, label: s }))} value={form.segment || 'Cash'} onChange={e => setF('segment', e.target.value)} /></div>
            <div><Label>Initial Capital (₹)</Label><Input type="number" value={form.initial_capital || ''} onChange={e => setF('initial_capital', Number(e.target.value))} /></div>
            <div><Label>Current Balance (₹)</Label><Input type="number" value={form.current_balance || ''} onChange={e => setF('current_balance', Number(e.target.value))} /></div>
          </div>

          <p className="text-xs font-semibold text-primary uppercase tracking-wider border-b border-border pb-1 pt-2">Risk Limits</p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <div><Label>Max Risk/Trade (%)</Label><Input type="number" step="0.5" value={form.max_risk_per_trade || ''} onChange={e => setF('max_risk_per_trade', Number(e.target.value))} /></div>
            <div><Label>Max Daily Loss (%)</Label><Input type="number" step="0.5" value={form.max_daily_loss || ''} onChange={e => setF('max_daily_loss', Number(e.target.value))} /></div>
            <div><Label>Max Weekly Loss (%)</Label><Input type="number" step="0.5" value={form.max_weekly_loss || ''} onChange={e => setF('max_weekly_loss', Number(e.target.value))} /></div>
            <div><Label>Max Drawdown (%)</Label><Input type="number" step="0.5" value={form.max_drawdown || ''} onChange={e => setF('max_drawdown', Number(e.target.value))} /></div>
            <div><Label>Max Positions</Label><Input type="number" value={form.max_positions || ''} onChange={e => setF('max_positions', Number(e.target.value))} /></div>
            <label className="flex items-center gap-2 text-sm cursor-pointer p-2 pt-6"><input type="checkbox" checked={form.is_active || false} onChange={e => setF('is_active', e.target.checked)} className="rounded" /> Active Account</label>
          </div>

          <div><Label>Notes</Label><Textarea value={form.notes || ''} onChange={e => setF('notes', e.target.value)} placeholder="Account-specific notes..." rows={2} /></div>

          <div className="flex justify-end gap-2 pt-2 border-t border-border">
            <Button variant="outline" onClick={() => setShowDialog(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={!form.account_name || !form.broker}>
              {editingAccount ? 'Update' : 'Add'} Account
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  )
}
