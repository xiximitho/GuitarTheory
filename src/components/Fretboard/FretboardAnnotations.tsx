import type { FretAnnotation } from '@/types/annotation'
import type { NotePos } from '@/types/study'

type Layout = {
  stringCount: number
  cellW: number
  cellH: number
  nutW: number
  labelW: number
}

function cellCenter(
  string: number,
  fret: number,
  layout: Layout,
): { x: number; y: number } {
  const { stringCount, cellW, cellH, nutW, labelW } = layout
  const displayRow = stringCount - 1 - string
  const x =
    fret === 0 ? labelW + nutW / 2 : labelW + nutW + (fret - 1) * cellW + cellW / 2
  const y = 8 + displayRow * cellH + cellH / 2
  return { x, y }
}

function arrowHead(x1: number, y1: number, x2: number, y2: number, size = 7): string {
  const angle = Math.atan2(y2 - y1, x2 - x1)
  const a1 = angle - Math.PI / 6
  const a2 = angle + Math.PI / 6
  const p1x = x2 - size * Math.cos(a1)
  const p1y = y2 - size * Math.sin(a1)
  const p2x = x2 - size * Math.cos(a2)
  const p2y = y2 - size * Math.sin(a2)
  return `M ${x2} ${y2} L ${p1x} ${p1y} M ${x2} ${y2} L ${p2x} ${p2y}`
}

function vibratoPath(cx: number, cy: number, amp = 3.5, waves = 3): string {
  const startX = cx - waves * 4
  const y = cy - 14
  let d = `M ${startX} ${y}`
  for (let i = 0; i < waves; i++) {
    const x1 = startX + i * 8 + 2
    const x2 = startX + i * 8 + 6
    d += ` Q ${x1} ${y - amp} ${x1 + 2} ${y}`
    d += ` Q ${x2} ${y + amp} ${x2 + 2} ${y}`
  }
  return d
}

function harmonicDiamond(cx: number, cy: number, r = 9): string {
  return `M ${cx} ${cy - r} L ${cx + r} ${cy} L ${cx} ${cy + r} L ${cx - r} ${cy} Z`
}

function arcPath(x1: number, y1: number, x2: number, y2: number, lift = 14): string {
  const mx = (x1 + x2) / 2
  const my = Math.min(y1, y2) - lift
  return `M ${x1} ${y1 - 8} Q ${mx} ${my} ${x2} ${y2 - 8}`
}

function midLabel(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  lift = 18,
): { x: number; y: number } {
  return { x: (x1 + x2) / 2, y: Math.min(y1, y2) - lift }
}

type Props = {
  annotations: FretAnnotation[]
  layout: Layout
  pendingFrom?: NotePos | null
}

export function FretboardAnnotations({ annotations, layout, pendingFrom }: Props) {
  return (
    <g className="fretboard__annotations" pointerEvents="none">
      {pendingFrom && (
        <circle
          cx={cellCenter(pendingFrom.string, pendingFrom.fret, layout).x}
          cy={cellCenter(pendingFrom.string, pendingFrom.fret, layout).y}
          r={12}
          className="fretboard__pending"
        />
      )}

      {annotations.map((ann) => {
        const a = cellCenter(ann.from.string, ann.from.fret, layout)
        const b = ann.to ? cellCenter(ann.to.string, ann.to.fret, layout) : null

        switch (ann.kind) {
          case 'vibrato':
            return (
              <path
                key={ann.id}
                d={vibratoPath(a.x, a.y)}
                className="fretboard__ann fretboard__ann--vibrato"
              />
            )
          case 'harmonic':
            return (
              <path
                key={ann.id}
                d={harmonicDiamond(a.x, a.y)}
                className="fretboard__ann fretboard__ann--harmonic"
              />
            )
          case 'line':
            if (!b) return null
            return (
              <line
                key={ann.id}
                x1={a.x}
                y1={a.y}
                x2={b.x}
                y2={b.y}
                className="fretboard__ann fretboard__ann--line"
              />
            )
          case 'arrow':
            if (!b) return null
            return (
              <g key={ann.id} className="fretboard__ann fretboard__ann--arrow">
                <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} />
                <path d={arrowHead(a.x, a.y, b.x, b.y)} />
              </g>
            )
          case 'slide': {
            if (!b) return null
            const label = midLabel(a.x, a.y, b.x, b.y, 10)
            return (
              <g key={ann.id} className="fretboard__ann fretboard__ann--slide">
                <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} />
                <text x={label.x} y={label.y} textAnchor="middle">
                  /
                </text>
              </g>
            )
          }
          case 'hammer-on': {
            if (!b) return null
            const label = midLabel(a.x, a.y, b.x, b.y)
            return (
              <g key={ann.id} className="fretboard__ann fretboard__ann--hammer">
                <path d={arcPath(a.x, a.y, b.x, b.y)} />
                <text x={label.x} y={label.y} textAnchor="middle">
                  H
                </text>
              </g>
            )
          }
          case 'pull-off': {
            if (!b) return null
            const label = midLabel(a.x, a.y, b.x, b.y)
            return (
              <g key={ann.id} className="fretboard__ann fretboard__ann--pull">
                <path d={arcPath(a.x, a.y, b.x, b.y)} />
                <text x={label.x} y={label.y} textAnchor="middle">
                  P
                </text>
              </g>
            )
          }
          default:
            return null
        }
      })}
    </g>
  )
}
