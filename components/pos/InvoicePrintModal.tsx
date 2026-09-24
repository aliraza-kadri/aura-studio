'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import { Printer, X, CheckCircle2, Layout, Maximize2, ShieldCheck } from 'lucide-react'
import type { CompletedInvoice } from './types'

interface InvoicePrintModalProps {
  invoice: CompletedInvoice | null
  onClose: () => void
}

// Convert INR number to words
function numberToWordsINR(num: number): string {
  const a = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen']
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety']

  const rounded = Math.round(Number(num) || 0)
  if (rounded === 0) return 'Zero Rupees Only'

  function convert(n: number): string {
    if (n < 20) return a[n]
    if (n < 100) return b[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + a[n % 10] : '')
    if (n < 1000) return a[Math.floor(n / 100)] + ' Hundred' + (n % 100 !== 0 ? ' ' + convert(n % 100) : '')
    if (n < 100000) return convert(Math.floor(n / 1000)) + ' Thousand' + (n % 1000 !== 0 ? ' ' + convert(n % 1000) : '')
    if (n < 10000000) return convert(Math.floor(n / 100000)) + ' Lakh' + (n % 100000 !== 0 ? ' ' + convert(n % 100000) : '')
    return convert(Math.floor(n / 10000000)) + ' Crore' + (n % 10000000 !== 0 ? ' ' + convert(n % 10000000) : '')
  }

  return 'Rupees ' + convert(rounded) + ' Only'
}

