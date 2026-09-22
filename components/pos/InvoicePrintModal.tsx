'use client'

import React from 'react'
import Image from 'next/image'
import { Printer, X, CheckCircle2 } from 'lucide-react'
import type { CompletedInvoice } from './types'

interface InvoicePrintModalProps {
  invoice: CompletedInvoice | null
  onClose: () => void
}

export const InvoicePrintModal: React.FC<InvoicePrintModalProps> = ({
  invoice,
  onClose,
}) => {
  if (!invoice) return null

  const handlePrint = () => {
    window.print()
  }

  const taxHalf = (Number(invoice.tax_amount) || 0) / 2
  const taxRateHalf = (Number(invoice.tax_rate) || 0) / 2

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="w-full max-w-xl bg-[#0F1219] border border-white/10 rounded-lg shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Top Bar (Hidden during print) */}
        <div className="p-4 border-b border-white/10 bg-[#0A0D14] flex items-center justify-between print:hidden">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <h3 className="text-xs sm:text-sm font-semibold text-white tracking-wide">
              Invoice Generated: {invoice.invoice_number}
            </h3>
          </div>
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={handlePrint}
              className="px-3 py-1.5 rounded bg-white hover:bg-zinc-200 text-black text-xs font-semibold flex items-center space-x-1.5 transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Tax Invoice</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded text-zinc-400 hover:text-white hover:bg-zinc-800"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Tax Invoice Container */}
        <div
          id="printable-invoice"
          className="flex-1 overflow-y-auto p-6 sm:p-8 bg-white text-black font-sans print:p-0 print:m-0 print:overflow-visible text-xs"
        >
          {/* Header */}
          <div className="flex items-start justify-between pb-6 border-b-2 border-black">
            <div className="space-y-1">
              <div className="relative w-16 h-16 bg-black p-1 rounded-sm mb-2">
                <Image
                  src="/aura-logo.png"
                  alt="AURA STUDIO"
                  width={64}
                  height={64}
                  className="object-contain"
                />
              </div>
              <h1 className="text-base font-bold tracking-[0.25em] uppercase">
                AURA STUDIO
              </h1>
              <p className="text-[11px] font-medium text-zinc-700 uppercase tracking-widest">
                Haute Menswear & Bespoke Tailoring
              </p>
              <p className="text-[10px] text-zinc-600">
                Flagship Studio, Luxury Apparel Row, Mumbai
              </p>
              <p className="text-[10px] font-mono text-zinc-700">
                GSTIN: 27AABCA1234F1Z5 • Phone: +91 22 8900 1234
              </p>
            </div>

            <div className="text-right space-y-1">
              <span className="inline-block px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider bg-black text-white">
                TAX INVOICE
              </span>
              <p className="text-xs font-mono font-bold pt-1">
                {invoice.invoice_number}
              </p>
              <p className="text-[10px] font-mono text-zinc-600">
                Date: {new Date(invoice.created_at).toLocaleDateString('en-IN', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                })}
              </p>
              <p className="text-[10px] font-mono text-zinc-600">
                Time: {new Date(invoice.created_at).toLocaleTimeString('en-IN', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
              <p className="text-[10px] text-zinc-500 font-mono">
                Cashier: Terminal #01
              </p>
            </div>
          </div>

          {/* Billed To Customer */}
          <div className="py-4 border-b border-zinc-300 grid grid-cols-2 gap-4">
            <div>
              <p className="text-[9px] uppercase font-mono tracking-wider text-zinc-500 mb-0.5">
                Billed To:
              </p>
              <p className="text-xs font-bold text-black">{invoice.customer_name}</p>
              {invoice.customer_phone && (
                <p className="text-[10px] font-mono text-zinc-700">
                  Phone: {invoice.customer_phone}
                </p>
              )}
              {invoice.customer_email && (
                <p className="text-[10px] text-zinc-600">
                  Email: {invoice.customer_email}
                </p>
              )}
            </div>

            <div className="text-right">
              <p className="text-[9px] uppercase font-mono tracking-wider text-zinc-500 mb-0.5">
                Payment Info:
              </p>
              <p className="text-[11px] font-mono font-bold uppercase">
                Mode: {invoice.payment_method}
              </p>
              <p className="text-[10px] font-mono uppercase text-emerald-700 font-semibold">
                Status: {invoice.payment_status}
              </p>
            </div>
          </div>

          {/* Items Table */}
          <div className="py-4">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b-2 border-black text-[10px] uppercase font-mono tracking-wider">
                  <th className="py-1.5 text-left">Item Description</th>
                  <th className="py-1.5 text-center">Size/Col</th>
                  <th className="py-1.5 text-center">Qty</th>
                  <th className="py-1.5 text-right">Rate</th>
                  <th className="py-1.5 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200">
                {invoice.items.map((item, idx) => (
                  <tr key={idx} className="text-[11px]">
                    <td className="py-2 pr-2 font-medium">{item.product_name}</td>
                    <td className="py-2 text-center font-mono text-zinc-600">
                      {[item.size, item.color].filter(Boolean).join('/') || '—'}
                    </td>
                    <td className="py-2 text-center font-mono font-semibold">
                      {item.quantity}
                    </td>
                    <td className="py-2 text-right font-mono">
                      ₹{Number(item.unit_price).toLocaleString('en-IN')}
                    </td>
                    <td className="py-2 text-right font-mono font-bold">
                      ₹{Number(item.total_price).toLocaleString('en-IN')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Summary / Tax Calculations */}
          <div className="pt-2 border-t-2 border-black">
            <div className="flex justify-end">
              <div className="w-64 space-y-1 text-[11px] font-mono">
                <div className="flex justify-between text-zinc-700">
                  <span>Subtotal:</span>
                  <span>₹{Number(invoice.subtotal).toLocaleString('en-IN')}</span>
                </div>
                {Number(invoice.discount_amount) > 0 && (
                  <div className="flex justify-between text-zinc-700">
                    <span>Discount:</span>
                    <span>- ₹{Number(invoice.discount_amount).toLocaleString('en-IN')}</span>
                  </div>
                )}
                {Number(invoice.tax_amount) > 0 && (
                  <>
                    <div className="flex justify-between text-zinc-600 text-[10px]">
                      <span>CGST ({taxRateHalf}%):</span>
                      <span>₹{taxHalf.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between text-zinc-600 text-[10px]">
                      <span>SGST ({taxRateHalf}%):</span>
                      <span>₹{taxHalf.toLocaleString('en-IN')}</span>
                    </div>
                  </>
                )}
                <div className="flex justify-between text-sm font-bold text-black pt-2 border-t border-black">
                  <span className="font-sans">Grand Total:</span>
                  <span>₹{Number(invoice.total_amount).toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Terms */}
          <div className="mt-8 pt-4 border-t border-zinc-300 text-[9px] text-zinc-600 space-y-1 text-center">
            <p className="font-bold tracking-widest uppercase text-black">
              Thank you for choosing AURA STUDIO
            </p>
            <p>
              Bespoke alterations valid within 30 days of purchase with original invoice.
            </p>
            <p className="font-mono">
              Computer Generated Tax Invoice • No signature required
            </p>
          </div>
        </div>

        {/* Modal Bottom Actions (Hidden during print) */}
        <div className="p-4 border-t border-white/10 bg-[#0A0D14] flex items-center justify-between print:hidden">
          <p className="text-[11px] text-zinc-400 font-mono">
            Transaction recorded in store database
          </p>
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 rounded text-xs font-medium text-zinc-300 hover:text-white bg-zinc-850 border border-white/10"
            >
              Close / New Sale
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className="px-4 py-1.5 rounded bg-white text-black text-xs font-bold hover:bg-zinc-200 flex items-center space-x-1.5"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Invoice</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
