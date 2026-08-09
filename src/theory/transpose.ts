import type { FretPosition } from './caged'
import { normalizePc } from './notes'

export type NotePos = { string: number; fret: number }

export function transposePositionsBySemitones<T extends NotePos>(
  positions: T[],
  semitones: number,
  maxFret = 22,
): T[] {
  return positions
    .map((p) => ({ ...p, fret: p.fret + semitones }))
    .filter((p) => p.fret >= 0 && p.fret <= maxFret)
}

export function wrapRootOffset(offset: number): number {
  return normalizePc(offset)
}

export function markRoots(
  positions: FretPosition[],
  rootKeys: Set<string>,
): FretPosition[] {
  return positions.map((p) => ({
    ...p,
    isRoot: rootKeys.has(`${p.string}:${p.fret}`),
  }))
}
