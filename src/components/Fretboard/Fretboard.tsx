import {
  degreeLabel,
  fretNotePc,
  intervalLabel,
  pcToName,
  type AccidentalPreference,
  type NoteName,
} from '@/theory/notes'
import type { FretAnnotation } from '@/types/annotation'
import type { FretMark, LabelMode } from '@/types/fretboard'
import type { NotePos } from '@/types/study'
import { FretboardAnnotations } from './FretboardAnnotations'
import './Fretboard.css'

export type { FretMark, LabelMode }

type Props = {
  tuning: NoteName[]
  /** @deprecated Use lastFret — mantido para callers antigos. */
  fretCount?: number
  firstFret?: number
  lastFret?: number
  rootOffset?: number
  marks?: FretMark[]
  annotations?: FretAnnotation[]
  pendingFrom?: NotePos | null
  interactive?: boolean
  onToggleNote?: (string: number, fret: number) => void
  labelMode?: LabelMode
  degreeRoot?: NoteName
  accidental?: AccidentalPreference
  showFretNumbers?: boolean
  compact?: boolean
  leftHanded?: boolean
  className?: string
}

const FRET_MARKERS = new Set([3, 5, 7, 9, 12, 15, 17, 19, 21, 24])

export function Fretboard({
  tuning,
  fretCount = 15,
  firstFret = 0,
  lastFret,
  rootOffset = 0,
  marks = [],
  annotations = [],
  pendingFrom = null,
  interactive = true,
  onToggleNote,
  labelMode = 'note',
  degreeRoot,
  accidental = 'sharp',
  showFretNumbers = true,
  compact = false,
  leftHanded = false,
  className = '',
}: Props) {
  const endFret = lastFret ?? fretCount
  const startFret = Math.max(0, Math.min(firstFret, endFret))
  const stringCount = tuning.length
  const markMap = new Map<string, FretMark>()
  for (const m of marks) {
    if (m.fret < startFret || m.fret > endFret) continue
    if (m.string < 0 || m.string >= stringCount) continue
    const key = `${m.string}:${m.fret}`
    const prev = markMap.get(key)
    if (!prev || priority(m) >= priority(prev)) markMap.set(key, m)
  }

  const cellW = compact ? 28 : 36
  const cellH = compact ? 22 : 28
  const nutW = 10
  const labelW = 28
  const frettedCount = startFret === 0 ? endFret : endFret - startFret + 1
  const width = labelW + nutW + frettedCount * cellW + 8
  const height = stringCount * cellH + (showFretNumbers ? 22 : 8)
  const rootPc = degreeRoot ? fretNotePc(degreeRoot, 0, 0) : 0
  const layout = {
    stringCount,
    cellW,
    cellH,
    nutW,
    labelW,
    firstFret: startFret,
    lastFret: endFret,
    leftHanded,
    width,
  }
  const stringTopY = 8 + cellH / 2
  const stringBottomY = 8 + (stringCount - 1) * cellH + cellH / 2
  const fretTopY = stringTopY - cellH / 2
  const fretBottomY = stringBottomY + cellH / 2
  const boardMidY = (stringTopY + stringBottomY) / 2

  const mx = (x: number) => (leftHanded ? width - x : x)
  const frets: number[] = []
  for (let f = startFret; f <= endFret; f++) frets.push(f)

  function fretCenterX(fret: number): number {
    if (startFret === 0 && fret === 0) return labelW + nutW / 2
    const index = startFret === 0 ? fret - 1 : fret - startFret
    return labelW + nutW + index * cellW + cellW / 2
  }

  function fretLineX(afterIndex: number): number {
    return labelW + nutW + afterIndex * cellW
  }

  const labelSideX = leftHanded ? width - 4 : labelW - 4
  const labelAnchor = leftHanded ? 'start' : 'end'

  return (
    <svg
      className={`fretboard ${interactive ? 'fretboard--interactive' : ''} ${leftHanded ? 'fretboard--left' : ''} ${className}`}
      viewBox={`0 0 ${width} ${height}`}
      width="100%"
      role="img"
      aria-label={leftHanded ? 'Braço da guitarra (canhoto)' : 'Braço da guitarra'}
    >
      <rect x={0} y={0} width={width} height={height} className="fretboard__bg" rx={4} />

      {tuning.map((note, s) => {
        const displayRow = stringCount - 1 - s
        const y = 8 + displayRow * cellH + cellH / 2
        return (
          <text
            key={`open-${s}`}
            x={labelSideX}
            y={y + 4}
            textAnchor={labelAnchor}
            className="fretboard__open-label"
          >
            {note}
          </text>
        )
      })}

      <rect
        x={mx(labelW + nutW) - (leftHanded ? nutW : 0)}
        y={6}
        width={nutW}
        height={stringCount * cellH - 4}
        className="fretboard__nut"
      />

      {Array.from({ length: frettedCount + 1 }, (_, i) => {
        const x = mx(fretLineX(i))
        return (
          <line
            key={`fret-line-${i}`}
            x1={x}
            y1={fretTopY}
            x2={x}
            y2={fretBottomY}
            className={
              i === 0 ? 'fretboard__fret fretboard__fret--nut' : 'fretboard__fret'
            }
          />
        )
      })}

      {Array.from({ length: stringCount }, (_, s) => {
        const displayRow = stringCount - 1 - s
        const y = 8 + displayRow * cellH + cellH / 2
        const x1 = mx(labelW + nutW)
        const x2 = mx(labelW + nutW + frettedCount * cellW)
        return (
          <line
            key={`str-${s}`}
            x1={Math.min(x1, x2)}
            y1={y}
            x2={Math.max(x1, x2)}
            y2={y}
            className="fretboard__string"
            style={{ strokeWidth: 1 + s * 0.35 }}
          />
        )
      })}

      {frets.map((fret) => {
        if (fret === 0 || !FRET_MARKERS.has(fret)) return null
        const x = mx(fretCenterX(fret))
        const inlayGap = Math.min(14, cellH)
        if (fret === 12) {
          return (
            <g key={`inl-${fret}`}>
              <circle
                cx={x}
                cy={boardMidY - inlayGap}
                r={3.5}
                className="fretboard__inlay"
              />
              <circle
                cx={x}
                cy={boardMidY + inlayGap}
                r={3.5}
                className="fretboard__inlay"
              />
            </g>
          )
        }
        return (
          <circle
            key={`inl-${fret}`}
            cx={x}
            cy={boardMidY}
            r={3.5}
            className="fretboard__inlay"
          />
        )
      })}

      {Array.from({ length: stringCount }, (_s, s) =>
        frets.map((fret) => {
          const displayRow = stringCount - 1 - s
          const cx = mx(fretCenterX(fret))
          const cy = 8 + displayRow * cellH + cellH / 2
          const key = `${s}:${fret}`
          const mark = markMap.get(key)
          const pc = fretNotePc(tuning[s], fret, rootOffset)
          let text = ''
          if (labelMode === 'note' && mark) text = pcToName(pc, accidental)
          if (labelMode === 'degree' && mark && degreeRoot) {
            text = degreeLabel(rootPc, pc)
          }
          if (labelMode === 'interval' && mark && degreeRoot) {
            text = intervalLabel(rootPc, pc)
          }
          if (mark?.label) text = mark.label

          const hitW = fret === 0 || (startFret > 0 && fret === startFret) ? nutW : cellW
          const hitX =
            fret === 0 || (startFret > 0 && fret === startFret && startFret === 0)
              ? cx - nutW / 2
              : cx - cellW / 2

          return (
            <g key={key}>
              {interactive && (
                <rect
                  x={hitX}
                  y={cy - cellH / 2}
                  width={fret === 0 ? nutW : hitW}
                  height={cellH}
                  className="fretboard__hit"
                  onClick={() => onToggleNote?.(s, fret)}
                />
              )}
              {mark && (
                <g
                  className={`fretboard__mark fretboard__mark--${mark.kind ?? 'selected'} ${mark.dimmed ? 'is-dimmed' : ''}`}
                >
                  <circle cx={cx} cy={cy} r={compact ? 8 : 10} />
                  {text && (
                    <text x={cx} y={cy} textAnchor="middle" dominantBaseline="central">
                      {text}
                    </text>
                  )}
                </g>
              )}
            </g>
          )
        }),
      )}

      {(annotations.length > 0 || pendingFrom) && (
        <FretboardAnnotations
          annotations={annotations}
          layout={layout}
          pendingFrom={pendingFrom}
        />
      )}

      {showFretNumbers &&
        frets
          .filter((f) => f > 0)
          .map((fret) => (
            <text
              key={`fn-${fret}`}
              x={mx(fretCenterX(fret))}
              y={height - 4}
              textAnchor="middle"
              className="fretboard__fret-num"
            >
              {fret}
            </text>
          ))}

      {startFret > 0 && (
        <text
          x={mx(labelW + nutW / 2)}
          y={height - 4}
          textAnchor="middle"
          className="fretboard__fret-num"
        >
          {startFret}fr
        </text>
      )}
    </svg>
  )
}

function priority(m: FretMark): number {
  switch (m.kind) {
    // Marcas do usuário por cima do overlay (senão a tônica/root “come” o clique visual).
    case 'selected':
      return 5
    case 'root':
      return 4
    case 'caged':
      return 3
    case 'scale':
      return 2
    default:
      return 0
  }
}
