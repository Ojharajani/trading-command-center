-- =============================================
-- Trading Command Center — v2 Full Schema Rebuild
-- Architecture Review v2.0 | April 2026
-- Run in Supabase SQL Editor (DROP + CREATE)
-- =============================================

-- Drop existing tables (order matters for FK constraints)
DROP TABLE IF EXISTS psychology_log CASCADE;
DROP TABLE IF EXISTS tax_records CASCADE;
DROP TABLE IF EXISTS trades CASCADE;
DROP TABLE IF EXISTS zones CASCADE;
DROP TABLE IF EXISTS accounts CASCADE;
DROP TABLE IF EXISTS capital_log CASCADE;
DROP TABLE IF EXISTS risk_settings CASCADE;
DROP TABLE IF EXISTS portfolio CASCADE;
DROP TABLE IF EXISTS milestones CASCADE;
DROP TABLE IF EXISTS growth_phases CASCADE;

-- Drop existing sequences
DROP SEQUENCE IF EXISTS zone_id_seq CASCADE;
DROP SEQUENCE IF EXISTS trade_id_seq CASCADE;

-- =============================================
-- 1. ACCOUNTS TABLE (NEW - 7 pre-seeded accounts)
-- =============================================
CREATE TABLE IF NOT EXISTS accounts (
  account_id    TEXT PRIMARY KEY,
  user_id       UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  account_name  TEXT NOT NULL,
  broker        TEXT NOT NULL,
  segment       TEXT NOT NULL,
  account_type  TEXT NOT NULL DEFAULT 'Live'
    CHECK (account_type IN ('Live', 'Prop', 'Demo')),
  currency      TEXT NOT NULL DEFAULT 'INR',
  initial_capital    NUMERIC NOT NULL DEFAULT 0,
  current_balance    NUMERIC NOT NULL DEFAULT 0,
  available_margin   NUMERIC NOT NULL DEFAULT 0,
  open_risk_amount   NUMERIC NOT NULL DEFAULT 0,
  max_risk_per_trade NUMERIC NOT NULL DEFAULT 1,
  max_daily_loss     NUMERIC NOT NULL DEFAULT 3,
  max_weekly_loss    NUMERIC NOT NULL DEFAULT 7,
  max_drawdown       NUMERIC NOT NULL DEFAULT 15,
  max_positions      INTEGER NOT NULL DEFAULT 3,
  -- Prop firm specific
  eval_phase         TEXT DEFAULT NULL,
  daily_loss_limit   NUMERIC DEFAULT NULL,
  max_loss_limit     NUMERIC DEFAULT NULL,
  profit_target      NUMERIC DEFAULT NULL,
  is_active          BOOLEAN NOT NULL DEFAULT true,
  created_at         TIMESTAMPTZ DEFAULT now()
);

