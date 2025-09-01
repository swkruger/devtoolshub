import { Metadata } from 'next'
import { FeedbackForm } from '@/components/feedback/feedback-form'
import { getMetadataApplicationName } from '@/lib/app-config'

export const metadata: Metadata = {
  title: `Feedback – ${getMetadataApplicationName()}`,
  description: `Share feedback and suggestions to improve ${getMetadataApplicationName()}. Help us make our tools better.`,
}

export default function FeedbackPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-3 mb-4">
          <img src="/icons/icon-48x48.png" alt={`${getMetadataApplicationName()} icon`} width={24} height={24} className="rounded" />
          <div className="font-semibold docs-title">{getMetadataApplicationName()} Feedback</div>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
          We&apos;d Love to Hear From You
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          We value your input! Share your thoughts, report bugs, or suggest new features to help us improve {getMetadataApplicationName()}.
        </p>
      </div>

      <FeedbackForm />
    </div>
  )
}


