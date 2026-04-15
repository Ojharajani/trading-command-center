'use client'

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react'
import { Zone, Trade, CapitalLog, RiskSettings, PortfolioItem, TaxRecord, Milestone, GrowthPhase, PsychologyLog } from './types'
import { demoZones, demoTrades, demoCapitalLog, demoRiskSettings, demoPortfolio, demoTaxRecords, demoMilestones, demoGrowthPhases, demoPsychologyLog } from './demo-data'
import { generateId } from './utils'

interface StoreContextType {
  // Data
  zones: Zone[]
  trades: Trade[]
  capitalLog: CapitalLog[]
  riskSettings: RiskSettings
  portfolio: PortfolioItem[]
  taxRecords: TaxRecord[]
  milestones: Milestone[]
  growthPhases: GrowthPhase[]
  psychologyLog: PsychologyLog[]

  // Zone CRUD
  addZone: (zone: Omit<Zone, 'id' | 'created_at'>) => void
  updateZone: (id: string, zone: Partial<Zone>) => void
  deleteZone: (id: string) => void

  // Trade CRUD
  addTrade: (trade: Omit<Trade, 'id' | 'created_at'>) => void
  updateTrade: (id: string, trade: Partial<Trade>) => void
  deleteTrade: (id: string) => void

  // Capital CRUD
  addCapitalEntry: (entry: Omit<CapitalLog, 'id'>) => void
  deleteCapitalEntry: (id: string) => void

  // Risk Settings
  updateRiskSettings: (settings: Partial<RiskSettings>) => void

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

  // Psychology
  addPsychologyLog: (log: Omit<PsychologyLog, 'id'>) => void
}

const StoreContext = createContext<StoreContextType | null>(null)

export function StoreProvider({ children }: { children: ReactNode }) {
  const [zones, setZones] = useState<Zone[]>(demoZones)
  const [trades, setTrades] = useState<Trade[]>(demoTrades)
  const [capitalLog, setCapitalLog] = useState<CapitalLog[]>(demoCapitalLog)
  const [riskSettings, setRiskSettings] = useState<RiskSettings>(demoRiskSettings)
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>(demoPortfolio)
  const [taxRecords, setTaxRecords] = useState<TaxRecord[]>(demoTaxRecords)
  const [milestones, setMilestones] = useState<Milestone[]>(demoMilestones)
  const [growthPhases, setGrowthPhases] = useState<GrowthPhase[]>(demoGrowthPhases)
  const [psychologyLog, setPsychologyLog] = useState<PsychologyLog[]>(demoPsychologyLog)

  // Zone CRUD
  const addZone = useCallback((zone: Omit<Zone, 'id' | 'created_at'>) => {
    setZones(prev => [...prev, { ...zone, id: `Z${generateId()}`, created_at: new Date().toISOString() } as Zone])
  }, [])
  const updateZone = useCallback((id: string, zone: Partial<Zone>) => {
    setZones(prev => prev.map(z => z.id === id ? { ...z, ...zone } : z))
  }, [])
  const deleteZone = useCallback((id: string) => {
    setZones(prev => prev.filter(z => z.id !== id))
  }, [])

  // Trade CRUD
  const addTrade = useCallback((trade: Omit<Trade, 'id' | 'created_at'>) => {
    setTrades(prev => [...prev, { ...trade, id: `T${generateId()}`, created_at: new Date().toISOString() } as Trade])
  }, [])
  const updateTrade = useCallback((id: string, trade: Partial<Trade>) => {
    setTrades(prev => prev.map(t => t.id === id ? { ...t, ...trade } : t))
  }, [])
  const deleteTrade = useCallback((id: string) => {
    setTrades(prev => prev.filter(t => t.id !== id))
  }, [])

  // Capital CRUD
  const addCapitalEntry = useCallback((entry: Omit<CapitalLog, 'id'>) => {
    setCapitalLog(prev => [...prev, { ...entry, id: `C${generateId()}` }])
  }, [])
  const deleteCapitalEntry = useCallback((id: string) => {
    setCapitalLog(prev => prev.filter(c => c.id !== id))
  }, [])

  // Risk Settings
  const updateRiskSettings = useCallback((settings: Partial<RiskSettings>) => {
    setRiskSettings(prev => ({ ...prev, ...settings }))
  }, [])

  // Portfolio CRUD
  const addPortfolioItem = useCallback((item: Omit<PortfolioItem, 'id'>) => {
    setPortfolio(prev => [...prev, { ...item, id: `PF${generateId()}` }])
  }, [])
  const updatePortfolioItem = useCallback((id: string, item: Partial<PortfolioItem>) => {
    setPortfolio(prev => prev.map(p => p.id === id ? { ...p, ...item } : p))
  }, [])
  const deletePortfolioItem = useCallback((id: string) => {
    setPortfolio(prev => prev.filter(p => p.id !== id))
  }, [])

  // Tax Records
  const addTaxRecord = useCallback((record: Omit<TaxRecord, 'id'>) => {
    setTaxRecords(prev => [...prev, { ...record, id: `TX${generateId()}` }])
  }, [])
  const deleteTaxRecord = useCallback((id: string) => {
    setTaxRecords(prev => prev.filter(t => t.id !== id))
  }, [])

  // Milestones
  const addMilestone = useCallback((milestone: Omit<Milestone, 'id'>) => {
    setMilestones(prev => [...prev, { ...milestone, id: `M${generateId()}` }])
  }, [])
  const updateMilestone = useCallback((id: string, milestone: Partial<Milestone>) => {
    setMilestones(prev => prev.map(m => m.id === id ? { ...m, ...milestone } : m))
  }, [])
  const deleteMilestone = useCallback((id: string) => {
    setMilestones(prev => prev.filter(m => m.id !== id))
  }, [])

  // Growth Phases
  const updateGrowthPhase = useCallback((id: string, phase: Partial<GrowthPhase>) => {
    setGrowthPhases(prev => prev.map(g => g.id === id ? { ...g, ...phase } : g))
  }, [])

  // Psychology
  const addPsychologyLog = useCallback((log: Omit<PsychologyLog, 'id'>) => {
    setPsychologyLog(prev => [...prev, { ...log, id: `PS${generateId()}` }])
  }, [])

  return (
    <StoreContext.Provider value={{
      zones, trades, capitalLog, riskSettings, portfolio, taxRecords, milestones, growthPhases, psychologyLog,
      addZone, updateZone, deleteZone,
      addTrade, updateTrade, deleteTrade,
      addCapitalEntry, deleteCapitalEntry,
      updateRiskSettings,
      addPortfolioItem, updatePortfolioItem, deletePortfolioItem,
      addTaxRecord, deleteTaxRecord,
      addMilestone, updateMilestone, deleteMilestone,
      updateGrowthPhase,
      addPsychologyLog,
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
