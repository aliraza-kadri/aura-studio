import { supabase } from '../config/supabase'
import type { Invoice, InvoiceItem } from '../types'

export interface CreateInvoicePayload {
  invoice: Omit<Invoice, 'created_at'>
  items: Omit<InvoiceItem, 'created_at'>[]
}

export const invoiceService = {
  // Generate sequential invoice number (e.g. AS-2026-1042)
  generateInvoiceNumber(): string {
    const year = new Date().getFullYear()
    const randomSeq = String(Math.floor(1000 + Math.random() * 9000))
    return `AS-${year}-${randomSeq}`
  },

  // Save completed invoice with items
  async createInvoice(payload: CreateInvoicePayload): Promise<{ invoice: Invoice; items: InvoiceItem[] }> {
    // 1. Insert invoice header
    const { data: invData, error: invErr } = await supabase
      .from('invoices')
      .insert(payload.invoice)
      .select()
      .single()

    if (invErr) throw invErr

    // 2. Insert line items
    const { data: itemsData, error: itemsErr } = await supabase
      .from('invoice_items')
      .insert(payload.items)
      .select()

    if (itemsErr) throw itemsErr

    return {
      invoice: invData as Invoice,
      items: (itemsData as InvoiceItem[]) || [],
    }
  },

  // Fetch recent invoices
  async getRecentInvoices(limit = 20): Promise<Invoice[]> {
    const { data, error } = await supabase
      .from('invoices')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) throw error
    return (data as Invoice[]) || []
  },
}
