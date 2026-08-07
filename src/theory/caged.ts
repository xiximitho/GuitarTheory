import { noteToPc, normalizePc, type NoteName } from './notes'
import { getScaleById, scalePitchClasses } from './scales'

export type CagedShapeId = 'C' | 'A' | 'G' | 'E' | 'D'

export type FretPosition = {
  /** 0 = low E */
  string: number
  fret: number
  isRoot?: boolean
}

/**
 * CAGED major shapes as relative frets from the shape's "base" fret
 * (lowest fret used in the box, not necessarily the root).
 * Roots are marked; only notes in the major scale within a ~4-fret box.
 *
 * Positions use absolute frets for root = C (open-friendly reference),
 * then we transpose by (targetRootPc - C).
 */
const CAGED_MAJOR_AT_C: Record<CagedShapeId, FretPosition[]> = {
  // C shape around open / fret 0–3 for C major
  C: [
    { string: 4, fret: 1, isRoot: true }, // B string C
    { string: 5, fret: 0 }, // high e
    { string: 5, fret: 3 },
    { string: 3, fret: 0 },
    { string: 3, fret: 2 },
    { string: 2, fret: 0 },
    { string: 2, fret: 2 },
    { string: 1, fret: 0 },
    { string: 1, fret: 2 },
    { string: 1, fret: 3, isRoot: true },
    { string: 0, fret: 0 },
    { string: 0, fret: 3, isRoot: true },
  ],
  // A shape — barre around fret 3 for C (A-form)
  A: [
    { string: 0, fret: 3, isRoot: true },
    { string: 0, fret: 5 },
    { string: 1, fret: 3, isRoot: true },
    { string: 1, fret: 5 },
    { string: 2, fret: 2 },
    { string: 2, fret: 5 },
    { string: 3, fret: 2 },
    { string: 3, fret: 4 },
    { string: 3, fret: 5 },
    { string: 4, fret: 3 },
    { string: 4, fret: 5, isRoot: true },
    { string: 5, fret: 3 },
    { string: 5, fret: 5 },
  ],
  // G shape for C — around frets 5–8
  G: [
    { string: 0, fret: 5 },
    { string: 0, fret: 7 },
    { string: 0, fret: 8, isRoot: true },
    { string: 1, fret: 5 },
    { string: 1, fret: 7 },
    { string: 1, fret: 8, isRoot: true },
    { string: 2, fret: 5 },
    { string: 2, fret: 7 },
    { string: 3, fret: 5 },
    { string: 3, fret: 7 },
    { string: 4, fret: 5, isRoot: true },
    { string: 4, fret: 6 },
    { string: 4, fret: 8 },
    { string: 5, fret: 5 },
    { string: 5, fret: 7 },
    { string: 5, fret: 8 },
  ],
  // E shape barre at fret 8 for C
  E: [
    { string: 0, fret: 8, isRoot: true },
    { string: 0, fret: 10 },
    { string: 0, fret: 12 },
    { string: 1, fret: 8, isRoot: true },
    { string: 1, fret: 10 },
    { string: 1, fret: 12 },
    { string: 2, fret: 9 },
    { string: 2, fret: 10 },
    { string: 2, fret: 12 },
    { string: 3, fret: 9 },
    { string: 3, fret: 10 },
    { string: 3, fret: 12 },
    { string: 4, fret: 8 },
    { string: 4, fret: 10 },
    { string: 4, fret: 12, isRoot: true },
    { string: 5, fret: 8 },
    { string: 5, fret: 10 },
    { string: 5, fret: 12 },
  ],
  // D shape for C — around frets 10–13
  D: [
    { string: 0, fret: 10 },
    { string: 0, fret: 12 },
    { string: 0, fret: 13 },
    { string: 1, fret: 10 },
    { string: 1, fret: 12 },
    { string: 1, fret: 13 },
    { string: 2, fret: 10 },
    { string: 2, fret: 12, isRoot: true },
    { string: 3, fret: 10 },
    { string: 3, fret: 12 },
    { string: 3, fret: 14 },
    { string: 4, fret: 10 },
    { string: 4, fret: 12, isRoot: true },
    { string: 4, fret: 13 },
    { string: 5, fret: 10 },
    { string: 5, fret: 12 },
    { string: 5, fret: 13 },
  ],
}

export const CAGED_ORDER: CagedShapeId[] = ['C', 'A', 'G', 'E', 'D']

export function transposePositions(
  positions: FretPosition[],
  semitones: number,
  maxFret = 22,
): FretPosition[] {
  return positions
    .map((p) => ({
      ...p,
      fret: p.fret + semitones,
    }))
    .filter((p) => p.fret >= 0 && p.fret <= maxFret)
}

export function cagedShapeForRoot(
  shape: CagedShapeId,
  root: NoteName,
  tuning: NoteName[] = ['E', 'A', 'D', 'G', 'B', 'E'],
  maxFret = 22,
): FretPosition[] {
  const delta = normalizePc(noteToPc(root) - noteToPc('C'))
  const rootPc = noteToPc(root)
  return transposePositions(CAGED_MAJOR_AT_C[shape], delta, maxFret).map((p) => {
    const pc = normalizePc(noteToPc(tuning[p.string]) + p.fret)
    return { ...p, isRoot: pc === rootPc }
  })
}

export function allCagedShapesForRoot(
  root: NoteName,
  tuning: NoteName[] = ['E', 'A', 'D', 'G', 'B', 'E'],
  maxFret = 22,
): Record<CagedShapeId, FretPosition[]> {
  return {
    C: cagedShapeForRoot('C', root, tuning, maxFret),
    A: cagedShapeForRoot('A', root, tuning, maxFret),
    G: cagedShapeForRoot('G', root, tuning, maxFret),
    E: cagedShapeForRoot('E', root, tuning, maxFret),
    D: cagedShapeForRoot('D', root, tuning, maxFret),
  }
}

/** Filter a CAGED shape to notes belonging to a given scale (default major). */
export function cagedForScale(
  shape: CagedShapeId,
  root: NoteName,
  scaleId: string,
  tuning: NoteName[],
  rootOffset = 0,
  maxFret = 22,
): FretPosition[] {
  const scale = getScaleById(scaleId) ?? getScaleById('major')!
  const pcs = scalePitchClasses(root, scale)
  const rootPc = noteToPc(root)
  const positions = cagedShapeForRoot(shape, root, tuning, maxFret)

  return positions
    .filter((p) => {
      const open = tuning[p.string]
      const pc = normalizePc(noteToPc(open) + p.fret + rootOffset)
      return pcs.has(pc)
    })
    .map((p) => {
      const open = tuning[p.string]
      const pc = normalizePc(noteToPc(open) + p.fret + rootOffset)
      return { ...p, isRoot: pc === rootPc }
    })
}

export function positionsToKeySet(positions: FretPosition[]): Set<string> {
  return new Set(positions.map((p) => `${p.string}:${p.fret}`))
}
