'use client'

import React, { useState, useMemo } from 'react'
import { useStore } from '@/lib/store'
import { useToast } from '@/components/ui/toast'
import { Card, CardHeader, CardTitle, CardContent, Button, Badge, Input, Select, Dialog, Label, Table, TableHeader, TableBody, TableRow, TableHead, TableCell, Textarea, StatCard } from '@/components/ui'
import { formatNumber } from '@/lib/utils'
import { calculateZoneScore, getScoreColor, getScoreLabel } from '@/lib/calculations'
import { Zone, ZoneType, ZoneSubtype, Timeframe, ZoneStatus, TrapRisk } from '@/lib/types'
import { Plus, Search, Filter, Download, Edit2, Trash2, Target, TrendingUp, TrendingDown } from 'lucide-react'
import Papa from 'papaparse'

const zoneTypes: ZoneType[] = ['Demand', 'Supply']
const zoneSubtypes: ZoneSubtype[] = ['DBD', 'RBD', 'DBR', 'RBR', 'Liquidity Sweep', 'Imbalance', 'Compression', 'Flip', 'Trend Continuation', 'HTF', 'Gap', 'Volume', 'News', 'Algo']
const timeframes: Timeframe[] = ['Monthly', 'Weekly', 'Daily', '4H', '1H', '15M']
const zoneStatuses: ZoneStatus[] = ['Fresh', 'Tested', 'Broken', 'Void']
const trapRisks: TrapRisk[] = ['Low', 'Medium', 'High']

