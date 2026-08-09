import { useEffect, useMemo, useRef, useState } from 'react'
import { buildStudioMarks } from '@/app/buildMarks'
import {
  DEFAULT_FIRST_FRET,
  DEFAULT_LAST_FRET,
  MAX_LAST_FRET,
  MAX_STRINGS,
  MIN_STRINGS,
  MODE_SCALE_IDS,
  type AppTab,
} from '@/app/constants'
import {
  deleteStudy,
  downloadExport,
  importFromFile,
  loadStudies,
  newId,
  upsertStudy,
} from '@/storage/studies'
import {
  createEmptyBoard,
  duplicateBoard,
  normalizeStudyBoards,
} from '@/storage/studyBoards'
import {
  makeConnectionAnnotation,
  makePointAnnotation,
  samePos,
  transposeAnnotations,
} from '@/theory/annotations'
import type { CagedShapeId } from '@/theory/caged'
import {
  clipPositionsToBoard,
  notesToPitchClasses,
  toggleNote,
} from '@/theory/fretboardUtils'
import { matchScalesFromPcs } from '@/theory/matcher'
import {
  STANDARD_TUNING,
  noteToPc,
  pcToName,
  resizeTuning,
  type NoteName,
} from '@/theory/notes'
import type { ScaleDefinition } from '@/theory/scales'
import { transposePositionsBySemitones } from '@/theory/transpose'
import type { BoardTool, FretAnnotation } from '@/types/annotation'
import {
  isAnnotationTool,
  isConnectionAnnotation,
  isPointAnnotation,
} from '@/types/annotation'
import type { FretMark, LabelMode } from '@/types/fretboard'
import type { NotePos, PrintItem, Study, StudyBoard } from '@/types/study'

type StudioLabelMode = Exclude<LabelMode, 'none'>

export type BoardView = {
  board: StudyBoard
  marks: FretMark[]
}

function shiftRoot(note: NoteName, semitones: number): NoteName {
  return pcToName(noteToPc(note) + semitones, 'sharp')
}

function isModeScaleId(id: string): boolean {
  return (MODE_SCALE_IDS as readonly string[]).includes(id)
}

function clipAnnotations(
  annotations: FretAnnotation[],
  stringCount: number,
  lastFret: number,
): FretAnnotation[] {
  return annotations.filter((ann) => {
    const fromOk =
      ann.from.string >= 0 &&
      ann.from.string < stringCount &&
      ann.from.fret >= 0 &&
      ann.from.fret <= lastFret
    if (!fromOk) return false
    if (!ann.to) return true
    return (
      ann.to.string >= 0 &&
      ann.to.string < stringCount &&
      ann.to.fret >= 0 &&
      ann.to.fret <= lastFret
    )
  })
}

function boardFirstFret(board: StudyBoard): number {
  return board.firstFret ?? DEFAULT_FIRST_FRET
}

function boardLastFret(board: StudyBoard): number {
  return board.lastFret ?? DEFAULT_LAST_FRET
}

function scaleOverlayOf(board: StudyBoard): {
  scaleId: string | null
  root: NoteName | null
} {
  const ov = board.overlays?.[0]
  if (!ov || ov.kind === 'caged') return { scaleId: null, root: null }
  return { scaleId: ov.id, root: ov.root }
}

function marksForBoard(board: StudyBoard, tab: AppTab, tuning: NoteName[]): FretMark[] {
  const { scaleId, root } = scaleOverlayOf(board)
  return buildStudioMarks({
    tab,
    tuning,
    showAllCaged: board.showAllCaged ?? false,
    cagedShapes: board.cagedShapes?.length ? board.cagedShapes : ['E'],
    cagedRoot: board.cagedRoot ?? 'C',
    cagedScaleId: board.cagedScaleId ?? null,
    overlayScaleId: scaleId,
    overlayRoot: root,
    selectedNotes: board.selectedNotes,
    firstFret: boardFirstFret(board),
    lastFret: boardLastFret(board),
  })
}

