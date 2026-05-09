import { Zone, Trade, Account, CapitalLog, PortfolioItem, TaxRecord, Milestone, GrowthPhase } from './types'

// =============================================
// DEMO ACCOUNTS (7 pre-seeded)
// =============================================
export const demoAccounts: Account[] = [
  { account_id: 'ACC-01', account_name: 'NSE Equity Main', broker: 'Zerodha', segment: 'NSE EQ', account_type: 'Live', currency: 'INR', initial_capital: 500000, current_balance: 547025, available_margin: 400000, open_risk_amount: 5470, max_risk_per_trade: 1, max_daily_loss: 3, max_weekly_loss: 7, max_drawdown: 15, max_positions: 3, is_active: true, created_at: '2026-01-01T00:00:00' },
  { account_id: 'ACC-02', account_name: 'NSE F&O', broker: 'Zerodha', segment: 'NSE F&O', account_type: 'Live', currency: 'INR', initial_capital: 300000, current_balance: 328500, available_margin: 250000, open_risk_amount: 3285, max_risk_per_trade: 1, max_daily_loss: 3, max_weekly_loss: 7, max_drawdown: 15, max_positions: 3, is_active: true, created_at: '2026-01-01T00:00:00' },
  { account_id: 'ACC-03', account_name: 'MCX Commodity', broker: 'Angel One', segment: 'MCX', account_type: 'Live', currency: 'INR', initial_capital: 200000, current_balance: 215400, available_margin: 180000, open_risk_amount: 2154, max_risk_per_trade: 1.5, max_daily_loss: 3, max_weekly_loss: 7, max_drawdown: 15, max_positions: 2, is_active: true, created_at: '2026-01-01T00:00:00' },
  { account_id: 'ACC-04', account_name: 'Forex', broker: 'FXTM', segment: 'Forex', account_type: 'Live', currency: 'USD', initial_capital: 5000, current_balance: 5340, available_margin: 4500, open_risk_amount: 53, max_risk_per_trade: 1, max_daily_loss: 2, max_weekly_loss: 5, max_drawdown: 10, max_positions: 2, is_active: true, created_at: '2026-01-01T00:00:00' },
  { account_id: 'ACC-05', account_name: 'Global Commodity CFD', broker: 'IC Markets', segment: 'CFD', account_type: 'Live', currency: 'USD', initial_capital: 3000, current_balance: 3180, available_margin: 2800, open_risk_amount: 32, max_risk_per_trade: 1, max_daily_loss: 2, max_weekly_loss: 5, max_drawdown: 10, max_positions: 2, is_active: true, created_at: '2026-01-01T00:00:00' },
  { account_id: 'ACC-06', account_name: 'Prop Firm / FTMO', broker: 'FTMO', segment: 'Prop', account_type: 'Prop', currency: 'USD', initial_capital: 100000, current_balance: 103500, available_margin: 95000, open_risk_amount: 1035, max_risk_per_trade: 0.5, max_daily_loss: 5, max_weekly_loss: 10, max_drawdown: 10, max_positions: 3, eval_phase: 'Funded', daily_loss_limit: 5, max_loss_limit: 10, profit_target: 10, is_active: true, created_at: '2026-01-01T00:00:00' },
  { account_id: 'ACC-07', account_name: 'Paper Trading', broker: 'Sensibull', segment: 'NSE EQ', account_type: 'Demo', currency: 'INR', initial_capital: 1000000, current_balance: 1000000, available_margin: 1000000, open_risk_amount: 0, max_risk_per_trade: 2, max_daily_loss: 5, max_weekly_loss: 10, max_drawdown: 20, max_positions: 5, is_active: true, created_at: '2026-01-01T00:00:00' },
]

