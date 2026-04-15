'use client'

import React, { useMemo, useState } from 'react'
import { useStore } from '@/lib/store'
import { useToast } from '@/components/ui/toast'
import { Card, CardHeader, CardTitle, CardContent, Button, Badge, Input, Label, Select, StatCard, Dialog, Table, TableHeader, TableBody, TableRow, TableHead, TableCell, Tabs } from '@/components/ui'
import { formatCurrency } from '@/lib/utils'
import { calculateTaxRate, calculateTaxAmount } from '@/lib/calculations'
import { TaxRecord, TradeType } from '@/lib/types'
import { Receipt, Plus, Trash2, IndianRupee, FileText } from 'lucide-react'

export default function TaxPage() {
  const { taxRecords, trades, addTaxRecord, deleteTaxRecord } = useStore()
  const { toast } = useToast()
  const [showDialog, setShowDialog] = useState(false)
  const [activeTab, setActiveTab] = useState('records')
  const [form, setForm] = useState<Partial<TaxRecord>>({
    trade_id: '', profit_loss: 0, trade_type: 'F&O', tax_rate: 30, tax_amount: 0, financial_year: '2025-26', notes: '',
  })

  // Summary calculations
  const totalProfit = taxRecords.filter(t => t.profit_loss > 0).reduce((s, t) => s + t.profit_loss, 0)
  const totalLoss = Math.abs(taxRecords.filter(t => t.profit_loss < 0).reduce((s, t) => s + t.profit_loss, 0))
  const netTaxable = totalProfit - totalLoss
  const totalTax = taxRecords.reduce((s, t) => s + t.tax_amount, 0)
  const fnoLoss = Math.abs(taxRecords.filter(t => t.trade_type === 'F&O' && t.profit_loss < 0).reduce((s, t) => s + t.profit_loss, 0))

  // Year-wise summary
  const yearSummary = useMemo(() => {
    const map = new Map<string, { profit: number; loss: number; tax: number }>()
    taxRecords.forEach(t => {
      if (!map.has(t.financial_year)) map.set(t.financial_year, { profit: 0, loss: 0, tax: 0 })
      const e = map.get(t.financial_year)!
      if (t.profit_loss > 0) e.profit += t.profit_loss
      else e.loss += Math.abs(t.profit_loss)
      e.tax += t.tax_amount
    })
    return Array.from(map.entries()).map(([year, data]) => ({ year, ...data, net: data.profit - data.loss }))
  }, [taxRecords])

  const handleTradeTypeChange = (tt: TradeType) => {
    const rate = calculateTaxRate(tt)
    const amount = calculateTaxAmount(form.profit_loss || 0, rate)
    setForm(f => ({ ...f, trade_type: tt, tax_rate: rate, tax_amount: amount }))
  }

  const handlePLChange = (pl: number) => {
    const amount = calculateTaxAmount(pl, form.tax_rate || 30)
    setForm(f => ({ ...f, profit_loss: pl, tax_amount: amount }))
  }

  const handleAdd = () => {
    addTaxRecord(form as Omit<TaxRecord, 'id'>)
    toast('Tax record added', 'success')
    setShowDialog(false)
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard title="Total Taxable Profit" value={formatCurrency(totalProfit)} icon={<IndianRupee className="w-5 h-5 text-success" />} />
        <StatCard title="Total Losses" value={formatCurrency(totalLoss)} icon={<IndianRupee className="w-5 h-5 text-destructive" />} />
        <StatCard title="Estimated Tax" value={formatCurrency(totalTax)} icon={<Receipt className="w-5 h-5 text-warning" />} />
        <StatCard title="F&O Loss Carryforward" value={formatCurrency(fnoLoss)} icon={<FileText className="w-5 h-5 text-primary" />} />
      </div>

      <div className="flex items-center justify-between">
        <Tabs tabs={[{ id: 'records', label: 'Tax Records' }, { id: 'summary', label: 'Year Summary' }]} activeTab={activeTab} onTabChange={setActiveTab} />
        <Button size="sm" onClick={() => setShowDialog(true)}><Plus className="w-4 h-4 mr-1" /> Add Record</Button>
      </div>

      {activeTab === 'records' && (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Trade ID</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Profit/Loss</TableHead>
                  <TableHead>Tax Rate</TableHead>
                  <TableHead>Tax Amount</TableHead>
                  <TableHead>FY</TableHead>
                  <TableHead>Notes</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {taxRecords.map(record => (
                  <TableRow key={record.id}>
                    <TableCell className="font-mono text-xs">{record.trade_id}</TableCell>
                    <TableCell><Badge variant="outline">{record.trade_type}</Badge></TableCell>
                    <TableCell className={`font-mono font-medium ${record.profit_loss >= 0 ? 'text-success' : 'text-destructive'}`}>
                      {formatCurrency(record.profit_loss)}
                    </TableCell>
                    <TableCell>{record.tax_rate}%</TableCell>
                    <TableCell className="font-mono">{formatCurrency(record.tax_amount)}</TableCell>
                    <TableCell className="text-sm">{record.financial_year}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{record.notes}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" onClick={() => { deleteTaxRecord(record.id); toast('Deleted', 'info') }}>
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {activeTab === 'summary' && (
        <Card>
          <CardHeader><CardTitle>Year-wise Tax Summary</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Financial Year</TableHead>
                  <TableHead>Total Profit</TableHead>
                  <TableHead>Total Loss</TableHead>
                  <TableHead>Net Taxable</TableHead>
                  <TableHead>Estimated Tax</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {yearSummary.map(row => (
                  <TableRow key={row.year}>
                    <TableCell className="font-medium">{row.year}</TableCell>
                    <TableCell className="text-success font-mono">{formatCurrency(row.profit)}</TableCell>
                    <TableCell className="text-destructive font-mono">{formatCurrency(row.loss)}</TableCell>
                    <TableCell className={`font-mono font-medium ${row.net >= 0 ? 'text-success' : 'text-destructive'}`}>
                      {formatCurrency(row.net)}
                    </TableCell>
                    <TableCell className="font-mono">{formatCurrency(row.tax)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      <Dialog open={showDialog} onClose={() => setShowDialog(false)} title="Add Tax Record">
        <div className="space-y-4">
          <div>
            <Label>Linked Trade</Label>
            <Select options={[{ value: '', label: 'Select Trade' }, ...trades.map(t => ({ value: t.id, label: `${t.id} — ${t.symbol} (${formatCurrency(t.pnl)})` }))]} value={form.trade_id || ''} onChange={e => setForm(f => ({ ...f, trade_id: e.target.value }))} />
          </div>
          <div><Label>Profit/Loss (₹)</Label><Input type="number" value={form.profit_loss || ''} onChange={e => handlePLChange(Number(e.target.value))} /></div>
          <div>
            <Label>Trade Type</Label>
            <Select options={(['Intraday', 'STCG', 'LTCG', 'F&O'] as TradeType[]).map(t => ({ value: t, label: t }))} value={form.trade_type || ''} onChange={e => handleTradeTypeChange(e.target.value as TradeType)} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><Label>Tax Rate (%)</Label><Input type="number" value={form.tax_rate || ''} disabled /></div>
            <div><Label>Tax Amount (₹)</Label><Input type="number" value={form.tax_amount || ''} disabled /></div>
          </div>
          <div><Label>Financial Year</Label><Input value={form.financial_year || ''} onChange={e => setForm(f => ({ ...f, financial_year: e.target.value }))} placeholder="2025-26" /></div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowDialog(false)}>Cancel</Button>
            <Button onClick={handleAdd}>Add Record</Button>
          </div>
        </div>
      </Dialog>
    </div>
  )
}
