import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Feedback – DevToolsHub',
  description: 'Share feedback and suggestions to improve DevToolsHub. Help us make our tools better.',
  robots: { index: true, follow: true },
  alternates: { canonical: '/feedback' },
}

export default function FeedbackLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
