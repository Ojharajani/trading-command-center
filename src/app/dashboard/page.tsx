'use client'

import React from 'react'
import { useStore } from '@/lib/store'
import { Card, CardHeader, CardTitle, CardContent, StatCard, Badge, Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui'
import { formatCurrency, formatPercent, formatNumber } from '@/lib/utils'
import { calculateDashboardKPIs, getEquityCurve, getMonthlyPnL, getScoreColor, getScoreLabel } from '@/lib/calculations'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts'
import { DollarSign, TrendingUp, Target, Activity, AlertTriangle, Shield, Zap, BarChart3 } from 'lucide-react'

export default function DashboardPage() {
  const { trades, zones, capitalLog, riskSettings } = useStore()
  const kpis = calculateDashboardKPIs(trades, capitalLog)
  const equityCurve = getEquityCurve(trades)
  const monthlyPnL = getMonthlyPnL(trades)
  const recentTrades = [...trades].sort((a, b) => new Date(b.date_time).getTime() - new Date(a.date_time).getTime()).slice(0, 10)
  const activeZones = zones.filter(z => z.status === 'Fresh' || z.status === 'Tested')

  // Capital growth data
  const capitalData = capitalLog.map(c => ({
    date: c.date,
    capital: c.capital_amount,
  }))

  // Risk violations check
  const todayTrades = trades.filter(t => t.date_time.startsWith(new Date().toISOString().split('T')[0]))
  const todayLoss = Math.abs(todayTrades.filter(t => t.pnl < 0).reduce((s, t) => s + t.pnl, 0))
  const dailyLossPercent = kpis.totalCapital > 0 ? (todayLoss / kpis.totalCapital) * 100 : 0
  const riskAlerts: { type: string; message: string; severity: 'warning' | 'critical' }[] = []
  
  if (dailyLossPercent > riskSettings.max_daily_loss) {
    riskAlerts.push({ type: 'Daily Loss', message: `Daily loss ${dailyLossPercent.toFixed(1)}% exceeds ${riskSettings.max_daily_loss}% limit`, severity: 'critical' })
  }
  if (kpis.maxDrawdown > riskSettings.max_drawdown) {
    riskAlerts.push({ type: 'Drawdown', message: `Max drawdown ${kpis.maxDrawdown.toFixed(1)}% exceeds ${riskSettings.max_drawdown}% limit`, severity: 'critical' })
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Capital"
          value={formatCurrency(kpis.totalCapital)}
          icon={<DollarSign className="w-5 h-5 text-primary" />}
          trend="up"
          trendValue={formatPercent(((kpis.totalCapital - 500000) / 500000) * 100)}
          subtitle="from initial"
        />
        <StatCard
          title="Today's PnL"
          value={formatCurrency(kpis.todayPnl)}
          icon={<TrendingUp className="w-5 h-5 text-primary" />}
          trend={kpis.todayPnl >= 0 ? 'up' : 'down'}
          trendValue={kpis.totalCapital > 0 ? formatPercent((kpis.todayPnl / kpis.totalCapital) * 100) : '0%'}
        />
        <StatCard
          title="Monthly PnL"
          value={formatCurrency(kpis.monthlyPnl)}
          icon={<BarChart3 className="w-5 h-5 text-primary" />}
          trend={kpis.monthlyPnl >= 0 ? 'up' : 'down'}
          trendValue={kpis.totalCapital > 0 ? formatPercent((kpis.monthlyPnl / kpis.totalCapital) * 100) : '0%'}
        />
        <StatCard
          title="Win Rate"
          value={`${kpis.winRate.toFixed(1)}%`}
          icon={<Target className="w-5 h-5 text-primary" />}
          trend={kpis.winRate >= 50 ? 'up' : 'down'}
          trendValue={`${trades.length} trades`}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Equity Curve */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-primary" />
              Equity Curve
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={equityCurve}>
                  <defs>
                    <linearGradient id="equityGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgb(var(--border))" />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: 'rgb(var(--muted-foreground))' }} />
                  <YAxis tick={{ fontSize: 11, fill: 'rgb(var(--muted-foreground))' }} />
                  <Tooltip
                    contentStyle={{ background: 'rgb(var(--card))', border: '1px solid rgb(var(--border))', borderRadius: '8px', color: 'rgb(var(--foreground))' }}
                    formatter={(value) => [formatCurrency(Number(value)), 'Equity']}
                  />
                  <Area type="monotone" dataKey="equity" stroke="#3B82F6" strokeWidth={2} fill="url(#equityGradient)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Capital Growth */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-success" />
              Capital Growth
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={capitalData}>
                  <defs>
                    <linearGradient id="capitalGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22C55E" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#22C55E" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgb(var(--border))" />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: 'rgb(var(--muted-foreground))' }} />
                  <YAxis tick={{ fontSize: 11, fill: 'rgb(var(--muted-foreground))' }} />
                  <Tooltip
                    contentStyle={{ background: 'rgb(var(--card))', border: '1px solid rgb(var(--border))', borderRadius: '8px', color: 'rgb(var(--foreground))' }}
                    formatter={(value) => [formatCurrency(Number(value)), 'Capital']}
                  />
                  <Area type="monotone" dataKey="capital" stroke="#22C55E" strokeWidth={2} fill="url(#capitalGradient)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Middle Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card className="card-hover">
          <CardContent className="p-4 text-center">
            <p className="text-xs text-muted-foreground mb-1">Profit Factor</p>
            <p className="text-xl font-bold text-foreground">{kpis.profitFactor === Infinity ? '∞' : kpis.profitFactor.toFixed(2)}</p>
          </CardContent>
        </Card>
        <Card className="card-hover">
          <CardContent className="p-4 text-center">
            <p className="text-xs text-muted-foreground mb-1">Expectancy</p>
            <p className={`text-xl font-bold ${kpis.expectancy >= 0 ? 'text-success' : 'text-destructive'}`}>
              {formatCurrency(kpis.expectancy)}
            </p>
          </CardContent>
        </Card>
        <Card className="card-hover">
          <CardContent className="p-4 text-center">
            <p className="text-xs text-muted-foreground mb-1">Avg RR</p>
            <p className="text-xl font-bold text-foreground">{kpis.avgRR.toFixed(2)}</p>
          </CardContent>
        </Card>
        <Card className="card-hover">
          <CardContent className="p-4 text-center">
            <p className="text-xs text-muted-foreground mb-1">Max Drawdown</p>
            <p className={`text-xl font-bold ${kpis.maxDrawdown > 10 ? 'text-destructive' : 'text-warning'}`}>
              {kpis.maxDrawdown.toFixed(1)}%
            </p>
          </CardContent>
        </Card>
        <Card className="card-hover">
          <CardContent className="p-4 text-center">
            <p className="text-xs text-muted-foreground mb-1">Max Cons. Wins</p>
            <p className="text-xl font-bold text-success">{kpis.consecutiveWins}</p>
          </CardContent>
        </Card>
        <Card className="card-hover">
          <CardContent className="p-4 text-center">
            <p className="text-xs text-muted-foreground mb-1">Max Cons. Losses</p>
            <p className="text-xl font-bold text-destructive">{kpis.consecutiveLosses}</p>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Recent Trades */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Recent Trades</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Symbol</TableHead>
                  <TableHead>Direction</TableHead>
                  <TableHead>Setup</TableHead>
                  <TableHead className="text-right">PnL</TableHead>
                  <TableHead>Result</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentTrades.map(trade => (
                  <TableRow key={trade.id}>
                    <TableCell className="text-xs text-muted-foreground">
                      {new Date(trade.date_time).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                    </TableCell>
                    <TableCell className="font-medium">{trade.symbol}</TableCell>
                    <TableCell>
                      <Badge variant={trade.direction === 'Long' ? 'success' : 'destructive'}>
                        {trade.direction}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">{trade.setup}</TableCell>
                    <TableCell className={`text-right font-mono font-medium ${trade.pnl >= 0 ? 'text-success' : 'text-destructive'}`}>
                      {formatCurrency(trade.pnl)}
                    </TableCell>
                    <TableCell>
                      <Badge variant={trade.result === 'Win' ? 'success' : trade.result === 'Loss' ? 'destructive' : 'secondary'}>
                        {trade.result}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Right Column */}
        <div className="space-y-4">
          {/* Active Zones */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-warning" />
                Active Zones ({activeZones.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-[200px] overflow-y-auto">
                {activeZones.slice(0, 6).map(zone => (
                  <div key={zone.id} className="flex items-center justify-between p-2.5 rounded-lg bg-secondary/50">
                    <div>
                      <span className="text-sm font-medium">{zone.symbol}</span>
                      <span className="text-xs text-muted-foreground ml-2">{zone.timeframe}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={zone.zone_type === 'Demand' ? 'success' : 'destructive'}>
                        {zone.zone_type}
                      </Badge>
                      <span className="text-xs font-bold" style={{ color: getScoreColor(zone.quality_score) }}>
                        {zone.quality_score}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Risk Alerts */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-destructive" />
                Risk Alerts
              </CardTitle>
            </CardHeader>
            <CardContent>
              {riskAlerts.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-sm text-success font-medium">✓ All clear</p>
                  <p className="text-xs text-muted-foreground">No risk violations today</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {riskAlerts.map((alert, i) => (
                    <div key={i} className={`flex items-start gap-2 p-2.5 rounded-lg ${alert.severity === 'critical' ? 'bg-destructive/10 border border-destructive/20' : 'bg-warning/10 border border-warning/20'}`}>
                      <AlertTriangle className={`w-4 h-4 mt-0.5 flex-shrink-0 ${alert.severity === 'critical' ? 'text-destructive' : 'text-warning'}`} />
                      <div>
                        <p className="text-xs font-medium">{alert.type}</p>
                        <p className="text-xs text-muted-foreground">{alert.message}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