// =============================================
// DEMO ZONES (8 zones with full 132-column data)
// =============================================
export const demoZones: Zone[] = [
  {
    zone_id: 'ZB000000001', instrument: 'NIFTY', asset_class: 'Index', zone_type: 'Demand', zone_subtype: 'DBD', trade_bias: 'Bullish', exchange: 'NSE', sector: 'Index', country: 'India', base_currency: 'INR', tv_symbol: 'NSE:NIFTY', timeframe: 'Daily',
    yearly_zone_id: null, quarterly_zone_id: null, monthly_zone_id: null, weekly_zone_id: 'ZB000000008', daily_zone_id: null, h4_zone_id: null, h1_zone_id: null, m15_zone_id: null, m5_zone_id: null, m3_zone_id: null, m1_zone_id: null, mtf_stack_count: 1,
    zone_high: 22450, zone_low: 22380, zone_mid: 22415, zone_width_pct: 0.31, base_candles: 3, departure_candles: 5, impulse_pct: 1.8,
    equal_highs_present: false, equal_lows_present: true, stop_cluster_above: false, stop_cluster_below: true, bos_confirmed: true, trendline_liquidity: false,
    volume_spike: false, atr_value: 145, atr_expansion: false, volatility_state: 'Normal', range_compression: false,
    zone_structure_score: 82, liquidity_score: 75, indicator_confluence_score: 70, trident_horizontal_score: 9, trident_vertical_up_score: 0, trident_vertical_down_score: 50, trident_combined_score: 20, achievement_score: 60, final_composite_score: 65, zone_grade: 'C',
    distance_from_price: 0.8, heatmap_level: 'HOT', priority_rank: 1, setup_readiness: 'Ready',
    setup_type: 'Conservative', entry_model: 'Zone Touch', confirmation_signal: 'Bullish Engulfing', planned_entry: 22420, planned_sl: 22360, planned_target: 22580, planned_rr: 2.67, recommended_position_pct: 1, premium_discount: 'Discount',
    status: 'Active', lifecycle_stage: 'Discovery', freshness: 'Fresh', test_count: 0,
    zone_win_rate: 0, linked_trade_count: 0, avg_actual_rr_delivered: 0, avg_capture_efficiency_pct: 0, avg_available_move_r: 0, avg_left_on_table_r: 0, zone_estimation_accuracy_pct: 0, zone_estimation_bias: 'Accurate', avg_exhaustion_candles: 0,
    bullish_probability_pct: 65, bearish_probability_pct: 20, neutral_probability_pct: 15,
    curve_position: 'Buy Zone',
    t1_rsi: 42, t1_macd: -15, t1_ema_20: 22480, t1_ema_50: 22520, t1_volume: 1250000, t1_atr: 145,
    notes: 'Strong demand zone with clean departure and HTF weekly alignment', created_at: '2026-04-01T09:30:00', updated_at: '2026-04-01T09:30:00',
  },
  {
    zone_id: 'ZB000000002', instrument: 'BANKNIFTY', asset_class: 'Index', zone_type: 'Supply', zone_subtype: 'RBD', trade_bias: 'Bearish', exchange: 'NSE', sector: 'Banking', country: 'India', base_currency: 'INR', tv_symbol: 'NSE:BANKNIFTY', timeframe: '1H',
    yearly_zone_id: null, quarterly_zone_id: null, monthly_zone_id: null, weekly_zone_id: null, daily_zone_id: 'ZB000000008', h4_zone_id: null, h1_zone_id: null, m15_zone_id: null, m5_zone_id: null, m3_zone_id: null, m1_zone_id: null, mtf_stack_count: 1,
    zone_high: 48900, zone_low: 48750, zone_mid: 48825, zone_width_pct: 0.31, base_candles: 2, departure_candles: 4, impulse_pct: 1.5,
    equal_highs_present: true, equal_lows_present: false, stop_cluster_above: true, stop_cluster_below: false, bos_confirmed: true, trendline_liquidity: false,
    volume_spike: true, atr_value: 280, atr_expansion: true, volatility_state: 'High', range_compression: false,
    zone_structure_score: 70, liquidity_score: 68, indicator_confluence_score: 65, trident_horizontal_score: 9, trident_vertical_up_score: 0, trident_vertical_down_score: 25, trident_combined_score: 11, achievement_score: 55, final_composite_score: 56, zone_grade: 'C',
    distance_from_price: 2.1, heatmap_level: 'WARM', priority_rank: 3,
    setup_type: 'Aggressive', entry_model: 'BOS+Retest',
    status: 'Active', lifecycle_stage: 'Validation', freshness: 'Tested', test_count: 1,
    zone_win_rate: 100, linked_trade_count: 1, avg_actual_rr_delivered: 2.43, avg_capture_efficiency_pct: 85, avg_available_move_r: 2.86, avg_left_on_table_r: 0.43, zone_estimation_accuracy_pct: 85, zone_estimation_bias: 'Accurate', avg_exhaustion_candles: 0,
    bullish_probability_pct: 25, bearish_probability_pct: 55, neutral_probability_pct: 20,
    notes: 'Supply zone tested once, still valid', created_at: '2026-03-28T10:00:00', updated_at: '2026-04-10T11:00:00',
  },
  {
    zone_id: 'ZB000000003', instrument: 'RELIANCE', asset_class: 'Nifty500', zone_type: 'Demand', zone_subtype: 'Liquidity Sweep', trade_bias: 'Bullish', exchange: 'NSE', sector: 'Energy', country: 'India', base_currency: 'INR', tv_symbol: 'NSE:RELIANCE', timeframe: 'Weekly',
    yearly_zone_id: null, quarterly_zone_id: null, monthly_zone_id: null, weekly_zone_id: null, daily_zone_id: 'ZB000000001', h4_zone_id: null, h1_zone_id: null, m15_zone_id: null, m5_zone_id: null, m3_zone_id: null, m1_zone_id: null, mtf_stack_count: 1,
    zone_high: 2890, zone_low: 2850, zone_mid: 2870, zone_width_pct: 1.40, base_candles: 2, departure_candles: 3, impulse_pct: 3.2,
    equal_highs_present: false, equal_lows_present: true, stop_cluster_above: false, stop_cluster_below: true, bos_confirmed: true, trendline_liquidity: true,
    volume_spike: true, atr_value: 52, atr_expansion: true, volatility_state: 'Normal', range_compression: false,
    zone_structure_score: 92, liquidity_score: 90, indicator_confluence_score: 85, trident_horizontal_score: 9, trident_vertical_up_score: 17, trident_vertical_down_score: 0, trident_combined_score: 9, achievement_score: 80, final_composite_score: 76, zone_grade: 'B',
    distance_from_price: 0.5, heatmap_level: 'HOT', priority_rank: 2, setup_readiness: 'Ready',
    setup_type: 'Conservative', entry_model: 'Zone Touch', planned_entry: 2860, planned_sl: 2840, planned_target: 2940, planned_rr: 4.0, recommended_position_pct: 1, premium_discount: 'Discount',
    status: 'Active', lifecycle_stage: 'Discovery', freshness: 'Fresh', test_count: 0,
    zone_win_rate: 0, linked_trade_count: 0, avg_actual_rr_delivered: 0, avg_capture_efficiency_pct: 0, avg_available_move_r: 0, avg_left_on_table_r: 0, zone_estimation_accuracy_pct: 0, zone_estimation_bias: 'Accurate', avg_exhaustion_candles: 0,
    bullish_probability_pct: 70, bearish_probability_pct: 15, neutral_probability_pct: 15,
    curve_position: 'Buy Zone',
    t1_rsi: 38, t1_macd: -8, t1_volume: 2500000, t1_atr: 52,
    notes: 'HTF demand with liquidity sweep below', created_at: '2026-03-25T09:15:00', updated_at: '2026-03-25T09:15:00',
  },
  {
    zone_id: 'ZB000000004', instrument: 'NIFTY', asset_class: 'Index', zone_type: 'Supply', zone_subtype: 'DBR', trade_bias: 'Bearish', exchange: 'NSE', sector: 'Index', country: 'India', base_currency: 'INR', tv_symbol: 'NSE:NIFTY', timeframe: '15M',
    yearly_zone_id: null, quarterly_zone_id: null, monthly_zone_id: null, weekly_zone_id: null, daily_zone_id: null, h4_zone_id: null, h1_zone_id: null, m15_zone_id: null, m5_zone_id: null, m3_zone_id: null, m1_zone_id: null, mtf_stack_count: 0,
    zone_high: 22680, zone_low: 22650, zone_mid: 22665, zone_width_pct: 0.13, base_candles: 1, departure_candles: 3, impulse_pct: 0.8,
    equal_highs_present: false, equal_lows_present: false, stop_cluster_above: false, stop_cluster_below: false, bos_confirmed: false, trendline_liquidity: false,
    volume_spike: false, atr_value: 35, atr_expansion: false, volatility_state: 'Normal', range_compression: true,
    zone_structure_score: 55, liquidity_score: 40, indicator_confluence_score: 50, trident_horizontal_score: 0, trident_vertical_up_score: 0, trident_vertical_down_score: 0, trident_combined_score: 0, achievement_score: 30, final_composite_score: 39, zone_grade: 'C',
    distance_from_price: 1.5, heatmap_level: 'WARM',
    setup_type: 'Aggressive', entry_model: 'Zone Touch',
    status: 'Active', lifecycle_stage: 'Creation', freshness: 'Fresh', test_count: 0,
    zone_win_rate: 0, linked_trade_count: 0, avg_actual_rr_delivered: 0, avg_capture_efficiency_pct: 0, avg_available_move_r: 0, avg_left_on_table_r: 0, zone_estimation_accuracy_pct: 0, zone_estimation_bias: 'Accurate', avg_exhaustion_candles: 0,
    bullish_probability_pct: 30, bearish_probability_pct: 45, neutral_probability_pct: 25,
    notes: 'Short timeframe supply, use with caution', created_at: '2026-04-05T11:30:00', updated_at: '2026-04-05T11:30:00',
  },
  {
    zone_id: 'ZB000000005', instrument: 'HDFCBANK', asset_class: 'Nifty500', zone_type: 'Demand', zone_subtype: 'Compression', trade_bias: 'Bullish', exchange: 'NSE', sector: 'Banking', country: 'India', base_currency: 'INR', tv_symbol: 'NSE:HDFCBANK', timeframe: 'Daily',
    yearly_zone_id: null, quarterly_zone_id: null, monthly_zone_id: null, weekly_zone_id: null, daily_zone_id: null, h4_zone_id: null, h1_zone_id: null, m15_zone_id: null, m5_zone_id: null, m3_zone_id: null, m1_zone_id: null, mtf_stack_count: 0,
    zone_high: 1680, zone_low: 1660, zone_mid: 1670, zone_width_pct: 1.20, base_candles: 4, departure_candles: 2, impulse_pct: 1.2,
    equal_highs_present: false, equal_lows_present: false, stop_cluster_above: false, stop_cluster_below: false, bos_confirmed: false, trendline_liquidity: false,
    volume_spike: false, atr_value: 28, atr_expansion: false, volatility_state: 'Low', range_compression: true,
    zone_structure_score: 50, liquidity_score: 35, indicator_confluence_score: 45, trident_horizontal_score: 0, trident_vertical_up_score: 0, trident_vertical_down_score: 0, trident_combined_score: 0, achievement_score: 40, final_composite_score: 38, zone_grade: 'C',
    distance_from_price: 1.8, heatmap_level: 'WARM',
    status: 'Active', lifecycle_stage: 'Weakening', freshness: 'Stale', test_count: 2,
    zone_win_rate: 0, linked_trade_count: 1, avg_actual_rr_delivered: -1, avg_capture_efficiency_pct: 0, avg_available_move_r: 0, avg_left_on_table_r: 0, zone_estimation_accuracy_pct: 0, zone_estimation_bias: 'Over', avg_exhaustion_candles: 0,
    bullish_probability_pct: 35, bearish_probability_pct: 40, neutral_probability_pct: 25,
    notes: 'Compression zone, losing freshness', created_at: '2026-03-20T09:15:00', updated_at: '2026-04-08T10:00:00',
  },
  {
    zone_id: 'ZB000000006', instrument: 'TCS', asset_class: 'Nifty500', zone_type: 'Supply', zone_subtype: 'Imbalance', trade_bias: 'Bearish', exchange: 'NSE', sector: 'IT', country: 'India', base_currency: 'INR', tv_symbol: 'NSE:TCS', timeframe: '4H',
    yearly_zone_id: null, quarterly_zone_id: null, monthly_zone_id: null, weekly_zone_id: null, daily_zone_id: null, h4_zone_id: null, h1_zone_id: null, m15_zone_id: null, m5_zone_id: null, m3_zone_id: null, m1_zone_id: null, mtf_stack_count: 0,
    zone_high: 3750, zone_low: 3720, zone_mid: 3735, zone_width_pct: 0.81, base_candles: 2, departure_candles: 4, impulse_pct: 2.1,
    equal_highs_present: true, equal_lows_present: false, stop_cluster_above: true, stop_cluster_below: false, bos_confirmed: true, trendline_liquidity: false,
    volume_spike: true, atr_value: 45, atr_expansion: true, volatility_state: 'High', range_compression: false,
    zone_structure_score: 78, liquidity_score: 72, indicator_confluence_score: 68, trident_horizontal_score: 0, trident_vertical_up_score: 0, trident_vertical_down_score: 0, trident_combined_score: 0, achievement_score: 65, final_composite_score: 58, zone_grade: 'C',
    distance_from_price: 0.3, heatmap_level: 'HOT', priority_rank: 4, setup_readiness: 'Ready',
    setup_type: 'Aggressive', entry_model: 'FVG Fill',
    status: 'Active', lifecycle_stage: 'Validation', freshness: 'Tested', test_count: 2,
    zone_win_rate: 100, linked_trade_count: 2, avg_actual_rr_delivered: 2.5, avg_capture_efficiency_pct: 80, avg_available_move_r: 3.0, avg_left_on_table_r: 0.5, zone_estimation_accuracy_pct: 83, zone_estimation_bias: 'Accurate', avg_exhaustion_candles: 0,
    bullish_probability_pct: 20, bearish_probability_pct: 60, neutral_probability_pct: 20,
    notes: 'Imbalance supply zone with strong departure', created_at: '2026-04-02T14:00:00', updated_at: '2026-04-07T14:00:00',
  },
  {
    zone_id: 'ZB000000007', instrument: 'INFY', asset_class: 'Nifty500', zone_type: 'Demand', zone_subtype: 'Trend Continuation', trade_bias: 'Bullish', exchange: 'NSE', sector: 'IT', country: 'India', base_currency: 'INR', tv_symbol: 'NSE:INFY', timeframe: 'Daily',
    yearly_zone_id: null, quarterly_zone_id: null, monthly_zone_id: null, weekly_zone_id: null, daily_zone_id: null, h4_zone_id: null, h1_zone_id: null, m15_zone_id: null, m5_zone_id: null, m3_zone_id: null, m1_zone_id: null, mtf_stack_count: 0,
    zone_high: 1520, zone_low: 1500, zone_mid: 1510, zone_width_pct: 1.33, base_candles: 3, departure_candles: 1, impulse_pct: 0.5,
    equal_highs_present: false, equal_lows_present: false, stop_cluster_above: false, stop_cluster_below: false, bos_confirmed: false, trendline_liquidity: false,
    volume_spike: false, atr_value: 22, atr_expansion: false, volatility_state: 'Low', range_compression: false,
    zone_structure_score: 30, liquidity_score: 20, indicator_confluence_score: 25, trident_horizontal_score: 0, trident_vertical_up_score: 0, trident_vertical_down_score: 0, trident_combined_score: 0, achievement_score: 20, final_composite_score: 23, zone_grade: 'C',
    distance_from_price: 5.0, heatmap_level: 'COLD',
    status: 'Broken', lifecycle_stage: 'Failure', freshness: 'Stale', test_count: 3,
    zone_win_rate: 0, linked_trade_count: 0, avg_actual_rr_delivered: 0, avg_capture_efficiency_pct: 0, avg_available_move_r: 0, avg_left_on_table_r: 0, zone_estimation_accuracy_pct: 0, zone_estimation_bias: 'Over', avg_exhaustion_candles: 0,
    bullish_probability_pct: 20, bearish_probability_pct: 55, neutral_probability_pct: 25,
    notes: 'Zone broken, marking as void', created_at: '2026-03-15T09:15:00', updated_at: '2026-04-02T10:00:00',
  },
  {
    zone_id: 'ZB000000008', instrument: 'BANKNIFTY', asset_class: 'Index', zone_type: 'Demand', zone_subtype: 'Gap', trade_bias: 'Bullish', exchange: 'NSE', sector: 'Banking', country: 'India', base_currency: 'INR', tv_symbol: 'NSE:BANKNIFTY', timeframe: 'Daily',
    yearly_zone_id: null, quarterly_zone_id: null, monthly_zone_id: null, weekly_zone_id: null, daily_zone_id: null, h4_zone_id: null, h1_zone_id: null, m15_zone_id: null, m5_zone_id: null, m3_zone_id: null, m1_zone_id: null, mtf_stack_count: 0,
    zone_high: 47200, zone_low: 47050, zone_mid: 47125, zone_width_pct: 0.32, base_candles: 1, departure_candles: 6, impulse_pct: 2.8,
    equal_highs_present: false, equal_lows_present: true, stop_cluster_above: false, stop_cluster_below: true, bos_confirmed: true, trendline_liquidity: true,
    volume_spike: true, atr_value: 310, atr_expansion: true, volatility_state: 'High', range_compression: false,
    zone_structure_score: 88, liquidity_score: 85, indicator_confluence_score: 80, trident_horizontal_score: 0, trident_vertical_up_score: 0, trident_vertical_down_score: 0, trident_combined_score: 0, achievement_score: 75, final_composite_score: 71, zone_grade: 'C',
    distance_from_price: 3.5, heatmap_level: 'COLD',
    setup_type: 'Conservative', entry_model: 'Zone Touch', planned_entry: 47100, planned_sl: 47000, planned_target: 47400, planned_rr: 3.0,
    status: 'Active', lifecycle_stage: 'Validation', freshness: 'Tested', test_count: 1,
    zone_win_rate: 100, linked_trade_count: 1, avg_actual_rr_delivered: 2.38, avg_capture_efficiency_pct: 79, avg_available_move_r: 3.0, avg_left_on_table_r: 0.62, zone_estimation_accuracy_pct: 79, zone_estimation_bias: 'Accurate', avg_exhaustion_candles: 0,
    bullish_probability_pct: 60, bearish_probability_pct: 25, neutral_probability_pct: 15,
    curve_position: 'Buy Zone',
    t1_rsi: 35, t1_macd: -25, t1_volume: 3200000, t1_atr: 310,
    notes: 'Gap up demand with HTF alignment', created_at: '2026-04-08T09:15:00', updated_at: '2026-04-08T09:15:00',
  },
]

