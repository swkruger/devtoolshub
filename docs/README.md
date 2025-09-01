# DevToolsKitHub Docs

Static, standalone documentation pages for each DevToolsKitHub tool. These pages are portable and can be hosted per-tool on custom subdomains.

## Features

- **SEO Optimized**: Each tool has its own page with proper meta tags and structured data
- **Portable**: Can be hosted independently on any static hosting service
- **Custom Domains**: Each tool may be hosted at `https://<tool-slug>.devtoolskithub.dev/`
- **Responsive**: Mobile-friendly design with dark mode support
- **Accessible**: Proper heading hierarchy and screen reader support

## Usage

These docs are automatically generated from the main application. To regenerate:

```bash
npm run docs:gen
```

This will create updated documentation in the `docs/` directory.


