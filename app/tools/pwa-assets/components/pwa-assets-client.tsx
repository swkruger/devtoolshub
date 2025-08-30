"use client"

import { useEffect, useMemo, useRef, useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Crown, Download, RotateCcw, Copy } from 'lucide-react'
import { getPresetTasks } from '../lib/presets'
import { rasterizeFromFile } from '../lib/pipeline'
import { toManifestIconEntry, buildHeadTags, buildPinnedTabSvg } from '../lib/naming'
import { buildZip } from '../lib/zip'
import { toast } from 'sonner'

interface Props {
  isBackerUser: boolean
  userId: string | null
}

type Preset = 'minimal' | 'recommended' | 'full'

export default function PwaAssetsClient({ isBackerUser }: Props) {

  const [activeTab, setActiveTab] = useState<'configure' | 'preview' | 'export' | 'help'>('configure')
  const [sourceFile, setSourceFile] = useState<File | undefined>(undefined)
  const [logoUrl, setLogoUrl] = useState<string | null>(null)
  const [bg, setBg] = useState('#ffffff')
  const [bgFav, setBgFav] = useState('')
  const [bgSplash, setBgSplash] = useState('')
  const [theme, setTheme] = useState('#000000')
  const [maskable, setMaskable] = useState(true)
  const [padding, setPadding] = useState(0)
  const [radius, setRadius] = useState(0)
  const [preset, setPreset] = useState<Preset>('minimal')
  const [isProcessing, setIsProcessing] = useState(false)
  const [manifest, setManifest] = useState('{}')
  const [headSnippet, setHeadSnippet] = useState('')
  const [files, setFiles] = useState<Array<{ path: string; url: string; width: number; height: number }>>([])
  const [includePinned, setIncludePinned] = useState(false)

  const backerDisabled = !isBackerUser

  const handleFile = (file?: File) => {
    if (!file) return
    if (!/(image\/png|image\/svg\+xml|image\/webp)/.test(file.type)) {
      toast.error('Unsupported file', { description: 'Please upload a PNG, SVG, or WebP image.' })
      return
    }
    if (file.size > (isBackerUser ? 30 : 10) * 1024 * 1024) {
      toast.error('File too large', { description: `Max ${isBackerUser ? 30 : 10}MB` })
      return
    }
    // Revoke previous preview URL
    if (logoUrl) URL.revokeObjectURL(logoUrl)
    const url = URL.createObjectURL(file)
    setLogoUrl(url)
    setSourceFile(file)
  }

  // Cleanup preview URL on unmount
  useEffect(() => {
    return () => { if (logoUrl) URL.revokeObjectURL(logoUrl) }
  }, [logoUrl])

  const generate = async () => {
    if (!sourceFile) {
      toast.warning('Upload required', { description: 'Please upload a logo first.' })
      return
    }
    setIsProcessing(true)
    try {
      const tasks = getPresetTasks({ includeMaskable: maskable, isBackerUser, preset })
      const outputs: Array<{ path: string; url: string; width: number; height: number; blob: Blob }> = []
      for (const t of tasks) {
        // Splash screens are solid background; draw icon centered with higher padding by default
        const chosenBg = t.category === 'favicon' ? (bgFav || bg) : t.category === 'splash' ? (bgSplash || bg) : bg
        const blob = await rasterizeFromFile(sourceFile, {
          width: t.width,
          height: t.height,
          background: chosenBg,
          paddingPercent: t.category === 'splash' ? Math.max(10, padding) : padding,
          radiusPercent: t.category === 'splash' ? 0 : radius,
          maskable: t.purpose === 'maskable',
        })
        const path = (t.category === 'icon' || t.category === 'maskable') ? `icons/${t.filename}` : t.filename
        const url = URL.createObjectURL(blob)
        outputs.push({ path, url, width: t.width, height: t.height, blob })
      }
      setFiles(outputs.map(o => ({ path: o.path, url: o.url, width: o.width, height: o.height })))

      const manifestObj = {
        name: 'Your App',
        short_name: 'App',
        start_url: '/',
        display: 'standalone',
        theme_color: theme,
        background_color: bg,
        icons: tasks
          .filter(t => t.category === 'icon' || t.category === 'maskable')
          .map(t => toManifestIconEntry(t, { pathPrefix: '' })),
      }
      setManifest(JSON.stringify(manifestObj, null, 2))
      setHeadSnippet(buildHeadTags(theme, { includePinned, pinnedColor: theme }))
      toast.success('Generated', { description: 'Preview and export are ready.' })
      setActiveTab('preview')
    } finally {
      setIsProcessing(false)
    }
  }

  const copy = async (text: string, label = 'Copied') => {
    await navigator.clipboard.writeText(text)
          toast.success(label)
  }

  return (
    <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
      <TabsList>
        <TabsTrigger value="configure">Configure</TabsTrigger>
        <TabsTrigger value="preview">Preview</TabsTrigger>
        <TabsTrigger value="export">Export</TabsTrigger>
        <TabsTrigger value="help">Help</TabsTrigger>
      </TabsList>

      <TabsContent value="configure">
        <Card>
          <CardContent className="p-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Upload Logo (PNG/SVG/WebP)</Label>
                <Input type="file" accept="image/png,image/svg+xml,image/webp" onChange={(e) => handleFile(e.target.files?.[0])} />
                {logoUrl && (
                  <div className="mt-2 flex items-center gap-3">
                    <img src={logoUrl} alt="Uploaded logo preview" className="h-16 w-16 rounded bg-muted object-contain" />
                    <div className="text-xs text-gray-500">
                      {sourceFile?.name} • {sourceFile ? Math.max(1, Math.round(sourceFile.size / 1024)) : 0} KB
                    </div>
                  </div>
                )}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label>Theme color</Label>
                  <Input type="text" value={theme} onChange={(e) => setTheme(e.target.value)} />
                </div>
                <div className="space-y-1">
                  <Label>Background</Label>
                  <Input type="text" value={bg} onChange={(e) => setBg(e.target.value)} />
                </div>
                <div className="space-y-1">
                  <Label>Favicons background (optional)</Label>
                  <Input type="text" placeholder="#ffffff" value={bgFav} onChange={(e) => setBgFav(e.target.value)} />
                </div>
                <div className="space-y-1">
                  <Label>Splash background (optional)</Label>
                  <Input type="text" placeholder="#000000" value={bgSplash} onChange={(e) => setBgSplash(e.target.value)} />
                </div>
                <div className="space-y-1">
                  <Label>Padding (%)</Label>
                  <Input type="number" min={0} max={30} value={padding} onChange={(e) => setPadding(Math.max(0, Math.min(30, Number(e.target.value) || 0)))} />
                </div>
                <div className="space-y-1">
                  <Label>Corner radius (%)</Label>
                  <Input type="number" min={0} max={50} value={radius} onChange={(e) => setRadius(Math.max(0, Math.min(50, Number(e.target.value) || 0)))} />
                </div>
                <div className="col-span-2 flex items-center gap-2">
                  <input id="maskable" type="checkbox" checked={maskable} onChange={(e) => setMaskable(e.target.checked)} />
                  <Label htmlFor="maskable">Generate maskable icons</Label>
                </div>
                <div className="space-y-1">
                  <Label>Preset</Label>
                  <select className="border rounded-md text-sm px-2 py-1 bg-background" value={preset} onChange={(e) => setPreset(e.target.value as Preset)}>
                    <option value="minimal">Minimal (Free)</option>
                                    <option value="recommended" disabled={!isBackerUser}>Recommended { !isBackerUser && '👑' }</option>
                <option value="full" disabled={!isBackerUser}>Full Matrix { !isBackerUser && '👑' }</option>
                  </select>
                </div>
                <div className="col-span-2 flex items-center gap-2">
                  <input id="pinned" type="checkbox" checked={includePinned} onChange={(e) => setIncludePinned(e.target.checked)} />
                  <Label htmlFor="pinned">Include Safari pinned tab (SVG)</Label>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              {!isBackerUser && preset !== 'minimal' ? (
                <Button disabled>
                  <Crown className="w-4 h-4 mr-1" /> Generate
                </Button>
              ) : (
                <Button onClick={generate} disabled={!sourceFile || isProcessing}>
                  <RotateCcw className="w-4 h-4 mr-1" /> {isProcessing ? 'Processing...' : 'Generate'}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      {/* Export ZIP (basic free export) */}
      <TabsContent value="export">
        <Card>
          <CardContent className="p-4 space-y-4">
            <div className="flex gap-2">
              <Button
                onClick={async () => {
                  if (files.length === 0) { toast.warning('Nothing to export'); return }
                  const imageItems = await Promise.all(files.map(async f => ({ path: `/${f.path}`, blob: await (await fetch(f.url)).blob() })))
                  const pinnedItem = includePinned ? [{ path: '/safari-pinned-tab.svg', blob: new Blob([buildPinnedTabSvg(theme)], { type: 'image/svg+xml' }) }] : []
                  const textItems = [
                    { path: '/manifest.json', blob: new Blob([manifest], { type: 'application/json' }) },
                    { path: '/index-head-snippet.html', blob: new Blob([headSnippet], { type: 'text/html' }) },
                  ]
                  const blob = await buildZip([...imageItems, ...pinnedItem, ...textItems])
                  const url = URL.createObjectURL(blob)
                  const a = document.createElement('a')
                  a.href = url
                  a.download = 'pwa-assets.zip'
                  a.click()
                  URL.revokeObjectURL(url)
                }}
                disabled={files.length === 0}
              >
                <Download className="w-4 h-4 mr-1" /> Download ZIP
              </Button>
              {!isBackerUser && (preset !== 'minimal') && (
                <Button disabled>
                  <Crown className="w-4 h-4 mr-1" /> Splash & full matrices (Premium)
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="preview">
        <Card>
          <CardContent className="p-4 space-y-4">
            {files.length === 0 ? (
              <Alert><AlertDescription>No files yet. Upload and Generate first.</AlertDescription></Alert>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {files.map((f) => (
                  <div key={f.path} className="border rounded p-2 flex flex-col items-center gap-2">
                    <img src={f.url} alt={f.path} width={64} height={64} className="rounded bg-muted" />
                    <div className="text-xs text-center">
                      <div className="font-mono">{f.path}</div>
                      <div className="text-gray-500">{f.width}×{f.height}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="export">
        <Card>
          <CardContent className="p-4 space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium">manifest.json</h3>
                <Button size="sm" variant="outline" onClick={() => copy(manifest, 'Manifest copied')}><Copy className="w-4 h-4 mr-1" /> Copy</Button>
              </div>
              <pre className="text-xs bg-muted p-3 rounded overflow-auto max-h-64">{manifest}</pre>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium">HTML Head tags</h3>
                <Button size="sm" variant="outline" onClick={() => copy(headSnippet, 'Head tags copied')}><Copy className="w-4 h-4 mr-1" /> Copy</Button>
              </div>
              <pre className="text-xs bg-muted p-3 rounded overflow-auto max-h-64">{headSnippet}</pre>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="help">
        <Card>
          <CardContent className="p-4 space-y-2 text-sm text-gray-600 dark:text-gray-400">
            <p>Upload a square PNG/SVG, choose colors, then Generate to preview standard PWA assets. Premium unlocks full matrices and splash screens.</p>
            <ul className="list-disc pl-5">
              <li>Free sizes: 48, 72, 96, 144, 192, 256, 384, 512 + favicons + apple-touch 180</li>
              <li>Maskable icons add purpose: &quot;maskable&quot;</li>
              <li>Export provides manifest.json and copyable head tags</li>
            </ul>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  )
}


