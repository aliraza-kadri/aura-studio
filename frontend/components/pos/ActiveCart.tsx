'use client'

import React, { useState, useMemo } from 'react'
import {
  Trash2,
  User,
  Plus,
  Minus,
  Receipt,
  CreditCard,
  Banknote,
  QrCode,
  Percent,
  Calculator,
  UserPlus,
  Check,
  X,
} from 'lucide-react'
import type { Customer } from '@/types/database'
import type { CartItem, POSCustomer } from './types'

interface ActiveCartProps {
  cart: CartItem[]
  customers: Customer[]
  customer: POSCustomer
  onCustomerChange: (c: POSCustomer) => void
  onUpdateQuantity: (productId: string, quantity: number, size?: string | null, color?: string | null) => void
  onRemoveItem: (productId: string, size?: string | null, color?: string | null) => void
  onClearCart: () => void
  onCheckout: (invoiceData: {
    discountType: 'percentage' | 'fixed'
    discountValue: number
    taxRate: number
    paymentMethod: 'cash' | 'upi' | 'card' | 'split'
    subtotal: number
    discountAmount: number
    taxAmount: number
    grandTotal: number
  }) => void
  isSubmitting: boolean
  onAddNewCustomer: (name: string, phone: string, email: string) => Promise<Customer | null>
}

