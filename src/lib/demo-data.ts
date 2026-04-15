import { Zone, Trade, CapitalLog, RiskSettings, PortfolioItem, TaxRecord, Milestone, GrowthPhase, PsychologyLog } from './types'

// ==================== DEMO ZONES ====================
export const demoZones: Zone[] = [
  { id: 'Z001', symbol: 'NIFTY', zone_type: 'Demand', zone_subtype: 'DBD', timeframe: 'Daily', zone_high: 22450, zone_low: 22380, status: 'Fresh', quality_score: 85, trap_risk: 'Low', test_count: 0, notes: 'Strong demand zone with clean departure', created_at: '2026-04-01T09:30:00', strong_departure: true, low_base_candles: true, freshness: true, liquidity_sweep: false, htf_alignment: true },
  { id: 'Z002', symbol: 'BANKNIFTY', zone_type: 'Supply', zone_subtype: 'RBD', timeframe: '1H', zone_high: 48900, zone_low: 48750, status: 'Tested', quality_score: 70, trap_risk: 'Medium', test_count: 1, notes: 'Supply zone tested once, still valid', created_at: '2026-03-28T10:00:00', strong_departure: true, low_base_candles: true, freshness: false, liquidity_sweep: false, htf_alignment: true },
  { id: 'Z003', symbol: 'RELIANCE', zone_type: 'Demand', zone_subtype: 'Liquidity Sweep', timeframe: 'Weekly', zone_high: 2890, zone_low: 2850, status: 'Fresh', quality_score: 95, trap_risk: 'Low', test_count: 0, notes: 'HTF demand with liquidity sweep below', created_at: '2026-03-25T09:15:00', strong_departure: true, low_base_candles: true, freshness: true, liquidity_sweep: true, htf_alignment: true },
  { id: 'Z004', symbol: 'NIFTY', zone_type: 'Supply', zone_subtype: 'DBR', timeframe: '15M', zone_high: 22680, zone_low: 22650, status: 'Fresh', quality_score: 60, trap_risk: 'High', test_count: 0, notes: 'Short timeframe supply, use with caution', created_at: '2026-04-05T11:30:00', strong_departure: false, low_base_candles: true, freshness: true, liquidity_sweep: false, htf_alignment: false },
  { id: 'Z005', symbol: 'HDFCBANK', zone_type: 'Demand', zone_subtype: 'Compression', timeframe: 'Daily', zone_high: 1680, zone_low: 1660, status: 'Tested', quality_score: 55, trap_risk: 'Medium', test_count: 2, notes: 'Compression zone, losing freshness', created_at: '2026-03-20T09:15:00', strong_departure: true, low_base_candles: false, freshness: false, liquidity_sweep: false, htf_alignment: true },
  { id: 'Z006', symbol: 'TCS', zone_type: 'Supply', zone_subtype: 'Imbalance', timeframe: '4H', zone_high: 3750, zone_low: 3720, status: 'Fresh', quality_score: 80, trap_risk: 'Low', test_count: 0, notes: 'Imbalance supply zone with strong departure', created_at: '2026-04-02T14:00:00', strong_departure: true, low_base_candles: true, freshness: true, liquidity_sweep: false, htf_alignment: true },
  { id: 'Z007', symbol: 'INFY', zone_type: 'Demand', zone_subtype: 'Trend Continuation', timeframe: 'Daily', zone_high: 1520, zone_low: 1500, status: 'Broken', quality_score: 30, trap_risk: 'High', test_count: 3, notes: 'Zone broken, marking as void', created_at: '2026-03-15T09:15:00', strong_departure: false, low_base_candles: false, freshness: false, liquidity_sweep: false, htf_alignment: false },
  { id: 'Z008', symbol: 'BANKNIFTY', zone_type: 'Demand', zone_subtype: 'Gap', timeframe: 'Daily', zone_high: 47200, zone_low: 47050, status: 'Fresh', quality_score: 90, trap_risk: 'Low', test_count: 0, notes: 'Gap up demand with HTF alignment', created_at: '2026-04-08T09:15:00', strong_departure: true, low_base_candles: true, freshness: true, liquidity_sweep: true, htf_alignment: true },
]

