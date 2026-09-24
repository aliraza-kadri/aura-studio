'use client'

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Menu, Bell, RefreshCw, ShoppingCart } from 'lucide-react'

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
    <header className="sticky top-0 z-30 h-18 bg-[#090C12]/95 backdrop-blur-md border-b border-white/10 px-4 sm:px-6 lg:px-8 flex items-center justify-between">
      {/* Left: Mobile hamburger & breadcrumb */}
      <div className="flex items-center space-x-3 sm:space-x-4">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-md text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          aria-label="Open sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-3">
          <div className="lg:hidden relative w-7 h-7 rounded bg-black border border-white/15 overflow-hidden flex items-center justify-center p-0.5">
            <Image
              src="/aura-logo.png"
              alt="AURA STUDIO"
              width={28}
              height={28}
              className="object-contain"
            />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-mono tracking-widest text-zinc-400 uppercase">
                AURA STUDIO
              </span>
              <span className="text-zinc-700 text-xs">•</span>
              <span className="text-zinc-400 text-xs">Flagship Register</span>
            </div>
            <h2 className="text-base sm:text-lg font-semibold text-white tracking-tight">
              {title}
            </h2>
          </div>
        </div>
      </div>

      {/* Right: POS Quick Action, Sync, Notifications, Profile */}
      <div className="flex items-center space-x-2.5 sm:space-x-3">
        {/* Quick Launch POS Button */}
        <Link
          href="/pos"
          className="hidden sm:inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-md bg-white hover:bg-zinc-200 text-black text-xs font-semibold tracking-wide transition-colors shadow-xs"
        >
          <ShoppingCart className="w-3.5 h-3.5" />
          <span>New Sale / POS</span>
        </Link>

        {onRefresh && (
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="p-2 rounded-md text-zinc-400 hover:text-white hover:bg-zinc-850 transition-colors border border-zinc-800 disabled:opacity-50"
            title="Sync Database"
            aria-label="Sync Database"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-white' : ''}`} />
          </button>
        )}

        {/* Notifications */}
        <button
          className="relative p-2 rounded-md text-zinc-400 hover:text-white hover:bg-zinc-850 transition-colors border border-zinc-800"
          aria-label="Notifications"
        >
          <Bell className="w-3.5 h-3.5" />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-white ring-2 ring-[#090C12]" />
        </button>

        {/* User profile */}
        <div className="flex items-center space-x-2.5 pl-2 sm:pl-3 border-l border-white/10">
          <div className="w-8 h-8 rounded-md bg-zinc-900 border border-white/15 flex items-center justify-center text-xs font-bold text-white">
            AS
          </div>
          <div className="hidden md:block text-left">
            <p className="text-xs font-medium text-white leading-tight">Floor Manager</p>
            <p className="text-[10px] text-zinc-400 font-mono leading-tight">Pos Terminal #01</p>
          </div>
        </div>
      </div>
    </header>
  )
}
