import type { Study } from '@/types/study'

type Props = {
  studies: Study[]
  activeId: string | null
  onLoad: (study: Study) => void
  onDelete: (id: string) => void
  onSaveCurrent: () => void
  onExport: () => void
  onImport: (file: File) => void
  titleDraft: string
  onTitleChange: (title: string) => void
}

export function StudiesPanel({
  studies,
  activeId,
  onLoad,
  onDelete,
  onSaveCurrent,
  onExport,
  onImport,
  titleDraft,
  onTitleChange,
}: Props) {
  return (
    <aside className="panel">
      <div className="panel__header">
        <h2>Estudos</h2>
      </div>
      <p className="panel__hint">
        Salve o estado atual localmente e exporte/importe JSON.
      </p>

      <label className="field">
        <span>Título</span>
        <input
          type="text"
          value={titleDraft}
          onChange={(e) => onTitleChange(e.target.value)}
          placeholder="Ex.: Lick Dórico em Am"
        />
      </label>

      <div className="btn-row">
        <button type="button" className="btn btn--primary" onClick={onSaveCurrent}>
          Salvar estudo
        </button>
        <button type="button" className="btn" onClick={onExport}>
          Exportar JSON
        </button>
        <label className="btn btn--file">
          Importar JSON
          <input
            type="file"
            accept="application/json,.json"
            hidden
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) onImport(file)
              e.target.value = ''
            }}
          />
        </label>
      </div>

      <ul className="study-list">
        {studies.length === 0 && <li className="empty">Nenhum estudo salvo ainda.</li>}
        {studies.map((study) => (
          <li
            key={study.id}
            className={`study-item ${activeId === study.id ? 'is-active' : ''}`}
          >
            <button
              type="button"
              className="study-item__main"
              onClick={() => onLoad(study)}
            >
              <strong>{study.title}</strong>
              <span>
                {new Date(study.updatedAt).toLocaleString()} ·{' '}
                {study.selectedNotes.length} notas
                {study.lick?.steps.length ? ` · lick ${study.lick.steps.length}` : ''}
              </span>
            </button>
            <button
              type="button"
              className="btn btn--ghost btn--danger"
              onClick={() => onDelete(study.id)}
              aria-label={`Apagar ${study.title}`}
            >
              Apagar
            </button>
          </li>
        ))}
      </ul>
    </aside>
  )
}
