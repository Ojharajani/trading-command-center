import { Trade, Zone, CapitalLog, DashboardKPIs, ZoneGrade, HeatmapLevel, TaxClassification } from './types'

// =============================================
// ZONE SCORING ENGINE (v2)
// =============================================

// TRIDENT Score Calculation from Zone ID link presence
export function calculateTRIDENT(zone: Partial<Zone>): {
  horizontal: number
  verticalUp: number
  verticalDown: number
  combined: number
} {
  const timeframeKeys = ['yearly', 'quarterly', 'monthly', 'weekly', 'daily', 'h4', 'h1', 'm15', 'm5', 'm3', 'm1']
  const tfMap: Record<string, string> = {
    'Yearly': 'yearly', 'Quarterly': 'quarterly', 'Monthly': 'monthly',
    'Weekly': 'weekly', 'Daily': 'daily', '4H': 'h4', '1H': 'h1',
    '15M': 'm15', '5M': 'm5', '3M': 'm3', '1M': 'm1'
  }
  const totalTF = timeframeKeys.length

  // Horizontal: % of timeframes aligned (have a non-null Zone ID)
  const aligned = timeframeKeys.filter(tf => {
    const key = `${tf}_zone_id` as keyof Zone
    return zone[key] !== null && zone[key] !== undefined
  }).length
  const horizontal = Math.round((aligned / totalTF) * 100)

  // Get zone's own timeframe index
  const zoneTf = zone.timeframe ? tfMap[zone.timeframe] : undefined
  const tfIndex = zoneTf ? timeframeKeys.indexOf(zoneTf) : -1

  // Vertical Up: alignment from LTF (below this zone's timeframe)
  let verticalUp = 0
  if (tfIndex >= 0 && tfIndex < totalTF - 1) {
    const ltfFrames = timeframeKeys.slice(tfIndex + 1)
    const ltfAligned = ltfFrames.filter(tf => {
      const key = `${tf}_zone_id` as keyof Zone
      return zone[key] !== null && zone[key] !== undefined
    }).length
    verticalUp = ltfFrames.length > 0 ? Math.round((ltfAligned / ltfFrames.length) * 100) : 0
  }

  // Vertical Down: alignment from HTF (above this zone's timeframe)
  let verticalDown = 0
  if (tfIndex > 0) {
    const htfFrames = timeframeKeys.slice(0, tfIndex)
    const htfAligned = htfFrames.filter(tf => {
      const key = `${tf}_zone_id` as keyof Zone
      return zone[key] !== null && zone[key] !== undefined
    }).length
    verticalDown = htfFrames.length > 0 ? Math.round((htfAligned / htfFrames.length) * 100) : 0
  }

  const combined = Math.round((horizontal + verticalUp + verticalDown) / 3)
  return { horizontal, verticalUp, verticalDown, combined }
}

// Final Composite Score = weighted average of 5 section scores
export function calculateFinalCompositeScore(zone: Partial<Zone>): number {
  const weights: Record<string, number> = {
    zone_structure_score: 0.25,
    liquidity_score: 0.20,
    indicator_confluence_score: 0.20,
    trident_combined_score: 0.25,
    achievement_score: 0.10,
  }
  return Math.round(Object.entries(weights).reduce((total, [key, weight]) => {
    return total + ((zone[key as keyof Zone] as number) || 0) * weight
  }, 0))
}

// Zone Grade auto-derived from final_composite_score
export function deriveZoneGrade(finalCompositeScore: number): ZoneGrade {
  if (finalCompositeScore >= 90) return 'A'  // Institutional
  if (finalCompositeScore >= 75) return 'B'  // High Probability
  return 'C'                                  // Standard
}

// Heatmap Level auto-derived from distance percentage
export function deriveHeatmapLevel(distanceFromPricePct: number): HeatmapLevel {
  if (distanceFromPricePct <= 1) return 'HOT'
  if (distanceFromPricePct <= 3) return 'WARM'
  return 'COLD'
}

// Zone Mid auto-calculated
export function calculateZoneMid(high: number, low: number): number {
  return (high + low) / 2
}

// Zone Width Pct auto-calculated
export function calculateZoneWidthPct(high: number, low: number): number {
  if (low === 0) return 0
  return ((high - low) / low) * 100
}

