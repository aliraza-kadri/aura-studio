import React from 'react'
import { Activity, UserPlus, Clock, MessageSquare, CheckCircle2 } from 'lucide-react'
import { EmptyState } from './EmptyState'

export interface ActivityItem {
  id: string
  type: 'customer' | 'follow_up' | 'appointment' | 'message'
  title: string
  subtitle: string
  timestamp: string
  status?: string
}

interface RecentActivityProps {
  activities: ActivityItem[]
  isLoading?: boolean
}

export const RecentActivity: React.FC<RecentActivityProps> = ({
  activities,
  isLoading = false,
}) => {
  const getIcon = (type: ActivityItem['type']) => {
    switch (type) {
      case 'customer':
        return <UserPlus className="w-4 h-4 text-emerald-400" />
      case 'follow_up':
        return <Clock className="w-4 h-4 text-amber-400" />
      case 'appointment':
        return <CheckCircle2 className="w-4 h-4 text-[#D4AF37]" />
      case 'message':
      default:
        return <MessageSquare className="w-4 h-4 text-blue-400" />
    }
  }

  return (
    <div className="rounded-xl bg-[#0F1420]/80 border border-slate-800/80 p-5 sm:p-6 flex flex-col h-full">
      <div className="flex items-center justify-between pb-4 border-b border-slate-800/60 mb-4">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white tracking-wide">
              Recent Customer Activity
            </h3>
            <p className="text-[11px] text-slate-400">Timeline of client interactions & store events</p>
          </div>
        </div>
        <span className="text-[11px] text-slate-400 font-mono">
          {activities.length} logged
        </span>
      </div>

      <div className="flex-1">
        {isLoading ? (
          <div className="space-y-3 py-2">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-14 rounded-lg bg-slate-800/40 animate-pulse border border-slate-800/40"
              />
            ))}
          </div>
        ) : activities.length === 0 ? (
          <EmptyState
            icon={Activity}
            title="No activity recorded yet"
            description="Client registrations, follow-up notifications, and interactions will be recorded in this timeline."
          />
        ) : (
          <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-px before:bg-slate-800">
            {activities.map((item) => (
              <div key={item.id} className="relative flex items-start space-x-3">
                <div className="absolute -left-6 top-1 p-1 rounded-full bg-[#0F1420] border border-slate-800 ring-4 ring-[#0A0E17]">
                  {getIcon(item.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-medium text-slate-200 truncate">
                      {item.title}
                    </p>
                    <span className="text-[10px] text-slate-400 font-mono shrink-0 ml-2">
                      {new Date(item.timestamp).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5 truncate">
                    {item.subtitle}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
