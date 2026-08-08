import type { NoteName } from '@/theory/notes'

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

export type Lick = {
  steps: NotePos[]
}

/**
 * Local study document. `userId` reserved for future auth/sync.
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
  selectedNotes: NotePos[]
  lick?: Lick
  overlays?: StudyOverlay[]
  notesText?: string
  labelMode?: 'note' | 'degree' | 'interval'
  /** Tônica para labels de grau/intervalo; se ausente, usa root do overlay. */
  labelTonic?: NoteName
}

export type PrintItemKind = 'study' | 'scale' | 'caged' | 'lick' | 'custom'

export type PrintItem = {
  kind: PrintItemKind
  refId?: string
  title: string
  root?: NoteName
  scaleId?: string
  cagedShape?: string
  selectedNotes?: NotePos[]
  lick?: Lick
  overlays?: StudyOverlay[]
  labelMode: 'note' | 'degree' | 'interval'
  rootOffset?: number
  notesText?: string
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
