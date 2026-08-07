import { describe, expect, it } from 'vitest'
import { matchScales } from './matcher'
import { noteToPc, type NoteName } from './notes'

describe('matchScales', () => {
  it('finds A minor pentatonic from its notes', () => {
    const names: NoteName[] = ['A', 'C', 'D', 'E', 'G']
    const notes = names.map(noteToPc)
    const matches = matchScales(notes, { includePartial: false })
    const hit = matches.find(
      (m) => m.scale.id === 'minor-pentatonic' && m.root === 'A' && m.exact,
    )
    expect(hit).toBeTruthy()
  })

  it('finds D Dorian from dorian pitch set', () => {
    // D E F G A B C
    const names: NoteName[] = ['D', 'E', 'F', 'G', 'A', 'B', 'C']
    const notes = names.map(noteToPc)
    const matches = matchScales(notes, { includePartial: false })
    const dorian = matches.find((m) => m.scale.id === 'dorian' && m.root === 'D')
    expect(dorian?.exact).toBe(true)
  })

  it('returns empty for no notes', () => {
    expect(matchScales([])).toEqual([])
  })
})