-- =============================================
-- 2. ZONES TABLE (132 columns across 12 components)
-- =============================================
CREATE TABLE IF NOT EXISTS zones (
  -- COMPONENT 1: ZONE BANK MASTER
  zone_id       TEXT PRIMARY KEY,
  user_id       UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  instrument    TEXT NOT NULL,
  asset_class   TEXT NOT NULL,
  zone_type     TEXT NOT NULL CHECK (zone_type IN ('Demand', 'Supply')),
  zone_subtype  TEXT NOT NULL,
  trade_bias    TEXT NOT NULL CHECK (trade_bias IN ('Bullish', 'Bearish')),
  exchange      TEXT NOT NULL,
  sector        TEXT,
  country       TEXT DEFAULT 'India',
  base_currency TEXT DEFAULT 'INR',
  tv_symbol     TEXT,
  timeframe     TEXT NOT NULL,

  -- COMPONENT 2: MTF CONFLUENCE (Zone IDs, NOT booleans)
  yearly_zone_id      TEXT REFERENCES zones(zone_id) ON DELETE SET NULL,
  quarterly_zone_id   TEXT REFERENCES zones(zone_id) ON DELETE SET NULL,
  monthly_zone_id     TEXT REFERENCES zones(zone_id) ON DELETE SET NULL,
  weekly_zone_id      TEXT REFERENCES zones(zone_id) ON DELETE SET NULL,
  daily_zone_id       TEXT REFERENCES zones(zone_id) ON DELETE SET NULL,
  h4_zone_id          TEXT REFERENCES zones(zone_id) ON DELETE SET NULL,
  h1_zone_id          TEXT REFERENCES zones(zone_id) ON DELETE SET NULL,
  m15_zone_id         TEXT REFERENCES zones(zone_id) ON DELETE SET NULL,
  m5_zone_id          TEXT REFERENCES zones(zone_id) ON DELETE SET NULL,
  m3_zone_id          TEXT REFERENCES zones(zone_id) ON DELETE SET NULL,
  m1_zone_id          TEXT REFERENCES zones(zone_id) ON DELETE SET NULL,
  mtf_stack_count     INTEGER DEFAULT 0,

  -- COMPONENT 3: ZONE STRUCTURE METRICS
  zone_high     NUMERIC NOT NULL,
  zone_low      NUMERIC NOT NULL,
  zone_mid      NUMERIC,
  zone_width_pct NUMERIC,
  base_candles  INTEGER DEFAULT 0,
  departure_candles INTEGER DEFAULT 0,
  impulse_pct   NUMERIC DEFAULT 0,
  legin_tr      NUMERIC,
  base_avg_tr   NUMERIC,
  legout_tr     NUMERIC,
  legout_base_tr_ratio NUMERIC,
  legin_volume  NUMERIC,
  base_avg_volume NUMERIC,
  legout_volume NUMERIC,
  volume_ratio  NUMERIC,
  base_candle_pattern TEXT,
  confirmation_candle_pattern TEXT,
  chart_pattern TEXT,

  -- COMPONENT 4: LIQUIDITY CONTEXT MAP
  equal_highs_present   BOOLEAN DEFAULT false,
  equal_lows_present    BOOLEAN DEFAULT false,
  stop_cluster_above    BOOLEAN DEFAULT false,
  stop_cluster_below    BOOLEAN DEFAULT false,
  bos_confirmed         BOOLEAN DEFAULT false,
  trendline_liquidity   BOOLEAN DEFAULT false,
  liquidity_type        TEXT,

  -- COMPONENT 5: MOMENTUM & VOLUME
  volume_spike      BOOLEAN DEFAULT false,
  atr_value         NUMERIC,
  atr_expansion     BOOLEAN DEFAULT false,
  volatility_state  TEXT DEFAULT 'Normal'
    CHECK (volatility_state IN ('Low','Normal','High','Extreme')),
  range_compression BOOLEAN DEFAULT false,

  -- COMPONENT 6: SCORING ENGINE (all 0-100)
  zone_structure_score    NUMERIC DEFAULT 0
    CHECK (zone_structure_score BETWEEN 0 AND 100),
  liquidity_score         NUMERIC DEFAULT 0
    CHECK (liquidity_score BETWEEN 0 AND 100),
  indicator_confluence_score NUMERIC DEFAULT 0
    CHECK (indicator_confluence_score BETWEEN 0 AND 100),
  trident_horizontal_score   NUMERIC DEFAULT 0
    CHECK (trident_horizontal_score BETWEEN 0 AND 100),
  trident_vertical_up_score  NUMERIC DEFAULT 0
    CHECK (trident_vertical_up_score BETWEEN 0 AND 100),
  trident_vertical_down_score NUMERIC DEFAULT 0
    CHECK (trident_vertical_down_score BETWEEN 0 AND 100),
  trident_combined_score  NUMERIC DEFAULT 0
    CHECK (trident_combined_score BETWEEN 0 AND 100),
  achievement_score       NUMERIC DEFAULT 0
    CHECK (achievement_score BETWEEN 0 AND 100),
  final_composite_score   NUMERIC DEFAULT 0
    CHECK (final_composite_score BETWEEN 0 AND 100),
  zone_grade  TEXT DEFAULT 'C'
    CHECK (zone_grade IN ('A','B','C')),

  -- COMPONENT 7: DISTANCE & HEATMAP
  distance_from_price   NUMERIC,
  heatmap_level TEXT DEFAULT 'COLD'
    CHECK (heatmap_level IN ('HOT','WARM','COLD')),
  priority_rank     INTEGER,
  setup_readiness   TEXT,

  -- COMPONENT 8: TRADE SETUP ENGINE
  setup_type        TEXT,
  entry_model       TEXT,
  confirmation_signal TEXT,
  planned_entry     NUMERIC,
  planned_sl        NUMERIC,
  planned_target    NUMERIC,
  planned_rr        NUMERIC,
  recommended_position_pct NUMERIC,
  premium_discount  TEXT
    CHECK (premium_discount IN ('Premium','Discount','Equilibrium')),

  -- COMPONENT 9: ZONE STATUS / LIFECYCLE
  status          TEXT NOT NULL DEFAULT 'Active'
    CHECK (status IN ('Active','Broken','Expired','Pending','Void')),
  lifecycle_stage TEXT DEFAULT 'Discovery'
    CHECK (lifecycle_stage IN ('Creation','Discovery','Validation','Weakening','Failure')),
  freshness       TEXT DEFAULT 'Fresh'
    CHECK (freshness IN ('Fresh','Tested','Stale')),
  test_count      INTEGER DEFAULT 0,

  -- COMPONENT 10: PERFORMANCE ANALYTICS (auto-updated on trade close)
  zone_win_rate           NUMERIC DEFAULT 0,
  linked_trade_count      INTEGER DEFAULT 0,
  avg_actual_rr_delivered NUMERIC DEFAULT 0,
  avg_capture_efficiency_pct NUMERIC DEFAULT 0,
  avg_available_move_r    NUMERIC DEFAULT 0,
  avg_left_on_table_r     NUMERIC DEFAULT 0,
  zone_estimation_accuracy_pct NUMERIC DEFAULT 0,
  zone_estimation_bias    TEXT DEFAULT 'Accurate'
    CHECK (zone_estimation_bias IN ('Over','Under','Accurate')),
  most_common_reversal_reason TEXT,
  avg_exhaustion_candles  NUMERIC DEFAULT 0,

  -- COMPONENT 11: TREND PROBABILITY
  bullish_probability_pct  NUMERIC DEFAULT 33,
  bearish_probability_pct  NUMERIC DEFAULT 33,
  neutral_probability_pct  NUMERIC DEFAULT 34,

  -- COMPONENT 12: CURVE MAP HTF CONTEXT
  htf_demand_zone  TEXT,
  htf_supply_zone  TEXT,
  curve_position   TEXT
    CHECK (curve_position IN ('Buy Zone','Sell Zone','Avoid Zone')),

  -- INDICATOR SNAPSHOTS T1 & T2
  t1_rsi NUMERIC, t1_macd NUMERIC, t1_ema_20 NUMERIC, t1_ema_50 NUMERIC,
  t1_volume NUMERIC, t1_atr NUMERIC, t1_notes TEXT,
  t2_rsi NUMERIC, t2_macd NUMERIC, t2_ema_20 NUMERIC, t2_ema_50 NUMERIC,
  t2_volume NUMERIC, t2_atr NUMERIC, t2_notes TEXT,

  notes         TEXT DEFAULT '',
  created_at    TIMESTAMPTZ DEFAULT now(),
  updated_at    TIMESTAMPTZ DEFAULT now()
);

