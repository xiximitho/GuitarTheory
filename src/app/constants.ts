export const FRET_COUNT = 15

export const APP_TABS = [
  ['explorer', 'Explorar'],
  ['caged', 'CAGED / Modos'],
  ['lick', 'Licks'],
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
