# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev           # Start Vite dev server
npm run build         # Lint + tsc + Vite build
npm run lint          # ESLint (zero warnings allowed)
npm run lint:fix      # Auto-fix lint issues
npm run test          # Vitest in watch mode
npm run test:ci       # Vitest single-run, bail on first failure
npm run test:ui       # Vitest UI dashboard
npm run test:coverage # Coverage report
npm run preview       # Preview production build
```

**Run a single test file:**
```bash
npm run test -- src/lib/domain/__tests__/some-test.test.ts
npm run test -- --grep "test name pattern"
```

TypeScript path alias: `@/*` maps to `./src/*`.

## Architecture

**ChartDB** is a browser-based database schema diagramming editor. Users can visually design schemas, import SQL/metadata, and export DDL for multiple database dialects. All data is persisted locally via IndexedDB (Dexie.js) — there is no backend.

### State Management: React Context Stack

The app composes ~16 React Context providers in `src/pages/editor-page/editor-page.tsx`. The most important:

- **`ChartDBContext`** (`src/context/chartdb-context/`) — Core diagram state: tables, fields, indexes, relationships, notes, areas. The provider (`chartdb-provider.tsx`, ~75KB) is the central state machine. Nearly all user operations funnel through its actions.
- **`StorageContext`** (`src/context/storage-context/`) — Dexie.js (IndexedDB) operations. All persistence goes through here. Async Promise-based API.
- **`HistoryContext`** — Undo/redo stack wrapping ChartDBContext mutations.
- Other contexts: `ThemeContext`, `LayoutContext`, `ConfigContext`, `DialogContext`, `CanvasContext`, etc.

Custom hooks in `src/hooks/` provide typed access to each context (e.g., `useChartDB()`, `useStorage()`).

### Domain Models (`src/lib/domain/`)

Core data types validated with **Zod**:
- `DBTable` — table with fields, indexes, constraints, canvas position
- `DBField` — column with type, nullable, pk, default, etc.
- `DBRelationship` — foreign key edge between two table fields
- `DBSchema` — logical grouping (Postgres schemas, MySQL databases)
- `Diagram` — top-level container: tables + relationships + areas + notes

### Canvas (`src/pages/editor-page/canvas/`)

Built on **@xyflow/react** (React Flow). Tables render as custom nodes; foreign key relationships as custom edges. The canvas file (`canvas.tsx`, ~73KB) handles layout, drag-and-drop, edge creation, and context menus including move-to-area and auto-arrange.

### SQL Import/Export (`src/lib/data/`)

- **Import** (`sql-import/`): Dialect-specific parsers using `node-sql-parser`. Converts parsed SQL → `DBTable` models via `metadata-import/` utilities.
- **Export** (`sql-export/export-sql-script.ts`, ~44KB): Generates DDL from the current diagram across dialects (MySQL, PostgreSQL, SQLite, SQL Server, MariaDB, Oracle, etc.).
- **AI export**: Uses the Vercel AI SDK + OpenAI to convert schemas between dialects when direct translation is ambiguous.
- **DBML** (`src/lib/dbml/`): DBML format import/export via `@dbml/core`.

### UI

- Components in `src/components/` follow **shadcn/ui** patterns built on **Radix UI** primitives styled with **Tailwind CSS**.
- Dialogs live in `src/dialogs/` (12+ modals for import, export, rename, etc.).
- Editor layout: left sidebar (`editor-sidebar/`) for diagram nav, right side panel (`side-panel/`) for table/field editing, top navbar (`top-navbar/`) for file ops.
- Internationalization via **react-i18next**; locale files in `src/i18n/locales/`.

### Data Flow (typical operation)

1. User action → dialog or canvas interaction
2. Calls action on `ChartDBContext` (e.g., `addTable`, `updateField`)
3. Context action mutates in-memory state and calls `StorageContext` to persist to Dexie
4. `HistoryContext` records the inverse action for undo
5. React Flow canvas re-renders from updated context state

## Testing

- Framework: **Vitest** + **happy-dom** + **@testing-library/react**
- Setup file: `src/test/setup.ts`
- Test files: `__tests__/` directories co-located with source, or `*.test.ts` / `*.spec.ts`
- CI: runs `test:ci` (bail on first failure) plus `lint` and `build`

## Environment Variables

| Variable | Purpose |
|---|---|
| `VITE_OPENAI_API_KEY` | OpenAI key for AI-powered SQL migration |
| `VITE_OPENAI_API_ENDPOINT` | Custom LLM endpoint override |
| `VITE_LLM_MODEL_NAME` | Custom model name override |
| `VITE_DISABLE_ANALYTICS` | Disable Fathom Analytics |