-- =============================================
-- 3. TRADES TABLE (149 columns across Sections A-J)
-- =============================================
CREATE TABLE IF NOT EXISTS trades (
  -- SECTION A: BASIC TRADE INFO
  trade_id      TEXT PRIMARY KEY,
  user_id       UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  zone_bank_id  TEXT NOT NULL REFERENCES zones(zone_id) ON DELETE RESTRICT,
  account_id    TEXT NOT NULL REFERENCES accounts(account_id) ON DELETE RESTRICT,
  entry_datetime TIMESTAMPTZ NOT NULL,
  exit_datetime  TIMESTAMPTZ,
  trade_horizon  TEXT DEFAULT 'Intraday'
    CHECK (trade_horizon IN ('Intraday','Swing','Positional')),

  -- SECTION B: ZONE BANK INHERITED (25 fields, auto-populated)
  b_instrument     TEXT NOT NULL,
  b_asset_class    TEXT NOT NULL,
  b_zone_type      TEXT NOT NULL,
  b_trade_bias     TEXT NOT NULL,
  b_timeframe      TEXT NOT NULL,
  b_zone_high      NUMERIC NOT NULL,
  b_zone_low       NUMERIC NOT NULL,
  b_zone_mid       NUMERIC NOT NULL,
  b_zone_grade     TEXT NOT NULL,
  b_total_zone_score NUMERIC NOT NULL,
  b_freshness_at_entry TEXT NOT NULL,
  b_test_count_at_entry INTEGER NOT NULL,
  b_lifecycle_stage TEXT NOT NULL,
  b_heatmap_level  TEXT NOT NULL,
  b_mtf_stack_count INTEGER NOT NULL,
  b_htf_alignment  TEXT,
  b_curve_position TEXT,
  b_entry_model    TEXT,
  b_volatility_state TEXT,
  b_premium_discount TEXT,
  b_setup_type     TEXT,
  b_zone_structure_score NUMERIC,
  b_liquidity_score NUMERIC,
  b_indicator_confluence_score NUMERIC,
  b_trident_combined_score NUMERIC,

  -- SECTION C: ICT/SMC STRUCTURE
  c_bos_confirmed     BOOLEAN DEFAULT false,
  c_choch_confirmed   BOOLEAN DEFAULT false,
  c_ob_type           TEXT,
  c_fvg_present       BOOLEAN DEFAULT false,
  c_fvg_filled_pct    NUMERIC,
  c_liquidity_taken   BOOLEAN DEFAULT false,
  c_liquidity_type    TEXT,

  -- SECTION D: RISK & POSITION
  d_balance_before    NUMERIC NOT NULL DEFAULT 0,
  d_risk_pct          NUMERIC NOT NULL DEFAULT 1,
  d_risk_amount       NUMERIC NOT NULL DEFAULT 0,
  d_entry_price       NUMERIC NOT NULL DEFAULT 0,
  d_stop_loss         NUMERIC NOT NULL DEFAULT 0,
  d_target_price      NUMERIC NOT NULL DEFAULT 0,
  d_planned_rr        NUMERIC NOT NULL DEFAULT 0,
  d_position_size     NUMERIC NOT NULL DEFAULT 0,
  d_slippage_pts      NUMERIC DEFAULT 0,

  -- SECTION D2: TRADE MANAGEMENT
  d2_sl_moved_to_be      BOOLEAN DEFAULT false,
  d2_be_triggered_at     NUMERIC,
  d2_trailing_stop_active BOOLEAN DEFAULT false,
  d2_trailing_stop_method TEXT,
  d2_partial_exit_1_pct   NUMERIC,
  d2_partial_exit_1_price NUMERIC,
  d2_partial_exit_2_pct   NUMERIC,
  d2_partial_exit_2_price NUMERIC,
  d2_avg_exit_price       NUMERIC,

  -- SECTION E: OUTCOME
  e_exit_price        NUMERIC,
  e_exit_type         TEXT,
  e_gross_pnl         NUMERIC,
  e_total_costs       NUMERIC,
  e_net_pnl           NUMERIC,
  e_r_multiple        NUMERIC,
  e_mfe               NUMERIC,
  e_mae               NUMERIC,
  e_result            TEXT CHECK (e_result IN ('Win','Loss','Breakeven')),
  e_running_balance   NUMERIC,
  e_effective_r       NUMERIC,

  -- SECTION F: PSYCHOLOGY
  f_pre_trade_emotion     TEXT,
  f_post_trade_emotion    TEXT,
  f_confidence_score      INTEGER CHECK (f_confidence_score BETWEEN 1 AND 10),
  f_pre_trade_journal     TEXT,
  f_physical_state        TEXT,
  f_followed_plan         BOOLEAN DEFAULT true,
  f_revenge_trade         BOOLEAN DEFAULT false,
  f_early_exit            BOOLEAN DEFAULT false,
  f_discipline_score      NUMERIC,

  -- SECTION G: CONTEXT
  g_session               TEXT,
  g_killzone              TEXT,
  g_news_event_present    BOOLEAN DEFAULT false,
  g_news_event_desc       TEXT,
  g_mistake_tag           TEXT,
  g_post_trade_notes      TEXT,

  -- SECTION G2: MACRO CONTEXT
  g2_vix_at_entry         NUMERIC,
  g2_dxy_level_at_entry   NUMERIC,
  g2_nifty_direction      TEXT,
  g2_market_regime        TEXT,
  g2_global_sentiment     TEXT,
  g2_macro_notes          TEXT,

  -- SECTION G3: PORTFOLIO HEAT
  g3_open_trades_count    INTEGER DEFAULT 0,
  g3_total_portfolio_risk_pct NUMERIC DEFAULT 0,
  g3_correlated_instrument TEXT,
  g3_correlation_direction TEXT,
  g3_heat_level           TEXT,

  -- SECTION H: CONTRACT NOTE
  h1_contract_note_no     TEXT,
  h1_exchange_order_id    TEXT,
  h1_exchange_trade_id    TEXT,
  h1_client_code          TEXT,
  h1_broker               TEXT,
  h1_segment              TEXT,
  h1_settlement_date      DATE,
  h1_settlement_type      TEXT,
  h2_order_type           TEXT,
  h2_requested_entry_price NUMERIC,
  h2_actual_entry_price   NUMERIC,
  h2_entry_slippage_pts   NUMERIC,
  h2_entry_qty            NUMERIC,
  h2_partial_fill_pct     NUMERIC,
  h3_requested_exit_price NUMERIC,
  h3_actual_exit_price    NUMERIC,
  h3_exit_slippage_pts    NUMERIC,
  h3_exit_qty             NUMERIC,
  h4_brokerage            NUMERIC,
  h4_stt                  NUMERIC,
  h4_ctt                  NUMERIC,
  h4_exchange_txn_charges NUMERIC,
  h4_sebi_fee             NUMERIC,
  h4_gst_18pct            NUMERIC,
  h4_stamp_duty           NUMERIC,
  h4_ipft                 NUMERIC,
  h4_dp_cdsl_charges      NUMERIC,
  h4_spread_pips          NUMERIC,
  h4_spread_cost          NUMERIC,
  h4_commission_per_lot   NUMERIC,
  h4_total_commission     NUMERIC,
  h4_swap_rollover        NUMERIC,
  h4_margin_used          NUMERIC,
  h4_leverage             NUMERIC,
  h4_pip_value            NUMERIC,
  h4_eval_phase           TEXT,
  h4_daily_loss_used_pct  NUMERIC,
  h4_max_loss_used_pct    NUMERIC,
  h4_profit_target_remaining NUMERIC,
  h5_total_cost_all       NUMERIC,
  h5_effective_r_after_cost NUMERIC,
  h5_breakeven_price      NUMERIC,
  h6_fill_latency_ms      INTEGER,
  h6_checklist_score_pct  NUMERIC,
  h6_entry_deviation_from_zone_mid_pct NUMERIC,

  -- SECTION I: POST-EXIT ZONE TRACKING
  i_zone_exhaustion_price    NUMERIC,
  i_available_move_r         NUMERIC,
  i_capture_efficiency_pct   NUMERIC,
  i_left_on_table_r          NUMERIC,
  i_exit_quality             TEXT,
  i_zone_estimated_rr        NUMERIC,
  i_zone_actual_rr_delivered NUMERIC,
  i_estimation_accuracy_pct  NUMERIC,
  i_estimation_bias          TEXT CHECK (i_estimation_bias IN ('Over','Under','Accurate')),
  i_next_zone_hit            TEXT,
  i_reversal_reason          TEXT,
  i_post_exit_notes          TEXT,

  -- SECTION J: PRE-TRADE PLAN VS ACTUAL
  j_planned_entry     NUMERIC,
  j_planned_sl        NUMERIC,
  j_planned_target    NUMERIC,
  j_planned_position_size NUMERIC,
  j_planned_rr        NUMERIC,
  j_entry_deviation_pts NUMERIC,
  j_sl_deviation_pts    NUMERIC,
  j_plan_adherence_score_pct NUMERIC,

  -- INDICATOR SNAPSHOTS T3-T5
  t3_rsi NUMERIC, t3_macd NUMERIC, t3_ema_20 NUMERIC, t3_ema_50 NUMERIC,
  t3_volume NUMERIC, t3_atr NUMERIC, t3_notes TEXT,
  t4_rsi NUMERIC, t4_macd NUMERIC, t4_ema_20 NUMERIC, t4_ema_50 NUMERIC,
  t4_volume NUMERIC, t4_atr NUMERIC, t4_notes TEXT,
  t5_rsi NUMERIC, t5_macd NUMERIC, t5_ema_20 NUMERIC, t5_ema_50 NUMERIC,
  t5_volume NUMERIC, t5_atr NUMERIC, t5_notes TEXT,

  -- META
  meta_strategy_version    TEXT DEFAULT '1.0',
  meta_tax_classification  TEXT
    CHECK (meta_tax_classification IN ('Intraday','STCG','LTCG','F&O')),
  meta_financial_year      TEXT,
  meta_holding_period_days INTEGER,
  meta_is_reentry          BOOLEAN DEFAULT false,
  meta_parent_trade_id     TEXT REFERENCES trades(trade_id),
  meta_review_done         BOOLEAN DEFAULT false,
  meta_review_date         DATE,
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now()
);

