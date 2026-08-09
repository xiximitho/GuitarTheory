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

  it('includes partial matches when enabled', () => {
    // Quase A penta menor, com uma nota fora (Bb)
    const names: NoteName[] = ['A', 'C', 'D', 'E', 'Bb']
    const notes = names.map(noteToPc)
    const matches = matchScales(notes, { includePartial: true, minRatio: 0.7 })
    const partial = matches.find(
      (m) => m.scale.id === 'minor-pentatonic' && m.root === 'A' && !m.exact,
    )
    expect(partial).toBeTruthy()
    expect(partial!.ratio).toBeGreaterThanOrEqual(0.7)
  })

  it('ranks more specific exact scales ahead of broader ones', () => {
    const names: NoteName[] = ['A', 'C', 'D', 'E', 'G']
    const notes = names.map(noteToPc)
    const matches = matchScales(notes, { includePartial: false })
    const pentaIdx = matches.findIndex(
      (m) => m.scale.id === 'minor-pentatonic' && m.root === 'A',
    )
    const aeolianIdx = matches.findIndex(
      (m) => m.scale.id === 'aeolian' && m.root === 'A',
    )
    expect(pentaIdx).toBeGreaterThanOrEqual(0)
    expect(aeolianIdx).toBeGreaterThanOrEqual(0)
    expect(pentaIdx).toBeLessThan(aeolianIdx)
  })
})
