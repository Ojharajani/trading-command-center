import { Trade, Zone, CapitalLog, DashboardKPIs } from './types'

// ==================== ZONE SCORE CALCULATION ====================
export function calculateZoneScore(zone: Partial<Zone>): number {
  let score = 0
  if (zone.strong_departure) score += 30
  if (zone.low_base_candles) score += 20
  if (zone.status === 'Fresh') score += 20
  else if (zone.status === 'Tested') score += 10
  if (zone.liquidity_sweep) score += 15
  if (zone.htf_alignment) score += 15
  score -= (zone.test_count || 0) * 5
  return Math.max(0, Math.min(100, score))
}

export function getScoreColor(score: number): string {
  if (score >= 90) return '#22C55E' // Green - High Probability
  if (score >= 70) return '#EAB308' // Yellow - Tradable
  if (score >= 50) return '#F97316' // Orange - Medium
  return '#EF4444' // Red - Weak
}

export function getScoreLabel(score: number): string {
  if (score >= 90) return 'High Probability'
  if (score >= 70) return 'Tradable'
  if (score >= 50) return 'Medium'
  return 'Weak'
}

// ==================== TRADE KPI CALCULATIONS ====================
export function calculateWinRate(trades: Trade[]): number {
  if (trades.length === 0) return 0
  const wins = trades.filter(t => t.result === 'Win').length
  return (wins / trades.length) * 100
}

export function calculateProfitFactor(trades: Trade[]): number {
  const grossProfit = trades.filter(t => t.pnl > 0).reduce((sum, t) => sum + t.pnl, 0)
  const grossLoss = Math.abs(trades.filter(t => t.pnl < 0).reduce((sum, t) => sum + t.pnl, 0))
  if (grossLoss === 0) return grossProfit > 0 ? Infinity : 0
  return grossProfit / grossLoss
}

export function calculateExpectancy(trades: Trade[]): number {
  if (trades.length === 0) return 0
  const winRate = calculateWinRate(trades) / 100
  const wins = trades.filter(t => t.result === 'Win')
  const losses = trades.filter(t => t.result === 'Loss')
  const avgWin = wins.length > 0 ? wins.reduce((s, t) => s + t.pnl, 0) / wins.length : 0
  const avgLoss = losses.length > 0 ? Math.abs(losses.reduce((s, t) => s + t.pnl, 0) / losses.length) : 0
  return (winRate * avgWin) - ((1 - winRate) * avgLoss)
}

export function calculateAvgRR(trades: Trade[]): number {
  if (trades.length === 0) return 0
  const totalRR = trades.reduce((sum, t) => sum + t.rr_ratio, 0)
  return totalRR / trades.length
}

export function calculateMaxDrawdown(trades: Trade[]): number {
  if (trades.length === 0) return 0
  let peak = 0
  let maxDD = 0
  let cumPnL = 0
  const sorted = [...trades].sort((a, b) => new Date(a.date_time).getTime() - new Date(b.date_time).getTime())
  for (const trade of sorted) {
    cumPnL += trade.pnl
    if (cumPnL > peak) peak = cumPnL
    const dd = peak - cumPnL
    if (dd > maxDD) maxDD = dd
  }
  return maxDD
}

export function calculateConsecutive(trades: Trade[]): { wins: number; losses: number } {
  if (trades.length === 0) return { wins: 0, losses: 0 }
  const sorted = [...trades].sort((a, b) => new Date(a.date_time).getTime() - new Date(b.date_time).getTime())
  let maxWins = 0, maxLosses = 0, curWins = 0, curLosses = 0
  for (const t of sorted) {
    if (t.result === 'Win') { curWins++; curLosses = 0 }
    else if (t.result === 'Loss') { curLosses++; curWins = 0 }
    else { curWins = 0; curLosses = 0 }
    maxWins = Math.max(maxWins, curWins)
    maxLosses = Math.max(maxLosses, curLosses)
  }
  return { wins: maxWins, losses: maxLosses }
}

export function calculateRRRatio(entry: number, sl: number, target: number): number {
  const risk = Math.abs(entry - sl)
  const reward = Math.abs(target - entry)
  if (risk === 0) return 0
  return reward / risk
}

export function calculatePnL(entry: number, exit: number, qty: number, direction: 'Long' | 'Short'): number {
  if (direction === 'Long') return (exit - entry) * qty
  return (entry - exit) * qty
}

