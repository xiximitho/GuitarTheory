import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import type { Study } from '@/types/study'
import {
  deleteStudy,
  importFromObject,
  loadStudies,
  saveStudies,
  upsertStudy,
} from './studies'

function memoryStorage() {
  const map = new Map<string, string>()
  return {
    getItem: (k: string) => map.get(k) ?? null,
    setItem: (k: string, v: string) => {
      map.set(k, v)
    },
    removeItem: (k: string) => {
      map.delete(k)
    },
    clear: () => map.clear(),
  }
}

const sample = (id: string, title: string): Study => ({
  id,
  title,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  tuning: ['E', 'A', 'D', 'G', 'B', 'E'],
  rootOffset: 0,
  selectedNotes: [{ string: 0, fret: 5 }],
})

describe('studies storage', () => {
  beforeEach(() => {
    Object.defineProperty(globalThis, 'localStorage', {
      value: memoryStorage(),
      configurable: true,
    })
  })

  afterEach(() => {
    saveStudies([])
  })

  it('upserts and deletes studies', () => {
    expect(loadStudies()).toEqual([])
    upsertStudy(sample('a', 'Um'))
    upsertStudy(sample('b', 'Dois'))
    expect(loadStudies()).toHaveLength(2)
    upsertStudy({ ...sample('a', 'Um editado'), updatedAt: '2026-02-01T00:00:00.000Z' })
    expect(loadStudies().find((s) => s.id === 'a')?.title).toBe('Um editado')
    deleteStudy('b')
    expect(loadStudies().map((s) => s.id)).toEqual(['a'])
  })

  it('merges import by id and rejects invalid payload', () => {
    upsertStudy(sample('a', 'Local'))
    importFromObject(
      {
        version: 1,
        exportedAt: '2026-03-01T00:00:00.000Z',
        studies: [sample('a', 'Importado'), sample('c', 'Novo')],
      },
      'merge',
    )
    const all = loadStudies()
    expect(all).toHaveLength(2)
    expect(all.find((s) => s.id === 'a')?.title).toBe('Importado')
    expect(all.find((s) => s.id === 'c')?.title).toBe('Novo')

    expect(() =>
      importFromObject({ version: 2, exportedAt: '', studies: [] } as never),
    ).toThrow(/inválido/i)
  })

  it('replace mode overwrites the list', () => {
    upsertStudy(sample('old', 'Velho'))
    importFromObject(
      {
        version: 1,
        exportedAt: '2026-03-01T00:00:00.000Z',
        studies: [sample('new', 'Novo')],
      },
      'replace',
    )
    expect(loadStudies().map((s) => s.id)).toEqual(['new'])
  })
})
