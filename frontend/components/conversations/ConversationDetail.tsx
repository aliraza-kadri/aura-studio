'use client'

import React from 'react'
import {
  MessageSquare,
  ArrowLeft,
  User,
  Sparkles,
  Phone,
  Mail,
  Clock,
  Shield,
  Tag,
  Calendar,
} from 'lucide-react'
import type { ConversationWithCustomer, Message } from './types'
import { EmptyState } from '@/components/dashboard/EmptyState'

interface ConversationDetailProps {
  conversation: ConversationWithCustomer | null
  messages: Message[]
  isLoadingMessages: boolean
  onBack?: () => void
}

export const ConversationDetail: React.FC<ConversationDetailProps> = ({
  conversation,
  messages,
  isLoadingMessages,
  onBack,
}) => {
  if (!conversation) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-[#0B0F17] border border-slate-800/80 rounded-xl p-8 text-center shadow-xl shadow-black/20">
        <div className="w-14 h-14 rounded-2xl bg-slate-850/80 border border-slate-800 flex items-center justify-center text-slate-400 mb-4 shadow-inner">
          <MessageSquare className="w-7 h-7 text-[#D4AF37]/60" />
        </div>
        <h3 className="text-base font-serif font-semibold text-slate-200 tracking-wide">
          Select a Conversation
        </h3>
        <p className="text-xs text-slate-400 max-w-sm mt-1.5 leading-relaxed">
          Choose a client conversation from the list to view real-time chat history and inquiry details from Supabase.
        </p>
      </div>
    )
  }

  const customer = conversation.customer
  const customerName =
    customer?.name || (conversation.customer_id ? `Client #${conversation.customer_id.slice(0, 8)}` : 'Guest Client')
  const customerPhone = customer?.phone || 'No phone registered'
  const customerEmail = customer?.email || 'No email on file'

  const isCustomerMessage = (sender: string) => {
    const s = sender?.toLowerCase().trim()
    return s === 'customer' || s === 'user' || s === 'client' || s === 'inbound'
  }

  const formatMessageTime = (isoString: string) => {
    const d = new Date(isoString)
    if (isNaN(d.getTime())) return isoString
    return d.toLocaleTimeString(undefined, {
      hour: '2-digit',
      minute: '2-digit',
      month: 'short',
      day: 'numeric',
    })
  }

  return (
    <div className="flex flex-col h-full bg-[#0B0F17] border border-slate-800/80 rounded-xl overflow-hidden shadow-xl shadow-black/20">
      {/* Header with Customer Information */}
      <div className="p-4 sm:p-5 border-b border-slate-800/80 bg-[#0E131F]/70 flex items-center justify-between">
        <div className="flex items-center space-x-3 sm:space-x-4 min-w-0">
          {onBack && (
            <button
              onClick={onBack}
              className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              aria-label="Back to conversations list"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}

          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#D4AF37] to-[#997C22] flex items-center justify-center font-serif text-sm font-bold text-slate-950 shrink-0 shadow-md shadow-[#D4AF37]/20 ring-1 ring-[#D4AF37]/40">
            {customerName.charAt(0).toUpperCase()}
          </div>

          <div className="min-w-0">
            <div className="flex items-center space-x-2">
              <h3 className="text-sm sm:text-base font-semibold text-white truncate">
                {customerName}
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wider font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
                {conversation.status || 'active'}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-400 mt-0.5">
              <span className="flex items-center gap-1 font-mono text-[11px]">
                <Phone className="w-3 h-3 text-[#D4AF37]" />
                {customerPhone}
              </span>
              {customer?.email && (
                <span className="hidden sm:flex items-center gap-1 text-[11px] text-slate-400 truncate">
                  <Mail className="w-3 h-3 text-slate-400" />
                  {customerEmail}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right side metadata */}
        <div className="hidden sm:flex flex-col items-end space-y-1">
          {conversation.channel && (
            <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-slate-800 text-slate-300 border border-slate-700">
              Channel: {conversation.channel}
            </span>
          )}
          <span className="text-[10px] text-slate-400 font-mono">
            ID: {conversation.id.slice(0, 8)}
          </span>
        </div>
      </div>

      {/* Messages View Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-[#080B12]/60">
        {isLoadingMessages ? (
          <div className="space-y-4 py-4">
            <div className="flex justify-start">
              <div className="w-2/3 h-16 rounded-2xl bg-slate-850/60 animate-pulse border border-slate-800/40" />
            </div>
            <div className="flex justify-end">
              <div className="w-2/3 h-20 rounded-2xl bg-slate-850/80 animate-pulse border border-[#D4AF37]/20" />
            </div>
            <div className="flex justify-start">
              <div className="w-1/2 h-14 rounded-2xl bg-slate-850/60 animate-pulse border border-slate-800/40" />
            </div>
          </div>
        ) : messages.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <EmptyState
              icon={MessageSquare}
              title="No messages in this conversation"
              description="The messages table contains no records linked to this conversation ID yet."
            />
          </div>
        ) : (
          messages.map((msg) => {
            const isClient = isCustomerMessage(msg.sender)

            return (
              <div
                key={msg.id}
                className={`flex w-full ${isClient ? 'justify-start' : 'justify-end'}`}
              >
                <div
                  className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 transition-all ${
                    isClient
                      ? 'bg-[#151C2A] border border-slate-750 text-slate-100 rounded-tl-xs shadow-md shadow-black/20'
                      : 'bg-gradient-to-br from-[#0F1E36] to-[#0A1628] border border-[#D4AF37]/35 text-[#F8F9FA] rounded-tr-xs shadow-lg shadow-black/30'
                  }`}
                >
                  {/* Sender identifier & badge */}
                  <div className="flex items-center justify-between gap-3 mb-1.5 pb-1 border-b border-white/5">
                    <div className="flex items-center space-x-1.5">
                      {isClient ? (
                        <>
                          <User className="w-3 h-3 text-slate-400" />
                          <span className="text-[11px] font-semibold text-slate-300">
                            {customerName}
                          </span>
                          <span className="text-[9px] uppercase tracking-wider px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 font-mono">
                            Customer
                          </span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-3 h-3 text-[#D4AF37]" />
                          <span className="text-[11px] font-semibold text-[#F4E8C1]">
                            AURA Studio
                          </span>
                          <span className="text-[9px] uppercase tracking-wider px-1.5 py-0.2 rounded bg-[#D4AF37]/15 text-[#D4AF37] font-mono border border-[#D4AF37]/30">
                            Business / AI
                          </span>
                        </>
                      )}
                    </div>

                    <span className="text-[10px] text-slate-400 font-mono">
                      {formatMessageTime(msg.created_at)}
                    </span>
                  </div>

                  {/* Message Content */}
                  <p className="text-xs sm:text-sm leading-relaxed whitespace-pre-wrap break-words">
                    {msg.message}
                  </p>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Footer / Read-Only Context Banner */}
      <div className="p-3 border-t border-slate-800/80 bg-[#0E131F]/90 flex items-center justify-between text-[11px] text-slate-400">
        <div className="flex items-center space-x-2">
          <Shield className="w-3.5 h-3.5 text-[#D4AF37]" />
          <span>Real-time Supabase connection active</span>
        </div>
        <span className="font-mono text-[10px]">
          {messages.length} message{messages.length === 1 ? '' : 's'} recorded
        </span>
      </div>
    </div>
  )
}
