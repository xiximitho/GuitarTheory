import {
  APP_TABS,
  DEFAULT_FIRST_FRET,
  DEFAULT_LAST_FRET,
  MAX_LAST_FRET,
  MAX_STRINGS,
  MIN_STRINGS,
} from '@/app/constants'
import { useStudioState } from '@/app/useStudioState'
import { Fretboard } from '@/components/Fretboard/Fretboard'
import { CagedPanel } from '@/features/caged/CagedPanel'
import { ExplorerPanel } from '@/features/explorer/ExplorerPanel'
import { PrintPanel } from '@/features/print/PrintPanel'
import { StudiesPanel } from '@/features/studies/StudiesPanel'
import {
  ROOT_OPTIONS,
  TUNING_PRESETS,
  matchTuningPresetId,
  type NoteName,
} from '@/theory/notes'
import { getScaleById } from '@/theory/scales'
import { BOARD_TOOLS, isAnnotationTool } from '@/types/annotation'
import '@/styles/app.css'

function boardContextLine(s: ReturnType<typeof useStudioState>): string {
  const boardLabel = s.activeBoard.title?.trim() || 'Braço ativo'
  const prefix = s.boards.length > 1 ? `${boardLabel} · ` : ''
  if (s.tab === 'caged') {
    const shapes = s.showAllCaged ? 'todos' : s.cagedShapes.join('')
    const scale = s.cagedScaleId ? getScaleById(s.cagedScaleId)?.name : null
    return scale
      ? `${prefix}CAGED ${shapes} · ${s.cagedRoot} ${scale}`
      : `${prefix}CAGED ${shapes} · tom ${s.cagedRoot}`
  }
  if (s.overlayScaleId && s.overlayRoot) {
    const name = getScaleById(s.overlayScaleId)?.name ?? s.overlayScaleId
    return `${prefix}Overlay: ${s.overlayRoot} ${name}`
  }
  if (s.selectedNotes.length === 0) {
    return `${prefix}Clique no braço para marcar notas`
  }
  return `${prefix}${s.selectedNotes.length} nota${s.selectedNotes.length === 1 ? '' : 's'} marcada${s.selectedNotes.length === 1 ? '' : 's'}`
}

