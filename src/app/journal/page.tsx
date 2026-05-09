'use client'

import React, { useState, useMemo } from 'react'
import { useStore } from '@/lib/store'
import { useToast } from '@/components/ui/toast'
import { Card, CardHeader, CardTitle, CardContent, Button, Badge, Input, Select, Dialog, Label, Table, TableHeader, TableBody, TableRow, TableHead, TableCell, Textarea, StatCard, Tabs } from '@/components/ui'
import { formatCurrency, formatPercent, formatNumber } from '@/lib/utils'
import { calculateWinRate, calculateProfitFactor, calculateExpectancy, calculatePlanAdherenceScore, calculateDisciplineScore, calculateRRRatio, getMonthlyPnL, getEquityCurve, getStrategyPerformance } from '@/lib/calculations'
import { Trade, TradeHorizon, ExitType, EmotionType, MistakeType, MarketSession, MarketRegime, Segment } from '@/lib/types'
import { Plus, Download, Edit2, Trash2, TrendingUp, TrendingDown, BarChart3, ChevronDown, ChevronRight, BookOpen, Target, Shield, Brain, FileText, Globe, Gauge, AlertTriangle, Crosshair, Activity, Layers, LineChart as LineChartIcon } from 'lucide-react'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart, PieChart, Pie, Cell } from 'recharts'
import Papa from 'papaparse'

const COLORS = ['#22C55E', '#EF4444', '#3B82F6', '#F97316', '#8B5CF6', '#EC4899']

// ── Collapsible Section ─────────────────────────
function Section({ title, icon, children, defaultOpen = false, badge, color }: { title: string; icon: React.ReactNode; children: React.ReactNode; defaultOpen?: boolean; badge?: string; color?: string }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between p-3 bg-secondary/30 hover:bg-secondary/50 transition-colors">
        <div className="flex items-center gap-2">
          {icon}
          <span className={`text-sm font-semibold ${color || ''}`}>{title}</span>
          {badge && <Badge variant="outline" className="text-[10px] h-5">{badge}</Badge>}
        </div>
        {open ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
      </button>
      {open && <div className="p-4 space-y-3">{children}</div>}
    </div>
  )
}

// ── Options ─────────────────────────────────────
const emotionOptions: EmotionType[] = ['Fear', 'Greed', 'Neutral', 'Confident', 'Anxious', 'FOMO', 'Hopeful', 'Impatient', 'Calm']
const mistakeOptions: MistakeType[] = ['No Mistake', 'FOMO Entry', 'Early Exit', 'Oversized', 'Moved SL', 'Skipped Trade', 'Chased Price', 'Revenge Trade', 'Other']
const exitTypes: ExitType[] = ['SL Hit', 'Target Hit', 'Manual', 'Trailing SL', 'Partial', 'Time-Based', 'Error']
const horizons: TradeHorizon[] = ['Intraday', 'Swing', 'Positional', 'BTST']
const sessions: MarketSession[] = ['India', 'London', 'NY', 'Asia']
const regimes: MarketRegime[] = ['Trending', 'Ranging', 'Volatile', 'News-driven']
const segments: Segment[] = ['NSE EQ', 'NSE F&O', 'MCX', 'Forex', 'CFD', 'Prop']