// ==================== DEMO TRADES ====================
export const demoTrades: Trade[] = [
  { id: 'T001', date_time: '2026-04-10T09:30:00', symbol: 'NIFTY', direction: 'Long', setup: 'Zone Entry', zone_id: 'Z001', entry_price: 22400, stop_loss: 22360, target_price: 22520, exit_price: 22510, position_size: 50, risk_percent: 1, rr_ratio: 3, pnl: 5500, result: 'Win', timeframe: 'Daily', emotion_before: 'Confident', emotion_after: 'Confident', confidence: 8, discipline_score: 9, mistake_type: 'No Mistake', notes: 'Clean zone entry, followed plan', created_at: '2026-04-10T09:30:00' },
  { id: 'T002', date_time: '2026-04-10T11:00:00', symbol: 'BANKNIFTY', direction: 'Short', setup: 'Supply Zone', zone_id: 'Z002', entry_price: 48850, stop_loss: 48920, target_price: 48650, exit_price: 48680, position_size: 15, risk_percent: 0.5, rr_ratio: 2.86, pnl: 2550, result: 'Win', timeframe: '1H', emotion_before: 'Neutral', emotion_after: 'Confident', confidence: 7, discipline_score: 8, mistake_type: 'No Mistake', notes: 'Good short from supply', created_at: '2026-04-10T11:00:00' },
  { id: 'T003', date_time: '2026-04-09T10:15:00', symbol: 'NIFTY', direction: 'Long', setup: 'Breakout', zone_id: null, entry_price: 22550, stop_loss: 22500, target_price: 22700, exit_price: 22490, position_size: 50, risk_percent: 1.5, rr_ratio: 3, pnl: -3000, result: 'Loss', timeframe: '15M', emotion_before: 'Greed', emotion_after: 'Fear', confidence: 5, discipline_score: 4, mistake_type: 'FOMO Entry', notes: 'FOMO entry on breakout, no zone', created_at: '2026-04-09T10:15:00' },
  { id: 'T004', date_time: '2026-04-09T14:00:00', symbol: 'RELIANCE', direction: 'Long', setup: 'Zone Entry', zone_id: 'Z003', entry_price: 2860, stop_loss: 2845, target_price: 2920, exit_price: 2915, position_size: 100, risk_percent: 1, rr_ratio: 4, pnl: 5500, result: 'Win', timeframe: 'Daily', emotion_before: 'Confident', emotion_after: 'Confident', confidence: 9, discipline_score: 10, mistake_type: 'No Mistake', notes: 'Perfect execution on HTF zone', created_at: '2026-04-09T14:00:00' },
  { id: 'T005', date_time: '2026-04-08T09:45:00', symbol: 'HDFCBANK', direction: 'Long', setup: 'Compression Entry', zone_id: 'Z005', entry_price: 1670, stop_loss: 1655, target_price: 1710, exit_price: 1655, position_size: 200, risk_percent: 1, rr_ratio: 2.67, pnl: -3000, result: 'Loss', timeframe: 'Daily', emotion_before: 'Anxious', emotion_after: 'Fear', confidence: 4, discipline_score: 6, mistake_type: 'Early Exit', notes: 'SL hit, zone was already tested twice', created_at: '2026-04-08T09:45:00' },
  { id: 'T006', date_time: '2026-04-07T10:30:00', symbol: 'NIFTY', direction: 'Short', setup: 'Supply Zone', zone_id: 'Z004', entry_price: 22670, stop_loss: 22690, target_price: 22600, exit_price: 22605, position_size: 75, risk_percent: 0.75, rr_ratio: 3.5, pnl: 4875, result: 'Win', timeframe: '15M', emotion_before: 'Neutral', emotion_after: 'Confident', confidence: 7, discipline_score: 8, mistake_type: 'No Mistake', notes: 'Short from 15M supply, quick scalp', created_at: '2026-04-07T10:30:00' },
  { id: 'T007', date_time: '2026-04-07T13:00:00', symbol: 'TCS', direction: 'Short', setup: 'Imbalance', zone_id: 'Z006', entry_price: 3740, stop_loss: 3755, target_price: 3700, exit_price: 3700, position_size: 50, risk_percent: 0.5, rr_ratio: 2.67, pnl: 2000, result: 'Win', timeframe: '4H', emotion_before: 'Confident', emotion_after: 'Confident', confidence: 8, discipline_score: 9, mistake_type: 'No Mistake', notes: 'Textbook imbalance trade', created_at: '2026-04-07T13:00:00' },
  { id: 'T008', date_time: '2026-04-04T09:30:00', symbol: 'BANKNIFTY', direction: 'Long', setup: 'Gap Fill', zone_id: 'Z008', entry_price: 47100, stop_loss: 47020, target_price: 47300, exit_price: 47290, position_size: 25, risk_percent: 1, rr_ratio: 2.5, pnl: 4750, result: 'Win', timeframe: 'Daily', emotion_before: 'Confident', emotion_after: 'Confident', confidence: 8, discipline_score: 9, mistake_type: 'No Mistake', notes: 'Gap fill play worked perfectly', created_at: '2026-04-04T09:30:00' },
  { id: 'T009', date_time: '2026-04-03T11:00:00', symbol: 'NIFTY', direction: 'Long', setup: 'Zone Entry', zone_id: 'Z001', entry_price: 22420, stop_loss: 22380, target_price: 22540, exit_price: 22380, position_size: 50, risk_percent: 1, rr_ratio: 3, pnl: -2000, result: 'Loss', timeframe: 'Daily', emotion_before: 'Neutral', emotion_after: 'Anxious', confidence: 6, discipline_score: 7, mistake_type: 'No Mistake', notes: 'SL hit, market reversed quickly', created_at: '2026-04-03T11:00:00' },
  { id: 'T010', date_time: '2026-04-02T10:00:00', symbol: 'INFY', direction: 'Long', setup: 'Breakout', zone_id: null, entry_price: 1515, stop_loss: 1500, target_price: 1560, exit_price: 1500, position_size: 300, risk_percent: 1.5, rr_ratio: 3, pnl: -4500, result: 'Loss', timeframe: 'Daily', emotion_before: 'Greed', emotion_after: 'Fear', confidence: 3, discipline_score: 3, mistake_type: 'Oversized', notes: 'Oversized position, broke rules', created_at: '2026-04-02T10:00:00' },
  { id: 'T011', date_time: '2026-04-01T09:30:00', symbol: 'NIFTY', direction: 'Long', setup: 'Zone Entry', zone_id: 'Z001', entry_price: 22390, stop_loss: 22360, target_price: 22480, exit_price: 22475, position_size: 50, risk_percent: 0.75, rr_ratio: 3, pnl: 4250, result: 'Win', timeframe: 'Daily', emotion_before: 'Confident', emotion_after: 'Confident', confidence: 9, discipline_score: 10, mistake_type: 'No Mistake', notes: 'First trade of month, perfect entry', created_at: '2026-04-01T09:30:00' },
  { id: 'T012', date_time: '2026-03-29T11:30:00', symbol: 'BANKNIFTY', direction: 'Short', setup: 'Supply Zone', zone_id: 'Z002', entry_price: 48800, stop_loss: 48870, target_price: 48600, exit_price: 48620, position_size: 20, risk_percent: 1, rr_ratio: 2.86, pnl: 3600, result: 'Win', timeframe: '1H', emotion_before: 'Neutral', emotion_after: 'Confident', confidence: 7, discipline_score: 8, mistake_type: 'No Mistake', notes: 'Supply zone short, trailed well', created_at: '2026-03-29T11:30:00' },
  { id: 'T013', date_time: '2026-03-28T10:00:00', symbol: 'RELIANCE', direction: 'Long', setup: 'Zone Entry', zone_id: 'Z003', entry_price: 2855, stop_loss: 2840, target_price: 2910, exit_price: 2905, position_size: 150, risk_percent: 1, rr_ratio: 3.67, pnl: 7500, result: 'Win', timeframe: 'Weekly', emotion_before: 'Confident', emotion_after: 'Confident', confidence: 9, discipline_score: 9, mistake_type: 'No Mistake', notes: 'Swing trade on HTF zone', created_at: '2026-03-28T10:00:00' },
  { id: 'T014', date_time: '2026-03-27T13:00:00', symbol: 'NIFTY', direction: 'Long', setup: 'Breakout', zone_id: null, entry_price: 22300, stop_loss: 22270, target_price: 22390, exit_price: 22270, position_size: 100, risk_percent: 1.5, rr_ratio: 3, pnl: -3000, result: 'Loss', timeframe: '15M', emotion_before: 'Greed', emotion_after: 'Anxious', confidence: 4, discipline_score: 3, mistake_type: 'Revenge Trade', notes: 'Revenge trade after morning loss', created_at: '2026-03-27T13:00:00' },
  { id: 'T015', date_time: '2026-03-26T09:30:00', symbol: 'TCS', direction: 'Short', setup: 'Imbalance', zone_id: 'Z006', entry_price: 3745, stop_loss: 3760, target_price: 3700, exit_price: 3710, position_size: 60, risk_percent: 0.5, rr_ratio: 3, pnl: 2100, result: 'Win', timeframe: '4H', emotion_before: 'Neutral', emotion_after: 'Neutral', confidence: 7, discipline_score: 8, mistake_type: 'No Mistake', notes: 'Imbalance fill, good entry', created_at: '2026-03-26T09:30:00' },
]

