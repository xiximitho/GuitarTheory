import type { NotePos } from '@/types/study'

/** Técnicas / traços desenhados sobre o braço. */
export type AnnotationKind =
  'line' | 'arrow' | 'slide' | 'hammer-on' | 'pull-off' | 'vibrato' | 'harmonic'

export type FretAnnotation = {
  id: string
  kind: AnnotationKind
  from: NotePos
  /** Presente em traços entre duas casas (linha, seta, slide, HO, PO). */
  to?: NotePos
}

export type BoardTool = 'select' | AnnotationKind

export const POINT_ANNOTATIONS: ReadonlySet<AnnotationKind> = new Set([
  'vibrato',
  'harmonic',
])

export const CONNECTION_ANNOTATIONS: ReadonlySet<AnnotationKind> = new Set([
  'line',
  'arrow',
  'slide',
  'hammer-on',
  'pull-off',
])

export const BOARD_TOOLS: ReadonlyArray<{ id: BoardTool; label: string; title: string }> =
  [
    { id: 'select', label: 'Marcar', title: 'Marcar / desmarcar notas no braço' },
    { id: 'line', label: 'Linha', title: 'Linha entre duas casas' },
    { id: 'arrow', label: 'Seta', title: 'Linha com seta' },
    { id: 'slide', label: 'Slide', title: 'Slide entre duas casas' },
    { id: 'hammer-on', label: 'HO', title: 'Hammer-on' },
    { id: 'pull-off', label: 'PO', title: 'Pull-off' },
    { id: 'vibrato', label: '~', title: 'Vibrato' },
    { id: 'harmonic', label: '◇', title: 'Harmônico' },
  ]

export function isAnnotationTool(tool: BoardTool): tool is AnnotationKind {
  return tool !== 'select'
}

export function isPointAnnotation(kind: AnnotationKind): boolean {
  return POINT_ANNOTATIONS.has(kind)
}

export function isConnectionAnnotation(kind: AnnotationKind): boolean {
  return CONNECTION_ANNOTATIONS.has(kind)
}
