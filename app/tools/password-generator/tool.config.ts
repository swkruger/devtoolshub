import { Key, type LucideIcon } from 'lucide-react'

export interface LocalToolConfig {
  id: string
  name: string
  slug: string
  description: string
  category: 'security'
  tags: string[]
  icon: LucideIcon
  features: {
    free: string[]
    premium?: string[]
  }
}

export const toolConfig: LocalToolConfig = {
  id: 'password-generator',
  name: 'Password & Key-like Generator',
  slug: 'password-generator',
  description:
    'Generate strong passwords, passphrases, and private-key-like strings. Includes entropy/strength indicators and copy utilities.',
  category: 'security',
  tags: ['security', 'passwords', 'crypto-like', 'utilities'],
  icon: Key,
  features: {
    free: [
      'Password mode with length, charset toggles, and pronounceable option',
      'Passphrase mode with word count, separators, and suffix options',
      'Entropy display and basic strength estimation',
      'Copy and regenerate actions with toasts',
      'Local-only generation with no network calls',
    ],
    premium: [
      'Key-like mode: Hex, Base58, Base64, UUID v4, Bech32-like, PEM-like',
      'Advanced copy actions and consistent premium gating',
      'Disclaimer visible for key-like outputs',
    ],
  },
}


