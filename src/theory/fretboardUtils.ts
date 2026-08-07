import type { FretMark } from '@/types/fretboard'
import type { NotePos } from '@/types/study'
import type { FretPosition } from './caged'
import { fretNotePc, noteToPc, type NoteName, type PitchClass } from './notes'
import { getScaleById, scalePitchClasses } from './scales'

export function posKey(string: number, fret: number): string {
  return `${string}:${fret}`
}

export function toggleNote(notes: NotePos[], string: number, fret: number): NotePos[] {
  const key = posKey(string, fret)
  const exists = notes.some((n) => posKey(n.string, n.fret) === key)
  if (exists) return notes.filter((n) => posKey(n.string, n.fret) !== key)
  return [...notes, { string, fret }]
}

export function notesToPitchClasses(
  notes: NotePos[],
  tuning: NoteName[],
  rootOffset = 0,
): PitchClass[] {
  return notes.map((n) => fretNotePc(tuning[n.string], n.fret, rootOffset))
}

export function buildScaleMarks(
  tuning: NoteName[],
  root: NoteName,
  scaleId: string,
  fretCount: number,
  rootOffset = 0,
): FretMark[] {
  const scale = getScaleById(scaleId)
  if (!scale) return []
  const pcs = scalePitchClasses(root, scale)
  const rootPc = noteToPc(root)
  const marks: FretMark[] = []

  for (let s = 0; s < tuning.length; s++) {
    for (let f = 0; f <= fretCount; f++) {
      const pc = fretNotePc(tuning[s], f, rootOffset)
      if (!pcs.has(pc)) continue
      marks.push({
        string: s,
        fret: f,
        kind: pc === rootPc ? 'root' : 'scale',
      })
    }
  }
  return marks
}

export function buildSelectedMarks(notes: NotePos[]): FretMark[] {
  return notes.map((n) => ({
    string: n.string,
    fret: n.fret,
    kind: 'selected',
  }))
}

export function buildLickMarks(steps: NotePos[]): FretMark[] {
  return steps.map((n, i) => ({
    string: n.string,
    fret: n.fret,
    kind: 'lick',
    order: i + 1,
  }))
}

export function buildCagedMarks(positions: FretPosition[]): FretMark[] {
  return positions.map((p) => ({
    string: p.string,
    fret: p.fret,
    kind: p.isRoot ? 'root' : 'caged',
  }))
}

export function mergeMarks(...groups: FretMark[][]): FretMark[] {
  return groups.flat()
}