-- =============================================
-- 4. SUPPORTING TABLES (kept from v1)
-- =============================================
CREATE TABLE IF NOT EXISTS capital_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  capital_amount NUMERIC NOT NULL DEFAULT 0,
  deposits NUMERIC NOT NULL DEFAULT 0,
  withdrawals NUMERIC NOT NULL DEFAULT 0,
  notes TEXT DEFAULT ''
);

CREATE TABLE IF NOT EXISTS portfolio (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  symbol TEXT NOT NULL,
  quantity NUMERIC NOT NULL DEFAULT 0,
  avg_buy_price NUMERIC NOT NULL DEFAULT 0,
  current_price NUMERIC NOT NULL DEFAULT 0,
  sector TEXT DEFAULT '',
  investment_thesis TEXT DEFAULT '',
  buy_date DATE,
  target_price NUMERIC DEFAULT 0,
  stop_loss NUMERIC DEFAULT 0
);

CREATE TABLE IF NOT EXISTS milestones (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  target_date DATE,
  target_value NUMERIC NOT NULL DEFAULT 0,
  current_value NUMERIC NOT NULL DEFAULT 0,
  metric_type TEXT NOT NULL DEFAULT 'Custom',
  status TEXT NOT NULL DEFAULT 'Pending'
    CHECK (status IN ('Pending', 'In Progress', 'Completed'))
);

