/** Último traste padrão (braço mostra 0…FRET_COUNT). */
export const FRET_COUNT = 15
export const DEFAULT_FIRST_FRET = 0
export const DEFAULT_LAST_FRET = FRET_COUNT
export const MAX_LAST_FRET = 24
export const MIN_STRINGS = 6
export const MAX_STRINGS = 8

export const APP_TABS = [
  ['explorer', 'Explorar'],
  ['caged', 'CAGED / Modos'],
  ['studies', 'Estudos'],
  ['print', 'Imprimir'],
] as const

export type AppTab = (typeof APP_TABS)[number][0]

export const MODE_SCALE_IDS = [
  'ionian',
  'dorian',
  'phrygian',
  'lydian',
  'mixolydian',
  'aeolian',
  'locrian',
] as const
