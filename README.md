# GuitarTheory

Web app de estudos de guitarra: braço interativo, descoberta de escalas/modos, CAGED e impressão de vários diagramas.

Documentação para agentes de IA: [AGENTS.md](./AGENTS.md) (o que existe, pendências, camadas e convenções). Regras Cursor em [`.cursor/rules/`](./.cursor/rules/).

## Rodar

```bash
npm install
npm run dev
```

## Scripts

| Script              | Descrição                                |
| ------------------- | ---------------------------------------- |
| `npm run dev`       | Desenvolvimento                          |
| `npm run build`     | Build + gzip/brotli dos estáticos        |
| `npm run preview`   | Preview do build                         |
| `npm test`          | Testes da engine teórica                 |
| `npm run lint`      | Oxlint                                   |
| `npm run format`    | Prettier                                 |
| `npm run typecheck` | TypeScript                               |
| `npm run check`     | typecheck + lint + format + test + build |

## Estrutura

```text
src/
  app/           # shell da aplicação e estado do estúdio
  components/    # UI reutilizável (Fretboard)
  features/      # painéis por domínio (explorer, caged, studies, print)
  theory/        # engine pura (notas, escalas, matcher, CAGED)
  storage/       # localStorage, JSON, stub de auth
  types/         # contratos compartilhados
  styles/        # CSS global e fontes self-hosted
```

Alias de importação: `@/*` → `src/*`.

## Build e compressão

O Vite gera assets minificados e, via `vite-plugin-compression`, arquivos `.gz` e `.br` para JS/CSS/HTML/fontes (≥1 KB). Sirva os pré-comprimidos no CDN/nginx com `Content-Encoding`.

## Persistência

Estudos ficam em `localStorage`, com export/import JSON. Login/sync ficam para depois (`src/storage/auth.ts`).