// ==================== DEMO CAPITAL LOG ====================
export const demoCapitalLog: CapitalLog[] = [
  { id: 'C001', date: '2026-01-01', capital_amount: 500000, deposits: 500000, withdrawals: 0, notes: 'Initial capital' },
  { id: 'C002', date: '2026-01-31', capital_amount: 518000, deposits: 0, withdrawals: 0, notes: 'Jan end' },
  { id: 'C003', date: '2026-02-28', capital_amount: 535000, deposits: 0, withdrawals: 0, notes: 'Feb end' },
  { id: 'C004', date: '2026-03-15', capital_amount: 550000, deposits: 50000, withdrawals: 0, notes: 'Added capital' },
  { id: 'C005', date: '2026-03-31', capital_amount: 572000, deposits: 0, withdrawals: 0, notes: 'Mar end' },
  { id: 'C006', date: '2026-04-10', capital_amount: 597025, deposits: 0, withdrawals: 0, notes: 'Current' },
]

// ==================== DEMO RISK SETTINGS ====================
export const demoRiskSettings: RiskSettings = {
  id: 'RS001',
  max_risk_per_trade: 1.5,
  max_daily_loss: 3,
  max_weekly_loss: 7,
  max_drawdown: 15,
  max_positions: 3,
}

// ==================== DEMO PSYCHOLOGY LOG ====================
export const demoPsychologyLog: PsychologyLog[] = [
  { id: 'PS001', trade_id: 'T003', emotion_before: 'Greed', emotion_after: 'Fear', discipline_score: 4, revenge_trade: false, rule_violation: true, mistake_type: 'FOMO Entry', notes: 'Entered without zone confirmation' },
  { id: 'PS002', trade_id: 'T010', emotion_before: 'Greed', emotion_after: 'Fear', discipline_score: 3, revenge_trade: false, rule_violation: true, mistake_type: 'Oversized', notes: 'Position too large, broke 1% rule' },
  { id: 'PS003', trade_id: 'T014', emotion_before: 'Greed', emotion_after: 'Anxious', discipline_score: 3, revenge_trade: true, rule_violation: true, mistake_type: 'Revenge Trade', notes: 'Revenge trade after morning loss, emotional' },
  { id: 'PS004', trade_id: 'T001', emotion_before: 'Confident', emotion_after: 'Confident', discipline_score: 9, revenge_trade: false, rule_violation: false, mistake_type: 'No Mistake', notes: 'Clean execution' },
  { id: 'PS005', trade_id: 'T004', emotion_before: 'Confident', emotion_after: 'Confident', discipline_score: 10, revenge_trade: false, rule_violation: false, mistake_type: 'No Mistake', notes: 'Best trade of the month' },
]

