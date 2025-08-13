import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Feedback – DevToolsHub',
  description: 'Share feedback and suggestions to improve DevToolsHub.',
  robots: { index: true, follow: true },
  alternates: { canonical: '/feedback' },
}

export default function FeedbackPage() {
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
  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)', color: 'var(--fg)' }}>
      <style dangerouslySetInnerHTML={{ __html: css }} />
      <header className="docs-header">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center gap-3">
          <img src="/icons/icon-48x48.png" alt="DevToolsHub icon" width={24} height={24} className="rounded" />
          <div className="font-semibold docs-title">DevToolsHub Docs</div>
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
            <h1 className="text-3xl font-bold mb-2 docs-title">Feedback</h1>
            <p className="docs-muted">We value your input. Tell us what to build next, report a bug, or request a feature.</p>
          </section>
          <section className="docs-card">
            <h2 className="text-xl font-semibold mb-2">How to share feedback</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>Email: <a href="mailto:contactme@devtoolskithub.com">contactme@devtoolskithub.com</a></li>
              <li>Include steps to reproduce, expected vs actual behavior, and screenshots when possible</li>
              <li>Mention whether you’re on Free or Premium to help us triage</li>
            </ul>
          </section>
        </div>
      </main>
    </div>
  )
}


