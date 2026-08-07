import { describe, expect, it } from 'vitest'
import { cagedShapeForRoot, cagedForScale } from './caged'
import { STANDARD_TUNING, noteToPc, fretNotePc } from './notes'

describe('caged', () => {
  it('transposes E shape roots to A', () => {
    const positions = cagedShapeForRoot('E', 'A', STANDARD_TUNING)
    const roots = positions.filter((p) => p.isRoot)
    expect(roots.length).toBeGreaterThan(0)
    for (const r of roots) {
      const pc = fretNotePc(STANDARD_TUNING[r.string], r.fret, 0)
      expect(pc).toBe(noteToPc('A'))
    }
  })

  it('filters shape notes to scale pitches', () => {
    const positions = cagedForScale('E', 'G', 'minor-pentatonic', STANDARD_TUNING)
    expect(positions.length).toBeGreaterThan(0)
    const allowed = new Set([0, 3, 5, 7, 10].map((i) => (noteToPc('G') + i) % 12))
    for (const p of positions) {
      const pc = fretNotePc(STANDARD_TUNING[p.string], p.fret, 0)
      expect(allowed.has(pc)).toBe(true)
    }
  })
})
