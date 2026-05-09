// =============================================
// Trading Command Center — v2 Full Type Definitions
// Architecture Review v2.0 | April 2026
// =============================================

// ── ZONE BANK TYPES ──────────────────────────────────────────
export type ZoneType = 'Demand' | 'Supply'
export type ZoneSubtype = 'DBD'|'RBD'|'DBR'|'RBR'|'Compression'|'Flip'|'Trend Continuation'|'HTF'|'Gap'|'Volume'|'News'|'Algo'|'Liquidity Sweep'|'Imbalance'
export type Timeframe = 'Yearly'|'Quarterly'|'Monthly'|'Weekly'|'Daily'|'4H'|'1H'|'15M'|'5M'|'3M'|'1M'
export type ZoneStatus = 'Active'|'Broken'|'Expired'|'Pending'|'Void'
export type LifecycleStage = 'Creation'|'Discovery'|'Validation'|'Weakening'|'Failure'
export type ZoneFreshness = 'Fresh'|'Tested'|'Stale'
export type ZoneGrade = 'A'|'B'|'C'
export type HeatmapLevel = 'HOT'|'WARM'|'COLD'
export type CurvePosition = 'Buy Zone'|'Sell Zone'|'Avoid Zone'
export type VolatilityState = 'Low'|'Normal'|'High'|'Extreme'
export type EstimationBias = 'Over'|'Under'|'Accurate'
export type PremiumDiscount = 'Premium'|'Discount'|'Equilibrium'

// ── TRADE TYPES ──────────────────────────────────────────────
export type TradeDirection = 'Long' | 'Short'
export type TradeResult = 'Win' | 'Loss' | 'Breakeven'
export type TradeHorizon = 'Intraday' | 'Swing' | 'Positional' | 'BTST'
export type TaxClassification = 'Intraday' | 'STCG' | 'LTCG' | 'F&O'
export type EmotionType = 'Fear'|'Greed'|'Neutral'|'Confident'|'Anxious'|'FOMO'|'Hopeful'|'Impatient'|'Calm'
export type MistakeType = 'FOMO Entry'|'Early Exit'|'Oversized'|'Moved SL'|'Skipped Trade'|'Chased Price'|'Revenge Trade'|'No Mistake'|'Other'
export type MarketSession = 'India'|'London'|'NY'|'Asia'
export type ExitType = 'SL Hit'|'Target Hit'|'Manual'|'Trailing SL'|'Partial'|'Time-Based'|'Error'
export type MarketRegime = 'Trending'|'Ranging'|'Volatile'|'News-driven'
export type AccountType = 'Self'|'Family'|'HUF'|'Algo'|'Prop'|'Live'|'Demo'
export type Segment = 'Cash'|'Futures'|'Options'|'CFD'|'NSE EQ'|'NSE F&O'|'MCX'|'Forex'|'Prop'

// ── ACCOUNT INTERFACE ────────────────────────────────────────
export interface Account {
  account_id: string            // ACC-01 through ACC-07
  user_id?: string
  account_name: string
  broker: string
  segment: Segment
  account_type: AccountType
  currency: string
  initial_capital: number
  current_balance: number
  available_margin: number
  open_risk_amount: number
  max_risk_per_trade: number    // % per trade
  max_daily_loss: number        // %
  max_weekly_loss: number       // %
  max_drawdown: number          // %
  max_positions: number
  eval_phase?: string           // Prop firm only
  daily_loss_limit?: number     // Prop firm only
  max_loss_limit?: number       // Prop firm only
  profit_target?: number        // Prop firm only
  is_active: boolean
  notes?: string
  created_at: string
}

// ── ZONE (ZONE BANK) INTERFACE — Full 132 columns ───────────
export interface Zone {
  // Component 1: Master
  zone_id: string               // ZB000000001
  user_id?: string
  instrument: string
  asset_class: string
  zone_type: ZoneType
  zone_subtype: ZoneSubtype
  trade_bias: 'Bullish' | 'Bearish'
  exchange: string
  sector?: string
  country: string
  base_currency: string
  tv_symbol?: string
  timeframe: Timeframe

