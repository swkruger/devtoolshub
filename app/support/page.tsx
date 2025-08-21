'use client'

import { ContactForm } from '@/components/shared/contact-form'

export default function SupportPage() {
  const css = `
    :root { --bg:#f8fafc; --fg:#0f172a; --muted:#475569; --border:#e5e7eb; --card:#ffffff; --link:#2563eb; --linkh:#1d4ed8; }
    @media (prefers-color-scheme: dark){ :root { --bg:#0b0b0b; --fg:#eaeaea; --muted:#a3a3a3; --border:#222; --card:#0f172a; --link:#8ab4ff; --linkh:#a7c1ff; } }
    .docs-header { background: var(--card); border-bottom: 1px solid var(--border); }
    .docs-nav a { color: var(--link); text-decoration: none; }
    .docs-nav a:hover { color: var(--linkh); text-decoration: underline; }
    .docs-title { color: var(--fg); }
    .docs-muted { color: var(--muted); }
    .docs-card { background: var(--card); border: 1px solid var(--border); border-radius: 12px; padding: 16px; }
  `

  const handleSupportSubmit = async (data: any) => {
    try {
      const response = await fetch('/api/support', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      const result = await response.json()
      return result
    } catch (error) {
      console.error('Support submission error:', error)
      return { success: false, error: 'Failed to submit support request' }
    }
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)', color: 'var(--fg)' }}>
      <style dangerouslySetInnerHTML={{ __html: css }} />
      <header className="docs-header">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center gap-3">
          <img src="/icons/icon-48x48.png" alt="DevToolsHub icon" width={24} height={24} className="rounded" />
          <div className="font-semibold docs-title">DevToolsHub Support</div>
          <nav className="ml-auto flex items-center gap-4 text-sm docs-nav">
            <a href="/">Home</a>
            <a href="/#tools">All Tools</a>
            <a href="/docs">Docs</a>
            <a href="/changelog">Changelog</a>
          </nav>
        </div>
      </header>
      <main className="max-w-5xl mx-auto px-4 py-10">
        <div className="space-y-6 max-w-3xl">
          <section className="docs-card">
            <h1 className="text-3xl font-bold mb-2 docs-title">Support</h1>
            <p className="docs-muted">We&apos;re here to help. Submit a support request and we&apos;ll get back to you as soon as possible.</p>
          </section>

          <section className="docs-card">
            <h2 className="text-xl font-semibold mb-4">Quick Resources</h2>
            <ul className="list-disc pl-5 space-y-1 docs-muted">
              <li><a href="/docs" className="docs-nav">Documentation</a> - Comprehensive guides for all tools</li>
              <li><a href="/changelog" className="docs-nav">Changelog</a> - Latest updates and known issues</li>
              <li><a href="/feedback" className="docs-nav">Feedback Form</a> - Report bugs or request features</li>
            </ul>
          </section>

          <section className="docs-card">
            <h2 className="text-xl font-semibold mb-4">Submit Support Request</h2>
            <ContactForm type="support" onSubmit={handleSupportSubmit} />
          </section>
        </div>
      </main>
    </div>
  )
}