export const InvoicePrintModal: React.FC<InvoicePrintModalProps> = ({
  invoice,
  onClose,
}) => {
  const [orientation, setOrientation] = useState<'landscape' | 'portrait'>('landscape')

  if (!invoice) return null

  const handlePrint = () => {
    window.print()
  }

  const taxHalf = (Number(invoice.tax_amount) || 0) / 2
  const taxRateHalf = (Number(invoice.tax_rate) || 0) / 2
  const totalQty = invoice.items.reduce((acc, curr) => acc + (Number(curr.quantity) || 1), 0)

  return (
    <>
      {/* Dynamic Print Styles for Clean Full-Width Landscape Output */}
      <style dangerouslySetInnerHTML={{ __html: `
        @page {
          size: ${orientation};
          margin: 8mm 10mm;
        }
        @media print {
          html, body {
            background: #ffffff !important;
            color: #000000 !important;
            margin: 0 !important;
            padding: 0 !important;
            width: 100% !important;
            height: auto !important;
            overflow: visible !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          body * {
            visibility: hidden !important;
          }
          #printable-invoice,
          #printable-invoice * {
            visibility: visible !important;
          }
          #printable-invoice {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            min-width: 100% !important;
            max-width: 100% !important;
            margin: 0 !important;
            padding: 6mm 10mm !important;
            box-shadow: none !important;
            border: 1px solid #18181b !important;
            background: #ffffff !important;
            box-sizing: border-box !important;
          }
          .print-hidden,
          .print\\:hidden {
            display: none !important;
            visibility: hidden !important;
          }
          table {
            page-break-inside: auto;
          }
          tr {
            page-break-inside: avoid;
            page-break-after: auto;
          }
        }
      `}} />

      <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-y-auto print:p-0 print:bg-transparent print:static">
        <div
          className={`w-full ${
            orientation === 'landscape' ? 'max-w-5xl' : 'max-w-2xl'
          } bg-[#0F1219] border border-white/10 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[94vh] print:max-w-none print:border-none print:shadow-none print:rounded-none print:max-h-none`}
        >
          {/* Modal Header Controls (Hidden during print) */}
          <div className="p-3.5 sm:p-4 border-b border-white/10 bg-[#0A0D14] flex flex-wrap items-center justify-between gap-3 print:hidden">
            <div className="flex items-center space-x-2.5">
              <span className="p-1 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <CheckCircle2 className="w-4 h-4" />
              </span>
              <div>
                <h3 className="text-xs sm:text-sm font-semibold text-white tracking-wide">
                  Tax Invoice: <span className="font-mono text-zinc-300">{invoice.invoice_number}</span>
                </h3>
                <p className="text-[10px] text-zinc-400">
                  Ready to print or save as PDF
                </p>
              </div>
            </div>

            {/* Controls: Orientation Toggle & Action Buttons */}
            <div className="flex items-center space-x-2">
              <div className="flex items-center bg-zinc-900 border border-white/10 rounded-lg p-0.5 text-xs">
                <button
                  type="button"
                  onClick={() => setOrientation('landscape')}
                  className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors flex items-center space-x-1.5 ${
                    orientation === 'landscape'
                      ? 'bg-white text-black font-semibold shadow-xs'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                  title="Wide Landscape format (Recommended for full details)"
                >
                  <Maximize2 className="w-3 h-3 rotate-45" />
                  <span>Landscape</span>
                </button>
                <button
                  type="button"
                  onClick={() => setOrientation('portrait')}
                  className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors flex items-center space-x-1.5 ${
                    orientation === 'portrait'
                      ? 'bg-white text-black font-semibold shadow-xs'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                  title="Standard Portrait A4"
                >
                  <Layout className="w-3 h-3" />
                  <span>Portrait</span>
                </button>
              </div>

              <button
                type="button"
                onClick={handlePrint}
                className="px-3.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold flex items-center space-x-1.5 shadow-sm transition-colors"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Invoice</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Printable Invoice Container */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-zinc-950/60 print:p-0 print:overflow-visible">
            <div
              id="printable-invoice"
              className="mx-auto bg-white text-black font-sans p-6 sm:p-8 rounded-lg shadow-xl print:shadow-none print:rounded-none text-xs border border-zinc-200"
              style={{
                width: '100%',
                maxWidth: orientation === 'landscape' ? '100%' : '760px',
              }}
            >
              {/* TOP HEADER: Store Brand Identity & Tax Invoice Number */}
              <div className="flex items-start justify-between pb-5 border-b-2 border-black">
                {/* Brand Identity */}
                <div className="flex items-center space-x-3.5">
                  <div className="relative w-14 h-14 bg-black p-1 rounded-sm shrink-0 flex items-center justify-center">
                    <Image
                      src="/aura-logo.png"
                      alt="AURA STUDIO"
                      width={52}
                      height={52}
                      unoptimized
                      className="object-contain"
                    />
                  </div>
                  <div>
                    <h1 className="text-lg font-extrabold tracking-[0.22em] uppercase leading-none">
                      AURA STUDIO
                    </h1>
                    <p className="text-[10px] font-semibold text-zinc-700 uppercase tracking-widest mt-1">
                      Haute Menswear & Bespoke Tailoring
                    </p>
                    <p className="text-[9px] text-zinc-600 mt-0.5">
                      Flagship Studio • Luxury Apparel Row, Mumbai • contact@aurastudio.luxury
                    </p>
                    <p className="text-[9px] font-mono text-zinc-700">
                      GSTIN: <span className="font-semibold text-black">27AABCA1234F1Z5</span> • Tel: +91 22 8900 1234
                    </p>
                  </div>
                </div>

                {/* Tax Invoice Meta */}
                <div className="text-right">
                  <div className="inline-block px-3 py-1 bg-black text-white text-[11px] font-extrabold tracking-wider uppercase mb-1.5">
                    TAX INVOICE / RETAIL CASH MEMO
                  </div>
                  <p className="text-xs font-mono font-bold text-black">
                    Invoice No: <span className="underline">{invoice.invoice_number}</span>
                  </p>
                  <p className="text-[10px] font-mono text-zinc-600 mt-0.5">
                    Date: {new Date(invoice.created_at).toLocaleDateString('en-IN', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                    })} | Time: {new Date(invoice.created_at).toLocaleTimeString('en-IN', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                  <p className="text-[9px] font-mono text-zinc-500">
                    POS Register: <span className="font-semibold text-zinc-800">Terminal #01 (Flagship Store)</span>
                  </p>
                </div>
              </div>

              {/* THREE-COLUMN INFO STRIP: Customer, Settlement, Transaction Meta */}
              <div className="grid grid-cols-3 gap-3 py-3 border-b border-zinc-300 text-[10px] bg-zinc-50/80 -mx-6 sm:-mx-8 px-6 sm:px-8">
                {/* 1. Customer Info */}
                <div className="border-r border-zinc-200 pr-3">
                  <span className="text-[8px] font-mono uppercase tracking-wider text-zinc-500 font-bold block mb-0.5">
                    Billed To (Client Details)
                  </span>
                  <p className="text-xs font-bold text-black uppercase">
                    {invoice.customer_name || 'Walk-in Customer'}
                  </p>
                  {invoice.customer_phone ? (
                    <p className="text-[10px] font-mono text-zinc-700">
                      Phone: <span className="font-semibold">{invoice.customer_phone}</span>
                    </p>
                  ) : (
                    <p className="text-[9px] font-mono text-zinc-400">Phone: Unregistered</p>
                  )}
                  {invoice.customer_email && (
                    <p className="text-[9px] text-zinc-600 truncate">
                      Email: {invoice.customer_email}
                    </p>
                  )}
                </div>

                {/* 2. Payment Settlement Info */}
                <div className="border-r border-zinc-200 px-3">
                  <span className="text-[8px] font-mono uppercase tracking-wider text-zinc-500 font-bold block mb-0.5">
                    Payment & Settlement
                  </span>
                  <p className="text-[11px] font-mono font-bold uppercase text-zinc-900">
                    Mode: <span className="px-1.5 py-0.5 bg-zinc-200 rounded">{invoice.payment_method}</span>
                  </p>
                  <p className="text-[10px] font-mono text-emerald-700 font-bold mt-1 flex items-center space-x-1">
                    <ShieldCheck className="w-3 h-3 inline" />
                    <span>STATUS: {invoice.payment_status.toUpperCase()}</span>
                  </p>
                  <p className="text-[9px] font-mono text-zinc-500">
                    Currency: INR (₹)
                  </p>
                </div>

                {/* 3. Dispatch & Tax Place Info */}
                <div className="pl-3">
                  <span className="text-[8px] font-mono uppercase tracking-wider text-zinc-500 font-bold block mb-0.5">
                    Tax & Store Jurisdiction
                  </span>
                  <p className="text-[10px] font-mono text-zinc-800">
                    Place of Supply: <span className="font-semibold text-black">27 - Maharashtra</span>
                  </p>
                  <p className="text-[9px] font-mono text-zinc-600 mt-0.5">
                    Nature: Retail Luxury Apparel Sale
                  </p>
                  <p className="text-[9px] font-mono text-zinc-500">
                    Original Copy for Recipient
                  </p>
                </div>
              </div>

              {/* ITEMS DETAIL TABLE (Wide Landscape Layout) */}
              <div className="py-3">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b-2 border-black bg-zinc-100/90 text-[9px] uppercase font-mono tracking-wider text-zinc-800">
                      <th className="py-2 px-2 text-center w-8">#</th>
                      <th className="py-2 px-2 text-left">Item Description</th>
                      <th className="py-2 px-2 text-center w-20">Size / Fit</th>
                      <th className="py-2 px-2 text-center w-20">Color</th>
                      <th className="py-2 px-2 text-center w-12">Qty</th>
                      <th className="py-2 px-2 text-right w-24">Rate (₹)</th>
                      <th className="py-2 px-2 text-right w-24">Amount (₹)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200">
                    {invoice.items.map((item, idx) => (
                      <tr key={idx} className="text-[11px] hover:bg-zinc-50">
                        <td className="py-2 px-2 text-center font-mono text-zinc-500 text-[10px]">
                          {idx + 1}
                        </td>
                        <td className="py-2 px-2 font-semibold text-black">
                          {item.product_name}
                        </td>
                        <td className="py-2 px-2 text-center font-mono text-zinc-700">
                          {item.size || '—'}
                        </td>
                        <td className="py-2 px-2 text-center font-mono text-zinc-700">
                          {item.color || '—'}
                        </td>
                        <td className="py-2 px-2 text-center font-mono font-bold text-black">
                          {item.quantity}
                        </td>
                        <td className="py-2 px-2 text-right font-mono text-zinc-800">
                          ₹{Number(item.unit_price).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="py-2 px-2 text-right font-mono font-bold text-black">
                          ₹{Number(item.total_price).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2 border-zinc-300 font-mono text-[10px] bg-zinc-50">
                      <td colSpan={4} className="py-1.5 px-2 text-right font-bold uppercase text-zinc-600">
                        Total Items & Quantity:
                      </td>
                      <td className="py-1.5 px-2 text-center font-bold text-black">
                        {totalQty}
                      </td>
                      <td colSpan={2} className="py-1.5 px-2 text-right font-bold text-black">
                        ₹{Number(invoice.subtotal).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* BOTTOM SECTION: Amount In Words, Terms, Authorized Seal & Summary Calculations */}
              <div className="pt-3 border-t-2 border-black grid grid-cols-1 sm:grid-cols-2 gap-6 items-start">
                {/* Left Side: Words, Terms & Seal */}
                <div className="space-y-3">
                  {/* Amount in words */}
                  <div className="p-2 rounded bg-zinc-100 border border-zinc-200">
                    <span className="text-[8px] font-mono uppercase tracking-wider text-zinc-500 font-bold block">
                      Amount Chargeable (in words):
                    </span>
                    <p className="text-[11px] font-semibold text-black italic">
                      {numberToWordsINR(invoice.total_amount)}
                    </p>
                  </div>

                  {/* Terms & Return policy */}
                  <div className="text-[8.5px] text-zinc-600 space-y-0.5">
                    <p className="font-bold text-black uppercase tracking-wider">Terms & Policy:</p>
                    <p>• Bespoke alterations valid within 30 days of purchase with original invoice.</p>
                    <p>• Returns/Exchanges accepted for unworn garments with intact tags within 7 days.</p>
                    <p>• Goods once sold cannot be refunded in cash; store credit note will be issued.</p>
                  </div>

                  {/* Authorized Signatory */}
                  <div className="pt-2 flex items-end justify-between">
                    <div>
                      <p className="text-[9px] font-mono text-zinc-500">
                        Thank you for your patronage!
                      </p>
                      <p className="text-[8px] text-zinc-400 font-mono">
                        Computer Generated Invoice • No Physical Signature Required
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="w-32 border-b border-black mb-1"></div>
                      <p className="text-[9px] font-mono font-bold uppercase">
                        For AURA STUDIO
                      </p>
                    </div>
                  </div>
                </div>

                {/* Right Side: Detailed Summary Card */}
                <div className="bg-zinc-50 p-3.5 rounded border border-zinc-200 space-y-1.5 font-mono text-[11px]">
                  <div className="flex justify-between text-zinc-700">
                    <span>Subtotal:</span>
                    <span>₹{Number(invoice.subtotal).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                  </div>

                  {Number(invoice.discount_amount) > 0 && (
                    <div className="flex justify-between text-emerald-700 font-semibold">
                      <span>Discount ({invoice.discount_type === 'percentage' ? `${invoice.discount_value}%` : 'Flat'}):</span>
                      <span>- ₹{Number(invoice.discount_amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                    </div>
                  )}

                  {Number(invoice.tax_amount) > 0 && (
                    <>
                      <div className="flex justify-between text-zinc-600 text-[10px] pt-1 border-t border-zinc-200">
                        <span>CGST ({taxRateHalf}%):</span>
                        <span>₹{taxHalf.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                      </div>
                      <div className="flex justify-between text-zinc-600 text-[10px]">
                        <span>SGST ({taxRateHalf}%):</span>
                        <span>₹{taxHalf.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                      </div>
                      <div className="flex justify-between text-zinc-700 text-[10px] font-semibold">
                        <span>Total GST ({invoice.tax_rate}%):</span>
                        <span>₹{Number(invoice.tax_amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                      </div>
                    </>
                  )}

                  {/* Grand Total Box */}
                  <div className="flex justify-between text-base font-extrabold text-black pt-2 mt-2 border-t-2 border-black">
                    <span className="font-sans uppercase tracking-wide">Grand Total:</span>
                    <span className="text-lg">
                      ₹{Number(invoice.total_amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Modal Bottom Bar (Hidden during print) */}
          <div className="p-3 sm:p-4 border-t border-white/10 bg-[#0A0D14] flex flex-wrap items-center justify-between gap-2 print:hidden">
            <p className="text-[11px] text-zinc-400 font-mono">
              💡 Tip: In Chrome print settings, uncheck <span className="text-zinc-200">&apos;Headers and footers&apos;</span> to remove page URLs.
            </p>
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-1.5 rounded-lg text-xs font-medium text-zinc-300 hover:text-white bg-zinc-800/80 hover:bg-zinc-800 border border-white/10 transition-colors"
              >
                Close / New Sale
              </button>
              <button
                type="button"
                onClick={handlePrint}
                className="px-4 py-1.5 rounded-lg bg-white text-black text-xs font-bold hover:bg-zinc-200 flex items-center space-x-1.5 transition-colors shadow-sm"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Invoice</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
