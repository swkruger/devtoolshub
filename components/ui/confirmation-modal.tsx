"use client"

import * as React from "react"
import { AlertTriangle, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface ConfirmationModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  variant?: 'default' | 'destructive'
  icon?: React.ReactNode
}

export function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "default",
  icon
}: ConfirmationModalProps) {
  const [isLoading, setIsLoading] = React.useState(false)
  const modalRef = React.useRef<HTMLDivElement>(null)
  const cancelButtonRef = React.useRef<HTMLButtonElement>(null)

  // Focus trap and accessibility
  React.useEffect(() => {
    if (isOpen) {
      // Focus the modal when it opens
      modalRef.current?.focus()
      
      // Prevent body scroll
      document.body.style.overflow = 'hidden'
      
      return () => {
        document.body.style.overflow = 'unset'
      }
    }
  }, [isOpen])

  const handleConfirm = async () => {
    setIsLoading(true)
    try {
      await onConfirm()
    } finally {
      setIsLoading(false)
      onClose()
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose()
    }
  }

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      aria-describedby="modal-description"
    >
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleBackdropClick}
        aria-hidden="true"
      />
      
      {/* Modal */}
      <div 
        ref={modalRef}
        className="relative w-full max-w-md mx-4 bg-background border border-border rounded-lg shadow-lg focus:outline-none"
        onKeyDown={handleKeyDown}
        tabIndex={-1}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center gap-3">
            {icon && (
              <div className={cn(
                "p-2 rounded-full",
                variant === 'destructive' ? "bg-destructive/10 text-destructive" : "bg-primary/10 text-primary"
              )}>
                {icon}
              </div>
            )}
            <h2 id="modal-title" className="text-lg font-semibold">{title}</h2>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0"
            aria-label="Close modal"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6">
          <p id="modal-description" className="text-muted-foreground leading-relaxed">
            {message}
          </p>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-border">
          <Button
            ref={cancelButtonRef}
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
          >
            {cancelText}
          </Button>
          <Button
            variant={variant === 'destructive' ? 'destructive' : 'default'}
            onClick={handleConfirm}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                Processing...
              </>
            ) : (
              confirmText
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
