import type { Metadata } from 'next'
import { getChangelog } from '@/lib/changelog'

export const metadata: Metadata = {
  title: 'Changelog – DevToolsHub',
  description: 'Release notes and notable updates across DevToolsHub tools and platform.',
  robots: { index: true, follow: true },
  alternates: { canonical: '/changelog' },
}

export default function ChangelogPage() {
  const entries = getChangelog()
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
      {/* Lightweight header to mirror docs look */}
      <header className="docs-header">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center gap-3">
          <img src="/icons/icon-48x48.png" alt="DevToolsHub icon" width={24} height={24} className="rounded" />
          <div className="font-semibold docs-title">DevToolsHub Docs</div>
          <nav className="ml-auto flex items-center gap-4 text-sm docs-nav">
            <a href="/">Home</a>
            <a href="/#tools">All Tools</a>
            <a href="/docs">Docs</a>
            <a href="/sign-in">Sign in</a>
          </nav>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-10">
        <div className="max-w-3xl">
          <section className="docs-card mb-6">
            <h1 className="text-3xl font-bold mb-2 docs-title">Changelog</h1>
            <p className="docs-muted">Release notes and notable updates. Remember to update this page after each major tool development.</p>
          </section>
        </div>

        <div className="space-y-6 max-w-3xl">
        {entries.map((entry) => (
          <section key={`${entry.date}-${entry.title}`} className="docs-card">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xl font-semibold">{entry.title}</h2>
              <time className="text-sm docs-muted" dateTime={entry.date}>{entry.date}</time>
            </div>
            {entry.tags && entry.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {entry.tags.map((tag) => (
                  <span key={tag} className="text-xs px-2 py-1 rounded" style={{ background: 'var(--card)', border: '1px solid var(--border)', color: 'var(--muted)' }}>{tag}</span>
                ))}
              </div>
            )}
            <ul className="list-disc pl-5 space-y-1">
              {entry.items.map((item, idx) => (
                <li key={idx} className="text-sm leading-relaxed">{item}</li>
              ))}
            </ul>
          </section>
        ))}
        </div>
      </main>
    </div>
  )
}


