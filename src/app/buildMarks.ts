import {
  buildCagedMarks,
  buildLickMarks,
  buildScaleMarks,
  buildSelectedMarks,
  mergeMarks,
} from '@/theory/fretboardUtils'
import { CAGED_ORDER, cagedForScale, type CagedShapeId } from '@/theory/caged'
import type { NoteName } from '@/theory/notes'
import type { FretMark } from '@/types/fretboard'
import type { NotePos } from '@/types/study'
import { FRET_COUNT, type AppTab } from './constants'

type BuildMarksInput = {
  tab: AppTab
  tuning: NoteName[]
  showAllCaged: boolean
  cagedShapes: CagedShapeId[]
  cagedRoot: NoteName
  cagedScaleId: string
  overlayScaleId: string | null
  overlayRoot: NoteName | null
  lickSteps: NotePos[]
  selectedNotes: NotePos[]
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
    lickSteps,
    selectedNotes,
  } = input

  if (tab === 'caged') {
    const shapes = showAllCaged ? CAGED_ORDER : cagedShapes
    const groups = shapes.map((shape) =>
      buildCagedMarks(
        cagedForScale(shape, cagedRoot, cagedScaleId, tuning, 0, FRET_COUNT),
      ),
    )
    return mergeMarks(...groups)
  }

  const groups: FretMark[][] = []

  if (overlayScaleId && overlayRoot) {
    groups.push(buildScaleMarks(tuning, overlayRoot, overlayScaleId, FRET_COUNT, 0))
  }
  if (tab === 'lick' || lickSteps.length > 0) {
    groups.push(buildLickMarks(lickSteps))
  }
  if (selectedNotes.length) {
    groups.push(buildSelectedMarks(selectedNotes))
  }

  return mergeMarks(...groups)
}
