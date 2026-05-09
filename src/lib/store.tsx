'use client'

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react'
import { Zone, Trade, Account, CapitalLog, PortfolioItem, TaxRecord, Milestone, GrowthPhase, TradeExitData } from './types'
import { demoZones, demoTrades, demoAccounts, demoCapitalLog, demoPortfolio, demoTaxRecords, demoMilestones, demoGrowthPhases } from './demo-data'
import { generateZoneId, generateTradeId, generateId } from './utils'
import { calculateFinalCompositeScore, deriveZoneGrade, calculateTRIDENT, calculateMtfStackCount, calculateZoneMid, calculateZoneWidthPct } from './calculations'

interface StoreContextType {
  // Data
  accounts: Account[]
  zones: Zone[]
  trades: Trade[]
  capitalLog: CapitalLog[]
  portfolio: PortfolioItem[]
  taxRecords: TaxRecord[]
  milestones: Milestone[]
  growthPhases: GrowthPhase[]

  // Account CRUD
  addAccount: (account: Omit<Account, 'account_id' | 'created_at'>) => void
  updateAccount: (id: string, data: Partial<Account>) => void
  updateAccountBalance: (id: string, delta: number) => void

  // Zone CRUD
  addZone: (zone: Omit<Zone, 'zone_id' | 'created_at' | 'updated_at'>) => void
  updateZone: (id: string, zone: Partial<Zone>) => void
  deleteZone: (id: string) => void

  // Trade CRUD
  addTrade: (trade: Omit<Trade, 'trade_id' | 'created_at' | 'updated_at'>) => void
  updateTrade: (id: string, trade: Partial<Trade>) => void
  deleteTrade: (id: string) => void
  closeTrade: (trade_id: string, exitData: TradeExitData) => void

  // Zone Bank auto-population helper
  getZoneBankFields: (zoneId: string) => Partial<Trade> | null

  // Zone performance update (feedback loop)
  updateZonePerformance: (zoneId: string) => void

  // Capital CRUD
  addCapitalEntry: (entry: Omit<CapitalLog, 'id'>) => void
  deleteCapitalEntry: (id: string) => void

  // Portfolio CRUD
  addPortfolioItem: (item: Omit<PortfolioItem, 'id'>) => void
  updatePortfolioItem: (id: string, item: Partial<PortfolioItem>) => void
  deletePortfolioItem: (id: string) => void

  // Tax Records
  addTaxRecord: (record: Omit<TaxRecord, 'id'>) => void
  deleteTaxRecord: (id: string) => void

  // Milestones CRUD
  addMilestone: (milestone: Omit<Milestone, 'id'>) => void
  updateMilestone: (id: string, milestone: Partial<Milestone>) => void
  deleteMilestone: (id: string) => void

  // Growth Phases
  updateGrowthPhase: (id: string, phase: Partial<GrowthPhase>) => void
}

const StoreContext = createContext<StoreContextType | null>(null)