export const ActiveCart: React.FC<ActiveCartProps> = ({
  cart,
  customers,
  customer,
  onCustomerChange,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onCheckout,
  isSubmitting,
  onAddNewCustomer,
}) => {
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>('percentage')
  const [discountValue, setDiscountValue] = useState<number>(0)
  const [taxRate, setTaxRate] = useState<number>(12) // Default 12% apparel GST
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'upi' | 'card' | 'split'>('upi')
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false)
  const [newCustName, setNewCustName] = useState('')
  const [newCustPhone, setNewCustPhone] = useState('')
  const [newCustEmail, setNewCustEmail] = useState('')
  const [isAddingCust, setIsAddingCust] = useState(false)

  // Calculations
  const subtotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
  }, [cart])

  const discountAmount = useMemo(() => {
    if (discountValue <= 0) return 0
    if (discountType === 'percentage') {
      return (subtotal * Math.min(discountValue, 100)) / 100
    }
    return Math.min(discountValue, subtotal)
  }, [subtotal, discountType, discountValue])

  const taxableAmount = Math.max(0, subtotal - discountAmount)

  const taxAmount = useMemo(() => {
    return (taxableAmount * taxRate) / 100
  }, [taxableAmount, taxRate])

  const grandTotal = Math.round(taxableAmount + taxAmount)

  const handleSaveNewCustomer = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newCustName.trim()) return
    setIsAddingCust(true)
    try {
      const created = await onAddNewCustomer(
        newCustName.trim(),
        newCustPhone.trim(),
        newCustEmail.trim()
      )
      if (created) {
        onCustomerChange({
          id: created.id,
          name: created.name,
          phone: created.phone,
          email: created.email,
        })
        setIsCustomerModalOpen(false)
        setNewCustName('')
        setNewCustPhone('')
        setNewCustEmail('')
      }
    } finally {
      setIsAddingCust(false)
    }
  }

  const handleCompleteSale = () => {
    if (cart.length === 0) return
    onCheckout({
      discountType,
      discountValue,
      taxRate,
      paymentMethod,
      subtotal,
      discountAmount,
      taxAmount,
      grandTotal,
    })
  }

  return (
    <div className="flex flex-col h-full bg-[#0C0F17] border border-white/10 rounded-lg overflow-hidden shadow-sm">
      {/* Customer Header */}
      <div className="p-4 border-b border-white/10 bg-[#0A0D14] space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-400">
            Billing Client
          </span>
          <div className="flex items-center space-x-1.5">
            <button
              type="button"
              onClick={() =>
                onCustomerChange({
                  id: null,
                  name: 'Walk-in Customer',
                  phone: null,
                  email: null,
                })
              }
              className={`px-2 py-0.5 text-[10px] font-mono rounded transition-colors ${
                customer.id === null
                  ? 'bg-white text-black font-semibold'
                  : 'text-zinc-400 hover:text-white bg-zinc-900 border border-white/5'
              }`}
            >
              Walk-in
            </button>
            <button
              type="button"
              onClick={() => setIsCustomerModalOpen(true)}
              className="px-2 py-0.5 text-[10px] font-mono rounded text-zinc-300 hover:text-white bg-zinc-800 border border-white/10 flex items-center space-x-1"
            >
              <UserPlus className="w-2.5 h-2.5" />
              <span>+ New Client</span>
            </button>
          </div>
        </div>

        {/* Existing Customers Dropdown */}
        <div className="flex items-center space-x-2">
          <select
            value={customer.id || ''}
            onChange={(e) => {
              const val = e.target.value
              if (!val) {
                onCustomerChange({
                  id: null,
                  name: 'Walk-in Customer',
                  phone: null,
                  email: null,
                })
              } else {
                const found = customers.find((c) => c.id === val)
                if (found) {
                  onCustomerChange({
                    id: found.id,
                    name: found.name,
                    phone: found.phone,
                    email: found.email,
                  })
                }
              }
            }}
            className="w-full px-2.5 py-1.5 bg-zinc-900 border border-white/10 rounded text-xs text-white focus:outline-hidden font-sans"
          >
            <option value="">Walk-in Customer</option>
            {customers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} {c.phone ? `(${c.phone})` : ''}
              </option>
            ))}
          </select>
        </div>

        {customer.id && (
          <div className="text-[11px] text-zinc-400 flex items-center justify-between pt-1">
            <span className="font-semibold text-zinc-200">{customer.name}</span>
            <span className="font-mono">{customer.phone || 'No phone'}</span>
          </div>
        )}
      </div>

      {/* Cart Items List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
        {cart.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6">
            <Receipt className="w-8 h-8 text-zinc-400 mb-2" />
            <h4 className="text-xs font-semibold text-zinc-200">Register Cart is Empty</h4>
            <p className="text-[11px] text-zinc-400 max-w-xs mt-1">
              Select items from the catalog or scan products to start an invoice.
            </p>
          </div>
        ) : (
          cart.map((item) => (
            <div
              key={`${item.productId}-${item.size}-${item.color}`}
              className="p-3 rounded-md bg-zinc-900/90 border border-white/10 flex items-center justify-between gap-2"
            >
              <div className="min-w-0 flex-1">
                <h5 className="text-xs font-medium text-white truncate">{item.name}</h5>
                <div className="flex items-center space-x-2 text-[10px] text-zinc-400 font-mono mt-0.5">
                  {item.size && <span>Size: {item.size}</span>}
                  {item.color && <span>• Color: {item.color}</span>}
                  <span>• ₹{item.price.toLocaleString('en-IN')} ea</span>
                </div>
              </div>

              {/* Quantity Stepper */}
              <div className="flex items-center space-x-1.5 shrink-0 bg-zinc-850 px-1.5 py-0.5 rounded border border-white/5">
                <button
                  type="button"
                  onClick={() =>
                    onUpdateQuantity(item.productId, item.quantity - 1, item.size, item.color)
                  }
                  className="p-0.5 text-zinc-400 hover:text-white"
                >
                  <Minus className="w-3 h-3" />
                </button>
                <span className="w-5 text-center text-xs font-mono font-bold text-white">
                  {item.quantity}
                </span>
                <button
                  type="button"
                  disabled={item.quantity >= item.availableStock}
                  onClick={() =>
                    onUpdateQuantity(item.productId, item.quantity + 1, item.size, item.color)
                  }
                  className="p-0.5 text-zinc-400 hover:text-white disabled:opacity-30"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>

              {/* Line Total & Remove */}
              <div className="flex items-center space-x-2 shrink-0">
                <span className="text-xs font-mono font-bold text-white">
                  ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                </span>
                <button
                  type="button"
                  onClick={() => onRemoveItem(item.productId, item.size, item.color)}
                  className="p-1 text-zinc-400 hover:text-rose-400 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Bill Calculations & Checkout Footer */}
      {cart.length > 0 && (
        <div className="p-4 border-t border-white/10 bg-[#0A0D14] space-y-3">
          {/* Discount & GST Controls */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            {/* Discount */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400">
                <span>Discount</span>
                <div className="flex items-center space-x-1">
                  <button
                    type="button"
                    onClick={() => setDiscountType('percentage')}
                    className={`px-1 py-0.2 rounded text-[9px] ${
                      discountType === 'percentage'
                        ? 'bg-white text-black font-bold'
                        : 'text-zinc-400'
                    }`}
                  >
                    %
                  </button>
                  <button
                    type="button"
                    onClick={() => setDiscountType('fixed')}
                    className={`px-1 py-0.2 rounded text-[9px] ${
                      discountType === 'fixed'
                        ? 'bg-white text-black font-bold'
                        : 'text-zinc-400'
                    }`}
                  >
                    ₹
                  </button>
                </div>
              </div>
              <input
                type="number"
                min="0"
                value={discountValue || ''}
                onChange={(e) => setDiscountValue(Number(e.target.value) || 0)}
                placeholder="0"
                className="w-full px-2 py-1 bg-zinc-900 border border-white/10 rounded text-xs font-mono text-white"
              />
            </div>

            {/* GST Rate */}
            <div className="space-y-1">
              <div className="text-[10px] font-mono text-zinc-400">GST Slab</div>
              <select
                value={taxRate}
                onChange={(e) => setTaxRate(Number(e.target.value))}
                className="w-full px-2 py-1 bg-zinc-900 border border-white/10 rounded text-xs font-mono text-white"
              >
                <option value={0}>0% GST</option>
                <option value={5}>5% GST (Apparel &lt; 1k)</option>
                <option value={12}>12% GST (Standard)</option>
                <option value={18}>18% GST (Luxury / Tailoring)</option>
              </select>
            </div>
          </div>

          {/* Breakdown summary */}
          <div className="space-y-1 text-xs pt-1 border-t border-white/5 font-mono">
            <div className="flex justify-between text-zinc-400">
              <span>Subtotal</span>
              <span>₹{subtotal.toLocaleString('en-IN')}</span>
            </div>
            {discountAmount > 0 && (
              <div className="flex justify-between text-emerald-400">
                <span>Discount ({discountType === 'percentage' ? `${discountValue}%` : 'Fixed'})</span>
                <span>- ₹{discountAmount.toLocaleString('en-IN')}</span>
              </div>
            )}
            <div className="flex justify-between text-zinc-400">
              <span>GST ({taxRate}%)</span>
              <span>+ ₹{taxAmount.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between text-sm font-bold text-white pt-1 border-t border-white/10">
              <span className="font-sans">Grand Total</span>
              <span>₹{grandTotal.toLocaleString('en-IN')}</span>
            </div>
          </div>

          {/* Payment Method Selector */}
          <div className="space-y-1 pt-1">
            <span className="text-[10px] font-mono uppercase text-zinc-400">Payment Method</span>
            <div className="grid grid-cols-4 gap-1.5">
              {(['upi', 'cash', 'card', 'split'] as const).map((method) => (
                <button
                  key={method}
                  type="button"
                  onClick={() => setPaymentMethod(method)}
                  className={`py-1.5 rounded text-[11px] font-mono uppercase tracking-wider transition-colors flex items-center justify-center space-x-1 ${
                    paymentMethod === method
                      ? 'bg-white text-black font-bold'
                      : 'bg-zinc-900 text-zinc-400 hover:text-white border border-white/5'
                  }`}
                >
                  {method === 'upi' && <QrCode className="w-3 h-3" />}
                  {method === 'cash' && <Banknote className="w-3 h-3" />}
                  {method === 'card' && <CreditCard className="w-3 h-3" />}
                  {method === 'split' && <Calculator className="w-3 h-3" />}
                  <span>{method}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-2 pt-1">
            <button
              type="button"
              onClick={onClearCart}
              className="px-3 py-2.5 rounded text-xs font-medium text-zinc-400 hover:text-rose-400 bg-zinc-900 border border-white/5 transition-colors"
            >
              Clear
            </button>
            <button
              type="button"
              disabled={isSubmitting || cart.length === 0}
              onClick={handleCompleteSale}
              className="flex-1 py-2.5 rounded bg-white hover:bg-zinc-200 disabled:opacity-50 text-black text-xs font-bold uppercase tracking-wider transition-colors flex items-center justify-center space-x-1.5 shadow-sm"
            >
              <Receipt className="w-4 h-4" />
              <span>{isSubmitting ? 'Processing...' : `Generate Invoice (₹${grandTotal.toLocaleString('en-IN')})`}</span>
            </button>
          </div>
        </div>
      )}

      {/* Quick Add Client Modal */}
      {isCustomerModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-[#0E121A] border border-white/10 rounded-lg p-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
              <h4 className="text-sm font-semibold text-white">Add New Client</h4>
              <button
                type="button"
                onClick={() => setIsCustomerModalOpen(false)}
                className="text-zinc-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveNewCustomer} className="space-y-3">
              <div>
                <label className="text-[10px] font-mono uppercase text-zinc-400 block mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={newCustName}
                  onChange={(e) => setNewCustName(e.target.value)}
                  placeholder="e.g. Rahul Mehta"
                  className="w-full px-3 py-2 bg-zinc-900 border border-white/10 rounded text-xs text-white focus:outline-hidden"
                />
              </div>

              <div>
                <label className="text-[10px] font-mono uppercase text-zinc-400 block mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={newCustPhone}
                  onChange={(e) => setNewCustPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full px-3 py-2 bg-zinc-900 border border-white/10 rounded text-xs text-white focus:outline-hidden font-mono"
                />
              </div>

              <div>
                <label className="text-[10px] font-mono uppercase text-zinc-400 block mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={newCustEmail}
                  onChange={(e) => setNewCustEmail(e.target.value)}
                  placeholder="client@example.com"
                  className="w-full px-3 py-2 bg-zinc-900 border border-white/10 rounded text-xs text-white focus:outline-hidden font-mono"
                />
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsCustomerModalOpen(false)}
                  className="px-3 py-1.5 rounded text-xs text-zinc-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isAddingCust || !newCustName.trim()}
                  className="px-4 py-1.5 rounded bg-white text-black text-xs font-semibold hover:bg-zinc-200 disabled:opacity-50"
                >
                  {isAddingCust ? 'Saving...' : 'Save & Select'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
