# Gerenciamento de Estado

O ChartDB usa **16 React Context Providers** compostos no `EditorPage`. Cada contexto tem um hook dedicado em `src/hooks/` — use sempre o hook, nunca `useContext()` diretamente.

---

## ChartDBContext ⭐

**Arquivo:** `src/context/chartdb-context/`  
**Hook:** `useChartDB()`  
**Tamanho:** ~75KB — é o coração da aplicação

Gerencia todo o estado do diagrama em memória: tabelas, campos, índices, relacionamentos, áreas, notas, tipos customizados e dependências.

### Estado exposto

```typescript
{
  // Diagrama
  diagramId: string;
  diagramName: string;
  databaseType: DatabaseType;
  databaseEdition?: DatabaseEdition;

  // Entidades
  tables: DBTable[];
  relationships: DBRelationship[];
  schemas: DBSchema[];
  areas: Area[];
  notes: Note[];
  customTypes: DBCustomType[];
  dependencies: DBDependency[];

  // Metadados
  currentDiagram: Diagram;
}
```

### Principais ações

**Diagrama:**
- `loadDiagram(diagramId)` — carrega do storage
- `updateDiagramId(id)` / `updateDiagramName(name)` / `updateDatabaseType(type)`
- `clearDiagramData()` — limpa estado sem deletar do storage

**Tabelas:**
- `addTable(table)` / `addTables(tables[])`
- `removeTable(tableId)` / `removeTables(tableIds[])`
- `updateTable(tableId, attrs)` / `updateTablesState(tables[])`

**Campos:**
- `addField(tableId, field)` / `addFields(tableId, fields[])`
- `removeField(tableId, fieldId)` / `removeFields(tableId, fieldIds[])`
- `updateField(tableId, fieldId, attrs)`

**Índices:**
- `addIndex(tableId, index)` / `removeIndex(tableId, indexId)` / `updateIndex(tableId, indexId, attrs)`

**Relacionamentos:**
- `addRelationship(rel)` / `addRelationships(rels[])`
- `removeRelationship(relId)` / `removeRelationships(relIds[])`
- `updateRelationship(relId, attrs)`

**Áreas:**
- `addArea(area)` / `removeArea(areaId)` / `updateArea(areaId, attrs)`

**Notas:**
- `addNote(note)` / `removeNote(noteId)` / `updateNote(noteId, attrs)`

**Tipos Customizados:**
- `addCustomType(type)` / `removeCustomType(typeId)` / `updateCustomType(typeId, attrs)`

### Eventos (EventEmitter)

O `ChartDBContext` emite eventos que outros subsistemas podem escutar:

```typescript
type ChartDBEvent =
  | 'add_tables'
  | 'update_table'
  | 'remove_tables'
  | 'add_field'
  | 'remove_field'
  | 'load_diagram';
```

---

## StorageContext

**Arquivo:** `src/context/storage-context/`  
**Hook:** `useStorage()`  
**Tamanho:** ~33KB

Encapsula todas as operações no Dexie/IndexedDB. API completamente assíncrona (Promise-based).

### Principais métodos

```typescript
// Diagramas
listDiagrams(): Promise<Diagram[]>
getDiagram(id): Promise<Diagram | undefined>
addDiagram(diagram): Promise<void>
updateDiagram(id, attrs): Promise<void>
deleteDiagram(id): Promise<void>

// Tabelas
addTable(diagramId, table): Promise<void>
addTables(diagramId, tables[]): Promise<void>
getTable(diagramId, tableId): Promise<DBTable | undefined>
updateTable(diagramId, tableId, attrs): Promise<void>
deleteTables(diagramId, tableIds[]): Promise<void>

// Relacionamentos
addRelationship(diagramId, rel): Promise<void>
updateRelationship(diagramId, relId, attrs): Promise<void>
deleteRelationships(diagramId, relIds[]): Promise<void>

// Áreas, Notas, CustomTypes, Dependencies — mesmo padrão
```

---

## HistoryContext

**Hook:** `useHistory()`

Gerencia a pilha de undo/redo. Não armazena o estado completo — armazena pares de ações (fazer/desfazer) usando o EventEmitter do ChartDBContext.

```typescript
{
  undo(): void;
  redo(): void;
  canUndo: boolean;
  canRedo: boolean;
}
```

