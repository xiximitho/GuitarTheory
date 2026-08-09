import { CAGED_ORDER, type CagedShapeId } from '@/theory/caged'
import { formatScaleFormula, ROOT_OPTIONS, type NoteName } from '@/theory/notes'
import { getScaleById, SCALE_CATALOG } from '@/theory/scales'

type Props = {
  root: NoteName
  /** `null` = mostrar só as notas do shape CAGED, sem filtrar por escala. */
  scaleId: string | null
  activeShapes: CagedShapeId[]
  showAllShapes: boolean
  onRootChange: (root: NoteName) => void
  onScaleChange: (scaleId: string | null) => void
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
  const selected = scaleId ? getScaleById(scaleId) : undefined

  return (
    <aside className="panel">
      <div className="panel__header">
        <h2>CAGED &amp; Modos</h2>
      </div>
      <p className="panel__hint">
        Escolha o tom e o shape. Sem escala, vê só as notas do CAGED; com escala/modo, o
        shape é filtrado por essas notas.
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
        <select
          value={scaleId ?? ''}
          onChange={(e) => onScaleChange(e.target.value ? e.target.value : null)}
        >
          <option value="">Nenhuma (só CAGED)</option>
          {modes.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
              {s.characteristic ? ` (${s.characteristic})` : ''}
            </option>
          ))}
        </select>
      </label>

      {selected && (
        <p className="scale-formula">{formatScaleFormula(selected.intervals)}</p>
      )}
      {!scaleId && (
        <p className="scale-formula">Shape CAGED completo · sem filtro de escala</p>
      )}

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
