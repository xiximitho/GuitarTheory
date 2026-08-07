import { normalizePc, PC_TO_SHARP, type NoteName, type PitchClass } from './notes'
import {
  coverageScore,
  SCALE_CATALOG,
  scaleContainsAll,
  type ScaleDefinition,
} from './scales'

export type ScaleMatch = {
  scale: ScaleDefinition
  root: NoteName
  rootPc: PitchClass
  exact: boolean
  matched: number
  total: number
  ratio: number
  /** Lower is more specific (fewer notes outside the selection when exact) */
  specificity: number
}

/**
 * Find scales that contain all selected pitch classes.
 * Tries all 12 roots × catalog; ranks exact matches by specificity,
 * then partial matches by coverage ratio.
 */
export function matchScales(
  selected: Iterable<PitchClass>,
  options?: { includePartial?: boolean; minRatio?: number },
): ScaleMatch[] {
  const notes = [...new Set([...selected].map(normalizePc))]
  if (notes.length === 0) return []

  const includePartial = options?.includePartial ?? true
  const minRatio = options?.minRatio ?? 0.75
  const results: ScaleMatch[] = []

  for (const scale of SCALE_CATALOG) {
    for (let rootPc = 0; rootPc < 12; rootPc++) {
      const root = PC_TO_SHARP[rootPc]
      const exact = scaleContainsAll(rootPc, scale, notes)
      const { matched, total, ratio, extraInScale } = coverageScore(rootPc, scale, notes)

      if (exact) {
        results.push({
          scale,
          root,
          rootPc,
          exact: true,
          matched,
          total,
          ratio: 1,
          specificity: extraInScale,
        })
      } else if (includePartial && ratio >= minRatio && matched >= 3) {
        results.push({
          scale,
          root,
          rootPc,
          exact: false,
          matched,
          total,
          ratio,
          specificity: extraInScale + (1 - ratio) * 10,
        })
      }
    }
  }

  // Deduplicate identical scale+root (major/ionian, natural-minor/aeolian)
  const seen = new Set<string>()
  const deduped: ScaleMatch[] = []
  for (const m of results.sort(compareMatches)) {
    const key = `${m.rootPc}:${[...m.scale.intervals].sort().join(',')}`
    // Prefer mode names over duplicate major/minor when intervals match
    if (seen.has(key)) continue
    seen.add(key)
    deduped.push(m)
  }

  // Actually we want to show both Ionian and Major - they're pedagogically useful.
  // Re-sort without aggressive dedupe of names; only skip true duplicates of same id+root
  const byId = new Map<string, ScaleMatch>()
  for (const m of results) {
    const key = `${m.scale.id}:${m.rootPc}`
    const prev = byId.get(key)
    if (!prev || compareMatches(m, prev) < 0) byId.set(key, m)
  }

  return [...byId.values()].sort(compareMatches)
}

function compareMatches(a: ScaleMatch, b: ScaleMatch): number {
  if (a.exact !== b.exact) return a.exact ? -1 : 1
  if (a.ratio !== b.ratio) return b.ratio - a.ratio
  if (a.specificity !== b.specificity) return a.specificity - b.specificity
  if (a.scale.intervals.length !== b.scale.intervals.length) {
    return a.scale.intervals.length - b.scale.intervals.length
  }
  return a.scale.name.localeCompare(b.scale.name)
}

/** Convenience: match from fret positions via pitch classes already resolved */
export function matchScalesFromPcs(pcs: PitchClass[]): ScaleMatch[] {
  return matchScales(pcs, { includePartial: true, minRatio: 0.7 })
}
