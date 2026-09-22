'use client'

import React, { useState, useEffect, useCallback } from 'react'
import {
  MessageSquare,
  Users,
  Calendar,
  Clock,
  Shirt,
  AlertTriangle,
  RefreshCw,
  Zap,
  BarChart3,
  Settings,
  Sparkles,
  Inbox,
  ShoppingBag,
} from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import type {
  Customer,
  Product,
  Conversation,
  Appointment,
  FollowUp,
  Automation,
} from '@/types/database'
import { DashboardShell } from '@/components/dashboard/DashboardShell'
import { MetricCard } from '@/components/dashboard/MetricCard'
import { RecentConversations } from '@/components/dashboard/RecentConversations'
import { UpcomingAppointments } from '@/components/dashboard/UpcomingAppointments'
import { RecentActivity, ActivityItem } from '@/components/dashboard/RecentActivity'
import { EmptyState } from '@/components/dashboard/EmptyState'

interface DashboardState {
  customerCount: number
  appointmentCount: number
  pendingFollowUpCount: number
  enquiryCount: number
  recentConversations: Conversation[]
  upcomingAppointments: Appointment[]
  recentActivities: ActivityItem[]
  customers: Customer[]
  products: Product[]
  followUps: FollowUp[]
  automations: Automation[]
  isLoading: boolean
  isRefreshing: boolean
  error: string | null
}

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<string>('Overview')
  const [state, setState] = useState<DashboardState>({
    customerCount: 0,
    appointmentCount: 0,
    pendingFollowUpCount: 0,
    enquiryCount: 0,
    recentConversations: [],
    upcomingAppointments: [],
    recentActivities: [],
    customers: [],
    products: [],
    followUps: [],
    automations: [],
    isLoading: true,
    isRefreshing: false,
    error: null,
  })

  const loadDashboardData = useCallback(async (isRefresh = false) => {
    setState((prev) => ({
      ...prev,
      isLoading: !isRefresh && prev.isLoading,
      isRefreshing: isRefresh,
      error: null,
    }))

    try {
      // 1. Customers query
      const {
        data: customersData,
        count: custCount,
        error: custErr,
      } = await supabase
        .from('customers')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })

      if (custErr) throw custErr

      // 2. Appointments query
      const {
        data: apptsData,
        count: apptCount,
        error: apptErr,
      } = await supabase
        .from('appointments')
        .select('*', { count: 'exact' })
        .order('appointment_date', { ascending: true })

      if (apptErr) throw apptErr

      // 3. Follow-ups query
      const {
        data: followUpsData,
        count: followCount,
        error: followErr,
      } = await supabase
        .from('follow_ups')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })

      if (followErr) throw followErr

      // 4. Conversations query
      const {
        data: convsData,
        count: convCount,
        error: convErr,
      } = await supabase
        .from('conversations')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })

      if (convErr) throw convErr

      // 5. Products query
      const { data: prodsData, error: prodErr } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false })

      if (prodErr) throw prodErr

      // 6. Automations query
      const { data: autoData, error: autoErr } = await supabase
        .from('automations')
        .select('*')
        .order('created_at', { ascending: false })

      if (autoErr) throw autoErr

      const customers = (customersData as Customer[] | null) || []
      const appts = (apptsData as Appointment[] | null) || []
      const followUps = (followUpsData as FollowUp[] | null) || []
      const convs = (convsData as Conversation[] | null) || []
      const prods = (prodsData as Product[] | null) || []
      const autos = (autoData as Automation[] | null) || []

      // Derive pending follow-ups (status != 'completed')
      const pendingCount = followUps.filter(
        (f) => f.status !== 'completed'
      ).length

      // Derive new inquiries (conversations that are new/open/active)
      const newEnquiries = convs.filter(
        (c) => c.status === 'new' || c.status === 'open' || c.status === 'active'
      ).length

      // Build real activity timeline from existing events (if any exist)
      const activities: ActivityItem[] = []

      customers.slice(0, 3).forEach((c) => {
        activities.push({
          id: `cust-${c.id}`,
          type: 'customer',
          title: `New client profile: ${c.name}`,
          subtitle: c.phone || c.email || 'Registered in store database',
          timestamp: c.created_at,
        })
      })

      appts.slice(0, 3).forEach((a) => {
        activities.push({
          id: `appt-${a.id}`,
          type: 'appointment',
          title: `Bespoke Appointment scheduled`,
          subtitle: a.notes || `Status: ${a.status}`,
          timestamp: a.created_at,
        })
      })

      followUps.slice(0, 3).forEach((f) => {
        activities.push({
          id: `follow-${f.id}`,
          type: 'follow_up',
          title: `Follow-up logged`,
          subtitle: f.message || `Status: ${f.status}`,
          timestamp: f.created_at,
        })
      })

      // Sort timeline descending by timestamp
      activities.sort(
        (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      )

      setState({
        customerCount: custCount ?? customers.length,
        appointmentCount: apptCount ?? appts.length,
        pendingFollowUpCount: pendingCount,
        enquiryCount: newEnquiries,
        recentConversations: convs.slice(0, 5),
        upcomingAppointments: appts.slice(0, 5),
        recentActivities: activities.slice(0, 6),
        customers,
        products: prods,
        followUps,
        automations: autos,
        isLoading: false,
        isRefreshing: false,
        error: null,
      })
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to synchronize with Supabase'
      setState((prev) => ({
        ...prev,
        isLoading: false,
        isRefreshing: false,
        error: message,
      }))
    }
  }, [])

  useEffect(() => {
    loadDashboardData()
  }, [loadDashboardData])

  return (
    <DashboardShell
      activeTab={activeTab}
      onTabChange={setActiveTab}
      onRefresh={() => loadDashboardData(true)}
      isRefreshing={state.isRefreshing}
    >
      {/* Error Banner */}
      {state.error && (
        <div className="rounded-xl bg-rose-500/10 border border-rose-500/25 p-4 flex items-start justify-between">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-semibold text-rose-200">
                Supabase Connection Error
              </h4>
              <p className="text-xs text-rose-300/80 mt-1">{state.error}</p>
            </div>
          </div>
          <button
            onClick={() => loadDashboardData(true)}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 text-xs font-medium transition-colors border border-rose-500/30"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Retry</span>
          </button>
        </div>
      )}

      {/* Overview Tab Content */}
      {activeTab === 'Overview' && (
        <div className="space-y-6">
          {/* POS Quick Launch Banner */}
          <div className="p-4 rounded-lg bg-zinc-900 border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-md bg-white text-black flex items-center justify-center shrink-0">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xs font-semibold text-white uppercase tracking-wider">
                  Store POS Terminal
                </h3>
                <p className="text-[11px] text-zinc-400">
                  Ready for sales, walk-in billing, and instant GST tax invoice generation
                </p>
              </div>
            </div>
            <a
              href="/pos"
              className="inline-flex items-center justify-center space-x-2 px-4 py-2 rounded-md bg-white hover:bg-zinc-200 text-black text-xs font-bold uppercase tracking-wider transition-colors shrink-0"
            >
              <span>Launch POS Register</span>
            </a>
          </div>

          {/* Key Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <MetricCard
              title="New Enquiries"
              value={state.enquiryCount}
              subtext={
                state.enquiryCount === 0
                  ? 'No active inquiries pending'
                  : `${state.enquiryCount} awaiting store response`
              }
              icon={MessageSquare}
              isLoading={state.isLoading}
              accentColor="blue"
            />
            <MetricCard
              title="Total Customers"
              value={state.customerCount}
              subtext={
                state.customerCount === 0
                  ? '0 clients in registry'
                  : 'Registered client profiles'
              }
              icon={Users}
              isLoading={state.isLoading}
              accentColor="emerald"
            />
            <MetricCard
              title="Appointments"
              value={state.appointmentCount}
              subtext={
                state.appointmentCount === 0
                  ? '0 scheduled fittings'
                  : 'Total showroom bookings'
              }
              icon={Calendar}
              isLoading={state.isLoading}
              accentColor="gold"
            />
            <MetricCard
              title="Pending Follow-ups"
              value={state.pendingFollowUpCount}
              subtext={
                state.pendingFollowUpCount === 0
                  ? 'No pending client actions'
                  : 'Requires store follow-up'
              }
              icon={Clock}
              isLoading={state.isLoading}
              accentColor="amber"
            />
          </div>

          {/* Section: Main Operations Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <RecentConversations
              conversations={state.recentConversations}
              isLoading={state.isLoading}
            />
            <UpcomingAppointments
              appointments={state.upcomingAppointments}
              isLoading={state.isLoading}
            />
          </div>

          {/* Section: Activity Timeline */}
          <div className="grid grid-cols-1 gap-6">
            <RecentActivity
              activities={state.recentActivities}
              isLoading={state.isLoading}
            />
          </div>
        </div>
      )}

      {/* Conversations Tab */}
      {activeTab === 'Conversations' && (
        <div className="rounded-xl bg-[#0F1420]/80 border border-slate-800/80 p-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800/60 mb-6">
            <div>
              <h3 className="text-base font-semibold text-white">Client Conversations</h3>
              <p className="text-xs text-slate-400">All message threads and inquiries</p>
            </div>
            <span className="text-xs font-mono text-[#D4AF37]">
              {state.recentConversations.length} records
            </span>
          </div>

          {state.isLoading ? (
            <div className="h-32 bg-slate-800/40 animate-pulse rounded-lg" />
          ) : state.recentConversations.length === 0 ? (
            <EmptyState
              icon={MessageSquare}
              title="No conversations in database"
              description="The conversations table is currently empty. Direct client chats and inquiry channels will populate here."
            />
          ) : (
            <div className="divide-y divide-slate-800">
              {state.recentConversations.map((c) => (
                <div key={c.id} className="py-3 flex justify-between items-center text-xs">
                  <div>
                    <p className="font-medium text-slate-200">Conversation #{c.id.slice(0, 8)}</p>
                    <p className="text-slate-400 text-[11px]">Channel: {c.channel || 'Standard'}</p>
                  </div>
                  <span className="text-slate-400 font-mono">{new Date(c.created_at).toLocaleDateString()}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Customers Tab */}
      {activeTab === 'Customers' && (
        <div className="rounded-xl bg-[#0F1420]/80 border border-slate-800/80 p-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800/60 mb-6">
            <div>
              <h3 className="text-base font-semibold text-white">Customer Registry</h3>
              <p className="text-xs text-slate-400">AURA VIP clients & bespoke measurements</p>
            </div>
            <span className="text-xs font-mono text-emerald-400">
              {state.customers.length} registered
            </span>
          </div>

          {state.isLoading ? (
            <div className="h-32 bg-slate-800/40 animate-pulse rounded-lg" />
          ) : state.customers.length === 0 ? (
            <EmptyState
              icon={Users}
              title="No customers in database"
              description="The customers table is currently empty. Client profiles created in store or via inquiries will be displayed here."
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[10px]">
                    <th className="py-2.5 px-3">Name</th>
                    <th className="py-2.5 px-3">Email</th>
                    <th className="py-2.5 px-3">Phone</th>
                    <th className="py-2.5 px-3">Joined</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-850">
                  {state.customers.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-850/40">
                      <td className="py-3 px-3 font-medium text-slate-200">{c.name}</td>
                      <td className="py-3 px-3 text-slate-400">{c.email || '—'}</td>
                      <td className="py-3 px-3 text-slate-400">{c.phone || '—'}</td>
                      <td className="py-3 px-3 text-slate-400 font-mono">
                        {new Date(c.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Products Tab */}
      {activeTab === 'Products' && (
        <div className="rounded-xl bg-[#0F1420]/80 border border-slate-800/80 p-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800/60 mb-6">
            <div>
              <h3 className="text-base font-semibold text-white">Product Catalog</h3>
              <p className="text-xs text-slate-400">Suits, shirts, fabrics, and menswear apparel</p>
            </div>
            <span className="text-xs font-mono text-[#D4AF37]">
              {state.products.length} products
            </span>
          </div>

          {state.isLoading ? (
            <div className="h-32 bg-slate-800/40 animate-pulse rounded-lg" />
          ) : state.products.length === 0 ? (
            <EmptyState
              icon={Shirt}
              title="No products in database"
              description="The products table is currently empty. Menswear apparel, custom suit collections, and inventory will appear here."
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {state.products.map((p) => (
                <div key={p.id} className="p-4 rounded-lg bg-slate-850 border border-slate-800">
                  <h4 className="text-sm font-semibold text-white">{p.name}</h4>
                  <p className="text-xs text-[#D4AF37] mt-1 font-mono">${p.price}</p>
                  <p className="text-[11px] text-slate-400 mt-2">{p.description || 'No description'}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Appointments Tab */}
      {activeTab === 'Appointments' && (
        <div className="rounded-xl bg-[#0F1420]/80 border border-slate-800/80 p-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800/60 mb-6">
            <div>
              <h3 className="text-base font-semibold text-white">Appointments & Showroom Visits</h3>
              <p className="text-xs text-slate-400">Bespoke fittings, measurements, and consultations</p>
            </div>
            <span className="text-xs font-mono text-[#D4AF37]">
              {state.upcomingAppointments.length} bookings
            </span>
          </div>

          {state.isLoading ? (
            <div className="h-32 bg-slate-800/40 animate-pulse rounded-lg" />
          ) : state.upcomingAppointments.length === 0 ? (
            <EmptyState
              icon={Calendar}
              title="No appointments scheduled"
              description="The appointments table is currently empty. Showroom sessions and tailoring consultations will appear here."
            />
          ) : (
            <UpcomingAppointments appointments={state.upcomingAppointments} />
          )}
        </div>
      )}

      {/* Follow-ups Tab */}
      {activeTab === 'Follow-ups' && (
        <div className="rounded-xl bg-[#0F1420]/80 border border-slate-800/80 p-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800/60 mb-6">
            <div>
              <h3 className="text-base font-semibold text-white">Customer Follow-ups</h3>
              <p className="text-xs text-slate-400">Reminders, post-fitting check-ins, and garment pickup alerts</p>
            </div>
            <span className="text-xs font-mono text-amber-400">
              {state.followUps.length} follow-ups
            </span>
          </div>

          {state.isLoading ? (
            <div className="h-32 bg-slate-800/40 animate-pulse rounded-lg" />
          ) : state.followUps.length === 0 ? (
            <EmptyState
              icon={Clock}
              title="No follow-ups pending"
              description="The follow_ups table is currently empty. Automated and staff task reminders will appear here."
            />
          ) : (
            <div className="divide-y divide-slate-800">
              {state.followUps.map((f) => (
                <div key={f.id} className="py-3 flex justify-between items-center text-xs">
                  <div>
                    <p className="font-medium text-slate-200">{f.message || 'Follow-up task'}</p>
                    <p className="text-slate-400 text-[11px]">Scheduled: {f.scheduled_at ? new Date(f.scheduled_at).toLocaleString() : 'Not set'}</p>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] uppercase font-mono bg-slate-800 text-slate-300">
                    {f.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Automations Tab */}
      {activeTab === 'Automations' && (
        <div className="rounded-xl bg-[#0F1420]/80 border border-slate-800/80 p-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800/60 mb-6">
            <div>
              <h3 className="text-base font-semibold text-white">Store Automations</h3>
              <p className="text-xs text-slate-400">Automated triggers and workflow rules</p>
            </div>
            <span className="text-xs font-mono text-purple-400">
              {state.automations.length} workflows
            </span>
          </div>

          {state.isLoading ? (
            <div className="h-32 bg-slate-800/40 animate-pulse rounded-lg" />
          ) : state.automations.length === 0 ? (
            <EmptyState
              icon={Zap}
              title="No automations configured"
              description="The automations table is currently empty. Business rules and trigger workflows will be listed here."
            />
          ) : (
            <div className="divide-y divide-slate-800">
              {state.automations.map((a) => (
                <div key={a.id} className="py-3 flex justify-between items-center text-xs">
                  <div>
                    <p className="font-medium text-slate-200">{a.name}</p>
                    <p className="text-slate-400 text-[11px]">{a.description || 'No description'}</p>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] uppercase font-mono bg-slate-800 text-slate-300">
                    {a.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Analytics Tab */}
      {activeTab === 'Analytics' && (
        <div className="rounded-xl bg-[#0F1420]/80 border border-slate-800/80 p-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800/60 mb-6">
            <div>
              <h3 className="text-base font-semibold text-white">Store Performance & Analytics</h3>
              <p className="text-xs text-slate-400">Operational throughput and client conversion metrics</p>
            </div>
            <BarChart3 className="w-5 h-5 text-[#D4AF37]" />
          </div>

          <EmptyState
            icon={BarChart3}
            title="Analytics in live sync"
            description="Real-time analytics and reporting will aggregate automatically as store operations, customer visits, and transactions accumulate."
          />
        </div>
      )}

      {/* Settings Tab */}
      {activeTab === 'Settings' && (
        <div className="rounded-xl bg-[#0F1420]/80 border border-slate-800/80 p-6 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800/60">
            <div>
              <h3 className="text-base font-semibold text-white">Store Settings</h3>
              <p className="text-xs text-slate-400">AURA STUDIO configuration and data endpoints</p>
            </div>
            <Settings className="w-5 h-5 text-slate-400" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-lg bg-slate-900/60 border border-slate-800 space-y-1.5">
              <p className="text-slate-400 text-[11px]">Brand & Branch</p>
              <p className="text-slate-200 font-medium text-sm">AURA STUDIO Flagship</p>
              <p className="text-slate-400 text-[11px]">Haute Menswear & Bespoke Tailoring</p>
            </div>

            <div className="p-4 rounded-lg bg-slate-900/60 border border-slate-800 space-y-1.5">
              <p className="text-slate-400 text-[11px]">Database Provider</p>
              <p className="text-slate-200 font-medium text-sm flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                Supabase (Cloud)
              </p>
              <p className="text-slate-400 text-[11px] font-mono truncate">
                fqkohlhgsoqzdmbynpte.supabase.co
              </p>
            </div>
          </div>
        </div>
      )}
    </DashboardShell>
  )
}
