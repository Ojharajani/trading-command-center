-- =============================================
-- Trading Command Center — Full Database Schema
-- Run this in Supabase SQL Editor
-- =============================================

-- 1. ZONES TABLE
CREATE TABLE IF NOT EXISTS zones (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  symbol TEXT NOT NULL,
  zone_type TEXT NOT NULL CHECK (zone_type IN ('Demand', 'Supply')),
  zone_subtype TEXT NOT NULL,
  timeframe TEXT NOT NULL,
  zone_high NUMERIC NOT NULL DEFAULT 0,
  zone_low NUMERIC NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'Fresh' CHECK (status IN ('Fresh', 'Tested', 'Broken', 'Void')),
  quality_score INTEGER NOT NULL DEFAULT 0,
  trap_risk TEXT NOT NULL DEFAULT 'Low' CHECK (trap_risk IN ('Low', 'Medium', 'High')),
  test_count INTEGER NOT NULL DEFAULT 0,
  notes TEXT DEFAULT '',
  strong_departure BOOLEAN DEFAULT false,
  low_base_candles BOOLEAN DEFAULT false,
  freshness BOOLEAN DEFAULT true,
  liquidity_sweep BOOLEAN DEFAULT false,
  htf_alignment BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. TRADES TABLE
CREATE TABLE IF NOT EXISTS trades (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  date_time TIMESTAMPTZ NOT NULL DEFAULT now(),
  symbol TEXT NOT NULL,
  direction TEXT NOT NULL CHECK (direction IN ('Long', 'Short')),
  setup TEXT DEFAULT '',
  zone_id UUID REFERENCES zones(id) ON DELETE SET NULL,
  entry_price NUMERIC NOT NULL DEFAULT 0,
  stop_loss NUMERIC NOT NULL DEFAULT 0,
  target_price NUMERIC NOT NULL DEFAULT 0,
  exit_price NUMERIC NOT NULL DEFAULT 0,
  position_size NUMERIC NOT NULL DEFAULT 0,
  risk_percent NUMERIC NOT NULL DEFAULT 1,
  rr_ratio NUMERIC NOT NULL DEFAULT 0,
  pnl NUMERIC NOT NULL DEFAULT 0,
  result TEXT NOT NULL DEFAULT 'Breakeven' CHECK (result IN ('Win', 'Loss', 'Breakeven')),
  timeframe TEXT NOT NULL DEFAULT 'Daily',
  emotion_before TEXT DEFAULT 'Neutral',
  emotion_after TEXT DEFAULT 'Neutral',
  confidence INTEGER DEFAULT 7,
  discipline_score INTEGER DEFAULT 7,
  mistake_type TEXT DEFAULT 'No Mistake',
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. RISK SETTINGS TABLE
CREATE TABLE IF NOT EXISTS risk_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  max_risk_per_trade NUMERIC NOT NULL DEFAULT 1,
  max_daily_loss NUMERIC NOT NULL DEFAULT 3,
  max_weekly_loss NUMERIC NOT NULL DEFAULT 7,
  max_drawdown NUMERIC NOT NULL DEFAULT 15,
  max_positions INTEGER NOT NULL DEFAULT 3
);

-- 4. CAPITAL LOG TABLE
CREATE TABLE IF NOT EXISTS capital_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  capital_amount NUMERIC NOT NULL DEFAULT 0,
  deposits NUMERIC NOT NULL DEFAULT 0,
  withdrawals NUMERIC NOT NULL DEFAULT 0,
  notes TEXT DEFAULT ''
);

-- 5. PSYCHOLOGY LOG TABLE
CREATE TABLE IF NOT EXISTS psychology_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  trade_id UUID REFERENCES trades(id) ON DELETE CASCADE,
  emotion_before TEXT DEFAULT 'Neutral',
  emotion_after TEXT DEFAULT 'Neutral',
  discipline_score INTEGER DEFAULT 7,
  revenge_trade BOOLEAN DEFAULT false,
  rule_violation BOOLEAN DEFAULT false,
  mistake_type TEXT DEFAULT 'No Mistake',
  notes TEXT DEFAULT ''
);

-- 6. PORTFOLIO TABLE
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

