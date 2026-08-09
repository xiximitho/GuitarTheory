import type { CagedShapeId } from '@/theory/caged'
import type { NoteName } from '@/theory/notes'
import type { FretAnnotation } from '@/types/annotation'

export type NotePos = {
  string: number
  fret: number
}

export type OverlayKind = 'scale' | 'caged' | 'mode'

export type StudyOverlay = {
  kind: OverlayKind
  id: string
  root: NoteName
}

/** @deprecated Sequência numerada removida; mantido só para import de JSON antigo. */
export type Lick = {
  steps: NotePos[]
}

/** Um braço dentro de um estudo (notas/overlay/anotações independentes). */
export type StudyBoard = {
  id: string
  title?: string
  selectedNotes: NotePos[]
  overlays?: StudyOverlay[]
  annotations?: FretAnnotation[]
  firstFret?: number
  lastFret?: number
  cagedRoot?: NoteName
  cagedScaleId?: string | null
  cagedShapes?: CagedShapeId[]
  showAllCaged?: boolean
}

/**
 * Local study document. `userId` reserved for future auth/sync.
 * Preferir `boards[]`; campos flat são legado de migração.
 */
export type Study = {
  id: string
  title: string
  createdAt: string
  updatedAt: string
  /** Reserved for future cloud sync — unused in MVP */
  userId?: string | null
  tuning: NoteName[]
  rootOffset: number
  /** Braços do estudo (1+). */
  boards?: StudyBoard[]
  /** @deprecated Use `boards[0].selectedNotes` — mantido para JSON antigo. */
  selectedNotes?: NotePos[]
  /** @deprecated Import legado — ao normalizar, vira notas do board. */
  lick?: Lick
  /** @deprecated Use `boards[0].overlays`. */
  overlays?: StudyOverlay[]
  notesText?: string
  labelMode?: 'note' | 'degree' | 'interval'
  /** Tônica para labels de grau/intervalo; se ausente, usa root do overlay. */
  labelTonic?: NoteName
  /** @deprecated Use `boards[0].annotations`. */
  annotations?: FretAnnotation[]
  /** Espelha o braço para canhotos. */
  leftHanded?: boolean
  /** @deprecated Use `boards[0].firstFret`. */
  firstFret?: number
  /** @deprecated Use `boards[0].lastFret`. */
  lastFret?: number
}

export type PrintItemKind = 'study' | 'scale' | 'caged' | 'custom'

export type PrintItem = {
  kind: PrintItemKind
  refId?: string
  title: string
  root?: NoteName
  scaleId?: string
  cagedShape?: string
  selectedNotes?: NotePos[]
  /** @deprecated Import legado — tratado como notas marcadas. */
  lick?: Lick
  overlays?: StudyOverlay[]
  labelMode: 'note' | 'degree' | 'interval'
  rootOffset?: number
  notesText?: string
  annotations?: FretAnnotation[]
}

export type PrintPack = {
  id: string
  title: string
  createdAt: string
  updatedAt: string
  items: PrintItem[]
}

/** Future auth user — not used for login yet */
export type User = {
  id: string
  email: string
  displayName?: string
}

export type StudiesExport = {
  version: 1
  exportedAt: string
  studies: Study[]
  printPacks?: PrintPack[]
}