CREATE TABLE IF NOT EXISTS growth_phases (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  phase_name TEXT NOT NULL,
  starting_capital NUMERIC NOT NULL DEFAULT 0,
  target_capital NUMERIC NOT NULL DEFAULT 0,
  current_capital NUMERIC NOT NULL DEFAULT 0,
  start_date DATE,
  target_date DATE,
  status TEXT NOT NULL DEFAULT 'Not Started'
    CHECK (status IN ('Not Started', 'Active', 'Completed')),
  skills_checklist JSONB DEFAULT '[]'::jsonb
);

-- =============================================
-- 5. ID GENERATION FUNCTIONS
-- =============================================
CREATE SEQUENCE IF NOT EXISTS zone_id_seq START 1;
CREATE OR REPLACE FUNCTION generate_zone_id()
RETURNS TEXT AS $$
BEGIN
  RETURN 'ZB' || LPAD(nextval('zone_id_seq')::TEXT, 9, '0');
END;
$$ LANGUAGE plpgsql;

CREATE SEQUENCE IF NOT EXISTS trade_id_seq START 1;
CREATE OR REPLACE FUNCTION generate_trade_id()
RETURNS TEXT AS $$
BEGIN
  RETURN 'TJ' || LPAD(nextval('trade_id_seq')::TEXT, 9, '0');
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- 6. ZONE PERFORMANCE FEEDBACK FUNCTION
-- =============================================
CREATE OR REPLACE FUNCTION update_zone_performance_on_trade_close(p_trade_id TEXT)
RETURNS void AS $$
DECLARE
  v_zone_id TEXT;
  v_win_count INTEGER;
  v_trade_count INTEGER;
  v_avg_rr NUMERIC;
  v_avg_capture NUMERIC;
  v_avg_avail NUMERIC;
  v_avg_left NUMERIC;
  v_avg_accuracy NUMERIC;
