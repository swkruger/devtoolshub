import { Globe, type LucideIcon } from 'lucide-react'

export interface LocalToolConfig {
  id: string
  name: string
  slug: string
  description: string
  category: 'web'
  tags: string[]
  icon: LucideIcon
  features: { free: string[]; premium?: string[] }
}

export const toolConfig: LocalToolConfig = {
  id: 'pwa-assets',
  name: 'PWA Assets & Manifest Generator',
  slug: 'pwa-assets',
  description: 'Generate PWA icons, favicons, maskable icons, iOS/Android assets, and a ready-to-use manifest.json and HTML tags.',
  category: 'web',
  tags: ['pwa', 'icons', 'manifest', 'favicon', 'maskable', 'ios', 'android'],
  icon: Globe,
  features: {
    free: [
      'Standard manifest icons (48..512)',
      'Favicons (16/32/48)',
      'Apple touch 180x180',
      'Optional maskable 192/512',
      'Manifest.json + basic link tags',
      'ZIP export',
    ],
    premium: [
      'Full iOS/Android matrices',
      'Splash screens (light/dark)',
      'Windows tiles & Safari pinned tab',
      'Light/Dark variants with themed manifest',
      'Batch brand mode',
    ],
  },
}


