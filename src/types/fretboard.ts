export type FretMarkKind = 'selected' | 'scale' | 'root' | 'lick' | 'caged'

export type FretMark = {
  string: number
  fret: number
  kind?: FretMarkKind
  label?: string
  order?: number
  dimmed?: boolean
}

export type LabelMode = 'note' | 'degree' | 'none'
