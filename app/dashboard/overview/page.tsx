import { Metadata } from 'next'
import { getMetadataApplicationName } from '@/lib/app-config'
import Link from 'next/link'

export const metadata: Metadata = {
  title: `Dashboard Overview – ${getMetadataApplicationName()}`,
  description: `Overview of the ${getMetadataApplicationName()} dashboard: browse tools, quick access to JSON, RegEx, JWT, Base64, UUID, timestamps, XPath/CSS, images, and more.`,
  robots: { index: true, follow: true },
  alternates: { canonical: '/dashboard/overview' },
}

export default function DashboardOverviewPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
          Dashboard Overview
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          The {getMetadataApplicationName()} dashboard is your home base for launching essential developer tools. It provides a
          centralized location to access all the utilities you need for web development, testing, and debugging.
        </p>
      </div>

      <h2 className="text-xl font-semibold mb-2">What you can do</h2>
      <ul className="list-disc pl-6 space-y-1 mb-6">
        <li>Browse all available tools in one place</li>
        <li>Read short descriptions to quickly find the right utility</li>
        <li>Open any tool directly from the dashboard</li>
      </ul>

      <h2 className="text-xl font-semibold mb-2">Popular tools</h2>
      <ul className="list-disc pl-6 space-y-1 mb-6">
        <li><Link className="underline" href="/tools/json-formatter">JSON Formatter</Link> – Format and validate JSON</li>
        <li><Link className="underline" href="/tools/regex-tester">Regex Tester</Link> – Test patterns with live matching</li>
        <li><Link className="underline" href="/tools/jwt-decoder">JWT Decoder/Encoder</Link> – Decode, encode, verify tokens</li>
        <li><Link className="underline" href="/tools/base64-encoder">Base64 Encoder/Decoder</Link> – Text and files</li>
      </ul>

      <div className="mt-8">
        <Link
          href="/dashboard"
          className="inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          Go to Dashboard
        </Link>
      </div>
    </div>
  )
}


