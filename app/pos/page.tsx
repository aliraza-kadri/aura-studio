'use client'

import React, { useState, useEffect, useCallback } from 'react'
import {
  ShoppingCart,
  Receipt,
  History,
  AlertTriangle,
  RefreshCw,
  PlusCircle,
} from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import type { Product, Customer, Invoice, InvoiceItem } from '@/types/database'
import type { CartItem, POSCustomer, CompletedInvoice } from '@/components/pos/types'
import { DashboardShell } from '@/components/dashboard/DashboardShell'
import { ProductCatalog } from '@/components/pos/ProductCatalog'
import { ActiveCart } from '@/components/pos/ActiveCart'
import { InvoicePrintModal } from '@/components/pos/InvoicePrintModal'
import { InvoiceHistory } from '@/components/pos/InvoiceHistory'

export default function POSPage() {
  const [activeView, setActiveView] = useState<'register' | 'history'>('register')
  const [products, setProducts] = useState<Product[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [cart, setCart] = useState<CartItem[]>([])
  const [customer, setCustomer] = useState<POSCustomer>({
    id: null,
    name: 'Walk-in Customer',
    phone: null,
    email: null,
  })
  const [invoices, setInvoices] = useState<CompletedInvoice[]>([])
  const [activePrintInvoice, setActivePrintInvoice] = useState<CompletedInvoice | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fetch products and customers from Supabase
  const loadPOSData = useCallback(async (isRefresh = false) => {
    if (!isRefresh) setIsLoading(true)
    setError(null)

    try {
      // 1. Fetch products
      const { data: prodsData, error: prodErr } = await supabase
        .from('products')
        .select('*')
        .order('name', { ascending: true })

      if (prodErr) throw prodErr

      // 2. Fetch customers
      const { data: custsData, error: custErr } = await supabase
        .from('customers')
        .select('*')
        .order('name', { ascending: true })

      if (custErr) throw custErr

      setProducts((prodsData as Product[] | null) || [])
      setCustomers((custsData as Customer[] | null) || [])

      // 3. Try fetching past invoices if table exists
      try {
        const { data: invData } = await supabase
          .from('invoices')
          .select('*, items:invoice_items(*)')
          .order('created_at', { ascending: false })

        if (invData && Array.isArray(invData)) {
          const formatted: CompletedInvoice[] = invData.map((inv: any) => ({
            ...inv,
            items: inv.items || [],
          }))
          setInvoices(formatted)
        }
      } catch {
        // Table might not exist yet; gracefully ignore
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to connect to Supabase'
      setError(msg)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadPOSData()
  }, [loadPOSData])

  // Cart operations
  const handleAddToCart = (newItem: CartItem) => {
    setCart((prev) => {
      const existingIdx = prev.findIndex(
        (i) =>
          i.productId === newItem.productId &&
          i.size === newItem.size &&
          i.color === newItem.color
      )

      if (existingIdx >= 0) {
        const existing = prev[existingIdx]
        const newQty = Math.min(existing.quantity + 1, newItem.availableStock)
        const updated = [...prev]
        updated[existingIdx] = { ...existing, quantity: newQty }
        return updated
      }

      return [...prev, newItem]
    })
  }

  const handleUpdateQuantity = (
    productId: string,
    quantity: number,
    size?: string | null,
    color?: string | null
  ) => {
    if (quantity <= 0) {
      handleRemoveItem(productId, size, color)
      return
    }

    setCart((prev) =>
      prev.map((i) => {
        if (i.productId === productId && i.size === size && i.color === color) {
          return { ...i, quantity: Math.min(quantity, i.availableStock) }
        }
        return i
      })
    )
  }

  const handleRemoveItem = (
    productId: string,
    size?: string | null,
    color?: string | null
  ) => {
    setCart((prev) =>
      prev.filter(
        (i) => !(i.productId === productId && i.size === size && i.color === color)
      )
    )
  }

  const handleClearCart = () => {
    setCart([])
    setCustomer({
      id: null,
      name: 'Walk-in Customer',
      phone: null,
      email: null,
    })
  }

  // Quick add customer from POS
  const handleAddNewCustomer = async (
    name: string,
    phone: string,
    email: string
  ): Promise<Customer | null> => {
    try {
      const { data, error: addErr } = await (supabase as any)
        .from('customers')
        .insert({
          name,
          phone: phone || null,
          email: email || null,
        })
        .select()
        .single()

      if (addErr) throw addErr

      const created = data as Customer
      setCustomers((prev) => [created, ...prev])
      return created
    } catch (err: unknown) {
      // Fallback local creation if write fails
      const fallback: Customer = {
        id: `local-${Date.now()}`,
        created_at: new Date().toISOString(),
        name,
        phone: phone || null,
        email: email || null,
      }
      setCustomers((prev) => [fallback, ...prev])
      return fallback
    }
  }

  // Complete checkout & generate invoice
  const handleCheckout = async (invoiceCalc: {
    discountType: 'percentage' | 'fixed'
    discountValue: number
    taxRate: number
    paymentMethod: 'cash' | 'upi' | 'card' | 'split'
    subtotal: number
    discountAmount: number
    taxAmount: number
    grandTotal: number
  }) => {
    setIsSubmitting(true)
    setError(null)

    const now = new Date()
    const year = now.getFullYear()
    const randomSeq = String(Math.floor(1000 + Math.random() * 9000))
    const invoiceNumber = `AS-${year}-${randomSeq}`
    const invoiceId = `inv-${Date.now()}`

    const lineItems: InvoiceItem[] = cart.map((c) => ({
      id: `item-${Date.now()}-${Math.random()}`,
      created_at: now.toISOString(),
      invoice_id: invoiceId,
      product_id: c.productId,
      product_name: c.name,
      size: c.size || null,
      color: c.color || null,
      quantity: c.quantity,
      unit_price: c.price,
      total_price: c.price * c.quantity,
    }))

    const completedInv: CompletedInvoice = {
      id: invoiceId,
      created_at: now.toISOString(),
      invoice_number: invoiceNumber,
      customer_id: customer.id,
      customer_name: customer.name,
      customer_phone: customer.phone,
      customer_email: customer.email,
      subtotal: invoiceCalc.subtotal,
      discount_type: invoiceCalc.discountType,
      discount_value: invoiceCalc.discountValue,
      discount_amount: invoiceCalc.discountAmount,
      tax_rate: invoiceCalc.taxRate,
      tax_amount: invoiceCalc.taxAmount,
      total_amount: invoiceCalc.grandTotal,
      payment_method: invoiceCalc.paymentMethod,
      payment_status: 'paid',
      notes: 'Store POS Sale',
      items: lineItems,
    }

    try {
      // 1. Attempt to save into Supabase `invoices` table
      try {
        const { data: savedInv, error: invErr } = await (supabase as any)
          .from('invoices')
          .insert({
            invoice_number: invoiceNumber,
            customer_id: customer.id,
            customer_name: customer.name,
            customer_phone: customer.phone,
            customer_email: customer.email,
            subtotal: invoiceCalc.subtotal,
            discount_type: invoiceCalc.discountType,
            discount_value: invoiceCalc.discountValue,
            discount_amount: invoiceCalc.discountAmount,
            tax_rate: invoiceCalc.taxRate,
            tax_amount: invoiceCalc.taxAmount,
            total_amount: invoiceCalc.grandTotal,
            payment_method: invoiceCalc.paymentMethod,
            payment_status: 'paid',
            notes: 'Store POS Sale',
          })
          .select()
          .single()

        if (!invErr && savedInv) {
          completedInv.id = (savedInv as Invoice).id
          // 2. Insert line items
          const dbItems = cart.map((c) => ({
            invoice_id: (savedInv as Invoice).id,
            product_id: c.productId,
            product_name: c.name,
            size: c.size || null,
            color: c.color || null,
            quantity: c.quantity,
            unit_price: c.price,
            total_price: c.price * c.quantity,
          }))
          await (supabase as any).from('invoice_items').insert(dbItems)
        }
      } catch (e) {
        console.warn('Database invoice save optional or schema pending:', e)
      }

      // 3. Update stock in Supabase products table
      for (const item of cart) {
        const currentProd = products.find((p) => p.id === item.productId)
        if (currentProd) {
          const newStock = Math.max(0, currentProd.stock - item.quantity)
          try {
            await (supabase as any)
              .from('products')
              .update({ stock: newStock })
              .eq('id', item.productId)
          } catch {
            // ignore if update not permitted
          }
          // Update local state
          setProducts((prev) =>
            prev.map((p) => (p.id === item.productId ? { ...p, stock: newStock } : p))
          )
        }
      }

      // 4. Save to invoice history
      setInvoices((prev) => [completedInv, ...prev])

      // 5. Open invoice modal & reset cart
      setActivePrintInvoice(completedInv)
      handleClearCart()
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <DashboardShell
      activeTab="Billing / POS"
      onRefresh={() => loadPOSData(true)}
      isRefreshing={isLoading}
    >
      {/* Error alert */}
      {error && (
        <div className="rounded-md bg-rose-500/10 border border-rose-500/25 p-3.5 flex items-start justify-between">
          <div className="flex items-start space-x-2.5">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-semibold text-rose-200">POS Connection Alert</h4>
              <p className="text-[11px] text-rose-300/80 mt-0.5">{error}</p>
            </div>
          </div>
          <button
            onClick={() => loadPOSData(true)}
            className="flex items-center space-x-1 px-2.5 py-1 rounded bg-rose-500/20 text-rose-200 text-xs font-mono transition-colors"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Retry</span>
          </button>
        </div>
      )}

      {/* POS Sub-Header Mode Switcher */}
      <div className="flex items-center justify-between pb-1 border-b border-white/10">
        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={() => setActiveView('register')}
            className={`px-3.5 py-1.5 rounded-md text-xs font-semibold flex items-center space-x-2 transition-colors ${
              activeView === 'register'
                ? 'bg-white text-black'
                : 'text-zinc-400 hover:text-white bg-zinc-900 border border-white/5'
            }`}
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            <span>New Sale Register</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveView('history')}
            className={`px-3.5 py-1.5 rounded-md text-xs font-semibold flex items-center space-x-2 transition-colors ${
              activeView === 'history'
                ? 'bg-white text-black'
                : 'text-zinc-400 hover:text-white bg-zinc-900 border border-white/5'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Sales & Bills History ({invoices.length})</span>
          </button>
        </div>

        <div className="hidden sm:flex items-center space-x-3 text-[11px] font-mono text-zinc-400">
          <span>Catalog: {products.length} Items</span>
          <span>•</span>
          <span>Clients: {customers.length} Profiles</span>
        </div>
      </div>

      {/* Main View Area */}
      {activeView === 'register' ? (
        <div className="h-[calc(100vh-12.5rem)] min-h-[620px] grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Product Catalog (60%) */}
          <div className="h-full lg:col-span-7 xl:col-span-7">
            <ProductCatalog
              products={products}
              isLoading={isLoading}
              onAddToCart={handleAddToCart}
            />
          </div>

          {/* Right: Active Cart & Register Total (40%) */}
          <div className="h-full lg:col-span-5 xl:col-span-5">
            <ActiveCart
              cart={cart}
              customers={customers}
              customer={customer}
              onCustomerChange={setCustomer}
              onUpdateQuantity={handleUpdateQuantity}
              onRemoveItem={handleRemoveItem}
              onClearCart={handleClearCart}
              onCheckout={handleCheckout}
              isSubmitting={isSubmitting}
              onAddNewCustomer={handleAddNewCustomer}
            />
          </div>
        </div>
      ) : (
        <div className="h-[calc(100vh-12.5rem)] min-h-[620px]">
          <InvoiceHistory
            invoices={invoices}
            isLoading={isLoading}
            onViewInvoice={(inv) => setActivePrintInvoice(inv)}
          />
        </div>
      )}

      {/* Print Tax Invoice Modal */}
      {activePrintInvoice && (
        <InvoicePrintModal
          invoice={activePrintInvoice}
          onClose={() => setActivePrintInvoice(null)}
        />
      )}
    </DashboardShell>
  )
}
