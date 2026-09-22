'use client'

import React from 'react'
import { Menu, Bell, RefreshCw, Sparkles } from 'lucide-react'

interface HeaderProps {
  onMenuClick: () => void
  onRefresh?: () => void
  isRefreshing?: boolean
  title?: string
}

export const Header: React.FC<HeaderProps> = ({
  onMenuClick,
  onRefresh,
  isRefreshing = false,
  title = 'Overview',
}) => {
  return (
    <header className="sticky top-0 z-30 h-20 bg-[#0A0E17]/85 backdrop-blur-md border-b border-slate-800/80 px-4 sm:px-6 lg:px-8 flex items-center justify-between">
      {/* Left section: mobile hamburger & page title */}
      <div className="flex items-center space-x-3 sm:space-x-4">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-850 transition-colors"
          aria-label="Open sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <div className="flex items-center space-x-2">
            <span className="text-[11px] font-serif uppercase tracking-[0.18em] text-[#D4AF37] font-semibold">
              AURA STUDIO
            </span>
            <span className="text-slate-600 text-xs hidden sm:inline">•</span>
            <span className="text-slate-400 text-xs hidden sm:inline">Internal Operations</span>
          </div>
          <h2 className="text-lg sm:text-xl font-medium text-white tracking-tight flex items-center gap-2">
            <span>{title}</span>
            {title === 'Overview' && (
              <span className="text-[10px] uppercase font-mono tracking-wider px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20">
                Live
              </span>
            )}
          </h2>
        </div>
      </div>

      {/* Right section: Sync/Refresh, Notifications, User profile */}
      <div className="flex items-center space-x-2.5 sm:space-x-4">
        {onRefresh && (
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="p-2 rounded-lg text-slate-400 hover:text-[#D4AF37] hover:bg-slate-800/50 transition-all border border-slate-800/60 disabled:opacity-50"
            title="Sync with Supabase"
            aria-label="Sync with Supabase"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-[#D4AF37]' : ''}`} />
          </button>
        )}

        {/* Notifications */}
        <div className="relative">
          <button
            className="relative p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/50 transition-colors border border-slate-800/60"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#D4AF37] ring-2 ring-[#0A0E17]" />
          </button>
        </div>

        {/* User / Profile */}
        <div className="flex items-center space-x-3 pl-2 sm:pl-3 border-l border-slate-800/70">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-slate-800 to-slate-700 border border-[#D4AF37]/40 flex items-center justify-center text-xs font-semibold text-[#F4E8C1] shadow-xs">
            AS
          </div>
          <div className="hidden md:block text-left">
            <p className="text-xs font-medium text-slate-200 leading-tight">Store Manager</p>
            <p className="text-[10px] text-slate-400 leading-tight flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
              Aura Flagship
            </p>
          </div>
        </div>
      </div>
    </header>
  )
}
