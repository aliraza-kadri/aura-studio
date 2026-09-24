'use client'

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Receipt,
  MessageSquare,
  Users,
  Shirt,
  Calendar,
  Clock,
  BarChart3,
  Settings,
  X,
  ShieldCheck,
} from 'lucide-react'

export interface NavItem {
  name: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  badge?: string | number
  highlight?: boolean
}

const navItems: NavItem[] = [
  { name: 'Overview', href: '/', icon: LayoutDashboard },
  { name: 'Billing / POS', href: '/pos', icon: Receipt, highlight: true },
  { name: 'Conversations', href: '/conversations', icon: MessageSquare },
  { name: 'Products & Stock', href: '/products', icon: Shirt },
  { name: 'Customers', href: '/#customers', icon: Users },
  { name: 'Appointments', href: '/#appointments', icon: Calendar },
  { name: 'Follow-ups', href: '/#follow-ups', icon: Clock },
  { name: 'Analytics', href: '/#analytics', icon: BarChart3 },
  { name: 'Store Settings', href: '/#settings', icon: Settings },
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
          className="fixed inset-0 bg-black/80 backdrop-blur-xs z-40 lg:hidden transition-opacity"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-[#090C12] border-r border-white/10 flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Official Brand Header */}
        <div className="h-20 px-6 flex items-center justify-between border-b border-white/10 bg-[#07090E]">
          <Link href="/" className="flex items-center space-x-3.5 group">
            <div className="relative w-9 h-9 rounded-md bg-black border border-white/15 overflow-hidden flex items-center justify-center p-1">
              <Image
                src="/aura-logo.png"
                alt="AURA STUDIO"
                width={36}
                height={36}
                className="object-contain"
                priority
              />
            </div>
            <div>
              <div className="text-white font-sans font-bold tracking-[0.25em] text-xs uppercase">
                AURA STUDIO
              </div>
              <p className="text-[10px] text-zinc-400 font-mono tracking-widest uppercase">
                POS & Client Registry
              </p>
            </div>
          </Link>
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-md text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation List */}
        <div className="flex-1 px-3 py-5 overflow-y-auto space-y-1">
          <div className="px-3 mb-2 text-[10px] font-mono uppercase tracking-widest text-zinc-400">
            Retail Operations
          </div>
          {navItems.map((item) => {
            const Icon = item.icon
            const isCurrentPath =
              (item.href === '/' && pathname === '/') ||
              (item.href === '/pos' && pathname === '/pos') ||
              (item.href === '/products' && pathname === '/products') ||
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
                className={`w-full group flex items-center justify-between px-3.5 py-2.5 rounded-md text-xs font-medium transition-colors ${
                  isCurrentPath
                    ? 'bg-zinc-800/90 text-white border-l-2 border-white font-semibold'
                    : item.highlight
                    ? 'text-zinc-200 hover:text-white hover:bg-zinc-850/80 bg-zinc-900/60 border border-zinc-800/80'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Icon
                    className={`w-4 h-4 transition-colors ${
                      isCurrentPath
                        ? 'text-white'
                        : item.highlight
                        ? 'text-zinc-300'
                        : 'text-zinc-400 group-hover:text-zinc-300'
                    }`}
                  />
                  <span className="tracking-wide">{item.name}</span>
                </div>
                {item.highlight && !isCurrentPath && (
                  <span className="px-1.5 py-0.5 text-[9px] uppercase tracking-wider font-mono rounded bg-white/10 text-zinc-200">
                    POS
                  </span>
                )}
                {item.badge && (
                  <span className="px-1.5 py-0.5 text-[10px] rounded bg-zinc-800 text-zinc-300 font-mono">
                    {item.badge}
                  </span>
                )}
              </Link>
            )
          })}
        </div>

        {/* Store Register Status Bar */}
        <div className="p-4 border-t border-white/10 bg-[#07090E]">
          <div className="p-3 rounded-md bg-zinc-900/90 border border-white/10 flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
              <div>
                <p className="text-[11px] font-semibold text-zinc-200">Register Active</p>
                <p className="text-[10px] text-zinc-400 font-mono">Flagship Store</p>
              </div>
            </div>
            <ShieldCheck className="w-4 h-4 text-zinc-400" />
          </div>
        </div>
      </aside>
    </>
  )
}
