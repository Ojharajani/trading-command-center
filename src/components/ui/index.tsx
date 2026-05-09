import * as React from "react"
import { cn } from "@/lib/utils"

// ==================== CARD ====================
export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-xl border border-border bg-card text-card-foreground shadow-sm",
        "transition-all duration-300",
        "dark:bg-card/80 dark:shadow-[0_0_0_1px_rgb(255_255_255/0.02)_inset]",
        className
      )}
      {...props}
    />
  )
}

export function CardHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex flex-col space-y-1.5 p-5 pb-3", className)} {...props} />
}

export function CardTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={cn("text-base font-semibold leading-none tracking-tight", className)} {...props} />
}

export function CardDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn("text-sm text-muted-foreground", className)} {...props} />
}

export function CardContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("p-5 pt-0", className)} {...props} />
}

// ==================== BUTTON ====================
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'secondary' | 'outline' | 'ghost' | 'destructive' | 'success' | 'gradient'
  size?: 'default' | 'sm' | 'lg' | 'icon'
}

export function Button({ className, variant = 'default', size = 'default', ...props }: ButtonProps) {
  const variants = {
    default: 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm hover:shadow-md hover:shadow-primary/20',
    secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
    outline: 'border border-border bg-transparent hover:bg-accent hover:text-accent-foreground hover:border-primary/30',
    ghost: 'hover:bg-accent hover:text-accent-foreground',
    destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90 hover:shadow-md hover:shadow-destructive/20',
    success: 'bg-success text-success-foreground hover:bg-success/90 hover:shadow-md hover:shadow-success/20',
    gradient: 'gradient-primary text-white shadow-md hover:shadow-lg hover:shadow-primary/30 hover:brightness-110',
  }
  const sizes = {
    default: 'h-9 px-4 py-2 text-sm',
    sm: 'h-8 px-3 text-xs',
    lg: 'h-11 px-6 text-base',
    icon: 'h-9 w-9',
  }
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.97]",
        variants[variant], sizes[size], className
      )}
      {...props}
    />
  )
}

// ==================== BADGE ====================
interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'secondary' | 'destructive' | 'success' | 'warning' | 'outline'
}

export function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  const variants = {
    default: 'bg-primary/15 text-primary border-primary/20',
    secondary: 'bg-secondary text-secondary-foreground border-secondary',
    destructive: 'bg-destructive/10 text-destructive border-destructive/20',
    success: 'bg-success/10 text-success border-success/20',
    warning: 'bg-warning/10 text-warning border-warning/20',
    outline: 'bg-transparent text-foreground border-border',
  }
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold tracking-wide transition-colors",
        variants[variant], className
      )}
      {...props}
    />
  )
}

// ==================== INPUT ====================
export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      className={cn(
        "flex h-9 w-full rounded-lg border border-input bg-background/50 px-3 py-1 text-sm shadow-sm transition-all duration-200",
        "placeholder:text-muted-foreground/60",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:border-primary/40",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "dark:bg-[rgb(15_18_30)] dark:focus-visible:shadow-[0_0_0_1px_rgb(99_102_241/0.2),0_0_12px_-3px_rgb(99_102_241/0.15)]",
        className
      )}
      ref={ref}
      {...props}
    />
  )
)
Input.displayName = "Input"

// ==================== TEXTAREA ====================
export const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => (
    <textarea
      className={cn(
        "flex min-h-[80px] w-full rounded-lg border border-input bg-background/50 px-3 py-2 text-sm shadow-sm transition-all duration-200",
        "placeholder:text-muted-foreground/60",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:border-primary/40",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "dark:bg-[rgb(15_18_30)]",
        className
      )}
      ref={ref}
      {...props}
    />
  )
)
Textarea.displayName = "Textarea"

// ==================== LABEL ====================
export function Label({ className, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return <label className={cn("text-sm font-medium leading-none text-muted-foreground", className)} {...props} />
}

// ==================== SELECT ====================
interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  options: { value: string; label: string }[]
  placeholder?: string
}

export function Select({ className, options, placeholder, ...props }: SelectProps) {
  return (
    <select
      className={cn(
        "flex h-9 w-full rounded-lg border border-input bg-background/50 px-3 py-1 text-sm shadow-sm transition-all duration-200",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:border-primary/40",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "dark:bg-[rgb(15_18_30)]",
        className
      )}
      {...props}
    >
      {placeholder && <option value="">{placeholder}</option>}
      {options.map(opt => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
  )
}

// ==================== DIALOG ====================
interface DialogProps {
  open: boolean
  onClose: () => void
  title: string
  description?: string
  children: React.ReactNode
  maxWidth?: string
}

export function Dialog({ open, onClose, title, description, children, maxWidth = 'max-w-lg' }: DialogProps) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className={cn(
        "relative z-50 w-full mx-4 bg-card rounded-2xl border border-border shadow-2xl animate-fade-in-scale max-h-[85vh] overflow-y-auto",
        "dark:bg-card/95 dark:shadow-[0_0_0_1px_rgb(255_255_255/0.03)_inset,0_25px_60px_-12px_rgb(0_0_0/0.5)]",
        maxWidth
      )}>
        <div className="p-6 pb-4 border-b border-border">
          <h2 className="text-lg font-semibold text-foreground">{title}</h2>
          {description && <p className="text-sm text-muted-foreground mt-1">{description}</p>}
        </div>
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  )
}

