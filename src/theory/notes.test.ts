import { describe, expect, it } from 'vitest'
import { formatScaleFormula, intervalLabel, noteToPc, scaleFormulaLabels } from './notes'
import { getScaleById } from './scales'

describe('intervalLabel', () => {
  it('labels qualities from a root', () => {
    const root = noteToPc('C')
    expect(intervalLabel(root, noteToPc('C'))).toBe('1')
    expect(intervalLabel(root, noteToPc('Eb'))).toBe('3m')
    expect(intervalLabel(root, noteToPc('E'))).toBe('3M')
    expect(intervalLabel(root, noteToPc('F#'))).toBe('TT')
    expect(intervalLabel(root, noteToPc('Bb'))).toBe('7m')
  })
})

describe('formatScaleFormula', () => {
  it('formats dorian with natural sixth', () => {
    const dorian = getScaleById('dorian')!
    expect(formatScaleFormula(dorian.intervals)).toBe('1 2 b3 4 5 6 b7')
  })

  it('uses b5 for blues / locrian (no perfect fifth collision)', () => {
    const blues = getScaleById('blues')!
    expect(scaleFormulaLabels(blues.intervals)).toEqual(['1', 'b3', '4', 'b5', '5', 'b7'])

    const locrian = getScaleById('locrian')!
    expect(formatScaleFormula(locrian.intervals)).toBe('1 b2 b3 4 b5 b6 b7')
  })

  it('keeps #4 for lydian (has perfect fifth)', () => {
    const lydian = getScaleById('lydian')!
    expect(formatScaleFormula(lydian.intervals)).toBe('1 2 3 #4 5 6 7')
  })
})
