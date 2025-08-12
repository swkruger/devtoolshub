import type { AssetTask } from './presets'

export function toManifestIconEntry(task: AssetTask, options?: { pathPrefix?: string }): { src: string; sizes: string; type: 'image/png'; purpose?: 'maskable' } {
  const prefix = options?.pathPrefix || ''
  const path = task.category === 'icon' || task.category === 'maskable' ? `${prefix}/icons/${task.filename}` : `${prefix}/${task.filename}`
  const entry: { src: string; sizes: string; type: 'image/png'; purpose?: 'maskable' } = {
    src: path,
    sizes: `${task.width}x${task.height}`,
    type: 'image/png',
  }
  if (task.purpose) entry.purpose = task.purpose
  return entry
}

export function buildHeadTags(theme: string, options?: { includePinned?: boolean; pinnedColor?: string; pathPrefix?: string }): string {
  const prefix = options?.pathPrefix || ''
  const tags = [
    `<link rel="manifest" href="${prefix}/manifest.json" />`,
    `<link rel="apple-touch-icon" href="${prefix}/apple-touch-icon-180x180.png" sizes="180x180" />`,
    `<link rel="icon" type="image/png" sizes="32x32" href="${prefix}/favicon-32x32.png" />`,
    `<meta name="theme-color" content="${theme}" />`,
  ]
  if (options?.includePinned) {
    const color = options.pinnedColor || theme
    tags.splice(1, 0, `<link rel="mask-icon" href="${prefix}/safari-pinned-tab.svg" color="${color}" />`)
  }
  return tags.join('\n')
}

export function buildPinnedTabSvg(color: string = '#000000'): string {
  // Simple monochrome SVG glyph placeholder (rounded square with centered circle)
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <g fill="${color}">
    <rect x="8" y="8" width="84" height="84" rx="16" ry="16"/>
    <circle cx="50" cy="50" r="22" fill="#fff"/>
  </g>
</svg>`
}


