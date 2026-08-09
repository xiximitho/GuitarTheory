import { CAGED_ORDER, type CagedShapeId } from '@/theory/caged'
import { posKey } from '@/theory/fretboardUtils'
import type { NotePos, Study, StudyBoard } from '@/types/study'
import { newId } from './studies'

function mergeUniquePositions(...groups: NotePos[][]): NotePos[] {
  const map = new Map<string, NotePos>()
  for (const group of groups) {
    for (const p of group) map.set(posKey(p.string, p.fret), p)
  }
  return [...map.values()]
}

function parseCagedShapes(id: string): CagedShapeId[] {
  const shapes = id
    .split('')
    .filter((c): c is CagedShapeId => CAGED_ORDER.includes(c as CagedShapeId))
  return shapes.length ? shapes : ['E']
}

/** Cria um braço vazio (ou com partial). */
export function createEmptyBoard(partial?: Partial<StudyBoard>): StudyBoard {
  return {
    id: partial?.id ?? newId('board'),
    title: partial?.title,
    selectedNotes: partial?.selectedNotes ? [...partial.selectedNotes] : [],
    overlays: partial?.overlays ? [...partial.overlays] : undefined,
    annotations: partial?.annotations ? [...partial.annotations] : undefined,
    firstFret: partial?.firstFret,
    lastFret: partial?.lastFret,
    cagedRoot: partial?.cagedRoot,
    cagedScaleId: partial?.cagedScaleId,
    cagedShapes: partial?.cagedShapes ? [...partial.cagedShapes] : undefined,
    showAllCaged: partial?.showAllCaged,
  }
}

/** Duplica um braço com novo id (e título opcional). */
export function duplicateBoard(board: StudyBoard, title?: string): StudyBoard {
  return createEmptyBoard({
    ...board,
    id: newId('board'),
    title: title ?? (board.title ? `${board.title} (cópia)` : undefined),
    selectedNotes: [...board.selectedNotes],
    overlays: board.overlays ? [...board.overlays] : undefined,
    annotations: board.annotations ? [...board.annotations] : undefined,
    cagedShapes: board.cagedShapes ? [...board.cagedShapes] : undefined,
  })
}

/**
 * Garante `StudyBoard[]` a partir de estudo novo ou JSON legado (campos flat / lick).
 */
export function normalizeStudyBoards(study: Study): StudyBoard[] {
  if (study.boards && study.boards.length > 0) {
    return study.boards.map((b, i) =>
      createEmptyBoard({
        ...b,
        id: b.id || newId('board'),
        title: b.title?.trim() || `Braço ${i + 1}`,
        selectedNotes: b.selectedNotes ?? [],
      }),
    )
  }

  const notes = mergeUniquePositions(study.selectedNotes ?? [], study.lick?.steps ?? [])
  const ov = study.overlays?.[0]
  const board: StudyBoard = {
    id: newId('board'),
    title: 'Braço 1',
    selectedNotes: notes,
    overlays: study.overlays,
    annotations: study.annotations,
    firstFret: study.firstFret,
    lastFret: study.lastFret,
  }

  if (ov?.kind === 'caged') {
    board.cagedRoot = ov.root
    if (ov.id === 'ALL') {
      board.showAllCaged = true
      board.cagedShapes = [...CAGED_ORDER]
    } else {
      board.showAllCaged = false
      board.cagedShapes = parseCagedShapes(ov.id)
    }
  }

  return [board]
}
