import type { PrintPack, StudiesExport, Study } from '@/types/study'

const STUDIES_KEY = 'guitartheory.studies.v1'
const PRINT_PACKS_KEY = 'guitartheory.printPacks.v1'

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return fallback
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

function writeJson(key: string, value: unknown): void {
  localStorage.setItem(key, JSON.stringify(value))
}

export function loadStudies(): Study[] {
  return readJson<Study[]>(STUDIES_KEY, [])
}

export function saveStudies(studies: Study[]): void {
  writeJson(STUDIES_KEY, studies)
}

export function upsertStudy(study: Study): Study[] {
  const all = loadStudies()
  const idx = all.findIndex((s) => s.id === study.id)
  if (idx >= 0) all[idx] = study
  else all.unshift(study)
  saveStudies(all)
  return all
}

export function deleteStudy(id: string): Study[] {
  const all = loadStudies().filter((s) => s.id !== id)
  saveStudies(all)
  return all
}

export function loadPrintPacks(): PrintPack[] {
  return readJson<PrintPack[]>(PRINT_PACKS_KEY, [])
}

export function savePrintPacks(packs: PrintPack[]): void {
  writeJson(PRINT_PACKS_KEY, packs)
}

export function upsertPrintPack(pack: PrintPack): PrintPack[] {
  const all = loadPrintPacks()
  const idx = all.findIndex((p) => p.id === pack.id)
  if (idx >= 0) all[idx] = pack
  else all.unshift(pack)
  savePrintPacks(all)
  return all
}

export function deletePrintPack(id: string): PrintPack[] {
  const all = loadPrintPacks().filter((p) => p.id !== id)
  savePrintPacks(all)
  return all
}

export function exportAllToObject(): StudiesExport {
  return {
    version: 1,
    exportedAt: new Date().toISOString(),
    studies: loadStudies(),
    printPacks: loadPrintPacks(),
  }
}

export function downloadExport(filename = 'guitartheory-studies.json'): void {
  const data = exportAllToObject()
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: 'application/json',
  })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export function importFromObject(
  data: StudiesExport,
  mode: 'merge' | 'replace' = 'merge',
): void {
  if (data.version !== 1 || !Array.isArray(data.studies)) {
    throw new Error('Arquivo JSON inválido')
  }
  if (mode === 'replace') {
    saveStudies(data.studies)
    savePrintPacks(data.printPacks ?? [])
    return
  }
  const studies = loadStudies()
  const byId = new Map(studies.map((s) => [s.id, s]))
  for (const s of data.studies) byId.set(s.id, s)
  saveStudies([...byId.values()])

  if (data.printPacks) {
    const packs = loadPrintPacks()
    const pmap = new Map(packs.map((p) => [p.id, p]))
    for (const p of data.printPacks) pmap.set(p.id, p)
    savePrintPacks([...pmap.values()])
  }
}

export async function importFromFile(
  file: File,
  mode: 'merge' | 'replace' = 'merge',
): Promise<void> {
  const text = await file.text()
  const data = JSON.parse(text) as StudiesExport
  importFromObject(data, mode)
}

export function newId(prefix = 'id'): string {
  return `${prefix}_${crypto.randomUUID()}`
}
