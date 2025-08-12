# DevToolsHub Docs

Static, standalone documentation pages for each DevToolsHub tool. These pages are portable and can be hosted per-tool on custom subdomains.

## Structure

- `docs/index.html`: All-tools landing page
- `docs/<tool-slug>/index.html`: One page per tool
- `docs/sitemap.xml`: Sitemap for all docs pages
- `docs/feed.xml`: Atom feed of documentation updates

## Hosting Model

- Each tool may be hosted at `https://<tool-slug>.devtoolshub.dev/`
- Assets (icons/images) are referenced via the main app host
  - Default: `https://app.devtoolshub.dev`
- Pages are static HTML with minimal inline CSS for portability

## Generate

```bash
# From repo root
npm run docs:gen
```

Environment variables (optional):

- `DOCS_ASSET_HOST` (default `https://app.devtoolshub.dev`)
- `DOCS_ROOT_HOST` (default `https://devtoolshub.dev`)

Example:

```bash
DOCS_ASSET_HOST=https://app.devtoolshub.dev \
DOCS_ROOT_HOST=https://docs.devtoolshub.dev \
npm run docs:gen
```

## Deploy

- Upload the `docs/` folder to your static hosting provider
- If using per-tool subdomains, configure DNS and map each `<tool-slug>.devtoolshub.dev` to serve `docs/<tool-slug>/index.html`
- Ensure `docs/sitemap.xml` is submitted to search engines

## Notes

- Pages include JSON-LD (SoftwareApplication + optional FAQ)
- Internal backlinks point to app tool pages for engagement
- Keep links absolute to avoid broken references across hosts


