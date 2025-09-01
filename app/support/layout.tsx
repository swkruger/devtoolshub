import { Metadata } from 'next'
import { getMetadataApplicationName } from '@/lib/app-config'

export const metadata: Metadata = {
  title: `Support – ${getMetadataApplicationName()}`,
  description: `Get help and support for ${getMetadataApplicationName()}. Submit support requests and get assistance.`,
  robots: { index: true, follow: true },
  alternates: { canonical: '/support' },
}

export default function SupportLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