// =============================================
// DEMO TRADES (v2 format — full Sections A-J)
// =============================================

function makeTrade(overrides: Partial<Trade> & { trade_id: string; zone_bank_id: string; account_id: string; entry_datetime: string; b_instrument: string; b_asset_class: string; b_zone_type: string; b_trade_bias: string; b_timeframe: string; b_zone_high: number; b_zone_low: number; b_zone_mid: number; b_zone_grade: string; b_total_zone_score: number; b_freshness_at_entry: string; b_test_count_at_entry: number; b_lifecycle_stage: string; b_heatmap_level: string; b_mtf_stack_count: number; d_balance_before: number; d_risk_pct: number; d_risk_amount: number; d_entry_price: number; d_stop_loss: number; d_target_price: number; d_planned_rr: number; d_position_size: number }): Trade {
  return {
    trade_horizon: 'Intraday',
    d_slippage_pts: 0,
    c_bos_confirmed: false, c_choch_confirmed: false, c_fvg_present: false, c_liquidity_taken: false,
    d2_sl_moved_to_be: false, d2_trailing_stop_active: false,
    f_followed_plan: true, f_revenge_trade: false, f_early_exit: false,
    g_news_event_present: false,
    g3_open_trades_count: 1, g3_total_portfolio_risk_pct: 1,
    meta_strategy_version: '1.0', meta_is_reentry: false, meta_review_done: false,
    created_at: overrides.entry_datetime, updated_at: overrides.entry_datetime,
    ...overrides,
  } as Trade
}

