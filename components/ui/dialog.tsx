"use client"

import * as React from "react"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface DialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  children: React.ReactNode
}

interface DialogContentProps {
  children: React.ReactNode
  className?: string
}

interface DialogHeaderProps {
  children: React.ReactNode
  className?: string
}

interface DialogTitleProps {
  children: React.ReactNode
  className?: string
}

interface DialogTriggerProps {
  children: React.ReactNode
  asChild?: boolean
}

export function Dialog({ open, onOpenChange, children }: DialogProps) {
  const [isOpen, setIsOpen] = React.useState(open)

  React.useEffect(() => {
    setIsOpen(open)
  }, [open])

  const handleClose = () => {
    setIsOpen(false)
    onOpenChange(false)
  }

  // Prevent body scroll when dialog is open
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
      return () => {
        document.body.style.overflow = 'unset'
      }
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
    >
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
        aria-hidden="true"
      />
      
      {/* Dialog Content */}
      <div className="relative w-full max-w-md mx-4 bg-background border border-border rounded-lg shadow-lg">
        {React.Children.map(children, (child) => {
          if (React.isValidElement(child)) {
            return React.cloneElement(child, { onClose: handleClose })
          }
          return child
        })}
      </div>
    </div>
  )
}

export function DialogContent({ children, className }: DialogContentProps) {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      // Find the closest Dialog parent and close it
      const dialog = e.currentTarget.closest('[role="dialog"]')
      if (dialog) {
        const closeEvent = new CustomEvent('close-dialog')
        dialog.dispatchEvent(closeEvent)
      }
    }
  }

  return (
    <div 
      className={cn("relative", className)}
      onKeyDown={handleKeyDown}
      tabIndex={-1}
    >
      {children}
    </div>
  )
}

export function DialogHeader({ children, className }: DialogHeaderProps) {
  return (
    <div className={cn("flex items-center justify-between p-6 border-b border-border", className)}>
      {children}
    </div>
  )
}

export function DialogTitle({ children, className }: DialogTitleProps) {
  return (
    <h2 className={cn("text-lg font-semibold", className)}>
      {children}
    </h2>
  )
}

export function DialogTrigger({ children, asChild }: DialogTriggerProps) {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    // Find the closest Dialog parent and open it
    const dialog = e.currentTarget.closest('[data-dialog-trigger]')
    if (dialog) {
      const openEvent = new CustomEvent('open-dialog')
      dialog.dispatchEvent(openEvent)
    }
  }

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, {
      onClick: handleClick,
      'data-dialog-trigger': true
    })
  }

  return (
    <div onClick={handleClick} data-dialog-trigger>
      {children}
    </div>
  )
}
