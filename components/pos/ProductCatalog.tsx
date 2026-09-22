'use client'

import React, { useState, useMemo } from 'react'
import { Search, Plus, Shirt, AlertCircle, Check } from 'lucide-react'
import type { Product } from '@/types/database'
import type { CartItem } from './types'

interface ProductCatalogProps {
  products: Product[]
  isLoading: boolean
  onAddToCart: (item: CartItem) => void
}

export const ProductCatalog: React.FC<ProductCatalogProps> = ({
  products,
  isLoading,
  onAddToCart,
}) => {
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedSizes, setSelectedSizes] = useState<Record<string, string>>({})
  const [selectedColors, setSelectedColors] = useState<Record<string, string>>({})

  const categories = useMemo(() => {
    const cats = new Set<string>()
    products.forEach((p) => {
      if (p.category) cats.add(p.category)
    })
    return ['all', ...Array.from(cats)]
  }, [products])

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch =
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        (p.category && p.category.toLowerCase().includes(search.toLowerCase()))
      const matchesCat =
        selectedCategory === 'all' ||
        (p.category && p.category.toLowerCase() === selectedCategory.toLowerCase())
      return matchesSearch && matchesCat
    })
  }, [products, search, selectedCategory])

  const handleAdd = (product: Product) => {
    if (product.stock <= 0) return
    const chosenSize =
      selectedSizes[product.id] || (product.sizes && product.sizes.length > 0 ? product.sizes[0] : null)
    const chosenColor =
      selectedColors[product.id] || (product.colors && product.colors.length > 0 ? product.colors[0] : null)

    onAddToCart({
      productId: product.id,
      name: product.name,
      price: Number(product.price),
      quantity: 1,
      size: chosenSize,
      color: chosenColor,
      availableStock: product.stock,
      category: product.category,
    })
  }

  return (
    <div className="flex flex-col h-full bg-[#0C0F17] border border-white/10 rounded-lg overflow-hidden shadow-sm">
      {/* Search and Category Filter Toolbar */}
      <div className="p-4 border-b border-white/10 bg-[#0A0D14] space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-zinc-400" />
          <input
            type="text"
            placeholder="Search inventory by product name, SKU, or category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-zinc-900 border border-white/10 rounded-md text-xs text-white placeholder-zinc-400 focus:outline-hidden focus:border-white/30 transition-all font-sans"
          />
        </div>

        <div className="flex items-center space-x-1.5 overflow-x-auto pb-0.5">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-md text-xs font-mono uppercase tracking-wider transition-colors shrink-0 ${
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

      {/* Products Grid */}
      <div className="flex-1 overflow-y-auto p-4">
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="h-40 rounded-md bg-zinc-900/60 border border-white/5 animate-pulse"
              />
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center text-center p-6">
            <Shirt className="w-8 h-8 text-zinc-400 mb-2" />
            <h4 className="text-xs font-semibold text-zinc-200">No products found in inventory</h4>
            <p className="text-[11px] text-zinc-400 max-w-xs mt-1">
              Add products to the database or adjust your search filter to browse items.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredProducts.map((p) => {
              const isOutOfStock = p.stock <= 0
              const isLowStock = p.stock > 0 && p.stock <= 3
              const chosenSize = selectedSizes[p.id] || (p.sizes && p.sizes[0])
              const chosenColor = selectedColors[p.id] || (p.colors && p.colors[0])

              return (
                <div
                  key={p.id}
                  className={`rounded-md bg-zinc-900/90 border p-3.5 flex flex-col justify-between transition-all ${
                    isOutOfStock
                      ? 'border-zinc-800 opacity-60'
                      : 'border-white/10 hover:border-white/25'
                  }`}
                >
                  <div className="space-y-1.5">
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-[10px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-white/5">
                        {p.category || 'Apparel'}
                      </span>
                      <span
                        className={`text-[10px] font-mono uppercase px-1.5 py-0.5 rounded ${
                          isOutOfStock
                            ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                            : isLowStock
                            ? 'bg-amber-500/10 text-amber-300 border border-amber-500/20'
                            : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        }`}
                      >
                        {isOutOfStock ? 'Out of Stock' : `${p.stock} in stock`}
                      </span>
                    </div>

                    <h4 className="text-xs font-semibold text-white leading-snug line-clamp-2">
                      {p.name}
                    </h4>

                    <p className="text-sm font-mono font-bold text-zinc-100">
                      ₹{Number(p.price).toLocaleString('en-IN')}
                    </p>
                  </div>

                  {/* Size & Color Selector Pills */}
                  <div className="space-y-2 mt-3 pt-2.5 border-t border-white/5">
                    {p.sizes && p.sizes.length > 0 && (
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[10px] text-zinc-400 font-mono">Size:</span>
                        {p.sizes.map((s) => (
                          <button
                            key={s}
                            type="button"
                            onClick={() =>
                              setSelectedSizes((prev) => ({ ...prev, [p.id]: s }))
                            }
                            className={`px-1.5 py-0.5 text-[10px] font-mono rounded transition-colors ${
                              chosenSize === s
                                ? 'bg-white text-black font-bold'
                                : 'bg-zinc-800 text-zinc-300 hover:text-white'
                            }`}
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    )}

                    {p.colors && p.colors.length > 0 && (
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[10px] text-zinc-400 font-mono">Color:</span>
                        {p.colors.map((c) => (
                          <button
                            key={c}
                            type="button"
                            onClick={() =>
                              setSelectedColors((prev) => ({ ...prev, [p.id]: c }))
                            }
                            className={`px-1.5 py-0.5 text-[10px] font-mono rounded transition-colors ${
                              chosenColor === c
                                ? 'bg-white text-black font-bold'
                                : 'bg-zinc-800 text-zinc-300 hover:text-white'
                            }`}
                          >
                            {c}
                          </button>
                        ))}
                      </div>
                    )}

                    <button
                      type="button"
                      disabled={isOutOfStock}
                      onClick={() => handleAdd(p)}
                      className="w-full mt-2 py-1.5 rounded bg-zinc-800 hover:bg-zinc-700 disabled:opacity-40 text-xs font-semibold text-white flex items-center justify-center space-x-1 transition-colors border border-white/10"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add to Cart</span>
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