export const demoTrades: Trade[] = [
  makeTrade({
    trade_id: 'TJ000000001', zone_bank_id: 'ZB000000001', account_id: 'ACC-02', entry_datetime: '2026-04-10T09:30:00', exit_datetime: '2026-04-10T15:15:00', trade_horizon: 'Intraday',
    b_instrument: 'NIFTY', b_asset_class: 'Index', b_zone_type: 'Demand', b_trade_bias: 'Bullish', b_timeframe: 'Daily', b_zone_high: 22450, b_zone_low: 22380, b_zone_mid: 22415, b_zone_grade: 'C', b_total_zone_score: 65, b_freshness_at_entry: 'Fresh', b_test_count_at_entry: 0, b_lifecycle_stage: 'Discovery', b_heatmap_level: 'HOT', b_mtf_stack_count: 1,
    d_balance_before: 328500, d_risk_pct: 1, d_risk_amount: 3285, d_entry_price: 22400, d_stop_loss: 22360, d_target_price: 22520, d_planned_rr: 3, d_position_size: 50,
    e_exit_price: 22510, e_exit_type: 'Target Hit', e_gross_pnl: 5500, e_total_costs: 125, e_net_pnl: 5375, e_r_multiple: 1.64, e_mfe: 2.75, e_mae: -0.25, e_result: 'Win', e_running_balance: 333875,
    f_pre_trade_emotion: 'Confident', f_post_trade_emotion: 'Confident', f_confidence_score: 8, f_discipline_score: 90, f_followed_plan: true,
    g_session: 'India', g_mistake_tag: 'No Mistake',
    h1_segment: 'NSE F&O', h4_brokerage: 40, h4_stt: 35, h4_exchange_txn_charges: 25, h4_gst_18pct: 12, h4_stamp_duty: 13,
    j_planned_entry: 22400, j_planned_sl: 22360, j_planned_target: 22520, j_planned_rr: 3, j_plan_adherence_score_pct: 95,
  }),
  makeTrade({
    trade_id: 'TJ000000002', zone_bank_id: 'ZB000000002', account_id: 'ACC-02', entry_datetime: '2026-04-10T11:00:00', exit_datetime: '2026-04-10T14:30:00', trade_horizon: 'Intraday',
    b_instrument: 'BANKNIFTY', b_asset_class: 'Index', b_zone_type: 'Supply', b_trade_bias: 'Bearish', b_timeframe: '1H', b_zone_high: 48900, b_zone_low: 48750, b_zone_mid: 48825, b_zone_grade: 'C', b_total_zone_score: 56, b_freshness_at_entry: 'Fresh', b_test_count_at_entry: 0, b_lifecycle_stage: 'Discovery', b_heatmap_level: 'WARM', b_mtf_stack_count: 1,
    d_balance_before: 333875, d_risk_pct: 0.5, d_risk_amount: 1670, d_entry_price: 48850, d_stop_loss: 48920, d_target_price: 48650, d_planned_rr: 2.86, d_position_size: 15,
    e_exit_price: 48680, e_exit_type: 'Trailing SL', e_gross_pnl: 2550, e_total_costs: 85, e_net_pnl: 2465, e_r_multiple: 1.48, e_mfe: 2.86, e_mae: -0.14, e_result: 'Win', e_running_balance: 336340,
    f_pre_trade_emotion: 'Neutral', f_post_trade_emotion: 'Confident', f_confidence_score: 7, f_discipline_score: 85,
    g_session: 'India', g_mistake_tag: 'No Mistake',
    h1_segment: 'NSE F&O',
    j_planned_entry: 48850, j_planned_sl: 48920, j_planned_target: 48650, j_planned_rr: 2.86, j_plan_adherence_score_pct: 92,
  }),
  makeTrade({
    trade_id: 'TJ000000003', zone_bank_id: 'ZB000000001', account_id: 'ACC-02', entry_datetime: '2026-04-09T10:15:00', exit_datetime: '2026-04-09T11:30:00', trade_horizon: 'Intraday',
    b_instrument: 'NIFTY', b_asset_class: 'Index', b_zone_type: 'Demand', b_trade_bias: 'Bullish', b_timeframe: 'Daily', b_zone_high: 22450, b_zone_low: 22380, b_zone_mid: 22415, b_zone_grade: 'C', b_total_zone_score: 65, b_freshness_at_entry: 'Fresh', b_test_count_at_entry: 0, b_lifecycle_stage: 'Discovery', b_heatmap_level: 'HOT', b_mtf_stack_count: 1,
    d_balance_before: 336340, d_risk_pct: 1.5, d_risk_amount: 5045, d_entry_price: 22550, d_stop_loss: 22500, d_target_price: 22700, d_planned_rr: 3, d_position_size: 50,
    e_exit_price: 22490, e_exit_type: 'SL Hit', e_gross_pnl: -3000, e_total_costs: 95, e_net_pnl: -3095, e_r_multiple: -0.61, e_mfe: 0.4, e_mae: -1.2, e_result: 'Loss', e_running_balance: 333245,
    f_pre_trade_emotion: 'Greed', f_post_trade_emotion: 'Fear', f_confidence_score: 5, f_discipline_score: 40, f_followed_plan: false, f_revenge_trade: false,
    g_session: 'India', g_mistake_tag: 'FOMO Entry',
    h1_segment: 'NSE F&O',
    j_planned_entry: 22420, j_planned_sl: 22380, j_planned_target: 22580, j_planned_rr: 2.67, j_plan_adherence_score_pct: 35,
  }),
  makeTrade({
    trade_id: 'TJ000000004', zone_bank_id: 'ZB000000003', account_id: 'ACC-01', entry_datetime: '2026-04-09T14:00:00', exit_datetime: '2026-04-11T15:15:00', trade_horizon: 'Swing',
    b_instrument: 'RELIANCE', b_asset_class: 'Nifty500', b_zone_type: 'Demand', b_trade_bias: 'Bullish', b_timeframe: 'Weekly', b_zone_high: 2890, b_zone_low: 2850, b_zone_mid: 2870, b_zone_grade: 'B', b_total_zone_score: 76, b_freshness_at_entry: 'Fresh', b_test_count_at_entry: 0, b_lifecycle_stage: 'Discovery', b_heatmap_level: 'HOT', b_mtf_stack_count: 1,
    d_balance_before: 547025, d_risk_pct: 1, d_risk_amount: 5470, d_entry_price: 2860, d_stop_loss: 2845, d_target_price: 2920, d_planned_rr: 4, d_position_size: 100,
    e_exit_price: 2915, e_exit_type: 'Trailing SL', e_gross_pnl: 5500, e_total_costs: 180, e_net_pnl: 5320, e_r_multiple: 0.97, e_mfe: 4.33, e_mae: -0.33, e_result: 'Win', e_running_balance: 552345,
    f_pre_trade_emotion: 'Confident', f_post_trade_emotion: 'Confident', f_confidence_score: 9, f_discipline_score: 95,
    g_session: 'India', g_mistake_tag: 'No Mistake',
    h1_segment: 'NSE EQ', h4_brokerage: 0, h4_stt: 70, h4_dp_cdsl_charges: 15, h4_exchange_txn_charges: 40, h4_gst_18pct: 25, h4_stamp_duty: 30,
    j_planned_entry: 2860, j_planned_sl: 2840, j_planned_target: 2940, j_planned_rr: 4, j_plan_adherence_score_pct: 98,
    i_available_move_r: 5.0, i_capture_efficiency_pct: 87, i_left_on_table_r: 0.67, i_exit_quality: 'On Time', i_estimation_accuracy_pct: 87,
  }),
  makeTrade({
    trade_id: 'TJ000000005', zone_bank_id: 'ZB000000005', account_id: 'ACC-01', entry_datetime: '2026-04-08T09:45:00', exit_datetime: '2026-04-08T12:00:00', trade_horizon: 'Intraday',
    b_instrument: 'HDFCBANK', b_asset_class: 'Nifty500', b_zone_type: 'Demand', b_trade_bias: 'Bullish', b_timeframe: 'Daily', b_zone_high: 1680, b_zone_low: 1660, b_zone_mid: 1670, b_zone_grade: 'C', b_total_zone_score: 38, b_freshness_at_entry: 'Tested', b_test_count_at_entry: 1, b_lifecycle_stage: 'Weakening', b_heatmap_level: 'WARM', b_mtf_stack_count: 0,
    d_balance_before: 547025, d_risk_pct: 1, d_risk_amount: 5470, d_entry_price: 1670, d_stop_loss: 1655, d_target_price: 1710, d_planned_rr: 2.67, d_position_size: 200,
    e_exit_price: 1655, e_exit_type: 'SL Hit', e_gross_pnl: -3000, e_total_costs: 90, e_net_pnl: -3090, e_r_multiple: -0.56, e_mfe: 0.33, e_mae: -1.0, e_result: 'Loss', e_running_balance: 543935,
    f_pre_trade_emotion: 'Anxious', f_post_trade_emotion: 'Fear', f_confidence_score: 4, f_discipline_score: 65, f_early_exit: false,
    g_session: 'India', g_mistake_tag: 'No Mistake',
    h1_segment: 'NSE EQ',
    j_planned_entry: 1670, j_planned_sl: 1655, j_planned_target: 1710, j_planned_rr: 2.67, j_plan_adherence_score_pct: 88,
  }),
  makeTrade({
    trade_id: 'TJ000000006', zone_bank_id: 'ZB000000004', account_id: 'ACC-02', entry_datetime: '2026-04-07T10:30:00', exit_datetime: '2026-04-07T11:45:00', trade_horizon: 'Intraday',
    b_instrument: 'NIFTY', b_asset_class: 'Index', b_zone_type: 'Supply', b_trade_bias: 'Bearish', b_timeframe: '15M', b_zone_high: 22680, b_zone_low: 22650, b_zone_mid: 22665, b_zone_grade: 'C', b_total_zone_score: 39, b_freshness_at_entry: 'Fresh', b_test_count_at_entry: 0, b_lifecycle_stage: 'Creation', b_heatmap_level: 'WARM', b_mtf_stack_count: 0,
    d_balance_before: 333245, d_risk_pct: 0.75, d_risk_amount: 2499, d_entry_price: 22670, d_stop_loss: 22690, d_target_price: 22600, d_planned_rr: 3.5, d_position_size: 75,
    e_exit_price: 22605, e_exit_type: 'Target Hit', e_gross_pnl: 4875, e_total_costs: 110, e_net_pnl: 4765, e_r_multiple: 1.91, e_mfe: 3.5, e_mae: -0.25, e_result: 'Win', e_running_balance: 338010,
    f_pre_trade_emotion: 'Neutral', f_post_trade_emotion: 'Confident', f_confidence_score: 7, f_discipline_score: 85,
    g_session: 'India', g_mistake_tag: 'No Mistake',
    h1_segment: 'NSE F&O',
    j_planned_entry: 22670, j_planned_sl: 22690, j_planned_target: 22600, j_planned_rr: 3.5, j_plan_adherence_score_pct: 100,
  }),
  makeTrade({
    trade_id: 'TJ000000007', zone_bank_id: 'ZB000000006', account_id: 'ACC-01', entry_datetime: '2026-04-07T13:00:00', exit_datetime: '2026-04-07T15:15:00', trade_horizon: 'Intraday',
    b_instrument: 'TCS', b_asset_class: 'Nifty500', b_zone_type: 'Supply', b_trade_bias: 'Bearish', b_timeframe: '4H', b_zone_high: 3750, b_zone_low: 3720, b_zone_mid: 3735, b_zone_grade: 'C', b_total_zone_score: 58, b_freshness_at_entry: 'Tested', b_test_count_at_entry: 1, b_lifecycle_stage: 'Validation', b_heatmap_level: 'HOT', b_mtf_stack_count: 0,
    d_balance_before: 543935, d_risk_pct: 0.5, d_risk_amount: 2720, d_entry_price: 3740, d_stop_loss: 3755, d_target_price: 3700, d_planned_rr: 2.67, d_position_size: 50,
    e_exit_price: 3700, e_exit_type: 'Target Hit', e_gross_pnl: 2000, e_total_costs: 60, e_net_pnl: 1940, e_r_multiple: 0.71, e_mfe: 2.67, e_mae: -0.13, e_result: 'Win', e_running_balance: 545875,
    f_pre_trade_emotion: 'Confident', f_post_trade_emotion: 'Confident', f_confidence_score: 8, f_discipline_score: 90,
    g_session: 'India', g_mistake_tag: 'No Mistake',
    h1_segment: 'NSE EQ',
    j_planned_entry: 3740, j_planned_sl: 3755, j_planned_target: 3700, j_planned_rr: 2.67, j_plan_adherence_score_pct: 100,
    i_available_move_r: 3.0, i_capture_efficiency_pct: 89, i_left_on_table_r: 0.33, i_exit_quality: 'On Time', i_estimation_accuracy_pct: 89,
  }),
  makeTrade({
    trade_id: 'TJ000000008', zone_bank_id: 'ZB000000008', account_id: 'ACC-02', entry_datetime: '2026-04-04T09:30:00', exit_datetime: '2026-04-04T15:00:00', trade_horizon: 'Intraday',
    b_instrument: 'BANKNIFTY', b_asset_class: 'Index', b_zone_type: 'Demand', b_trade_bias: 'Bullish', b_timeframe: 'Daily', b_zone_high: 47200, b_zone_low: 47050, b_zone_mid: 47125, b_zone_grade: 'C', b_total_zone_score: 71, b_freshness_at_entry: 'Fresh', b_test_count_at_entry: 0, b_lifecycle_stage: 'Discovery', b_heatmap_level: 'COLD', b_mtf_stack_count: 0,
    d_balance_before: 338010, d_risk_pct: 1, d_risk_amount: 3380, d_entry_price: 47100, d_stop_loss: 47020, d_target_price: 47300, d_planned_rr: 2.5, d_position_size: 25,
    e_exit_price: 47290, e_exit_type: 'Target Hit', e_gross_pnl: 4750, e_total_costs: 100, e_net_pnl: 4650, e_r_multiple: 1.38, e_mfe: 2.5, e_mae: -0.38, e_result: 'Win', e_running_balance: 342660,
    f_pre_trade_emotion: 'Confident', f_post_trade_emotion: 'Confident', f_confidence_score: 8, f_discipline_score: 90,
    g_session: 'India', g_mistake_tag: 'No Mistake',
    h1_segment: 'NSE F&O',
    j_planned_entry: 47100, j_planned_sl: 47020, j_planned_target: 47300, j_planned_rr: 2.5, j_plan_adherence_score_pct: 100,
    i_available_move_r: 3.0, i_capture_efficiency_pct: 79, i_left_on_table_r: 0.62, i_exit_quality: 'On Time', i_estimation_accuracy_pct: 79,
  }),
]

