# Arquitetura

## Visão de Alto Nível

```
┌──────────────────────────────────────────────────────────┐
│                    Navegador (Browser)                    │
│                                                          │
│  ┌─────────────────────────────────────────────────────┐ │
│  │                    React UI Layer                    │ │
│  │   Pages / Components / Dialogs / Canvas (ReactFlow) │ │
│  └───────────────────────┬─────────────────────────────┘ │
│                          │ actions / reads                │
│  ┌───────────────────────▼─────────────────────────────┐ │
│  │              State Management Layer                  │ │
│  │   ChartDBContext · StorageContext · HistoryContext   │ │
│  │   CanvasContext · DialogContext · LayoutContext ...  │ │
│  └───────────────────────┬─────────────────────────────┘ │
│                          │ CRUD                           │
│  ┌───────────────────────▼─────────────────────────────┐ │
│  │               Persistence Layer                      │ │
│  │             Dexie.js (IndexedDB)                     │ │
│  └──────────────────────────────────────────────────────┘ │
│                                                          │
│  ┌──────────────────────────────────────────────────────┐ │
│  │               Domain & Data Layer                    │ │
│  │  Domain Models (Zod) · SQL Import · SQL Export       │ │
│  │  DBML · Metadata Import · Type Mappings              │ │
│  └──────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────┘
                              │
                     (opcional, IA)
                              │
                    ┌─────────▼──────────┐
                    │  OpenAI API / LLM  │
                    └────────────────────┘
```

---

## Camadas da Aplicação

### 1. UI Layer (`src/pages/`, `src/components/`, `src/dialogs/`)

Responsável apenas por renderização e captura de eventos do usuário. Não contém lógica de negócio.

- **Pages**: `EditorPage`, `TemplatesPage`, `ExamplesPage`, `NotFoundPage`
- **Components**: ~50 componentes reutilizáveis (botões, inputs, badges, tooltips, etc.), seguindo o padrão shadcn/ui com primitivos Radix UI
- **Dialogs**: 12+ modais (criação de diagrama, import, export SQL/imagem, schema de tabela, etc.)
- **Canvas**: Implementação React Flow para o diagrama interativo

### 2. State Management Layer (`src/context/`)

O ponto mais crítico da arquitetura. 16 Context Providers compõem o estado da aplicação. São montados em `src/pages/editor-page/editor-page.tsx`.

O principal é o **ChartDBContext** — funciona como a "máquina de estado" central. Quase toda operação do usuário passa por ele.

Veja detalhes em [Gerenciamento de Estado](./state-management.md).

### 3. Persistence Layer (`src/context/storage-context/`)

**Dexie.js** é um wrapper para IndexedDB. O `StorageContext` expõe uma API async para todas as operações de leitura/escrita no banco local.

Não existe backend — todos os dados ficam no navegador do usuário.

Veja detalhes em [Persistência (Storage)](./storage.md).

### 4. Domain & Data Layer (`src/lib/`)

```
src/lib/
├── domain/          # Modelos de dados com validação Zod
├── data/
│   ├── sql-import/  # Parsers SQL por dialeto
│   ├── sql-export/  # Geradores SQL por dialeto
│   ├── metadata-import/  # Conversão de metadados → modelos
│   └── data-types/  # Mapeamento de tipos por banco
└── dbml/            # Import/export DBML
```

---

## Fluxo de Dados Principal

### Operação típica (ex: renomear uma tabela)

```
1. Usuário edita o nome no canvas ou side panel
2. Componente chama useChartDB().updateTable(tableId, { name })
3. ChartDBContext.updateTable():
   a. Atualiza estado React in-memory
   b. Chama StorageContext.updateTable(tableId, { name })
   c. StorageContext persiste no Dexie/IndexedDB
   d. Emite evento 'update_table' via EventEmitter
4. HistoryContext registra a ação inversa (para undo)
5. Canvas (React Flow) re-renderiza com o novo estado
```

### Import de SQL

```
1. Usuário faz upload de arquivo SQL
2. ImportDatabaseDialog detecta o dialeto
3. Dialect-specific parser (ex: PostgreSQL parser) processa o SQL via node-sql-parser
4. Resultado SQLParserResult converte para domain models via metadata-import/
5. createTablesFromMetadata() gera objetos DBTable + DBRelationship
6. StorageContext persiste todas as tabelas e relacionamentos
7. ChartDBContext carrega o diagrama atualizado
8. Canvas reposiciona os nós automaticamente
```

### Export de SQL

```
1. Usuário abre ExportSQLDialog e escolhe dialeto alvo
2. exportBaseSQL(diagram, targetType) gera DDL determinístico
   - OU -
   exportSQL(diagram, targetType, { stream }) usa IA via OpenAI
3. SQL é exibido no Monaco Editor embutido
4. Usuário copia ou faz download
5. Resultado é cacheado no localStorage (chave = SHA256 do conteúdo)
```

---

## Composição de Providers

O `EditorPage` monta todos os providers na seguinte ordem (de fora para dentro):

```tsx
<StorageProvider>
  <ConfigProvider>
    <ThemeProvider>
      <ChartDBProvider>            ← estado central do diagrama
        <HistoryProvider>
          <LayoutProvider>
            <CanvasProvider>
              <DialogProvider>
                <AlertProvider>
                  <DiagramFilterProvider>
                    <ExportImageProvider>
                      {/* conteúdo da página */}
                    </ExportImageProvider>
                  </DiagramFilterProvider>
                </AlertProvider>
              </DialogProvider>
            </CanvasProvider>
          </LayoutProvider>
        </HistoryProvider>
      </ChartDBProvider>
    </ThemeProvider>
  </ConfigProvider>
</StorageProvider>
```

---

## Padrões de Design

### Acesso a Contextos via Hooks
Cada contexto tem um hook correspondente. Nunca use `useContext()` diretamente:

```typescript
// ✅ correto
const { tables, addTable } = useChartDB();
const { saveDiagram } = useStorage();

// ❌ evite
const ctx = useContext(ChartDBContext);
```

### Zod para Validação de Dados
Todos os modelos de domínio têm schemas Zod. Use-os ao importar dados externos:

```typescript
import { diagramSchema } from '@/lib/domain/diagram';
const parsed = diagramSchema.parse(rawData); // lança se inválido
```

### Alias de Paths
O alias `@/*` mapeia para `./src/*`. Use-o em todos os imports:

```typescript
import { DBTable } from '@/lib/domain/db-table';   // ✅
import { DBTable } from '../../lib/domain/db-table'; // ❌
```

---

## Arquivos Mais Importantes para Entender Primeiro

| Arquivo | Tamanho | Por quê é importante |
|---|---|---|
| [src/context/chartdb-context/chartdb-provider.tsx](../src/context/chartdb-context/chartdb-provider.tsx) | ~75KB | Máquina de estado central |
| [src/pages/editor-page/canvas/canvas.tsx](../src/pages/editor-page/canvas/canvas.tsx) | ~73KB | Canvas React Flow completo |
| [src/lib/data/sql-export/export-sql-script.ts](../src/lib/data/sql-export/export-sql-script.ts) | ~44KB | Geração de DDL multi-dialeto |
| [src/context/storage-context/storage-provider.tsx](../src/context/storage-context/storage-provider.tsx) | ~33KB | Operações Dexie/IndexedDB |
| [src/pages/editor-page/editor-page.tsx](../src/pages/editor-page/editor-page.tsx) | — | Composição de todos os providers |