  // Component 2: MTF Confluence — ZONE IDs, NOT booleans
  yearly_zone_id: string | null
  quarterly_zone_id: string | null
  monthly_zone_id: string | null
  weekly_zone_id: string | null
  daily_zone_id: string | null
  h4_zone_id: string | null
  h1_zone_id: string | null
  m15_zone_id: string | null
  m5_zone_id: string | null
  m3_zone_id: string | null
  m1_zone_id: string | null
  mtf_stack_count: number

  // Component 3: Structure
  zone_high: number
  zone_low: number
  zone_mid: number
  zone_width_pct: number
  base_candles: number
  departure_candles: number
  impulse_pct: number
  legin_tr?: number
  base_avg_tr?: number
  legout_tr?: number
  legout_base_tr_ratio?: number
  legin_volume?: number
  base_avg_volume?: number
  legout_volume?: number
  volume_ratio?: number
  base_candle_pattern?: string
  confirmation_candle_pattern?: string
  chart_pattern?: string

  // Component 4: Liquidity
  equal_highs_present: boolean
  equal_lows_present: boolean
  stop_cluster_above: boolean
  stop_cluster_below: boolean
  bos_confirmed: boolean
  trendline_liquidity: boolean
  liquidity_type?: string

  // Component 5: Momentum
  volume_spike: boolean
  atr_value?: number
  atr_expansion: boolean
  volatility_state: VolatilityState
  range_compression: boolean

  // Component 6: Scoring (all 0-100)
  zone_structure_score: number
  liquidity_score: number
  indicator_confluence_score: number
  trident_horizontal_score: number
  trident_vertical_up_score: number
  trident_vertical_down_score: number
  trident_combined_score: number
  achievement_score: number
  final_composite_score: number
  zone_grade: ZoneGrade

  // Component 7: Distance & Heatmap
  distance_from_price?: number
  heatmap_level: HeatmapLevel
  priority_rank?: number
  setup_readiness?: string

  // Component 8: Setup Engine
  setup_type?: string
  entry_model?: string
  confirmation_signal?: string
  planned_entry?: number
  planned_sl?: number
  planned_target?: number
  planned_rr?: number
  recommended_position_pct?: number
  premium_discount?: PremiumDiscount

  // Component 9: Lifecycle
  status: ZoneStatus
  lifecycle_stage: LifecycleStage
  freshness: ZoneFreshness
  test_count: number

  // Component 10: Performance Analytics (auto-updated)
  zone_win_rate: number
  linked_trade_count: number
  avg_actual_rr_delivered: number
  avg_capture_efficiency_pct: number
  avg_available_move_r: number
  avg_left_on_table_r: number
  zone_estimation_accuracy_pct: number
  zone_estimation_bias: EstimationBias
  most_common_reversal_reason?: string
  avg_exhaustion_candles: number

  // Component 11: Trend Probability
  bullish_probability_pct: number
  bearish_probability_pct: number
  neutral_probability_pct: number

  // Component 12: Curve Map
  htf_demand_zone?: string
  htf_supply_zone?: string
  curve_position?: CurvePosition

  // Indicator Snapshots T1 & T2
  t1_rsi?: number; t1_macd?: number; t1_ema_20?: number; t1_ema_50?: number
  t1_volume?: number; t1_atr?: number; t1_notes?: string
  t2_rsi?: number; t2_macd?: number; t2_ema_20?: number; t2_ema_50?: number
  t2_volume?: number; t2_atr?: number; t2_notes?: string

  notes: string
  created_at: string
  updated_at: string
}

// ── TRADE INTERFACE — Full 149 columns (Sections A-J) ────────
export interface Trade {
  // Section A: Basic Info
  trade_id: string              // TJ000000001
  user_id?: string
  zone_bank_id: string          // NOT nullable — mandatory FK
  account_id: string            // NOT nullable — mandatory FK
  entry_datetime: string
  exit_datetime?: string
  trade_horizon: TradeHorizon

