'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { AlertTriangle, RefreshCw, MessageSquare } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import type { Conversation, Customer, Message } from '@/types/database'
import type { ConversationWithCustomer } from '@/components/conversations/types'
import { DashboardShell } from '@/components/dashboard/DashboardShell'
import { ConversationList } from '@/components/conversations/ConversationList'
import { ConversationDetail } from '@/components/conversations/ConversationDetail'

export default function ConversationsPage() {
  const [conversations, setConversations] = useState<ConversationWithCustomer[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoadingConversations, setIsLoadingConversations] = useState(true)
  const [isLoadingMessages, setIsLoadingMessages] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showMobileDetail, setShowMobileDetail] = useState(false)

  // Fetch conversations and match with customers
  const fetchConversations = useCallback(async (isRefresh = false) => {
    if (!isRefresh) setIsLoadingConversations(true)
    setIsRefreshing(isRefresh)
    setError(null)

    try {
      // 1. Fetch conversations from Supabase
      const { data: convData, error: convErr } = await supabase
        .from('conversations')
        .select('*')
        .order('created_at', { ascending: false })

      if (convErr) throw convErr

      // 2. Fetch customers to link customer name, phone, etc.
      const { data: custData, error: custErr } = await supabase
        .from('customers')
        .select('*')

      if (custErr) throw custErr

      const customersList = (custData as Customer[] | null) || []
      const customerMap = new Map<string, Customer>()
      customersList.forEach((c) => customerMap.set(c.id, c))

      const rawConversations = (convData as Conversation[] | null) || []
      const enriched: ConversationWithCustomer[] = rawConversations.map((c) => ({
        ...c,
        customer: c.customer_id ? customerMap.get(c.customer_id) || null : null,
      }))

      setConversations(enriched)

      // Auto-select first conversation if none selected yet
      if (enriched.length > 0) {
        setSelectedId((prev) => (prev ? prev : enriched[0].id))
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to fetch conversations from Supabase'
      setError(msg)
    } finally {
      setIsLoadingConversations(false)
      setIsRefreshing(false)
    }
  }, [])

  // Fetch messages for selected conversation
  const fetchMessages = useCallback(async (convId: string) => {
    setIsLoadingMessages(true)
    try {
      const { data: msgData, error: msgErr } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', convId)
        .order('created_at', { ascending: true })

      if (msgErr) throw msgErr

      setMessages((msgData as Message[] | null) || [])
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to load messages from Supabase'
      console.error('Error loading messages:', msg)
    } finally {
      setIsLoadingMessages(false)
    }
  }, [])

  useEffect(() => {
    fetchConversations()
  }, [fetchConversations])

  useEffect(() => {
    if (selectedId) {
      fetchMessages(selectedId)
    } else {
      setMessages([])
    }
  }, [selectedId, fetchMessages])

  const handleSelectConversation = (id: string) => {
    setSelectedId(id)
    setShowMobileDetail(true)
  }

  const selectedConversation = conversations.find((c) => c.id === selectedId) || null

  return (
    <DashboardShell
      activeTab="Conversations"
      onRefresh={() => {
        fetchConversations(true)
        if (selectedId) fetchMessages(selectedId)
      }}
      isRefreshing={isRefreshing}
    >
      {/* Error alert if Supabase connection fails */}
      {error && (
        <div className="rounded-xl bg-rose-500/10 border border-rose-500/25 p-4 flex items-start justify-between">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-semibold text-rose-200">Database Fetch Error</h4>
              <p className="text-xs text-rose-300/80 mt-1">{error}</p>
            </div>
          </div>
          <button
            onClick={() => fetchConversations(true)}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 text-xs font-medium transition-colors border border-rose-500/30"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Retry</span>
          </button>
        </div>
      )}

      {/* Main Conversations Layout: Master-Detail */}
      <div className="h-[calc(100vh-9.5rem)] min-h-[550px] grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Conversation List (hidden on mobile if detail view is active) */}
        <div
          className={`h-full lg:col-span-5 xl:col-span-4 ${
            showMobileDetail ? 'hidden lg:block' : 'block'
          }`}
        >
          <ConversationList
            conversations={conversations}
            selectedId={selectedId}
            onSelect={handleSelectConversation}
            isLoading={isLoadingConversations}
          />
        </div>

        {/* Right: Message Detail (hidden on mobile if list view is active) */}
        <div
          className={`h-full lg:col-span-7 xl:col-span-8 ${
            !showMobileDetail ? 'hidden lg:block' : 'block'
          }`}
        >
          <ConversationDetail
            conversation={selectedConversation}
            messages={messages}
            isLoadingMessages={isLoadingMessages}
            onBack={() => setShowMobileDetail(false)}
          />
        </div>
      </div>
    </DashboardShell>
  )
}
