export interface RasterizeTask {
  width: number
  height: number
  background: string
  paddingPercent: number // 0..30
  radiusPercent: number // 0..50
  maskable: boolean
}

export async function rasterizeFromFile(sourceFile: File, task: RasterizeTask): Promise<Blob> {
  const bitmap = await createImageBitmap(await fileToImageSource(sourceFile))
  try {
    const { canvas, ctx } = createCanvas(task.width, task.height)
    // Background fill
    ctx.fillStyle = task.background
    ctx.fillRect(0, 0, task.width, task.height)

    // Compute draw rect preserving aspect ratio with padding
    const pad = Math.max(0, Math.min(30, task.paddingPercent)) / 100
    const innerW = task.width * (1 - pad * 2)
    const innerH = task.height * (1 - pad * 2)

    const ratio = Math.min(innerW / bitmap.width, innerH / bitmap.height)
    const dw = Math.round(bitmap.width * ratio)
    const dh = Math.round(bitmap.height * ratio)
    const dx = Math.round((task.width - dw) / 2)
    const dy = Math.round((task.height - dh) / 2)

    // Optional rounded mask
    const radius = Math.round(Math.min(task.width, task.height) * (Math.max(0, Math.min(50, task.radiusPercent)) / 100))
    if (radius > 0) {
      roundRect(ctx, 0, 0, task.width, task.height, radius)
      ctx.clip()
    }

    ctx.drawImage(bitmap, dx, dy, dw, dh)

    return await canvasToBlob(canvas)
  } finally {
    bitmap.close()
  }
}

function createCanvas(w: number, h: number): { canvas: HTMLCanvasElement; ctx: CanvasRenderingContext2D } {
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')!
  return { canvas, ctx }
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  const radius = { tl: r, tr: r, br: r, bl: r }
  ctx.beginPath()
  ctx.moveTo(x + radius.tl, y)
  ctx.lineTo(x + w - radius.tr, y)
  ctx.quadraticCurveTo(x + w, y, x + w, y + radius.tr)
  ctx.lineTo(x + w, y + h - radius.br)
  ctx.quadraticCurveTo(x + w, y + h, x + w - radius.br, y + h)
  ctx.lineTo(x + radius.bl, y + h)
  ctx.quadraticCurveTo(x, y + h, x, y + h - radius.bl)
  ctx.lineTo(x, y + radius.tl)
  ctx.quadraticCurveTo(x, y, x + radius.tl, y)
  ctx.closePath()
}

async function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return await new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) return reject(new Error('Failed to create blob'))
      resolve(blob)
    }, 'image/png')
  })
}

async function fileToImageSource(file: File): Promise<Blob> {
  // If SVG, return as-is; if PNG, return as-is; browser handles rasterization in createImageBitmap
  return file
}


