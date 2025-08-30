"use client"

import { createContext, useContext, useState, ReactNode } from 'react'

interface SignInModalContextType {
  isOpen: boolean
  openModal: (redirectTo?: string) => void
  closeModal: () => void
  redirectTo: string
}

const SignInModalContext = createContext<SignInModalContextType | undefined>(undefined)

export function SignInModalProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  const [redirectTo, setRedirectTo] = useState('/dashboard')

  const openModal = (newRedirectTo?: string) => {
    if (newRedirectTo) {
      setRedirectTo(newRedirectTo)
    }
    setIsOpen(true)
  }

  const closeModal = () => {
    setIsOpen(false)
  }

  return (
    <SignInModalContext.Provider value={{ isOpen, openModal, closeModal, redirectTo }}>
      {children}
    </SignInModalContext.Provider>
  )
}

export function useSignInModal() {
  const context = useContext(SignInModalContext)
  if (context === undefined) {
    throw new Error('useSignInModal must be used within a SignInModalProvider')
  }
  return context
}
