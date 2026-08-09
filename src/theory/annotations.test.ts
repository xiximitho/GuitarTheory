import { describe, expect, it } from 'vitest'
import {
  makeConnectionAnnotation,
  makePointAnnotation,
  transposeAnnotations,
} from './annotations'

describe('annotations', () => {
  it('creates point techniques', () => {
    const vib = makePointAnnotation('vibrato', { string: 0, fret: 5 })
    expect(vib?.kind).toBe('vibrato')
    expect(vib?.to).toBeUndefined()
    expect(makePointAnnotation('slide', { string: 0, fret: 5 })).toBeNull()
  })

  it('creates connections and rejects same cell', () => {
    const slide = makeConnectionAnnotation(
      'slide',
      { string: 1, fret: 5 },
      { string: 1, fret: 7 },
    )
    expect(slide?.kind).toBe('slide')
    expect(slide?.to).toEqual({ string: 1, fret: 7 })
    expect(
      makeConnectionAnnotation('arrow', { string: 0, fret: 3 }, { string: 0, fret: 3 }),
    ).toBeNull()
  })

  it('transposes annotations and drops out-of-range ends', () => {
    const ann = makeConnectionAnnotation(
      'hammer-on',
      { string: 2, fret: 14 },
      { string: 2, fret: 15 },
    )!
    const moved = transposeAnnotations([ann], 1, 15)
    expect(moved).toHaveLength(0)

    const ok = transposeAnnotations([ann], -2, 15)
    expect(ok[0]?.from.fret).toBe(12)
    expect(ok[0]?.to?.fret).toBe(13)
  })
})