// =============================================
// DEMO CAPITAL LOG (kept from v1)
// =============================================
export const demoCapitalLog: CapitalLog[] = [
  { id: 'C001', date: '2026-01-01', capital_amount: 500000, deposits: 500000, withdrawals: 0, notes: 'Initial capital' },
  { id: 'C002', date: '2026-01-31', capital_amount: 518000, deposits: 0, withdrawals: 0, notes: 'Jan end' },
  { id: 'C003', date: '2026-02-28', capital_amount: 535000, deposits: 0, withdrawals: 0, notes: 'Feb end' },
  { id: 'C004', date: '2026-03-15', capital_amount: 550000, deposits: 50000, withdrawals: 0, notes: 'Added capital' },
  { id: 'C005', date: '2026-03-31', capital_amount: 572000, deposits: 0, withdrawals: 0, notes: 'Mar end' },
  { id: 'C006', date: '2026-04-10', capital_amount: 597025, deposits: 0, withdrawals: 0, notes: 'Current' },
]

// =============================================
// REMAINING DEMO DATA (kept from v1 structure)
// =============================================
export const demoPortfolio: PortfolioItem[] = [
  { id: 'PF001', symbol: 'RELIANCE', quantity: 50, avg_buy_price: 2650, current_price: 2890, sector: 'Energy', investment_thesis: 'Jio platform growth + retail expansion', buy_date: '2025-06-15', target_price: 3200, stop_loss: 2400 },
  { id: 'PF002', symbol: 'TCS', quantity: 30, avg_buy_price: 3500, current_price: 3740, sector: 'IT', investment_thesis: 'AI/ML services growth, strong deal pipeline', buy_date: '2025-08-20', target_price: 4200, stop_loss: 3200 },
  { id: 'PF003', symbol: 'HDFCBANK', quantity: 100, avg_buy_price: 1580, current_price: 1680, sector: 'Banking', investment_thesis: 'Largest private bank, steady compounder', buy_date: '2025-09-10', target_price: 2000, stop_loss: 1400 },
  { id: 'PF004', symbol: 'INFY', quantity: 80, avg_buy_price: 1420, current_price: 1510, sector: 'IT', investment_thesis: 'Digital transformation deals, margin expansion', buy_date: '2025-11-05', target_price: 1800, stop_loss: 1300 },
  { id: 'PF005', symbol: 'BAJFINANCE', quantity: 20, avg_buy_price: 6800, current_price: 7200, sector: 'NBFC', investment_thesis: 'Consumer lending growth, AUM expansion', buy_date: '2026-01-15', target_price: 8500, stop_loss: 6000 },
]

