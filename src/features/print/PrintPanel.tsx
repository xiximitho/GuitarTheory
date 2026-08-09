import { Fretboard } from '@/components/Fretboard/Fretboard'
import { cagedForScale, cagedShapeForRoot, type CagedShapeId } from '@/theory/caged'
import {
  buildCagedMarks,
  buildLickMarks,
  buildScaleMarks,
  buildSelectedMarks,
  mergeMarks,
} from '@/theory/fretboardUtils'
import { STANDARD_TUNING, type NoteName } from '@/theory/notes'
import type { PrintItem, Study } from '@/types/study'

type Props = {
  studies: Study[]
  items: PrintItem[]
  packTitle: string
  onPackTitleChange: (t: string) => void
  onAddStudy: (study: Study) => void
  onAddCurrent: () => void
  onRemove: (index: number) => void
  onMove: (index: number, dir: -1 | 1) => void
  onPrint: () => void
  onClear: () => void
  tuning?: NoteName[]
}

export function PrintPanel({
  studies,
  items,
  packTitle,
  onPackTitleChange,
  onAddStudy,
  onAddCurrent,
  onRemove,
  onMove,
  onPrint,
  onClear,
  tuning = STANDARD_TUNING,
}: Props) {
  return (
    <div className="print-feature">
      <aside className="panel no-print">
        <div className="panel__header">
          <h2>Impressão</h2>
        </div>
        <p className="panel__hint">
          Monte um documento com vários desenhos, escalas e estudos no mesmo PDF.
        </p>

        <label className="field">
          <span>Título do documento</span>
          <input
            type="text"
            value={packTitle}
            onChange={(e) => onPackTitleChange(e.target.value)}
            placeholder="Meu pack de estudos"
          />
        </label>

        <div className="btn-row">
          <button type="button" className="btn btn--primary" onClick={onAddCurrent}>
            Adicionar vista atual
          </button>
          <button type="button" className="btn" onClick={onPrint}>
            Imprimir
          </button>
          <button type="button" className="btn btn--ghost" onClick={onClear}>
            Limpar pack
          </button>
        </div>

        <h3 className="subhead">Estudos salvos</h3>
        <ul className="match-list">
          {studies.map((study) => (
            <li key={study.id}>
              <button
                type="button"
                className="match-item"
                onClick={() => onAddStudy(study)}
              >
                <span className="match-item__title">{study.title}</span>
                <span className="match-item__meta">Adicionar ao documento</span>
              </button>
            </li>
          ))}
          {studies.length === 0 && (
            <li className="empty">Salve estudos para adicioná-los aqui.</li>
          )}
        </ul>

        <h3 className="subhead">Itens no documento ({items.length})</h3>
        <ol className="print-item-list">
          {items.map((item, i) => (
            <li key={`${item.title}-${i}`} className="print-item-list__row">
              <span>
                {i + 1}. {item.title}
              </span>
              <span className="btn-row">
                <button
                  type="button"
                  className="btn btn--ghost"
                  onClick={() => onMove(i, -1)}
                >
                  ↑
                </button>
                <button
                  type="button"
                  className="btn btn--ghost"
                  onClick={() => onMove(i, 1)}
                >
                  ↓
                </button>
                <button
                  type="button"
                  className="btn btn--ghost btn--danger"
                  onClick={() => onRemove(i)}
                >
                  Remover
                </button>
              </span>
            </li>
          ))}
        </ol>
      </aside>

      <div className="print-preview" id="print-root">
        <header className="print-doc__header">
          <h1>{packTitle || 'GuitarTheory'}</h1>
          <p>{items.length} diagrama(s)</p>
        </header>
        <div className="print-grid">
          {items.map((item, i) => (
            <PrintBlock
              key={`${item.title}-${i}`}
              item={item}
              tuning={tuning}
              index={i}
            />
          ))}
          {items.length === 0 && (
            <p className="empty no-print">
              Adicione itens para pré-visualizar a impressão.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

function PrintBlock({
  item,
  tuning,
  index,
}: {
  item: PrintItem
  tuning: NoteName[]
  index: number
}) {
  const fretCount = 15
  const labelMode = item.labelMode
  let marks = buildSelectedMarks(item.selectedNotes ?? [])

  if (item.cagedShape && item.root) {
    const positions = item.scaleId
      ? cagedForScale(
          item.cagedShape as CagedShapeId,
          item.root,
          item.scaleId,
          tuning,
          0,
          fretCount,
        )
      : cagedShapeForRoot(item.cagedShape as CagedShapeId, item.root, tuning, fretCount)
    marks = mergeMarks(buildCagedMarks(positions), marks)
  } else if (item.scaleId && item.root) {
    marks = mergeMarks(
      buildScaleMarks(tuning, item.root, item.scaleId, fretCount, 0),
      marks,
    )
  }

  if (item.lick?.steps.length) {
    marks = mergeMarks(marks, buildLickMarks(item.lick.steps))
  }

  return (
    <article className="print-block">
      <h2>
        {index + 1}. {item.title}
      </h2>
      {item.root && (
        <p className="print-block__meta">
          {item.root}
          {item.scaleId ? ` · ${item.scaleId}` : ''}
          {item.cagedShape ? ` · CAGED ${item.cagedShape}` : ''}
        </p>
      )}
      <Fretboard
        tuning={tuning}
        fretCount={fretCount}
        rootOffset={0}
        marks={marks}
        annotations={item.annotations ?? []}
        interactive={false}
        labelMode={labelMode}
        degreeRoot={item.root}
        compact
      />
      {item.notesText && <p className="print-block__notes">{item.notesText}</p>}
    </article>
  )
}
