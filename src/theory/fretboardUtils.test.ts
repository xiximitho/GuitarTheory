import { describe, expect, it } from 'vitest'
import {
  buildScaleMarks,
  clipPositionsToBoard,
  notesToPitchClasses,
  toggleNote,
} from './fretboardUtils'
import { STANDARD_TUNING, noteToPc, resizeTuning } from './notes'

describe('toggleNote', () => {
  it('adds and removes the same position', () => {
    const a = toggleNote([], 0, 5)
    expect(a).toEqual([{ string: 0, fret: 5 }])
    expect(toggleNote(a, 0, 5)).toEqual([])
  })
})

describe('notesToPitchClasses', () => {
  it('maps standard open low E and A at fret 0', () => {
    const pcs = notesToPitchClasses(
      [
        { string: 0, fret: 0 },
        { string: 1, fret: 0 },
      ],
      STANDARD_TUNING,
    )
    expect(pcs).toEqual([noteToPc('E'), noteToPc('A')])
  })
})

describe('buildScaleMarks', () => {
  it('marks roots and scale tones for A minor pentatonic', () => {
    const marks = buildScaleMarks(STANDARD_TUNING, 'A', 'minor-pentatonic', 5, 0, 0)
    expect(marks.some((m) => m.kind === 'root')).toBe(true)
    expect(marks.some((m) => m.kind === 'scale')).toBe(true)
    expect(marks.every((m) => m.fret >= 0 && m.fret <= 5)).toBe(true)
  })

  it('respects firstFret window', () => {
    const marks = buildScaleMarks(STANDARD_TUNING, 'A', 'minor-pentatonic', 8, 0, 5)
    expect(marks.every((m) => m.fret >= 5 && m.fret <= 8)).toBe(true)
  })
})

describe('clipPositionsToBoard', () => {
  it('drops out-of-range strings and frets', () => {
    expect(
      clipPositionsToBoard(
        [
          { string: 0, fret: 3 },
          { string: 6, fret: 3 },
          { string: 1, fret: 20 },
        ],
        6,
        15,
      ),
    ).toEqual([{ string: 0, fret: 3 }])
  })
})

describe('resizeTuning', () => {
  it('adds low B for 7 strings and drops it back to 6', () => {
    const seven = resizeTuning(STANDARD_TUNING, 7)
    expect(seven).toHaveLength(7)
    expect(seven[0]).toBe('B')
    expect(resizeTuning(seven, 6)).toEqual(STANDARD_TUNING)
  })
})
