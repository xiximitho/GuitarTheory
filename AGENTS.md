# AGENTS.md — GuitarTheory

Documentação para agentes de IA. Leia isto antes de alterar o código.

## Produto

App web de estudos de guitarra focado no **braço**:

- marcar notas e descobrir escalas/modos possíveis (descoberta inversa)
- CAGED + modos gregos
- transpor ±1 semitom
- salvar estudos (localStorage + JSON)
- imprimir vários diagramas no mesmo documento

Idioma da UI: **português (Brasil)**.

## Stack

| Peça             | Escolha                                            |
| ---------------- | -------------------------------------------------- |
| UI               | React 19 + TypeScript                              |
| Build            | Vite 8                                             |
| Testes           | Vitest (só `src/theory/**/*.test.ts` por enquanto) |
| Lint / format    | Oxlint + Prettier + EditorConfig                   |
| Persistência MVP | `localStorage` + export/import JSON                |
| Fontes           | `@fontsource/*` self-hosted (latin / latin-ext)    |
| Compressão build | `vite-plugin-compression2` → `.gz` + `.br`         |

Alias: `@/*` → `src/*`.

Validação completa: `npm run check`.

## Estrutura

```text
src/
  app/                 # shell + estado do estúdio
    App.tsx            # UI fina (tabs + layout)
    useStudioState.ts  # estado, ações, persistência de estudos
    buildMarks.ts      # monta FretMark[] a partir do estado
    constants.ts       # FRET_COUNT, tabs, ids de modos
  components/
    Fretboard/         # braço SVG interativo / print read-only
  features/
    explorer/          # painel de escalas possíveis
    caged/             # seletor CAGED + modos
    studies/           # CRUD / export / import
    print/             # pack de impressão + preview
  theory/              # ENGINE PURA — sem React, sem DOM
    notes.ts           # pitch classes, nomes, graus
    scales.ts          # catálogo + pitch sets
    matcher.ts         # notas → escalas ranqueadas
    caged.ts           # shapes CAGED móveis
    transpose.ts       # mover posições
    fretboardUtils.ts  # marks a partir de notas/escalas
  storage/
    studies.ts         # localStorage + JSON
    auth.ts            # STUB — login/sync ainda não existem
  types/
    study.ts           # Study, PrintPack, User
    fretboard.ts       # FretMark, LabelMode
  styles/              # CSS global + fonts
```

### Camadas (obrigatório)

1. `theory/` não importa de `components/`, `features/` ou `app/`.
2. Tipos compartilhados ficam em `types/`.
3. Estado da UI vive em `useStudioState` — não inchir `App.tsx` com lógica.
4. Features recebem props; não leem `localStorage` direto (exceto via `storage/` chamado pelo hook).

## O que JÁ existe (implementado)

### Engine teórica

