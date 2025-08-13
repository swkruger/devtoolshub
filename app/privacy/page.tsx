import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy – DevToolsHub',
  description: 'Privacy principles for DevToolsHub tools and documentation.',
  robots: { index: true, follow: true },
  alternates: { canonical: '/privacy' },
}

export default function PrivacyPage() {
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
            <h1 className="text-3xl font-bold mb-2 docs-title">Privacy</h1>
            <p className="docs-muted">Our tools favor privacy‑preserving defaults. Here’s how we approach data handling.</p>
          </section>
          <section className="docs-card">
            <h2 className="text-xl font-semibold mb-2">Principles</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>Client‑side first: Where possible, processing happens in the browser; inputs are not transmitted.</li>
              <li>Authentication: Premium features use Supabase Auth; we do not share credentials with third parties.</li>
              <li>Storage: Any saved user preferences/snippets are protected by Row Level Security.</li>
              <li>Telemetry: If enabled in the future, it will be opt‑in with clear controls.</li>
            </ul>
          </section>
        </div>
      </main>
    </div>
  )
}