export default function JournalPage() {
  const { trades, zones, accounts, addTrade, updateTrade, deleteTrade, getZoneBankFields, updateZonePerformance } = useStore()
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState('trades')
  const [showDialog, setShowDialog] = useState(false)
  const [editingTrade, setEditingTrade] = useState<Trade | null>(null)
  const [form, setForm] = useState<Partial<Trade>>({})

  const sortedTrades = useMemo(() =>
    [...trades].sort((a, b) => new Date(b.entry_datetime).getTime() - new Date(a.entry_datetime).getTime()),
    [trades]
  )

  // ── KPI Calculations ─────────────────────────
  const closedTrades = trades.filter(t => t.e_result)
  const winRate = calculateWinRate(trades)
  const profitFactor = calculateProfitFactor(trades)
  const expectancy = calculateExpectancy(trades)
  const totalPnL = trades.reduce((s, t) => s + (t.e_net_pnl || 0), 0)
  const avgRMultiple = closedTrades.length > 0 ? closedTrades.reduce((s, t) => s + (t.e_r_multiple || 0), 0) / closedTrades.length : 0
  const avgCapture = closedTrades.filter(t => t.i_capture_efficiency_pct !== undefined)
  const captureEff = avgCapture.length > 0 ? avgCapture.reduce((s, t) => s + (t.i_capture_efficiency_pct || 0), 0) / avgCapture.length : 0
  const planTrades = closedTrades.filter(t => t.j_plan_adherence_score_pct !== undefined)
  const planAdherence = planTrades.length > 0 ? planTrades.reduce((s, t) => s + (t.j_plan_adherence_score_pct || 0), 0) / planTrades.length : 0
  const disciplineTrades = closedTrades.filter(t => t.f_discipline_score !== undefined)
  const avgDiscipline = disciplineTrades.length > 0 ? disciplineTrades.reduce((s, t) => s + (t.f_discipline_score || 0), 0) / disciplineTrades.length : 0
  const leftOnTableTrades = closedTrades.filter(t => t.i_left_on_table_r !== undefined)
  const avgLeftOnTable = leftOnTableTrades.length > 0 ? leftOnTableTrades.reduce((s, t) => s + (t.i_left_on_table_r || 0), 0) / leftOnTableTrades.length : 0

  const monthlyPnL = getMonthlyPnL(trades)
  const equityCurve = getEquityCurve(trades)
  const strategyPerf = getStrategyPerformance(trades)

  const winLossData = [
    { name: 'Win', value: trades.filter(t => t.e_result === 'Win').length },
    { name: 'Loss', value: trades.filter(t => t.e_result === 'Loss').length },
    { name: 'BE', value: trades.filter(t => t.e_result === 'Breakeven').length },
  ].filter(d => d.value > 0)

  const rrBuckets = [
    { range: '<0', count: trades.filter(t => (t.e_r_multiple || 0) < 0).length },
    { range: '0-1', count: trades.filter(t => (t.e_r_multiple || 0) >= 0 && (t.e_r_multiple || 0) < 1).length },
    { range: '1-2', count: trades.filter(t => (t.e_r_multiple || 0) >= 1 && (t.e_r_multiple || 0) < 2).length },
    { range: '2-3', count: trades.filter(t => (t.e_r_multiple || 0) >= 2 && (t.e_r_multiple || 0) < 3).length },
    { range: '3+', count: trades.filter(t => (t.e_r_multiple || 0) >= 3).length },
  ]

  // ── Form Helpers ──────────────────────────────
  const makeNewForm = (): Partial<Trade> => ({
    entry_datetime: new Date().toISOString().slice(0, 16),
    trade_horizon: 'Intraday',
    zone_bank_id: zones.find(z => z.status === 'Active')?.zone_id || zones[0]?.zone_id || '',
    account_id: accounts.find(a => a.is_active)?.account_id || accounts[0]?.account_id || '',
    d_entry_price: 0, d_stop_loss: 0, d_target_price: 0, d_position_size: 0,
    d_risk_pct: 1, d_planned_rr: 0, d_slippage_pts: 0,
    d_balance_before: accounts.find(a => a.is_active)?.current_balance || 500000,
    d_risk_amount: 0,
    c_bos_confirmed: false, c_choch_confirmed: false, c_fvg_present: false, c_liquidity_taken: false,
    d2_sl_moved_to_be: false, d2_trailing_stop_active: false,
    f_pre_trade_emotion: 'Neutral', f_post_trade_emotion: 'Neutral',
    f_confidence_score: 7, f_discipline_score: 70,
    f_followed_plan: true, f_revenge_trade: false, f_early_exit: false,
    g_news_event_present: false, g_mistake_tag: 'No Mistake',
    g3_open_trades_count: 0, g3_total_portfolio_risk_pct: 0,
    meta_strategy_version: '1.0', meta_is_reentry: false, meta_review_done: false,
    trade_notes: '',
  })

  const openAdd = () => {
    setEditingTrade(null)
    const newForm = makeNewForm()
    // Auto-populate Section B if zone is pre-selected
    if (newForm.zone_bank_id) {
      const fields = getZoneBankFields(newForm.zone_bank_id)
      if (fields) Object.assign(newForm, fields)
    }
    setForm(newForm)
    setShowDialog(true)
  }

  const openEdit = (trade: Trade) => {
    setEditingTrade(trade)
    setForm({ ...trade, entry_datetime: trade.entry_datetime.slice(0, 16) })
    setShowDialog(true)
  }

  const handleZoneSelect = (zoneId: string) => {
    const fields = getZoneBankFields(zoneId)
    setForm(f => ({ ...f, zone_bank_id: zoneId, ...(fields || {}) }))
  }

  const handleAccountSelect = (accountId: string) => {
    const account = accounts.find(a => a.account_id === accountId)
    setForm(f => ({ ...f, account_id: accountId, d_balance_before: account?.current_balance || f.d_balance_before }))
  }

  // Auto-compute derived fields
  const autoComputeRisk = () => {
    setForm(f => {
      const riskAmt = (f.d_balance_before || 0) * ((f.d_risk_pct || 1) / 100)
      const slPts = Math.abs((f.d_entry_price || 0) - (f.d_stop_loss || 0))
      const posSize = slPts > 0 ? Math.floor(riskAmt / slPts) : 0
      const rr = slPts > 0 ? Math.abs((f.d_target_price || 0) - (f.d_entry_price || 0)) / slPts : 0
      return { ...f, d_risk_amount: Math.round(riskAmt), d_position_size: posSize, d_planned_rr: Math.round(rr * 100) / 100 }
    })
  }

  const handleSave = () => {
    if (!form.zone_bank_id) { toast('Zone Bank ID is mandatory', 'error'); return }
    if (!form.account_id) { toast('Account ID is mandatory', 'error'); return }

    // Auto-compute plan adherence & discipline
    const planScore = calculatePlanAdherenceScore(form)
    const discScore = calculateDisciplineScore(form)
    const tradeData = {
      ...form,
      entry_datetime: form.entry_datetime || new Date().toISOString(),
      j_plan_adherence_score_pct: planScore,
      f_discipline_score: discScore,
    } as Omit<Trade, 'trade_id' | 'created_at' | 'updated_at'>

    try {
      if (editingTrade) {
        updateTrade(editingTrade.trade_id, tradeData)
        // Trigger zone performance update if this is a post-exit save
        if (form.i_capture_efficiency_pct !== undefined) {
          updateZonePerformance(editingTrade.zone_bank_id)
        }
        toast('Trade updated', 'success')
      } else {
        addTrade(tradeData)
        toast('Trade added', 'success')
      }
      setShowDialog(false)
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Failed to save trade', 'error')
    }
  }

  const exportCSV = () => {
    const csv = Papa.unparse(trades.map(t => ({
      TradeID: t.trade_id, ZoneBankID: t.zone_bank_id, AccountID: t.account_id,
      EntryDate: t.entry_datetime, ExitDate: t.exit_datetime || '', Horizon: t.trade_horizon,
      Instrument: t.b_instrument, AssetClass: t.b_asset_class, Bias: t.b_trade_bias,
      ZoneType: t.b_zone_type, ZoneGrade: t.b_zone_grade, ZoneScore: t.b_total_zone_score,
      Timeframe: t.b_timeframe, Heatmap: t.b_heatmap_level, MTFStack: t.b_mtf_stack_count,
      Entry: t.d_entry_price, SL: t.d_stop_loss, Target: t.d_target_price,
      RiskPct: t.d_risk_pct, RiskAmt: t.d_risk_amount, PositionSize: t.d_position_size,
      PlannedRR: t.d_planned_rr, Slippage: t.d_slippage_pts,
      Exit: t.e_exit_price || '', ExitType: t.e_exit_type || '', GrossPnL: t.e_gross_pnl || '',
      TotalCosts: t.e_total_costs || '', NetPnL: t.e_net_pnl || '', RMultiple: t.e_r_multiple || '',
      MFE: t.e_mfe || '', MAE: t.e_mae || '', Result: t.e_result || '',
      PreEmotion: t.f_pre_trade_emotion || '', PostEmotion: t.f_post_trade_emotion || '',
      Confidence: t.f_confidence_score || '', Discipline: t.f_discipline_score || '',
      FollowedPlan: t.f_followed_plan, RevengeTrade: t.f_revenge_trade,
      Session: t.g_session || '', Mistake: t.g_mistake_tag || '',
      PlanAdherence: t.j_plan_adherence_score_pct || '', CaptureEff: t.i_capture_efficiency_pct || '',
      LeftOnTable: t.i_left_on_table_r || '', Notes: t.trade_notes || '',
    })))
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url; a.download = 'trading_journal_v2.csv'; a.click()
    toast('Trades exported (v2 format)', 'success')
  }

  const setF = (key: string, value: unknown) => setForm(f => ({ ...f, [key]: value }))

  return (
    <div className="space-y-6 animate-fade-in">
      {/* KPI Cards — expanded to 10 */}
      <div className="grid grid-cols-2 md:grid-cols-5 lg:grid-cols-10 gap-3">
        <StatCard title="Total PnL" value={formatCurrency(totalPnL)} trend={totalPnL >= 0 ? 'up' : 'down'} />
        <StatCard title="Win Rate" value={`${winRate.toFixed(1)}%`} trend={winRate >= 50 ? 'up' : 'down'} />
        <StatCard title="Profit Factor" value={profitFactor === Infinity ? '∞' : profitFactor.toFixed(2)} />
        <StatCard title="Expectancy" value={formatCurrency(expectancy)} trend={expectancy >= 0 ? 'up' : 'down'} />
        <StatCard title="Avg R" value={avgRMultiple.toFixed(2)} />
        <StatCard title="Capture %" value={`${captureEff.toFixed(0)}%`} />
        <StatCard title="Plan Adh." value={`${planAdherence.toFixed(0)}%`} />
        <StatCard title="Discipline" value={`${avgDiscipline.toFixed(0)}%`} />
        <StatCard title="Left on Table" value={`${avgLeftOnTable.toFixed(2)}R`} />
        <StatCard title="Total Trades" value={trades.length} />
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
                  <TableHead>Instrument</TableHead>
                  <TableHead>Bias</TableHead>
                  <TableHead>Zone</TableHead>
                  <TableHead>Account</TableHead>
                  <TableHead>Entry</TableHead>
                  <TableHead>Exit</TableHead>
                  <TableHead>R</TableHead>
                  <TableHead className="text-right">PnL</TableHead>
                  <TableHead>Result</TableHead>
                  <TableHead>Disc.</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedTrades.map(trade => (
                  <TableRow key={trade.trade_id}>
                    <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                      {new Date(trade.entry_datetime).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: '2-digit' })}
                    </TableCell>
                    <TableCell className="font-semibold">{trade.b_instrument}</TableCell>
                    <TableCell>
                      <Badge variant={trade.b_trade_bias === 'Bullish' ? 'success' : 'destructive'}>{trade.b_trade_bias}</Badge>
                    </TableCell>
                    <TableCell className="font-mono text-xs">{trade.zone_bank_id}</TableCell>
                    <TableCell className="text-xs">{accounts.find(a => a.account_id === trade.account_id)?.account_name?.split(' ')[0] || trade.account_id}</TableCell>
                    <TableCell className="font-mono text-xs">{formatNumber(trade.d_entry_price)}</TableCell>
                    <TableCell className="font-mono text-xs">{trade.e_exit_price ? formatNumber(trade.e_exit_price) : '—'}</TableCell>
                    <TableCell className="font-mono">{trade.e_r_multiple?.toFixed(1) || '—'}</TableCell>
                    <TableCell className={`text-right font-mono font-medium ${(trade.e_net_pnl || 0) >= 0 ? 'text-success' : 'text-destructive'}`}>
                      {trade.e_net_pnl != null ? formatCurrency(trade.e_net_pnl) : '—'}
                    </TableCell>
                    <TableCell>
                      <Badge variant={trade.e_result === 'Win' ? 'success' : trade.e_result === 'Loss' ? 'destructive' : 'secondary'}>
                        {trade.e_result || 'Open'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className={`font-medium ${(trade.f_discipline_score || 0) >= 70 ? 'text-success' : (trade.f_discipline_score || 0) >= 50 ? 'text-warning' : 'text-destructive'}`}>
                        {trade.f_discipline_score || 0}%
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className={`font-medium ${(trade.j_plan_adherence_score_pct || 0) >= 80 ? 'text-success' : (trade.j_plan_adherence_score_pct || 0) >= 50 ? 'text-warning' : 'text-destructive'}`}>
                        {trade.j_plan_adherence_score_pct || '—'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" onClick={() => openEdit(trade)}><Edit2 className="w-4 h-4" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => {
                          deleteTrade(trade.trade_id)
                          toast('Trade deleted', 'info')
                        }}><Trash2 className="w-4 h-4 text-destructive" /></Button>
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
            <CardHeader><CardTitle>R Multiple Distribution</CardTitle></CardHeader>
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

      {/* ═══════════════════════════════════════════════ */}
      {/* ADD/EDIT DIALOG — Full Sections A-J            */}
      {/* ═══════════════════════════════════════════════ */}
      <Dialog open={showDialog} onClose={() => setShowDialog(false)} title={editingTrade ? `Edit Trade — ${editingTrade.trade_id}` : 'New Trade Entry'} maxWidth="max-w-4xl">
        <div className="space-y-3 max-h-[75vh] overflow-y-auto pr-2">

          {/* Section A: Trade Context — MANDATORY */}
          <Section title="Section A — Trade Context" icon={<Target className="w-4 h-4 text-primary" />} defaultOpen={true} badge="Required">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div><Label>Zone Bank *</Label>
                <Select
                  options={zones.filter(z => z.status === 'Active' || z.status === 'Pending').map(z => ({ value: z.zone_id, label: `${z.zone_id} — ${z.instrument} (${z.timeframe})` }))}
                  value={form.zone_bank_id || ''}
                  onChange={e => handleZoneSelect(e.target.value)}
                />
              </div>
              <div><Label>Account *</Label>
                <Select
                  options={accounts.filter(a => a.is_active).map(a => ({ value: a.account_id, label: `${a.account_name} (${a.segment})` }))}
                  value={form.account_id || ''}
                  onChange={e => handleAccountSelect(e.target.value)}
                />
              </div>
              <div><Label>Entry Date/Time *</Label><Input type="datetime-local" value={form.entry_datetime || ''} onChange={e => setF('entry_datetime', e.target.value)} /></div>
              <div><Label>Trade Horizon *</Label><Select options={horizons.map(h => ({ value: h, label: h }))} value={form.trade_horizon || ''} onChange={e => setF('trade_horizon', e.target.value)} /></div>
            </div>
          </Section>

          {/* Section B: Zone Bank Inherited (read-only) */}
          {form.b_instrument && (
            <Section title="Section B — Zone Bank Data (Auto-populated)" icon={<Layers className="w-4 h-4 text-blue-400" />} defaultOpen={true} badge="Read-only" color="text-blue-400">
              <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                {[
                  { label: 'Instrument', value: form.b_instrument },
                  { label: 'Zone Type', value: form.b_zone_type },
                  { label: 'Bias', value: form.b_trade_bias },
                  { label: 'Grade', value: form.b_zone_grade },
                  { label: 'Score', value: form.b_total_zone_score },
                  { label: 'Freshness', value: form.b_freshness_at_entry },
                  { label: 'Timeframe', value: form.b_timeframe },
                  { label: 'Heatmap', value: form.b_heatmap_level },
                  { label: 'MTF Stack', value: form.b_mtf_stack_count },
                  { label: 'Zone High', value: form.b_zone_high },
                  { label: 'Zone Low', value: form.b_zone_low },
                  { label: 'Zone Mid', value: form.b_zone_mid },
                ].map(item => (
                  <div key={item.label} className="p-2 rounded bg-secondary/50">
                    <p className="text-[10px] text-muted-foreground">{item.label}</p>
                    <p className="text-xs font-bold">{item.value ?? '—'}</p>
                  </div>
                ))}
              </div>
            </Section>
          )}

          {/* Section C: ICT/SMC Structure */}
          <Section title="Section C — ICT/SMC Structure" icon={<Crosshair className="w-4 h-4 text-cyan-400" />} color="text-cyan-400">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <label className="flex items-center gap-2 text-sm cursor-pointer p-2 rounded hover:bg-secondary/50"><input type="checkbox" checked={form.c_bos_confirmed || false} onChange={e => setF('c_bos_confirmed', e.target.checked)} className="rounded" /> BOS Confirmed</label>
              <label className="flex items-center gap-2 text-sm cursor-pointer p-2 rounded hover:bg-secondary/50"><input type="checkbox" checked={form.c_choch_confirmed || false} onChange={e => setF('c_choch_confirmed', e.target.checked)} className="rounded" /> CHoCH Confirmed</label>
              <label className="flex items-center gap-2 text-sm cursor-pointer p-2 rounded hover:bg-secondary/50"><input type="checkbox" checked={form.c_fvg_present || false} onChange={e => setF('c_fvg_present', e.target.checked)} className="rounded" /> FVG Present</label>
              <label className="flex items-center gap-2 text-sm cursor-pointer p-2 rounded hover:bg-secondary/50"><input type="checkbox" checked={form.c_liquidity_taken || false} onChange={e => setF('c_liquidity_taken', e.target.checked)} className="rounded" /> Liquidity Taken</label>
              <div><Label>OB Type</Label><Input value={form.c_ob_type || ''} onChange={e => setF('c_ob_type', e.target.value)} placeholder="Bullish/Bearish OB" /></div>
              <div><Label>FVG Filled %</Label><Input type="number" step="1" value={form.c_fvg_filled_pct || ''} onChange={e => setF('c_fvg_filled_pct', Number(e.target.value))} /></div>
              <div><Label>Liquidity Type</Label><Input value={form.c_liquidity_type || ''} onChange={e => setF('c_liquidity_type', e.target.value)} placeholder="EQL, EQH, SSL..." /></div>
            </div>
          </Section>

          {/* Section D: Risk & Position */}
          <Section title="Section D — Risk & Position" icon={<Shield className="w-4 h-4 text-emerald-400" />} defaultOpen={true} badge="Required" color="text-emerald-400">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div><Label>Entry Price *</Label><Input type="number" step="0.01" value={form.d_entry_price || ''} onChange={e => setF('d_entry_price', Number(e.target.value))} onBlur={autoComputeRisk} /></div>
              <div><Label>Stop Loss *</Label><Input type="number" step="0.01" value={form.d_stop_loss || ''} onChange={e => setF('d_stop_loss', Number(e.target.value))} onBlur={autoComputeRisk} /></div>
              <div><Label>Target Price *</Label><Input type="number" step="0.01" value={form.d_target_price || ''} onChange={e => setF('d_target_price', Number(e.target.value))} onBlur={autoComputeRisk} /></div>
              <div><Label>Risk %</Label><Input type="number" step="0.1" value={form.d_risk_pct || ''} onChange={e => setF('d_risk_pct', Number(e.target.value))} onBlur={autoComputeRisk} /></div>
              <div><Label>Risk Amount (auto)</Label><Input readOnly value={form.d_risk_amount || 0} className="bg-secondary/50" /></div>
              <div><Label>Position Size (auto)</Label><Input readOnly value={form.d_position_size || 0} className="bg-secondary/50" /></div>
              <div><Label>Planned RR (auto)</Label><Input readOnly value={form.d_planned_rr || 0} className="bg-secondary/50" /></div>
              <div><Label>Balance Before</Label><Input type="number" value={form.d_balance_before || ''} onChange={e => setF('d_balance_before', Number(e.target.value))} onBlur={autoComputeRisk} /></div>
              <div><Label>Slippage (pts)</Label><Input type="number" step="0.1" value={form.d_slippage_pts || ''} onChange={e => setF('d_slippage_pts', Number(e.target.value))} /></div>
            </div>
          </Section>

          {/* Section J: Pre-Trade Plan */}
          <Section title="Section J — Pre-Trade Plan" icon={<FileText className="w-4 h-4 text-indigo-400" />} color="text-indigo-400">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div><Label>Planned Entry</Label><Input type="number" step="0.01" value={form.j_planned_entry || ''} onChange={e => setF('j_planned_entry', Number(e.target.value))} /></div>
              <div><Label>Planned SL</Label><Input type="number" step="0.01" value={form.j_planned_sl || ''} onChange={e => setF('j_planned_sl', Number(e.target.value))} /></div>
              <div><Label>Planned Target</Label><Input type="number" step="0.01" value={form.j_planned_target || ''} onChange={e => setF('j_planned_target', Number(e.target.value))} /></div>
              <div><Label>Planned RR</Label><Input type="number" step="0.01" value={form.j_planned_rr || ''} onChange={e => setF('j_planned_rr', Number(e.target.value))} /></div>
              <div><Label>Planned Position Size</Label><Input type="number" value={form.j_planned_position_size || ''} onChange={e => setF('j_planned_position_size', Number(e.target.value))} /></div>
              <div><Label>Entry Deviation (pts)</Label><Input type="number" step="0.1" value={form.j_entry_deviation_pts || ''} onChange={e => setF('j_entry_deviation_pts', Number(e.target.value))} /></div>
              <div><Label>SL Deviation (pts)</Label><Input type="number" step="0.1" value={form.j_sl_deviation_pts || ''} onChange={e => setF('j_sl_deviation_pts', Number(e.target.value))} /></div>
              <div><Label>Plan Adherence % (auto)</Label><Input readOnly value={calculatePlanAdherenceScore(form)} className="bg-secondary/50" /></div>
            </div>
          </Section>

          {/* Section F: Psychology */}
          <Section title="Section F — Psychology" icon={<Brain className="w-4 h-4 text-purple-400" />} color="text-purple-400">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div><Label>Pre-Trade Emotion</Label><Select options={emotionOptions.map(e => ({ value: e, label: e }))} value={form.f_pre_trade_emotion || 'Neutral'} onChange={e => setF('f_pre_trade_emotion', e.target.value)} /></div>
              <div><Label>Post-Trade Emotion</Label><Select options={emotionOptions.map(e => ({ value: e, label: e }))} value={form.f_post_trade_emotion || 'Neutral'} onChange={e => setF('f_post_trade_emotion', e.target.value)} /></div>
              <div><Label>Confidence (1-10)</Label><Input type="number" min={1} max={10} value={form.f_confidence_score || ''} onChange={e => setF('f_confidence_score', Number(e.target.value))} /></div>
              <div><Label>Physical State</Label><Input value={form.f_physical_state || ''} onChange={e => setF('f_physical_state', e.target.value)} placeholder="Rested, Tired..." /></div>
              <label className="flex items-center gap-2 text-sm cursor-pointer p-2 rounded hover:bg-secondary/50"><input type="checkbox" checked={form.f_followed_plan || false} onChange={e => setF('f_followed_plan', e.target.checked)} className="rounded" /> Followed Plan</label>
              <label className="flex items-center gap-2 text-sm cursor-pointer p-2 rounded hover:bg-secondary/50"><input type="checkbox" checked={form.f_revenge_trade || false} onChange={e => setF('f_revenge_trade', e.target.checked)} className="rounded" /> Revenge Trade</label>
              <label className="flex items-center gap-2 text-sm cursor-pointer p-2 rounded hover:bg-secondary/50"><input type="checkbox" checked={form.f_early_exit || false} onChange={e => setF('f_early_exit', e.target.checked)} className="rounded" /> Early Exit</label>
              <div><Label>Discipline (auto)</Label><Input readOnly value={calculateDisciplineScore(form)} className="bg-secondary/50" /></div>
            </div>
            <div><Label>Pre-Trade Journal</Label><Textarea value={form.f_pre_trade_journal || ''} onChange={e => setF('f_pre_trade_journal', e.target.value)} placeholder="Write your pre-trade analysis and reasoning..." rows={2} /></div>
          </Section>

          {/* Section G: Context */}
          <Section title="Section G — Market Context" icon={<Globe className="w-4 h-4 text-teal-400" />} color="text-teal-400">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div><Label>Session</Label><Select options={sessions.map(s => ({ value: s, label: s }))} value={form.g_session || ''} onChange={e => setF('g_session', e.target.value)} /></div>
              <div><Label>Killzone</Label><Input value={form.g_killzone || ''} onChange={e => setF('g_killzone', e.target.value)} placeholder="London Open..." /></div>
              <label className="flex items-center gap-2 text-sm cursor-pointer p-2 rounded hover:bg-secondary/50"><input type="checkbox" checked={form.g_news_event_present || false} onChange={e => setF('g_news_event_present', e.target.checked)} className="rounded" /> News Event</label>
              <div><Label>News Description</Label><Input value={form.g_news_event_desc || ''} onChange={e => setF('g_news_event_desc', e.target.value)} placeholder="RBI policy..." /></div>
              <div><Label>Mistake Tag</Label><Select options={mistakeOptions.map(m => ({ value: m, label: m }))} value={form.g_mistake_tag || 'No Mistake'} onChange={e => setF('g_mistake_tag', e.target.value)} /></div>
              <div><Label>Post-Trade Notes</Label><Input value={form.g_post_trade_notes || ''} onChange={e => setF('g_post_trade_notes', e.target.value)} placeholder="Lessons..." /></div>
            </div>
            {/* G2: Macro Context */}
            <p className="text-xs font-semibold text-teal-300 mt-3 mb-1">G2 — Macro Context</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div><Label>VIX at Entry</Label><Input type="number" step="0.01" value={form.g2_vix_at_entry || ''} onChange={e => setF('g2_vix_at_entry', Number(e.target.value))} /></div>
              <div><Label>DXY Level</Label><Input type="number" step="0.01" value={form.g2_dxy_level_at_entry || ''} onChange={e => setF('g2_dxy_level_at_entry', Number(e.target.value))} /></div>
              <div><Label>Nifty Direction</Label><Input value={form.g2_nifty_direction || ''} onChange={e => setF('g2_nifty_direction', e.target.value)} placeholder="Up/Down/Flat" /></div>
              <div><Label>Market Regime</Label><Select options={regimes.map(r => ({ value: r, label: r }))} value={form.g2_market_regime || ''} onChange={e => setF('g2_market_regime', e.target.value)} /></div>
            </div>
            {/* G3: Portfolio Heat */}
            <p className="text-xs font-semibold text-teal-300 mt-3 mb-1">G3 — Portfolio Heat</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div><Label>Open Trades</Label><Input type="number" value={form.g3_open_trades_count || ''} onChange={e => setF('g3_open_trades_count', Number(e.target.value))} /></div>
              <div><Label>Portfolio Risk %</Label><Input type="number" step="0.1" value={form.g3_total_portfolio_risk_pct || ''} onChange={e => setF('g3_total_portfolio_risk_pct', Number(e.target.value))} /></div>
              <div><Label>Correlated Instrument</Label><Input value={form.g3_correlated_instrument || ''} onChange={e => setF('g3_correlated_instrument', e.target.value)} /></div>
              <div><Label>Heat Level</Label><Input value={form.g3_heat_level || ''} onChange={e => setF('g3_heat_level', e.target.value)} placeholder="Low/Med/High" /></div>
            </div>
          </Section>

          {/* Section D2: Trade Management */}
          <Section title="Section D2 — Trade Management" icon={<Activity className="w-4 h-4 text-amber-400" />} color="text-amber-400">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <label className="flex items-center gap-2 text-sm cursor-pointer p-2 rounded hover:bg-secondary/50"><input type="checkbox" checked={form.d2_sl_moved_to_be || false} onChange={e => setF('d2_sl_moved_to_be', e.target.checked)} className="rounded" /> SL Moved to BE</label>
              <div><Label>BE Triggered At</Label><Input type="number" step="0.01" value={form.d2_be_triggered_at || ''} onChange={e => setF('d2_be_triggered_at', Number(e.target.value))} /></div>
              <label className="flex items-center gap-2 text-sm cursor-pointer p-2 rounded hover:bg-secondary/50"><input type="checkbox" checked={form.d2_trailing_stop_active || false} onChange={e => setF('d2_trailing_stop_active', e.target.checked)} className="rounded" /> Trailing Stop</label>
              <div><Label>Trail Method</Label><Input value={form.d2_trailing_stop_method || ''} onChange={e => setF('d2_trailing_stop_method', e.target.value)} placeholder="ATR, Fixed..." /></div>
              <div><Label>Partial Exit 1 %</Label><Input type="number" step="1" value={form.d2_partial_exit_1_pct || ''} onChange={e => setF('d2_partial_exit_1_pct', Number(e.target.value))} /></div>
              <div><Label>Partial 1 Price</Label><Input type="number" step="0.01" value={form.d2_partial_exit_1_price || ''} onChange={e => setF('d2_partial_exit_1_price', Number(e.target.value))} /></div>
              <div><Label>Partial Exit 2 %</Label><Input type="number" step="1" value={form.d2_partial_exit_2_pct || ''} onChange={e => setF('d2_partial_exit_2_pct', Number(e.target.value))} /></div>
              <div><Label>Partial 2 Price</Label><Input type="number" step="0.01" value={form.d2_partial_exit_2_price || ''} onChange={e => setF('d2_partial_exit_2_price', Number(e.target.value))} /></div>
              <div><Label>Avg Exit Price</Label><Input type="number" step="0.01" value={form.d2_avg_exit_price || ''} onChange={e => setF('d2_avg_exit_price', Number(e.target.value))} /></div>
            </div>
          </Section>

          {/* Section E: Outcome */}
          <Section title="Section E — Outcome" icon={<TrendingUp className="w-4 h-4 text-orange-400" />} defaultOpen={!!editingTrade?.e_result} badge={editingTrade?.e_result || 'Fill on exit'} color="text-orange-400">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div><Label>Exit Date/Time</Label><Input type="datetime-local" value={form.exit_datetime || ''} onChange={e => setF('exit_datetime', e.target.value)} /></div>
              <div><Label>Exit Price</Label><Input type="number" step="0.01" value={form.e_exit_price || ''} onChange={e => setF('e_exit_price', Number(e.target.value))} /></div>
              <div><Label>Exit Type</Label><Select options={[{ value: '', label: 'N/A' }, ...exitTypes.map(e => ({ value: e, label: e }))]} value={form.e_exit_type || ''} onChange={e => setF('e_exit_type', e.target.value || undefined)} /></div>
              <div><Label>Gross PnL</Label><Input type="number" step="0.01" value={form.e_gross_pnl || ''} onChange={e => setF('e_gross_pnl', Number(e.target.value))} /></div>
              <div><Label>Total Costs</Label><Input type="number" step="0.01" value={form.e_total_costs || ''} onChange={e => setF('e_total_costs', Number(e.target.value))} /></div>
              <div><Label>Net PnL</Label><Input type="number" step="0.01" value={form.e_net_pnl || ''} onChange={e => setF('e_net_pnl', Number(e.target.value))} /></div>
              <div><Label>R Multiple</Label><Input type="number" step="0.01" value={form.e_r_multiple || ''} onChange={e => setF('e_r_multiple', Number(e.target.value))} /></div>
              <div><Label>Result</Label><Select options={[{ value: '', label: 'Open' }, { value: 'Win', label: 'Win' }, { value: 'Loss', label: 'Loss' }, { value: 'Breakeven', label: 'Breakeven' }]} value={form.e_result || ''} onChange={e => setF('e_result', e.target.value || undefined)} /></div>
              <div><Label>MFE (Max R in favor)</Label><Input type="number" step="0.01" value={form.e_mfe || ''} onChange={e => setF('e_mfe', Number(e.target.value))} /></div>
              <div><Label>MAE (Max R against)</Label><Input type="number" step="0.01" value={form.e_mae || ''} onChange={e => setF('e_mae', Number(e.target.value))} /></div>
            </div>
          </Section>

          {/* Section H: Contract Note */}
          <Section title="Section H — Contract Note" icon={<FileText className="w-4 h-4 text-rose-400" />} color="text-rose-400">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div><Label>Segment</Label><Select options={segments.map(s => ({ value: s, label: s }))} value={form.h1_segment || ''} onChange={e => setF('h1_segment', e.target.value)} /></div>
              <div><Label>Broker</Label><Input value={form.h1_broker || ''} onChange={e => setF('h1_broker', e.target.value)} /></div>
              <div><Label>Contract Note #</Label><Input value={form.h1_contract_note_no || ''} onChange={e => setF('h1_contract_note_no', e.target.value)} /></div>
              <div><Label>Order Type</Label><Input value={form.h2_order_type || ''} onChange={e => setF('h2_order_type', e.target.value)} placeholder="Market/Limit" /></div>
            </div>
            {/* Conditional fields by segment */}
            {(form.h1_segment === 'NSE EQ' || form.h1_segment === 'NSE F&O' || form.h1_segment === 'MCX') && (
              <>
                <p className="text-xs font-semibold text-rose-300 mt-3 mb-1">Indian Market Charges</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div><Label>Brokerage</Label><Input type="number" step="0.01" value={form.h4_brokerage || ''} onChange={e => setF('h4_brokerage', Number(e.target.value))} /></div>
                  <div><Label>{form.h1_segment === 'MCX' ? 'CTT' : 'STT'}</Label><Input type="number" step="0.01" value={form.h1_segment === 'MCX' ? form.h4_ctt || '' : form.h4_stt || ''} onChange={e => setF(form.h1_segment === 'MCX' ? 'h4_ctt' : 'h4_stt', Number(e.target.value))} /></div>
                  <div><Label>Exchange Charges</Label><Input type="number" step="0.01" value={form.h4_exchange_txn_charges || ''} onChange={e => setF('h4_exchange_txn_charges', Number(e.target.value))} /></div>
                  <div><Label>SEBI Fee</Label><Input type="number" step="0.01" value={form.h4_sebi_fee || ''} onChange={e => setF('h4_sebi_fee', Number(e.target.value))} /></div>
                  <div><Label>GST (18%)</Label><Input type="number" step="0.01" value={form.h4_gst_18pct || ''} onChange={e => setF('h4_gst_18pct', Number(e.target.value))} /></div>
                  <div><Label>Stamp Duty</Label><Input type="number" step="0.01" value={form.h4_stamp_duty || ''} onChange={e => setF('h4_stamp_duty', Number(e.target.value))} /></div>
                  {form.h1_segment === 'NSE F&O' && <div><Label>IPFT</Label><Input type="number" step="0.01" value={form.h4_ipft || ''} onChange={e => setF('h4_ipft', Number(e.target.value))} /></div>}
                  {form.h1_segment === 'NSE EQ' && <div><Label>DP/CDSL</Label><Input type="number" step="0.01" value={form.h4_dp_cdsl_charges || ''} onChange={e => setF('h4_dp_cdsl_charges', Number(e.target.value))} /></div>}
                </div>
              </>
            )}
            {(form.h1_segment === 'Forex' || form.h1_segment === 'CFD') && (
              <>
                <p className="text-xs font-semibold text-rose-300 mt-3 mb-1">Forex/CFD Charges</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div><Label>Spread (pips)</Label><Input type="number" step="0.1" value={form.h4_spread_pips || ''} onChange={e => setF('h4_spread_pips', Number(e.target.value))} /></div>
                  <div><Label>Commission/Lot</Label><Input type="number" step="0.01" value={form.h4_commission_per_lot || ''} onChange={e => setF('h4_commission_per_lot', Number(e.target.value))} /></div>
                  <div><Label>Swap/Rollover</Label><Input type="number" step="0.01" value={form.h4_swap_rollover || ''} onChange={e => setF('h4_swap_rollover', Number(e.target.value))} /></div>
                  <div><Label>Pip Value</Label><Input type="number" step="0.01" value={form.h4_pip_value || ''} onChange={e => setF('h4_pip_value', Number(e.target.value))} /></div>
                  <div><Label>Margin Used</Label><Input type="number" step="0.01" value={form.h4_margin_used || ''} onChange={e => setF('h4_margin_used', Number(e.target.value))} /></div>
                  <div><Label>Leverage</Label><Input type="number" step="1" value={form.h4_leverage || ''} onChange={e => setF('h4_leverage', Number(e.target.value))} /></div>
                </div>
              </>
            )}
            {form.h1_segment === 'Prop' && (
              <>
                <p className="text-xs font-semibold text-rose-300 mt-3 mb-1">Prop Firm Tracking</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div><Label>Eval Phase</Label><Input value={form.h4_eval_phase || ''} onChange={e => setF('h4_eval_phase', e.target.value)} /></div>
                  <div><Label>Daily Loss Used %</Label><Input type="number" step="0.1" value={form.h4_daily_loss_used_pct || ''} onChange={e => setF('h4_daily_loss_used_pct', Number(e.target.value))} /></div>
                  <div><Label>Max Loss Used %</Label><Input type="number" step="0.1" value={form.h4_max_loss_used_pct || ''} onChange={e => setF('h4_max_loss_used_pct', Number(e.target.value))} /></div>
                  <div><Label>Profit Target Remaining</Label><Input type="number" step="0.01" value={form.h4_profit_target_remaining || ''} onChange={e => setF('h4_profit_target_remaining', Number(e.target.value))} /></div>
                </div>
              </>
            )}
          </Section>

          {/* Section I: Post-Exit Tracking */}
          <Section title="Section I — Post-Exit Zone Tracking" icon={<Gauge className="w-4 h-4 text-lime-400" />} color="text-lime-400" badge="Triggers zone feedback">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div><Label>Zone Exhaustion Price</Label><Input type="number" step="0.01" value={form.i_zone_exhaustion_price || ''} onChange={e => setF('i_zone_exhaustion_price', Number(e.target.value))} /></div>
              <div><Label>Available Move (R)</Label><Input type="number" step="0.01" value={form.i_available_move_r || ''} onChange={e => setF('i_available_move_r', Number(e.target.value))} /></div>
              <div><Label>Capture Efficiency %</Label><Input type="number" step="1" value={form.i_capture_efficiency_pct || ''} onChange={e => setF('i_capture_efficiency_pct', Number(e.target.value))} /></div>
              <div><Label>Left on Table (R)</Label><Input type="number" step="0.01" value={form.i_left_on_table_r || ''} onChange={e => setF('i_left_on_table_r', Number(e.target.value))} /></div>
              <div><Label>Exit Quality</Label><Select options={['On Time', 'Early', 'Late', 'Perfect'].map(v => ({ value: v, label: v }))} value={form.i_exit_quality || ''} onChange={e => setF('i_exit_quality', e.target.value)} /></div>
              <div><Label>Zone Estimated RR</Label><Input type="number" step="0.01" value={form.i_zone_estimated_rr || ''} onChange={e => setF('i_zone_estimated_rr', Number(e.target.value))} /></div>
              <div><Label>Zone Actual RR</Label><Input type="number" step="0.01" value={form.i_zone_actual_rr_delivered || ''} onChange={e => setF('i_zone_actual_rr_delivered', Number(e.target.value))} /></div>
              <div><Label>Estimation Accuracy %</Label><Input type="number" step="1" value={form.i_estimation_accuracy_pct || ''} onChange={e => setF('i_estimation_accuracy_pct', Number(e.target.value))} /></div>
              <div><Label>Reversal Reason</Label><Input value={form.i_reversal_reason || ''} onChange={e => setF('i_reversal_reason', e.target.value)} placeholder="News, HTF supply..." /></div>
              <div><Label>Post-Exit Notes</Label><Input value={form.i_post_exit_notes || ''} onChange={e => setF('i_post_exit_notes', e.target.value)} /></div>
            </div>
          </Section>

          {/* Indicator Snapshots T3-T5 */}
          <Section title="Indicator Snapshots (T3-T5)" icon={<BarChart3 className="w-4 h-4 text-amber-400" />}>
            <p className="text-xs text-muted-foreground mb-2">T3: Entry — T4: Trade Extreme — T5: Exit</p>
            <div className="grid grid-cols-3 gap-4">
              {[
                { prefix: 't3', label: 'T3 — Entry', color: 'text-primary' },
                { prefix: 't4', label: 'T4 — Extreme', color: 'text-warning' },
                { prefix: 't5', label: 'T5 — Exit', color: 'text-success' },
              ].map(snap => (
                <div key={snap.prefix} className="space-y-2">
                  <p className={`text-xs font-semibold ${snap.color}`}>{snap.label}</p>
                  <div className="grid grid-cols-2 gap-2">
                    <div><Label className="text-xs">RSI</Label><Input type="number" step="0.1" value={(form as Record<string, unknown>)[`${snap.prefix}_rsi`] as number || ''} onChange={e => setF(`${snap.prefix}_rsi`, Number(e.target.value))} /></div>
                    <div><Label className="text-xs">MACD</Label><Input type="number" step="0.01" value={(form as Record<string, unknown>)[`${snap.prefix}_macd`] as number || ''} onChange={e => setF(`${snap.prefix}_macd`, Number(e.target.value))} /></div>
                    <div><Label className="text-xs">Volume</Label><Input type="number" value={(form as Record<string, unknown>)[`${snap.prefix}_volume`] as number || ''} onChange={e => setF(`${snap.prefix}_volume`, Number(e.target.value))} /></div>
                    <div><Label className="text-xs">ATR</Label><Input type="number" step="0.01" value={(form as Record<string, unknown>)[`${snap.prefix}_atr`] as number || ''} onChange={e => setF(`${snap.prefix}_atr`, Number(e.target.value))} /></div>
                  </div>
                </div>
              ))}
            </div>
          </Section>

          {/* Trade Notes */}
          <div>
            <Label>Trade Notes</Label>
            <Textarea value={form.trade_notes || ''} onChange={e => setF('trade_notes', e.target.value)} placeholder="Detailed trade notes..." rows={3} />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-2 border-t border-border">
            <Button variant="outline" onClick={() => setShowDialog(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={!form.zone_bank_id || !form.account_id || !form.d_entry_price}>
              {editingTrade ? 'Update' : 'Add'} Trade
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  )
}
