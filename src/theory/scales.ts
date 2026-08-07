import { normalizePc, noteToPc, type NoteName, type PitchClass } from './notes'

export type ScaleCategory = 'major' | 'minor' | 'pentatonic' | 'blues' | 'mode' | 'other'

export type ScaleDefinition = {
  id: string
  name: string
  category: ScaleCategory
  /** Intervals in semitones from root */
  intervals: number[]
  /** Characteristic degree label for modes (optional) */
  characteristic?: string
}

export const SCALE_CATALOG: ScaleDefinition[] = [
  {
    id: 'major',
    name: 'Maior (Ionian)',
    category: 'major',
    intervals: [0, 2, 4, 5, 7, 9, 11],
  },
  {
    id: 'natural-minor',
    name: 'Menor natural (Aeolian)',
    category: 'minor',
    intervals: [0, 2, 3, 5, 7, 8, 10],
  },
  {
    id: 'harmonic-minor',
    name: 'Menor harmônica',
    category: 'minor',
    intervals: [0, 2, 3, 5, 7, 8, 11],
  },
  {
    id: 'melodic-minor',
    name: 'Menor melódica',
    category: 'minor',
    intervals: [0, 2, 3, 5, 7, 9, 11],
  },
  {
    id: 'major-pentatonic',
    name: 'Pentatônica maior',
    category: 'pentatonic',
    intervals: [0, 2, 4, 7, 9],
  },
  {
    id: 'minor-pentatonic',
    name: 'Pentatônica menor',
    category: 'pentatonic',
    intervals: [0, 3, 5, 7, 10],
  },
  {
    id: 'blues',
    name: 'Blues',
    category: 'blues',
    intervals: [0, 3, 5, 6, 7, 10],
  },
  {
    id: 'ionian',
    name: 'Jônio (Ionian)',
    category: 'mode',
    intervals: [0, 2, 4, 5, 7, 9, 11],
    characteristic: '1',
  },
  {
    id: 'dorian',
    name: 'Dórico (Dorian)',
    category: 'mode',
    intervals: [0, 2, 3, 5, 7, 9, 10],
    characteristic: '6',
  },
  {
    id: 'phrygian',
    name: 'Frígio (Phrygian)',
    category: 'mode',
    intervals: [0, 1, 3, 5, 7, 8, 10],
    characteristic: 'b2',
  },
  {
    id: 'lydian',
    name: 'Lídio (Lydian)',
    category: 'mode',
    intervals: [0, 2, 4, 6, 7, 9, 11],
    characteristic: '#4',
  },
  {
    id: 'mixolydian',
    name: 'Mixolídio (Mixolydian)',
    category: 'mode',
    intervals: [0, 2, 4, 5, 7, 9, 10],
    characteristic: 'b7',
  },
  {
    id: 'aeolian',
    name: 'Eólio (Aeolian)',
    category: 'mode',
    intervals: [0, 2, 3, 5, 7, 8, 10],
    characteristic: 'b6',
  },
  {
    id: 'locrian',
    name: 'Lócrio (Locrian)',
    category: 'mode',
    intervals: [0, 1, 3, 5, 6, 8, 10],
    characteristic: 'b5',
  },
]

export function getScaleById(id: string): ScaleDefinition | undefined {
  return SCALE_CATALOG.find((s) => s.id === id)
}

export function scalePitchClasses(
  root: NoteName | PitchClass,
  scale: ScaleDefinition,
): Set<PitchClass> {
  const rootPc = typeof root === 'number' ? normalizePc(root) : noteToPc(root)
  return new Set(scale.intervals.map((i) => normalizePc(rootPc + i)))
}

export function scaleContainsAll(
  root: NoteName | PitchClass,
  scale: ScaleDefinition,
  notes: Iterable<PitchClass>,
): boolean {
  const pcs = scalePitchClasses(root, scale)
  for (const n of notes) {
    if (!pcs.has(normalizePc(n))) return false
  }
  return true
}

export function coverageScore(
  root: NoteName | PitchClass,
  scale: ScaleDefinition,
  notes: Iterable<PitchClass>,
): { matched: number; total: number; ratio: number; extraInScale: number } {
  const noteSet = new Set([...notes].map(normalizePc))
  const scaleSet = scalePitchClasses(root, scale)
  let matched = 0
  for (const n of noteSet) {
    if (scaleSet.has(n)) matched++
  }
  const total = noteSet.size
  const extraInScale = scaleSet.size - matched
  return {
    matched,
    total,
    ratio: total === 0 ? 0 : matched / total,
    extraInScale,
  }
}
