import { useEffect, useMemo, useState } from 'react'
import { buildStudioMarks } from '@/app/buildMarks'
import { FRET_COUNT, MODE_SCALE_IDS, type AppTab } from '@/app/constants'
import {
  deleteStudy,
  downloadExport,
  importFromFile,
  loadStudies,
  newId,
  upsertStudy,
} from '@/storage/studies'
import {
  makeConnectionAnnotation,
  makePointAnnotation,
  samePos,
  transposeAnnotations,
} from '@/theory/annotations'
import { CAGED_ORDER, type CagedShapeId } from '@/theory/caged'
import { notesToPitchClasses, toggleNote } from '@/theory/fretboardUtils'
import { matchScalesFromPcs } from '@/theory/matcher'
import { STANDARD_TUNING, noteToPc, pcToName, type NoteName } from '@/theory/notes'
import type { ScaleDefinition } from '@/theory/scales'
import { transposeLickSteps, transposePositionsBySemitones } from '@/theory/transpose'
import type { BoardTool, FretAnnotation } from '@/types/annotation'
import {
  isAnnotationTool,
  isConnectionAnnotation,
  isPointAnnotation,
} from '@/types/annotation'
import type { LabelMode } from '@/types/fretboard'
import type { NotePos, PrintItem, Study } from '@/types/study'

type StudioLabelMode = Exclude<LabelMode, 'none'>

function shiftRoot(note: NoteName, semitones: number): NoteName {
  return pcToName(noteToPc(note) + semitones, 'sharp')
}

function isModeScaleId(id: string): boolean {
  return (MODE_SCALE_IDS as readonly string[]).includes(id)
}

