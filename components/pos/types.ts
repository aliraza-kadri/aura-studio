import type { Product, Customer, Invoice, InvoiceItem } from '@/types/database'

export interface CartItem {
  productId: string
  name: string
  price: number
  quantity: number
  size?: string | null
  color?: string | null
  availableStock: number
  category?: string | null
}

export interface POSCustomer {
  id: string | null
  name: string
  phone: string | null
  email: string | null
}

export interface CompletedInvoice extends Invoice {
  items: InvoiceItem[]
}