export function StoreProvider({ children }: { children: ReactNode }) {
  const [accounts, setAccounts] = useState<Account[]>(demoAccounts)
  const [zones, setZones] = useState<Zone[]>(demoZones)
  const [trades, setTrades] = useState<Trade[]>(demoTrades)
  const [capitalLog, setCapitalLog] = useState<CapitalLog[]>(demoCapitalLog)
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>(demoPortfolio)
  const [taxRecords, setTaxRecords] = useState<TaxRecord[]>(demoTaxRecords)
  const [milestones, setMilestones] = useState<Milestone[]>(demoMilestones)
  const [growthPhases, setGrowthPhases] = useState<GrowthPhase[]>(demoGrowthPhases)

  // ── Account CRUD ──────────────────────────────
  const addAccount = useCallback((account: Omit<Account, 'account_id' | 'created_at'>) => {
    const newId = `ACC-${String(accounts.length + 1).padStart(2, '0')}`
    setAccounts(prev => [...prev, { ...account, account_id: newId, created_at: new Date().toISOString() } as Account])
  }, [accounts.length])

  const updateAccount = useCallback((id: string, data: Partial<Account>) => {
    setAccounts(prev => prev.map(a => a.account_id === id ? { ...a, ...data } : a))
  }, [])

  const updateAccountBalance = useCallback((id: string, delta: number) => {
    setAccounts(prev => prev.map(a =>
      a.account_id === id ? { ...a, current_balance: a.current_balance + delta } : a
    ))
  }, [])

  // ── Zone CRUD ─────────────────────────────────
  const addZone = useCallback((zone: Omit<Zone, 'zone_id' | 'created_at' | 'updated_at'>) => {
    const now = new Date().toISOString()
    // Auto-compute derived fields
    const mtfStackCount = calculateMtfStackCount(zone)
    const trident = calculateTRIDENT(zone)
    const zoneWithComputed = {
      ...zone,
      mtf_stack_count: mtfStackCount,
      trident_horizontal_score: trident.horizontal,
      trident_vertical_up_score: trident.verticalUp,
      trident_vertical_down_score: trident.verticalDown,
      trident_combined_score: trident.combined,
    }
    const finalScore = calculateFinalCompositeScore(zoneWithComputed)
    const grade = deriveZoneGrade(finalScore)
    const mid = calculateZoneMid(zone.zone_high, zone.zone_low)
    const widthPct = calculateZoneWidthPct(zone.zone_high, zone.zone_low)

    setZones(prev => [...prev, {
      ...zoneWithComputed,
      zone_id: generateZoneId(),
      zone_mid: mid,
      zone_width_pct: widthPct,
      final_composite_score: finalScore,
      zone_grade: grade,
      created_at: now,
      updated_at: now,
    } as Zone])
  }, [])

  const updateZone = useCallback((id: string, zone: Partial<Zone>) => {
    setZones(prev => prev.map(z => {
      if (z.zone_id !== id) return z
      const updated = { ...z, ...zone, updated_at: new Date().toISOString() }
      // Recompute derived fields
      const mtfStackCount = calculateMtfStackCount(updated)
      const trident = calculateTRIDENT(updated)
      updated.mtf_stack_count = mtfStackCount
      updated.trident_horizontal_score = trident.horizontal
      updated.trident_vertical_up_score = trident.verticalUp
      updated.trident_vertical_down_score = trident.verticalDown
      updated.trident_combined_score = trident.combined
      updated.final_composite_score = calculateFinalCompositeScore(updated)
      updated.zone_grade = deriveZoneGrade(updated.final_composite_score)
      if (updated.zone_high && updated.zone_low) {
        updated.zone_mid = calculateZoneMid(updated.zone_high, updated.zone_low)
        updated.zone_width_pct = calculateZoneWidthPct(updated.zone_high, updated.zone_low)
      }
      return updated
    }))
  }, [])

  const deleteZone = useCallback((id: string) => {
    // RESTRICT: cannot delete zone that has trades
    const hasLinkedTrades = trades.some(t => t.zone_bank_id === id)
    if (hasLinkedTrades) {
      console.warn('Cannot delete zone with linked trades (ON DELETE RESTRICT)')
      return
    }
    setZones(prev => prev.filter(z => z.zone_id !== id))
  }, [trades])

  // ── Zone Bank auto-population (Section B) ─────
  const getZoneBankFields = useCallback((zoneId: string): Partial<Trade> | null => {
    const zone = zones.find(z => z.zone_id === zoneId)
    if (!zone) return null
    return {
      b_instrument: zone.instrument,
      b_asset_class: zone.asset_class,
      b_zone_type: zone.zone_type,
      b_trade_bias: zone.trade_bias,
      b_timeframe: zone.timeframe,
      b_zone_high: zone.zone_high,
      b_zone_low: zone.zone_low,
      b_zone_mid: zone.zone_mid,
      b_zone_grade: zone.zone_grade,
      b_total_zone_score: zone.final_composite_score,
      b_freshness_at_entry: zone.freshness,
      b_test_count_at_entry: zone.test_count,
      b_lifecycle_stage: zone.lifecycle_stage,
      b_heatmap_level: zone.heatmap_level,
      b_mtf_stack_count: zone.mtf_stack_count,
      b_curve_position: zone.curve_position || undefined,
      b_entry_model: zone.entry_model || undefined,
      b_volatility_state: zone.volatility_state,
      b_premium_discount: zone.premium_discount || undefined,
      b_setup_type: zone.setup_type || undefined,
      b_zone_structure_score: zone.zone_structure_score,
      b_liquidity_score: zone.liquidity_score,
      b_indicator_confluence_score: zone.indicator_confluence_score,
      b_trident_combined_score: zone.trident_combined_score,
    }
  }, [zones])

  // ── Trade CRUD ────────────────────────────────
  const addTrade = useCallback((trade: Omit<Trade, 'trade_id' | 'created_at' | 'updated_at'>) => {
    // Core Rule 1 & 2: zone_bank_id and account_id are mandatory
    if (!trade.zone_bank_id) throw new Error('zone_bank_id is mandatory (Core Rule 1)')
    if (!trade.account_id) throw new Error('account_id is mandatory (Core Rule 2)')

    const now = new Date().toISOString()
    setTrades(prev => [...prev, {
      ...trade,
      trade_id: generateTradeId(),
      created_at: now,
      updated_at: now,
    } as Trade])
  }, [])

  const updateTrade = useCallback((id: string, trade: Partial<Trade>) => {
    setTrades(prev => prev.map(t =>
      t.trade_id === id ? { ...t, ...trade, updated_at: new Date().toISOString() } : t
    ))
  }, [])

  const deleteTrade = useCallback((id: string) => {
    setTrades(prev => prev.filter(t => t.trade_id !== id))
  }, [])

  // ── Close Trade (with balance update & zone feedback) ──
  const closeTrade = useCallback((trade_id: string, exitData: TradeExitData) => {
    setTrades(prev => prev.map(t => {
      if (t.trade_id !== trade_id) return t
      const runningBalance = t.d_balance_before + exitData.e_net_pnl
      return {
        ...t,
        ...exitData,
        e_running_balance: runningBalance,
        updated_at: new Date().toISOString(),
      }
    }))

    // Update account balance
    const trade = trades.find(t => t.trade_id === trade_id)
    if (trade) {
      updateAccountBalance(trade.account_id, exitData.e_net_pnl)
    }
  }, [trades, updateAccountBalance])

  // ── Zone Performance Update (feedback loop) ──
  const updateZonePerformance = useCallback((zoneId: string) => {
    const linkedTrades = trades.filter(t => t.zone_bank_id === zoneId && t.e_result)
    if (linkedTrades.length === 0) return

    const winCount = linkedTrades.filter(t => t.e_result === 'Win').length
    const tradeCount = linkedTrades.length
    const avgRR = linkedTrades.reduce((s, t) => s + (t.e_r_multiple || 0), 0) / tradeCount
    const tradesWithCap = linkedTrades.filter(t => t.i_capture_efficiency_pct !== undefined)
    const avgCapture = tradesWithCap.length > 0
      ? tradesWithCap.reduce((s, t) => s + (t.i_capture_efficiency_pct || 0), 0) / tradesWithCap.length : 0
    const tradesWithAvail = linkedTrades.filter(t => t.i_available_move_r !== undefined)
    const avgAvail = tradesWithAvail.length > 0
      ? tradesWithAvail.reduce((s, t) => s + (t.i_available_move_r || 0), 0) / tradesWithAvail.length : 0
    const tradesWithLeft = linkedTrades.filter(t => t.i_left_on_table_r !== undefined)
    const avgLeft = tradesWithLeft.length > 0
      ? tradesWithLeft.reduce((s, t) => s + (t.i_left_on_table_r || 0), 0) / tradesWithLeft.length : 0
    const tradesWithAcc = linkedTrades.filter(t => t.i_estimation_accuracy_pct !== undefined)
    const avgAccuracy = tradesWithAcc.length > 0
      ? tradesWithAcc.reduce((s, t) => s + (t.i_estimation_accuracy_pct || 0), 0) / tradesWithAcc.length : 0

    let freshness: 'Fresh' | 'Tested' | 'Stale' = 'Fresh'
    if (tradeCount >= 3) freshness = 'Stale'
    else if (tradeCount >= 1) freshness = 'Tested'

    setZones(prev => prev.map(z => {
      if (z.zone_id !== zoneId) return z
      return {
        ...z,
        zone_win_rate: Math.round((winCount / tradeCount) * 100 * 10) / 10,
        linked_trade_count: tradeCount,
        avg_actual_rr_delivered: Math.round(avgRR * 100) / 100,
        avg_capture_efficiency_pct: Math.round(avgCapture * 10) / 10,
        avg_available_move_r: Math.round(avgAvail * 100) / 100,
        avg_left_on_table_r: Math.round(avgLeft * 100) / 100,
        zone_estimation_accuracy_pct: Math.round(avgAccuracy * 10) / 10,
        test_count: tradeCount,
        freshness,
        updated_at: new Date().toISOString(),
      }
    }))
  }, [trades])

  // ── Capital CRUD ──────────────────────────────
  const addCapitalEntry = useCallback((entry: Omit<CapitalLog, 'id'>) => {
    setCapitalLog(prev => [...prev, { ...entry, id: `C${generateId()}` }])
  }, [])
  const deleteCapitalEntry = useCallback((id: string) => {
    setCapitalLog(prev => prev.filter(c => c.id !== id))
  }, [])

  // ── Portfolio CRUD ────────────────────────────
  const addPortfolioItem = useCallback((item: Omit<PortfolioItem, 'id'>) => {
    setPortfolio(prev => [...prev, { ...item, id: `PF${generateId()}` }])
  }, [])
  const updatePortfolioItem = useCallback((id: string, item: Partial<PortfolioItem>) => {
    setPortfolio(prev => prev.map(p => p.id === id ? { ...p, ...item } : p))
  }, [])
  const deletePortfolioItem = useCallback((id: string) => {
    setPortfolio(prev => prev.filter(p => p.id !== id))
  }, [])

  // ── Tax Records ───────────────────────────────
  const addTaxRecord = useCallback((record: Omit<TaxRecord, 'id'>) => {
    setTaxRecords(prev => [...prev, { ...record, id: `TX${generateId()}` }])
  }, [])
  const deleteTaxRecord = useCallback((id: string) => {
    setTaxRecords(prev => prev.filter(t => t.id !== id))
  }, [])

  // ── Milestones ────────────────────────────────
  const addMilestone = useCallback((milestone: Omit<Milestone, 'id'>) => {
    setMilestones(prev => [...prev, { ...milestone, id: `M${generateId()}` }])
  }, [])
  const updateMilestone = useCallback((id: string, milestone: Partial<Milestone>) => {
    setMilestones(prev => prev.map(m => m.id === id ? { ...m, ...milestone } : m))
  }, [])
  const deleteMilestone = useCallback((id: string) => {
    setMilestones(prev => prev.filter(m => m.id !== id))
  }, [])

  // ── Growth Phases ─────────────────────────────
  const updateGrowthPhase = useCallback((id: string, phase: Partial<GrowthPhase>) => {
    setGrowthPhases(prev => prev.map(g => g.id === id ? { ...g, ...phase } : g))
  }, [])

  return (
    <StoreContext.Provider value={{
      accounts, zones, trades, capitalLog, portfolio, taxRecords, milestones, growthPhases,
      addAccount, updateAccount, updateAccountBalance,
      addZone, updateZone, deleteZone,
      addTrade, updateTrade, deleteTrade, closeTrade,
      getZoneBankFields, updateZonePerformance,
      addCapitalEntry, deleteCapitalEntry,
      addPortfolioItem, updatePortfolioItem, deletePortfolioItem,
      addTaxRecord, deleteTaxRecord,
      addMilestone, updateMilestone, deleteMilestone,
      updateGrowthPhase,
    }}>
      {children}
    </StoreContext.Provider>
  )
}

export function useStore() {
  const context = useContext(StoreContext)
  if (!context) throw new Error('useStore must be used within StoreProvider')
  return context
}
