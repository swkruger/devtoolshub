/*
  DevToolsHub Docs Generator
  - Reads tool metadata from lib/tools.ts
  - Emits static HTML docs under docs/<slug>/index.html
  - Creates docs/index.html, docs/sitemap.xml, and docs/feed.xml

  # Reason: Provide portable, SEO-optimized static documentation per DOCS_PROMPT.md
*/

import fs from 'node:fs'
import path from 'node:path'

// Use relative import to avoid path alias issues in Node/tsx
import { getAllTools, type ToolConfig } from '../lib/tools'

type BuildContext = {
  appHost: string
  docsRootHost: string
  outputDir: string
  nowISO: string
  contentDir: string
}

const APP_ASSET_HOST_DEFAULT = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
const DOCS_ROOT_HOST_DEFAULT = 'https://devtoolshub.dev'

function ensureDir(dirPath: string) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true })
  }
}

function readFileIfExists(filePath: string): string | null {
  try {
    if (fs.existsSync(filePath)) {
      return fs.readFileSync(filePath, 'utf8')
    }
    return null
  } catch {
    return null
  }
}

function toolSlug(tool: ToolConfig): string {
  // Prefer id which matches our path slugs
  return tool.id
}

function toolCanonical(tool: ToolConfig, ctx: BuildContext): string {
  // Per-tool docs host is <slug>.devtoolshub.dev
  return `https://${toolSlug(tool)}.${new URL(ctx.docsRootHost).host}/`
}

function ogImageUrl(ctx: BuildContext): string {
  return getAssetUrl('/icons/icon-512x512.png', ctx)
}

function htmlEscape(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function getAssetUrl(pathname: string, ctx: BuildContext): string {
  // Prefer absolute host if provided; otherwise fall back to root-absolute for same-origin serving
  if (ctx.appHost) {
    return `${ctx.appHost}${pathname}`
  }
  return pathname
}

function buildHead(tool: ToolConfig, ctx: BuildContext): string {
  const title = `${tool.name} – DevToolsHub`
  const description = tool.shortDescription || tool.description
  const canonical = toolCanonical(tool, ctx)
  const ogImg = ogImageUrl(ctx)
  const keywords = (tool.tags || []).join(', ')

  return `
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${htmlEscape(title)}</title>
    <meta name="description" content="${htmlEscape(description)}" />
    <link rel="canonical" href="${canonical}" />
    <meta name="robots" content="index,follow" />
    <meta name="keywords" content="${htmlEscape(keywords)}" />

    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="DevToolsHub" />
    <meta property="og:title" content="${htmlEscape(title)}" />
    <meta property="og:description" content="${htmlEscape(description)}" />
    <meta property="og:url" content="${canonical}" />
    <meta property="og:image" content="${ogImg}" />

    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${htmlEscape(title)}" />
    <meta name="twitter:description" content="${htmlEscape(description)}" />
    <meta name="twitter:image" content="${ogImg}" />

    <link rel="icon" href="${getAssetUrl('/icons/favicon-32x32.png', ctx)}" />
    <link rel="apple-touch-icon" href="${getAssetUrl('/icons/icon-192x192.png', ctx)}" />
  `
}

function buildSoftwareApplicationJsonLd(tool: ToolConfig, ctx: BuildContext): string {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: tool.name,
    applicationCategory: 'DeveloperApplication',
    operatingSystem: 'Web',
    description: tool.description,
    url: toolCanonical(tool, ctx),
    image: ogImageUrl(ctx),
    author: { '@type': 'Organization', name: 'DevToolsHub' },
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    keywords: tool.tags || [],
    dateModified: ctx.nowISO,
  }
  return `<script type="application/ld+json">${JSON.stringify(data)}</script>`
}

