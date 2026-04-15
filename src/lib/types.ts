// ==================== ZONE BANK ====================
export type ZoneType = 'Demand' | 'Supply'
export type ZoneSubtype = 'DBD' | 'RBD' | 'DBR' | 'RBR' | 'Liquidity Sweep' | 'Imbalance' | 'Compression' | 'Flip' | 'Trend Continuation' | 'HTF' | 'Gap' | 'Volume' | 'News' | 'Algo'
export type Timeframe = 'Monthly' | 'Weekly' | 'Daily' | '4H' | '1H' | '15M'
export type ZoneStatus = 'Fresh' | 'Tested' | 'Broken' | 'Void'
export type TrapRisk = 'Low' | 'Medium' | 'High'

export interface Zone {
  id: string
  user_id?: string
  symbol: string
  zone_type: ZoneType
  zone_subtype: ZoneSubtype
  timeframe: Timeframe
  zone_high: number
  zone_low: number
  status: ZoneStatus
  quality_score: number
  trap_risk: TrapRisk
  test_count: number
  notes: string
  created_at: string
  // Score breakdown (for UI display, not stored)
  strong_departure?: boolean
  low_base_candles?: boolean
  freshness?: boolean
  liquidity_sweep?: boolean
  htf_alignment?: boolean
}

// ==================== TRADING JOURNAL ====================
export type TradeDirection = 'Long' | 'Short'
export type TradeResult = 'Win' | 'Loss' | 'Breakeven'
export type EmotionType = 'Fear' | 'Greed' | 'Neutral' | 'Confident' | 'Anxious'
export type MistakeType = 'FOMO Entry' | 'Early Exit' | 'Oversized' | 'Moved SL' | 'Skipped Trade' | 'Chased Price' | 'Revenge Trade' | 'No Mistake' | 'Other'

export interface Trade {
  id: string
  user_id?: string
  date_time: string
  symbol: string
  direction: TradeDirection
  setup: string
  zone_id: string | null
  entry_price: number
  stop_loss: number
  target_price: number
  exit_price: number
  position_size: number
  risk_percent: number
  rr_ratio: number
  pnl: number
  result: TradeResult
  timeframe: Timeframe
  emotion_before: EmotionType
  emotion_after: EmotionType
  confidence: number
  discipline_score: number
  mistake_type: MistakeType
  notes: string
  created_at: string
}

// ==================== RISK MANAGEMENT ====================
export interface RiskSettings {
  id: string
  user_id?: string
  max_risk_per_trade: number
  max_daily_loss: number
  max_weekly_loss: number
  max_drawdown: number
  max_positions: number
}

export interface RiskViolation {
  id: string
  date: string
  type: 'Max Risk' | 'Daily Loss' | 'Weekly Loss' | 'Drawdown' | 'Max Positions'
  details: string
  severity: 'Warning' | 'Critical'
}

// ==================== MONEY MANAGEMENT ====================
export interface CapitalLog {
  id: string
  user_id?: string
  date: string
  capital_amount: number
  deposits: number
  withdrawals: number
  notes: string
}

// ==================== PSYCHOLOGY ====================
export interface PsychologyLog {
  id: string
  user_id?: string
  trade_id: string
  emotion_before: EmotionType
  emotion_after: EmotionType
  discipline_score: number
  revenge_trade: boolean
  rule_violation: boolean
  mistake_type: MistakeType
  notes: string
}

// ==================== INVESTMENT TRACKER ====================
export interface PortfolioItem {
  id: string
  user_id?: string
  symbol: string
  quantity: number
  avg_buy_price: number
  current_price: number
  sector: string
  investment_thesis: string
  buy_date: string
  target_price: number
  stop_loss: number
}

// ==================== TAX TRACKER ====================
export type TradeType = 'Intraday' | 'STCG' | 'LTCG' | 'F&O'

export interface TaxRecord {
  id: string
  user_id?: string
  trade_id: string
  profit_loss: number
  trade_type: TradeType
  tax_rate: number
  tax_amount: number
  financial_year: string
  notes: string
}

// ==================== PROGRESS ROADMAP ====================
export type MilestoneStatus = 'Pending' | 'In Progress' | 'Completed'
export type MetricType = 'Win Rate' | 'Capital' | 'Drawdown' | 'Profit Factor' | 'Custom'

export interface Milestone {
  id: string
  user_id?: string
  title: string
  description: string
  target_date: string
  target_value: number
  current_value: number
  metric_type: MetricType
  status: MilestoneStatus
}

// ==================== GROWTH ROADMAP ====================
export type PhaseStatus = 'Not Started' | 'Active' | 'Completed'

export interface GrowthPhase {
  id: string
  user_id?: string
  phase_name: string
  starting_capital: number
  target_capital: number
  current_capital: number
  start_date: string
  target_date: string
  status: PhaseStatus
  skills_checklist: SkillItem[]
}

export interface SkillItem {
  name: string
  completed: boolean
}

// ==================== DASHBOARD KPIs ====================
export interface DashboardKPIs {
  totalCapital: number
  todayPnl: number
  monthlyPnl: number
  winRate: number
  profitFactor: number
  expectancy: number
  avgRR: number
  maxDrawdown: number
  consecutiveWins: number
  consecutiveLosses: number
}

// ==================== NAV ITEMS ====================
export interface NavItem {
  title: string
  href: string
  icon: string
}
