import React from 'react'
import { MessageSquare, Clock, ArrowRight } from 'lucide-react'
import type { Conversation, Customer } from '@/types/database'
import { EmptyState } from './EmptyState'

interface ConversationWithCustomer extends Conversation {
  customer?: Customer | null
}

interface RecentConversationsProps {
  conversations: ConversationWithCustomer[]
  isLoading?: boolean
}

export const RecentConversations: React.FC<RecentConversationsProps> = ({
  conversations,
  isLoading = false,
}) => {
  return (
    <div className="rounded-xl bg-[#0F1420]/80 border border-slate-800/80 p-5 sm:p-6 flex flex-col h-full">
      <div className="flex items-center justify-between pb-4 border-b border-slate-800/60 mb-4">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <MessageSquare className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white tracking-wide">
              Recent Conversations
            </h3>
            <p className="text-[11px] text-slate-400">Customer communications</p>
          </div>
        </div>
        <span className="text-[11px] text-slate-400 font-mono">
          {conversations.length} total
        </span>
      </div>

      <div className="flex-1">
        {isLoading ? (
          <div className="space-y-3 py-2">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-16 rounded-lg bg-slate-800/40 animate-pulse border border-slate-800/40"
              />
            ))}
          </div>
        ) : conversations.length === 0 ? (
          <EmptyState
            icon={MessageSquare}
            title="No conversations yet"
            description="Incoming inquiries and customer chats will sync and show here in real-time."
          />
        ) : (
          <div className="divide-y divide-slate-850">
            {conversations.map((conv) => (
              <div
                key={conv.id}
                className="py-3.5 flex items-center justify-between hover:bg-slate-850/40 px-2 rounded-lg transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <p className="text-xs font-medium text-slate-200">
                      {conv.customer?.name || (conv.customer_id ? `Client #${conv.customer_id.slice(0, 8)}` : 'Guest Inquirer')}
                    </p>
                    {conv.channel && (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-300">
                        {conv.channel}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center space-x-2 text-[11px] text-slate-400">
                    <Clock className="w-3 h-3" />
                    <span>
                      {conv.last_message_at
                        ? new Date(conv.last_message_at).toLocaleDateString()
                        : new Date(conv.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-medium uppercase tracking-wider ${
                      conv.status === 'active' || conv.status === 'open'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {conv.status || 'open'}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
