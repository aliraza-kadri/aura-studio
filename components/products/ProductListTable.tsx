'use client'

import React, { useState, useMemo } from 'react'
import Image from 'next/image'
import {
  Search,
  Edit2,
  Trash2,
  Shirt,
  AlertTriangle,
  Plus,
  ArrowUpDown,
} from 'lucide-react'
import type { Product } from '@/types/database'
import { EmptyState } from '@/components/dashboard/EmptyState'

interface ProductListTableProps {
  products: Product[]
  isLoading: boolean
  onEdit: (product: Product) => void
  onDelete: (id: string, name: string) => void
  onAddNew: () => void
}

export const ProductListTable: React.FC<ProductListTableProps> = ({
  products,
  isLoading,
  onEdit,
  onDelete,
  onAddNew,
}) => {
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [deleteConfirmProduct, setDeleteConfirmProduct] = useState<{
    id: string
    name: string
  } | null>(null)

  const categories = useMemo(() => {
    const set = new Set<string>()
    products.forEach((p) => {
      if (p.category) set.add(p.category)
    })
    return ['all', ...Array.from(set)]
  }, [products])

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchSearch =
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        (p.category && p.category.toLowerCase().includes(search.toLowerCase())) ||
        (p.description && p.description.toLowerCase().includes(search.toLowerCase()))
      const matchCat =
        selectedCategory === 'all' ||
        (p.category && p.category.toLowerCase() === selectedCategory.toLowerCase())

      return matchSearch && matchCat
    })
  }, [products, search, selectedCategory])

  const parseSku = (desc?: string | null) => {
    if (!desc) return null
    const match = desc.match(/\[SKU:\s*([^\]]+)\]/)
    return match ? match[1].trim() : null
  }

  return (
    <div className="bg-[#0C0F17] border border-white/10 rounded-lg overflow-hidden shadow-sm flex flex-col h-full">
      {/* Search & Filter Toolbar */}
      <div className="p-4 border-b border-white/10 bg-[#0A0D14] flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-zinc-400" />
          <input
            type="text"
            placeholder="Search by product name, SKU, or category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-zinc-900 border border-white/10 rounded text-xs text-white placeholder-zinc-400 focus:outline-hidden"
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-0.5">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-2.5 py-1 rounded text-[11px] font-mono uppercase tracking-wider transition-colors shrink-0 ${
                selectedCategory === cat
                  ? 'bg-white text-black font-bold'
                  : 'bg-zinc-900 text-zinc-400 hover:text-white border border-white/5'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Table Area */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="p-4 space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="h-16 rounded bg-zinc-900/60 border border-white/5 animate-pulse"
              />
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="py-12 px-4">
            <EmptyState
              icon={Shirt}
              title={
                search || selectedCategory !== 'all'
                  ? 'No matching products'
                  : 'No products in inventory'
              }
              description={
                search || selectedCategory !== 'all'
                  ? 'Try adjusting your search terms or category filter.'
                  : 'Your store catalog is currently empty. Click "Add Product" to create your first menswear item.'
              }
              actionLabel={search || selectedCategory !== 'all' ? undefined : '+ Add First Product'}
              onAction={search || selectedCategory !== 'all' ? undefined : onAddNew}
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-white/10 text-[10px] font-mono uppercase tracking-wider text-zinc-400 bg-zinc-950/40">
                  <th className="py-3 px-4">Item & Photo</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Stock Level</th>
                  <th className="py-3 px-4">Price</th>
                  <th className="py-3 px-4">Sizes</th>
                  <th className="py-3 px-4">Colors</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-sans">
                {filteredProducts.map((p) => {
                  const sku = parseSku(p.description)
                  const isOutOfStock = p.stock <= 0
                  const isLowStock = p.stock > 0 && p.stock <= 3

                  return (
                    <tr key={p.id} className="hover:bg-zinc-900/50 transition-colors">
                      {/* Thumbnail & Name */}
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-3">
                          <div className="relative w-11 h-11 rounded bg-black border border-white/10 overflow-hidden shrink-0 flex items-center justify-center">
                            {p.image_url ? (
                              <Image
                                src={p.image_url}
                                alt={p.name}
                                fill
                                className="object-cover"
                              />
                            ) : (
                              <Shirt className="w-5 h-5 text-zinc-400" />
                            )}
                          </div>

                          <div className="min-w-0">
                            <p className="font-semibold text-white truncate max-w-xs">{p.name}</p>
                            {sku && (
                              <p className="text-[10px] text-zinc-400 font-mono">
                                SKU: {sku}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3 px-4">
                        <span className="inline-block px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-zinc-850 text-zinc-300 border border-white/5">
                          {p.category || 'Apparel'}
                        </span>
                      </td>

                      {/* Stock Quantity */}
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider font-semibold ${
                            isOutOfStock
                              ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                              : isLowStock
                              ? 'bg-amber-500/10 text-amber-300 border border-amber-500/20'
                              : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          }`}
                        >
                          {p.stock} units
                        </span>
                      </td>

                      {/* Price */}
                      <td className="py-3 px-4 font-mono font-bold text-white text-sm">
                        ₹{Number(p.price).toLocaleString('en-IN')}
                      </td>

                      {/* Sizes */}
                      <td className="py-3 px-4">
                        {p.sizes && p.sizes.length > 0 ? (
                          <div className="flex flex-wrap gap-1 max-w-[130px]">
                            {p.sizes.map((s) => (
                              <span
                                key={s}
                                className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-zinc-800 text-zinc-300 border border-white/5"
                              >
                                {s}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-zinc-400 font-mono text-[11px]">—</span>
                        )}
                      </td>

                      {/* Colors */}
                      <td className="py-3 px-4">
                        {p.colors && p.colors.length > 0 ? (
                          <div className="flex flex-wrap gap-1 max-w-[130px]">
                            {p.colors.map((c) => (
                              <span
                                key={c}
                                className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-zinc-800 text-zinc-300 border border-white/5"
                              >
                                {c}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-zinc-400 font-mono text-[11px]">—</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="inline-flex items-center space-x-1.5">
                          <button
                            type="button"
                            onClick={() => onEdit(p)}
                            className="p-1.5 rounded text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                            title="Edit Product"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteConfirmProduct({ id: p.id, name: p.name })}
                            className="p-1.5 rounded text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                            title="Delete Product"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      {deleteConfirmProduct && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-[#0F1219] border border-white/10 rounded-lg p-5 space-y-4 shadow-2xl">
            <div className="flex items-center space-x-2.5 text-rose-400">
              <AlertTriangle className="w-5 h-5" />
              <h4 className="text-sm font-semibold text-white">Delete Product?</h4>
            </div>
            <p className="text-xs text-zinc-300">
              Are you sure you want to remove <span className="font-semibold text-white">"{deleteConfirmProduct.name}"</span> from the store catalog? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmProduct(null)}
                className="px-3.5 py-1.5 rounded text-xs text-zinc-400 hover:text-white bg-zinc-800"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  onDelete(deleteConfirmProduct.id, deleteConfirmProduct.name)
                  setDeleteConfirmProduct(null)
                }}
                className="px-4 py-1.5 rounded bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
