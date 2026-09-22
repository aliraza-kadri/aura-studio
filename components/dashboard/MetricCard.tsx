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
}) => {
  return (
    <div className="rounded-lg bg-[#0F1219] border border-white/10 p-5 transition-colors hover:border-white/20 shadow-xs">
      <div className="flex items-start justify-between">
        <div className="space-y-1.5">
          <p className="text-[11px] font-mono uppercase tracking-wider text-zinc-400">
            {title}
          </p>

          {isLoading ? (
            <div className="h-8 w-24 bg-zinc-800 animate-pulse rounded my-1" />
          ) : (
            <div className="flex items-baseline space-x-2">
              <span className="text-2xl sm:text-3xl font-mono font-bold text-white tracking-tight">
                {value}
              </span>
              {trend && (
                <span className="text-[11px] text-zinc-300 font-mono">
                  {trend}
                </span>
              )}
            </div>
          )}

          <p className="text-xs text-zinc-400 leading-normal">{subtext}</p>
        </div>

        <div className="p-2.5 rounded-md bg-zinc-900 border border-white/10 text-zinc-200 flex items-center justify-center">
          <Icon className="w-4 h-4" />
        </div>
      </div>
    </div>
  )
}
