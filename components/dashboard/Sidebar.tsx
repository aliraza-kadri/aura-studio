'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  MessageSquare,
  Users,
  Shirt,
  Calendar,
  Clock,
  BarChart3,
  Zap,
  Settings,
  X,
  Sparkles,
} from 'lucide-react'

export interface NavItem {
  name: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  badge?: string | number
}

const navItems: NavItem[] = [
  { name: 'Overview', href: '/', icon: LayoutDashboard },
  { name: 'Conversations', href: '/conversations', icon: MessageSquare },
  { name: 'Customers', href: '/#customers', icon: Users },
  { name: 'Products', href: '/#products', icon: Shirt },
  { name: 'Appointments', href: '/#appointments', icon: Calendar },
  { name: 'Follow-ups', href: '/#follow-ups', icon: Clock },
  { name: 'Analytics', href: '/#analytics', icon: BarChart3 },
  { name: 'Automations', href: '/#automations', icon: Zap },
  { name: 'Settings', href: '/#settings', icon: Settings },
]

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
  activeTab?: string
  onTabChange?: (tab: string) => void
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  activeTab,
  onTabChange,
}) => {
  const pathname = usePathname()

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-xs z-40 lg:hidden transition-opacity"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-[#0A0E17] border-r border-slate-800/80 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="h-20 px-6 flex items-center justify-between border-b border-slate-800/60">
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#D4AF37] to-[#8C6D1F] flex items-center justify-center shadow-lg shadow-[#D4AF37]/10 ring-1 ring-[#D4AF37]/30 transition-transform group-hover:scale-105">
              <span className="text-slate-950 font-serif font-bold text-lg tracking-wider">A</span>
            </div>
            <div>
              <h1 className="text-white font-serif tracking-[0.2em] text-sm font-semibold uppercase">
                AURA STUDIO
              </h1>
              <p className="text-[10px] text-[#D4AF37] tracking-widest uppercase font-medium">
                Luxury Menswear
              </p>
            </div>
          </Link>
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <div className="flex-1 px-3 py-6 overflow-y-auto space-y-1">
          <div className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
            Store Operations
          </div>
          {navItems.map((item) => {
            const Icon = item.icon
            const isCurrentPath =
              (item.href === '/' && pathname === '/') ||
              (item.href === '/conversations' && pathname === '/conversations') ||
              activeTab === item.name

            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => {
                  if (onTabChange) onTabChange(item.name)
                  if (typeof window !== 'undefined' && window.innerWidth < 1024) onClose()
                }}
                className={`w-full group flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-medium transition-all duration-150 ${
                  isCurrentPath
                    ? 'bg-gradient-to-r from-[#D4AF37]/15 to-transparent text-[#F4E8C1] border-l-2 border-[#D4AF37]'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Icon
                    className={`w-4 h-4 transition-colors ${
                      isCurrentPath ? 'text-[#D4AF37]' : 'text-slate-400 group-hover:text-slate-300'
                    }`}
                  />
                  <span className="tracking-wide">{item.name}</span>
                </div>
                {item.badge && (
                  <span className="px-1.5 py-0.5 text-[10px] rounded bg-slate-800 text-slate-300 font-mono">
                    {item.badge}
                  </span>
                )}
              </Link>
            )
          })}
        </div>

        {/* Footer info: Supabase & Store sync status */}
        <div className="p-4 border-t border-slate-800/60 bg-[#080B12]">
          <div className="p-3 rounded-lg bg-slate-900/70 border border-slate-800 flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </div>
              <div>
                <p className="text-[11px] font-medium text-slate-200">Supabase Connected</p>
                <p className="text-[9px] text-slate-400">Live Database Sync</p>
              </div>
            </div>
            <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
          </div>
        </div>
      </aside>
    </>
  )
}