-- 7. TAX RECORDS TABLE
CREATE TABLE IF NOT EXISTS tax_records (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  trade_id UUID REFERENCES trades(id) ON DELETE SET NULL,
  profit_loss NUMERIC NOT NULL DEFAULT 0,
  trade_type TEXT NOT NULL DEFAULT 'F&O' CHECK (trade_type IN ('Intraday', 'STCG', 'LTCG', 'F&O')),
  tax_rate NUMERIC NOT NULL DEFAULT 30,
  tax_amount NUMERIC NOT NULL DEFAULT 0,
  financial_year TEXT NOT NULL DEFAULT '2025-26',
  notes TEXT DEFAULT ''
);

-- 8. MILESTONES TABLE
CREATE TABLE IF NOT EXISTS milestones (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  target_date DATE,
  target_value NUMERIC NOT NULL DEFAULT 0,
  current_value NUMERIC NOT NULL DEFAULT 0,
  metric_type TEXT NOT NULL DEFAULT 'Custom',
  status TEXT NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'In Progress', 'Completed'))
);

-- 9. GROWTH PHASES TABLE
CREATE TABLE IF NOT EXISTS growth_phases (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  phase_name TEXT NOT NULL,
  starting_capital NUMERIC NOT NULL DEFAULT 0,
  target_capital NUMERIC NOT NULL DEFAULT 0,
  current_capital NUMERIC NOT NULL DEFAULT 0,
  start_date DATE,
  target_date DATE,
  status TEXT NOT NULL DEFAULT 'Not Started' CHECK (status IN ('Not Started', 'Active', 'Completed')),
  skills_checklist JSONB DEFAULT '[]'::jsonb
);

-- =============================================
-- INDEXES for performance
-- =============================================
CREATE INDEX IF NOT EXISTS idx_zones_user ON zones(user_id);
CREATE INDEX IF NOT EXISTS idx_zones_symbol ON zones(symbol);
CREATE INDEX IF NOT EXISTS idx_trades_user ON trades(user_id);
CREATE INDEX IF NOT EXISTS idx_trades_date ON trades(date_time);
CREATE INDEX IF NOT EXISTS idx_trades_symbol ON trades(symbol);
CREATE INDEX IF NOT EXISTS idx_capital_log_user ON capital_log(user_id);
CREATE INDEX IF NOT EXISTS idx_capital_log_date ON capital_log(date);
CREATE INDEX IF NOT EXISTS idx_portfolio_user ON portfolio(user_id);
CREATE INDEX IF NOT EXISTS idx_tax_records_user ON tax_records(user_id);
CREATE INDEX IF NOT EXISTS idx_milestones_user ON milestones(user_id);
CREATE INDEX IF NOT EXISTS idx_growth_phases_user ON growth_phases(user_id);
CREATE INDEX IF NOT EXISTS idx_psychology_log_user ON psychology_log(user_id);

-- =============================================
-- ROW LEVEL SECURITY (RLS) policies
-- Users can only access their own data
-- =============================================

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

-- Risk Settings
ALTER TABLE risk_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own risk settings" ON risk_settings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own risk settings" ON risk_settings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own risk settings" ON risk_settings FOR UPDATE USING (auth.uid() = user_id);

-- Capital Log
ALTER TABLE capital_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own capital log" ON capital_log FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own capital log" ON capital_log FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own capital log" ON capital_log FOR DELETE USING (auth.uid() = user_id);

-- Psychology Log
ALTER TABLE psychology_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own psychology log" ON psychology_log FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own psychology log" ON psychology_log FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Portfolio
ALTER TABLE portfolio ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own portfolio" ON portfolio FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own portfolio" ON portfolio FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own portfolio" ON portfolio FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own portfolio" ON portfolio FOR DELETE USING (auth.uid() = user_id);

-- Tax Records
ALTER TABLE tax_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own tax records" ON tax_records FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own tax records" ON tax_records FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own tax records" ON tax_records FOR DELETE USING (auth.uid() = user_id);

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

-- =============================================
-- FUNCTION: Auto-create risk settings for new users
-- =============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.risk_settings (user_id, max_risk_per_trade, max_daily_loss, max_weekly_loss, max_drawdown, max_positions)
  VALUES (NEW.id, 1, 3, 7, 15, 3);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger: Create risk settings when a new user signs up
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
