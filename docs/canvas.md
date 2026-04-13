# Canvas

O canvas é a área interativa central do ChartDB onde os diagramas são visualizados e editados. É implementado com **@xyflow/react** (React Flow) e vive em `src/pages/editor-page/canvas/`.

---

## Arquitetura do Canvas

```
canvas/
├── canvas.tsx                         # Componente principal (~73KB)
├── canvas-utils.ts                    # Utilitários (overlap, posicionamento)
├── area-node/                         # Nó de área
│   ├── area-node.tsx
│   └── area-node-context-menu.tsx
├── table-node/                        # Nó de tabela
│   ├── table-node.tsx
│   ├── table-node-field.tsx
│   └── table-node-context-menu.tsx
├── note-node/                         # Nó de nota
│   └── note-node.tsx
├── relationship-edge/                 # Aresta de relacionamento FK
│   └── relationship-edge.tsx
├── dependency-edge/                   # Aresta de dependência
│   └── dependency-edge.tsx
├── temp-floating-edge/                # Aresta temporária durante criação
│   └── temp-floating-edge.tsx
├── create-relationship-node/          # Nó temporário para criar FK
│   └── create-relationship-node.tsx
├── temp-cursor-node/                  # Cursor durante criação de conexão
│   └── temp-cursor-node.tsx
├── canvas-context-menu.tsx            # Menu de contexto do canvas (pan/zoom)
├── canvas-filter/                     # UI de filtro de visibilidade
│   └── canvas-filter.tsx
├── connection-line/                   # Linha visual durante drag de conexão
│   └── connection-line.tsx
└── marker-definitions.tsx             # SVG markers para ponteiras de arestas
```

---

## Tipos de Nós (Nodes)

### TableNode

O nó mais complexo — renderiza uma tabela completa com campos, índices e constraints.

**Comportamentos:**
- **Seleção**: Clique seleciona a tabela e abre o side panel direito
- **Edição inline**: Double-click entra em modo de edição (`editTableMode`)
- **Redimensionamento**: Arrastar as bordas altera `table.width`
- **Handles**: Cada campo tem handles source/target para criação de FKs
  - Source handle ID: `TABLE_RELATIONSHIP_SOURCE_HANDLE_ID_PREFIX + fieldId`
  - Target handle ID: `TABLE_RELATIONSHIP_TARGET_HANDLE_ID_PREFIX + fieldId`
- **Colapso**: Tabelas com mais de `TABLE_MINIMIZED_FIELDS (10)` campos são colapsáveis
- **Colorização**: Header colorido via `table.color`
- **Posicionamento**: Coordenadas `table.x`, `table.y` sincronizadas com React Flow

**Contexto do nó:**
```typescript
interface TableNodeData {
  table: DBTable;
  filteredFields?: DBField[];  // campos visíveis após filtro
}
```

### AreaNode

Container visual para agrupar tabelas relacionadas.

**Comportamentos:**
- Arrastar a área move todas as tabelas filhas juntas
- Botão de adição de tabelas à área
- Context menu: renomear, mudar cor, deletar, reordenar
- Tabelas dentro de uma área têm `table.parentAreaId` definido

**Context menu options:**
- Edit area (renomear)
- Move up/down (reordenar z-index)
- Add tables to area
- Delete area

### NoteNode

Anotação de texto livre.

**Comportamentos:**
- Edição de texto inline via textarea
- Redimensionável
- Cor de fundo customizável
- Sem handles (não participa de relacionamentos)

### Nós Temporários

- **`TempCursorNode`**: Exibido na posição do cursor durante criação de conexão
- **`CreateRelationshipNode`**: Nó intermediário que aparece quando o usuário inicia o drag de um handle e ainda não conectou ao destino

---

## Tipos de Arestas (Edges)

### RelationshipEdge

Representa uma foreign key. Renderiza a notação visual do relacionamento.

**Visual:**
- Notação crow's foot para cardinalidade `many`
- Linha simples para cardinalidade `one`
- Label com nome do relacionamento (quando presente)
- Popover de edição ao clicar na aresta

**Data:**
```typescript
interface RelationshipEdgeData {
  relationship: DBRelationship;
}
```

### DependencyEdge

Representa dependências entre tabelas (ex: view → tabela base). Linha tracejada sem handles editáveis.

### TempFloatingEdge

Aresta temporária exibida durante a criação interativa de um relacionamento. É descartada quando a conexão é confirmada ou cancelada.

---

## Context Menu do Canvas

Acessado com clique direito no fundo do canvas (não sobre um nó):

- **Add table** — cria nova tabela na posição do cursor
- **Add area** — cria nova área
- **Add note** — cria nova nota
- **Paste** — cola entidades copiadas
- **Select all** — seleciona todos os nós
- **Fit view** — ajusta zoom para mostrar todo o diagrama
- **Auto-arrange** — reorganiza automaticamente as tabelas sem sobreposição

---

## Detecção de Sobreposição

`canvas-utils.ts` implementa um **grafo de sobreposição** (overlap graph) para detectar colisões entre nós de tabela.

```typescript
// Atualizado pelo CanvasContext após cada mudança de posição
overlapGraph: Map<string, Set<string>>
// key = tableId, value = set de tableIds que se sobrepõem a ela
```

Usado pelo auto-arrange para reposicionar tabelas sem colisão.

---

## Filtro de Visibilidade

O `DiagramFilterContext` + `canvas-filter/` permite ocultar tabelas/schemas específicos do canvas sem removê-los do diagrama.

**Interface:**
- Dropdown no toolbar do canvas
- Checkboxes por schema ou por tabela individual
- Filtro é persistido no Dexie (tabela `diagram_filters`)

---

## Criação de Relacionamentos

Fluxo de criação interativa de FK:

1. Usuário passa o mouse sobre um campo de tabela → handle aparece
2. Usuário arrasta o handle → `TempFloatingEdge` aparece
3. `CreateRelationshipNode` / `TempCursorNode` guiam visualmente
4. Usuário solta sobre o campo destino
5. `CreateRelationshipDialog` abre para confirmar nome e cardinalidade
6. `useChartDB().addRelationship()` persiste

---

## Context Menus de Tabela

Acessado com clique direito sobre um `TableNode`:

- **Edit table** — abre TableSchemaDialog
- **Add field** — adiciona campo vazio
- **Copy table** — copia para clipboard interno
- **Duplicate table** — cria cópia
- **Move to area** — move a tabela para uma área existente
- **Auto-arrange area** — reorganiza tabelas dentro de uma área
- **Delete table** — remove tabela e seus relacionamentos

---

## Sincronização Canvas ↔ Estado

React Flow e ChartDBContext são mantidos sincronizados:

```
Drag de nó no canvas
        ↓
onNodesChange (React Flow callback)
        ↓
updateTable(id, { x: newX, y: newY })   ← debounced
        ↓
StorageContext persiste posição
```

A sincronização é **debounced** para evitar escrita excessiva no Dexie durante drag.