// MTF Stack Count from non-null zone IDs
export function calculateMtfStackCount(zone: Partial<Zone>): number {
  const mtfFields: (keyof Zone)[] = [
    'yearly_zone_id', 'quarterly_zone_id', 'monthly_zone_id',
    'weekly_zone_id', 'daily_zone_id', 'h4_zone_id', 'h1_zone_id',
    'm15_zone_id', 'm5_zone_id', 'm3_zone_id', 'm1_zone_id'
  ]
  return mtfFields.filter(f => zone[f] !== null && zone[f] !== undefined && zone[f] !== '').length
}

// Score color for UI display
export function getScoreColor(score: number): string {
  if (score >= 90) return '#22C55E'
  if (score >= 70) return '#EAB308'
  if (score >= 50) return '#F97316'
  return '#EF4444'
}

export function getScoreLabel(score: number): string {
  if (score >= 90) return 'Institutional (A)'
  if (score >= 75) return 'High Probability (B)'
  if (score >= 50) return 'Standard (C)'
  return 'Weak (C)'
}

// =============================================
// TRADE KPI CALCULATIONS (v2)
// =============================================

export function calculateWinRate(trades: Trade[]): number {
  const closedTrades = trades.filter(t => t.e_result)
  if (closedTrades.length === 0) return 0
  const wins = closedTrades.filter(t => t.e_result === 'Win').length
  return (wins / closedTrades.length) * 100
}

export function calculateProfitFactor(trades: Trade[]): number {
  const grossProfit = trades.filter(t => (t.e_net_pnl || 0) > 0).reduce((sum, t) => sum + (t.e_net_pnl || 0), 0)
  const grossLoss = Math.abs(trades.filter(t => (t.e_net_pnl || 0) < 0).reduce((sum, t) => sum + (t.e_net_pnl || 0), 0))
  if (grossLoss === 0) return grossProfit > 0 ? Infinity : 0
  return grossProfit / grossLoss
}

export function calculateExpectancy(trades: Trade[]): number {
  const closedTrades = trades.filter(t => t.e_result)
  if (closedTrades.length === 0) return 0
  const winRate = calculateWinRate(closedTrades) / 100
  const wins = closedTrades.filter(t => t.e_result === 'Win')
  const losses = closedTrades.filter(t => t.e_result === 'Loss')
  const avgWin = wins.length > 0 ? wins.reduce((s, t) => s + (t.e_net_pnl || 0), 0) / wins.length : 0
  const avgLoss = losses.length > 0 ? Math.abs(losses.reduce((s, t) => s + (t.e_net_pnl || 0), 0) / losses.length) : 0
  return (winRate * avgWin) - ((1 - winRate) * avgLoss)
}

export function calculateAvgRMultiple(trades: Trade[]): number {
  const closedTrades = trades.filter(t => t.e_r_multiple !== undefined && t.e_r_multiple !== null)
  if (closedTrades.length === 0) return 0
  return closedTrades.reduce((sum, t) => sum + (t.e_r_multiple || 0), 0) / closedTrades.length
}

export function calculateMaxDrawdown(trades: Trade[]): number {
  if (trades.length === 0) return 0
  let peak = 0
  let maxDD = 0
  let cumPnL = 0
  const sorted = [...trades].sort((a, b) => new Date(a.entry_datetime).getTime() - new Date(b.entry_datetime).getTime())
  for (const trade of sorted) {
    cumPnL += (trade.e_net_pnl || 0)
    if (cumPnL > peak) peak = cumPnL
    const dd = peak - cumPnL
    if (dd > maxDD) maxDD = dd
  }
  return maxDD
}

export function calculateConsecutive(trades: Trade[]): { wins: number; losses: number } {
  if (trades.length === 0) return { wins: 0, losses: 0 }
  const sorted = [...trades].sort((a, b) => new Date(a.entry_datetime).getTime() - new Date(b.entry_datetime).getTime())
  let maxWins = 0, maxLosses = 0, curWins = 0, curLosses = 0
  for (const t of sorted) {
    if (t.e_result === 'Win') { curWins++; curLosses = 0 }
    else if (t.e_result === 'Loss') { curLosses++; curWins = 0 }
    else { curWins = 0; curLosses = 0 }
    maxWins = Math.max(maxWins, curWins)
    maxLosses = Math.max(maxLosses, curLosses)
  }
  return { wins: maxWins, losses: maxLosses }
}