function buildFaqJsonLd(tool: ToolConfig): string {
  const faqs = [
    {
      '@type': 'Question',
      name: `What is ${tool.name}?`,
      acceptedAnswer: {
        '@type': 'Answer',
        text: htmlEscape(tool.description),
      },
    },
    {
      '@type': 'Question',
      name: `Is ${tool.name} free to use?`,
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes, core features are free. Some advanced features are available with a premium plan in the DevToolsHub app.',
      },
    },
    {
      '@type': 'Question',
      name: `How do I open this tool in DevToolsHub?`,
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Use the “Open this tool in DevToolsHub” button which links directly to the app interface.',
      },
    },
  ]
  const data = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs,
  }
  return `<script type="application/ld+json">${JSON.stringify(data)}</script>`
}

function buildRelatedToolsGrid(current: ToolConfig, allTools: ToolConfig[], ctx: BuildContext): string {
  const items = allTools
    .filter(t => t.id !== current.id)
    .map(t => {
      const appUrl = `${ctx.appHost}${t.path}`
      return `<li><a href="${appUrl}" rel="nofollow">${htmlEscape(t.name)}</a> – ${htmlEscape(t.shortDescription)}</li>`
    })
    .join('\n')

  return `<ul>${items}</ul>`
}

// --- Content helpers to reach 1000–1400 words with meaningful guidance ---
function generateIntro(tool: ToolConfig, ctx: BuildContext): string {
  const override = readFileIfExists(path.join(ctx.contentDir, toolSlug(tool), 'intro.html'))
  if (override) return override
  const p1 = `The ${tool.name} is a focused, browser‑based utility that helps developers complete real‑world tasks quickly without context switching. It is designed to be fast, predictable, and easy to use in day‑to‑day workflows, whether you are debugging data, preparing API payloads, verifying credentials, or experimenting with formats.`
  const p2 = `Inside DevToolsHub, this tool follows the same ergonomics as the rest of the suite: a compact header, clear controls, responsive layout, keyboard shortcuts, and accessible labels. The interface prioritizes clarity over novelty so you can reach a correct result on the first try and repeat it reliably.`
  const p3 = `Use ${tool.name} when you need a trustworthy implementation that behaves like production environments. This page explains how the tool works at a high level, provides concrete steps, and includes examples that mirror what developers do in IDEs, CI scripts, and API clients.`
  return `<p>${p1}</p><p>${p2}</p><p>${p3}</p>`
}

function generateHowItWorks(tool: ToolConfig, ctx: BuildContext): string {
  const override = readFileIfExists(path.join(ctx.contentDir, toolSlug(tool), 'how-it-works.html'))
  if (override) return override
  const a = `At a high level, ${tool.name} takes your input, applies a well‑defined transformation or analysis, and renders the result in a readable format. Wherever possible, processing happens locally in the browser using modern Web APIs, which keeps the experience fast and private.`
  const b = `The interface is split into an input area, a concise control panel, and an output area. Controls are explicit and conservative by default; riskier actions use confirmation prompts. Each action exposes a deterministic result, which makes it suitable for reproducible workflows and documentation.`
  const c = `Copy and download buttons appear near results so you can move outputs into your editor, terminal, or API client immediately. When relevant, the tool also highlights errors with precise, actionable messages to shorten the feedback loop.`
  return `<p>${a}</p><p>${b}</p><p>${c}</p>`
}

function generateSteps(tool: ToolConfig, ctx: BuildContext): string {
  const override = readFileIfExists(path.join(ctx.contentDir, toolSlug(tool), 'steps.html'))
  if (override) return override
  const steps = [
    `Open the tool from this documentation or the DevToolsHub dashboard.`,
    `Read the short description to confirm the tool fits your task.`,
    `Paste or type input into the main editor. Use sample data if you are exploring.`,
    `Adjust options in the control panel. Defaults are safe; change one thing at a time.`,
    `Run the primary action and review the output area and any highlighted notes.`,
    `Use copy buttons to extract values or download the full result if needed.`,
    `Iterate on inputs or options until the result matches expectations.`,
    `Open the Help panel (F1 in the app) to review examples and keyboard shortcuts.`,
    `If a feature is premium‑gated, decide if the upgrade saves recurring effort.`,
    `Bookmark the tool path so teammates can reproduce the workflow.`,
  ]
    .map((s, i) => `<li><strong>Step ${i + 1}.</strong> ${htmlEscape(s)}</li>`) 
    .join('\n')
  return `<ol>${steps}</ol>`
}

