import { describe, expect, it } from 'vitest'
import type { Study } from '@/types/study'
import { createEmptyBoard, duplicateBoard, normalizeStudyBoards } from './studyBoards'

function baseStudy(partial: Partial<Study> = {}): Study {
  return {
    id: 's1',
    title: 'Teste',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    tuning: ['E', 'A', 'D', 'G', 'B', 'E'],
    rootOffset: 0,
    ...partial,
  }
}

describe('normalizeStudyBoards', () => {
  it('migrates legacy flat study into one board', () => {
    const boards = normalizeStudyBoards(
      baseStudy({
        selectedNotes: [{ string: 0, fret: 5 }],
        lick: { steps: [{ string: 1, fret: 7 }] },
        overlays: [{ kind: 'scale', id: 'dorian', root: 'D' }],
        firstFret: 0,
        lastFret: 12,
      }),
    )
    expect(boards).toHaveLength(1)
    expect(boards[0]!.selectedNotes).toEqual([
      { string: 0, fret: 5 },
      { string: 1, fret: 7 },
    ])
    expect(boards[0]!.overlays?.[0]?.id).toBe('dorian')
    expect(boards[0]!.lastFret).toBe(12)
  })

  it('parses legacy CAGED overlay into board caged fields', () => {
    const boards = normalizeStudyBoards(
      baseStudy({
        selectedNotes: [],
        overlays: [{ kind: 'caged', id: 'EG', root: 'A' }],
      }),
    )
    expect(boards[0]!.cagedRoot).toBe('A')
    expect(boards[0]!.showAllCaged).toBe(false)
    expect(boards[0]!.cagedShapes).toEqual(['E', 'G'])
  })

  it('keeps multi-board studies and fills missing ids/titles', () => {
    const boards = normalizeStudyBoards(
      baseStudy({
        boards: [
          {
            id: '',
            selectedNotes: [{ string: 0, fret: 3 }],
          },
          {
            id: 'b2',
            title: 'Posição A',
            selectedNotes: [],
          },
        ],
      }),
    )
    expect(boards).toHaveLength(2)
    expect(boards[0]!.id.length).toBeGreaterThan(0)
    expect(boards[0]!.title).toBe('Braço 1')
    expect(boards[1]!.title).toBe('Posição A')
  })
})

describe('createEmptyBoard / duplicateBoard', () => {
  it('creates empty board and duplicates with new id', () => {
    const a = createEmptyBoard({
      title: 'Um',
      selectedNotes: [{ string: 0, fret: 5 }],
    })
    const b = duplicateBoard(a)
    expect(b.id).not.toBe(a.id)
    expect(b.selectedNotes).toEqual(a.selectedNotes)
    expect(b.title).toBe('Um (cópia)')
  })
})