  // Section B: Zone Bank Inherited (25 fields, auto-populated, read-only)
  b_instrument: string
  b_asset_class: string
  b_zone_type: string
  b_trade_bias: string
  b_timeframe: string
  b_zone_high: number
  b_zone_low: number
  b_zone_mid: number
  b_zone_grade: string
  b_total_zone_score: number
  b_freshness_at_entry: string
  b_test_count_at_entry: number
  b_lifecycle_stage: string
  b_heatmap_level: string
  b_mtf_stack_count: number
  b_htf_alignment?: string
  b_curve_position?: string
  b_entry_model?: string
  b_volatility_state?: string
  b_premium_discount?: string
  b_setup_type?: string
  b_zone_structure_score?: number
  b_liquidity_score?: number
  b_indicator_confluence_score?: number
  b_trident_combined_score?: number

  // Section C: ICT/SMC Structure
  c_bos_confirmed: boolean
  c_choch_confirmed: boolean
  c_ob_type?: string
  c_fvg_present: boolean
  c_fvg_filled_pct?: number
  c_liquidity_taken: boolean
  c_liquidity_type?: string

  // Section D: Risk & Position
  d_balance_before: number
  d_risk_pct: number
  d_risk_amount: number
  d_entry_price: number
  d_stop_loss: number
  d_target_price: number
  d_planned_rr: number
  d_position_size: number
  d_slippage_pts: number

  // Section D2: Trade Management
  d2_sl_moved_to_be: boolean
  d2_be_triggered_at?: number
  d2_trailing_stop_active: boolean
  d2_trailing_stop_method?: string
  d2_partial_exit_1_pct?: number
  d2_partial_exit_1_price?: number
  d2_partial_exit_2_pct?: number
  d2_partial_exit_2_price?: number
  d2_avg_exit_price?: number

  // Section E: Outcome
  e_exit_price?: number
  e_exit_type?: ExitType
  e_gross_pnl?: number
  e_total_costs?: number
  e_net_pnl?: number
  e_r_multiple?: number
  e_mfe?: number
  e_mae?: number
  e_result?: TradeResult
  e_running_balance?: number
  e_effective_r?: number

  // Section F: Psychology
  f_pre_trade_emotion?: EmotionType
  f_post_trade_emotion?: EmotionType
  f_confidence_score?: number
  f_pre_trade_journal?: string
  f_physical_state?: string
  f_followed_plan: boolean
  f_revenge_trade: boolean
  f_early_exit: boolean
  f_discipline_score?: number

  // Section G: Context
  g_session?: MarketSession
  g_killzone?: string
  g_news_event_present: boolean
  g_news_event_desc?: string
  g_mistake_tag?: MistakeType
  g_post_trade_notes?: string

  // Section G2: Macro Context
  g2_vix_at_entry?: number
  g2_dxy_level_at_entry?: number
  g2_nifty_direction?: string
  g2_market_regime?: MarketRegime
  g2_global_sentiment?: string
  g2_macro_notes?: string

  // Section G3: Portfolio Heat
  g3_open_trades_count: number
  g3_total_portfolio_risk_pct: number
  g3_correlated_instrument?: string
  g3_correlation_direction?: string
  g3_heat_level?: string

