import type { ScaleMatch } from '@/theory/matcher'
import type { ScaleDefinition } from '@/theory/scales'

type Props = {
  matches: ScaleMatch[]
  activeScaleId: string | null
  activeRoot: string | null
  onSelect: (scale: ScaleDefinition, root: string) => void
  onClear: () => void
}

export function ExplorerPanel({
  matches,
  activeScaleId,
  activeRoot,
  onSelect,
  onClear,
}: Props) {
  const exact = matches.filter((m) => m.exact)
  const partial = matches.filter((m) => !m.exact)

  return (
    <aside className="panel">
      <div className="panel__header">
        <h2>Escalas possíveis</h2>
        {(activeScaleId || matches.length > 0) && (
          <button type="button" className="btn btn--ghost" onClick={onClear}>
            Limpar overlay
          </button>
        )}
      </div>
      <p className="panel__hint">
        Marque notas no braço para descobrir escalas e modos que as contêm.
      </p>

      {matches.length === 0 && (
        <p className="empty">Nenhuma escala ainda — selecione pelo menos 3 notas.</p>
      )}

      {exact.length > 0 && (
        <section className="match-group">
          <h3>Contém todas as notas</h3>
          <ul className="match-list">
            {exact.slice(0, 24).map((m) => {
              const active = activeScaleId === m.scale.id && activeRoot === m.root
              return (
                <li key={`${m.scale.id}-${m.root}`}>
                  <button
                    type="button"
                    className={`match-item ${active ? 'is-active' : ''}`}
                    onClick={() => onSelect(m.scale, m.root)}
                  >
                    <span className="match-item__title">
                      {m.root} {m.scale.name}
                    </span>
                    <span className="match-item__meta">
                      {m.scale.category}
                      {m.scale.characteristic
                        ? ` · carac. ${m.scale.characteristic}`
                        : ''}
                    </span>
                  </button>
                </li>
              )
            })}
          </ul>
        </section>
      )}

      {partial.length > 0 && (
        <section className="match-group">
          <h3>Correspondência parcial</h3>
          <ul className="match-list">
            {partial.slice(0, 12).map((m) => {
              const active = activeScaleId === m.scale.id && activeRoot === m.root
              return (
                <li key={`p-${m.scale.id}-${m.root}`}>
                  <button
                    type="button"
                    className={`match-item ${active ? 'is-active' : ''}`}
                    onClick={() => onSelect(m.scale, m.root)}
                  >
                    <span className="match-item__title">
                      {m.root} {m.scale.name}
                    </span>
                    <span className="match-item__meta">
                      {Math.round(m.ratio * 100)}% · {m.matched}/{m.total} notas
                    </span>
                  </button>
                </li>
              )
            })}
          </ul>
        </section>
      )}
    </aside>
  )
}
