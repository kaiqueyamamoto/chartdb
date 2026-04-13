# Modelos de Domínio

Todos os modelos vivem em `src/lib/domain/` e são validados com **Zod**. Todo dado que entra de fontes externas (import SQL, import JSON) deve ser validado contra esses schemas.

---

## Diagram

Contêiner raiz. Cada diagrama salvo no Dexie corresponde a um `Diagram`.

```typescript
interface Diagram {
  id: string;
  name: string;
  databaseType: DatabaseType;
  databaseEdition?: DatabaseEdition;
  tables: DBTable[];
  relationships: DBRelationship[];
  dependencies: DBDependency[];
  areas: Area[];
  customTypes: DBCustomType[];
  notes: Note[];
  createdAt: Date;
  updatedAt: Date;
}
```

**`DatabaseType`** (enum):
```
GENERIC | POSTGRESQL | MYSQL | SQL_SERVER | MARIADB | SQLITE | CLICKHOUSE | COCKROACHDB | ORACLE
```

**`DatabaseEdition`** (enum — bancos com variantes):
```
POSTGRESQL_SUPABASE | POSTGRESQL_TIMESCALE
MYSQL_5_7
SQL_SERVER_2016_AND_BELOW
SQLITE_CLOUDFLARE_D1
```

---

## DBTable

Representa uma tabela (ou view/materialized view) no banco de dados.

```typescript
interface DBTable {
  id: string;
  name: string;
  schema?: string;           // ex: "public", "dbo"
  x: number;                 // posição no canvas
  y: number;
  width?: number;            // largura customizada do nó
  fields: DBField[];
  indexes: DBIndex[];
  checkConstraints: DBCheckConstraint[];
  color?: string;            // cor de destaque
  isView?: boolean;
  isMaterializedView?: boolean;
  comments?: string;         // comentário da tabela
  order?: number;            // ordenação no sidebar
  expanded?: boolean;        // estado de expansão no canvas
  parentAreaId?: string;     // área pai no canvas
  createdAt: Date;
}
```

**Constantes de dimensão:**
- `MIN_TABLE_SIZE = 224px`
- `MID_TABLE_SIZE = 337px`
- `MAX_TABLE_SIZE = 450px`
- `TABLE_MINIMIZED_FIELDS = 10` — número de campos visíveis quando colapsado

---

## DBField

Representa uma coluna de uma tabela.

```typescript
interface DBField {
  id: string;
  name: string;
  type: DataType;            // { id: string, name: string }
  primaryKey?: boolean;
  unique?: boolean;
  nullable?: boolean;
  increment?: boolean;       // AUTO_INCREMENT / SERIAL
  isArray?: boolean;         // ex: text[] no PostgreSQL
  characterMaximumLength?: string;
  precision?: number;
  scale?: number;
  default?: string;
  collation?: string;
  comments?: string;
  check?: string;            // check constraint inline
  createdAt: Date;
}
```

**`DataType`**: `{ id: string; name: string }` — mapeado por dialeto em `src/lib/data/data-types/`.

---

## DBIndex

Representa um índice em uma tabela.

```typescript
interface DBIndex {
  id: string;
  name?: string;
  unique?: boolean;
  fieldIds: string[];        // IDs dos campos que compõem o índice
  type?: IndexType;
  isPrimaryKey?: boolean;
  comments?: string;
  createdAt: Date;
}
```

**`IndexType`** (suporte varia por banco):
```
btree | hash | gist | gin | spgist | brin  // PostgreSQL/CockroachDB
nonclustered | clustered                    // SQL Server
xml | fulltext | spatial                    // MySQL/MariaDB
```

---

## DBCheckConstraint

```typescript
interface DBCheckConstraint {
  id: string;
  expression: string;   // ex: "age > 0"
  createdAt: Date;
}
```

---

## DBRelationship

Representa uma foreign key entre dois campos de tabelas diferentes.

```typescript
interface DBRelationship {
  id: string;
  name?: string;
  sourceSchema?: string;
  sourceTableId: string;
  sourceFieldId: string;
  sourceCardinality: Cardinality;
  targetSchema?: string;
  targetTableId: string;
  targetFieldId: string;
  targetCardinality: Cardinality;
  createdAt: Date;
}
```

**`Cardinality`**: `'one' | 'many'`

**Tipos resultantes:**

| sourceCardinality | targetCardinality | Tipo |
|---|---|---|
| `one` | `one` | one_to_one |
| `one` | `many` | one_to_many |
| `many` | `one` | many_to_one |
| `many` | `many` | many_to_many |

---

## DBDependency

Representa dependência entre tabelas (ex: uma view que depende de uma tabela base).

```typescript
interface DBDependency {
  id: string;
  schema?: string;
  tableId: string;
  dependentSchema?: string;
  dependentTableId: string;
  createdAt: Date;
}
```

---

## DBCustomType

Tipos customizados de banco de dados (PostgreSQL `CREATE TYPE`).

```typescript
interface DBCustomType {
  id: string;
  schema?: string;
  name: string;
  kind: DBCustomTypeKind;    // 'enum' | 'composite'
  values?: string[];         // para enums
  fields?: DBCustomTypeField[]; // para tipos compostos
  order?: number;
  createdAt: Date;
}

interface DBCustomTypeField {
  name: string;
  type: DataType;
}
```

---

## Area

Container visual no canvas para agrupar tabelas relacionadas.

```typescript
interface Area {
  id: string;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  color?: string;
  order?: number;
}
```

---

## Note

Anotação de texto livre no canvas.

```typescript
interface Note {
  id: string;
  content: string;
  x: number;
  y: number;
  width: number;
  height: number;
  color?: string;
  order?: number;
}
```

---

## DiagramFilter

Filtro de visibilidade aplicado ao canvas.

```typescript
type DiagramFilter =
  | { schemaIds: string[] }
  | { tableIds: string[] }
  | { schemaIds: string[]; tableIds: string[] }
  | Record<string, never>;  // sem filtro
```

Funções utilitárias:
- `reduceFilter(filter)` — consolida filtros
- `spreadFilterTables(filter, tables)` — expande o filtro em lista de IDs visíveis

---

## Hierarquia de Tipos

```
Diagram
├── DBTable[]
│   ├── DBField[]
│   ├── DBIndex[]
│   └── DBCheckConstraint[]
├── DBRelationship[]
├── DBDependency[]
├── Area[]
├── DBCustomType[]
└── Note[]
```
