'use client'

import React, { useState } from 'react'
import { useStore } from '@/lib/store'
import { useToast } from '@/components/ui/toast'
import { Card, CardHeader, CardTitle, CardContent, Button, Badge, Input, Label, Select, StatCard, Dialog, Table, TableHeader, TableBody, TableRow, TableHead, TableCell, Textarea } from '@/components/ui'
import { formatCurrency, formatPercent } from '@/lib/utils'
import { PortfolioItem } from '@/lib/types'
import { TrendingUp, TrendingDown, Plus, Edit2, Trash2, PieChart as PieIcon, Briefcase } from 'lucide-react'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'

const COLORS = ['#3B82F6', '#22C55E', '#F97316', '#8B5CF6', '#EC4899', '#EAB308', '#06B6D4', '#EF4444']

export default function InvestmentsPage() {
  const { portfolio, addPortfolioItem, updatePortfolioItem, deletePortfolioItem } = useStore()
  const { toast } = useToast()
  const [showDialog, setShowDialog] = useState(false)
  const [editingItem, setEditingItem] = useState<PortfolioItem | null>(null)
  const [form, setForm] = useState<Partial<PortfolioItem>>({
    symbol: '', quantity: 0, avg_buy_price: 0, current_price: 0, sector: '',
    investment_thesis: '', buy_date: '', target_price: 0, stop_loss: 0,
  })

  const totalInvested = portfolio.reduce((s, p) => s + (p.avg_buy_price * p.quantity), 0)
  const totalCurrent = portfolio.reduce((s, p) => s + (p.current_price * p.quantity), 0)
  const totalPnL = totalCurrent - totalInvested
  const totalReturn = totalInvested > 0 ? (totalPnL / totalInvested) * 100 : 0

  // Sector allocation
  const sectorMap = new Map<string, number>()
  portfolio.forEach(p => {
    const value = p.current_price * p.quantity
    sectorMap.set(p.sector, (sectorMap.get(p.sector) || 0) + value)
  })
  const sectorData = Array.from(sectorMap.entries()).map(([name, value]) => ({ name, value }))

  const openAdd = () => {
    setEditingItem(null)
    setForm({ symbol: '', quantity: 0, avg_buy_price: 0, current_price: 0, sector: '', investment_thesis: '', buy_date: new Date().toISOString().split('T')[0], target_price: 0, stop_loss: 0 })
    setShowDialog(true)
  }

  const openEdit = (item: PortfolioItem) => {
    setEditingItem(item); setForm({ ...item }); setShowDialog(true)
  }

  const handleSave = () => {
    if (editingItem) {
      updatePortfolioItem(editingItem.id, form)
      toast('Investment updated', 'success')
    } else {
      addPortfolioItem(form as Omit<PortfolioItem, 'id'>)
      toast('Investment added', 'success')
    }
    setShowDialog(false)
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard title="Total Invested" value={formatCurrency(totalInvested)} icon={<Briefcase className="w-5 h-5 text-primary" />} />
        <StatCard title="Current Value" value={formatCurrency(totalCurrent)} icon={<TrendingUp className="w-5 h-5 text-success" />} />
        <StatCard title="Unrealized PnL" value={formatCurrency(totalPnL)} trend={totalPnL >= 0 ? 'up' : 'down'} trendValue={formatPercent(totalReturn)} />
        <StatCard title="Holdings" value={portfolio.length} icon={<PieIcon className="w-5 h-5 text-primary" />} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Portfolio Table */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Portfolio Holdings</CardTitle>
            <Button size="sm" onClick={openAdd}><Plus className="w-4 h-4 mr-1" /> Add</Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Symbol</TableHead>
                  <TableHead>Qty</TableHead>
                  <TableHead>Avg Price</TableHead>
                  <TableHead>CMP</TableHead>
                  <TableHead>Value</TableHead>
                  <TableHead className="text-right">PnL</TableHead>
                  <TableHead>Return %</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {portfolio.map(item => {
                  const invested = item.avg_buy_price * item.quantity
                  const current = item.current_price * item.quantity
                  const pnl = current - invested
                  const ret = invested > 0 ? (pnl / invested) * 100 : 0
                  return (
                    <TableRow key={item.id}>
                      <TableCell className="font-semibold">{item.symbol}</TableCell>
                      <TableCell>{item.quantity}</TableCell>
                      <TableCell className="font-mono text-xs">{formatCurrency(item.avg_buy_price)}</TableCell>
                      <TableCell className="font-mono text-xs">{formatCurrency(item.current_price)}</TableCell>
                      <TableCell className="font-mono">{formatCurrency(current)}</TableCell>
                      <TableCell className={`text-right font-mono font-medium ${pnl >= 0 ? 'text-success' : 'text-destructive'}`}>
                        {formatCurrency(pnl)}
                      </TableCell>
                      <TableCell>
                        <Badge variant={ret >= 0 ? 'success' : 'destructive'}>{formatPercent(ret)}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" onClick={() => openEdit(item)}><Edit2 className="w-4 h-4" /></Button>
                          <Button variant="ghost" size="icon" onClick={() => { deletePortfolioItem(item.id); toast('Removed', 'info') }}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Sector Allocation Pie */}
        <Card>
          <CardHeader><CardTitle>Sector Allocation</CardTitle></CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={sectorData} cx="50%" cy="50%" innerRadius={50} outerRadius={90} dataKey="value" label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}>
                    {sectorData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={(v) => formatCurrency(Number(v))} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog open={showDialog} onClose={() => setShowDialog(false)} title={editingItem ? 'Edit Investment' : 'Add Investment'} maxWidth="max-w-2xl">
        <div className="grid grid-cols-2 gap-4">
          <div><Label>Symbol</Label><Input value={form.symbol || ''} onChange={e => setForm(f => ({ ...f, symbol: e.target.value.toUpperCase() }))} /></div>
          <div><Label>Quantity</Label><Input type="number" value={form.quantity || ''} onChange={e => setForm(f => ({ ...f, quantity: Number(e.target.value) }))} /></div>
          <div><Label>Avg Buy Price</Label><Input type="number" value={form.avg_buy_price || ''} onChange={e => setForm(f => ({ ...f, avg_buy_price: Number(e.target.value) }))} /></div>
          <div><Label>Current Price</Label><Input type="number" value={form.current_price || ''} onChange={e => setForm(f => ({ ...f, current_price: Number(e.target.value) }))} /></div>
          <div><Label>Sector</Label><Input value={form.sector || ''} onChange={e => setForm(f => ({ ...f, sector: e.target.value }))} /></div>
          <div><Label>Buy Date</Label><Input type="date" value={form.buy_date || ''} onChange={e => setForm(f => ({ ...f, buy_date: e.target.value }))} /></div>
          <div><Label>Target Price</Label><Input type="number" value={form.target_price || ''} onChange={e => setForm(f => ({ ...f, target_price: Number(e.target.value) }))} /></div>
          <div><Label>Stop Loss</Label><Input type="number" value={form.stop_loss || ''} onChange={e => setForm(f => ({ ...f, stop_loss: Number(e.target.value) }))} /></div>
          <div className="col-span-2"><Label>Investment Thesis</Label><Textarea value={form.investment_thesis || ''} onChange={e => setForm(f => ({ ...f, investment_thesis: e.target.value }))} /></div>
          <div className="col-span-2 flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowDialog(false)}>Cancel</Button>
            <Button onClick={handleSave}>{editingItem ? 'Update' : 'Add'}</Button>
          </div>
        </div>
      </Dialog>
    </div>
  )
}
