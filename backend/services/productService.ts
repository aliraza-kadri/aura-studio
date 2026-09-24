import { supabase } from '../config/supabase'
import type { Product } from '../types'

export const productService = {
  // Fetch all products
  async getAll(): Promise<Product[]> {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    return (data as Product[]) || []
  },

  // Get product by ID
  async getById(id: string): Promise<Product | null> {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    return data as Product
  },

  // Create new product
  async create(payload: Partial<Product>): Promise<Product> {
    const { data, error } = await supabase
      .from('products')
      .insert(payload)
      .select()
      .single()

    if (error) throw error
    return data as Product
  },

  // Update existing product
  async update(id: string, payload: Partial<Product>): Promise<Product> {
    const { data, error } = await supabase
      .from('products')
      .update(payload)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data as Product
  },

  // Delete product
  async delete(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id)

    if (error) throw error
    return true
  },
}
