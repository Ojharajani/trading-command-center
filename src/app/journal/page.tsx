'use client'

import React, { useState, useMemo } from 'react'
import { useStore } from '@/lib/store'
import { useToast } from '@/components/ui/toast'
import { Card, CardHeader, CardTitle, CardContent, Button, Badge, Input, Select, Dialog, Label, Table, TableHeader, TableBody, TableRow, TableHead, TableCell, Textarea, StatCard, Tabs } from '@/components/ui'
import { formatCurrency, formatPercent, formatNumber } from '@/lib/utils'
import { calculateWinRate, calculateProfitFactor, calculateExpectancy, calculateAvgRR, calculateRRRatio, calculatePnL, getMonthlyPnL, getEquityCurve, getStrategyPerformance } from '@/lib/calculations'
import { Trade, TradeDirection, TradeResult, EmotionType, MistakeType, Timeframe } from '@/lib/types'
import { Plus, Download, Edit2, Trash2, TrendingUp, TrendingDown, BarChart3, PieChart as PieChartIcon } from 'lucide-react'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart, PieChart, Pie, Cell } from 'recharts'
import Papa from 'papaparse'

const COLORS = ['#22C55E', '#EF4444', '#3B82F6', '#F97316', '#8B5CF6', '#EC4899']

export default function JournalPage() {
  const { trades, zones, addTrade, updateTrade, deleteTrade } = useStore()
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState('trades')
  const [showDialog, setShowDialog] = useState(false)
  const [editingTrade, setEditingTrade] = useState<Trade | null>(null)
  const [form, setForm] = useState<Partial<Trade>>({
    symbol: '', direction: 'Long', setup: '', zone_id: null,
    entry_price: 0, stop_loss: 0, target_price: 0, exit_price: 0,
    position_size: 0, risk_percent: 1, timeframe: 'Daily',
    emotion_before: 'Neutral', emotion_after: 'Neutral',
    confidence: 7, discipline_score: 7, mistake_type: 'No Mistake', notes: '',
  })

  const sortedTrades = useMemo(() =>
    [...trades].sort((a, b) => new Date(b.date_time).getTime() - new Date(a.date_time).getTime()),
    [trades]
  )

  const winRate = calculateWinRate(trades)
  const profitFactor = calculateProfitFactor(trades)
  const expectancy = calculateExpectancy(trades)
  const avgRR = calculateAvgRR(trades)
  const totalPnL = trades.reduce((s, t) => s + t.pnl, 0)
  const monthlyPnL = getMonthlyPnL(trades)
  const equityCurve = getEquityCurve(trades)
  const strategyPerf = getStrategyPerformance(trades)

  // Win/Loss pie
  const winLossData = [
    { name: 'Win', value: trades.filter(t => t.result === 'Win').length },
    { name: 'Loss', value: trades.filter(t => t.result === 'Loss').length },
    { name: 'BE', value: trades.filter(t => t.result === 'Breakeven').length },
  ].filter(d => d.value > 0)

  // RR distribution
  const rrBuckets = [
    { range: '0-1', count: trades.filter(t => t.rr_ratio >= 0 && t.rr_ratio < 1).length },
    { range: '1-2', count: trades.filter(t => t.rr_ratio >= 1 && t.rr_ratio < 2).length },
    { range: '2-3', count: trades.filter(t => t.rr_ratio >= 2 && t.rr_ratio < 3).length },
    { range: '3-4', count: trades.filter(t => t.rr_ratio >= 3 && t.rr_ratio < 4).length },
    { range: '4+', count: trades.filter(t => t.rr_ratio >= 4).length },
  ]

  const openAdd = () => {
    setEditingTrade(null)
    setForm({
      date_time: new Date().toISOString().slice(0, 16),
      symbol: '', direction: 'Long', setup: '', zone_id: null,
      entry_price: 0, stop_loss: 0, target_price: 0, exit_price: 0,
      position_size: 0, risk_percent: 1, timeframe: 'Daily',
      emotion_before: 'Neutral', emotion_after: 'Neutral',
      confidence: 7, discipline_score: 7, mistake_type: 'No Mistake', notes: '',
    })
    setShowDialog(true)
  }

  const openEdit = (trade: Trade) => {
    setEditingTrade(trade)
    setForm({ ...trade, date_time: trade.date_time.slice(0, 16) })
    setShowDialog(true)
  }

  const handleSave = () => {
    const entry = form.entry_price || 0
    const sl = form.stop_loss || 0
    const target = form.target_price || 0
    const exit = form.exit_price || 0
    const qty = form.position_size || 0
    const direction = form.direction || 'Long'

    const rr = calculateRRRatio(entry, sl, target)
    const pnl = calculatePnL(entry, exit, qty, direction)
    const result: TradeResult = pnl > 0 ? 'Win' : pnl < 0 ? 'Loss' : 'Breakeven'

    const tradeData = {
      ...form,
      rr_ratio: rr,
      pnl,
      result,
      date_time: form.date_time || new Date().toISOString(),
    } as Omit<Trade, 'id' | 'created_at'>

    if (editingTrade) {
      updateTrade(editingTrade.id, tradeData)
      toast('Trade updated', 'success')
    } else {
      addTrade(tradeData)
      toast('Trade added', 'success')
    }
    setShowDialog(false)
  }

  const exportCSV = () => {
    const csv = Papa.unparse(trades.map(t => ({
      ID: t.id, Date: t.date_time, Symbol: t.symbol, Direction: t.direction, Setup: t.setup,
      Entry: t.entry_price, SL: t.stop_loss, Target: t.target_price, Exit: t.exit_price,
      Qty: t.position_size, RiskPct: t.risk_percent, RR: t.rr_ratio.toFixed(2), PnL: t.pnl,
      Result: t.result, Emotion_Before: t.emotion_before, Emotion_After: t.emotion_after,
      Confidence: t.confidence, Discipline: t.discipline_score, Mistake: t.mistake_type, Notes: t.notes,
    })))
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url; a.download = 'trades.csv'; a.click()
    toast('Trades exported', 'success')
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <StatCard title="Total PnL" value={formatCurrency(totalPnL)} trend={totalPnL >= 0 ? 'up' : 'down'} />
        <StatCard title="Win Rate" value={`${winRate.toFixed(1)}%`} trend={winRate >= 50 ? 'up' : 'down'} />
        <StatCard title="Profit Factor" value={profitFactor === Infinity ? '∞' : profitFactor.toFixed(2)} />
        <StatCard title="Expectancy" value={formatCurrency(expectancy)} trend={expectancy >= 0 ? 'up' : 'down'} />
        <StatCard title="Avg RR" value={avgRR.toFixed(2)} />
      </div>

      {/* Tabs */}
      <div className="flex items-center justify-between">
        <Tabs
          tabs={[
            { id: 'trades', label: 'Trade Log' },
            { id: 'charts', label: 'Analytics' },
          ]}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={exportCSV}><Download className="w-4 h-4 mr-1" /> CSV</Button>
          <Button size="sm" onClick={openAdd}><Plus className="w-4 h-4 mr-1" /> Add Trade</Button>
        </div>
      </div>

      {activeTab === 'trades' && (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Symbol</TableHead>
                  <TableHead>Dir</TableHead>
                  <TableHead>Setup</TableHead>
                  <TableHead>Entry</TableHead>
                  <TableHead>Exit</TableHead>
                  <TableHead>RR</TableHead>
                  <TableHead className="text-right">PnL</TableHead>
                  <TableHead>Result</TableHead>
                  <TableHead>Disc.</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedTrades.map(trade => (
                  <TableRow key={trade.id}>
                    <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                      {new Date(trade.date_time).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: '2-digit' })}
                    </TableCell>
                    <TableCell className="font-semibold">{trade.symbol}</TableCell>
                    <TableCell>
                      <Badge variant={trade.direction === 'Long' ? 'success' : 'destructive'}>{trade.direction}</Badge>
                    </TableCell>
                    <TableCell className="text-sm">{trade.setup}</TableCell>
                    <TableCell className="font-mono text-xs">{formatNumber(trade.entry_price)}</TableCell>
                    <TableCell className="font-mono text-xs">{formatNumber(trade.exit_price)}</TableCell>
                    <TableCell className="font-mono">{trade.rr_ratio.toFixed(1)}</TableCell>
                    <TableCell className={`text-right font-mono font-medium ${trade.pnl >= 0 ? 'text-success' : 'text-destructive'}`}>
                      {formatCurrency(trade.pnl)}
                    </TableCell>
                    <TableCell>
                      <Badge variant={trade.result === 'Win' ? 'success' : trade.result === 'Loss' ? 'destructive' : 'secondary'}>
                        {trade.result}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className={`font-medium ${trade.discipline_score >= 7 ? 'text-success' : trade.discipline_score >= 5 ? 'text-warning' : 'text-destructive'}`}>
                        {trade.discipline_score}/10
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" onClick={() => openEdit(trade)}><Edit2 className="w-4 h-4" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => { deleteTrade(trade.id); toast('Trade deleted', 'info') }}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {activeTab === 'charts' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Equity Curve */}
          <Card>
            <CardHeader><CardTitle>Equity Curve</CardTitle></CardHeader>
            <CardContent>
              <div className="h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={equityCurve}>
                    <defs>
                      <linearGradient id="eqGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgb(var(--border))" />
                    <XAxis dataKey="date" tick={{ fontSize: 11, fill: 'rgb(var(--muted-foreground))' }} />
                    <YAxis tick={{ fontSize: 11, fill: 'rgb(var(--muted-foreground))' }} />
                    <Tooltip contentStyle={{ background: 'rgb(var(--card))', border: '1px solid rgb(var(--border))', borderRadius: '8px', color: 'rgb(var(--foreground))' }} />
                    <Area type="monotone" dataKey="equity" stroke="#3B82F6" strokeWidth={2} fill="url(#eqGrad)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Monthly PnL */}
          <Card>
            <CardHeader><CardTitle>Monthly PnL</CardTitle></CardHeader>
            <CardContent>
              <div className="h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyPnL}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgb(var(--border))" />
                    <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'rgb(var(--muted-foreground))' }} />
                    <YAxis tick={{ fontSize: 11, fill: 'rgb(var(--muted-foreground))' }} />
                    <Tooltip contentStyle={{ background: 'rgb(var(--card))', border: '1px solid rgb(var(--border))', borderRadius: '8px', color: 'rgb(var(--foreground))' }} />
                    <Bar dataKey="pnl" fill="#3B82F6" radius={[4, 4, 0, 0]}>
                      {monthlyPnL.map((entry, i) => (
                        <Cell key={i} fill={entry.pnl >= 0 ? '#22C55E' : '#EF4444'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Win/Loss Pie */}
          <Card>
            <CardHeader><CardTitle>Win/Loss Distribution</CardTitle></CardHeader>
            <CardContent>
              <div className="h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={winLossData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                      {winLossData.map((_, i) => (
                        <Cell key={i} fill={COLORS[i]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* RR Distribution */}
          <Card>
            <CardHeader><CardTitle>RR Distribution</CardTitle></CardHeader>
            <CardContent>
              <div className="h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={rrBuckets}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgb(var(--border))" />
                    <XAxis dataKey="range" tick={{ fontSize: 11, fill: 'rgb(var(--muted-foreground))' }} />
                    <YAxis tick={{ fontSize: 11, fill: 'rgb(var(--muted-foreground))' }} />
                    <Tooltip contentStyle={{ background: 'rgb(var(--card))', border: '1px solid rgb(var(--border))', borderRadius: '8px', color: 'rgb(var(--foreground))' }} />
                    <Bar dataKey="count" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Strategy Performance */}
          <Card className="lg:col-span-2">
            <CardHeader><CardTitle>Strategy Performance</CardTitle></CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Strategy</TableHead>
                    <TableHead>Trades</TableHead>
                    <TableHead>Win Rate</TableHead>
                    <TableHead className="text-right">PnL</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {strategyPerf.sort((a, b) => b.pnl - a.pnl).map(s => (
                    <TableRow key={s.strategy}>
                      <TableCell className="font-medium">{s.strategy}</TableCell>
                      <TableCell>{s.count}</TableCell>
                      <TableCell>
                        <span className={s.winRate >= 50 ? 'text-success' : 'text-destructive'}>{s.winRate.toFixed(0)}%</span>
                      </TableCell>
                      <TableCell className={`text-right font-mono font-medium ${s.pnl >= 0 ? 'text-success' : 'text-destructive'}`}>
                        {formatCurrency(s.pnl)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={showDialog} onClose={() => setShowDialog(false)} title={editingTrade ? 'Edit Trade' : 'Add Trade'} maxWidth="max-w-3xl">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div>
            <Label>Date & Time</Label>
            <Input type="datetime-local" value={form.date_time || ''} onChange={e => setForm(f => ({ ...f, date_time: e.target.value }))} />
          </div>
          <div>
            <Label>Symbol</Label>
            <Input value={form.symbol || ''} onChange={e => setForm(f => ({ ...f, symbol: e.target.value.toUpperCase() }))} placeholder="NIFTY" />
          </div>
          <div>
            <Label>Direction</Label>
            <Select options={[{ value: 'Long', label: 'Long' }, { value: 'Short', label: 'Short' }]} value={form.direction} onChange={e => setForm(f => ({ ...f, direction: e.target.value as TradeDirection }))} />
          </div>
          <div>
            <Label>Setup / Strategy</Label>
            <Input value={form.setup || ''} onChange={e => setForm(f => ({ ...f, setup: e.target.value }))} placeholder="Zone Entry" />
          </div>
          <div>
            <Label>Linked Zone</Label>
            <Select
              options={[{ value: '', label: 'None' }, ...zones.map(z => ({ value: z.id, label: `${z.id} — ${z.symbol} (${z.zone_type})` }))]}
              value={form.zone_id || ''}
              onChange={e => setForm(f => ({ ...f, zone_id: e.target.value || null }))}
            />
          </div>
          <div>
            <Label>Timeframe</Label>
            <Select options={(['Monthly', 'Weekly', 'Daily', '4H', '1H', '15M'] as Timeframe[]).map(t => ({ value: t, label: t }))} value={form.timeframe} onChange={e => setForm(f => ({ ...f, timeframe: e.target.value as Timeframe }))} />
          </div>
          <div>
            <Label>Entry Price</Label>
            <Input type="number" step="0.01" value={form.entry_price || ''} onChange={e => setForm(f => ({ ...f, entry_price: Number(e.target.value) }))} />
          </div>
          <div>
            <Label>Stop Loss</Label>
            <Input type="number" step="0.01" value={form.stop_loss || ''} onChange={e => setForm(f => ({ ...f, stop_loss: Number(e.target.value) }))} />
          </div>
          <div>
            <Label>Target Price</Label>
            <Input type="number" step="0.01" value={form.target_price || ''} onChange={e => setForm(f => ({ ...f, target_price: Number(e.target.value) }))} />
          </div>
          <div>
            <Label>Exit Price</Label>
            <Input type="number" step="0.01" value={form.exit_price || ''} onChange={e => setForm(f => ({ ...f, exit_price: Number(e.target.value) }))} />
          </div>
          <div>
            <Label>Position Size (Qty)</Label>
            <Input type="number" value={form.position_size || ''} onChange={e => setForm(f => ({ ...f, position_size: Number(e.target.value) }))} />
          </div>
          <div>
            <Label>Risk % of Capital</Label>
            <Input type="number" step="0.1" value={form.risk_percent || ''} onChange={e => setForm(f => ({ ...f, risk_percent: Number(e.target.value) }))} />
          </div>
          <div>
            <Label>Emotion Before</Label>
            <Select options={(['Fear', 'Greed', 'Neutral', 'Confident', 'Anxious'] as EmotionType[]).map(e => ({ value: e, label: e }))} value={form.emotion_before} onChange={e => setForm(f => ({ ...f, emotion_before: e.target.value as EmotionType }))} />
          </div>
          <div>
            <Label>Emotion After</Label>
            <Select options={(['Fear', 'Greed', 'Neutral', 'Confident', 'Anxious'] as EmotionType[]).map(e => ({ value: e, label: e }))} value={form.emotion_after} onChange={e => setForm(f => ({ ...f, emotion_after: e.target.value as EmotionType }))} />
          </div>
          <div>
            <Label>Confidence (1-10)</Label>
            <Input type="number" min={1} max={10} value={form.confidence || ''} onChange={e => setForm(f => ({ ...f, confidence: Number(e.target.value) }))} />
          </div>
          <div>
            <Label>Discipline Score (1-10)</Label>
            <Input type="number" min={1} max={10} value={form.discipline_score || ''} onChange={e => setForm(f => ({ ...f, discipline_score: Number(e.target.value) }))} />
          </div>
          <div>
            <Label>Mistake Type</Label>
            <Select options={(['No Mistake', 'FOMO Entry', 'Early Exit', 'Oversized', 'Moved SL', 'Skipped Trade', 'Chased Price', 'Revenge Trade', 'Other'] as MistakeType[]).map(m => ({ value: m, label: m }))} value={form.mistake_type} onChange={e => setForm(f => ({ ...f, mistake_type: e.target.value as MistakeType }))} />
          </div>
          {/* Auto-calculated preview */}
          <div className="p-3 rounded-lg bg-secondary/50">
            <p className="text-xs text-muted-foreground mb-1">Auto-calculated</p>
            <p className="text-sm">RR: <span className="font-bold">{calculateRRRatio(form.entry_price || 0, form.stop_loss || 0, form.target_price || 0).toFixed(2)}</span></p>
            <p className="text-sm">PnL: <span className={`font-bold ${calculatePnL(form.entry_price || 0, form.exit_price || 0, form.position_size || 0, form.direction || 'Long') >= 0 ? 'text-success' : 'text-destructive'}`}>
              {formatCurrency(calculatePnL(form.entry_price || 0, form.exit_price || 0, form.position_size || 0, form.direction || 'Long'))}
            </span></p>
          </div>
          <div className="col-span-2 md:col-span-3">
            <Label>Notes</Label>
            <Textarea value={form.notes || ''} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="Trade notes..." />
          </div>
          <div className="col-span-2 md:col-span-3 flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setShowDialog(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={!form.symbol || !form.entry_price}>{editingTrade ? 'Update' : 'Add'} Trade</Button>
          </div>
        </div>
      </Dialog>
    </div>
  )
}
