import React from 'react'

interface MetricCardProps {
  title: string
  value: number | string
  subtext: string
  icon: React.ComponentType<{ className?: string }>
  isLoading?: boolean
  trend?: string
  accentColor?: 'gold' | 'blue' | 'emerald' | 'amber'
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subtext,
  icon: Icon,
  isLoading = false,
  trend,
  accentColor = 'gold',
}) => {
  const accentStyles = {
    gold: {
      border: 'border-[#D4AF37]/25 hover:border-[#D4AF37]/50',
      glow: 'from-[#D4AF37]/10 to-transparent',
      iconBg: 'bg-[#D4AF37]/10 text-[#D4AF37] ring-[#D4AF37]/20',
      indicator: 'bg-[#D4AF37]',
    },
    blue: {
      border: 'border-blue-500/25 hover:border-blue-500/50',
      glow: 'from-blue-500/10 to-transparent',
      iconBg: 'bg-blue-500/10 text-blue-400 ring-blue-500/20',
      indicator: 'bg-blue-500',
    },
    emerald: {
      border: 'border-emerald-500/25 hover:border-emerald-500/50',
      glow: 'from-emerald-500/10 to-transparent',
      iconBg: 'bg-emerald-500/10 text-emerald-400 ring-emerald-500/20',
      indicator: 'bg-emerald-500',
    },
    amber: {
      border: 'border-amber-500/25 hover:border-amber-500/50',
      glow: 'from-amber-500/10 to-transparent',
      iconBg: 'bg-amber-500/10 text-amber-400 ring-amber-500/20',
      indicator: 'bg-amber-500',
    },
  }[accentColor]

  return (
    <div
      className={`relative overflow-hidden rounded-xl bg-[#0F1420]/80 border ${accentStyles.border} p-5 sm:p-6 transition-all duration-200 hover:shadow-lg hover:shadow-black/40`}
    >
      <div
        className={`absolute inset-0 bg-gradient-to-br ${accentStyles.glow} pointer-events-none opacity-50`}
      />

      <div className="relative z-10 flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-[11px] font-medium uppercase tracking-wider text-slate-400">
            {title}
          </p>

          {isLoading ? (
            <div className="h-8 w-20 bg-slate-800 animate-pulse rounded my-1" />
          ) : (
            <div className="flex items-baseline space-x-2">
              <span className="text-2xl sm:text-3xl font-serif font-bold text-white tracking-tight">
                {value}
              </span>
              {trend && (
                <span className="text-[11px] text-emerald-400 font-medium">
                  {trend}
                </span>
              )}
            </div>
          )}

          <p className="text-xs text-slate-400 leading-normal">{subtext}</p>
        </div>

        <div
          className={`p-3 rounded-lg ring-1 ${accentStyles.iconBg} flex items-center justify-center`}
        >
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  )
}