export function useStudioState() {
  const seedBoardRef = useRef<StudyBoard | null>(null)
  if (!seedBoardRef.current) {
    seedBoardRef.current = createEmptyBoard({ title: 'Braço 1' })
  }
  const [tuning, setTuningState] = useState<NoteName[]>(() => [...STANDARD_TUNING])
  const [leftHanded, setLeftHanded] = useState(false)
  const [boards, setBoards] = useState<StudyBoard[]>([seedBoardRef.current])
  const [activeBoardId, setActiveBoardId] = useState(seedBoardRef.current.id)
  const [tab, setTab] = useState<AppTab>('explorer')
  const [rootOffset, setRootOffset] = useState(0)
  const [labelMode, setLabelMode] = useState<StudioLabelMode>('note')
  const [labelTonic, setLabelTonic] = useState<NoteName | null>(null)
  const [notesText, setNotesText] = useState('')
  const [boardTool, setBoardTool] = useState<BoardTool>('select')
  const [annotationFrom, setAnnotationFrom] = useState<NotePos | null>(null)

  const [studies, setStudies] = useState<Study[]>(() => loadStudies())
  const [activeStudyId, setActiveStudyId] = useState<string | null>(null)
  const [titleDraft, setTitleDraft] = useState('Novo estudo')

  const [printItems, setPrintItems] = useState<PrintItem[]>([])
  const [packTitle, setPackTitle] = useState('Pack de estudos')

  const activeBoard =
    boards.find((b) => b.id === activeBoardId) ?? boards[0] ?? seedBoardRef.current!

  const selectedNotes = activeBoard.selectedNotes
  const annotations = activeBoard.annotations ?? []
  const firstFret = boardFirstFret(activeBoard)
  const lastFret = boardLastFret(activeBoard)
  const { scaleId: overlayScaleId, root: overlayRoot } = scaleOverlayOf(activeBoard)
  const cagedRoot = activeBoard.cagedRoot ?? 'C'
  const cagedScaleId = activeBoard.cagedScaleId ?? null
  const cagedShapes: CagedShapeId[] = activeBoard.cagedShapes?.length
    ? activeBoard.cagedShapes
    : ['E']
  const showAllCaged = activeBoard.showAllCaged ?? false

  const pcs = useMemo(
    () => notesToPitchClasses(selectedNotes, tuning, 0),
    [selectedNotes, tuning],
  )
  const matches = useMemo(() => matchScalesFromPcs(pcs), [pcs])

  const labelRoot = useMemo((): NoteName | undefined => {
    if (labelTonic) return labelTonic
    if (tab === 'caged') return cagedRoot
    return overlayRoot ?? undefined
  }, [labelTonic, tab, cagedRoot, overlayRoot])

  const boardViews: BoardView[] = useMemo(
    () =>
      boards.map((board) => ({
        board,
        marks: marksForBoard(board, tab, tuning),
      })),
    [boards, tab, tuning],
  )

  const marks = useMemo(
    () => boardViews.find((v) => v.board.id === activeBoard.id)?.marks ?? [],
    [boardViews, activeBoard.id],
  )

  useEffect(() => {
    setAnnotationFrom(null)
  }, [boardTool, activeBoardId])

  function updateActiveBoard(updater: (board: StudyBoard) => StudyBoard) {
    setBoards((prev) => prev.map((b) => (b.id === activeBoardId ? updater(b) : b)))
  }

  function patchActiveBoard(patch: Partial<StudyBoard>) {
    updateActiveBoard((b) => ({ ...b, ...patch }))
  }

  function setSelectedNotes(notes: NotePos[] | ((prev: NotePos[]) => NotePos[])) {
    updateActiveBoard((b) => ({
      ...b,
      selectedNotes: typeof notes === 'function' ? notes(b.selectedNotes) : notes,
    }))
  }

  function setAnnotations(
    next: FretAnnotation[] | ((prev: FretAnnotation[]) => FretAnnotation[]),
  ) {
    updateActiveBoard((b) => ({
      ...b,
      annotations: typeof next === 'function' ? next(b.annotations ?? []) : next,
    }))
  }

  function applyClipAllBoards(nextTuning: NoteName[], nextLast: number) {
    const strings = nextTuning.length
    setBoards((prev) =>
      prev.map((b) => {
        const last = Math.min(boardLastFret(b), nextLast)
        return {
          ...b,
          lastFret: b.lastFret != null ? last : undefined,
          selectedNotes: clipPositionsToBoard(b.selectedNotes, strings, last),
          annotations: clipAnnotations(b.annotations ?? [], strings, last),
        }
      }),
    )
    setAnnotationFrom(null)
  }

  function handleTuningChange(next: NoteName[]) {
    setTuningState(next)
    applyClipAllBoards(next, MAX_LAST_FRET)
  }

  function handleStringCount(count: number) {
    const c = Math.min(MAX_STRINGS, Math.max(MIN_STRINGS, count))
    handleTuningChange(resizeTuning(tuning, c))
  }

  function handleStringNote(index: number, note: NoteName) {
    const next = [...tuning]
    next[index] = note
    handleTuningChange(next)
  }

  function handleFirstFret(value: number) {
    const v = Math.max(0, Math.min(value, lastFret))
    patchActiveBoard({ firstFret: v === DEFAULT_FIRST_FRET ? undefined : v })
  }

  function handleLastFret(value: number) {
    const v = Math.max(firstFret, Math.min(value, MAX_LAST_FRET))
    patchActiveBoard({
      lastFret: v === DEFAULT_LAST_FRET ? undefined : v,
      selectedNotes: clipPositionsToBoard(selectedNotes, tuning.length, v),
      annotations: clipAnnotations(annotations, tuning.length, v),
    })
    setAnnotationFrom(null)
  }

  function handleBoardToolChange(tool: BoardTool) {
    setBoardTool(tool)
  }

  function handleToggle(string: number, fret: number) {
    if (fret < firstFret || fret > lastFret) return
    if (string < 0 || string >= tuning.length) return
    const pos = { string, fret }

    if (isAnnotationTool(boardTool)) {
      if (isPointAnnotation(boardTool)) {
        const ann = makePointAnnotation(boardTool, pos)
        if (ann) setAnnotations((prev) => [...prev, ann])
        return
      }
      if (isConnectionAnnotation(boardTool)) {
        if (!annotationFrom) {
          setAnnotationFrom(pos)
          return
        }
        if (samePos(annotationFrom, pos)) {
          setAnnotationFrom(null)
          return
        }
        const ann = makeConnectionAnnotation(boardTool, annotationFrom, pos)
        if (ann) setAnnotations((prev) => [...prev, ann])
        setAnnotationFrom(null)
        return
      }
    }

    setSelectedNotes((prev) => toggleNote(prev, string, fret))
  }

  function undoAnnotation() {
    setAnnotations((prev) => prev.slice(0, -1))
    setAnnotationFrom(null)
  }

  function clearAnnotations() {
    setAnnotations([])
    setAnnotationFrom(null)
  }

  function cancelAnnotationFrom() {
    setAnnotationFrom(null)
  }

  function handleSelectMatch(scale: ScaleDefinition, root: string) {
    const note = root as NoteName
    patchActiveBoard({
      overlays: [
        {
          kind: isModeScaleId(scale.id) ? 'mode' : 'scale',
          id: scale.id,
          root: note,
        },
      ],
    })
    setLabelTonic(note)
  }

  function clearOverlay() {
    patchActiveBoard({ overlays: undefined })
    setLabelTonic(null)
  }

  function setCagedRoot(root: NoteName) {
    patchActiveBoard({ cagedRoot: root })
  }

  function setCagedScaleId(scaleId: string | null) {
    patchActiveBoard({ cagedScaleId: scaleId })
  }

  function setShowAllCaged(all: boolean) {
    patchActiveBoard({ showAllCaged: all })
  }

  function toggleCagedShape(shape: CagedShapeId) {
    updateActiveBoard((b) => {
      const current = b.cagedShapes?.length ? b.cagedShapes : (['E'] as CagedShapeId[])
      const next = current.includes(shape)
        ? current.length <= 1
          ? current
          : current.filter((item) => item !== shape)
        : [...current, shape]
      return { ...b, showAllCaged: false, cagedShapes: next }
    })
  }

  function transposeBoard(semitones: number) {
    updateActiveBoard((b) => {
      const max = boardLastFret(b)
      const nextRoot = b.cagedRoot ? shiftRoot(b.cagedRoot, semitones) : b.cagedRoot
      const overlays = b.overlays?.map((ov) => ({
        ...ov,
        root: shiftRoot(ov.root, semitones),
      }))
      return {
        ...b,
        selectedNotes: transposePositionsBySemitones(b.selectedNotes, semitones, max),
        annotations: transposeAnnotations(b.annotations ?? [], semitones, max),
        cagedRoot: nextRoot,
        overlays,
      }
    })
    setAnnotationFrom(null)
    setRootOffset((o) => o + semitones)
    setLabelTonic((r) => (r ? shiftRoot(r, semitones) : r))
  }

  function addBoard() {
    const board = createEmptyBoard({
      title: `Braço ${boards.length + 1}`,
      firstFret: activeBoard.firstFret,
      lastFret: activeBoard.lastFret,
    })
    setBoards((prev) => [...prev, board])
    setActiveBoardId(board.id)
  }

  function duplicateActiveBoard() {
    const copy = duplicateBoard(activeBoard)
    setBoards((prev) => {
      const idx = prev.findIndex((b) => b.id === activeBoard.id)
      const next = [...prev]
      next.splice(idx + 1, 0, copy)
      return next
    })
    setActiveBoardId(copy.id)
  }

  function removeActiveBoard() {
    if (boards.length <= 1) return
    const idx = boards.findIndex((b) => b.id === activeBoardId)
    const next = boards.filter((b) => b.id !== activeBoardId)
    setBoards(next)
    const fallback = next[Math.max(0, idx - 1)] ?? next[0]!
    setActiveBoardId(fallback.id)
  }

  function renameBoard(id: string, title: string) {
    setBoards((prev) =>
      prev.map((b) => (b.id === id ? { ...b, title: title.trim() || undefined } : b)),
    )
  }

  function setActiveBoard(id: string) {
    if (boards.some((b) => b.id === id)) setActiveBoardId(id)
  }

  function saveCurrent() {
    const now = new Date().toISOString()
    const normalizedBoards = boards.map((b, i) =>
      createEmptyBoard({
        ...b,
        title: b.title?.trim() || `Braço ${i + 1}`,
      }),
    )
    const first = normalizedBoards[0]!
    const study: Study = {
      id: activeStudyId ?? newId('study'),
      title: titleDraft.trim() || 'Estudo sem título',
      createdAt:
        activeStudyId != null
          ? (studies.find((s) => s.id === activeStudyId)?.createdAt ?? now)
          : now,
      updatedAt: now,
      userId: null,
      tuning: [...tuning],
      rootOffset,
      boards: normalizedBoards,
      // espelho legado do 1º braço (compat JSON antigo)
      selectedNotes: first.selectedNotes,
      overlays: first.overlays,
      annotations: first.annotations,
      firstFret: first.firstFret,
      lastFret: first.lastFret,
      notesText: notesText || undefined,
      labelMode,
      labelTonic: labelTonic ?? undefined,
      leftHanded: leftHanded || undefined,
    }
    setStudies(upsertStudy(study))
    setActiveStudyId(study.id)
  }

  function loadStudy(study: Study) {
    setActiveStudyId(study.id)
    setTitleDraft(study.title)
    setRootOffset(study.rootOffset)
    const nextTuning =
      study.tuning?.length >= MIN_STRINGS ? [...study.tuning] : [...STANDARD_TUNING]
    setTuningState(nextTuning)
    setLeftHanded(Boolean(study.leftHanded))
    setNotesText(study.notesText ?? '')
    setLabelMode(study.labelMode ?? 'note')
    setLabelTonic(study.labelTonic ?? null)
    setAnnotationFrom(null)
    setBoardTool('select')

    const nextBoards = normalizeStudyBoards(study).map((b) => {
      const last = b.lastFret ?? DEFAULT_LAST_FRET
      return {
        ...b,
        selectedNotes: clipPositionsToBoard(b.selectedNotes, nextTuning.length, last),
        annotations: clipAnnotations(b.annotations ?? [], nextTuning.length, last),
      }
    })
    setBoards(nextBoards)
    setActiveBoardId(nextBoards[0]!.id)

    const first = nextBoards[0]!
    const ov = first.overlays?.[0]
    if (ov?.kind === 'caged' || first.cagedShapes?.length || first.showAllCaged) {
      setTab('caged')
      if (!first.cagedRoot && ov?.kind === 'caged') {
        // already set via normalize
      }
      return
    }
    setTab('explorer')
    if (!study.labelTonic && ov) {
      setLabelTonic(ov.root)
    }
  }

  function printItemFromBoard(board: StudyBoard, studyTitle: string): PrintItem {
    const { scaleId, root } = scaleOverlayOf(board)
    const label = board.title?.trim() || studyTitle
    if (tab === 'caged' || board.showAllCaged || board.cagedShapes?.length) {
      const shapes = board.showAllCaged ? 'ALL' : (board.cagedShapes ?? ['E']).join('')
      return {
        kind: 'caged',
        title: `${board.cagedRoot ?? 'C'}${board.cagedScaleId ? ` ${board.cagedScaleId}` : ''} · CAGED ${shapes}${board.title ? ` · ${board.title}` : ''}`,
        root: board.cagedRoot ?? root ?? undefined,
        scaleId: board.cagedScaleId ?? undefined,
        cagedShape: board.showAllCaged ? undefined : (board.cagedShapes?.[0] ?? 'E'),
        selectedNotes: board.selectedNotes,
        labelMode,
        rootOffset,
        notesText: notesText || undefined,
        annotations: board.annotations,
      }
    }
    return {
      kind: scaleId ? 'scale' : 'custom',
      title: label,
      root: root ?? labelTonic ?? undefined,
      scaleId: scaleId ?? undefined,
      selectedNotes: board.selectedNotes,
      labelMode,
      rootOffset,
      notesText: notesText || undefined,
      annotations: board.annotations,
    }
  }

  function currentAsPrintItem(): PrintItem {
    return printItemFromBoard(activeBoard, titleDraft || 'Vista atual')
  }

  function studyToPrintItems(study: Study): PrintItem[] {
    const boardsOfStudy = normalizeStudyBoards(study)
    return boardsOfStudy.map((board) => {
      const { scaleId, root } = scaleOverlayOf(board)
      const isCaged =
        board.overlays?.[0]?.kind === 'caged' ||
        Boolean(board.cagedShapes?.length) ||
        Boolean(board.showAllCaged)
      const boardTitle = board.title?.trim()
      const title = boardTitle
        ? `${study.title} · ${boardTitle}`
        : boardsOfStudy.length > 1
          ? `${study.title} · ${board.id.slice(-4)}`
          : study.title

      if (isCaged) {
        return {
          kind: 'caged' as const,
          refId: study.id,
          title,
          root: board.cagedRoot ?? board.overlays?.[0]?.root ?? study.labelTonic,
          scaleId: board.cagedScaleId ?? undefined,
          cagedShape: board.showAllCaged ? undefined : (board.cagedShapes?.[0] ?? 'E'),
          selectedNotes: board.selectedNotes,
          labelMode: study.labelMode ?? 'note',
          rootOffset: study.rootOffset,
          notesText: study.notesText,
          annotations: board.annotations,
          overlays: board.overlays,
        }
      }

      return {
        kind: 'study' as const,
        refId: study.id,
        title,
        root: study.labelTonic ?? root ?? undefined,
        scaleId: scaleId ?? undefined,
        selectedNotes: board.selectedNotes,
        labelMode: study.labelMode ?? 'note',
        rootOffset: study.rootOffset,
        notesText: study.notesText,
        annotations: board.annotations,
        overlays: board.overlays,
      }
    })
  }

  /** Compat: um único item (1º braço) — preferir studyToPrintItems. */
  function studyToPrintItem(study: Study): PrintItem {
    return studyToPrintItems(study)[0]!
  }

  return {
    tuning,
    setTuning: handleTuningChange,
    handleStringCount,
    handleStringNote,
    leftHanded,
    setLeftHanded,
    boards,
    boardViews,
    activeBoardId,
    activeBoard,
    setActiveBoard,
    addBoard,
    duplicateActiveBoard,
    removeActiveBoard,
    renameBoard,
    firstFret,
    setFirstFret: handleFirstFret,
    lastFret,
    setLastFret: handleLastFret,
    tab,
    setTab,
    rootOffset,
    setRootOffset,
    selectedNotes,
    setSelectedNotes,
    labelMode,
    setLabelMode,
    labelTonic,
    setLabelTonic,
    labelRoot,
    notesText,
    setNotesText,
    boardTool,
    setBoardTool: handleBoardToolChange,
    annotations,
    annotationFrom,
    undoAnnotation,
    clearAnnotations,
    cancelAnnotationFrom,
    overlayScaleId,
    overlayRoot,
    cagedRoot,
    setCagedRoot,
    cagedScaleId,
    setCagedScaleId,
    cagedShapes,
    setCagedShapes: (shapes: CagedShapeId[]) => patchActiveBoard({ cagedShapes: shapes }),
    toggleCagedShape,
    showAllCaged,
    setShowAllCaged,
    studies,
    setStudies,
    activeStudyId,
    setActiveStudyId,
    titleDraft,
    setTitleDraft,
    printItems,
    setPrintItems,
    packTitle,
    setPackTitle,
    matches,
    marks,
    handleToggle,
    handleSelectMatch,
    clearOverlay,
    transposeBoard,
    saveCurrent,
    loadStudy,
    currentAsPrintItem,
    studyToPrintItem,
    studyToPrintItems,
    exportStudies: downloadExport,
    importStudies: async (file: File) => {
      await importFromFile(file, 'merge')
      setStudies(loadStudies())
    },
    removeStudy: (id: string) => {
      setStudies(deleteStudy(id))
      if (activeStudyId === id) setActiveStudyId(null)
    },
  }
}

export type StudioState = ReturnType<typeof useStudioState>
