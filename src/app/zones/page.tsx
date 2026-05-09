'use client'

import React, { useState, useMemo } from 'react'
import { useStore } from '@/lib/store'
import { useToast } from '@/components/ui/toast'
import { Card, CardHeader, CardTitle, CardContent, Button, Badge, Input, Select, Dialog, Label, Table, TableHeader, TableBody, TableRow, TableHead, TableCell, Textarea, StatCard } from '@/components/ui'
import { formatNumber } from '@/lib/utils'
import { getScoreColor, getScoreLabel, calculateFinalCompositeScore, deriveZoneGrade, calculateTRIDENT, calculateMtfStackCount, calculateZoneMid, calculateZoneWidthPct, deriveHeatmapLevel } from '@/lib/calculations'
import { Zone, ZoneType, ZoneSubtype, Timeframe, ZoneStatus, LifecycleStage, ZoneFreshness, VolatilityState, PremiumDiscount, CurvePosition, HeatmapLevel } from '@/lib/types'
import { Plus, Search, Download, Edit2, Trash2, Target, TrendingUp, ChevronDown, ChevronRight, Layers, Activity, BarChart3, Crosshair, Shield, Gauge, MapPin, Settings2, LineChart, Globe } from 'lucide-react'
import Papa from 'papaparse'

const zoneTypes: ZoneType[] = ['Demand', 'Supply']
const zoneSubtypes: ZoneSubtype[] = ['DBD','RBD','DBR','RBR','Compression','Flip','Trend Continuation','HTF','Gap','Volume','News','Algo','Liquidity Sweep','Imbalance']
const timeframes: Timeframe[] = ['Yearly','Quarterly','Monthly','Weekly','Daily','4H','1H','15M','5M','3M','1M']
const zoneStatuses: ZoneStatus[] = ['Active','Broken','Expired','Pending','Void']
const lifecycleStages: LifecycleStage[] = ['Creation','Discovery','Validation','Weakening','Failure']
const volatilityStates: VolatilityState[] = ['Low','Normal','High','Extreme']
const premiumDiscounts: PremiumDiscount[] = ['Premium','Discount','Equilibrium']
const curvePositions: CurvePosition[] = ['Buy Zone','Sell Zone','Avoid Zone']

// Collapsible Section Component
function Section({ title, icon, children, defaultOpen = false, badge }: { title: string; icon: React.ReactNode; children: React.ReactNode; defaultOpen?: boolean; badge?: string }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between p-3 bg-secondary/30 hover:bg-secondary/50 transition-colors">
        <div className="flex items-center gap-2">
          {icon}
          <span className="text-sm font-semibold">{title}</span>
          {badge && <Badge variant="outline" className="text-[10px] h-5">{badge}</Badge>}
        </div>
        {open ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
      </button>
      {open && <div className="p-4 space-y-3">{children}</div>}
    </div>
  )
}

function makeDefaultZone(): Partial<Zone> {
  return {
    instrument: '', asset_class: 'Nifty500', zone_type: 'Demand', zone_subtype: 'DBD',
    trade_bias: 'Bullish', exchange: 'NSE', sector: '', country: 'India', base_currency: 'INR',
    tv_symbol: '', timeframe: 'Daily',
    yearly_zone_id: null, quarterly_zone_id: null, monthly_zone_id: null, weekly_zone_id: null,
    daily_zone_id: null, h4_zone_id: null, h1_zone_id: null, m15_zone_id: null,
    m5_zone_id: null, m3_zone_id: null, m1_zone_id: null, mtf_stack_count: 0,
    zone_high: 0, zone_low: 0, zone_mid: 0, zone_width_pct: 0, base_candles: 0,
    departure_candles: 0, impulse_pct: 0,
    equal_highs_present: false, equal_lows_present: false, stop_cluster_above: false,
    stop_cluster_below: false, bos_confirmed: false, trendline_liquidity: false,
    volume_spike: false, atr_expansion: false, volatility_state: 'Normal', range_compression: false,
    zone_structure_score: 50, liquidity_score: 50, indicator_confluence_score: 50,
    achievement_score: 50, final_composite_score: 50, zone_grade: 'C',
    heatmap_level: 'COLD',
    status: 'Active', lifecycle_stage: 'Discovery', freshness: 'Fresh', test_count: 0,
    zone_win_rate: 0, linked_trade_count: 0, avg_actual_rr_delivered: 0,
    avg_capture_efficiency_pct: 0, avg_available_move_r: 0, avg_left_on_table_r: 0,
    zone_estimation_accuracy_pct: 0, zone_estimation_bias: 'Accurate', avg_exhaustion_candles: 0,
    bullish_probability_pct: 33, bearish_probability_pct: 33, neutral_probability_pct: 34,
    notes: '',
  }
}

