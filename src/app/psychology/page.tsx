'use client'

import React, { useMemo } from 'react'
import { useStore } from '@/lib/store'
import { Card, CardHeader, CardTitle, CardContent, StatCard, Badge, Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui'
import { calculateWinRate } from '@/lib/calculations'
import { Brain, AlertTriangle, TrendingDown, CheckCircle2, XCircle } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts'

export default function PsychologyPage() {
  const { trades, psychologyLog } = useStore()

  // Emotion vs Win Rate
  const emotionWinRate = useMemo(() => {
    const emotionMap = new Map<string, { wins: number; total: number }>()
    trades.forEach(t => {
      const emotion = t.emotion_before
      if (!emotionMap.has(emotion)) emotionMap.set(emotion, { wins: 0, total: 0 })
      const e = emotionMap.get(emotion)!
      e.total++
      if (t.result === 'Win') e.wins++
    })
    return Array.from(emotionMap.entries()).map(([emotion, data]) => ({
      emotion,
      winRate: data.total > 0 ? (data.wins / data.total) * 100 : 0,
      trades: data.total,
    }))
  }, [trades])

  // Revenge trade frequency
  const revengeTrades = psychologyLog.filter(p => p.revenge_trade)
  const ruleViolations = psychologyLog.filter(p => p.rule_violation)

  // Discipline trend
  const disciplineTrend = useMemo(() => {
    return [...trades]
      .sort((a, b) => new Date(a.date_time).getTime() - new Date(b.date_time).getTime())
      .map((t, i) => ({
        trade: i + 1,
        discipline: t.discipline_score,
        confidence: t.confidence,
      }))
  }, [trades])

  // Mistake breakdown
  const mistakeBreakdown = useMemo(() => {
    const map = new Map<string, number>()
    trades.forEach(t => {
      if (t.mistake_type && t.mistake_type !== 'No Mistake') {
        map.set(t.mistake_type, (map.get(t.mistake_type) || 0) + 1)
      }
    })
    return Array.from(map.entries()).map(([type, count]) => ({ type, count })).sort((a, b) => b.count - a.count)
  }, [trades])

  const avgDiscipline = trades.length > 0 ? trades.reduce((s, t) => s + t.discipline_score, 0) / trades.length : 0
  const avgConfidence = trades.length > 0 ? trades.reduce((s, t) => s + t.confidence, 0) / trades.length : 0

  // Insights
  const insights: string[] = []
  const confidentTrades = trades.filter(t => t.emotion_before === 'Confident')
  const greedTrades = trades.filter(t => t.emotion_before === 'Greed')
  const confidentWR = calculateWinRate(confidentTrades)
  const greedWR = calculateWinRate(greedTrades)
  if (confidentTrades.length > 3 && confidentWR > 60) insights.push(`🎯 You perform best when confident — ${confidentWR.toFixed(0)}% win rate`)
  if (greedTrades.length > 2 && greedWR < 40) insights.push(`⚠️ Greedy trades hurt you — only ${greedWR.toFixed(0)}% win rate`)
  if (revengeTrades.length > 0) insights.push(`🔥 You've taken ${revengeTrades.length} revenge trade(s) — these rarely work`)
  if (avgDiscipline < 6) insights.push(`📉 Average discipline is low (${avgDiscipline.toFixed(1)}/10) — focus on following your rules`)
  if (avgDiscipline >= 8) insights.push(`✅ Excellent discipline (${avgDiscipline.toFixed(1)}/10) — keep it up!`)

  // Check for consecutive win pattern
  let consWinLoss = 0
  const sortedTrades = [...trades].sort((a, b) => new Date(a.date_time).getTime() - new Date(b.date_time).getTime())
  for (let i = 3; i < sortedTrades.length; i++) {
    if (sortedTrades[i - 1].result === 'Win' && sortedTrades[i - 2].result === 'Win' && sortedTrades[i - 3].result === 'Win' && sortedTrades[i].result === 'Loss') {
      consWinLoss++
    }
  }
  if (consWinLoss > 0) insights.push(`💡 You tend to lose after 3 consecutive wins — watch for overconfidence`)

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard title="Avg Discipline" value={`${avgDiscipline.toFixed(1)}/10`} icon={<Brain className="w-5 h-5 text-primary" />} />
        <StatCard title="Avg Confidence" value={`${avgConfidence.toFixed(1)}/10`} icon={<CheckCircle2 className="w-5 h-5 text-success" />} />
        <StatCard title="Revenge Trades" value={revengeTrades.length} icon={<AlertTriangle className="w-5 h-5 text-destructive" />} />
        <StatCard title="Rule Violations" value={ruleViolations.length} icon={<XCircle className="w-5 h-5 text-destructive" />} />
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
                  <YAxis domain={[0, 10]} tick={{ fontSize: 11, fill: 'rgb(var(--muted-foreground))' }} />
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
          <CardHeader><CardTitle>Rule Violation Log</CardTitle></CardHeader>
          <CardContent>
            {ruleViolations.length === 0 ? (
              <div className="text-center py-6"><p className="text-sm text-success">No violations! Clean trading 💯</p></div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Trade</TableHead>
                    <TableHead>Mistake</TableHead>
                    <TableHead>Revenge?</TableHead>
                    <TableHead>Notes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ruleViolations.map(v => (
                    <TableRow key={v.id}>
                      <TableCell className="font-mono text-xs">{v.trade_id}</TableCell>
                      <TableCell><Badge variant="destructive">{v.mistake_type}</Badge></TableCell>
                      <TableCell>{v.revenge_trade ? <Badge variant="destructive">Yes</Badge> : <span className="text-muted-foreground">No</span>}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{v.notes}</TableCell>
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
