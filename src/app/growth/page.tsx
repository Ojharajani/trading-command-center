'use client'

import React, { useState } from 'react'
import { useStore } from '@/lib/store'
import { useToast } from '@/components/ui/toast'
import { Card, CardHeader, CardTitle, CardContent, Button, Badge, Input, Label, Select, StatCard, Dialog, Progress } from '@/components/ui'
import { formatCurrency, formatPercent } from '@/lib/utils'
import { GrowthPhase, PhaseStatus, SkillItem } from '@/lib/types'
import { Rocket, TrendingUp, Target, Plus, CheckCircle2, Circle, ArrowRight, Zap, Trophy } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

export default function GrowthPage() {
  const { growthPhases, updateGrowthPhase } = useStore()
  const { toast } = useToast()
  const [selectedPhase, setSelectedPhase] = useState<string | null>(growthPhases.length > 0 ? growthPhases[0].id : null)

  const activePhase = growthPhases.find(p => p.status === 'Active')
  const completedPhases = growthPhases.filter(p => p.status === 'Completed').length
  const totalCapitalGrowth = growthPhases.length > 0
    ? ((growthPhases[growthPhases.length - 1].target_capital - growthPhases[0].starting_capital) / growthPhases[0].starting_capital) * 100
    : 0

  // Capital doubling tracker
  const doublingData = growthPhases.map(phase => ({
    name: phase.phase_name,
    starting: phase.starting_capital,
    target: phase.target_capital,
    current: phase.current_capital,
    progress: phase.target_capital > 0
      ? Math.min(100, ((phase.current_capital - phase.starting_capital) / (phase.target_capital - phase.starting_capital)) * 100)
      : 0,
  }))

  // Monthly target vs actual (derived from growth phases)
  const targetVsActual = growthPhases.map(phase => {
    const monthsTotal = Math.max(1, (new Date(phase.target_date).getTime() - new Date(phase.start_date).getTime()) / (30 * 24 * 60 * 60 * 1000))
    const monthsElapsed = Math.max(0, (Date.now() - new Date(phase.start_date).getTime()) / (30 * 24 * 60 * 60 * 1000))
    const expectedProgress = Math.min(1, monthsElapsed / monthsTotal)
    const expectedCapital = phase.starting_capital + (phase.target_capital - phase.starting_capital) * expectedProgress
    return {
      phase: phase.phase_name,
      target: Math.round(expectedCapital),
      actual: phase.current_capital,
    }
  })

  const handleSkillToggle = (phaseId: string, skillIndex: number) => {
    const phase = growthPhases.find(p => p.id === phaseId)
    if (!phase) return
    const updatedSkills = [...phase.skills_checklist]
    updatedSkills[skillIndex] = { ...updatedSkills[skillIndex], completed: !updatedSkills[skillIndex].completed }
    updateGrowthPhase(phaseId, { skills_checklist: updatedSkills })
    toast(updatedSkills[skillIndex].completed ? 'Skill marked complete!' : 'Skill unmarked', 'success')
  }

  const handleCapitalUpdate = (phaseId: string, capital: number) => {
    updateGrowthPhase(phaseId, { current_capital: capital })
    toast('Capital updated', 'success')
  }

  const handleStatusChange = (phaseId: string, status: PhaseStatus) => {
    updateGrowthPhase(phaseId, { status })
    toast('Phase status updated', 'success')
  }

  const getPhaseProgress = (phase: GrowthPhase) => {
    if (phase.status === 'Completed') return 100
    const range = phase.target_capital - phase.starting_capital
    if (range <= 0) return 0
    return Math.min(100, Math.max(0, ((phase.current_capital - phase.starting_capital) / range) * 100))
  }

  const getStatusColor = (status: PhaseStatus) => {
    switch (status) {
      case 'Completed': return 'success'
      case 'Active': return 'default'
      default: return 'secondary'
    }
  }

  const selected = growthPhases.find(p => p.id === selectedPhase)

  return (
    <div className="space-y-6 animate-fade-in">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          title="Active Phase"
          value={activePhase?.phase_name || 'None'}
          icon={<Rocket className="w-5 h-5 text-primary" />}
        />
        <StatCard
          title="Phases Completed"
          value={`${completedPhases}/${growthPhases.length}`}
          icon={<Trophy className="w-5 h-5 text-success" />}
        />
        <StatCard
          title="Current Capital"
          value={formatCurrency(activePhase?.current_capital || 0)}
          icon={<TrendingUp className="w-5 h-5 text-success" />}
        />
        <StatCard
          title="Total Growth Plan"
          value={formatPercent(totalCapitalGrowth)}
          icon={<Target className="w-5 h-5 text-primary" />}
        />
      </div>

      {/* Phase Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Rocket className="w-5 h-5 text-primary" />
            Growth Phases
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {growthPhases.map((phase, index) => {
              const progress = getPhaseProgress(phase)
              const isSelected = selectedPhase === phase.id
              return (
                <div key={phase.id}>
                  <button
                    onClick={() => setSelectedPhase(phase.id)}
                    className={`w-full text-left p-4 rounded-xl border transition-all duration-200 ${
                      isSelected
                        ? 'border-primary/50 bg-primary/5 shadow-sm'
                        : 'border-border hover:border-primary/30 hover:bg-secondary/30'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                          phase.status === 'Completed'
                            ? 'bg-success/20 text-success'
                            : phase.status === 'Active'
                            ? 'bg-primary/20 text-primary animate-pulse-glow'
                            : 'bg-muted text-muted-foreground'
                        }`}>
                          {index + 1}
                        </div>
                        <div>
                          <h3 className="font-semibold text-foreground">{phase.phase_name}</h3>
                          <p className="text-xs text-muted-foreground">
                            {new Date(phase.start_date).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
                            {' → '}
                            {new Date(phase.target_date).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <p className="text-sm font-mono font-medium">
                            {formatCurrency(phase.current_capital)} / {formatCurrency(phase.target_capital)}
                          </p>
                          <p className="text-xs text-muted-foreground">{progress.toFixed(0)}% complete</p>
                        </div>
                        <Badge variant={getStatusColor(phase.status) as 'success' | 'default' | 'secondary'}>
                          {phase.status}
                        </Badge>
                      </div>
                    </div>
                    <Progress
                      value={progress}
                      indicatorClassName={
                        phase.status === 'Completed' ? 'bg-success' :
                        progress >= 70 ? 'bg-primary' :
                        progress >= 40 ? 'bg-warning' : 'bg-destructive'
                      }
                    />
                  </button>
                  {index < growthPhases.length - 1 && (
                    <div className="flex justify-center py-1">
                      <ArrowRight className="w-4 h-4 text-muted-foreground rotate-90" />
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Capital Doubling Tracker Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-warning" />
              Capital Growth by Phase
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={doublingData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgb(var(--border))" />
                  <XAxis dataKey="name" tick={{ fontSize: 10, fill: 'rgb(var(--muted-foreground))' }} />
                  <YAxis tick={{ fontSize: 11, fill: 'rgb(var(--muted-foreground))' }} />
                  <Tooltip
                    contentStyle={{
                      background: 'rgb(var(--card))',
                      border: '1px solid rgb(var(--border))',
                      borderRadius: '8px',
                      color: 'rgb(var(--foreground))',
                    }}
                    formatter={(v) => [formatCurrency(Number(v))]}
                  />
                  <Bar dataKey="starting" name="Starting" fill="#64748B" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="current" name="Current" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="target" name="Target" fill="#22C55E" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Target vs Actual Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Target vs Actual Capital</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={targetVsActual}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgb(var(--border))" />
                  <XAxis dataKey="phase" tick={{ fontSize: 10, fill: 'rgb(var(--muted-foreground))' }} />
                  <YAxis tick={{ fontSize: 11, fill: 'rgb(var(--muted-foreground))' }} />
                  <Tooltip
                    contentStyle={{
                      background: 'rgb(var(--card))',
                      border: '1px solid rgb(var(--border))',
                      borderRadius: '8px',
                      color: 'rgb(var(--foreground))',
                    }}
                    formatter={(v) => [formatCurrency(Number(v))]}
                  />
                  <Bar dataKey="target" name="Expected" fill="#F97316" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="actual" name="Actual" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Selected Phase Detail & Skills */}
      {selected && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Phase Controls */}
          <Card>
            <CardHeader>
              <CardTitle>{selected.phase_name} — Controls</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label>Update Current Capital (₹)</Label>
                  <div className="flex gap-2 mt-1">
                    <Input
                      type="number"
                      defaultValue={selected.current_capital}
                      onBlur={(e) => handleCapitalUpdate(selected.id, Number(e.target.value))}
                    />
                  </div>
                </div>
                <div>
                  <Label>Phase Status</Label>
                  <Select
                    options={(['Not Started', 'Active', 'Completed'] as PhaseStatus[]).map(s => ({ value: s, label: s }))}
                    value={selected.status}
                    onChange={(e) => handleStatusChange(selected.id, e.target.value as PhaseStatus)}
                    className="mt-1"
                  />
                </div>

                <div className="p-4 rounded-xl bg-secondary/50 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Starting Capital</span>
                    <span className="font-mono">{formatCurrency(selected.starting_capital)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Target Capital</span>
                    <span className="font-mono">{formatCurrency(selected.target_capital)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Growth Required</span>
                    <span className="font-mono font-medium text-primary">
                      {formatPercent(((selected.target_capital - selected.starting_capital) / selected.starting_capital) * 100)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Progress</span>
                    <span className={`font-mono font-medium ${getPhaseProgress(selected) >= 100 ? 'text-success' : 'text-foreground'}`}>
                      {getPhaseProgress(selected).toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Skill Development Checklist */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-success" />
                Skill Development Checklist
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {selected.skills_checklist.map((skill, i) => (
                  <button
                    key={i}
                    onClick={() => handleSkillToggle(selected.id, i)}
                    className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-all duration-200 ${
                      skill.completed
                        ? 'bg-success/10 border border-success/20'
                        : 'bg-secondary/50 border border-transparent hover:border-primary/30'
                    }`}
                  >
                    {skill.completed ? (
                      <CheckCircle2 className="w-5 h-5 text-success flex-shrink-0" />
                    ) : (
                      <Circle className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                    )}
                    <span className={`text-sm ${skill.completed ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                      {skill.name}
                    </span>
                  </button>
                ))}
                {selected.skills_checklist.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">No skills defined for this phase</p>
                )}
                <div className="pt-2">
                  <Progress
                    value={selected.skills_checklist.filter(s => s.completed).length}
                    max={Math.max(1, selected.skills_checklist.length)}
                    indicatorClassName="bg-success"
                  />
                  <p className="text-xs text-muted-foreground mt-1 text-center">
                    {selected.skills_checklist.filter(s => s.completed).length} / {selected.skills_checklist.length} skills completed
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