export default function App() {
  const s = useStudioState()
  const annotationTools = BOARD_TOOLS.filter((t) => t.id !== 'select')

  return (
    <div className="app">
      <header className="topbar no-print">
        <div className="brand">
          <span className="brand__mark" aria-hidden />
          <div>
            <p className="brand__name">GuitarTheory</p>
            <p className="brand__tag">Estudos no braço · escalas · CAGED</p>
          </div>
        </div>
        <nav className="tabs" aria-label="Seções">
          {APP_TABS.map(([id, label]) => (
            <button
              key={id}
              type="button"
              className={`tab ${s.tab === id ? 'is-active' : ''}`}
              onClick={() => s.setTab(id)}
            >
              {label}
            </button>
          ))}
        </nav>
      </header>

      {s.tab !== 'print' && (
        <main className="workspace">
          <section className="workspace__board">
            <p className="board-context no-print" aria-live="polite">
              {boardContextLine(s)}
            </p>

            <div className="toolbar no-print">
              <div className="toolbar__group">
                <span className="toolbar__label">Afinação</span>
                <select
                  className="toolbar__select toolbar__select--wide"
                  value={matchTuningPresetId(s.tuning)}
                  onChange={(e) => {
                    const preset = TUNING_PRESETS.find((p) => p.id === e.target.value)
                    if (preset) s.setTuning([...preset.tuning])
                  }}
                  title="Presets de afinação"
                >
                  {TUNING_PRESETS.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                  {matchTuningPresetId(s.tuning) === 'custom' && (
                    <option value="custom">Personalizada</option>
                  )}
                </select>
                <select
                  className="toolbar__select"
                  value={s.tuning.length}
                  onChange={(e) => s.handleStringCount(Number(e.target.value))}
                  title="Número de cordas"
                >
                  {Array.from(
                    { length: MAX_STRINGS - MIN_STRINGS + 1 },
                    (_, i) => MIN_STRINGS + i,
                  ).map((n) => (
                    <option key={n} value={n}>
                      {n} cordas
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  className={`chip ${s.leftHanded ? 'is-active' : ''}`}
                  onClick={() => s.setLeftHanded((v) => !v)}
                  title="Espelha o braço para canhotos"
                >
                  Canhoto
                </button>
              </div>

              <div className="toolbar__group">
                <span className="toolbar__label">Trastes</span>
                <label className="toolbar__inline">
                  de
                  <input
                    className="toolbar__num"
                    type="number"
                    min={0}
                    max={s.lastFret}
                    value={s.firstFret}
                    onChange={(e) => s.setFirstFret(Number(e.target.value))}
                  />
                </label>
                <label className="toolbar__inline">
                  até
                  <input
                    className="toolbar__num"
                    type="number"
                    min={s.firstFret}
                    max={MAX_LAST_FRET}
                    value={s.lastFret}
                    onChange={(e) => s.setLastFret(Number(e.target.value))}
                  />
                </label>
              </div>

              <details className="toolbar__details toolbar__details--inline">
                <summary className="toolbar__summary">Cordas (custom)</summary>
                <div className="toolbar__group toolbar__group--nested">
                  {s.tuning.map((note, i) => (
                    <label key={`str-${i}`} className="toolbar__inline">
                      {i + 1}ª
                      <select
                        className="toolbar__select"
                        value={note}
                        onChange={(e) =>
                          s.handleStringNote(i, e.target.value as NoteName)
                        }
                      >
                        {ROOT_OPTIONS.map((n) => (
                          <option key={n} value={n}>
                            {n}
                          </option>
                        ))}
                      </select>
                    </label>
                  ))}
                </div>
              </details>

              <div className="toolbar__group">
                <span className="toolbar__label">Transpor diagrama</span>
                <button
                  type="button"
                  className="btn"
                  onClick={() => s.transposeBoard(-1)}
                  title="Desce 1 semitom — move notas e anotações"
                >
                  −
                </button>
                <span className="toolbar__value">
                  {s.rootOffset >= 0 ? `+${s.rootOffset}` : s.rootOffset} st
                </span>
                <button
                  type="button"
                  className="btn"
                  onClick={() => s.transposeBoard(1)}
                  title="Sobe 1 semitom — move notas e anotações"
                >
                  +
                </button>
                <button
                  type="button"
                  className="btn btn--ghost"
                  onClick={() => s.setRootOffset(0)}
                  title="Zera só o contador de sessão; não move as casas"
                >
                  Zerar contador
                </button>
              </div>

              <div className="toolbar__group">
                <span className="toolbar__label">Labels</span>
                <button
                  type="button"
                  className={`chip ${s.labelMode === 'note' ? 'is-active' : ''}`}
                  onClick={() => s.setLabelMode('note')}
                >
                  Notas
                </button>
                <button
                  type="button"
                  className={`chip ${s.labelMode === 'degree' ? 'is-active' : ''}`}
                  onClick={() => s.setLabelMode('degree')}
                >
                  Graus
                </button>
                <button
                  type="button"
                  className={`chip ${s.labelMode === 'interval' ? 'is-active' : ''}`}
                  onClick={() => s.setLabelMode('interval')}
                >
                  Intervalos
                </button>
              </div>

              {(s.labelMode === 'degree' ||
                s.labelMode === 'interval' ||
                Boolean(s.overlayScaleId)) && (
                <div className="toolbar__group">
                  <span className="toolbar__label">Tônica</span>
                  <select
                    className="toolbar__select"
                    value={s.labelTonic ?? ''}
                    onChange={(e) =>
                      s.setLabelTonic(
                        e.target.value ? (e.target.value as NoteName) : null,
                      )
                    }
                    title="Base dos graus/intervalos. Automática usa a root da escala do overlay."
                  >
                    <option value="">Automática</option>
                    {ROOT_OPTIONS.map((n) => (
                      <option key={n} value={n}>
                        {n}
                      </option>
                    ))}
                  </select>
                  {!s.labelRoot && (
                    <span className="toolbar__hint">
                      Escolha uma tônica ou uma escala
                    </span>
                  )}
                </div>
              )}

              <div className="toolbar__group">
                <button
                  type="button"
                  className={`chip ${s.boardTool === 'select' ? 'is-active' : ''}`}
                  onClick={() => s.setBoardTool('select')}
                  title="Marcar / desmarcar notas"
                >
                  Marcar
                </button>
                <button
                  type="button"
                  className="btn btn--ghost"
                  onClick={() => s.setSelectedNotes([])}
                  disabled={!s.selectedNotes.length}
                >
                  Limpar notas
                </button>
              </div>

              <details
                className="toolbar__details"
                open={isAnnotationTool(s.boardTool)}
              >
                <summary className="toolbar__summary">Técnica no braço</summary>
                <div className="toolbar__group toolbar__group--nested">
                  {annotationTools.map((tool) => (
                    <button
                      key={tool.id}
                      type="button"
                      className={`chip ${s.boardTool === tool.id ? 'is-active' : ''}`}
                      onClick={() => s.setBoardTool(tool.id)}
                      title={tool.title}
                    >
                      {tool.label}
                    </button>
                  ))}
                </div>
                {isAnnotationTool(s.boardTool) && (
                  <div className="toolbar__group toolbar__group--nested">
                    {s.annotationFrom ? (
                      <span className="pill">
                        2º clique: destino
                        <button
                          type="button"
                          className="btn btn--ghost"
                          onClick={s.cancelAnnotationFrom}
                          title="Cancela o ponto de origem"
                        >
                          Cancelar
                        </button>
                      </span>
                    ) : (
                      <span className="toolbar__hint">
                        {s.boardTool === 'vibrato' || s.boardTool === 'harmonic'
                          ? 'Clique numa casa'
                          : 'Clique origem, depois destino'}
                      </span>
                    )}
                    <button
                      type="button"
                      className="btn btn--ghost"
                      onClick={s.undoAnnotation}
                      disabled={!s.annotations.length && !s.annotationFrom}
                    >
                      Desfazer traço
                    </button>
                    <button
                      type="button"
                      className="btn btn--ghost"
                      onClick={s.clearAnnotations}
                      disabled={!s.annotations.length && !s.annotationFrom}
                    >
                      Limpar traços
                    </button>
                  </div>
                )}
              </details>
            </div>

            <div className="boards-bar no-print">
              <div className="btn-row" style={{ marginBottom: 0 }}>
                <button type="button" className="btn btn--primary" onClick={s.addBoard}>
                  Adicionar braço
                </button>
                <button type="button" className="btn" onClick={s.duplicateActiveBoard}>
                  Duplicar ativo
                </button>
                <button
                  type="button"
                  className="btn btn--ghost btn--danger"
                  onClick={s.removeActiveBoard}
                  disabled={s.boards.length <= 1}
                  title={
                    s.boards.length <= 1
                      ? 'O estudo precisa de ao menos um braço'
                      : 'Remove o braço ativo'
                  }
                >
                  Remover ativo
                </button>
              </div>
              <p className="toolbar__hint">
                Toolbar e painéis editam o braço destacado. Clique noutro braço para
                focar.
              </p>
            </div>

            <div className="boards-stack">
              {s.boardViews.map(({ board, marks }, index) => {
                const active = board.id === s.activeBoardId
                return (
                  <article
                    key={board.id}
                    className={`board-card ${active ? 'is-active' : ''}`}
                    onClick={() => s.setActiveBoard(board.id)}
                  >
                    <div className="board-card__head no-print">
                      <label className="board-card__title">
                        <span className="toolbar__label">Braço {index + 1}</span>
                        <input
                          type="text"
                          value={board.title ?? ''}
                          placeholder={`Braço ${index + 1}`}
                          onClick={(e) => e.stopPropagation()}
                          onChange={(e) => s.renameBoard(board.id, e.target.value)}
                        />
                      </label>
                      {active && <span className="pill pill--ok">Editando</span>}
                    </div>
                    <div
                      onClick={(e) => e.stopPropagation()}
                      onKeyDown={(e) => e.stopPropagation()}
                    >
                      <Fretboard
                        tuning={s.tuning}
                        firstFret={board.firstFret ?? DEFAULT_FIRST_FRET}
                        lastFret={board.lastFret ?? DEFAULT_LAST_FRET}
                        rootOffset={0}
                        marks={marks}
                        annotations={board.annotations ?? []}
                        pendingFrom={active ? s.annotationFrom : null}
                        interactive={active}
                        onToggleNote={active ? s.handleToggle : undefined}
                        labelMode={s.labelMode}
                        degreeRoot={s.labelRoot}
                        leftHanded={s.leftHanded}
                      />
                    </div>
                  </article>
                )
              })}
            </div>

            <label className="field field--wide no-print">
              <span>Anotações do estudo</span>
              <textarea
                rows={2}
                value={s.notesText}
                onChange={(e) => s.setNotesText(e.target.value)}
                placeholder="Ideias, progressão, digitação…"
              />
            </label>
          </section>

          {s.tab === 'explorer' && (
            <ExplorerPanel
              matches={s.matches}
              activeScaleId={s.overlayScaleId}
              activeRoot={s.overlayRoot}
              onSelect={s.handleSelectMatch}
              onClear={s.clearOverlay}
            />
          )}

          {s.tab === 'caged' && (
            <CagedPanel
              root={s.cagedRoot}
              scaleId={s.cagedScaleId}
              activeShapes={s.cagedShapes}
              showAllShapes={s.showAllCaged}
              onRootChange={s.setCagedRoot}
              onScaleChange={s.setCagedScaleId}
              onShowAll={s.setShowAllCaged}
              onToggleShape={s.toggleCagedShape}
            />
          )}

          {s.tab === 'studies' && (
            <StudiesPanel
              studies={s.studies}
              activeId={s.activeStudyId}
              titleDraft={s.titleDraft}
              onTitleChange={s.setTitleDraft}
              onSaveCurrent={s.saveCurrent}
              onLoad={s.loadStudy}
              onDelete={s.removeStudy}
              onExport={s.exportStudies}
              onImport={s.importStudies}
            />
          )}
        </main>
      )}

      {s.tab === 'print' && (
        <PrintPanel
          studies={s.studies}
          items={s.printItems}
          packTitle={s.packTitle}
          onPackTitleChange={s.setPackTitle}
          tuning={s.tuning}
          onAddCurrent={() =>
            s.setPrintItems((items) => [...items, s.currentAsPrintItem()])
          }
          onAddStudy={(study) =>
            s.setPrintItems((items) => [...items, ...s.studyToPrintItems(study)])
          }
          onRemove={(index) =>
            s.setPrintItems((items) => items.filter((_, i) => i !== index))
          }
          onMove={(index, dir) =>
            s.setPrintItems((items) => {
              const next = [...items]
              const j = index + dir
              if (j < 0 || j >= next.length) return items
              ;[next[index], next[j]] = [next[j], next[index]]
              return next
            })
          }
          onPrint={() => window.print()}
          onClear={() => s.setPrintItems([])}
        />
      )}

      <footer className="footer no-print">
        <span>GuitarTheory · dados locais · export JSON</span>
        <span className="footer__muted">Login/sync em breve</span>
      </footer>
    </div>
  )
}
