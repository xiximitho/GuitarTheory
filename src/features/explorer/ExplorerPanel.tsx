import type { ScaleMatch } from '@/theory/matcher'
import { formatScaleFormula } from '@/theory/notes'
import type { ScaleDefinition } from '@/theory/scales'

type Props = {
  matches: ScaleMatch[]
  activeScaleId: string | null
  activeRoot: string | null
  onSelect: (scale: ScaleDefinition, root: string) => void
  onClear: () => void
}

function MatchRow({
  match,
  active,
  meta,
  onSelect,
}: {
  match: ScaleMatch
  active: boolean
  meta: string
  onSelect: (scale: ScaleDefinition, root: string) => void
}) {
  return (
    <li>
      <button
        type="button"
        className={`match-item ${active ? 'is-active' : ''}`}
        onClick={() => onSelect(match.scale, match.root)}
      >
        <span className="match-item__title">
          {match.root} {match.scale.name}
        </span>
        <span className="match-item__intervals">
          {formatScaleFormula(match.scale.intervals)}
        </span>
        <span className="match-item__meta">{meta}</span>
      </button>
    </li>
  )
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
            Limpar escala
          </button>
        )}
      </div>
      <p className="panel__hint">
        Clique no braço para marcar ou desmarcar notas. Escolha uma escala para ver o
        overlay; a tônica dos graus acompanha (ou defina outra no toolbar).
      </p>

      {matches.length === 0 && (
        <p className="empty">
          Nenhuma escala ainda — marque notas no braço para descobrir escalas e modos.
        </p>
      )}

      {exact.length > 0 && (
        <section className="match-group">
          <h3>Contém todas as notas</h3>
          <ul className="match-list">
            {exact.slice(0, 24).map((m) => (
              <MatchRow
                key={`${m.scale.id}-${m.root}`}
                match={m}
                active={activeScaleId === m.scale.id && activeRoot === m.root}
                meta={
                  m.scale.characteristic
                    ? `${m.scale.category} · carac. ${m.scale.characteristic}`
                    : m.scale.category
                }
                onSelect={onSelect}
              />
            ))}
          </ul>
        </section>
      )}

      {partial.length > 0 && (
        <section className="match-group">
          <h3>Correspondência parcial</h3>
          <ul className="match-list">
            {partial.slice(0, 12).map((m) => (
              <MatchRow
                key={`p-${m.scale.id}-${m.root}`}
                match={m}
                active={activeScaleId === m.scale.id && activeRoot === m.root}
                meta={`${Math.round(m.ratio * 100)}% · ${m.matched}/${m.total} notas`}
                onSelect={onSelect}
              />
            ))}
          </ul>
        </section>
      )}
    </aside>
  )
}
