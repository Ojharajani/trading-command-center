'use client'

import React, { useState } from 'react'
import { useStore } from '@/lib/store'
import { useToast } from '@/components/ui/toast'
import { Card, CardHeader, CardTitle, CardContent, Button, Badge, Input, Label, StatCard, Progress, Select, Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui'
import { formatCurrency, formatPercent } from '@/lib/utils'
import { calculatePositionSize, calculateDashboardKPIs } from '@/lib/calculations'
import { Shield, AlertTriangle, Calculator, Activity, Lock } from 'lucide-react'

export default function RiskPage() {
  const { accounts, updateAccount, trades, capitalLog } = useStore()
  const { toast } = useToast()
  const kpis = calculateDashboardKPIs(trades, capitalLog)
  const [selectedAccountId, setSelectedAccountId] = useState(accounts[0]?.account_id || '')
  const selectedAccount = accounts.find(a => a.account_id === selectedAccountId) || accounts[0]

  // Position size calculator
  const [calcCapital, setCalcCapital] = useState(kpis.totalCapital)
  const [calcRisk, setCalcRisk] = useState(1)
  const [calcSL, setCalcSL] = useState(50)
  const positionSize = calculatePositionSize(calcCapital, calcRisk, calcSL)

  // Risk violations
  const today = new Date().toISOString().split('T')[0]
  const todayTrades = trades.filter(t => t.entry_datetime.startsWith(today))
  const todayLoss = Math.abs(todayTrades.filter(t => (t.e_net_pnl || 0) < 0).reduce((s, t) => s + (t.e_net_pnl || 0), 0))
  const dailyLossPct = kpis.totalCapital > 0 ? (todayLoss / kpis.totalCapital) * 100 : 0

  // Weekly loss
  const weekAgo = new Date(); weekAgo.setDate(weekAgo.getDate() - 7)
  const weekTrades = trades.filter(t => new Date(t.entry_datetime) >= weekAgo)
  const weeklyLoss = Math.abs(weekTrades.filter(t => (t.e_net_pnl || 0) < 0).reduce((s, t) => s + (t.e_net_pnl || 0), 0))
  const weeklyLossPct = kpis.totalCapital > 0 ? (weeklyLoss / kpis.totalCapital) * 100 : 0

  const violations = selectedAccount ? [
    ...(dailyLossPct > selectedAccount.max_daily_loss ? [{ type: 'Daily Loss Exceeded', detail: `${dailyLossPct.toFixed(1)}% vs ${selectedAccount.max_daily_loss}% limit`, severity: 'critical' as const, date: today }] : []),
    ...(weeklyLossPct > selectedAccount.max_weekly_loss ? [{ type: 'Weekly Loss Exceeded', detail: `${weeklyLossPct.toFixed(1)}% vs ${selectedAccount.max_weekly_loss}% limit`, severity: 'critical' as const, date: today }] : []),
    ...(kpis.maxDrawdown > selectedAccount.max_drawdown ? [{ type: 'Max Drawdown Breached', detail: `${kpis.maxDrawdown.toFixed(1)}% vs ${selectedAccount.max_drawdown}% limit`, severity: 'critical' as const, date: today }] : []),
    ...trades.filter(t => t.d_risk_pct > selectedAccount.max_risk_per_trade && t.account_id === selectedAccountId).map(t => ({
      type: 'Oversized Position', detail: `${t.b_instrument} on ${new Date(t.entry_datetime).toLocaleDateString('en-IN')} — ${t.d_risk_pct}% risk vs ${selectedAccount.max_risk_per_trade}% max`, severity: 'warning' as const, date: t.entry_datetime.split('T')[0]
    })),
  ] : []

  const handleSettingSave = (key: string, value: number) => {
    if (selectedAccount) {
      updateAccount(selectedAccount.account_id, { [key]: value })
      toast('Risk setting updated', 'success')
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Account Selector */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <Label className="text-sm font-medium whitespace-nowrap">Account:</Label>
            <Select
              options={accounts.map(a => ({ value: a.account_id, label: `${a.account_name} (${a.segment})` }))}
              value={selectedAccountId}
              onChange={e => setSelectedAccountId(e.target.value)}
              className="max-w-xs"
            />
          </div>
        </CardContent>
      </Card>

      {/* Risk Gauges */}
      {selectedAccount && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="card-hover">
            <CardContent className="p-5">
              <p className="text-xs text-muted-foreground mb-2">Current Drawdown</p>
              <p className={`text-2xl font-bold mb-2 ${kpis.maxDrawdown > selectedAccount.max_drawdown ? 'text-destructive' : kpis.maxDrawdown > selectedAccount.max_drawdown * 0.7 ? 'text-warning' : 'text-success'}`}>
                {kpis.maxDrawdown.toFixed(1)}%
              </p>
              <Progress value={kpis.maxDrawdown} max={selectedAccount.max_drawdown} indicatorClassName={kpis.maxDrawdown > selectedAccount.max_drawdown ? 'bg-destructive' : kpis.maxDrawdown > selectedAccount.max_drawdown * 0.7 ? 'bg-warning' : 'bg-success'} />
              <p className="text-xs text-muted-foreground mt-1">Max: {selectedAccount.max_drawdown}%</p>
            </CardContent>
          </Card>

          <Card className="card-hover">
            <CardContent className="p-5">
              <p className="text-xs text-muted-foreground mb-2">Daily Loss</p>
              <p className={`text-2xl font-bold mb-2 ${dailyLossPct > selectedAccount.max_daily_loss ? 'text-destructive' : 'text-success'}`}>
                {dailyLossPct.toFixed(1)}%
              </p>
              <Progress value={dailyLossPct} max={selectedAccount.max_daily_loss} indicatorClassName={dailyLossPct > selectedAccount.max_daily_loss ? 'bg-destructive' : 'bg-success'} />
              <p className="text-xs text-muted-foreground mt-1">Max: {selectedAccount.max_daily_loss}%</p>
            </CardContent>
          </Card>

          <Card className="card-hover">
            <CardContent className="p-5">
              <p className="text-xs text-muted-foreground mb-2">Weekly Loss</p>
              <p className={`text-2xl font-bold mb-2 ${weeklyLossPct > selectedAccount.max_weekly_loss ? 'text-destructive' : 'text-success'}`}>
                {weeklyLossPct.toFixed(1)}%
              </p>
              <Progress value={weeklyLossPct} max={selectedAccount.max_weekly_loss} indicatorClassName={weeklyLossPct > selectedAccount.max_weekly_loss ? 'bg-destructive' : 'bg-success'} />
              <p className="text-xs text-muted-foreground mt-1">Max: {selectedAccount.max_weekly_loss}%</p>
            </CardContent>
          </Card>

          <Card className="card-hover">
            <CardContent className="p-5">
              <p className="text-xs text-muted-foreground mb-2">Open Positions</p>
              <p className="text-2xl font-bold text-foreground mb-2">0</p>
              <Progress value={0} max={selectedAccount.max_positions} />
              <p className="text-xs text-muted-foreground mt-1">Max: {selectedAccount.max_positions}</p>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Risk Settings — now per account */}
        {selectedAccount && (
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><Shield className="w-5 h-5 text-primary" /> Risk Settings — {selectedAccount.account_name}</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { key: 'max_risk_per_trade', label: 'Max Risk Per Trade (%)', value: selectedAccount.max_risk_per_trade },
                  { key: 'max_daily_loss', label: 'Max Daily Loss (%)', value: selectedAccount.max_daily_loss },
                  { key: 'max_weekly_loss', label: 'Max Weekly Loss (%)', value: selectedAccount.max_weekly_loss },
                  { key: 'max_drawdown', label: 'Max Drawdown (%)', value: selectedAccount.max_drawdown },
                  { key: 'max_positions', label: 'Max Positions at Once', value: selectedAccount.max_positions },
                ].map(setting => (
                  <div key={setting.key} className="flex items-center gap-4">
                    <Label className="flex-1 text-sm">{setting.label}</Label>
                    <Input
                      type="number"
                      step="0.5"
                      className="w-24"
                      value={setting.value}
                      onChange={e => handleSettingSave(setting.key, Number(e.target.value))}
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Position Size Calculator */}
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Calculator className="w-5 h-5 text-primary" /> Position Size Calculator</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label>Capital (₹)</Label>
                <Input type="number" value={calcCapital} onChange={e => setCalcCapital(Number(e.target.value))} />
              </div>
              <div>
                <Label>Risk Per Trade (%)</Label>
                <Input type="number" step="0.1" value={calcRisk} onChange={e => setCalcRisk(Number(e.target.value))} />
              </div>
              <div>
                <Label>Stop Loss (Points)</Label>
                <Input type="number" value={calcSL} onChange={e => setCalcSL(Number(e.target.value))} />
              </div>
              <div className="p-4 rounded-xl bg-primary/10 border border-primary/20">
                <p className="text-xs text-muted-foreground mb-1">Recommended Position Size</p>
                <p className="text-3xl font-bold text-primary">{positionSize} <span className="text-sm font-normal text-muted-foreground">qty</span></p>
                <p className="text-xs text-muted-foreground mt-1">
                  Risk Amount: {formatCurrency(calcCapital * (calcRisk / 100))}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Violation Log */}
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><AlertTriangle className="w-5 h-5 text-destructive" /> Violation Log ({violations.length})</CardTitle></CardHeader>
        <CardContent>
          {violations.length === 0 ? (
            <div className="text-center py-8">
              <div className="p-3 rounded-full bg-success/10 inline-block mb-3"><Shield className="w-8 h-8 text-success" /></div>
              <p className="text-sm font-medium text-success">All Clear — No Risk Violations</p>
              <p className="text-xs text-muted-foreground">Your risk management is on point!</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Violation</TableHead>
                  <TableHead>Details</TableHead>
                  <TableHead>Severity</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {violations.map((v, i) => (
                  <TableRow key={i}>
                    <TableCell className="text-xs text-muted-foreground">{v.date}</TableCell>
                    <TableCell className="font-medium">{v.type}</TableCell>
                    <TableCell className="text-sm">{v.detail}</TableCell>
                    <TableCell><Badge variant={v.severity === 'critical' ? 'destructive' : 'warning'}>{v.severity}</Badge></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