type Example = { title: string; description: string; code: string }

function getExamplesForTool(tool: ToolConfig, ctx: BuildContext): Example[] {
  const override = readFileIfExists(path.join(ctx.contentDir, toolSlug(tool), 'examples.html'))
  if (override) {
    // If a full HTML block is provided, wrap it as a single example preserving authoring
    return [{ title: 'Examples', description: '', code: override }]
  }
  switch (tool.id) {
    case 'json-formatter':
      return [
        {
          title: 'Format and validate a JSON payload',
          description:
            'Paste raw JSON with inconsistent spacing. Use Format to normalize indentation and Validate to surface syntax errors with line and column.',
          code: `{
  "user": {"id": 42, "name":"Ada"},
  "roles": ["admin","editor"],
  "active":true
}`,
        },
        {
          title: 'Minify JSON for transport',
          description:
            'Use Minify to strip whitespace before sending over the wire or embedding in environment variables.',
          code: `{ "a":1, "b":[2,3], "meta": {"ts": 1734048000} }`,
        },
        {
          title: 'Sort object keys for stable diffs',
          description:
            'Sort keys alphabetically to reduce noisy diffs in version control and code reviews.',
          code: `// Before\n{\"z\":1,\"a\":2}\n\n// After (sorted)\n{\"a\":2,\"z\":1}`,
        },
      ]
    case 'regex-tester':
      return [
        { title: 'Match email‑like strings', description: 'Test a pragmatic pattern and inspect capture groups.', code: `/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/` },
        { title: 'Extract ISO dates', description: 'Find YYYY‑MM‑DD occurrences with boundaries.', code: `/\\b(\\\\d{4})-(\\\\d{2})-(\\\\d{2})\\b/g` },
        { title: 'Replace tabs with spaces (JavaScript)', description: 'Use replace with a global pattern.', code: `const out = input.replace(/\\t/g, '  ')` },
      ]
    case 'jwt-decoder':
      return [
        { title: 'Decode a JWT safely', description: 'Paste the token; header and payload are shown in readable JSON.', code: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` },
        { title: 'Inspect standard claims', description: 'Check exp, iat, iss, aud, and sub for correctness.', code: `{"iss":"https://issuer.example","aud":"my-app","exp":1735689600}` },
        { title: 'Verify signature (premium in app)', description: 'Provide algorithm and key to validate integrity.', code: `// HS256 verification requires a shared secret` },
      ]
    case 'base64-encoder':
      return [
        { title: 'Encode text to Base64', description: 'Convert a UTF‑8 string to Base64 for transport.', code: `const b64 = btoa('hello world')` },
        { title: 'Decode Base64 to text', description: 'Round‑trip an encoded string.', code: `const txt = atob(b64)` },
        { title: 'URL‑safe Base64', description: 'Swap +/ for -_ and trim = padding when needed.', code: `b64.replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'')` },
      ]
    case 'uuid-generator':
      return [
        { title: 'Generate a UUID v4', description: 'Use cryptographically secure randomness.', code: `crypto.randomUUID() // e.g. 3f3c0f35-...` },
        { title: 'Namespace‑based UUID v5', description: 'Combine a namespace and name to produce stable IDs.', code: `uuidv5(name, DNS_NAMESPACE)` },
        { title: 'Compact format', description: 'Remove dashes for storage‑constrained systems.', code: `uuid.replace(/-/g, '')` },
      ]
    case 'timestamp-converter':
      return [
        { title: 'Unix to human‑readable', description: 'Convert a Unix epoch (seconds) to ISO.', code: `new Date(1734048000 * 1000).toISOString()` },
        { title: 'Human‑readable to Unix', description: 'Get seconds from an ISO string.', code: `Math.floor(new Date('2025-01-01T00:00:00Z').getTime()/1000)` },
        { title: 'Timezone formatting', description: 'Render a date in a specific IANA timezone (library‑based).', code: `formatInTimeZone(date, 'America/New_York', 'yyyy-MM-dd HH:mm zzz')` },
      ]
    case 'xpath-tester':
      return [
        { title: 'Select article titles with CSS', description: 'Query DOM elements directly.', code: `document.querySelectorAll('article h2')` },
        { title: 'Find links with XPath', description: 'Return anchor nodes that contain “docs”.', code: `// //a[contains(., 'docs')]` },
        { title: 'Extract attributes', description: 'Capture href values for export.', code: `//a/@href` },
      ]
    default:
      return [
        { title: `Core usage of ${tool.name}`, description: 'A minimal, reproducible action you can adapt to your needs.', code: `// Replace with your input and run the primary action` },
        { title: 'Automate in CI', description: 'Document the steps and expected outputs so pipelines can verify results.', code: `# pseudo\nrun-tool --input input.txt --out out.json` },
        { title: 'Team hand‑off', description: 'Record settings and share the tool link so teammates reproduce the same behavior.', code: `# Include a README snippet with the exact steps` },
      ]
  }
}

function renderExamples(tool: ToolConfig, ctx: BuildContext): string {
  const examples = getExamplesForTool(tool, ctx)
  // If override provided, it sits in ex.code as HTML
  if (examples.length === 1 && examples[0].description === '' && examples[0].title === 'Examples') {
    return examples[0].code
  }
  return examples
    .map(ex => `
      <h3>${htmlEscape(ex.title)}</h3>
      <p>${htmlEscape(ex.description)}</p>
      <pre><code>${htmlEscape(ex.code)}</code></pre>
    `)
    .join('\n')
}

function buildBody(tool: ToolConfig, allTools: ToolConfig[], ctx: BuildContext): string {
  const appUrl = `${ctx.appHost}${tool.path}`
  const related = buildRelatedToolsGrid(tool, allTools, ctx)
  const resources = [
    { href: 'https://developer.mozilla.org/', text: 'MDN Web Docs' },
    { href: 'https://whatwg.org/', text: 'WHATWG Standards' },
    { href: 'https://schema.org/SoftwareApplication', text: 'Schema.org: SoftwareApplication' },
    { href: 'https://www.w3.org/TR/WCAG21/', text: 'W3C WCAG 2.1' },
    { href: 'https://web.dev/learn/', text: 'web.dev: Best Practices' },
    { href: 'https://www.rfc-editor.org/rfc/', text: 'RFC Editor' },
  ]
    .map(r => `<li><a href="${r.href}">${r.text}</a></li>`) 
    .join('\n')

  return `
  <header style="display:flex;align-items:center;gap:12px;padding:12px 16px;">
    <img src="${getAssetUrl('/icons/icon-48x48.png', ctx)}" width="24" height="24" alt="DevToolsHub icon"/>
    <nav style="margin-left:auto;display:flex;gap:16px;">
      <a href="${ctx.appHost}">Main App</a>
      <a href="${ctx.appHost}/#tools">All Tools</a>
      <a href="${ctx.appHost}/sign-in">Sign in</a>
    </nav>
  </header>

  <main class="container">
    <h1>${htmlEscape(tool.name)}</h1>
    <p class="muted">${htmlEscape(tool.description)}</p>
    ${generateIntro(tool, ctx)}

    <h2>Key features</h2>
    <ul>
      ${(tool.features.free || []).slice(0, 8).map(f => `<li>${htmlEscape(f)}</li>`).join('\n')}
    </ul>

    <h2>How it works</h2>
    ${generateHowItWorks(tool, ctx)}

    <h2>Step-by-step usage</h2>
    ${generateSteps(tool, ctx)}

    <h2>Examples</h2>
    ${renderExamples(tool, ctx)}

    <h2>Security & privacy</h2>
    <p>Where applicable, processing runs locally in your browser. Inputs are not logged or sent to external services. Premium features inside the app use Supabase Auth to protect access. For sensitive work, prefer local files and avoid sharing secrets. Outputs include copy and download actions to minimize manual transcription errors.</p>

    <h2>Accessibility</h2>
    <p>The tool supports keyboard navigation and screen readers with ARIA labels and descriptive messages. Focus order is logical, and error messages use human‑readable language. These docs maintain proper heading hierarchy and color contrast, and the app version includes skip links and live regions where appropriate.</p>

    <h2>Limitations & disclaimers</h2>
    <p>Some advanced capabilities are available only in the DevToolsHub app with a premium plan. The static documentation does not execute code or store inputs. Where behaviors differ across runtimes (browsers, servers, language engines), treat outputs as representative and verify against your production stack when correctness is critical.</p>

    <h2>Related tools</h2>
    <p>Explore other DevToolsHub modules that complement ${htmlEscape(tool.name)}:</p>
    ${related}

    <h2>Resources & references</h2>
    <ul>
      ${resources}
    </ul>

    <p style="margin-top:24px;">
      <a href="${appUrl}" class="cta">Open this tool in DevToolsHub</a>
    </p>
  </main>

  <footer style="text-align:center;padding:16px;">
    &copy; ${new Date().getFullYear()} <a href="${ctx.appHost}">DevToolsHub</a>
  </footer>
  `
}

function buildHtml(tool: ToolConfig, allTools: ToolConfig[], ctx: BuildContext): string {
  const head = buildHead(tool, ctx)
  const jsonLd = [
    buildSoftwareApplicationJsonLd(tool, ctx),
    buildFaqJsonLd(tool),
  ].join('\n')

  // Minimal inline styles for readability with light default and dark mode support
  const inlineStyles = `
    :root {
      --bg: #f8fafc; --fg: #0f172a; --muted: #475569; --border: #e5e7eb;
      --link: #2563eb; --link-hover: #1d4ed8; --card-bg: #ffffff; --code-bg: #f1f5f9;
      --header-bg: #ffffff; --btn-bg: #2563eb; --btn-fg: #ffffff; --btn-hover: #1d4ed8;
    }
    @media (prefers-color-scheme: dark) {
      :root {
        --bg: #0b0b0b; --fg: #eaeaea; --muted: #a3a3a3; --border: #222;
        --link: #8ab4ff; --link-hover: #a7c1ff; --card-bg: #0f172a; --code-bg: #111827;
        --header-bg: #0b0b0b; --btn-bg: #2563eb; --btn-fg: #ffffff; --btn-hover: #1d4ed8;
      }
    }
    html { color-scheme: light dark; }
    body { background: var(--bg); color: var(--fg); font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Noto Sans, Helvetica Neue, Arial, "Apple Color Emoji", "Segoe UI Emoji"; }
    header { background: var(--header-bg); border-bottom: 1px solid var(--border); }
    header nav a { color: var(--link); text-decoration: none; }
    header nav a:hover { color: var(--link-hover); text-decoration: underline; }
    .container { max-width: 960px; margin: 32px auto; padding: 0 16px; line-height: 1.7; }
    h1 { font-size: 2.25rem; font-weight: 800; margin: 0 0 12px; }
    h2 { font-size: 1.25rem; font-weight: 700; margin: 28px 0 12px; }
    h3 { font-size: 1rem; font-weight: 700; margin: 18px 0 8px; }
    p { margin: 0 0 16px; }
    .muted { color: var(--muted); }
    ul { margin: 0 0 16px 1.25rem; padding: 0; }
    ol { margin: 0 0 16px 1.25rem; padding: 0; }
    li { margin: 6px 0; }
    a { color: var(--link); }
    a:hover { color: var(--link-hover); }
    pre, code { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace; }
    pre { background: var(--code-bg); padding: 12px; border-radius: 8px; overflow: auto; border: 1px solid var(--border); }
    .cta { display: inline-block; background: var(--btn-bg); color: var(--btn-fg); padding: 12px 16px; border-radius: 8px; text-decoration: none; }
    .cta:hover { background: var(--btn-hover); }
    footer { border-top: 1px solid var(--border); color: var(--muted); }
  `

  const body = buildBody(tool, allTools, ctx)
  return `<!doctype html>
<html lang="en">
  <head>
    ${head}
    ${jsonLd}
    <style>${inlineStyles}</style>
  </head>
  <body>
    ${body}
  </body>
</html>`
}

function writeToolPage(tool: ToolConfig, allTools: ToolConfig[], ctx: BuildContext) {
  const outDir = path.join(ctx.outputDir, toolSlug(tool))
  ensureDir(outDir)
  const filePath = path.join(outDir, 'index.html')
  const html = buildHtml(tool, allTools, ctx)
  fs.writeFileSync(filePath, html, 'utf8')

  // Per-tool sitemap.xml targeting the per-tool domain
  const perToolSitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>${toolCanonical(tool, ctx)}</loc><lastmod>${ctx.nowISO}</lastmod></url>
</urlset>`
  fs.writeFileSync(path.join(outDir, 'sitemap.xml'), perToolSitemap, 'utf8')

  // Per-tool robots.txt pointing to its own sitemap
  const perToolRobots = `User-agent: *
Allow: /
Sitemap: ${toolCanonical(tool, ctx)}sitemap.xml
`
  fs.writeFileSync(path.join(outDir, 'robots.txt'), perToolRobots, 'utf8')
}

function buildDocsIndex(allTools: ToolConfig[], ctx: BuildContext): string {
  const cards = allTools
    .map(t => {
      const slug = toolSlug(t)
      return `
      <a class="card" href="./${slug}/">
        <div class="card-icon">${t.emoji || ''}</div>
        <div class="card-body">
          <div class="card-title">${htmlEscape(t.name)}</div>
          <div class="card-desc">${htmlEscape(t.shortDescription)}</div>
        </div>
      </a>`
    })
    .join('\n')

  const styles = `
    :root { --bg:#f8fafc; --fg:#0f172a; --muted:#475569; --border:#e5e7eb; --link:#2563eb; --link-hover:#1d4ed8; --card:#ffffff; }
    @media (prefers-color-scheme: dark){ :root { --bg:#0b0b0b; --fg:#eaeaea; --muted:#a3a3a3; --border:#222; --link:#8ab4ff; --link-hover:#a7c1ff; --card:#0f172a; } }
    html { color-scheme: light dark; }
    body { background: var(--bg); color: var(--fg); font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Noto Sans, Helvetica Neue, Arial, "Apple Color Emoji", "Segoe UI Emoji"; }
    header { background: var(--card); border-bottom: 1px solid var(--border); display:flex; align-items:center; gap:12px; padding:12px 16px; }
    header nav a { color: var(--link); text-decoration: none; margin-left: 16px; }
    header nav a:hover { color: var(--link-hover); text-decoration: underline; }
    .container { max-width: 1100px; margin: 32px auto; padding: 0 16px; }
    h1 { font-size: 2rem; font-weight: 800; margin: 0 0 8px; }
    .muted { color: var(--muted); margin-bottom: 24px; }
    .grid { display:grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap:16px; }
    .card { display:flex; gap:12px; background: var(--card); border:1px solid var(--border); border-radius:12px; padding:16px; text-decoration:none; color: inherit; }
    .card:hover { border-color: var(--link); }
    .card-icon { font-size: 20px; }
    .card-title { font-weight: 700; margin-bottom: 4px; }
    .card-desc { color: var(--muted); font-size: 0.95rem; }
  `

  const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>DevToolsHub Documentation</title>
    <meta name="robots" content="index,follow" />
    <link rel="canonical" href="${ctx.docsRootHost}/" />
    <style>${styles}</style>
  </head>
  <body>
    <header>
      <img src="${getAssetUrl('/icons/icon-48x48.png', ctx)}" width="24" height="24" alt="DevToolsHub icon" />
      <div style="font-weight:700;">DevToolsHub Docs</div>
      <nav style="margin-left:auto;">
        <a href="${ctx.appHost}">Main App</a>
        <a href="${ctx.appHost}/#tools">All Tools</a>
        <a href="${ctx.appHost}/sign-in">Sign in</a>
      </nav>
    </header>
    <main class="container">
      <h1>Documentation</h1>
      <p class="muted">Standalone, SEO‑optimized documentation pages for every DevToolsHub tool.</p>
      <div class="grid">
        ${cards}
      </div>
    </main>
  </body>
</html>`
  return html
}

function buildDocsSitemap(allTools: ToolConfig[], ctx: BuildContext): string {
  const urls = allTools
    .map(t => `<url><loc>${toolCanonical(t, ctx)}</loc><lastmod>${ctx.nowISO}</lastmod></url>`)
    .join('')
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>${ctx.docsRootHost}/</loc><lastmod>${ctx.nowISO}</lastmod></url>
  ${urls}
</urlset>`
}

function buildDocsFeed(allTools: ToolConfig[], ctx: BuildContext): string {
  const items = allTools
    .map(t => `
    <entry>
      <title>${htmlEscape(t.name)}</title>
      <id>${toolCanonical(t, ctx)}</id>
      <link href="${toolCanonical(t, ctx)}" />
      <updated>${ctx.nowISO}</updated>
      <summary>${htmlEscape(t.shortDescription || t.description)}</summary>
    </entry>`)
    .join('\n')

  return `<?xml version="1.0" encoding="utf-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <title>DevToolsHub – Docs Updates</title>
  <id>${ctx.docsRootHost}/</id>
  <updated>${ctx.nowISO}</updated>
  <link href="${ctx.docsRootHost}/feed.xml" rel="self" />
  ${items}
</feed>`
}

function writeSharedOutputs(allTools: ToolConfig[], ctx: BuildContext) {
  const indexHtml = buildDocsIndex(allTools, ctx)
  fs.writeFileSync(path.join(ctx.outputDir, 'index.html'), indexHtml, 'utf8')

  const sitemapXml = buildDocsSitemap(allTools, ctx)
  fs.writeFileSync(path.join(ctx.outputDir, 'sitemap.xml'), sitemapXml, 'utf8')

  const feedXml = buildDocsFeed(allTools, ctx)
  fs.writeFileSync(path.join(ctx.outputDir, 'feed.xml'), feedXml, 'utf8')

  // robots.txt for the docs root
  const robotsTxt = `User-agent: *
Allow: /
Sitemap: ${ctx.docsRootHost}/sitemap.xml
`
  fs.writeFileSync(path.join(ctx.outputDir, 'robots.txt'), robotsTxt, 'utf8')
}

async function main() {
  const outputDir = path.resolve('docs')
  ensureDir(outputDir)

  const ctx: BuildContext = {
    appHost: process.env.DOCS_ASSET_HOST || APP_ASSET_HOST_DEFAULT,
    docsRootHost: process.env.DOCS_ROOT_HOST || DOCS_ROOT_HOST_DEFAULT,
    outputDir,
    nowISO: new Date().toISOString(),
    contentDir: path.resolve('docs-content'),
  }

  const tools = getAllTools()

  // Write per-tool pages
  tools.forEach(tool => writeToolPage(tool, tools, ctx))

  // Write shared index/sitemap/feed
  writeSharedOutputs(tools, ctx)

  // Mirror docs into public/docs for in-app serving at /docs/* during dev/prod
  const publicDocsDir = path.resolve('public', 'docs')
  ensureDir(publicDocsDir)
  // Node 16+: cpSync supports recursive copy
  fs.cpSync(outputDir, publicDocsDir, { recursive: true, force: true })

  // eslint-disable-next-line no-console
  console.log(`Docs generated for ${tools.length} tools → ${outputDir}`)
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error('Docs generation failed:', err)
  process.exitCode = 1
})


