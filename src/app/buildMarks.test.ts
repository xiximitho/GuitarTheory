import { describe, expect, it } from 'vitest'
import { STANDARD_TUNING } from '@/theory/notes'
import { buildStudioMarks } from './buildMarks'

describe('buildStudioMarks', () => {
  it('builds CAGED marks on caged tab', () => {
    const marks = buildStudioMarks({
      tab: 'caged',
      tuning: STANDARD_TUNING,
      showAllCaged: false,
      cagedShapes: ['E'],
      cagedRoot: 'C',
      cagedScaleId: null,
      overlayScaleId: null,
      overlayRoot: null,
      selectedNotes: [],
      lastFret: 15,
    })
    expect(marks.length).toBeGreaterThan(0)
    expect(marks.every((m) => m.kind === 'caged' || m.kind === 'root')).toBe(true)
  })

  it('includes selected notes on explorer', () => {
    const marks = buildStudioMarks({
      tab: 'explorer',
      tuning: STANDARD_TUNING,
      showAllCaged: false,
      cagedShapes: ['E'],
      cagedRoot: 'C',
      cagedScaleId: null,
      overlayScaleId: null,
      overlayRoot: null,
      selectedNotes: [{ string: 1, fret: 5 }],
      lastFret: 15,
    })
    expect(marks.some((m) => m.kind === 'selected')).toBe(true)
  })

  it('adds scale overlay marks when scale is active', () => {
    const marks = buildStudioMarks({
      tab: 'explorer',
      tuning: STANDARD_TUNING,
      showAllCaged: false,
      cagedShapes: ['E'],
      cagedRoot: 'C',
      cagedScaleId: null,
      overlayScaleId: 'minor-pentatonic',
      overlayRoot: 'A',
      selectedNotes: [],
      firstFret: 0,
      lastFret: 12,
    })
    expect(marks.some((m) => m.kind === 'root')).toBe(true)
    expect(marks.some((m) => m.kind === 'scale')).toBe(true)
  })
})
