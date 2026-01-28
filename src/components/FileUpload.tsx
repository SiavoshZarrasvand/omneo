'use client'

import { useCallback, useState } from 'react'

interface FileUploadProps {
  onUploadComplete?: (result: {
    totalProcessed: number
    newContacts: number
    updatedContacts: number
  }) => void
}

export function FileUpload({ onUploadComplete }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const uploadFiles = async (files: File[]) => {
    setIsUploading(true)
    setError(null)

    try {
      const formData = new FormData()
      files.forEach((file) => {
        formData.append('files', file)
      })

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Upload failed')
      }

      onUploadComplete?.(data.summary)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setIsUploading(false)
    }
  }

  const handleDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(false)

      const files = Array.from(e.dataTransfer.files)
      const validFiles = files.filter(
        (file) => file.name.endsWith('.csv') || file.name.endsWith('.zip')
      )

      if (validFiles.length === 0) {
        setError('Please upload CSV or ZIP files only')
        return
      }

      await uploadFiles(validFiles)
    },
    [onUploadComplete]
  )

  const handleFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length > 0) {
      await uploadFiles(files)
    }
  }

  return (
    <div className="w-full">
      <label
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          relative flex flex-col items-center justify-center
          w-full h-64 border-2 border-dashed rounded-lg cursor-pointer
          transition-all duration-200
          ${
            isDragging
              ? 'border-primary bg-primary/5 scale-[1.02]'
              : 'border-border hover:border-primary/50 hover:bg-muted/50'
          }
          ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        <div className="flex flex-col items-center justify-center pt-5 pb-6">
          <svg
            className={`w-12 h-12 mb-4 transition-colors ${
              isDragging ? 'text-primary' : 'text-muted-foreground'
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
            />
          </svg>
          {isUploading ? (
            <p className="text-sm text-muted-foreground font-medium">
              Uploading...
            </p>
          ) : (
            <>
              <p className="mb-2 text-sm text-foreground font-semibold">
                <span className="text-primary">Click to upload</span> or drag
                and drop
              </p>
              <p className="text-xs text-muted-foreground">
                CSV or ZIP files (multiple files supported)
              </p>
            </>
          )}
        </div>
        <input
          type="file"
          className="hidden"
          accept=".csv,.zip"
          multiple
          onChange={handleFileInput}
          disabled={isUploading}
        />
      </label>

      {error && (
        <div className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}
    </div>
  )
}
