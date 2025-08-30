"use client"

import { useSignInModal } from '@/lib/use-sign-in-modal'
import { SignInModal } from './sign-in-modal'

export function SignInModalWrapper() {
  const { isOpen, closeModal, redirectTo } = useSignInModal()
  return <SignInModal open={isOpen} onOpenChange={closeModal} redirectTo={redirectTo} />
}
