Title: DevToolsHub Documentation Generator Prompt

Goal
- Produce high-quality, SEO-optimized, standalone static HTML documentation pages for every DevToolsHub tool.
- Each page must be self-contained and hostable on its own domain/subdomain (e.g., https://devtoolshub.dev/password), while referencing shared images/assets hosted by the main application host (e.g., https://app.devtoolshub.dev).
- Target content length: 1000–1400 words per tool.
- Every page must include backlinks to all other tools and to useful external references.

Scope
- Generate one static HTML file per tool at docs/<tool-slug>/index.html
- All pages must be discoverable by search engines and provide structured data.
- Do not require client-side frameworks. Keep pages portable and framework-agnostic.

Inputs
- Source of truth for tools: `lib/tools.ts` (id/slug, name, description, path, tags, icon, premium flags, shortDescription).
- Asset host: main app domain (placeholder) `https://app.devtoolshub.dev` for images/icons.
- Docs host: per-tool custom domain or subdomain (placeholder) `https://<tool-slug>.devtoolshub.dev`.

Output for each tool
- File: docs/<tool-slug>/index.html
- Encoding: UTF-8
- DOCTYPE: <!doctype html>
- No build-time dependencies; minimal CSS via inline <style> or a single CDN link (e.g., modern-normalize) permitted.

Page structure (per tool)
1) <head>
   - <title>: 55–65 chars, include tool name + “DevToolsHub”. Example: “Password & Key-like Generator – DevToolsHub”.
   - <meta name="description">: 150–160 chars summarizing the tool’s value (plain, non-marketing jargon).
   - <link rel="canonical">: https://<tool-slug>.devtoolshub.dev/
   - <meta name="robots" content="index,follow">
   - Open Graph:
     - og:type = website
     - og:site_name = DevToolsHub
     - og:title, og:description mirroring <title> and meta description
     - og:url = canonical URL
     - og:image = absolute URL to a representative image hosted on main app host (e.g., https://app.devtoolshub.dev/icons/icon-512x512.png). Use a square 512x512 PNG.
   - Twitter card:
     - twitter:card = summary_large_image
     - twitter:title, twitter:description
     - twitter:image
   - Structured data (JSON-LD):
     - SoftwareApplication with fields: name, applicationCategory ("DeveloperApplication"), operatingSystem ("Web"), description, url (canonical), image, author (DevToolsHub), offers ("Free" and mention Premium if applicable), keywords (tool tags), dateModified.
     - Optional FAQPage JSON-LD with 3–6 common questions about the tool.
   - Favicons and manifest links optional (page should still be standalone). If added, reference icons from the app host (absolute URLs) to avoid asset duplication.

2) <body>
   - Global header: small logo (absolute URL) and nav links back to:
     - Main site (https://app.devtoolshub.dev)
     - All tools hub (https://app.devtoolshub.dev/#tools)
     - Sign in (https://app.devtoolshub.dev/sign-in)
   - H1: Tool name (unique, front-loaded with the primary keyword).
   - Intro (2–3 paragraphs): What it is, when to use it, who it’s for. Avoid fluff, aim for clarity.
   - “Key features” section (bulleted, concise). Include free vs premium note when relevant.
   - “How it works” section (explain high level flow). Keep implementation specifics light—focus on user value and steps.
   - “Step-by-step usage” (ordered list): 6–10 steps to achieve common outcome(s). Add inline tips.
   - “Examples” section: 2–4 realistic examples, include short code blocks or snippets if applicable (keep vendor-neutral).
   - “Security & privacy” section: State that generation is local in browser where relevant; no network calls; no logging of user inputs. Call out Supabase Auth for gated access in the app.
   - “Accessibility” section: Note keyboard navigation, labels, and screen reader support.
   - “Limitations & disclaimers” section: Honest boundaries (e.g., “Key-like mode is appearance/testing only”).
   - “Related tools” grid: Backlinks to all other DevToolsHub tools (name + short one-line). Use absolute links to app tool paths (e.g., https://app.devtoolshub.dev/tools/<slug>). Include at least 9+ links; prefer all tools for internal linking depth.
   - “Resources & references” section: External authoritative links (e.g., zxcvbn docs, WHATWG Base64, PWA specs, MDN pages). Use 4–8 links max, with descriptive anchor text.
   - CTA footer: “Open this tool in DevToolsHub” button linking to the app path, plus links to pricing or premium overview if relevant.
   - Global footer: lightweight text with © year and DevToolsHub link.

Content guidelines
- Length: 1000–1400 words. Prioritize clarity and task completion over marketing.
- Voice: Professional, helpful, direct. Explain benefits and how to succeed.
- Readability: Use short paragraphs, subheadings (H2/H3), and bulleted lists.
- SEO:
  - Use primary keyword in H1 and early in introduction.
  - Include secondary keywords naturally (e.g., “password generator”, “passphrase”, “base64 encoder”, “PWA assets”, “UUID generator”).
  - Internal linking: always include backlinks to all other tools.
  - Anchor text must be descriptive (avoid “click here”).
  - Image tags (if any) must have meaningful alt text.
- Accessibility: proper heading order, labeled buttons/links, sufficient contrast (use simple inline styles or conservative colors).
- Internationalization: write neutral English without locale-specific idioms; avoid slang.

Images and assets
- Use absolute URLs hosted by the main application host (e.g., https://app.devtoolshub.dev/icons/icon-512x512.png) for all images.
- Do not embed large or untrusted external images.
- If including code snippets or diagrams, keep them minimal and text-based; no client-side script dependencies.

Discovery and indexing
- Each page must include <meta name="robots" content="index,follow">.
- Provide per-page JSON-LD schema.
- Provide a minimal sitemap.xml per domain

Quality bar
- Each page should feel “complete” and standalone.
- Avoid repetition and filler text. Prefer concrete, user-centered guidance.
- Ensure no broken links; use absolute URLs for all internal links back to the app and other tools.
- Avoid referencing implementation specifics that can drift. Focus on outcomes and stable UX affordances.

Deliverables
- Static HTML files under docs/<tool-slug>/index.html for every tool currently exposed by `lib/tools.ts`.
- A generated “All Tools” page at docs/index.html with a grid linking to every tool documentation.
- A simple README in docs/ with hosting instructions and how to map to custom domains.

Hosting assumptions
- Each tool’s docs may be deployed to its own domain/subdomain; pages must work when hosted separately.
- Assets (images, icons) are referenced from the main app’s host via absolute URLs.

Acceptance criteria
- One static, SEO-optimized, accessible page per tool (1000–1400 words), including:
  - Title/meta/OG/Twitter/JSON-LD done.
  - Backlinks to all other tools and useful external references.
  - Clear structure with intro, features, how it works, steps, examples, security/privacy, accessibility, limitations, related tools, resources, CTA.
  - Zero broken links.
  - Valid HTML5 (W3C validator clean of errors; warnings allowed if minor).

- Generate a sitemap.xml per domain and an aggregate sitemap for all docs.
- Generate an RSS/Atom feed of documentation updates.
- Add dark mode via prefers-color-scheme.
- Add a lightweight search (pure client-side JS, optional).

Implementation notes (if you build a generator)
- Use Node + TypeScript script to read `lib/tools.ts`, and for each tool write docs/<slug>/index.html using a common HTML template function.
- Include a function that assembles the “Related tools” grid using all tools except current.
- Include helpers to generate head tags (title/meta/OG/Twitter), and JSON-LD payloads.
- Keep the HTML under 500 lines by extracting sections into generator functions; do not exceed the repo’s 500 LOC-per-file rule by splitting modules.

 Dedicated pages for each tool
Each tool should have:
Its own landing page targeting a specific keyword (e.g., "JSON Formatter Online")
Tool interface + rich reference/documentation on that same page or linked nearby.
Meta title & description unique to the tool.
Schema markup (e.g., SoftwareApplication schema).
Internal linking between tools (e.g., “You might also like…”).


Make sure the main landing page, links to each tool page.