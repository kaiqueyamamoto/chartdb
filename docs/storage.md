# Persistência (Storage)

## Visão Geral

Todo o armazenamento de dados é **local no navegador** usando **IndexedDB** através do **Dexie.js 4.0**. Não existe backend ou servidor de persistência. Os dados ficam no dispositivo do usuário.

**Arquivo principal:** `src/context/storage-context/storage-provider.tsx` (~33KB)

---

## Schema do Banco (Dexie)

**Nome do banco:** `ChartDB`  
**Versão atual:** `13`

### Tabelas

#### `diagrams`
```
id          (primary key)
name
databaseType
databaseEdition
createdAt
updatedAt
```

#### `db_tables`
```
id          (primary key)
diagramId   (foreign key → diagrams.id)
name
schema
x, y        (posição no canvas)
fields      (JSON array de DBField)
indexes     (JSON array de DBIndex)
color
isView
isMaterializedView
order
comment
width
createdAt
```

#### `db_relationships`
```
id              (primary key)
diagramId
name
sourceSchema
sourceTableId
sourceFieldId
sourceCardinality
targetSchema
targetTableId
targetFieldId
targetCardinality
createdAt
```

#### `db_dependencies`
```
id
diagramId
schema
tableId
dependentSchema
dependentTableId
createdAt
```

#### `areas`
```
id
diagramId
name
x, y
width, height
color
order
```

#### `db_custom_types`
```
id
diagramId
schema
name
kind        (enum | composite)
values      (JSON array — para enums)
fields      (JSON array — para composites)
order
```

#### `notes`
```
id
diagramId
content
x, y
width, height
color
order
```

#### `config`
```
id              (sempre = 1, singleton)
defaultDiagramId
exportActions
```

#### `diagram_filters`
```
diagramId       (primary key)
tableIds        (JSON array)
schemasIds      (JSON array)
```

---

## API do StorageContext

```typescript
const {
  // Diagramas
  listDiagrams,
  getDiagram,
  addDiagram,
  updateDiagram,
  deleteDiagram,
  exportDiagramAsJSON,

  // Tabelas
  addTable,
  addTables,
  getTable,
  updateTable,
  deleteTables,

  // Relacionamentos
  addRelationship,
  addRelationships,
  updateRelationship,
  deleteRelationships,

  // Áreas
  addArea,
  updateArea,
  deleteArea,

  // Notas
  addNote,
  updateNote,
  deleteNote,

  // Custom Types
  addCustomType,
  updateCustomType,
  deleteCustomType,

  // Dependências
  addDependency,
  addDependencies,
  deleteDependencies,

  // Config
  getConfig,
  updateConfig,

  // Filtros
  getDiagramFilter,
  updateDiagramFilter,
} = useStorage();
```

Todas as funções são assíncronas (`Promise<T>`).

---

## Histórico de Migrações

O Dexie usa um sistema de versões com funções de `upgrade()` para migrar dados existentes:

| Versão | Mudança |
|---|---|
| v1 | Schema inicial |
| v2 | Converte `field.type` de `string` para `{ id, name }` |
| v3 | Adiciona `databaseEdition` em `diagrams` |
| v4 | Adiciona campo `comment` em `db_tables` |
| v5 | Adiciona campos `schema` em tabelas e relacionamentos |
| v6 | Adiciona `sourceCardinality`, `targetCardinality` em relacionamentos; remove campo `type` |
| v7 | Cria tabela `db_dependencies` |
| v8 | Adiciona `isView`, `isMaterializedView`, `order` em `db_tables` |
| v9 | Normaliza `field.nullable` para booleano (era string em alguns casos) |
| v10 | Cria tabela `areas` |
| v11 | Cria tabela `db_custom_types` |
| v12 | Cria tabela `diagram_filters`; limpa `config` |
| v13 | Cria tabela `notes` |

As migrações são executadas automaticamente ao abrir o navegador em uma versão mais nova da aplicação.

---

## Import/Export de Diagrama como JSON

O diagrama completo pode ser exportado como JSON e re-importado:

```typescript
// Export
const json = await exportDiagramAsJSON(diagramId);
// json contém o Diagram serializado com todos os relacionamentos, áreas, etc.

// Import (via ImportDiagramDialog)
// O JSON é validado contra o diagramSchema do Zod antes de ser salvo
```

O JSON de export inclui versão do schema para compatibilidade futura.

---

## Considerações de Performance

- **Batch operations**: Use `addTables(tables[])` em vez de múltiplos `addTable()` — a operação batch usa uma única transação Dexie
- **`fields` e `indexes` são JSON**: Campos e índices são serializados como JSON dentro do registro de `db_tables` (não são tabelas separadas), o que simplifica queries mas limita filtros avançados
- **Dexie transactions**: Operações relacionadas são agrupadas em transações quando possível para garantir consistência
