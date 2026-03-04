import JSZip from 'jszip'

export interface ZipEntry {
  name:    string
  content: Blob
}

/* ─── Gera ZIP em blob ────────────────────────────────────────── */
export async function buildZip(entries: ZipEntry[]): Promise<Blob> {
  const zip = new JSZip()

  for (const entry of entries) {
    const buffer = await entry.content.arrayBuffer()
    zip.file(entry.name, buffer)
  }

  return zip.generateAsync({
    type:               'blob',
    compression:        'DEFLATE',
    compressionOptions: { level: 6 },
  })
}

/* ─── Download de blob ────────────────────────────────────────── */
export function downloadBlob(blob: Blob, filename: string): void {
  const url  = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href     = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}

/* ─── Extrai XMLs de um ZIP ───────────────────────────────────── */
export async function extractXmlsFromZip(file: File): Promise<{ name: string; content: string }[]> {
  const zip     = await JSZip.loadAsync(await file.arrayBuffer())
  const results: { name: string; content: string }[] = []

  for (const [name, zipFile] of Object.entries(zip.files)) {
    if (!zipFile.dir && name.toLowerCase().endsWith('.xml')) {
      const content = await zipFile.async('string')
      results.push({ name, content })
    }
  }

  return results
}