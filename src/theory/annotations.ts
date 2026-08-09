import type { AnnotationKind, FretAnnotation } from '@/types/annotation'
import { isConnectionAnnotation, isPointAnnotation } from '@/types/annotation'
import type { NotePos } from '@/types/study'
import { transposePositionsBySemitones } from './transpose'

export function createAnnotationId(): string {
  return `ann-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`
}

export function samePos(a: NotePos, b: NotePos): boolean {
  return a.string === b.string && a.fret === b.fret
}

export function makePointAnnotation(
  kind: AnnotationKind,
  pos: NotePos,
): FretAnnotation | null {
  if (!isPointAnnotation(kind)) return null
  return { id: createAnnotationId(), kind, from: { ...pos } }
}

export function makeConnectionAnnotation(
  kind: AnnotationKind,
  from: NotePos,
  to: NotePos,
): FretAnnotation | null {
  if (!isConnectionAnnotation(kind)) return null
  if (samePos(from, to)) return null
  return {
    id: createAnnotationId(),
    kind,
    from: { ...from },
    to: { ...to },
  }
}

export function transposeAnnotations(
  annotations: FretAnnotation[],
  semitones: number,
  maxFret = 22,
): FretAnnotation[] {
  const next: FretAnnotation[] = []
  for (const ann of annotations) {
    const [from] = transposePositionsBySemitones([ann.from], semitones, maxFret)
    if (!from) continue
    if (ann.to) {
      const [to] = transposePositionsBySemitones([ann.to], semitones, maxFret)
      if (!to) continue
      next.push({ ...ann, from, to })
    } else {
      next.push({ ...ann, from })
    }
  }
  return next
}
