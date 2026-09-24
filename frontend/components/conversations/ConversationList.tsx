'use client'

import React, { useState, useMemo } from 'react'
import { Search, MessageSquare, Clock, Phone, User, CheckCircle2, AlertCircle } from 'lucide-react'
import type { ConversationWithCustomer } from './types'
import { EmptyState } from '@/components/dashboard/EmptyState'

interface ConversationListProps {
  conversations: ConversationWithCustomer[]
  selectedId: string | null
  onSelect: (id: string) => void
  isLoading?: boolean
}

export const ConversationList: React.FC<ConversationListProps> = ({
  conversations,
  selectedId,
  onSelect,
  isLoading = false,
}) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'closed'>('all')

  const filteredConversations = useMemo(() => {
    return conversations.filter((conv) => {
      const customerName = conv.customer?.name || ''
      const customerPhone = conv.customer?.phone || ''
      const matchesSearch =
        customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customerPhone.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (conv.id && conv.id.toLowerCase().includes(searchTerm.toLowerCase()))

      const matchesStatus =
        statusFilter === 'all'
          ? true
          : statusFilter === 'active'
          ? conv.status === 'active' || conv.status === 'open' || conv.status === 'new'
          : conv.status === 'closed' || conv.status === 'resolved'

      return matchesSearch && matchesStatus
    })
  }, [conversations, searchTerm, statusFilter])

  const formatLastMessageTime = (isoString?: string | null) => {
    if (!isoString) return 'No messages yet'
    const date = new Date(isoString)
    if (isNaN(date.getTime())) return isoString

    const now = new Date()
    const isToday =
      date.getDate() === now.getDate() &&
      date.getMonth() === now.getMonth() &&
      date.getFullYear() === now.getFullYear()

    if (isToday) {
      return date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
    }

    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
  }

  const getStatusBadge = (status?: string | null) => {
    const s = (status || 'active').toLowerCase()
    if (s === 'active' || s === 'open' || s === 'new') {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase tracking-wider">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1.5" />
          {status || 'Active'}
        </span>
      )
    }
    if (s === 'closed' || s === 'resolved') {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-800 text-slate-400 uppercase tracking-wider">
          <CheckCircle2 className="w-2.5 h-2.5 mr-1 text-slate-400" />
          {status || 'Closed'}
        </span>
      )
    }
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20 uppercase tracking-wider">
        <AlertCircle className="w-2.5 h-2.5 mr-1" />
        {status}
      </span>
    )
  }

  return (
    <div className="flex flex-col h-full bg-[#0B0F17] border border-slate-800/80 rounded-xl overflow-hidden shadow-xl shadow-black/20">
      {/* Header & Search */}
      <div className="p-4 border-b border-slate-800/80 space-y-3 bg-[#0E131F]/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <h3 className="text-sm font-semibold text-white tracking-wide">Conversations</h3>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-slate-800 text-[#D4AF37] border border-[#D4AF37]/20">
              {conversations.length}
            </span>
          </div>
        </div>

        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search by customer name or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-900/90 border border-slate-800 rounded-lg text-xs text-slate-200 placeholder-slate-400 focus:outline-hidden focus:border-[#D4AF37]/50 focus:ring-1 focus:ring-[#D4AF37]/25 transition-all"
          />
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center space-x-1.5 pt-1">
          {(['all', 'active', 'closed'] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setStatusFilter(filter)}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium capitalize transition-colors ${
                statusFilter === filter
                  ? 'bg-[#D4AF37]/15 text-[#F4E8C1] border border-[#D4AF37]/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* List content */}
      <div className="flex-1 overflow-y-auto divide-y divide-slate-850/60">
        {isLoading ? (
          <div className="p-4 space-y-3">
            {[1, 2, 3, 4].map((n) => (
              <div
                key={n}
                className="p-3.5 rounded-lg bg-slate-850/40 border border-slate-800/40 animate-pulse space-y-2.5"
              >
                <div className="flex justify-between items-center">
                  <div className="h-3.5 w-28 bg-slate-800 rounded" />
                  <div className="h-3 w-12 bg-slate-800 rounded" />
                </div>
                <div className="h-3 w-36 bg-slate-800/60 rounded" />
              </div>
            ))}
          </div>
        ) : filteredConversations.length === 0 ? (
          <div className="p-6">
            <EmptyState
              icon={MessageSquare}
              title={
                searchTerm || statusFilter !== 'all'
                  ? 'No matching conversations'
                  : 'No conversations found'
              }
              description={
                searchTerm || statusFilter !== 'all'
                  ? 'Try clearing the search query or status filter to see other conversations.'
                  : 'The conversations table in Supabase contains 0 records. New client inquiries will appear here automatically.'
              }
            />
          </div>
        ) : (
          filteredConversations.map((conv) => {
            const isSelected = selectedId === conv.id
            const customerName =
              conv.customer?.name || (conv.customer_id ? `Client #${conv.customer_id.slice(0, 8)}` : 'Guest Client')
            const customerPhone = conv.customer?.phone || 'No phone on file'
            const lastTime = formatLastMessageTime(conv.last_message_at || conv.created_at)

            return (
              <button
                key={conv.id}
                onClick={() => onSelect(conv.id)}
                className={`w-full text-left p-4 transition-all duration-150 relative ${
                  isSelected
                    ? 'bg-gradient-to-r from-[#D4AF37]/10 to-transparent border-l-3 border-[#D4AF37]'
                    : 'hover:bg-slate-850/50'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  {/* Customer initials & details */}
                  <div className="flex items-start space-x-3 min-w-0">
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 text-xs font-semibold ${
                        isSelected
                          ? 'bg-[#D4AF37] text-slate-950 shadow-md shadow-[#D4AF37]/20 font-serif'
                          : 'bg-slate-800 text-slate-300 border border-slate-750'
                      }`}
                    >
                      {customerName.charAt(0).toUpperCase()}
                    </div>

                    <div className="min-w-0 space-y-1">
                      <div className="flex items-center space-x-2">
                        <p className="text-xs font-semibold text-slate-100 truncate">
                          {customerName}
                        </p>
                      </div>

                      <div className="flex items-center space-x-1 text-[11px] text-slate-400">
                        <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                        <span className="truncate font-mono">{customerPhone}</span>
                      </div>

                      {conv.channel && (
                        <span className="inline-block px-1.5 py-0.2 rounded text-[9px] font-mono uppercase bg-slate-800/80 text-slate-300 border border-slate-750">
                          {conv.channel}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Time and Status Badge */}
                  <div className="flex flex-col items-end space-y-1.5 shrink-0">
                    <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                      <Clock className="w-2.5 h-2.5" />
                      {lastTime}
                    </span>
                    {getStatusBadge(conv.status)}
                  </div>
                </div>
              </button>
            )
          })
        )}
      </div>
    </div>
  )
}