  // Section H: Contract Note
  h1_contract_note_no?: string
  h1_exchange_order_id?: string
  h1_exchange_trade_id?: string
  h1_client_code?: string
  h1_broker?: string
  h1_segment?: Segment
  h1_settlement_date?: string
  h1_settlement_type?: string
  h2_order_type?: string
  h2_requested_entry_price?: number
  h2_actual_entry_price?: number
  h2_entry_slippage_pts?: number
  h2_entry_qty?: number
  h2_partial_fill_pct?: number
  h3_requested_exit_price?: number
  h3_actual_exit_price?: number
  h3_exit_slippage_pts?: number
  h3_exit_qty?: number
  h4_brokerage?: number
  h4_stt?: number
  h4_ctt?: number
  h4_exchange_txn_charges?: number
  h4_sebi_fee?: number
  h4_gst_18pct?: number
  h4_stamp_duty?: number
  h4_ipft?: number
  h4_dp_cdsl_charges?: number
  h4_spread_pips?: number
  h4_spread_cost?: number
  h4_commission_per_lot?: number
  h4_total_commission?: number
  h4_swap_rollover?: number
  h4_margin_used?: number
  h4_leverage?: number
  h4_pip_value?: number
  h4_eval_phase?: string
  h4_daily_loss_used_pct?: number
  h4_max_loss_used_pct?: number
  h4_profit_target_remaining?: number
  h5_total_cost_all?: number
  h5_effective_r_after_cost?: number
  h5_breakeven_price?: number
  h6_fill_latency_ms?: number
  h6_checklist_score_pct?: number
  h6_entry_deviation_from_zone_mid_pct?: number

  // Section I: Post-Exit Zone Tracking
  i_zone_exhaustion_price?: number
  i_available_move_r?: number
  i_capture_efficiency_pct?: number
  i_left_on_table_r?: number
  i_exit_quality?: string
  i_zone_estimated_rr?: number
  i_zone_actual_rr_delivered?: number
  i_estimation_accuracy_pct?: number
  i_estimation_bias?: EstimationBias
  i_next_zone_hit?: string
  i_reversal_reason?: string
  i_post_exit_notes?: string

  // Section J: Pre-Trade Plan vs Actual
  j_planned_entry?: number
  j_planned_sl?: number
  j_planned_target?: number
  j_planned_position_size?: number
  j_planned_rr?: number
  j_entry_deviation_pts?: number
  j_sl_deviation_pts?: number
  j_plan_adherence_score_pct?: number

  // Indicator Snapshots T3-T5
  t3_rsi?: number; t3_macd?: number; t3_ema_20?: number; t3_ema_50?: number
  t3_volume?: number; t3_atr?: number; t3_notes?: string
  t4_rsi?: number; t4_macd?: number; t4_ema_20?: number; t4_ema_50?: number
  t4_volume?: number; t4_atr?: number; t4_notes?: string
  t5_rsi?: number; t5_macd?: number; t5_ema_20?: number; t5_ema_50?: number
  t5_volume?: number; t5_atr?: number; t5_notes?: string

  // Meta
  meta_strategy_version: string
  meta_tax_classification?: TaxClassification
  meta_financial_year?: string
  meta_holding_period_days?: number
  meta_is_reentry: boolean
  meta_parent_trade_id?: string
  meta_review_done: boolean
  meta_review_date?: string

  // General Notes
  trade_notes?: string

  created_at: string
  updated_at: string
}

// ── TRADE EXIT DATA (for closeTrade action) ─────────────────
export interface TradeExitData {
  exit_datetime: string
  e_exit_price: number
  e_exit_type: ExitType
  e_gross_pnl: number
  e_total_costs: number
  e_net_pnl: number
  e_r_multiple: number
  e_mfe?: number
  e_mae?: number
  e_result: TradeResult
}

// ── SUPPORTING TYPES (kept from v1) ─────────────────────────

export interface CapitalLog {
  id: string
  user_id?: string
  date: string
  capital_amount: number
  deposits: number
  withdrawals: number
  notes: string
}

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

// ── DASHBOARD KPIs ──────────────────────────────────────────
export interface DashboardKPIs {
  totalCapital: number
  todayPnl: number
  monthlyPnl: number
  winRate: number
  profitFactor: number
  expectancy: number
  avgRMultiple: number
  maxDrawdown: number
  consecutiveWins: number
  consecutiveLosses: number
  captureEfficiency: number
  planAdherence: number
  zoneEstimationAccuracy: number
  mfeMaeRatio: number
  leftOnTable: number
  portfolioHeat: number
}

// ── NAV ITEMS ───────────────────────────────────────────────
export interface NavItem {
  title: string
  href: string
  icon: string
}
