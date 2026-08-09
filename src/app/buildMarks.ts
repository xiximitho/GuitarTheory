import {
  buildCagedMarks,
  buildScaleMarks,
  buildSelectedMarks,
  mergeMarks,
} from '@/theory/fretboardUtils'
import {
  CAGED_ORDER,
  cagedForScale,
  cagedShapeForRoot,
  type CagedShapeId,
} from '@/theory/caged'
import type { NoteName } from '@/theory/notes'
import type { FretMark } from '@/types/fretboard'
import type { NotePos } from '@/types/study'
import { DEFAULT_LAST_FRET, type AppTab } from './constants'

type BuildMarksInput = {
  tab: AppTab
  tuning: NoteName[]
  showAllCaged: boolean
  cagedShapes: CagedShapeId[]
  cagedRoot: NoteName
  /** `null` = shape CAGED puro, sem filtrar por escala. */
  cagedScaleId: string | null
  overlayScaleId: string | null
  overlayRoot: NoteName | null
  selectedNotes: NotePos[]
  firstFret?: number
  lastFret?: number
}

export function buildStudioMarks(input: BuildMarksInput): FretMark[] {
  const {
    tab,
    tuning,
    showAllCaged,
    cagedShapes,
    cagedRoot,
    cagedScaleId,
    overlayScaleId,
    overlayRoot,
    selectedNotes,
    firstFret = 0,
    lastFret = DEFAULT_LAST_FRET,
  } = input

  if (tab === 'caged') {
    const shapes = showAllCaged ? CAGED_ORDER : cagedShapes
    const groups = shapes.map((shape) =>
      buildCagedMarks(
        cagedScaleId
          ? cagedForScale(shape, cagedRoot, cagedScaleId, tuning, 0, lastFret)
          : cagedShapeForRoot(shape, cagedRoot, tuning, lastFret),
      ),
    )
    return mergeMarks(...groups).filter((m) => m.fret >= firstFret && m.fret <= lastFret)
  }

  const groups: FretMark[][] = []

  if (overlayScaleId && overlayRoot) {
    groups.push(
      buildScaleMarks(tuning, overlayRoot, overlayScaleId, lastFret, 0, firstFret),
    )
  }
  if (selectedNotes.length) {
    groups.push(buildSelectedMarks(selectedNotes))
  }

  return mergeMarks(...groups).filter(
    (m) => m.fret >= firstFret && m.fret <= lastFret && m.string < tuning.length,
  )
}