export const demoTaxRecords: TaxRecord[] = [
  { id: 'TX001', trade_id: 'TJ000000001', profit_loss: 5375, trade_type: 'F&O', tax_rate: 30, tax_amount: 1612, financial_year: '2025-26', notes: '' },
  { id: 'TX002', trade_id: 'TJ000000002', profit_loss: 2465, trade_type: 'F&O', tax_rate: 30, tax_amount: 740, financial_year: '2025-26', notes: '' },
  { id: 'TX003', trade_id: 'TJ000000003', profit_loss: -3095, trade_type: 'F&O', tax_rate: 30, tax_amount: 0, financial_year: '2025-26', notes: 'F&O loss' },
  { id: 'TX004', trade_id: 'TJ000000004', profit_loss: 5320, trade_type: 'Intraday', tax_rate: 30, tax_amount: 1596, financial_year: '2025-26', notes: '' },
]

export const demoMilestones: Milestone[] = [
  { id: 'M001', title: 'Achieve 60% Win Rate', description: 'Consistently maintain 60%+ win rate over 50 trades', target_date: '2026-06-30', target_value: 60, current_value: 62.5, metric_type: 'Win Rate', status: 'In Progress' },
  { id: 'M002', title: 'Capital ₹10L', description: 'Grow trading capital to ₹10,00,000', target_date: '2026-12-31', target_value: 1000000, current_value: 597025, metric_type: 'Capital', status: 'In Progress' },
  { id: 'M003', title: 'Max Drawdown < 10%', description: 'Keep maximum drawdown below 10% for 3 months', target_date: '2026-06-30', target_value: 10, current_value: 6.2, metric_type: 'Drawdown', status: 'In Progress' },
  { id: 'M004', title: 'Complete 100 Trades', description: 'Execute 100 trades with proper journaling', target_date: '2026-09-30', target_value: 100, current_value: 8, metric_type: 'Custom', status: 'In Progress' },
  { id: 'M005', title: 'Profit Factor > 2', description: 'Achieve and maintain profit factor above 2.0', target_date: '2026-06-30', target_value: 2.0, current_value: 1.85, metric_type: 'Profit Factor', status: 'In Progress' },
]

