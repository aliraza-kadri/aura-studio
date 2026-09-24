export interface Customer {
  id: string
  created_at: string
  name: string
  email: string | null
  phone: string | null
}

export interface Product {
  id: string
  created_at: string
  name: string
  description: string | null
  price: number
  category: string | null
  stock: number
  sizes: string[] | null
  colors: string[] | null
  image_url: string | null
}

export interface Invoice {
  id: string
  created_at: string
  invoice_number: string
  customer_id: string | null
  customer_name: string
  customer_phone: string | null
  customer_email: string | null
  subtotal: number
  discount_type: 'percentage' | 'fixed'
  discount_value: number
  discount_amount: number
  tax_rate: number
  tax_amount: number
  total_amount: number
  payment_method: 'cash' | 'upi' | 'card' | 'split'
  payment_status: 'paid' | 'pending' | 'refunded'
  notes: string | null
}

export interface InvoiceItem {
  id: string
  created_at: string
  invoice_id: string
  product_id: string | null
  product_name: string
  size: string | null
  color: string | null
  quantity: number
  unit_price: number
  total_price: number
}

export interface Appointment {
  id: string
  created_at: string
  notes: string | null
  status: string
  customer_id: string | null
  appointment_date: string
}

export interface Conversation {
  id: string
  created_at: string
  status: string
  customer_id: string | null
  channel: string | null
  last_message_at: string | null
}

export interface Message {
  id: string
  created_at: string
  conversation_id: string | null
  sender: string
  message: string
}

export interface FollowUp {
  id: string
  created_at: string
  status: string
  customer_id: string | null
  message: string | null
  scheduled_at: string | null
}
