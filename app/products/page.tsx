'use client'

import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { Plus, RefreshCw, AlertTriangle, Shirt, Layers, AlertCircle, TrendingUp } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import type { Product } from '@/types/database'
import { DashboardShell } from '@/components/dashboard/DashboardShell'
import { ProductListTable } from '@/components/products/ProductListTable'
import { ProductModal } from '@/components/products/ProductModal'

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)

  // Fetch real products from Supabase
  const loadProducts = useCallback(async (isRefresh = false) => {
    if (!isRefresh) setIsLoading(true)
    setError(null)

    try {
      const { data, error: fetchErr } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false })

      if (fetchErr) throw fetchErr

      setProducts((data as Product[] | null) || [])
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to fetch products from Supabase'
      setError(msg)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadProducts()
  }, [loadProducts])

  // Save (Create / Update) Product
  const handleSaveProduct = async (productData: Partial<Product>, isEdit: boolean) => {
    setError(null)
    try {
      if (isEdit && editingProduct) {
        // Update in Supabase
        const { error: updateErr } = await (supabase as any)
          .from('products')
          .update(productData)
          .eq('id', editingProduct.id)

        if (updateErr) throw updateErr

        // Optimistically update local state
        setProducts((prev) =>
          prev.map((p) => (p.id === editingProduct.id ? ({ ...p, ...productData } as Product) : p))
        )
      } else {
        // Insert into Supabase
        const { data, error: insertErr } = await (supabase as any)
          .from('products')
          .insert(productData)
          .select()
          .single()

        if (insertErr) throw insertErr

        const created = data as Product
        setProducts((prev) => [created, ...prev])
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to save product to database'
      setError(msg)
      throw err
    }
  }

  // Delete Product
  const handleDeleteProduct = async (id: string) => {
    setError(null)
    try {
      const { error: deleteErr } = await supabase.from('products').delete().eq('id', id)
      if (deleteErr) throw deleteErr

      setProducts((prev) => prev.filter((p) => p.id !== id))
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to delete product from database'
      setError(msg)
    }
  }

  const openAddModal = () => {
    setEditingProduct(null)
    setIsModalOpen(true)
  }

  const openEditModal = (product: Product) => {
    setEditingProduct(product)
    setIsModalOpen(true)
  }

  // Inventory Quick Statistics
  const stats = useMemo(() => {
    const totalItems = products.length
    const totalUnits = products.reduce((acc, p) => acc + (Number(p.stock) || 0), 0)
    const lowStockCount = products.filter((p) => p.stock > 0 && p.stock <= 3).length
    const outOfStockCount = products.filter((p) => p.stock <= 0).length
    const totalValue = products.reduce(
      (acc, p) => acc + (Number(p.price) || 0) * (Number(p.stock) || 0),
      0
    )

    return { totalItems, totalUnits, lowStockCount, outOfStockCount, totalValue }
  }, [products])

  return (
    <DashboardShell
      activeTab="Products & Stock"
      onRefresh={() => loadProducts(true)}
      isRefreshing={isLoading}
    >
      {/* Top Banner: Title & Add Product Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-white/10">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-mono tracking-widest text-zinc-400 uppercase">
              Retail Catalog
            </span>
            <span className="text-zinc-700 text-xs">•</span>
            <span className="text-zinc-400 text-xs">Live Inventory</span>
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
            Products & Stock Management
          </h2>
        </div>

        <button
          type="button"
          onClick={openAddModal}
          className="inline-flex items-center justify-center space-x-2 px-4 py-2 rounded-md bg-white hover:bg-zinc-200 text-black text-xs font-bold uppercase tracking-wider transition-colors shadow-sm shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add Product</span>
        </button>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="rounded-md bg-rose-500/10 border border-rose-500/25 p-3.5 flex items-start justify-between">
          <div className="flex items-start space-x-2.5">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-semibold text-rose-200">Database Operation Alert</h4>
              <p className="text-[11px] text-rose-300/80 mt-0.5">{error}</p>
            </div>
          </div>
          <button
            onClick={() => loadProducts(true)}
            className="flex items-center space-x-1 px-2.5 py-1 rounded bg-rose-500/20 text-rose-200 text-xs font-mono transition-colors"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Retry</span>
          </button>
        </div>
      )}

      {/* Inventory KPI Summary Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-lg bg-[#0F1219] border border-white/10">
          <p className="text-[10px] font-mono uppercase tracking-wider text-zinc-400">
            Total Catalog SKUs
          </p>
          <p className="text-xl font-mono font-bold text-white mt-1">{stats.totalItems}</p>
        </div>

        <div className="p-3.5 rounded-lg bg-[#0F1219] border border-white/10">
          <p className="text-[10px] font-mono uppercase tracking-wider text-zinc-400">
            Total In-Stock Units
          </p>
          <p className="text-xl font-mono font-bold text-white mt-1">
            {stats.totalUnits.toLocaleString('en-IN')}
          </p>
        </div>

        <div className="p-3.5 rounded-lg bg-[#0F1219] border border-white/10">
          <p className="text-[10px] font-mono uppercase tracking-wider text-zinc-400">
            Low / Out of Stock
          </p>
          <p className="text-xl font-mono font-bold text-amber-300 mt-1">
            {stats.lowStockCount + stats.outOfStockCount}{' '}
            <span className="text-[10px] text-zinc-400 font-normal">
              ({stats.outOfStockCount} out)
            </span>
          </p>
        </div>

        <div className="p-3.5 rounded-lg bg-[#0F1219] border border-white/10">
          <p className="text-[10px] font-mono uppercase tracking-wider text-zinc-400">
            Total Inventory Value
          </p>
          <p className="text-xl font-mono font-bold text-emerald-400 mt-1">
            ₹{stats.totalValue.toLocaleString('en-IN')}
          </p>
        </div>
      </div>

      {/* Main Table Container */}
      <div className="h-[calc(100vh-16rem)] min-h-[500px]">
        <ProductListTable
          products={products}
          isLoading={isLoading}
          onEdit={openEditModal}
          onDelete={handleDeleteProduct}
          onAddNew={openAddModal}
        />
      </div>

      {/* Add / Edit Product Modal */}
      <ProductModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveProduct}
        productToEdit={editingProduct}
      />
    </DashboardShell>
  )
}
