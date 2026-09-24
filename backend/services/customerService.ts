import { supabase } from '../config/supabase'
import type { Customer } from '../types'

export const customerService = {
  // Fetch all customers
  async getAll(): Promise<Customer[]> {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    return (data as Customer[]) || []
  },

  // Search customer by phone or name
  async search(query: string): Promise<Customer[]> {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .or(`name.ilike.%${query}%,phone.ilike.%${query}%`)
      .limit(10)

    if (error) throw error
    return (data as Customer[]) || []
  },

  // Create new customer
  async create(payload: { name: string; phone?: string | null; email?: string | null }): Promise<Customer> {
    const { data, error } = await supabase
      .from('customers')
      .insert({
        name: payload.name.trim(),
        phone: payload.phone?.trim() || null,
        email: payload.email?.trim() || null,
      })
      .select()
      .single()

    if (error) throw error
    return data as Customer
  },
}
