'use client'
import { useRef, useState } from 'react'
import Image from 'next/image'
import { Upload, X, ImagePlus, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { cn } from '@/lib/cn'

interface ImageUploadProps {
  value: string        // current URL
  onChange: (url: string) => void
  onRemove?: () => void
  placeholder?: string
  className?: string
}

export default function ImageUpload({ value, onChange, onRemove, placeholder, className }: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)

  const upload = async (file: File) => {
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await fetch('/api/upload', { method: 'POST', body: fd })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Upload failed')
      onChange(data.url)
      toast.success('Image uploaded!')
    } catch (err: any) {
      toast.error(err.message || 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) return toast.error('Please select an image file')
    if (file.size > 5 * 1024 * 1024) return toast.error('Max file size is 5MB')
    upload(file)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
    e.target.value = ''
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files?.[0]
    if (file) handleFile(file)
  }

  return (
    <div className={cn('relative', className)}>
      {value ? (
        /* Preview */
        <div className="relative group">
          <div className="relative w-full aspect-square sm:aspect-[4/3] bg-stone-100 rounded-lg overflow-hidden">
            <Image src={value} alt="Product image" fill className="object-cover" />
            {/* Overlay on hover/tap */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100">
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="p-2 bg-white rounded-full text-stone-700 hover:bg-stone-100 touch-manipulation"
                title="Replace image"
              >
                <Upload className="w-4 h-4" />
              </button>
              {onRemove && (
                <button
                  type="button"
                  onClick={onRemove}
                  className="p-2 bg-white rounded-full text-red-600 hover:bg-red-50 touch-manipulation"
                  title="Remove image"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
          {/* Mobile: always visible action buttons */}
          <div className="sm:hidden flex gap-2 mt-2">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="flex-1 flex items-center justify-center gap-2 h-9 border border-stone-200 rounded-md text-xs text-stone-600 active:bg-stone-50 touch-manipulation"
            >
              <Upload className="w-3.5 h-3.5" /> Replace
            </button>
            {onRemove && (
              <button
                type="button"
                onClick={onRemove}
                className="flex-1 flex items-center justify-center gap-2 h-9 border border-red-200 rounded-md text-xs text-red-600 active:bg-red-50 touch-manipulation"
              >
                <X className="w-3.5 h-3.5" /> Remove
              </button>
            )}
          </div>
        </div>
      ) : (
        /* Drop zone */
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          disabled={uploading}
          className={cn(
            'w-full aspect-square sm:aspect-[4/3] border-2 border-dashed rounded-lg flex flex-col items-center justify-center gap-2 transition-colors touch-manipulation',
            dragOver ? 'border-banjaran-500 bg-banjaran-50' : 'border-stone-200 hover:border-stone-300 bg-stone-50',
            uploading && 'opacity-60 cursor-wait'
          )}
        >
          {uploading ? (
            <>
              <Loader2 className="w-7 h-7 text-banjaran-700 animate-spin" />
              <span className="text-xs text-stone-500">Uploading...</span>
            </>
          ) : (
            <>
              <ImagePlus className="w-7 h-7 text-stone-400" />
              <span className="text-xs text-stone-500 text-center px-4">
                {placeholder || 'Tap to upload or drag & drop'}
              </span>
              <span className="text-[10px] text-stone-400">JPG, PNG, WebP · max 5MB</span>
            </>
          )}
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={handleInputChange}
      />
    </div>
  )
}
