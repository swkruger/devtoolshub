import JSZip from 'jszip'

export interface ZipFileItem {
  path: string
  blob: Blob
}

export async function buildZip(files: ZipFileItem[]): Promise<Blob> {
  const zip = new JSZip()
  for (const f of files) {
    zip.file(f.path.startsWith('/') ? f.path.slice(1) : f.path, f.blob)
  }
  const content = await zip.generateAsync({ type: 'blob' })
  return content
}