---

## CanvasContext

**Hook:** `useCanvas()`

Estado específico do canvas React Flow.

```typescript
{
  // Modo de edição inline
  editTableMode: boolean;
  setEditTableMode(v: boolean): void;
  selectedTableId?: string;
  
  // Floating edge (ao criar relacionamentos)
  floatingEdgeData?: FloatingEdgeData;
  setFloatingEdgeData(data): void;

  // Hover states
  hoveredTableId?: string;
  hoveredRelationshipId?: string;
  
  // Overlap detection
  overlapGraph: OverlapGraph;
  updateOverlapGraph(): void;
}
```

---

## DialogContext

**Hook:** `useDialog()`

Controla abertura e fechamento de todos os dialogs modais da aplicação.

```typescript
{
  openCreateDiagramDialog(): void;
  openOpenDiagramDialog(): void;
  openExportSQLDialog(targetDatabaseType?): void;
  openExportImageDialog(): void;
  openExportDiagramDialog(): void;
  openImportDiagramDialog(): void;
  openImportDatabaseDialog(options?): void;
  openTableSchemaDialog(tableId): void;
  openCreateRelationshipDialog(sourceId, targetId): void;
  closeAllDialogs(): void;

  // Estado atual
  activeDialog?: DialogType;
  dialogParams?: Record<string, unknown>;
}
```

---

## LayoutContext

**Hook:** `useLayout()`

Estado da interface: sidebar esquerdo, painel direito, itens expandidos.

```typescript
{
  // Sidebar esquerdo
  openedItems: {
    tables: boolean;
    relationships: boolean;
    areas: boolean;
    notes: boolean;
    customTypes: boolean;
  };
  toggleItem(section: SidebarSection): void;
  selectedSidebarSection: SidebarSection;
  setSelectedSidebarSection(section): void;

  // Side panel direito
  isSidePanelOpen: boolean;
  openSidePanel(): void;
  closeSidePanel(): void;
}
```

---

## ThemeContext

**Hook:** `useTheme()`

```typescript
{
  theme: 'light' | 'dark' | 'system';
  effectiveTheme: 'light' | 'dark';  // resolvido
  setTheme(theme): void;
}
```

---

## ConfigContext

**Hook:** `useConfig()`

Configuração global da aplicação, persistida no Dexie (tabela `config`, id = 1).

```typescript
interface ChartDBConfig {
  defaultDiagramId?: string;   // diagrama aberto por padrão
  exportActions?: ExportAction[];
}
```

---

## AlertContext

**Hook:** `useAlert()`

Dialogs de confirmação genéricos.

```typescript
{
  showAlert(props: BaseAlertDialogProps): void;
  closeAlert(): void;
}
```

---

## DiagramFilterContext

**Hook:** `useDiagramFilter()`

```typescript
{
  filter: DiagramFilter;
  setFilter(filter): void;
  clearFilter(): void;
  isTableFiltered(tableId): boolean;
}
```

---

## Outros Contexts

| Context | Hook | Responsabilidade |
|---|---|---|
| `LocalConfigContext` | `useLocalConfig()` | Config por diagrama (local browser) |
| `ExportImageContext` | `useExportImage()` | Parâmetros de export de imagem |
| `FullScreenSpinnerContext` | `useFullScreenSpinner()` | Loading overlay global |
| `DiffContext` | `useDiff()` | Comparação entre dois diagramas |

---

## Hooks Utilitários

Além dos hooks de contexto, `src/hooks/` contém:

| Hook | Descrição |
|---|---|
| `useBreakpoint()` | Detecção de breakpoint responsivo |
| `useDebounce(value, delay)` | Debounce de valores |
| `useDebounceSmoothly(value, delay)` | Debounce suave (para posicionamento no canvas) |
| `useMobile()` | Detecta dispositivo móvel |
| `useRedoUndoStack()` | Gerencia pilha undo/redo |
| `useUpdateTable(tableId)` | Wrapper para atualizar tabela específica |
| `useUpdateTableField(tableId, fieldId)` | Wrapper para atualizar campo específico |
| `useExportDiagram()` | Export com seleção de formato |
| `useFocusOn(selector)` | Foca elemento DOM |
