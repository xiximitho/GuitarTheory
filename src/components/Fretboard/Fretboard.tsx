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
  fretCount?: number
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
  className?: string
}

const FRET_MARKERS = new Set([3, 5, 7, 9, 12, 15, 17, 19, 21])

export function Fretboard({
  tuning,
  fretCount = 15,
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
  className = '',
}: Props) {
  const stringCount = tuning.length
  const markMap = new Map<string, FretMark>()
  for (const m of marks) {
    const key = `${m.string}:${m.fret}`
    const prev = markMap.get(key)
    if (!prev || priority(m) >= priority(prev)) markMap.set(key, m)
  }

  const cellW = compact ? 28 : 36
  const cellH = compact ? 22 : 28
  const nutW = 10
  const labelW = 28
  const width = labelW + nutW + fretCount * cellW + 8
  const height = stringCount * cellH + (showFretNumbers ? 22 : 8)
  const rootPc = degreeRoot ? fretNotePc(degreeRoot, 0, 0) : 0
  const layout = { stringCount, cellW, cellH, nutW, labelW }
  const stringTopY = 8 + cellH / 2
  const stringBottomY = 8 + (stringCount - 1) * cellH + cellH / 2
  // Trastes passam um pouco das cordas externas para as bolinhas ficarem
  // visualmente centralizadas no vão vertical do braço.
  const fretTopY = stringTopY - cellH / 2
  const fretBottomY = stringBottomY + cellH / 2
  const boardMidY = (stringTopY + stringBottomY) / 2

  return (
    <svg
      className={`fretboard ${interactive ? 'fretboard--interactive' : ''} ${className}`}
      viewBox={`0 0 ${width} ${height}`}
      width="100%"
      role="img"
      aria-label="Braço da guitarra"
    >
      <rect x={0} y={0} width={width} height={height} className="fretboard__bg" rx={4} />

      {tuning.map((note, s) => {
        const displayRow = stringCount - 1 - s
        const y = 8 + displayRow * cellH + cellH / 2
        return (
          <text
            key={`open-${s}`}
            x={labelW - 4}
            y={y + 4}
            textAnchor="end"
            className="fretboard__open-label"
          >
            {note}
          </text>
        )
      })}

      <rect
        x={labelW}
        y={6}
        width={nutW}
        height={stringCount * cellH - 4}
        className="fretboard__nut"
      />

      {Array.from({ length: fretCount + 1 }, (_, f) => {
        const x = labelW + nutW + f * cellW
        return (
          <line
            key={`fret-${f}`}
            x1={x}
            y1={fretTopY}
            x2={x}
            y2={fretBottomY}
            className={
              f === 0 ? 'fretboard__fret fretboard__fret--nut' : 'fretboard__fret'
            }
          />
        )
      })}

      {Array.from({ length: stringCount }, (_, s) => {
        const displayRow = stringCount - 1 - s
        const y = 8 + displayRow * cellH + cellH / 2
        return (
          <line
            key={`str-${s}`}
            x1={labelW + nutW}
            y1={y}
            x2={labelW + nutW + fretCount * cellW}
            y2={y}
            className="fretboard__string"
            style={{ strokeWidth: 1 + s * 0.35 }}
          />
        )
      })}

      {Array.from({ length: fretCount }, (_, i) => {
        const fret = i + 1
        if (!FRET_MARKERS.has(fret)) return null
        const x = labelW + nutW + i * cellW + cellW / 2
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
        Array.from({ length: fretCount + 1 }, (_f, fret) => {
          const displayRow = stringCount - 1 - s
          const cx =
            fret === 0
              ? labelW + nutW / 2
              : labelW + nutW + (fret - 1) * cellW + cellW / 2
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
          if (mark?.order != null) text = String(mark.order)

          return (
            <g key={key}>
              {interactive && (
                <rect
                  x={fret === 0 ? cx - nutW / 2 : cx - cellW / 2}
                  y={cy - cellH / 2}
                  width={fret === 0 ? nutW : cellW}
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
        Array.from({ length: fretCount }, (_, i) => {
          const fret = i + 1
          const x = labelW + nutW + i * cellW + cellW / 2
          return (
            <text
              key={`fn-${fret}`}
              x={x}
              y={height - 4}
              textAnchor="middle"
              className="fretboard__fret-num"
            >
              {fret}
            </text>
          )
        })}
    </svg>
  )
}

function priority(m: FretMark): number {
  switch (m.kind) {
    case 'root':
      return 5
    case 'lick':
      return 4
    case 'selected':
      return 3
    case 'caged':
      return 2
    case 'scale':
      return 1
    default:
      return 0
  }
}
