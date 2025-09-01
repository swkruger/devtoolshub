import { Metadata } from 'next'
import { getMetadataApplicationName } from '@/lib/app-config'

export const metadata: Metadata = {
  title: `Feedback – ${getMetadataApplicationName()}`,
  description: `Share feedback and suggestions to improve ${getMetadataApplicationName()}. Help us make our tools better.`,
}

export default function FeedbackLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