// ==================== TABLE ====================
export function Table({ className, ...props }: React.HTMLAttributes<HTMLTableElement>) {
  return (
    <div className="w-full overflow-auto">
      <table className={cn("w-full caption-bottom text-sm", className)} {...props} />
    </div>
  )
}

export function TableHeader({ className, ...props }: React.HTMLAttributes<HTMLTableSectionElement>) {
  return <thead className={cn("[&_tr]:border-b", className)} {...props} />
}

export function TableBody({ className, ...props }: React.HTMLAttributes<HTMLTableSectionElement>) {
  return <tbody className={cn("[&_tr:last-child]:border-0", className)} {...props} />
}

export function TableRow({ className, ...props }: React.HTMLAttributes<HTMLTableRowElement>) {
  return (
    <tr
      className={cn(
        "border-b border-border transition-all duration-200 hover:bg-accent/50",
        "dark:hover:bg-primary/[0.03]",
        className
      )}
      {...props}
    />
  )
}

export function TableHead({ className, ...props }: React.ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th
      className={cn(
        "h-10 px-3 text-left align-middle font-semibold text-xs uppercase tracking-wider text-muted-foreground [&:has([role=checkbox])]:pr-0",
        className
      )}
      {...props}
    />
  )
}

export function TableCell({ className, ...props }: React.TdHTMLAttributes<HTMLTableCellElement>) {
  return <td className={cn("p-3 align-middle [&:has([role=checkbox])]:pr-0", className)} {...props} />
}

// ==================== PROGRESS ====================
interface ProgressProps {
  value: number
  max?: number
  className?: string
  indicatorClassName?: string
}

export function Progress({ value, max = 100, className, indicatorClassName }: ProgressProps) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100))
  return (
    <div className={cn("relative h-2 w-full overflow-hidden rounded-full bg-secondary", className)}>
      <div
        className={cn(
          "h-full rounded-full transition-all duration-700 ease-out",
          "bg-gradient-to-r from-primary to-primary/70",
          indicatorClassName
        )}
        style={{ width: `${pct}%` }}
      />
    </div>
  )
}

// ==================== TABS ====================
interface TabsProps {
  tabs: { id: string; label: string }[]
  activeTab: string
  onTabChange: (id: string) => void
  className?: string
}

export function Tabs({ tabs, activeTab, onTabChange, className }: TabsProps) {
  return (
    <div className={cn("flex gap-1 p-1 bg-secondary/50 rounded-xl border border-border/50", className)}>
      {tabs.map(tab => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={cn(
            "px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200",
            activeTab === tab.id
              ? "bg-primary text-primary-foreground shadow-sm shadow-primary/20"
              : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}

// ==================== SKELETON ====================
export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("skeleton", className)} />
}

// ==================== STAT CARD — Premium ====================
interface StatCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon?: React.ReactNode
  trend?: 'up' | 'down' | 'neutral'
  trendValue?: string
  className?: string
  glowColor?: 'green' | 'red' | 'blue' | 'amber' | 'violet'
}

export function StatCard({ title, value, subtitle, icon, trend, trendValue, className, glowColor }: StatCardProps) {
  const glowClasses = {
    green: 'card-glow-green',
    red: 'card-glow-red',
    blue: 'card-glow-blue',
    amber: 'card-glow-amber',
    violet: 'card-glow-violet',
  }

  return (
    <Card className={cn("card-hover overflow-hidden", glowColor && glowClasses[glowColor], className)}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="space-y-1.5 min-w-0">
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">{title}</p>
            <p className="text-xl font-bold text-foreground font-mono tracking-tight truncate">{value}</p>
            {(subtitle || trendValue) && (
              <div className="flex items-center gap-1.5">
                {trendValue && (
                  <span className={cn(
                    "text-[11px] font-semibold",
                    trend === 'up' ? 'text-success' : trend === 'down' ? 'text-destructive' : 'text-muted-foreground'
                  )}>
                    {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→'} {trendValue}
                  </span>
                )}
                {subtitle && <span className="text-[11px] text-muted-foreground">{subtitle}</span>}
              </div>
            )}
          </div>
          {icon && (
            <div className="p-2 rounded-xl bg-primary/10 text-primary flex-shrink-0">
              {icon}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

// ==================== EMPTY STATE ====================
export function EmptyState({ icon, title, description, action }: {
  icon?: React.ReactNode
  title: string
  description?: string
  action?: React.ReactNode
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      {icon && <div className="p-4 rounded-2xl bg-muted/50 mb-4 text-muted-foreground">{icon}</div>}
      <h3 className="text-lg font-semibold text-foreground mb-1">{title}</h3>
      {description && <p className="text-sm text-muted-foreground mb-4 max-w-sm">{description}</p>}
      {action}
    </div>
  )
}
