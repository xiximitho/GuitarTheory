# AGENTS.md — GuitarTheory

Documentação para agentes de IA. Leia isto antes de alterar o código.

## Produto

App web de estudos de guitarra focado no **braço**:

- marcar notas e descobrir escalas/modos possíveis (descoberta inversa)
- CAGED + modos gregos
- desenhar licks (sequência numerada) e casar escalas
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
    transpose.ts       # mover posições / lick
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

- Notas cromáticas, enharmônicos (C#/Db), afinação padrão EADGBE
- Escalas: maior, menor natural/harmônica/melódica, pentas, blues
- Modos gregos: Ionian, Dorian, Phrygian, Lydian, Mixolydian, Aeolian, Locrian
- Matcher: cobertura exata + parcial, ranqueado por especificidade
- CAGED shapes (C/A/G/E/D) transpostos por root; roots recalculados por pitch
- Transposição de posições/lick por semitom

### UI

- Tabs: Explorar · CAGED/Modos · Licks · Estudos · Imprimir
- Braço SVG (15 trastes), clique para marcar/desmarcar
- Labels nota ↔ grau
- Overlay de escala/modo com root destacado
- CAGED: um shape, vários, ou todos; filtrado pela escala selecionada
- Lick: cliques em sequência com números; desfazer/limpar; match de escalas
- Estudos: salvar/carregar/apagar + export/import JSON
- Print: adicionar vista atual ou estudos, ordenar, preview, `window.print()`
- Contador de transpose (`rootOffset`) como metadado; frets são absolutos na gravação

### Infra

- Path alias `@/`
- Prettier / EditorConfig / Oxlint
- Build com chunks (`react`) + gzip/brotli
- Stub de auth com `User` / `Study.userId` reservados

## O que está PENDENTE

Prioridade sugerida (produto → depois polish):

### P0 — Conta / sync (planejado como última fase)

- [ ] Login / senha reais (backend + UI)
- [ ] Sync remoto de estudos / print packs
- [ ] Manter export JSON e print como fluxo offline
- Stub atual: `src/storage/auth.ts` (lança erro se chamado)

### P1 — Teoria / braço

- [ ] Afinações alternativas e custom
- [ ] 7 / 8 cordas
- [ ] Escalas extras: diminuta, tons inteiros, exóticas
- [ ] Toggle canhoto (espelhar braço)
- [ ] Vista “box/posição” CAGED vs braço inteiro
- [ ] Destaque visual do grau característico do modo (ex.: #4 Lydian)
- [ ] Labels de intervalo além de nota/grau

### P1 — Licks / estudos / print

- [ ] Persistência dedicada de print packs na UI (tipos/storage já existem em parte)
- [ ] Controles de print: toggle anotações, labels, frets por página
- [ ] Editar lick (inserir/remover no meio, reordenar)
- [ ] Notas de passagem no match (% já existe no parcial; UX pode melhorar)

### P2 — Áudio e prática

- [ ] Playback das notas / escala (Web Audio ou Tone.js)
- [ ] Metrônomo / backing track
- [ ] Detecção por microfone (highlight da nota tocada)

### P2 — Distribuição

- [ ] PWA / install
- [ ] App mobile nativo (fora do escopo web)
- [ ] PDF server-side (hoje: print do browser)

### Débitos técnicos conhecidos

- [ ] CAGED shapes são aproximações pedagógicas — validar/refinar shapes com músico
- [ ] `rootOffset` é contador de sessão; pitch das marcas usa frets absolutos (`rootOffset=0` no cálculo)
- [ ] Poucos testes: só matcher + caged; faltam testes de storage/transpose/UI
- [ ] `features/licks/` não é pasta própria — lick usa tab + `ExplorerPanel`
- [ ] Warning ocasional oxlint em shadow de parâmetros anônimos no Fretboard (evitar `_` aninhado)

## Contratos importantes

### Study (`src/types/study.ts`)

```ts
type Study = {
  id: string
  title: string
  createdAt: string
  updatedAt: string
  userId?: string | null // futuro sync
  tuning: NoteName[]
  rootOffset: number
  selectedNotes: { string: number; fret: number }[]
  lick?: { steps: { string: number; fret: number }[] }
  overlays?: { kind: 'scale' | 'caged' | 'mode'; id: string; root: NoteName }[]
  notesText?: string
  labelMode?: 'note' | 'degree'
}
```

- String index `0` = corda grave (low E) na afinação padrão.
- No display do braço, a corda aguda fica no topo.

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