BEGIN
  SELECT zone_bank_id INTO v_zone_id FROM trades WHERE trade_id = p_trade_id;

  SELECT
    COUNT(*) FILTER (WHERE e_result = 'Win'),
    COUNT(*),
    AVG(e_r_multiple),
    AVG(i_capture_efficiency_pct),
    AVG(i_available_move_r),
    AVG(i_left_on_table_r),
    AVG(i_estimation_accuracy_pct)
  INTO v_win_count, v_trade_count, v_avg_rr, v_avg_capture, v_avg_avail, v_avg_left, v_avg_accuracy
  FROM trades WHERE zone_bank_id = v_zone_id AND e_result IS NOT NULL;

  UPDATE zones SET
    zone_win_rate            = ROUND((v_win_count::NUMERIC / NULLIF(v_trade_count, 0)) * 100, 1),
    linked_trade_count       = v_trade_count,
    avg_actual_rr_delivered  = ROUND(COALESCE(v_avg_rr, 0), 2),
    avg_capture_efficiency_pct = ROUND(COALESCE(v_avg_capture, 0), 1),
    avg_available_move_r     = ROUND(COALESCE(v_avg_avail, 0), 2),
    avg_left_on_table_r      = ROUND(COALESCE(v_avg_left, 0), 2),
    zone_estimation_accuracy_pct = ROUND(COALESCE(v_avg_accuracy, 0), 1),
    test_count               = v_trade_count,
    freshness                = CASE
                                 WHEN v_trade_count = 0 THEN 'Fresh'
                                 WHEN v_trade_count <= 2 THEN 'Tested'
                                 ELSE 'Stale'
                               END,
    updated_at               = now()
  WHERE zone_id = v_zone_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- 7. INDEXES
