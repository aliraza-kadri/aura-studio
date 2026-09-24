'use client'

import React, { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import {
  X,
  Upload,
  Image as ImageIcon,
  Trash2,
  RefreshCw,
  Plus,
  Check,
  AlertCircle,
} from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import type { Product } from '@/types/database'

interface ProductModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (productData: Partial<Product>, isEdit: boolean) => Promise<void>
  productToEdit?: Product | null
}

const COMMON_CATEGORIES = [
  'Suits',
  'Blazers',
  'Tuxedos',
  'Dress Shirts',
  'Trousers',
  'Bespoke Fabric',
  'Accessories',
  'Footwear',
]

const PRESET_SIZES = ['38', '40', '42', '44', '46', 'S', 'M', 'L', 'XL', 'XXL']
const PRESET_COLORS = ['Navy', 'Charcoal', 'Black', 'White', 'Beige', 'Wine', 'Olive', 'Grey']

export const ProductModal: React.FC<ProductModalProps> = ({
  isOpen,
  onClose,
  onSave,
  productToEdit,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [name, setName] = useState('')
  const [sku, setSku] = useState('')
  const [category, setCategory] = useState('Suits')
  const [customCategory, setCustomCategory] = useState('')
  const [price, setPrice] = useState<number | ''>('')
  const [stock, setStock] = useState<number | ''>('')
  const [description, setDescription] = useState('')
  const [sizes, setSizes] = useState<string[]>([])
  const [colors, setColors] = useState<string[]>([])
  const [customSize, setCustomSize] = useState('')
  const [customColor, setCustomColor] = useState('')

  // Image state
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [isUploadingImage, setIsUploadingImage] = useState(false)
  const [uploadWarning, setUploadWarning] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Populate form when editing or opening
  useEffect(() => {
    if (productToEdit) {
      setName(productToEdit.name || '')
      setPrice(productToEdit.price ?? '')
      setStock(productToEdit.stock ?? '')
      setCategory(
        COMMON_CATEGORIES.includes(productToEdit.category || '')
          ? productToEdit.category || 'Suits'
          : 'Other'
      )
      if (!COMMON_CATEGORIES.includes(productToEdit.category || '')) {
        setCustomCategory(productToEdit.category || '')
      } else {
        setCustomCategory('')
      }
      setSizes(productToEdit.sizes || [])
      setColors(productToEdit.colors || [])
      setImageUrl(productToEdit.image_url || null)
      setImagePreview(productToEdit.image_url || null)
      setImageFile(null)

      // Parse SKU from description if stored as `[SKU: ...] text`
      const desc = productToEdit.description || ''
      const skuMatch = desc.match(/\[SKU:\s*([^\]]+)\]/)
      if (skuMatch) {
        setSku(skuMatch[1].trim())
        setDescription(desc.replace(/\[SKU:\s*[^\]]+\]\s*/, ''))
      } else {
        setSku('')
        setDescription(desc)
      }
    } else {
      setName('')
      setSku('')
      setCategory('Suits')
      setCustomCategory('')
      setPrice('')
      setStock('')
      setDescription('')
      setSizes(['38', '40', '42'])
      setColors(['Navy', 'Charcoal'])
      setImageUrl(null)
      setImagePreview(null)
      setImageFile(null)
    }
    setUploadWarning(null)
    setError(null)
  }, [productToEdit, isOpen])

  if (!isOpen) return null

  // Handle local image selection from device
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Preview
    setImageFile(file)
    const objectUrl = URL.createObjectURL(file)
    setImagePreview(objectUrl)
    setUploadWarning(null)
  }

  const handleRemoveImage = () => {
    setImageFile(null)
    setImagePreview(null)
    setImageUrl(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  // Toggle presets
  const toggleSize = (s: string) => {
    setSizes((prev) => (prev.includes(s) ? prev.filter((item) => item !== s) : [...prev, s]))
  }

  const addCustomSize = () => {
    if (customSize.trim() && !sizes.includes(customSize.trim())) {
      setSizes((prev) => [...prev, customSize.trim()])
      setCustomSize('')
    }
  }

  const toggleColor = (c: string) => {
    setColors((prev) => (prev.includes(c) ? prev.filter((item) => item !== c) : [...prev, c]))
  }

  const addCustomColor = () => {
    if (customColor.trim() && !colors.includes(customColor.trim())) {
      setColors((prev) => [...prev, customColor.trim()])
      setCustomColor('')
    }
  }

  // Upload image to Supabase Storage or convert to data URL fallback
  const uploadImageToSupabase = async (file: File): Promise<string> => {
    setIsUploadingImage(true)
    try {
      const ext = file.name.split('.').pop() || 'png'
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`
      const filePath = `products/${fileName}`

      // Attempt upload to Supabase storage 'products' bucket
      const { data, error: uploadErr } = await supabase.storage
        .from('products')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true,
        })

      if (!uploadErr && data) {
        const { data: publicData } = supabase.storage
          .from('products')
          .getPublicUrl(filePath)

        return publicData.publicUrl
      } else {
        console.warn('Storage upload error, falling back to client base64 data url:', uploadErr)
        // Convert to data URL so the user is not blocked
        return new Promise<string>((resolve) => {
          const reader = new FileReader()
          reader.onloadend = () => {
            setUploadWarning(
              "Uploaded as local image. (To enable cloud URL hosting, create a public 'products' bucket in Supabase Storage)."
            )
            resolve(reader.result as string)
          }
          reader.readAsDataURL(file)
        })
      }
    } catch {
      return new Promise<string>((resolve) => {
        const reader = new FileReader()
        reader.onloadend = () => resolve(reader.result as string)
        reader.readAsDataURL(file)
      })
    } finally {
      setIsUploadingImage(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || price === '' || stock === '') {
      setError('Please fill in Product Name, Price, and Stock Quantity.')
      return
    }

    setIsSaving(true)
    setError(null)

    try {
      let finalImageUrl = imageUrl

      if (imageFile) {
        finalImageUrl = await uploadImageToSupabase(imageFile)
      }

      // Embed SKU in description if provided
      let finalDescription = description.trim()
      if (sku.trim()) {
        finalDescription = `[SKU: ${sku.trim()}] ${finalDescription}`.trim()
      }

      const finalCategory = category === 'Other' ? customCategory.trim() || 'Apparel' : category

      const productPayload: Partial<Product> = {
        name: name.trim(),
        price: Number(price),
        stock: Number(stock),
        category: finalCategory,
        description: finalDescription || null,
        sizes: sizes.length > 0 ? sizes : null,
        colors: colors.length > 0 ? colors : null,
        image_url: finalImageUrl,
      }

      await onSave(productPayload, !!productToEdit)
      onClose()
    } catch (err: unknown) {
      const rawMsg =
        (err as any)?.message ||
        (err as any)?.error_description ||
        (err instanceof Error ? err.message : 'Failed to save product')
      const msg = rawMsg.includes('row-level security')
        ? 'Database RLS Error: Supabase permissions not configured for products. Please run supabase_setup.sql in Supabase SQL editor.'
        : rawMsg
      setError(msg)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="w-full max-w-2xl bg-[#0F1219] border border-white/10 rounded-lg shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-white/10 bg-[#0A0D14] flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-400">
              Inventory Catalog
            </span>
            <h3 className="text-sm sm:text-base font-semibold text-white tracking-wide">
              {productToEdit ? 'Edit Product Profile' : 'Add New Retail Product'}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-md text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body / Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4 text-xs">
          {error && (
            <div className="p-3 rounded bg-rose-500/10 border border-rose-500/20 text-rose-300 flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {uploadWarning && (
            <div className="p-2.5 rounded bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[11px]">
              {uploadWarning}
            </div>
          )}

          {/* Image Upload Area */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 block">
              Product Photo (Device Upload)
            </label>

            <div className="flex items-center space-x-4">
              {imagePreview ? (
                <div className="relative w-24 h-24 rounded-md border border-white/15 overflow-hidden bg-black shrink-0">
                  <Image
                    src={imagePreview}
                    alt="Preview"
                    fill
                    className="object-cover"
                  />
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="absolute top-1 right-1 p-1 rounded-full bg-black/80 text-rose-400 hover:text-rose-300"
                    title="Remove Image"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <div className="w-24 h-24 rounded-md border border-dashed border-white/15 flex flex-col items-center justify-center text-zinc-400 bg-zinc-900/60 shrink-0">
                  <ImageIcon className="w-6 h-6 mb-1" />
                  <span className="text-[10px] font-mono">No Image</span>
                </div>
              )}

              <div className="space-y-2 flex-1">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded bg-zinc-800 hover:bg-zinc-700 text-white font-medium border border-white/10 transition-colors"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>{imagePreview ? 'Replace Photo' : 'Upload From Device'}</span>
                </button>
                <p className="text-[10px] text-zinc-400">
                  Supports JPG, PNG, WEBP. Uploaded automatically to Supabase storage.
                </p>
              </div>
            </div>
          </div>

          {/* Basic Info: Name & SKU */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2 space-y-1">
              <label className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 block">
                Product Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Bespoke 3-Piece Charcoal Wool Suit"
                className="w-full px-3 py-2 bg-zinc-900 border border-white/10 rounded text-xs text-white placeholder-zinc-400 focus:outline-hidden"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 block">
                SKU / Barcode
              </label>
              <input
                type="text"
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                placeholder="e.g. AS-SUIT-001"
                className="w-full px-3 py-2 bg-zinc-900 border border-white/10 rounded text-xs text-white placeholder-zinc-400 font-mono focus:outline-hidden"
              />
            </div>
          </div>

          {/* Pricing, Stock, Category */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 block">
                Price (₹ INR) *
              </label>
              <input
                type="number"
                required
                min="0"
                step="1"
                value={price}
                onChange={(e) => setPrice(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder="e.g. 45000"
                className="w-full px-3 py-2 bg-zinc-900 border border-white/10 rounded text-xs text-white font-mono placeholder-zinc-400 focus:outline-hidden"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 block">
                Stock Quantity *
              </label>
              <input
                type="number"
                required
                min="0"
                step="1"
                value={stock}
                onChange={(e) => setStock(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder="e.g. 10"
                className="w-full px-3 py-2 bg-zinc-900 border border-white/10 rounded text-xs text-white font-mono placeholder-zinc-400 focus:outline-hidden"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 block">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 bg-zinc-900 border border-white/10 rounded text-xs text-white focus:outline-hidden"
              >
                {COMMON_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
                <option value="Other">Other / Custom</option>
              </select>
            </div>
          </div>

          {category === 'Other' && (
            <div className="space-y-1">
              <label className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 block">
                Custom Category Name
              </label>
              <input
                type="text"
                value={customCategory}
                onChange={(e) => setCustomCategory(e.target.value)}
                placeholder="e.g. Pocket Squares"
                className="w-full px-3 py-2 bg-zinc-900 border border-white/10 rounded text-xs text-white"
              />
            </div>
          )}

          {/* Sizes Selector */}
          <div className="space-y-1.5 pt-1">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-mono uppercase tracking-wider text-zinc-400">
                Available Sizes
              </label>
              <span className="text-[10px] text-zinc-400 font-mono">
                {sizes.length} selected
              </span>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {PRESET_SIZES.map((s) => {
                const active = sizes.includes(s)
                return (
                  <button
                    key={s}
                    type="button"
                    onClick={() => toggleSize(s)}
                    className={`px-2.5 py-1 rounded text-xs font-mono transition-colors ${
                      active
                        ? 'bg-white text-black font-bold'
                        : 'bg-zinc-900 text-zinc-400 hover:text-white border border-white/5'
                    }`}
                  >
                    {s}
                  </button>
                )
              })}
            </div>

            <div className="flex items-center space-x-2 pt-1">
              <input
                type="text"
                value={customSize}
                onChange={(e) => setCustomSize(e.target.value)}
                placeholder="Add custom size (e.g. 48L, Tailored)"
                className="flex-1 px-2.5 py-1 bg-zinc-900 border border-white/10 rounded text-xs text-white"
              />
              <button
                type="button"
                onClick={addCustomSize}
                className="px-3 py-1 bg-zinc-800 hover:bg-zinc-700 text-white rounded text-xs font-medium"
              >
                + Add
              </button>
            </div>
          </div>

          {/* Colors Selector */}
          <div className="space-y-1.5 pt-1">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-mono uppercase tracking-wider text-zinc-400">
                Available Colors
              </label>
              <span className="text-[10px] text-zinc-400 font-mono">
                {colors.length} selected
              </span>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {PRESET_COLORS.map((c) => {
                const active = colors.includes(c)
                return (
                  <button
                    key={c}
                    type="button"
                    onClick={() => toggleColor(c)}
                    className={`px-2.5 py-1 rounded text-xs font-mono transition-colors ${
                      active
                        ? 'bg-white text-black font-bold'
                        : 'bg-zinc-900 text-zinc-400 hover:text-white border border-white/5'
                    }`}
                  >
                    {c}
                  </button>
                )
              })}
            </div>

            <div className="flex items-center space-x-2 pt-1">
              <input
                type="text"
                value={customColor}
                onChange={(e) => setCustomColor(e.target.value)}
                placeholder="Add custom color (e.g. Midnight Blue, Houndstooth)"
                className="flex-1 px-2.5 py-1 bg-zinc-900 border border-white/10 rounded text-xs text-white"
              />
              <button
                type="button"
                onClick={addCustomColor}
                className="px-3 py-1 bg-zinc-800 hover:bg-zinc-700 text-white rounded text-xs font-medium"
              >
                + Add
              </button>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1 pt-1">
            <label className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 block">
              Description & Tailoring Notes
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Super 150s Italian wool, peak lapel, double vented back..."
              className="w-full px-3 py-2 bg-zinc-900 border border-white/10 rounded text-xs text-white placeholder-zinc-400 focus:outline-hidden resize-none"
            />
          </div>

          {/* Footer actions */}
          <div className="pt-4 border-t border-white/10 flex items-center justify-between">
            <p className="text-[10px] text-zinc-400 font-mono">
              Changes sync instantly with POS and Store Inventory
            </p>

            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded text-xs text-zinc-400 hover:text-white bg-zinc-900 border border-white/10"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving || isUploadingImage}
                className="px-5 py-2 rounded bg-white hover:bg-zinc-200 text-black text-xs font-bold transition-colors disabled:opacity-50 flex items-center space-x-1.5"
              >
                {isSaving ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <span>{productToEdit ? 'Save Changes' : 'Add to Inventory'}</span>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
