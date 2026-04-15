'use client'

import React, { useState } from 'react'
import { useStore } from '@/lib/store'
import { useToast } from '@/components/ui/toast'
import { Card, CardHeader, CardTitle, CardContent, Button, Badge, Input, Label, Select, StatCard, Dialog, Progress } from '@/components/ui'
import { formatCurrency, formatPercent } from '@/lib/utils'
import { Milestone, MilestoneStatus, MetricType } from '@/lib/types'
import { Flag, Plus, Edit2, Trash2, CheckCircle2, Clock, Target } from 'lucide-react'

export default function ProgressPage() {
  const { milestones, addMilestone, updateMilestone, deleteMilestone } = useStore()
  const { toast } = useToast()
  const [showDialog, setShowDialog] = useState(false)
  const [editingItem, setEditingItem] = useState<Milestone | null>(null)
  const [form, setForm] = useState<Partial<Milestone>>({
    title: '', description: '', target_date: '', target_value: 0, current_value: 0, metric_type: 'Custom', status: 'Pending',
  })

  const completed = milestones.filter(m => m.status === 'Completed').length
  const inProgress = milestones.filter(m => m.status === 'In Progress').length
  const pending = milestones.filter(m => m.status === 'Pending').length

  const openAdd = () => { setEditingItem(null); setForm({ title: '', description: '', target_date: '', target_value: 0, current_value: 0, metric_type: 'Custom', status: 'Pending' }); setShowDialog(true) }
  const openEdit = (m: Milestone) => { setEditingItem(m); setForm({ ...m }); setShowDialog(true) }

  const handleSave = () => {
    if (editingItem) {
      updateMilestone(editingItem.id, form)
      toast('Milestone updated', 'success')
    } else {
      addMilestone(form as Omit<Milestone, 'id'>)
      toast('Milestone added', 'success')
    }
    setShowDialog(false)
  }

  const getProgressPercent = (m: Milestone) => {
    if (m.status === 'Completed') return 100
    if (m.target_value === 0) return 0
    if (m.metric_type === 'Drawdown') return Math.max(0, 100 - ((m.current_value / m.target_value) * 100))
    return Math.min(100, (m.current_value / m.target_value) * 100)
  }

  const getStatusIcon = (status: MilestoneStatus) => {
    switch (status) {
      case 'Completed': return <CheckCircle2 className="w-5 h-5 text-success" />
      case 'In Progress': return <Clock className="w-5 h-5 text-primary" />
      default: return <Target className="w-5 h-5 text-muted-foreground" />
    }
  }

  const formatValue = (m: Milestone) => {
    if (m.metric_type === 'Capital') return formatCurrency(m.current_value)
    if (m.metric_type === 'Win Rate' || m.metric_type === 'Drawdown') return `${m.current_value.toFixed(1)}%`
    return m.current_value.toString()
  }

  const formatTarget = (m: Milestone) => {
    if (m.metric_type === 'Capital') return formatCurrency(m.target_value)
    if (m.metric_type === 'Win Rate' || m.metric_type === 'Drawdown') return `${m.target_value}%`
    return m.target_value.toString()
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid grid-cols-3 gap-4">
        <StatCard title="Completed" value={completed} icon={<CheckCircle2 className="w-5 h-5 text-success" />} />
        <StatCard title="In Progress" value={inProgress} icon={<Clock className="w-5 h-5 text-primary" />} />
        <StatCard title="Pending" value={pending} icon={<Target className="w-5 h-5 text-muted-foreground" />} />
      </div>

      <div className="flex justify-end">
        <Button size="sm" onClick={openAdd}><Plus className="w-4 h-4 mr-1" /> Add Milestone</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {milestones.map(milestone => {
          const progress = getProgressPercent(milestone)
          return (
            <Card key={milestone.id} className="card-hover">
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(milestone.status)}
                    <div>
                      <h3 className="font-semibold text-foreground">{milestone.title}</h3>
                      <p className="text-xs text-muted-foreground">{milestone.description}</p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(milestone)}><Edit2 className="w-4 h-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => { deleteMilestone(milestone.id); toast('Deleted', 'info') }}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-medium">{formatValue(milestone)} / {formatTarget(milestone)}</span>
                  </div>
                  <Progress
                    value={progress}
                    indicatorClassName={progress >= 100 ? 'bg-success' : progress >= 70 ? 'bg-primary' : progress >= 40 ? 'bg-warning' : 'bg-destructive'}
                  />
                  <div className="flex justify-between items-center">
                    <Badge variant={milestone.status === 'Completed' ? 'success' : milestone.status === 'In Progress' ? 'default' : 'secondary'}>
                      {milestone.status}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      Target: {new Date(milestone.target_date).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Dialog open={showDialog} onClose={() => setShowDialog(false)} title={editingItem ? 'Edit Milestone' : 'Add Milestone'}>
        <div className="space-y-4">
          <div><Label>Title</Label><Input value={form.title || ''} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} /></div>
          <div><Label>Description</Label><Input value={form.description || ''} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} /></div>
          <div><Label>Metric Type</Label><Select options={(['Win Rate', 'Capital', 'Drawdown', 'Profit Factor', 'Custom'] as MetricType[]).map(t => ({ value: t, label: t }))} value={form.metric_type} onChange={e => setForm(f => ({ ...f, metric_type: e.target.value as MetricType }))} /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><Label>Target Value</Label><Input type="number" value={form.target_value || ''} onChange={e => setForm(f => ({ ...f, target_value: Number(e.target.value) }))} /></div>
            <div><Label>Current Value</Label><Input type="number" value={form.current_value || ''} onChange={e => setForm(f => ({ ...f, current_value: Number(e.target.value) }))} /></div>
          </div>
          <div><Label>Target Date</Label><Input type="date" value={form.target_date || ''} onChange={e => setForm(f => ({ ...f, target_date: e.target.value }))} /></div>
          <div><Label>Status</Label><Select options={(['Pending', 'In Progress', 'Completed'] as MilestoneStatus[]).map(t => ({ value: t, label: t }))} value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value as MilestoneStatus }))} /></div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowDialog(false)}>Cancel</Button>
            <Button onClick={handleSave}>{editingItem ? 'Update' : 'Add'}</Button>
          </div>
        </div>
      </Dialog>
    </div>
  )
}