-- =============================================
CREATE INDEX IF NOT EXISTS idx_zones_user ON zones(user_id);
CREATE INDEX IF NOT EXISTS idx_zones_instrument ON zones(instrument);
CREATE INDEX IF NOT EXISTS idx_zones_status ON zones(status);
CREATE INDEX IF NOT EXISTS idx_trades_user ON trades(user_id);
CREATE INDEX IF NOT EXISTS idx_trades_zone_bank ON trades(zone_bank_id);
CREATE INDEX IF NOT EXISTS idx_trades_account ON trades(account_id);
CREATE INDEX IF NOT EXISTS idx_trades_entry_date ON trades(entry_datetime);
CREATE INDEX IF NOT EXISTS idx_accounts_user ON accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_capital_log_user ON capital_log(user_id);
CREATE INDEX IF NOT EXISTS idx_portfolio_user ON portfolio(user_id);
CREATE INDEX IF NOT EXISTS idx_milestones_user ON milestones(user_id);
CREATE INDEX IF NOT EXISTS idx_growth_phases_user ON growth_phases(user_id);

-- =============================================
-- 8. RLS POLICIES
-- =============================================

-- Accounts
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own accounts" ON accounts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own accounts" ON accounts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own accounts" ON accounts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own accounts" ON accounts FOR DELETE USING (auth.uid() = user_id);

-- Zones
ALTER TABLE zones ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own zones" ON zones FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own zones" ON zones FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own zones" ON zones FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own zones" ON zones FOR DELETE USING (auth.uid() = user_id);

-- Trades
ALTER TABLE trades ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own trades" ON trades FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own trades" ON trades FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own trades" ON trades FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own trades" ON trades FOR DELETE USING (auth.uid() = user_id);

-- Capital Log
ALTER TABLE capital_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own capital log" ON capital_log FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own capital log" ON capital_log FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own capital log" ON capital_log FOR DELETE USING (auth.uid() = user_id);

-- Portfolio
ALTER TABLE portfolio ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own portfolio" ON portfolio FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own portfolio" ON portfolio FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own portfolio" ON portfolio FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own portfolio" ON portfolio FOR DELETE USING (auth.uid() = user_id);

-- Milestones
ALTER TABLE milestones ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own milestones" ON milestones FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own milestones" ON milestones FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own milestones" ON milestones FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own milestones" ON milestones FOR DELETE USING (auth.uid() = user_id);

-- Growth Phases
ALTER TABLE growth_phases ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own growth phases" ON growth_phases FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own growth phases" ON growth_phases FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own growth phases" ON growth_phases FOR UPDATE USING (auth.uid() = user_id);