export const demoGrowthPhases: GrowthPhase[] = [
  {
    id: 'G001', phase_name: 'Phase 1: Foundation', starting_capital: 100000, target_capital: 500000, current_capital: 500000, start_date: '2025-01-01', target_date: '2025-12-31', status: 'Completed',
    skills_checklist: [
      { name: 'Understand Supply & Demand zones', completed: true },
      { name: 'Paper trade for 3 months', completed: true },
      { name: 'Backtest 5 strategies', completed: true },
      { name: 'Read 10 trading books', completed: true },
    ]
  },
  {
    id: 'G002', phase_name: 'Phase 2: Growth', starting_capital: 500000, target_capital: 2500000, current_capital: 597025, start_date: '2026-01-01', target_date: '2027-06-30', status: 'Active',
    skills_checklist: [
      { name: 'Master risk management', completed: true },
      { name: 'Develop trading psychology', completed: false },
      { name: 'Scale position sizing', completed: false },
      { name: 'Multi-timeframe analysis', completed: true },
      { name: 'Options strategies', completed: false },
    ]
  },
  {
    id: 'G003', phase_name: 'Phase 3: Professional', starting_capital: 2500000, target_capital: 10000000, current_capital: 0, start_date: '2027-07-01', target_date: '2029-12-31', status: 'Not Started',
    skills_checklist: [
      { name: 'Portfolio management', completed: false },
      { name: 'Quantitative analysis', completed: false },
      { name: 'Algorithmic entries', completed: false },
      { name: 'Tax optimization', completed: false },
    ]
  },
]