// Plan Adherence Score — auto-calc from Sections D and J
export function calculatePlanAdherenceScore(trade: Partial<Trade>): number {
  if (!trade.j_planned_entry || !trade.j_planned_sl) return 100
  let score = 100

  // Entry deviation penalty: -5 points per 0.1% deviation
  const entryDevPct = Math.abs((trade.d_entry_price || 0) - trade.j_planned_entry) / trade.j_planned_entry * 100
  score -= Math.min(30, entryDevPct * 50)

  // SL deviation penalty
  const slDevPct = Math.abs((trade.d_stop_loss || 0) - trade.j_planned_sl) / trade.j_planned_sl * 100
  score -= Math.min(20, slDevPct * 40)

  // Revenge trade penalty
  if (trade.f_revenge_trade) score -= 20

  // Followed plan bonus
  if (trade.f_followed_plan) score += 5

  return Math.max(0, Math.min(100, Math.round(score)))
}

// Discipline Score — auto-calc from Section F
export function calculateDisciplineScore(trade: Partial<Trade>): number {
  let score = trade.f_followed_plan ? 80 : 40
  if (trade.f_revenge_trade) score -= 15
  if (trade.f_early_exit) score -= 10
  return Math.max(0, Math.min(100, score))
}

// Tax Classification Auto-Logic
export function autoClassifyTax(trade: Partial<Trade>): TaxClassification {
  const segment = trade.h1_segment
  const holdingDays = trade.meta_holding_period_days || 0
  if (segment === 'NSE F&O' || segment === 'MCX' || segment === 'Forex' || segment === 'CFD')
    return 'F&O'
  if (segment === 'NSE EQ' || segment === 'Prop') {
    if (trade.trade_horizon === 'Intraday') return 'Intraday'
    if (holdingDays < 365) return 'STCG'
    return 'LTCG'
  }
  return 'F&O'
}

// Capture Efficiency
export function calculateCaptureEfficiency(rMultiple: number, availableMoveR: number): number {
  if (availableMoveR === 0) return 0
  return Math.round((rMultiple / availableMoveR) * 100)
}

// Breakeven Price
export function calculateBreakevenPrice(entryPrice: number, totalCost: number, positionSize: number, direction: string): number {
  if (positionSize === 0) return entryPrice
  const costPerUnit = totalCost / positionSize
  return direction === 'Long' ? entryPrice + costPerUnit : entryPrice - costPerUnit
}

// Holding Period Days
export function calculateHoldingPeriodDays(entryDatetime: string, exitDatetime?: string): number {
  if (!exitDatetime) return 0
  const entry = new Date(entryDatetime)
  const exit = new Date(exitDatetime)
  return Math.ceil((exit.getTime() - entry.getTime()) / (1000 * 60 * 60 * 24))
}

// RR Ratio
export function calculateRRRatio(entry: number, sl: number, target: number): number {
  const risk = Math.abs(entry - sl)
  const reward = Math.abs(target - entry)
  if (risk === 0) return 0
  return reward / risk
}

// PnL calculation
export function calculatePnL(entry: number, exit: number, qty: number, direction: 'Long' | 'Short'): number {
  if (direction === 'Long') return (exit - entry) * qty
  return (entry - exit) * qty
}

// Position Size Calculator
export function calculatePositionSize(capital: number, riskPercent: number, slPoints: number): number {
  if (slPoints === 0) return 0
  return Math.floor((capital * (riskPercent / 100)) / slPoints)
}

// =============================================
// ANALYTICS CALCULATIONS
// =============================================

export function getMonthlyPnL(trades: Trade[]): { month: string; pnl: number }[] {
  const map = new Map<string, number>()
  for (const t of trades) {
    if (!t.entry_datetime || !t.e_net_pnl) continue
    const d = new Date(t.entry_datetime)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    map.set(key, (map.get(key) || 0) + (t.e_net_pnl || 0))
  }
  return Array.from(map.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([month, pnl]) => ({ month, pnl }))
}

export function getEquityCurve(trades: Trade[]): { date: string; equity: number }[] {
  const sorted = [...trades]
    .filter(t => t.e_result)
    .sort((a, b) => new Date(a.entry_datetime).getTime() - new Date(b.entry_datetime).getTime())
  let cumPnL = 0
  return sorted.map(t => {
    cumPnL += (t.e_net_pnl || 0)
    return { date: t.entry_datetime.split('T')[0], equity: cumPnL }
  })
}

export function getStrategyPerformance(trades: Trade[]): { strategy: string; winRate: number; pnl: number; count: number }[] {
  const map = new Map<string, Trade[]>()
  for (const t of trades) {
    const key = t.b_zone_type || 'Unknown'
    if (!map.has(key)) map.set(key, [])
    map.get(key)!.push(t)
  }
  return Array.from(map.entries()).map(([strategy, stratTrades]) => ({
    strategy,
    winRate: calculateWinRate(stratTrades),
    pnl: stratTrades.reduce((s, t) => s + (t.e_net_pnl || 0), 0),
    count: stratTrades.length,
  }))
}

