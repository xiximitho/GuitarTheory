export type FretMarkKind = 'selected' | 'scale' | 'root' | 'caged'

export type FretMark = {
  string: number
  fret: number
  kind?: FretMarkKind
  label?: string
  dimmed?: boolean
}

export type LabelMode = 'note' | 'degree' | 'interval' | 'none'
