import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Support – DevToolsHub',
  description: 'Get help and support for DevToolsHub. Submit support requests and get assistance.',
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
