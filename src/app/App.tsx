import { APP_TABS, FRET_COUNT } from '@/app/constants'
import { useStudioState } from '@/app/useStudioState'
import { Fretboard } from '@/components/Fretboard/Fretboard'
import { CagedPanel } from '@/features/caged/CagedPanel'
import { ExplorerPanel } from '@/features/explorer/ExplorerPanel'
import { PrintPanel } from '@/features/print/PrintPanel'
import { StudiesPanel } from '@/features/studies/StudiesPanel'
import '@/styles/app.css'

export default function App() {
  const s = useStudioState()

  return (
    <div className="app">
      <header className="topbar no-print">
        <div className="brand">
          <span className="brand__mark" aria-hidden />
          <div>
            <p className="brand__name">GuitarTheory</p>
            <p className="brand__tag">Estudos no braço · escalas · CAGED · licks</p>
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
            <div className="toolbar no-print">
              <div className="toolbar__group">
                <span className="toolbar__label">Tom do braço</span>
                <button
                  type="button"
                  className="btn"
                  onClick={() => s.transposeBoard(-1)}
                  title="Descer 1 semitom"
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
                  title="Subir 1 semitom"
                >
                  +
                </button>
                <button
                  type="button"
                  className="btn btn--ghost"
                  onClick={() => s.setRootOffset(0)}
                  title="Zera o contador (não move as notas)"
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
              </div>

              <div className="toolbar__group">
                {(s.tab === 'lick' || s.lickMode) && (
                  <>
                    <span className="pill pill--lick">Modo lick</span>
                    <button
                      type="button"
                      className="btn btn--ghost"
                      onClick={() => s.setLickSteps((steps) => steps.slice(0, -1))}
                      disabled={!s.lickSteps.length}
                    >
                      Desfazer
                    </button>
                    <button
                      type="button"
                      className="btn btn--ghost"
                      onClick={() => s.setLickSteps([])}
                    >
                      Limpar lick
                    </button>
                  </>
                )}
                {s.tab !== 'lick' && (
                  <button
                    type="button"
                    className="btn btn--ghost"
                    onClick={() => s.setSelectedNotes([])}
                  >
                    Limpar notas
                  </button>
                )}
              </div>
            </div>

            <Fretboard
              tuning={s.tuning}
              fretCount={FRET_COUNT}
              rootOffset={0}
              marks={s.marks}
              interactive
              onToggleNote={s.handleToggle}
              labelMode={s.labelMode}
              degreeRoot={s.tab === 'caged' ? s.cagedRoot : (s.overlayRoot ?? undefined)}
            />

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

          {(s.tab === 'explorer' || s.tab === 'lick') && (
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
              onToggleShape={(shape) => {
                s.setCagedShapes((prev) =>
                  prev.includes(shape)
                    ? prev.filter((item) => item !== shape)
                    : [...prev, shape],
                )
              }}
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
            s.setPrintItems((items) => [...items, s.studyToPrintItem(study)])
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
