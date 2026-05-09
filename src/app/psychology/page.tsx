'use client'

import React, { useMemo } from 'react'
import { useStore } from '@/lib/store'
import { Card, CardHeader, CardTitle, CardContent, StatCard, Badge, Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui'
import { calculateWinRate } from '@/lib/calculations'
import { Brain, AlertTriangle, TrendingDown, CheckCircle2, XCircle } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts'

export default function PsychologyPage() {
  const { trades } = useStore()

  // Emotion vs Win Rate — using Section F fields
  const emotionWinRate = useMemo(() => {
    const emotionMap = new Map<string, { wins: number; total: number }>()
    trades.filter(t => t.f_pre_trade_emotion).forEach(t => {
      const emotion = t.f_pre_trade_emotion || 'Neutral'
      if (!emotionMap.has(emotion)) emotionMap.set(emotion, { wins: 0, total: 0 })
      const e = emotionMap.get(emotion)!
      e.total++
      if (t.e_result === 'Win') e.wins++
    })
    return Array.from(emotionMap.entries()).map(([emotion, data]) => ({
      emotion,
      winRate: data.total > 0 ? (data.wins / data.total) * 100 : 0,
      trades: data.total,
    }))
  }, [trades])

  // From trade Section F
  const revengeTrades = trades.filter(t => t.f_revenge_trade)
  const planViolations = trades.filter(t => !t.f_followed_plan)

  // Discipline trend — using f_discipline_score and f_confidence_score
  const disciplineTrend = useMemo(() => {
    return [...trades]
      .sort((a, b) => new Date(a.entry_datetime).getTime() - new Date(b.entry_datetime).getTime())
      .map((t, i) => ({
        trade: i + 1,
        discipline: t.f_discipline_score || 0,
        confidence: t.f_confidence_score || 0,
      }))
  }, [trades])

  // Mistake breakdown — using g_mistake_tag
  const mistakeBreakdown = useMemo(() => {
    const map = new Map<string, number>()
    trades.forEach(t => {
      if (t.g_mistake_tag && t.g_mistake_tag !== 'No Mistake') {
        map.set(t.g_mistake_tag, (map.get(t.g_mistake_tag) || 0) + 1)
      }
    })
    return Array.from(map.entries()).map(([type, count]) => ({ type, count })).sort((a, b) => b.count - a.count)
  }, [trades])

  const avgDiscipline = trades.length > 0 ? trades.reduce((s, t) => s + (t.f_discipline_score || 0), 0) / trades.length : 0
  const avgConfidence = trades.length > 0 ? trades.reduce((s, t) => s + (t.f_confidence_score || 0), 0) / trades.length : 0

  // Insights
  const insights: string[] = []
  const confidentTrades = trades.filter(t => t.f_pre_trade_emotion === 'Confident')
  const greedTrades = trades.filter(t => t.f_pre_trade_emotion === 'Greed')
  const confidentWR = calculateWinRate(confidentTrades)
  const greedWR = calculateWinRate(greedTrades)
  if (confidentTrades.length > 3 && confidentWR > 60) insights.push(`🎯 You perform best when confident — ${confidentWR.toFixed(0)}% win rate`)
  if (greedTrades.length > 2 && greedWR < 40) insights.push(`⚠️ Greedy trades hurt you — only ${greedWR.toFixed(0)}% win rate`)
  if (revengeTrades.length > 0) insights.push(`🔥 You've taken ${revengeTrades.length} revenge trade(s) — these rarely work`)
  if (avgDiscipline < 60) insights.push(`📉 Average discipline is low (${avgDiscipline.toFixed(0)}/100) — focus on following your rules`)
  if (avgDiscipline >= 80) insights.push(`✅ Excellent discipline (${avgDiscipline.toFixed(0)}/100) — keep it up!`)

  // Check for consecutive win-then-loss pattern
  let consWinLoss = 0
  const sortedTrades = [...trades].sort((a, b) => new Date(a.entry_datetime).getTime() - new Date(b.entry_datetime).getTime())
  for (let i = 3; i < sortedTrades.length; i++) {
    if (sortedTrades[i - 1].e_result === 'Win' && sortedTrades[i - 2].e_result === 'Win' && sortedTrades[i - 3].e_result === 'Win' && sortedTrades[i].e_result === 'Loss') {
      consWinLoss++
    }
  }
  if (consWinLoss > 0) insights.push(`💡 You tend to lose after 3 consecutive wins — watch for overconfidence`)

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard title="Avg Discipline" value={`${avgDiscipline.toFixed(0)}/100`} icon={<Brain className="w-5 h-5 text-primary" />} />
        <StatCard title="Avg Confidence" value={`${avgConfidence.toFixed(1)}/10`} icon={<CheckCircle2 className="w-5 h-5 text-success" />} />
        <StatCard title="Revenge Trades" value={revengeTrades.length} icon={<AlertTriangle className="w-5 h-5 text-destructive" />} />
        <StatCard title="Plan Violations" value={planViolations.length} icon={<XCircle className="w-5 h-5 text-destructive" />} />
      </div>

      {/* Insights Card */}
      {insights.length > 0 && (
        <Card className="border-primary/30 bg-primary/5">
          <CardHeader><CardTitle className="flex items-center gap-2"><Brain className="w-5 h-5 text-primary" /> AI Insights</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2">
              {insights.map((insight, i) => (
                <p key={i} className="text-sm">{insight}</p>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Emotion vs Win Rate */}
        <Card>
          <CardHeader><CardTitle>Emotion vs Win Rate</CardTitle></CardHeader>
          <CardContent>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={emotionWinRate}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgb(var(--border))" />
                  <XAxis dataKey="emotion" tick={{ fontSize: 11, fill: 'rgb(var(--muted-foreground))' }} />
                  <YAxis tick={{ fontSize: 11, fill: 'rgb(var(--muted-foreground))' }} domain={[0, 100]} />
                  <Tooltip contentStyle={{ background: 'rgb(var(--card))', border: '1px solid rgb(var(--border))', borderRadius: '8px', color: 'rgb(var(--foreground))' }} />
                  <Bar dataKey="winRate" name="Win Rate %" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Discipline Trend */}
        <Card>
          <CardHeader><CardTitle>Discipline & Confidence Trend</CardTitle></CardHeader>
          <CardContent>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={disciplineTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgb(var(--border))" />
                  <XAxis dataKey="trade" tick={{ fontSize: 11, fill: 'rgb(var(--muted-foreground))' }} label={{ value: 'Trade #', position: 'insideBottom', offset: -5, fill: 'rgb(var(--muted-foreground))' }} />
                  <YAxis tick={{ fontSize: 11, fill: 'rgb(var(--muted-foreground))' }} />
                  <Tooltip contentStyle={{ background: 'rgb(var(--card))', border: '1px solid rgb(var(--border))', borderRadius: '8px', color: 'rgb(var(--foreground))' }} />
                  <Line type="monotone" dataKey="discipline" stroke="#22C55E" strokeWidth={2} name="Discipline" dot={{ fill: '#22C55E', r: 3 }} />
                  <Line type="monotone" dataKey="confidence" stroke="#3B82F6" strokeWidth={2} name="Confidence" dot={{ fill: '#3B82F6', r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Mistake Breakdown & Violation Log */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader><CardTitle>Mistake Breakdown</CardTitle></CardHeader>
          <CardContent>
            {mistakeBreakdown.length === 0 ? (
              <div className="text-center py-6"><p className="text-sm text-success">No mistakes recorded! 🎉</p></div>
            ) : (
              <div className="space-y-3">
                {mistakeBreakdown.map(m => (
                  <div key={m.type} className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                    <span className="text-sm font-medium">{m.type}</span>
                    <Badge variant="destructive">{m.count} times</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Revenge Trade Log</CardTitle></CardHeader>
          <CardContent>
            {revengeTrades.length === 0 ? (
              <div className="text-center py-6"><p className="text-sm text-success">No revenge trades! Clean trading 💯</p></div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Trade ID</TableHead>
                    <TableHead>Instrument</TableHead>
                    <TableHead>PnL</TableHead>
                    <TableHead>Mistake</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {revengeTrades.map(t => (
                    <TableRow key={t.trade_id}>
                      <TableCell className="font-mono text-xs">{t.trade_id}</TableCell>
                      <TableCell>{t.b_instrument}</TableCell>
                      <TableCell className={`font-mono ${(t.e_net_pnl || 0) >= 0 ? 'text-success' : 'text-destructive'}`}>{t.e_net_pnl || 0}</TableCell>
                      <TableCell><Badge variant="destructive">{t.g_mistake_tag}</Badge></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
