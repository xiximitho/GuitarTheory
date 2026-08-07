import { CAGED_ORDER, type CagedShapeId } from '@/theory/caged'
import { ROOT_OPTIONS, type NoteName } from '@/theory/notes'
import { SCALE_CATALOG } from '@/theory/scales'

type Props = {
  root: NoteName
  scaleId: string
  activeShapes: CagedShapeId[]
  showAllShapes: boolean
  onRootChange: (root: NoteName) => void
  onScaleChange: (scaleId: string) => void
  onToggleShape: (shape: CagedShapeId) => void
  onShowAll: (all: boolean) => void
}

export function CagedPanel({
  root,
  scaleId,
  activeShapes,
  showAllShapes,
  onRootChange,
  onScaleChange,
  onToggleShape,
  onShowAll,
}: Props) {
  const modes = SCALE_CATALOG.filter(
    (s) => s.category === 'mode' || s.id === 'major' || s.id === 'natural-minor',
  )

  return (
    <aside className="panel">
      <div className="panel__header">
        <h2>CAGED &amp; Modos</h2>
      </div>
      <p className="panel__hint">
        Escolha o tom e a escala/modo. Os shapes CAGED são baseados no sistema maior e
        filtrados pelas notas da escala selecionada.
      </p>

      <label className="field">
        <span>Tom (root)</span>
        <select value={root} onChange={(e) => onRootChange(e.target.value as NoteName)}>
          {ROOT_OPTIONS.map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>
      </label>

      <label className="field">
        <span>Escala / Modo</span>
        <select value={scaleId} onChange={(e) => onScaleChange(e.target.value)}>
          {modes.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
              {s.characteristic ? ` (${s.characteristic})` : ''}
            </option>
          ))}
        </select>
      </label>

      <div className="field">
        <span>Shapes CAGED</span>
        <div className="chip-row">
          <button
            type="button"
            className={`chip ${showAllShapes ? 'is-active' : ''}`}
            onClick={() => onShowAll(true)}
          >
            Todos
          </button>
          {CAGED_ORDER.map((shape) => (
            <button
              key={shape}
              type="button"
              className={`chip ${!showAllShapes && activeShapes.includes(shape) ? 'is-active' : ''}`}
              onClick={() => {
                onShowAll(false)
                onToggleShape(shape)
              }}
            >
              {shape}
            </button>
          ))}
        </div>
      </div>
    </aside>
  )
}
