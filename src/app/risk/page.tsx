'use client'

import React, { useState } from 'react'
import { useStore } from '@/lib/store'
import { useToast } from '@/components/ui/toast'
import { Card, CardHeader, CardTitle, CardContent, Button, Badge, Input, Label, StatCard, Progress, Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui'
import { formatCurrency, formatPercent } from '@/lib/utils'
import { calculatePositionSize, calculateMaxDrawdown, calculateDashboardKPIs } from '@/lib/calculations'
import { Shield, AlertTriangle, Calculator, Activity, Lock } from 'lucide-react'

export default function RiskPage() {
  const { riskSettings, updateRiskSettings, trades, capitalLog } = useStore()
  const { toast } = useToast()
  const kpis = calculateDashboardKPIs(trades, capitalLog)

  // Position size calculator
  const [calcCapital, setCalcCapital] = useState(kpis.totalCapital)
  const [calcRisk, setCalcRisk] = useState(1)
  const [calcSL, setCalcSL] = useState(50)
  const positionSize = calculatePositionSize(calcCapital, calcRisk, calcSL)

  // Risk violations
  const today = new Date().toISOString().split('T')[0]
  const todayTrades = trades.filter(t => t.date_time.startsWith(today))
  const todayLoss = Math.abs(todayTrades.filter(t => t.pnl < 0).reduce((s, t) => s + t.pnl, 0))
  const dailyLossPct = kpis.totalCapital > 0 ? (todayLoss / kpis.totalCapital) * 100 : 0
  
  // Weekly loss
  const weekAgo = new Date(); weekAgo.setDate(weekAgo.getDate() - 7)
  const weekTrades = trades.filter(t => new Date(t.date_time) >= weekAgo)
  const weeklyLoss = Math.abs(weekTrades.filter(t => t.pnl < 0).reduce((s, t) => s + t.pnl, 0))
  const weeklyLossPct = kpis.totalCapital > 0 ? (weeklyLoss / kpis.totalCapital) * 100 : 0

  const violations = [
    ...(dailyLossPct > riskSettings.max_daily_loss ? [{ type: 'Daily Loss Exceeded', detail: `${dailyLossPct.toFixed(1)}% vs ${riskSettings.max_daily_loss}% limit`, severity: 'critical' as const, date: today }] : []),
    ...(weeklyLossPct > riskSettings.max_weekly_loss ? [{ type: 'Weekly Loss Exceeded', detail: `${weeklyLossPct.toFixed(1)}% vs ${riskSettings.max_weekly_loss}% limit`, severity: 'critical' as const, date: today }] : []),
    ...(kpis.maxDrawdown > riskSettings.max_drawdown ? [{ type: 'Max Drawdown Breached', detail: `${kpis.maxDrawdown.toFixed(1)}% vs ${riskSettings.max_drawdown}% limit`, severity: 'critical' as const, date: today }] : []),
    ...trades.filter(t => t.risk_percent > riskSettings.max_risk_per_trade).map(t => ({
      type: 'Oversized Position', detail: `${t.symbol} on ${new Date(t.date_time).toLocaleDateString('en-IN')} — ${t.risk_percent}% risk vs ${riskSettings.max_risk_per_trade}% max`, severity: 'warning' as const, date: t.date_time.split('T')[0]
    })),
  ]

  const handleSettingSave = (key: string, value: number) => {
    updateRiskSettings({ [key]: value })
    toast('Risk setting updated', 'success')
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Risk Gauges */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="card-hover">
          <CardContent className="p-5">
            <p className="text-xs text-muted-foreground mb-2">Current Drawdown</p>
            <p className={`text-2xl font-bold mb-2 ${kpis.maxDrawdown > riskSettings.max_drawdown ? 'text-destructive' : kpis.maxDrawdown > riskSettings.max_drawdown * 0.7 ? 'text-warning' : 'text-success'}`}>
              {kpis.maxDrawdown.toFixed(1)}%
            </p>
            <Progress value={kpis.maxDrawdown} max={riskSettings.max_drawdown} indicatorClassName={kpis.maxDrawdown > riskSettings.max_drawdown ? 'bg-destructive' : kpis.maxDrawdown > riskSettings.max_drawdown * 0.7 ? 'bg-warning' : 'bg-success'} />
            <p className="text-xs text-muted-foreground mt-1">Max: {riskSettings.max_drawdown}%</p>
          </CardContent>
        </Card>

        <Card className="card-hover">
          <CardContent className="p-5">
            <p className="text-xs text-muted-foreground mb-2">Daily Loss</p>
            <p className={`text-2xl font-bold mb-2 ${dailyLossPct > riskSettings.max_daily_loss ? 'text-destructive' : 'text-success'}`}>
              {dailyLossPct.toFixed(1)}%
            </p>
            <Progress value={dailyLossPct} max={riskSettings.max_daily_loss} indicatorClassName={dailyLossPct > riskSettings.max_daily_loss ? 'bg-destructive' : 'bg-success'} />
            <p className="text-xs text-muted-foreground mt-1">Max: {riskSettings.max_daily_loss}%</p>
          </CardContent>
        </Card>

        <Card className="card-hover">
          <CardContent className="p-5">
            <p className="text-xs text-muted-foreground mb-2">Weekly Loss</p>
            <p className={`text-2xl font-bold mb-2 ${weeklyLossPct > riskSettings.max_weekly_loss ? 'text-destructive' : 'text-success'}`}>
              {weeklyLossPct.toFixed(1)}%
            </p>
            <Progress value={weeklyLossPct} max={riskSettings.max_weekly_loss} indicatorClassName={weeklyLossPct > riskSettings.max_weekly_loss ? 'bg-destructive' : 'bg-success'} />
            <p className="text-xs text-muted-foreground mt-1">Max: {riskSettings.max_weekly_loss}%</p>
          </CardContent>
        </Card>

        <Card className="card-hover">
          <CardContent className="p-5">
            <p className="text-xs text-muted-foreground mb-2">Open Positions</p>
            <p className="text-2xl font-bold text-foreground mb-2">0</p>
            <Progress value={0} max={riskSettings.max_positions} />
            <p className="text-xs text-muted-foreground mt-1">Max: {riskSettings.max_positions}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Risk Settings */}
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Shield className="w-5 h-5 text-primary" /> Risk Settings</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { key: 'max_risk_per_trade', label: 'Max Risk Per Trade (%)', value: riskSettings.max_risk_per_trade },
                { key: 'max_daily_loss', label: 'Max Daily Loss (%)', value: riskSettings.max_daily_loss },
                { key: 'max_weekly_loss', label: 'Max Weekly Loss (%)', value: riskSettings.max_weekly_loss },
                { key: 'max_drawdown', label: 'Max Drawdown (%)', value: riskSettings.max_drawdown },
                { key: 'max_positions', label: 'Max Positions at Once', value: riskSettings.max_positions },
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
