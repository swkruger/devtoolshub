export type AssetCategory = 'icon' | 'favicon' | 'apple' | 'maskable' | 'windows' | 'pinned' | 'splash'

export interface AssetTask {
  width: number
  height: number
  category: AssetCategory
  filename: string
  purpose?: 'maskable'
}

export interface PresetOptions {
  includeMaskable: boolean
  isPremiumUser: boolean
  preset: 'minimal' | 'recommended' | 'full'
}

export const FREE_ICON_SIZES = [48, 72, 96, 144, 192, 256, 384, 512]
export const FREE_FAVICONS = [16, 32, 48]

export function buildFreeTasks(opts: { includeMaskable: boolean }): AssetTask[] {
  const tasks: AssetTask[] = []
  for (const s of FREE_ICON_SIZES) {
    tasks.push({ width: s, height: s, category: 'icon', filename: `icon-${s}x${s}.png` })
  }
  for (const s of FREE_FAVICONS) {
    tasks.push({ width: s, height: s, category: 'favicon', filename: `favicon-${s}x${s}.png` })
  }
  tasks.push({ width: 180, height: 180, category: 'apple', filename: `apple-touch-icon-180x180.png` })
  if (opts.includeMaskable) {
    tasks.push({ width: 192, height: 192, category: 'maskable', filename: `maskable_icon-192x192.png`, purpose: 'maskable' })
    tasks.push({ width: 512, height: 512, category: 'maskable', filename: `maskable_icon-512x512.png`, purpose: 'maskable' })
  }
  return tasks
}

export function buildPremiumTasks(): AssetTask[] {
  const tasks: AssetTask[] = []
  // iOS icons
  for (const s of [120, 152, 167, 180]) {
    tasks.push({ width: s, height: s, category: 'apple', filename: `apple-touch-icon-${s}x${s}.png` })
  }
  // Android maskable set
  for (const s of [192, 256, 384, 512]) {
    tasks.push({ width: s, height: s, category: 'maskable', filename: `maskable_icon-${s}x${s}.png`, purpose: 'maskable' })
  }
  // Windows tiles (placeholders as PNG)
  tasks.push({ width: 150, height: 150, category: 'windows', filename: `mstile-150x150.png` })
  tasks.push({ width: 310, height: 150, category: 'windows', filename: `mstile-310x150.png` })
  tasks.push({ width: 310, height: 310, category: 'windows', filename: `mstile-310x310.png` })
  // Safari pinned tab (SVG) would be handled separately in export, not rasterized here
  // Splash screens (common portrait sizes)
  const splashSizes: Array<[number, number]> = [
    [640, 1136], [750, 1334], [828, 1792], [1125, 2436], [1242, 2688], [1536, 2048], [1668, 2388], [2048, 2732]
  ]
  for (const [w, h] of splashSizes) {
    tasks.push({ width: w, height: h, category: 'splash', filename: `splash/apple-splash-${w}x${h}.png` })
  }
  return tasks
}

export function getPresetTasks(options: PresetOptions): AssetTask[] {
  const base = buildFreeTasks({ includeMaskable: options.includeMaskable })
  if (!options.isPremiumUser) return base
  if (options.preset === 'minimal') return base
  if (options.preset === 'recommended') {
    // Add a subset of premium tasks
    return base.concat(buildPremiumTasks().filter(t => t.category === 'maskable' || t.category === 'apple'))
  }
  // full
  return base.concat(buildPremiumTasks())
}