- Notas cromáticas, enharmônicos (C#/Db)
- Afinações: padrão + presets (Drop D, ½ tom, DADGAD, Open G, 7/8 cordas) e custom por corda
- Escalas: maior, menor natural/harmônica/melódica, pentas, blues
- Modos gregos: Ionian, Dorian, Phrygian, Lydian, Mixolydian, Aeolian, Locrian
- Matcher: cobertura exata + parcial, ranqueado por especificidade
- CAGED shapes (C/A/G/E/D) transpostos por root; roots recalculados por pitch
- Transposição de posições por semitom
- Anotações de técnica (linha, seta, slide, HO/PO, vibrato, harmônico)

### UI

- Tabs: Explorar · CAGED/Modos · Estudos · Imprimir
- Braço SVG com range de trastes configurável (0–24), 6–8 cordas, toggle canhoto
- Clique marca/desmarca notas (sem sequência numerada)
- Chip de contexto acima do braço; toolbar sticky; tabs com scroll no mobile
- Técnica no braço recolhida em `<details>` (menos clutter)
- Labels nota ↔ grau ↔ intervalo
- Overlay de escala/modo com root destacado; limpar escala também zera tônica
- CAGED: um shape, vários, ou todos (mín. 1 shape); filtrado pela escala selecionada
- Estudos com **vários braços** (`boards[]`): add/duplicar/remover, título por braço, braço ativo para edição
- Estudos: salvar/carregar/apagar (com confirmação) + feedback “Salvo” + export/import JSON
- Print: vista atual = braço ativo; adicionar estudo = um diagrama por braço
- Contador de transpose (`rootOffset`) como metadado; frets são absolutos na gravação

### Infra

- Path alias `@/`
- Prettier / EditorConfig / Oxlint
- Build com chunks (`react`) + gzip/brotli
- Stub de auth com `User` / `Study.userId` reservados
- Testes Vitest: matcher, caged, notes, annotations, transpose, fretboardUtils, storage/studies, studyBoards, buildMarks

## O que está PENDENTE

Prioridade sugerida (produto → depois polish).

Benchmark de editor gráfico: [Guitar Scientist](https://www.editor.guitarscientist.com/new) — canvas multi-braço, geradores ricos, layers, export imagem. **Não copiar o produto inteiro.** Nosso diferencial continua: descoberta inversa (notas → escalas) + estudos JSON + print pack. Priorizar o que fecha gap de braço/teoria sem virar editor genérico.

### P0 — Conta / sync (planejado como última fase)

- [ ] Login / senha reais (backend + UI)
- [ ] Sync remoto de estudos / print packs
- [ ] Manter export JSON e print como fluxo offline
- Stub atual: `src/storage/auth.ts` (lança erro se chamado)

### P1 — Teoria / braço (próximo lote)

Feito neste ciclo: afinações + custom, 6–8 cordas, range de trastes, canhoto.

1. [ ] Geradores de shapes: boxes CAGED + 3NPS (Berklee depois)
2. [ ] Escalas extras: modos de harm./melódica, diminuta, tons inteiros, exóticas comuns
3. [ ] Vista “box/posição” CAGED vs braço inteiro (atalhos além do range manual)
4. [ ] Destaque visual do grau característico do modo (ex.: #4 Lydian)
5. [ ] Estrutura manual por intervalos (ligar graus → pitch set) — opcional, após catálogo

### P1 — Acordes / arpejos (MVP novo)

- [ ] Catálogo básico: tríades + tétrades comuns (maj7, m7, 7, m7b5, dim7…)
- [ ] Overlay de acorde/arpejo no braço (root + voicing simples)
- [ ] Depois: inversões / filtro por conjunto de cordas (estilo GS “Show Chords”)

### P1 — Estudos / print

- [ ] Persistência dedicada de print packs na UI (tipos/storage já existem em parte)
- [ ] Controles de print: toggle anotações, labels, frets por página
- [ ] Notas de passagem no match (% já existe no parcial; UX pode melhorar)
- [ ] Export imagem do diagrama atual (PNG/SVG) — GS tem client + server-side; começar no browser
- [ ] Print: respeitar `firstFret` / `lastFret` / `leftHanded` do estudo na captura

### P2 — Áudio e prática

- [ ] Play on click / playback das notas e escala (Web Audio ou Tone.js)
- [ ] Metrônomo / backing track
- [ ] Detecção por microfone (highlight da nota tocada)

### P2 — Editor / polish (só se produto pedir; baixo ROI vs diferencial)

- [ ] Braço vertical
- [ ] Layers / cores / formatos de marcador (hoje: kinds fixos no CSS)
- [ ] Texto custom dentro da bolinha
- [ ] Desenho livre genérico (lápis/retângulos) — já temos anotações de técnica
- [ ] Text box / mídia no estudo (além de múltiplos braços)
- [ ] Embed YouTube no estudo
- [ ] Transpose com “preservar digitação” vs “preservar notas”
- [ ] Octaver / previous–next shape

### P2 — Distribuição

- [ ] PWA / install
- [ ] App mobile nativo (fora do escopo web)
- [ ] PDF server-side (hoje: print do browser)

### Débitos técnicos conhecidos

- [ ] CAGED shapes são aproximações pedagógicas — validar/refinar shapes com músico
- [ ] `rootOffset` é contador de sessão; pitch das marcas usa frets absolutos (`rootOffset=0` no cálculo)
- [ ] Faltam testes de UI/React (`useStudioState` / componentes) — hoje só theory/storage/buildMarks
- [ ] Warning ocasional oxlint em shadow de parâmetros anônimos no Fretboard (evitar `_` aninhado)
- [ ] Campo `Study.lick` é legado (import JSON antigo → vira `selectedNotes`); pode ser removido numa migração futura

## Contratos importantes

### Study (`src/types/study.ts`)

```ts
type StudyBoard = {
  id: string
  title?: string
  selectedNotes: NotePos[]
  overlays?: StudyOverlay[]
  annotations?: FretAnnotation[]
  firstFret?: number
  lastFret?: number
  cagedRoot?: NoteName
  cagedScaleId?: string | null
  cagedShapes?: CagedShapeId[]
  showAllCaged?: boolean
}

type Study = {
  id: string
  title: string
  createdAt: string
  updatedAt: string
  userId?: string | null
  tuning: NoteName[]
  rootOffset: number
  boards?: StudyBoard[] // preferido
  // campos flat (selectedNotes, overlays, …) = legado; normalizeStudyBoards()
  notesText?: string
  labelMode?: 'note' | 'degree' | 'interval'
  labelTonic?: NoteName
  leftHanded?: boolean
}
```

- String index `0` = corda grave (low E na afinação padrão).
- No display do braço, a corda aguda fica no topo; `leftHanded` espelha o eixo dos trastes.
- Afinação/canhoto/labels compartilhados; notas/overlay/range por braço.
- Migração: `src/storage/studyBoards.ts` → `normalizeStudyBoards`.

### Keys localStorage

- `guitartheory.studies.v1`
- `guitartheory.printPacks.v1`
- `guitartheory.user.v1` (auth stub)

## Convenções para mudanças

- Preferir TypeScript estrito; sem `any`.
- UI em PT-BR; ids de escala em inglês kebab (`minor-pentatonic`, `dorian`).
- Novas escalas: adicionar em `SCALE_CATALOG` + testes no matcher.
- Novos overlays: gerar `FretMark[]` via `theory/fretboardUtils` ou `app/buildMarks`.
- CSS: variáveis em `src/styles/app.css`; classes BEM-like (`.fretboard__mark--root`).
- Print: marcar UI de tela com `.no-print`.
- Não implementar auth real sem pedido explícito — só evoluir o stub quando for a fase.
- Não commitar `dist/` nem secrets.
- Antes de PR grande: `npm run check`.

## Comandos úteis

```bash
npm run dev
npm test
npm run build      # gera dist/ + .gz/.br
npm run check
```

## Referências de produto

Inspiração: GuitarFrets / Fretflip / visualizadores de braço. Diferencial local: descoberta inversa + estudos JSON + print pack multi-diagrama.