// ==================== DEMO PORTFOLIO ====================
export const demoPortfolio: PortfolioItem[] = [
  { id: 'PF001', symbol: 'RELIANCE', quantity: 50, avg_buy_price: 2650, current_price: 2890, sector: 'Energy', investment_thesis: 'Jio platform growth + retail expansion', buy_date: '2025-06-15', target_price: 3200, stop_loss: 2400 },
  { id: 'PF002', symbol: 'TCS', quantity: 30, avg_buy_price: 3500, current_price: 3740, sector: 'IT', investment_thesis: 'AI/ML services growth, strong deal pipeline', buy_date: '2025-08-20', target_price: 4200, stop_loss: 3200 },
  { id: 'PF003', symbol: 'HDFCBANK', quantity: 100, avg_buy_price: 1580, current_price: 1680, sector: 'Banking', investment_thesis: 'Largest private bank, steady compounder', buy_date: '2025-09-10', target_price: 2000, stop_loss: 1400 },
  { id: 'PF004', symbol: 'INFY', quantity: 80, avg_buy_price: 1420, current_price: 1510, sector: 'IT', investment_thesis: 'Digital transformation deals, margin expansion', buy_date: '2025-11-05', target_price: 1800, stop_loss: 1300 },
  { id: 'PF005', symbol: 'BAJFINANCE', quantity: 20, avg_buy_price: 6800, current_price: 7200, sector: 'NBFC', investment_thesis: 'Consumer lending growth, AUM expansion', buy_date: '2026-01-15', target_price: 8500, stop_loss: 6000 },
]

