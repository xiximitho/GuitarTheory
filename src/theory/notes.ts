/** Pitch class 0–11, C = 0 */
export type PitchClass = number

export type NoteName =
  | 'C'
  | 'C#'
  | 'Db'
  | 'D'
  | 'D#'
  | 'Eb'
  | 'E'
  | 'F'
  | 'F#'
  | 'Gb'
  | 'G'
  | 'G#'
  | 'Ab'
  | 'A'
  | 'A#'
  | 'Bb'
  | 'B'

export const NOTE_TO_PC: Record<NoteName, PitchClass> = {
  C: 0,
  'C#': 1,
  Db: 1,
  D: 2,
  'D#': 3,
  Eb: 3,
  E: 4,
  F: 5,
  'F#': 6,
  Gb: 6,
  G: 7,
  'G#': 8,
  Ab: 8,
  A: 9,
  'A#': 10,
  Bb: 10,
  B: 11,
}

/** Prefer sharps for display by default */
export const PC_TO_SHARP: NoteName[] = [
  'C',
  'C#',
  'D',
  'D#',
  'E',
  'F',
  'F#',
  'G',
  'G#',
  'A',
  'A#',
  'B',
]

export const PC_TO_FLAT: NoteName[] = [
  'C',
  'Db',
  'D',
  'Eb',
  'E',
  'F',
  'Gb',
  'G',
  'Ab',
  'A',
  'Bb',
  'B',
]

export const ROOT_OPTIONS: NoteName[] = [
  'C',
  'C#',
  'Db',
  'D',
  'D#',
  'Eb',
  'E',
  'F',
  'F#',
  'Gb',
  'G',
  'G#',
  'Ab',
  'A',
  'A#',
  'Bb',
  'B',
]

export type AccidentalPreference = 'sharp' | 'flat'

export function normalizePc(n: number): PitchClass {
  return ((n % 12) + 12) % 12
}

export function noteToPc(note: NoteName): PitchClass {
  return NOTE_TO_PC[note]
}

export function pcToName(
  pc: PitchClass,
  preference: AccidentalPreference = 'sharp',
): NoteName {
  return preference === 'flat'
    ? PC_TO_FLAT[normalizePc(pc)]
    : PC_TO_SHARP[normalizePc(pc)]
}

export function transposePc(pc: PitchClass, semitones: number): PitchClass {
  return normalizePc(pc + semitones)
}

/** Standard tuning low E → high e, string index 0 = low E */
export const STANDARD_TUNING: NoteName[] = ['E', 'A', 'D', 'G', 'B', 'E']

export function fretNotePc(
  openStringNote: NoteName,
  fret: number,
  rootOffset = 0,
): PitchClass {
  return normalizePc(noteToPc(openStringNote) + fret + rootOffset)
}

/** Scale-degree style: 1, b2, 2, … #4, 5, … */
export function degreeLabel(rootPc: PitchClass, notePc: PitchClass): string {
  const interval = normalizePc(notePc - rootPc)
  const labels = ['1', 'b2', '2', 'b3', '3', '4', '#4', '5', 'b6', '6', 'b7', '7']
  return labels[interval] ?? String(interval)
}

export function degreeLabelPreferFlatFifth(
  rootPc: PitchClass,
  notePc: PitchClass,
): string {
  const interval = normalizePc(notePc - rootPc)
  const map: Record<number, string> = {
    0: '1',
    1: 'b2',
    2: '2',
    3: 'b3',
    4: '3',
    5: '4',
    6: 'b5',
    7: '5',
    8: 'b6',
    9: '6',
    10: 'b7',
    11: '7',
  }
  return map[interval]
}

/**
 * Interval quality labels for fretboard (compact PT-BR guitar style).
 * Tritone is neutral `TT` (A4 / d5).
 */
export function intervalLabel(rootPc: PitchClass, notePc: PitchClass): string {
  const interval = normalizePc(notePc - rootPc)
  const labels = ['1', '2m', '2M', '3m', '3M', '4', 'TT', '5', '6m', '6M', '7m', '7M']
  return labels[interval] ?? String(interval)
}

/** Fórmula intervalar de uma escala (ex.: `1 2 b3 4 5 6 b7`). */
export function scaleFormulaLabels(intervals: readonly number[]): string[] {
  const hasTritone = intervals.includes(6)
  const hasPerfectFifth = intervals.includes(7)
  const hasMinorThird = intervals.includes(3)
  const hasMajorThird = intervals.includes(4)
  // Locrian (no P5) or blues-like (#4/b5 with b3 + P5) → b5; Lydian → #4
  const preferFlatFifth =
    hasTritone && (!hasPerfectFifth || (hasMinorThird && !hasMajorThird))
  return intervals.map((semitones) =>
    preferFlatFifth
      ? degreeLabelPreferFlatFifth(0, semitones)
      : degreeLabel(0, semitones),
  )
}

export function formatScaleFormula(intervals: readonly number[]): string {
  return scaleFormulaLabels(intervals).join(' ')
}
