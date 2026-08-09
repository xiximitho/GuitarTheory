import { useEffect, useState } from 'react'
import { normalizeStudyBoards } from '@/storage/studyBoards'
import type { Study } from '@/types/study'

function studySummary(study: Study): string {
  const boards = normalizeStudyBoards(study)
  const notes = boards.reduce((n, b) => n + b.selectedNotes.length, 0)
  const boardLabel =
    boards.length > 1
      ? `${boards.length} braços`
      : `${notes} nota${notes === 1 ? '' : 's'}`
  if (boards.length > 1) return `${boardLabel} · ${notes} notas`
  return boardLabel
}

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
  const [justSaved, setJustSaved] = useState(false)

  useEffect(() => {
    if (!justSaved) return
    const t = window.setTimeout(() => setJustSaved(false), 2200)
    return () => window.clearTimeout(t)
  }, [justSaved])

  function handleSave() {
    onSaveCurrent()
    setJustSaved(true)
  }

  function handleDelete(id: string, title: string) {
    if (!window.confirm(`Apagar o estudo “${title}”? Esta ação não pode ser desfeita.`)) {
      return
    }
    onDelete(id)
  }

  return (
    <aside className="panel">
      <div className="panel__header">
        <h2>Estudos</h2>
        {justSaved && <span className="pill pill--ok">Salvo</span>}
      </div>
      <p className="panel__hint">
        Salva todos os braços do estudo (notas, overlay/CAGED, anotações) mais labels e
        texto. Dados ficam no navegador; use export/import JSON para backup.
      </p>

      <label className="field">
        <span>Título</span>
        <input
          type="text"
          value={titleDraft}
          onChange={(e) => onTitleChange(e.target.value)}
          placeholder="Ex.: Dórico em Am"
        />
      </label>

      <div className="btn-row">
        <button type="button" className="btn btn--primary" onClick={handleSave}>
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
                {new Date(study.updatedAt).toLocaleString()} · {studySummary(study)}
              </span>
            </button>
            <button
              type="button"
              className="btn btn--ghost btn--danger"
              onClick={() => handleDelete(study.id, study.title)}
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
