import { describe, expect, it } from 'vitest'
import { markRoots, transposePositionsBySemitones, wrapRootOffset } from './transpose'

describe('transposePositionsBySemitones', () => {
  it('moves frets by semitones', () => {
    expect(
      transposePositionsBySemitones(
        [
          { string: 0, fret: 5 },
          { string: 1, fret: 7 },
        ],
        2,
        22,
      ),
    ).toEqual([
      { string: 0, fret: 7 },
      { string: 1, fret: 9 },
    ])
  })

  it('drops frets outside 0…maxFret', () => {
    expect(transposePositionsBySemitones([{ string: 0, fret: 1 }], -2, 15)).toEqual([])
    expect(transposePositionsBySemitones([{ string: 0, fret: 14 }], 3, 15)).toEqual([])
  })
})

describe('wrapRootOffset', () => {
  it('wraps into 0–11', () => {
    expect(wrapRootOffset(12)).toBe(0)
    expect(wrapRootOffset(-1)).toBe(11)
    expect(wrapRootOffset(3)).toBe(3)
  })
})

describe('markRoots', () => {
  it('flags positions listed in rootKeys', () => {
    const out = markRoots(
      [
        { string: 0, fret: 5, isRoot: false },
        { string: 1, fret: 7, isRoot: false },
      ],
      new Set(['0:5']),
    )
    expect(out[0]?.isRoot).toBe(true)
    expect(out[1]?.isRoot).toBe(false)
  })
})
