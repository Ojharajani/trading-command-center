'use client'

import React, { useState } from 'react'
import { useStore } from '@/lib/store'
import { useToast } from '@/components/ui/toast'
import { Card, CardHeader, CardTitle, CardContent, Button, Input, Label, StatCard, Dialog, Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui'
import { formatCurrency, formatPercent, formatNumber } from '@/lib/utils'
import { calculateCapitalGrowth, calculateCAGR } from '@/lib/calculations'
import { CapitalLog } from '@/lib/types'
import { Wallet, TrendingUp, Plus, Trash2, ArrowUpRight, ArrowDownRight } from 'lucide-react'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts'

export default function MoneyPage() {
  const { capitalLog, addCapitalEntry, deleteCapitalEntry } = useStore()
  const { toast } = useToast()
  const [showDialog, setShowDialog] = useState(false)
  const [form, setForm] = useState({ date: new Date().toISOString().split('T')[0], capital_amount: 0, deposits: 0, withdrawals: 0, notes: '' })

  const sorted = [...capitalLog].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  const latest = sorted.length > 0 ? sorted[sorted.length - 1] : null
  const first = sorted.length > 0 ? sorted[0] : null
  const growth = calculateCapitalGrowth(capitalLog)
  const totalDeposits = capitalLog.reduce((s, c) => s + c.deposits, 0)
  const totalWithdrawals = capitalLog.reduce((s, c) => s + c.withdrawals, 0)
  
  // CAGR
  const years = first && latest ? (new Date(latest.date).getTime() - new Date(first.date).getTime()) / (365.25 * 24 * 60 * 60 * 1000) : 1
  const cagr = first && latest ? calculateCAGR(first.capital_amount, latest.capital_amount, Math.max(years, 0.01)) : 0

  const capitalData = sorted.map(c => ({ date: c.date, capital: c.capital_amount }))
  const monthlyGrowth = sorted.map((c, i) => ({
    date: c.date,
    growth: i > 0 ? ((c.capital_amount - sorted[i - 1].capital_amount) / sorted[i - 1].capital_amount) * 100 : 0,
  }))

  const handleAdd = () => {
    addCapitalEntry(form)
    toast('Capital entry added', 'success')
    setShowDialog(false)
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard title="Current Capital" value={formatCurrency(latest?.capital_amount || 0)} icon={<Wallet className="w-5 h-5 text-primary" />} />
        <StatCard title="Capital Growth" value={formatPercent(growth)} icon={<TrendingUp className="w-5 h-5 text-success" />} trend={growth >= 0 ? 'up' : 'down'} />
        <StatCard title="Total Deposits" value={formatCurrency(totalDeposits)} icon={<ArrowUpRight className="w-5 h-5 text-success" />} />
        <StatCard title="CAGR" value={`${cagr.toFixed(1)}%`} icon={<TrendingUp className="w-5 h-5 text-primary" />} />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader><CardTitle>Capital Trend</CardTitle></CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={capitalData}>
                  <defs>
                    <linearGradient id="capGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22C55E" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#22C55E" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgb(var(--border))" />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: 'rgb(var(--muted-foreground))' }} />
                  <YAxis tick={{ fontSize: 11, fill: 'rgb(var(--muted-foreground))' }} />
                  <Tooltip contentStyle={{ background: 'rgb(var(--card))', border: '1px solid rgb(var(--border))', borderRadius: '8px', color: 'rgb(var(--foreground))' }} formatter={(v) => [formatCurrency(Number(v)), 'Capital']} />
                  <Area type="monotone" dataKey="capital" stroke="#22C55E" strokeWidth={2} fill="url(#capGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Monthly Growth %</CardTitle></CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyGrowth}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgb(var(--border))" />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: 'rgb(var(--muted-foreground))' }} />
                  <YAxis tick={{ fontSize: 11, fill: 'rgb(var(--muted-foreground))' }} />
                  <Tooltip contentStyle={{ background: 'rgb(var(--card))', border: '1px solid rgb(var(--border))', borderRadius: '8px', color: 'rgb(var(--foreground))' }} formatter={(v) => [`${Number(v).toFixed(2)}%`, 'Growth']} />
                  <Bar dataKey="growth" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Capital Log Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Capital Log</CardTitle>
          <Button size="sm" onClick={() => setShowDialog(true)}><Plus className="w-4 h-4 mr-1" /> Add Entry</Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Capital</TableHead>
                <TableHead>Deposits</TableHead>
                <TableHead>Withdrawals</TableHead>
                <TableHead>Notes</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sorted.reverse().map(entry => (
                <TableRow key={entry.id}>
                  <TableCell className="text-sm">{new Date(entry.date).toLocaleDateString('en-IN')}</TableCell>
                  <TableCell className="font-mono font-medium">{formatCurrency(entry.capital_amount)}</TableCell>
                  <TableCell className="text-success font-mono">{entry.deposits > 0 ? `+${formatCurrency(entry.deposits)}` : '—'}</TableCell>
                  <TableCell className="text-destructive font-mono">{entry.withdrawals > 0 ? `-${formatCurrency(entry.withdrawals)}` : '—'}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{entry.notes}</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" onClick={() => { deleteCapitalEntry(entry.id); toast('Entry deleted', 'info') }}>
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add Dialog */}
      <Dialog open={showDialog} onClose={() => setShowDialog(false)} title="Add Capital Entry">
        <div className="space-y-4">
          <div><Label>Date</Label><Input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} /></div>
          <div><Label>Capital Amount (₹)</Label><Input type="number" value={form.capital_amount || ''} onChange={e => setForm(f => ({ ...f, capital_amount: Number(e.target.value) }))} /></div>
          <div><Label>Deposits (₹)</Label><Input type="number" value={form.deposits || ''} onChange={e => setForm(f => ({ ...f, deposits: Number(e.target.value) }))} /></div>
          <div><Label>Withdrawals (₹)</Label><Input type="number" value={form.withdrawals || ''} onChange={e => setForm(f => ({ ...f, withdrawals: Number(e.target.value) }))} /></div>
          <div><Label>Notes</Label><Input value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} /></div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowDialog(false)}>Cancel</Button>
            <Button onClick={handleAdd}>Add Entry</Button>
          </div>
        </div>
      </Dialog>
    </div>
  )
}