const defaultZone = {
  symbol: '', zone_type: 'Demand' as ZoneType, zone_subtype: 'DBD' as ZoneSubtype,
  timeframe: 'Daily' as Timeframe, zone_high: 0, zone_low: 0, status: 'Fresh' as ZoneStatus,
  quality_score: 0, trap_risk: 'Low' as TrapRisk, test_count: 0, notes: '',
  strong_departure: false, low_base_candles: false, freshness: true, liquidity_sweep: false, htf_alignment: false,
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
  const [form, setForm] = useState(defaultZone)
  const [sortBy, setSortBy] = useState<'quality_score' | 'created_at' | 'symbol'>('quality_score')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')

  const filteredZones = useMemo(() => {
    let result = [...zones]
    if (search) result = result.filter(z => z.symbol.toLowerCase().includes(search.toLowerCase()) || z.notes.toLowerCase().includes(search.toLowerCase()))
    if (filterType) result = result.filter(z => z.zone_type === filterType)
    if (filterTimeframe) result = result.filter(z => z.timeframe === filterTimeframe)
    if (filterStatus) result = result.filter(z => z.status === filterStatus)
    result.sort((a, b) => {
      const aVal = a[sortBy], bVal = b[sortBy]
      if (typeof aVal === 'number' && typeof bVal === 'number') return sortDir === 'asc' ? aVal - bVal : bVal - aVal
      return sortDir === 'asc' ? String(aVal).localeCompare(String(bVal)) : String(bVal).localeCompare(String(aVal))
    })
    return result
  }, [zones, search, filterType, filterTimeframe, filterStatus, sortBy, sortDir])

  const openAdd = () => { setEditingZone(null); setForm(defaultZone); setShowDialog(true) }
  const openEdit = (zone: Zone) => {
    setEditingZone(zone)
    setForm({
      ...zone,
      strong_departure: zone.strong_departure ?? false,
      low_base_candles: zone.low_base_candles ?? false,
      freshness: zone.freshness ?? true,
      liquidity_sweep: zone.liquidity_sweep ?? false,
      htf_alignment: zone.htf_alignment ?? false,
    })
    setShowDialog(true)
  }

  const handleSave = () => {
    const score = calculateZoneScore(form)
    const zoneData = { ...form, quality_score: score }
    if (editingZone) {
      updateZone(editingZone.id, zoneData)
      toast('Zone updated successfully', 'success')
    } else {
      addZone(zoneData)
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
      ID: z.id, Symbol: z.symbol, Type: z.zone_type, Subtype: z.zone_subtype,
      Timeframe: z.timeframe, High: z.zone_high, Low: z.zone_low, Status: z.status,
      Score: z.quality_score, TrapRisk: z.trap_risk, TestCount: z.test_count, Notes: z.notes, Created: z.created_at,
    })))
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = 'zones.csv'; a.click()
    toast('Zones exported to CSV', 'success')
  }

  const toggleSort = (col: 'quality_score' | 'created_at' | 'symbol') => {
    if (sortBy === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortBy(col); setSortDir('desc') }
  }

  const stats = {
    total: zones.length,
    fresh: zones.filter(z => z.status === 'Fresh').length,
    demand: zones.filter(z => z.zone_type === 'Demand').length,
    avgScore: zones.length > 0 ? zones.reduce((s, z) => s + z.quality_score, 0) / zones.length : 0,
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard title="Total Zones" value={stats.total} icon={<Target className="w-5 h-5 text-primary" />} />
        <StatCard title="Fresh Zones" value={stats.fresh} icon={<TrendingUp className="w-5 h-5 text-success" />} />
        <StatCard title="Demand Zones" value={stats.demand} icon={<TrendingUp className="w-5 h-5 text-success" />} />
        <StatCard title="Avg Score" value={stats.avgScore.toFixed(0)} icon={<Target className="w-5 h-5 text-warning" />} />
      </div>

      {/* Toolbar */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input className="pl-9" placeholder="Search zones..." value={search} onChange={e => setSearch(e.target.value)} />
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
                <TableHead className="cursor-pointer hover:text-foreground" onClick={() => toggleSort('symbol')}>Symbol {sortBy === 'symbol' && (sortDir === 'asc' ? '↑' : '↓')}</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Subtype</TableHead>
                <TableHead>TF</TableHead>
                <TableHead>Range</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="cursor-pointer hover:text-foreground" onClick={() => toggleSort('quality_score')}>Score {sortBy === 'quality_score' && (sortDir === 'asc' ? '↑' : '↓')}</TableHead>
                <TableHead>Trap Risk</TableHead>
                <TableHead>Tests</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredZones.map(zone => (
                <TableRow key={zone.id}>
                  <TableCell className="font-mono text-xs text-muted-foreground">{zone.id}</TableCell>
                  <TableCell className="font-semibold">{zone.symbol}</TableCell>
                  <TableCell>
                    <Badge variant={zone.zone_type === 'Demand' ? 'success' : 'destructive'}>{zone.zone_type}</Badge>
                  </TableCell>
                  <TableCell className="text-sm">{zone.zone_subtype}</TableCell>
                  <TableCell><Badge variant="outline">{zone.timeframe}</Badge></TableCell>
                  <TableCell className="font-mono text-xs">{formatNumber(zone.zone_low)} — {formatNumber(zone.zone_high)}</TableCell>
                  <TableCell>
                    <Badge variant={zone.status === 'Fresh' ? 'success' : zone.status === 'Tested' ? 'warning' : zone.status === 'Broken' ? 'destructive' : 'secondary'}>
                      {zone.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="inline-flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: getScoreColor(zone.quality_score) }} />
                      <span className="font-bold" style={{ color: getScoreColor(zone.quality_score) }}>{zone.quality_score}</span>
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge variant={zone.trap_risk === 'Low' ? 'success' : zone.trap_risk === 'Medium' ? 'warning' : 'destructive'}>{zone.trap_risk}</Badge>
                  </TableCell>
                  <TableCell>{zone.test_count}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(zone)}><Edit2 className="w-4 h-4" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(zone.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={showDialog} onClose={() => setShowDialog(false)} title={editingZone ? 'Edit Zone' : 'Add Zone'} maxWidth="max-w-2xl">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Symbol</Label>
            <Input value={form.symbol} onChange={e => setForm(f => ({ ...f, symbol: e.target.value.toUpperCase() }))} placeholder="NIFTY" />
          </div>
          <div>
            <Label>Zone Type</Label>
            <Select options={zoneTypes.map(t => ({ value: t, label: t }))} value={form.zone_type} onChange={e => setForm(f => ({ ...f, zone_type: e.target.value as ZoneType }))} />
          </div>
          <div>
            <Label>Subtype</Label>
            <Select options={zoneSubtypes.map(t => ({ value: t, label: t }))} value={form.zone_subtype} onChange={e => setForm(f => ({ ...f, zone_subtype: e.target.value as ZoneSubtype }))} />
          </div>
          <div>
            <Label>Timeframe</Label>
            <Select options={timeframes.map(t => ({ value: t, label: t }))} value={form.timeframe} onChange={e => setForm(f => ({ ...f, timeframe: e.target.value as Timeframe }))} />
          </div>
          <div>
            <Label>Zone High</Label>
            <Input type="number" value={form.zone_high || ''} onChange={e => setForm(f => ({ ...f, zone_high: Number(e.target.value) }))} />
          </div>
          <div>
            <Label>Zone Low</Label>
            <Input type="number" value={form.zone_low || ''} onChange={e => setForm(f => ({ ...f, zone_low: Number(e.target.value) }))} />
          </div>
          <div>
            <Label>Status</Label>
            <Select options={zoneStatuses.map(t => ({ value: t, label: t }))} value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value as ZoneStatus }))} />
          </div>
          <div>
            <Label>Trap Risk</Label>
            <Select options={trapRisks.map(t => ({ value: t, label: t }))} value={form.trap_risk} onChange={e => setForm(f => ({ ...f, trap_risk: e.target.value as TrapRisk }))} />
          </div>
          <div>
            <Label>Test Count</Label>
            <Input type="number" value={form.test_count} onChange={e => setForm(f => ({ ...f, test_count: Number(e.target.value) }))} />
          </div>
          <div>
            <Label>Score: <span className="font-bold" style={{ color: getScoreColor(calculateZoneScore(form)) }}>{calculateZoneScore(form)} — {getScoreLabel(calculateZoneScore(form))}</span></Label>
          </div>

          {/* Score criteria checkboxes */}
          <div className="col-span-2 grid grid-cols-2 md:grid-cols-3 gap-3 p-3 rounded-lg bg-secondary/50">
            <p className="col-span-full text-xs font-medium text-muted-foreground mb-1">Score Factors:</p>
            {[
              { key: 'strong_departure', label: 'Strong Departure (+30)', points: 30 },
              { key: 'low_base_candles', label: 'Low Base Candles (+20)', points: 20 },
              { key: 'freshness', label: 'Freshness (+20)', points: 20 },
              { key: 'liquidity_sweep', label: 'Liquidity Sweep (+15)', points: 15 },
              { key: 'htf_alignment', label: 'HTF Alignment (+15)', points: 15 },
            ].map(item => (
              <label key={item.key} className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={(form as Record<string, unknown>)[item.key] as boolean}
                  onChange={e => setForm(f => ({ ...f, [item.key]: e.target.checked }))}
                  className="rounded border-border"
                />
                {item.label}
              </label>
            ))}
          </div>

          <div className="col-span-2">
            <Label>Notes</Label>
            <Textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="Zone analysis notes..." />
          </div>

          <div className="col-span-2 flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setShowDialog(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={!form.symbol || !form.zone_high || !form.zone_low}>{editingZone ? 'Update' : 'Add'} Zone</Button>
          </div>
        </div>
      </Dialog>
    </div>
  )
}