// ==================== POSITION SIZE CALCULATOR ====================
export function calculatePositionSize(capital: number, riskPercent: number, slPoints: number): number {
  if (slPoints === 0) return 0
  return Math.floor((capital * (riskPercent / 100)) / slPoints)
}

// ==================== CAPITAL CALCULATIONS ====================
export function calculateCAGR(startValue: number, endValue: number, years: number): number {
  if (startValue <= 0 || years <= 0) return 0
  return (Math.pow(endValue / startValue, 1 / years) - 1) * 100
}

export function calculateCapitalGrowth(logs: CapitalLog[]): number {
  if (logs.length < 2) return 0
  const sorted = [...logs].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  const first = sorted[0].capital_amount
  const last = sorted[sorted.length - 1].capital_amount
  if (first === 0) return 0
  return ((last - first) / first) * 100
}

// ==================== MONTHLY PNL BREAKDOWN ====================
export function getMonthlyPnL(trades: Trade[]): { month: string; pnl: number }[] {
  const map = new Map<string, number>()
  for (const t of trades) {
    const d = new Date(t.date_time)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    map.set(key, (map.get(key) || 0) + t.pnl)
  }
  return Array.from(map.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([month, pnl]) => ({ month, pnl }))
}

// ==================== STRATEGY ANALYSIS ====================
export function getStrategyPerformance(trades: Trade[]): { strategy: string; winRate: number; pnl: number; count: number }[] {
  const map = new Map<string, Trade[]>()
  for (const t of trades) {
    const key = t.setup || 'Unknown'
    if (!map.has(key)) map.set(key, [])
    map.get(key)!.push(t)
  }
  return Array.from(map.entries()).map(([strategy, stratTrades]) => ({
    strategy,
    winRate: calculateWinRate(stratTrades),
    pnl: stratTrades.reduce((s, t) => s + t.pnl, 0),
    count: stratTrades.length,
  }))
}

// ==================== EQUITY CURVE ====================
export function getEquityCurve(trades: Trade[]): { date: string; equity: number }[] {
  const sorted = [...trades].sort((a, b) => new Date(a.date_time).getTime() - new Date(b.date_time).getTime())
  let cumPnL = 0
  return sorted.map(t => {
    cumPnL += t.pnl
    return { date: t.date_time.split('T')[0], equity: cumPnL }
  })
}

// ==================== TAX CALCULATIONS ====================
export function calculateTaxRate(tradeType: string): number {
  switch (tradeType) {
    case 'Intraday': return 30 // Speculative income - taxed at slab rate (using 30% max)
    case 'STCG': return 15
    case 'LTCG': return 10
    case 'F&O': return 30 // Non-speculative business income
    default: return 30
  }
}

export function calculateTaxAmount(profitLoss: number, taxRate: number): number {
  if (profitLoss <= 0) return 0
  return profitLoss * (taxRate / 100)
}

// ==================== DASHBOARD KPIs ====================
export function calculateDashboardKPIs(trades: Trade[], capitalLogs: CapitalLog[]): DashboardKPIs {
  const today = new Date().toISOString().split('T')[0]
  const thisMonth = today.substring(0, 7)
  
  const todayTrades = trades.filter(t => t.date_time.startsWith(today))
  const monthTrades = trades.filter(t => t.date_time.startsWith(thisMonth))
  const latestCapital = capitalLogs.length > 0
    ? [...capitalLogs].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0].capital_amount
    : 500000
  
  const consecutive = calculateConsecutive(trades)
  const maxDD = calculateMaxDrawdown(trades)
  const maxDDPercent = latestCapital > 0 ? (maxDD / latestCapital) * 100 : 0

  return {
    totalCapital: latestCapital,
    todayPnl: todayTrades.reduce((s, t) => s + t.pnl, 0),
    monthlyPnl: monthTrades.reduce((s, t) => s + t.pnl, 0),
    winRate: calculateWinRate(trades),
    profitFactor: calculateProfitFactor(trades),
    expectancy: calculateExpectancy(trades),
    avgRR: calculateAvgRR(trades),
    maxDrawdown: maxDDPercent,
    consecutiveWins: consecutive.wins,
    consecutiveLosses: consecutive.losses,
  }
}