// ==================== DEMO TAX RECORDS ====================
export const demoTaxRecords: TaxRecord[] = [
  { id: 'TX001', trade_id: 'T001', profit_loss: 5500, trade_type: 'F&O', tax_rate: 30, tax_amount: 1650, financial_year: '2025-26', notes: '' },
  { id: 'TX002', trade_id: 'T002', profit_loss: 2550, trade_type: 'F&O', tax_rate: 30, tax_amount: 765, financial_year: '2025-26', notes: '' },
  { id: 'TX003', trade_id: 'T003', profit_loss: -3000, trade_type: 'F&O', tax_rate: 30, tax_amount: 0, financial_year: '2025-26', notes: 'F&O loss' },
  { id: 'TX004', trade_id: 'T004', profit_loss: 5500, trade_type: 'Intraday', tax_rate: 30, tax_amount: 1650, financial_year: '2025-26', notes: '' },
  { id: 'TX005', trade_id: 'T006', profit_loss: 4875, trade_type: 'F&O', tax_rate: 30, tax_amount: 1462.5, financial_year: '2025-26', notes: '' },
]

// ==================== DEMO MILESTONES ====================
export const demoMilestones: Milestone[] = [
  { id: 'M001', title: 'Achieve 60% Win Rate', description: 'Consistently maintain 60%+ win rate over 50 trades', target_date: '2026-06-30', target_value: 60, current_value: 58.33, metric_type: 'Win Rate', status: 'In Progress' },
  { id: 'M002', title: 'Capital ₹10L', description: 'Grow trading capital to ₹10,00,000', target_date: '2026-12-31', target_value: 1000000, current_value: 597025, metric_type: 'Capital', status: 'In Progress' },
  { id: 'M003', title: 'Max Drawdown < 10%', description: 'Keep maximum drawdown below 10% for 3 months', target_date: '2026-06-30', target_value: 10, current_value: 6.2, metric_type: 'Drawdown', status: 'In Progress' },
  { id: 'M004', title: 'Complete 100 Trades', description: 'Execute 100 trades with proper journaling', target_date: '2026-09-30', target_value: 100, current_value: 15, metric_type: 'Custom', status: 'In Progress' },
  { id: 'M005', title: 'Profit Factor > 2', description: 'Achieve and maintain profit factor above 2.0', target_date: '2026-06-30', target_value: 2.0, current_value: 1.85, metric_type: 'Profit Factor', status: 'In Progress' },
]

// ==================== DEMO GROWTH PHASES ====================
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