export function useStudioState() {
  const tuning = STANDARD_TUNING
  const [tab, setTab] = useState<AppTab>('explorer')
  const [rootOffset, setRootOffset] = useState(0)
  const [selectedNotes, setSelectedNotes] = useState<NotePos[]>([])
  const [lickSteps, setLickSteps] = useState<NotePos[]>([])
  const [lickMode, setLickMode] = useState(false)
  const [labelMode, setLabelMode] = useState<StudioLabelMode>('note')
  /** Tônica explícita para graus/intervalos; `null` = automática (escala/CAGED). */
  const [labelTonic, setLabelTonic] = useState<NoteName | null>(null)
  const [notesText, setNotesText] = useState('')
  const [boardTool, setBoardTool] = useState<BoardTool>('select')
  const [annotations, setAnnotations] = useState<FretAnnotation[]>([])
  const [annotationFrom, setAnnotationFrom] = useState<NotePos | null>(null)

  const [overlayScaleId, setOverlayScaleId] = useState<string | null>(null)
  const [overlayRoot, setOverlayRoot] = useState<NoteName | null>(null)

  const [cagedRoot, setCagedRoot] = useState<NoteName>('C')
  const [cagedScaleId, setCagedScaleId] = useState<string | null>(null)
  const [cagedShapes, setCagedShapes] = useState<CagedShapeId[]>(['E'])
  const [showAllCaged, setShowAllCaged] = useState(false)

  const [studies, setStudies] = useState<Study[]>(() => loadStudies())
  const [activeStudyId, setActiveStudyId] = useState<string | null>(null)
  const [titleDraft, setTitleDraft] = useState('Novo estudo')

  const [printItems, setPrintItems] = useState<PrintItem[]>([])
  const [packTitle, setPackTitle] = useState('Pack de estudos')

  const pcs = useMemo(
    () => notesToPitchClasses(selectedNotes, tuning, 0),
    [selectedNotes, tuning],
  )
  const lickPcs = useMemo(
    () => notesToPitchClasses(lickSteps, tuning, 0),
    [lickSteps, tuning],
  )
  const matches = useMemo(() => {
    const source = tab === 'lick' && lickSteps.length ? lickPcs : pcs
    return matchScalesFromPcs(source)
  }, [tab, lickSteps.length, lickPcs, pcs])

  const labelRoot = useMemo((): NoteName | undefined => {
    if (labelTonic) return labelTonic
    if (tab === 'caged') return cagedRoot
    return overlayRoot ?? undefined
  }, [labelTonic, tab, cagedRoot, overlayRoot])

  const marks = useMemo(
    () =>
      buildStudioMarks({
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
      }),
    [
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
    ],
  )

  useEffect(() => {
    if (tab === 'lick') setLickMode(true)
    else if (tab === 'explorer') setLickMode(false)
  }, [tab])

  useEffect(() => {
    setAnnotationFrom(null)
  }, [boardTool])

  function handleBoardToolChange(tool: BoardTool) {
    setBoardTool(tool)
  }

  function handleToggle(string: number, fret: number) {
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

    if (lickMode || tab === 'lick') {
      setLickSteps((prev) => [...prev, pos])
      return
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
    setOverlayScaleId(scale.id)
    setOverlayRoot(note)
    setLabelTonic(note)
  }

  function clearOverlay() {
    setOverlayScaleId(null)
    setOverlayRoot(null)
  }

  function transposeBoard(semitones: number) {
    setSelectedNotes((n) => transposePositionsBySemitones(n, semitones, FRET_COUNT))
    setLickSteps((n) => transposeLickSteps(n, semitones, FRET_COUNT))
    setAnnotations((a) => transposeAnnotations(a, semitones, FRET_COUNT))
    setAnnotationFrom(null)
    setRootOffset((o) => o + semitones)
    setOverlayRoot((r) => (r ? shiftRoot(r, semitones) : r))
    setCagedRoot((r) => shiftRoot(r, semitones))
    setLabelTonic((r) => (r ? shiftRoot(r, semitones) : r))
  }

  function saveCurrent() {
    const now = new Date().toISOString()
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
      selectedNotes,
      lick: lickSteps.length ? { steps: lickSteps } : undefined,
      overlays:
        overlayScaleId && overlayRoot
          ? [
              {
                kind: isModeScaleId(overlayScaleId) ? 'mode' : 'scale',
                id: overlayScaleId,
                root: overlayRoot,
              },
            ]
          : tab === 'caged'
            ? [
                {
                  kind: 'caged',
                  id: showAllCaged ? 'ALL' : cagedShapes.join(''),
                  root: cagedRoot,
                },
              ]
            : undefined,
      notesText: notesText || undefined,
      labelMode,
      labelTonic: labelTonic ?? undefined,
      annotations: annotations.length ? annotations : undefined,
    }
    setStudies(upsertStudy(study))
    setActiveStudyId(study.id)
  }

  function loadStudy(study: Study) {
    setActiveStudyId(study.id)
    setTitleDraft(study.title)
    setRootOffset(study.rootOffset)
    setSelectedNotes(study.selectedNotes)
    setLickSteps(study.lick?.steps ?? [])
    setNotesText(study.notesText ?? '')
    setLabelMode(study.labelMode ?? 'note')
    setLabelTonic(study.labelTonic ?? study.overlays?.[0]?.root ?? null)
    setAnnotations(study.annotations ?? [])
    setAnnotationFrom(null)
    setBoardTool('select')
    const ov = study.overlays?.[0]
    if (ov?.kind === 'caged') {
      setTab('caged')
      setCagedRoot(ov.root)
      if (ov.id === 'ALL') {
        setShowAllCaged(true)
      } else {
        setShowAllCaged(false)
        setCagedShapes(
          ov.id
            .split('')
            .filter((c): c is CagedShapeId => CAGED_ORDER.includes(c as CagedShapeId)),
        )
      }
      return
    }
    if (ov) {
      setOverlayScaleId(ov.id)
      setOverlayRoot(ov.root)
      setTab('explorer')
      return
    }
    setTab(study.lick?.steps.length ? 'lick' : 'explorer')
  }

  function currentAsPrintItem(): PrintItem {
    const printRoot = labelRoot
    const shared = {
      annotations: annotations.length ? annotations : undefined,
    }
    if (tab === 'caged') {
      return {
        kind: 'caged',
        title: `${cagedRoot}${cagedScaleId ? ` ${cagedScaleId}` : ''} · CAGED ${showAllCaged ? 'ALL' : cagedShapes.join('')}`,
        root: printRoot ?? cagedRoot,
        scaleId: cagedScaleId ?? undefined,
        cagedShape: showAllCaged ? undefined : cagedShapes[0],
        selectedNotes,
        labelMode,
        rootOffset,
        notesText: notesText || undefined,
        ...shared,
      }
    }
    return {
      kind: lickSteps.length ? 'lick' : overlayScaleId ? 'scale' : 'custom',
      title: titleDraft || 'Vista atual',
      root: printRoot,
      scaleId: overlayScaleId ?? undefined,
      selectedNotes,
      lick: lickSteps.length ? { steps: lickSteps } : undefined,
      labelMode,
      rootOffset,
      notesText: notesText || undefined,
      ...shared,
    }
  }

  function studyToPrintItem(study: Study): PrintItem {
    return {
      kind: 'study',
      refId: study.id,
      title: study.title,
      root: study.labelTonic ?? study.overlays?.[0]?.root,
      scaleId: study.overlays?.[0]?.id,
      selectedNotes: study.selectedNotes,
      lick: study.lick,
      labelMode: study.labelMode ?? 'note',
      rootOffset: study.rootOffset,
      notesText: study.notesText,
      annotations: study.annotations,
    }
  }

  return {
    tuning,
    tab,
    setTab,
    rootOffset,
    setRootOffset,
    selectedNotes,
    setSelectedNotes,
    lickSteps,
    setLickSteps,
    lickMode,
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
    setCagedShapes,
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