export default function ZoneBankPage() {
  const { zones, addZone, updateZone, deleteZone } = useStore()
  const { toast } = useToast()
  const [search, setSearch] = useState('')
  const [filterType, setFilterType] = useState('')
  const [filterTimeframe, setFilterTimeframe] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [showDialog, setShowDialog] = useState(false)
  const [editingZone, setEditingZone] = useState<Zone | null>(null)
  const [form, setForm] = useState<Partial<Zone>>(makeDefaultZone())
  const [sortBy, setSortBy] = useState<'final_composite_score' | 'created_at' | 'instrument'>('final_composite_score')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')

  // Computed scores for the form
  const formMtfStack = calculateMtfStackCount(form)
  const formTrident = calculateTRIDENT(form)
  const formComposite = calculateFinalCompositeScore({
    ...form,
    trident_combined_score: formTrident.combined,
  })
  const formGrade = deriveZoneGrade(formComposite)

  const filteredZones = useMemo(() => {
    let result = [...zones]
    if (search) result = result.filter(z => z.instrument.toLowerCase().includes(search.toLowerCase()) || z.notes.toLowerCase().includes(search.toLowerCase()))
    if (filterType) result = result.filter(z => z.zone_type === filterType)
    if (filterTimeframe) result = result.filter(z => z.timeframe === filterTimeframe)
    if (filterStatus) result = result.filter(z => z.status === filterStatus)
    result.sort((a, b) => {
      const aVal = a[sortBy] as string | number
      const bVal = b[sortBy] as string | number
      if (typeof aVal === 'number' && typeof bVal === 'number') return sortDir === 'asc' ? aVal - bVal : bVal - aVal
      return sortDir === 'asc' ? String(aVal).localeCompare(String(bVal)) : String(bVal).localeCompare(String(aVal))
    })
    return result
  }, [zones, search, filterType, filterTimeframe, filterStatus, sortBy, sortDir])

  const openAdd = () => { setEditingZone(null); setForm(makeDefaultZone()); setShowDialog(true) }
  const openEdit = (zone: Zone) => { setEditingZone(zone); setForm({ ...zone }); setShowDialog(true) }

  const handleSave = () => {
    const mid = calculateZoneMid(form.zone_high || 0, form.zone_low || 0)
    const widthPct = calculateZoneWidthPct(form.zone_high || 0, form.zone_low || 0)
    const zoneData = {
      ...form,
      zone_mid: mid,
      zone_width_pct: widthPct,
      mtf_stack_count: formMtfStack,
      trident_horizontal_score: formTrident.horizontal,
      trident_vertical_up_score: formTrident.verticalUp,
      trident_vertical_down_score: formTrident.verticalDown,
      trident_combined_score: formTrident.combined,
      final_composite_score: formComposite,
      zone_grade: formGrade,
    }
    if (editingZone) {
      updateZone(editingZone.zone_id, zoneData)
      toast('Zone updated successfully', 'success')
    } else {
      addZone(zoneData as Omit<Zone, 'zone_id' | 'created_at' | 'updated_at'>)
      toast('Zone added successfully', 'success')
    }
    setShowDialog(false)
  }

  const handleDelete = (id: string) => {
    deleteZone(id)
    toast('Zone deleted', 'info')
  }

  const exportCSV = () => {
    const csv = Papa.unparse(zones.map(z => ({
      ZoneID: z.zone_id, Instrument: z.instrument, AssetClass: z.asset_class, Type: z.zone_type,
      Subtype: z.zone_subtype, Bias: z.trade_bias, Exchange: z.exchange, Timeframe: z.timeframe,
      High: z.zone_high, Low: z.zone_low, Mid: z.zone_mid, Status: z.status, Grade: z.zone_grade,
      CompositeScore: z.final_composite_score, Heatmap: z.heatmap_level, MTFStack: z.mtf_stack_count,
      Freshness: z.freshness, TestCount: z.test_count, WinRate: z.zone_win_rate,
      LinkedTrades: z.linked_trade_count, Notes: z.notes, Created: z.created_at,
    })))
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url; a.download = 'zone_bank.csv'; a.click()
    toast('Zone Bank exported to CSV', 'success')
  }

  const toggleSort = (col: typeof sortBy) => {
    if (sortBy === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortBy(col); setSortDir('desc') }
  }

  const stats = {
    total: zones.length,
    active: zones.filter(z => z.status === 'Active').length,
    demand: zones.filter(z => z.zone_type === 'Demand').length,
    avgScore: zones.length > 0 ? zones.reduce((s, z) => s + z.final_composite_score, 0) / zones.length : 0,
    hot: zones.filter(z => z.heatmap_level === 'HOT').length,
  }

  const setF = (key: string, value: unknown) => setForm(f => ({ ...f, [key]: value }))

  // MTF Zone ID options for dropdowns
  const zoneOptions = zones.map(z => ({ value: z.zone_id, label: `${z.zone_id} — ${z.instrument} (${z.timeframe})` }))

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <StatCard title="Total Zones" value={stats.total} icon={<Target className="w-5 h-5 text-primary" />} />
        <StatCard title="Active Zones" value={stats.active} icon={<TrendingUp className="w-5 h-5 text-success" />} />
        <StatCard title="Demand Zones" value={stats.demand} icon={<TrendingUp className="w-5 h-5 text-success" />} />
        <StatCard title="Avg Score" value={stats.avgScore.toFixed(0)} icon={<Gauge className="w-5 h-5 text-warning" />} />
        <StatCard title="HOT Zones" value={stats.hot} icon={<Activity className="w-5 h-5 text-destructive" />} />
      </div>

      {/* Toolbar */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input className="pl-9" placeholder="Search instruments..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <Select options={[{ value: '', label: 'All Types' }, ...zoneTypes.map(t => ({ value: t, label: t }))]} value={filterType} onChange={e => setFilterType(e.target.value)} className="w-[140px]" />
            <Select options={[{ value: '', label: 'All TF' }, ...timeframes.map(t => ({ value: t, label: t }))]} value={filterTimeframe} onChange={e => setFilterTimeframe(e.target.value)} className="w-[120px]" />
            <Select options={[{ value: '', label: 'All Status' }, ...zoneStatuses.map(t => ({ value: t, label: t }))]} value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="w-[140px]" />
            <Button variant="outline" size="sm" onClick={exportCSV}><Download className="w-4 h-4 mr-1" /> CSV</Button>
            <Button size="sm" onClick={openAdd}><Plus className="w-4 h-4 mr-1" /> Add Zone</Button>
          </div>
        </CardContent>
      </Card>

      {/* Zone Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead className="cursor-pointer hover:text-foreground" onClick={() => toggleSort('instrument')}>Instrument {sortBy === 'instrument' && (sortDir === 'asc' ? '↑' : '↓')}</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>TF</TableHead>
                <TableHead>Range</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Grade</TableHead>
                <TableHead className="cursor-pointer hover:text-foreground" onClick={() => toggleSort('final_composite_score')}>Score {sortBy === 'final_composite_score' && (sortDir === 'asc' ? '↑' : '↓')}</TableHead>
                <TableHead>Heatmap</TableHead>
                <TableHead>MTF</TableHead>
                <TableHead>Tests</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredZones.map(zone => (
                <TableRow key={zone.zone_id}>
                  <TableCell className="font-mono text-xs text-muted-foreground">{zone.zone_id}</TableCell>
                  <TableCell className="font-semibold">{zone.instrument}</TableCell>
                  <TableCell>
                    <Badge variant={zone.zone_type === 'Demand' ? 'success' : 'destructive'}>{zone.zone_type}</Badge>
                  </TableCell>
                  <TableCell><Badge variant="outline">{zone.timeframe}</Badge></TableCell>
                  <TableCell className="font-mono text-xs">{formatNumber(zone.zone_low)} — {formatNumber(zone.zone_high)}</TableCell>
                  <TableCell>
                    <Badge variant={zone.status === 'Active' ? 'success' : zone.status === 'Pending' ? 'warning' : zone.status === 'Broken' ? 'destructive' : 'secondary'}>
                      {zone.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className={`text-sm font-bold ${zone.zone_grade === 'A' ? 'text-success' : zone.zone_grade === 'B' ? 'text-warning' : 'text-muted-foreground'}`}>
                      {zone.zone_grade}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="inline-flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: getScoreColor(zone.final_composite_score) }} />
                      <span className="font-bold" style={{ color: getScoreColor(zone.final_composite_score) }}>{zone.final_composite_score}</span>
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge variant={zone.heatmap_level === 'HOT' ? 'destructive' : zone.heatmap_level === 'WARM' ? 'warning' : 'secondary'}>
                      {zone.heatmap_level}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">{zone.mtf_stack_count}</TableCell>
                  <TableCell>{zone.test_count}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(zone)}><Edit2 className="w-4 h-4" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(zone.zone_id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add/Edit Dialog — 12 Collapsible Components */}
      <Dialog open={showDialog} onClose={() => setShowDialog(false)} title={editingZone ? `Edit Zone — ${editingZone.zone_id}` : 'Add Zone'} maxWidth="max-w-4xl">
        <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-2">

          {/* Component 1: Zone Bank Master */}
          <Section title="Component 1: Zone Bank Master" icon={<Target className="w-4 h-4 text-primary" />} defaultOpen={true} badge="Required">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <div><Label>Instrument *</Label><Input value={form.instrument || ''} onChange={e => setF('instrument', e.target.value.toUpperCase())} placeholder="NIFTY" /></div>
              <div><Label>Asset Class</Label><Select options={['Nifty500','Index','Forex','MCX','GlobalCFD'].map(v => ({ value: v, label: v }))} value={form.asset_class || ''} onChange={e => setF('asset_class', e.target.value)} /></div>
              <div><Label>Zone Type *</Label><Select options={zoneTypes.map(t => ({ value: t, label: t }))} value={form.zone_type || ''} onChange={e => setF('zone_type', e.target.value)} /></div>
              <div><Label>Subtype *</Label><Select options={zoneSubtypes.map(t => ({ value: t, label: t }))} value={form.zone_subtype || ''} onChange={e => setF('zone_subtype', e.target.value)} /></div>
              <div><Label>Trade Bias *</Label><Select options={[{ value: 'Bullish', label: 'Bullish' }, { value: 'Bearish', label: 'Bearish' }]} value={form.trade_bias || ''} onChange={e => setF('trade_bias', e.target.value)} /></div>
              <div><Label>Exchange *</Label><Select options={['NSE','MCX','FXTM','COMEX','ICE'].map(v => ({ value: v, label: v }))} value={form.exchange || ''} onChange={e => setF('exchange', e.target.value)} /></div>
              <div><Label>Sector</Label><Input value={form.sector || ''} onChange={e => setF('sector', e.target.value)} placeholder="Banking, IT..." /></div>
              <div><Label>Timeframe *</Label><Select options={timeframes.map(t => ({ value: t, label: t }))} value={form.timeframe || ''} onChange={e => setF('timeframe', e.target.value)} /></div>
              <div><Label>TV Symbol</Label><Input value={form.tv_symbol || ''} onChange={e => setF('tv_symbol', e.target.value)} placeholder="NSE:RELIANCE" /></div>
            </div>
          </Section>

          {/* Component 2: MTF Confluence */}
          <Section title="Component 2: MTF Confluence" icon={<Layers className="w-4 h-4 text-blue-400" />} badge={`Stack: ${formMtfStack}`}>
            <p className="text-xs text-muted-foreground mb-2">Link Zone IDs from other timeframes to build multi-timeframe alignment.</p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {(['yearly','quarterly','monthly','weekly','daily','h4','h1','m15','m5','m3','m1'] as const).map(tf => (
                <div key={tf}>
                  <Label className="capitalize">{tf} Zone</Label>
                  <Select
                    options={[{ value: '', label: 'None' }, ...zoneOptions]}
                    value={(form as Record<string, unknown>)[`${tf}_zone_id`] as string || ''}
                    onChange={e => setF(`${tf}_zone_id`, e.target.value || null)}
                  />
                </div>
              ))}
            </div>
            <div className="p-3 rounded-lg bg-secondary/50 mt-2 grid grid-cols-4 gap-2 text-xs">
              <div>Horizontal: <span className="font-bold text-primary">{formTrident.horizontal}%</span></div>
              <div>Vertical Up: <span className="font-bold text-success">{formTrident.verticalUp}%</span></div>
              <div>Vertical Down: <span className="font-bold text-warning">{formTrident.verticalDown}%</span></div>
              <div>Combined: <span className="font-bold text-foreground">{formTrident.combined}%</span></div>
            </div>
          </Section>

          {/* Component 3: Zone Structure Metrics */}
          <Section title="Component 3: Zone Structure Metrics" icon={<BarChart3 className="w-4 h-4 text-cyan-400" />} defaultOpen={true} badge="Required">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div><Label>Zone High *</Label><Input type="number" step="0.01" value={form.zone_high || ''} onChange={e => setF('zone_high', Number(e.target.value))} /></div>
              <div><Label>Zone Low *</Label><Input type="number" step="0.01" value={form.zone_low || ''} onChange={e => setF('zone_low', Number(e.target.value))} /></div>
              <div><Label>Zone Mid (auto)</Label><Input readOnly value={calculateZoneMid(form.zone_high || 0, form.zone_low || 0).toFixed(2)} className="bg-secondary/50" /></div>
              <div><Label>Width % (auto)</Label><Input readOnly value={calculateZoneWidthPct(form.zone_high || 0, form.zone_low || 0).toFixed(2)} className="bg-secondary/50" /></div>
              <div><Label>Base Candles</Label><Input type="number" value={form.base_candles || ''} onChange={e => setF('base_candles', Number(e.target.value))} /></div>
              <div><Label>Departure Candles</Label><Input type="number" value={form.departure_candles || ''} onChange={e => setF('departure_candles', Number(e.target.value))} /></div>
              <div><Label>Impulse %</Label><Input type="number" step="0.1" value={form.impulse_pct || ''} onChange={e => setF('impulse_pct', Number(e.target.value))} /></div>
              <div><Label>Chart Pattern</Label><Input value={form.chart_pattern || ''} onChange={e => setF('chart_pattern', e.target.value)} placeholder="H&S, Flag..." /></div>
            </div>
          </Section>

          {/* Component 4: Liquidity Context Map */}
          <Section title="Component 4: Liquidity Context" icon={<Crosshair className="w-4 h-4 text-orange-400" />}>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {([
                { key: 'equal_highs_present', label: 'Equal Highs Present' },
                { key: 'equal_lows_present', label: 'Equal Lows Present' },
                { key: 'stop_cluster_above', label: 'Stop Cluster Above' },
                { key: 'stop_cluster_below', label: 'Stop Cluster Below' },
                { key: 'bos_confirmed', label: 'BOS Confirmed' },
                { key: 'trendline_liquidity', label: 'Trendline Liquidity' },
              ] as const).map(item => (
                <label key={item.key} className="flex items-center gap-2 text-sm cursor-pointer p-2 rounded hover:bg-secondary/50">
                  <input type="checkbox" checked={(form[item.key] as boolean) || false} onChange={e => setF(item.key, e.target.checked)} className="rounded border-border" />
                  {item.label}
                </label>
              ))}
              <div><Label>Liquidity Type</Label><Input value={form.liquidity_type || ''} onChange={e => setF('liquidity_type', e.target.value)} placeholder="EQL, EQH, SSL..." /></div>
            </div>
          </Section>

          {/* Component 5: Momentum & Volume */}
          <Section title="Component 5: Momentum & Volume" icon={<Activity className="w-4 h-4 text-purple-400" />}>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <label className="flex items-center gap-2 text-sm cursor-pointer"><input type="checkbox" checked={form.volume_spike || false} onChange={e => setF('volume_spike', e.target.checked)} className="rounded" /> Volume Spike</label>
              <div><Label>ATR Value</Label><Input type="number" step="0.01" value={form.atr_value || ''} onChange={e => setF('atr_value', Number(e.target.value))} /></div>
              <label className="flex items-center gap-2 text-sm cursor-pointer"><input type="checkbox" checked={form.atr_expansion || false} onChange={e => setF('atr_expansion', e.target.checked)} className="rounded" /> ATR Expansion</label>
              <div><Label>Volatility</Label><Select options={volatilityStates.map(v => ({ value: v, label: v }))} value={form.volatility_state || 'Normal'} onChange={e => setF('volatility_state', e.target.value)} /></div>
              <label className="flex items-center gap-2 text-sm cursor-pointer"><input type="checkbox" checked={form.range_compression || false} onChange={e => setF('range_compression', e.target.checked)} className="rounded" /> Range Compression</label>
            </div>
          </Section>

          {/* Component 6: Scoring Engine */}
          <Section title="Component 6: Scoring Engine" icon={<Gauge className="w-4 h-4 text-yellow-400" />} defaultOpen={true} badge={`Grade: ${formGrade} (${formComposite})`}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {([
                { key: 'zone_structure_score', label: 'Zone Structure', weight: '25%' },
                { key: 'liquidity_score', label: 'Liquidity', weight: '20%' },
                { key: 'indicator_confluence_score', label: 'Indicator Confluence', weight: '20%' },
                { key: 'achievement_score', label: 'Achievement', weight: '10%' },
              ] as const).map(item => (
                <div key={item.key}>
                  <Label className="flex justify-between">
                    <span>{item.label}</span>
                    <span className="text-xs text-muted-foreground">Weight: {item.weight} — <span className="font-bold" style={{ color: getScoreColor((form[item.key] as number) || 0) }}>{(form[item.key] as number) || 0}</span></span>
                  </Label>
                  <input type="range" min={0} max={100} value={(form[item.key] as number) || 0} onChange={e => setF(item.key, Number(e.target.value))} className="w-full accent-primary" />
                </div>
              ))}
              <div>
                <Label className="flex justify-between">
                  <span>TRIDENT Combined (auto)</span>
                  <span className="text-xs text-muted-foreground">Weight: 25% — <span className="font-bold text-primary">{formTrident.combined}</span></span>
                </Label>
                <input type="range" min={0} max={100} value={formTrident.combined} readOnly disabled className="w-full opacity-60" />
              </div>
            </div>
            <div className="mt-3 p-3 rounded-lg bg-secondary/50 flex items-center justify-between">
              <span className="text-sm font-medium">Final Composite Score</span>
              <span className="text-2xl font-bold" style={{ color: getScoreColor(formComposite) }}>{formComposite} — Grade {formGrade}</span>
            </div>
          </Section>

          {/* Component 7: Distance & Heatmap */}
          <Section title="Component 7: Distance & Heatmap" icon={<MapPin className="w-4 h-4 text-red-400" />}>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div><Label>Distance from Price %</Label><Input type="number" step="0.1" value={form.distance_from_price || ''} onChange={e => { const v = Number(e.target.value); setF('distance_from_price', v); setF('heatmap_level', deriveHeatmapLevel(v)) }} /></div>
              <div><Label>Heatmap (auto)</Label><Input readOnly value={form.heatmap_level || 'COLD'} className="bg-secondary/50" /></div>
              <div><Label>Priority Rank</Label><Input type="number" value={form.priority_rank || ''} onChange={e => setF('priority_rank', Number(e.target.value))} /></div>
              <div><Label>Setup Readiness</Label><Select options={[{ value: 'Ready', label: 'Ready' }, { value: 'Approaching', label: 'Approaching' }, { value: 'Waiting', label: 'Waiting' }]} value={form.setup_readiness || ''} onChange={e => setF('setup_readiness', e.target.value)} /></div>
            </div>
          </Section>

          {/* Component 8: Trade Setup Engine */}
          <Section title="Component 8: Trade Setup Engine" icon={<Settings2 className="w-4 h-4 text-emerald-400" />}>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <div><Label>Setup Type</Label><Select options={['Aggressive','Conservative','Extreme'].map(v => ({ value: v, label: v }))} value={form.setup_type || ''} onChange={e => setF('setup_type', e.target.value)} /></div>
              <div><Label>Entry Model</Label><Select options={['Zone Touch','BOS+Retest','FVG Fill','Compression Break','Pullback'].map(v => ({ value: v, label: v }))} value={form.entry_model || ''} onChange={e => setF('entry_model', e.target.value)} /></div>
              <div><Label>Confirmation Signal</Label><Input value={form.confirmation_signal || ''} onChange={e => setF('confirmation_signal', e.target.value)} placeholder="Bullish Engulfing..." /></div>
              <div><Label>Planned Entry</Label><Input type="number" step="0.01" value={form.planned_entry || ''} onChange={e => setF('planned_entry', Number(e.target.value))} /></div>
              <div><Label>Planned SL</Label><Input type="number" step="0.01" value={form.planned_sl || ''} onChange={e => setF('planned_sl', Number(e.target.value))} /></div>
              <div><Label>Planned Target</Label><Input type="number" step="0.01" value={form.planned_target || ''} onChange={e => setF('planned_target', Number(e.target.value))} /></div>
              <div><Label>Planned RR</Label><Input type="number" step="0.01" value={form.planned_rr || ''} onChange={e => setF('planned_rr', Number(e.target.value))} /></div>
              <div><Label>Premium/Discount</Label><Select options={[{ value: '', label: 'None' }, ...premiumDiscounts.map(v => ({ value: v, label: v }))]} value={form.premium_discount || ''} onChange={e => setF('premium_discount', e.target.value || undefined)} /></div>
            </div>
          </Section>

          {/* Component 9: Zone Status / Lifecycle */}
          <Section title="Component 9: Zone Lifecycle" icon={<Shield className="w-4 h-4 text-teal-400" />} defaultOpen={true}>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div><Label>Status</Label><Select options={zoneStatuses.map(s => ({ value: s, label: s }))} value={form.status || 'Active'} onChange={e => setF('status', e.target.value)} /></div>
              <div><Label>Lifecycle Stage</Label><Select options={lifecycleStages.map(s => ({ value: s, label: s }))} value={form.lifecycle_stage || 'Discovery'} onChange={e => setF('lifecycle_stage', e.target.value)} /></div>
              <div><Label>Freshness</Label><Select options={(['Fresh','Tested','Stale'] as ZoneFreshness[]).map(s => ({ value: s, label: s }))} value={form.freshness || 'Fresh'} onChange={e => setF('freshness', e.target.value)} /></div>
              <div><Label>Test Count</Label><Input type="number" value={form.test_count || 0} onChange={e => setF('test_count', Number(e.target.value))} /></div>
            </div>
          </Section>

          {/* Component 10: Performance Analytics (read-only) */}
          {editingZone && (
            <Section title="Component 10: Performance Analytics" icon={<LineChart className="w-4 h-4 text-indigo-400" />} badge="Read-only">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="p-2 rounded bg-secondary/50"><p className="text-xs text-muted-foreground">Win Rate</p><p className="font-bold">{editingZone.zone_win_rate}%</p></div>
                <div className="p-2 rounded bg-secondary/50"><p className="text-xs text-muted-foreground">Linked Trades</p><p className="font-bold">{editingZone.linked_trade_count}</p></div>
                <div className="p-2 rounded bg-secondary/50"><p className="text-xs text-muted-foreground">Avg R Delivered</p><p className="font-bold">{editingZone.avg_actual_rr_delivered}</p></div>
                <div className="p-2 rounded bg-secondary/50"><p className="text-xs text-muted-foreground">Capture Efficiency</p><p className="font-bold">{editingZone.avg_capture_efficiency_pct}%</p></div>
                <div className="p-2 rounded bg-secondary/50"><p className="text-xs text-muted-foreground">Avg Available R</p><p className="font-bold">{editingZone.avg_available_move_r}</p></div>
                <div className="p-2 rounded bg-secondary/50"><p className="text-xs text-muted-foreground">Left on Table R</p><p className="font-bold">{editingZone.avg_left_on_table_r}</p></div>
                <div className="p-2 rounded bg-secondary/50"><p className="text-xs text-muted-foreground">Estimation Accuracy</p><p className="font-bold">{editingZone.zone_estimation_accuracy_pct}%</p></div>
                <div className="p-2 rounded bg-secondary/50"><p className="text-xs text-muted-foreground">Estimation Bias</p><p className="font-bold">{editingZone.zone_estimation_bias}</p></div>
              </div>
            </Section>
          )}

          {/* Component 11: Trend Probability */}
          <Section title="Component 11: Trend Probability" icon={<TrendingUp className="w-4 h-4 text-green-400" />}>
            <div className="grid grid-cols-3 gap-3">
              <div><Label>Bullish %</Label><Input type="number" min={0} max={100} value={form.bullish_probability_pct || 33} onChange={e => setF('bullish_probability_pct', Number(e.target.value))} /></div>
              <div><Label>Bearish %</Label><Input type="number" min={0} max={100} value={form.bearish_probability_pct || 33} onChange={e => setF('bearish_probability_pct', Number(e.target.value))} /></div>
              <div><Label>Neutral %</Label><Input type="number" min={0} max={100} value={form.neutral_probability_pct || 34} onChange={e => setF('neutral_probability_pct', Number(e.target.value))} /></div>
            </div>
            {((form.bullish_probability_pct || 0) + (form.bearish_probability_pct || 0) + (form.neutral_probability_pct || 0)) !== 100 && (
              <p className="text-xs text-destructive mt-1">⚠ Probabilities must sum to 100%</p>
            )}
          </Section>

          {/* Component 12: Curve Map HTF Context */}
          <Section title="Component 12: Curve Map" icon={<Globe className="w-4 h-4 text-pink-400" />}>
            <div className="grid grid-cols-3 gap-3">
              <div><Label>HTF Demand Zone</Label><Input value={form.htf_demand_zone || ''} onChange={e => setF('htf_demand_zone', e.target.value)} placeholder="Zone ID" /></div>
              <div><Label>HTF Supply Zone</Label><Input value={form.htf_supply_zone || ''} onChange={e => setF('htf_supply_zone', e.target.value)} placeholder="Zone ID" /></div>
              <div><Label>Curve Position</Label><Select options={[{ value: '', label: 'None' }, ...curvePositions.map(v => ({ value: v, label: v }))]} value={form.curve_position || ''} onChange={e => setF('curve_position', e.target.value || undefined)} /></div>
            </div>
          </Section>

          {/* Indicator Snapshots T1 & T2 */}
          <Section title="Indicator Snapshots (T1 & T2)" icon={<BarChart3 className="w-4 h-4 text-amber-400" />}>
            <p className="text-xs text-muted-foreground mb-2">T1: Zone Creation — T2: Peak/Reversal before zone formed</p>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <p className="text-xs font-semibold text-primary">T1 — Zone Creation</p>
                <div className="grid grid-cols-3 gap-2">
                  <div><Label className="text-xs">RSI</Label><Input type="number" step="0.1" value={form.t1_rsi || ''} onChange={e => setF('t1_rsi', Number(e.target.value))} /></div>
                  <div><Label className="text-xs">MACD</Label><Input type="number" step="0.01" value={form.t1_macd || ''} onChange={e => setF('t1_macd', Number(e.target.value))} /></div>
                  <div><Label className="text-xs">Volume</Label><Input type="number" value={form.t1_volume || ''} onChange={e => setF('t1_volume', Number(e.target.value))} /></div>
                  <div><Label className="text-xs">ATR</Label><Input type="number" step="0.01" value={form.t1_atr || ''} onChange={e => setF('t1_atr', Number(e.target.value))} /></div>
                  <div><Label className="text-xs">EMA 20</Label><Input type="number" step="0.01" value={form.t1_ema_20 || ''} onChange={e => setF('t1_ema_20', Number(e.target.value))} /></div>
                  <div><Label className="text-xs">EMA 50</Label><Input type="number" step="0.01" value={form.t1_ema_50 || ''} onChange={e => setF('t1_ema_50', Number(e.target.value))} /></div>
                </div>
                <div><Label className="text-xs">T1 Notes</Label><Input value={form.t1_notes || ''} onChange={e => setF('t1_notes', e.target.value)} /></div>
              </div>
              <div className="space-y-2">
                <p className="text-xs font-semibold text-warning">T2 — Peak/Reversal</p>
                <div className="grid grid-cols-3 gap-2">
                  <div><Label className="text-xs">RSI</Label><Input type="number" step="0.1" value={form.t2_rsi || ''} onChange={e => setF('t2_rsi', Number(e.target.value))} /></div>
                  <div><Label className="text-xs">MACD</Label><Input type="number" step="0.01" value={form.t2_macd || ''} onChange={e => setF('t2_macd', Number(e.target.value))} /></div>
                  <div><Label className="text-xs">Volume</Label><Input type="number" value={form.t2_volume || ''} onChange={e => setF('t2_volume', Number(e.target.value))} /></div>
                  <div><Label className="text-xs">ATR</Label><Input type="number" step="0.01" value={form.t2_atr || ''} onChange={e => setF('t2_atr', Number(e.target.value))} /></div>
                  <div><Label className="text-xs">EMA 20</Label><Input type="number" step="0.01" value={form.t2_ema_20 || ''} onChange={e => setF('t2_ema_20', Number(e.target.value))} /></div>
                  <div><Label className="text-xs">EMA 50</Label><Input type="number" step="0.01" value={form.t2_ema_50 || ''} onChange={e => setF('t2_ema_50', Number(e.target.value))} /></div>
                </div>
                <div><Label className="text-xs">T2 Notes</Label><Input value={form.t2_notes || ''} onChange={e => setF('t2_notes', e.target.value)} /></div>
              </div>
            </div>
          </Section>

          {/* Notes */}
          <div>
            <Label>Notes</Label>
            <Textarea value={form.notes || ''} onChange={e => setF('notes', e.target.value)} placeholder="Zone analysis notes..." rows={3} />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-2 border-t border-border">
            <Button variant="outline" onClick={() => setShowDialog(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={!form.instrument || !form.zone_high || !form.zone_low}>
              {editingZone ? 'Update' : 'Add'} Zone
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  )
}
