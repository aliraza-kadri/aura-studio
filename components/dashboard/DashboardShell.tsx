'use client'

import React, { useState } from 'react'
import { Sidebar } from './Sidebar'
import { Header } from './Header'

interface DashboardShellProps {
  children: React.ReactNode
  activeTab?: string
  onTabChange?: (tab: string) => void
  onRefresh?: () => void
  isRefreshing?: boolean
}

export const DashboardShell: React.FC<DashboardShellProps> = ({
  children,
  activeTab = 'Overview',
  onTabChange,
  onRefresh,
  isRefreshing = false,
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-[#070A10] text-slate-100 flex">
      {/* Persistent Left Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        activeTab={activeTab}
        onTabChange={onTabChange}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-72 transition-all">
        <Header
          onMenuClick={() => setSidebarOpen(true)}
          onRefresh={onRefresh}
          isRefreshing={isRefreshing}
          title={activeTab}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
          {children}
        </main>
      </div>
    </div>
  )
}