// =============================================
// CAPITAL CALCULATIONS
// =============================================

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

// =============================================
// TAX CALCULATIONS
// =============================================

export function calculateTaxRate(tradeType: string): number {
  switch (tradeType) {
    case 'Intraday': return 30
    case 'STCG': return 15
    case 'LTCG': return 10
    case 'F&O': return 30
    default: return 30
  }
}

export function calculateTaxAmount(profitLoss: number, taxRate: number): number {
  if (profitLoss <= 0) return 0
  return profitLoss * (taxRate / 100)
}

// =============================================
// DASHBOARD KPIs (v2 — expanded)
// =============================================

export function calculateDashboardKPIs(trades: Trade[], capitalLogs: CapitalLog[]): DashboardKPIs {
  const today = new Date().toISOString().split('T')[0]
  const thisMonth = today.substring(0, 7)

  const closedTrades = trades.filter(t => t.e_result)
  const todayTrades = closedTrades.filter(t => t.entry_datetime.startsWith(today))
  const monthTrades = closedTrades.filter(t => t.entry_datetime.startsWith(thisMonth))
  const latestCapital = capitalLogs.length > 0
    ? [...capitalLogs].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0].capital_amount
    : 500000

  const consecutive = calculateConsecutive(closedTrades)
  const maxDD = calculateMaxDrawdown(closedTrades)
  const maxDDPercent = latestCapital > 0 ? (maxDD / latestCapital) * 100 : 0

  // New v2 KPIs
  const tradesWithCapture = closedTrades.filter(t => t.i_capture_efficiency_pct !== undefined)
  const captureEfficiency = tradesWithCapture.length > 0
    ? tradesWithCapture.reduce((s, t) => s + (t.i_capture_efficiency_pct || 0), 0) / tradesWithCapture.length
    : 0

  const tradesWithPlan = closedTrades.filter(t => t.j_plan_adherence_score_pct !== undefined)
  const planAdherence = tradesWithPlan.length > 0
    ? tradesWithPlan.reduce((s, t) => s + (t.j_plan_adherence_score_pct || 0), 0) / tradesWithPlan.length
    : 0

  const tradesWithEstimation = closedTrades.filter(t => t.i_estimation_accuracy_pct !== undefined)
  const zoneEstimationAccuracy = tradesWithEstimation.length > 0
    ? tradesWithEstimation.reduce((s, t) => s + (t.i_estimation_accuracy_pct || 0), 0) / tradesWithEstimation.length
    : 0

  const tradesWithMfe = closedTrades.filter(t => t.e_mfe !== undefined && t.e_mae !== undefined)
  const avgMfe = tradesWithMfe.length > 0 ? tradesWithMfe.reduce((s, t) => s + (t.e_mfe || 0), 0) / tradesWithMfe.length : 0
  const avgMae = tradesWithMfe.length > 0 ? Math.abs(tradesWithMfe.reduce((s, t) => s + (t.e_mae || 0), 0) / tradesWithMfe.length) : 1
  const mfeMaeRatio = avgMae > 0 ? avgMfe / avgMae : 0

  const tradesWithLeft = closedTrades.filter(t => t.i_left_on_table_r !== undefined)
  const leftOnTable = tradesWithLeft.length > 0
    ? tradesWithLeft.reduce((s, t) => s + (t.i_left_on_table_r || 0), 0) / tradesWithLeft.length
    : 0

  const portfolioHeat = trades.filter(t => !t.e_result).reduce((s, t) => s + (t.g3_total_portfolio_risk_pct || 0), 0)

  return {
    totalCapital: latestCapital,
    todayPnl: todayTrades.reduce((s, t) => s + (t.e_net_pnl || 0), 0),
    monthlyPnl: monthTrades.reduce((s, t) => s + (t.e_net_pnl || 0), 0),
    winRate: calculateWinRate(closedTrades),
    profitFactor: calculateProfitFactor(closedTrades),
    expectancy: calculateExpectancy(closedTrades),
    avgRMultiple: calculateAvgRMultiple(closedTrades),
    maxDrawdown: maxDDPercent,
    consecutiveWins: consecutive.wins,
    consecutiveLosses: consecutive.losses,
    captureEfficiency,
    planAdherence,
    zoneEstimationAccuracy,
    mfeMaeRatio,
    leftOnTable,
    portfolioHeat,
  }
}
