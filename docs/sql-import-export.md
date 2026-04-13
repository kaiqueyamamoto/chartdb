# Import / Export SQL

## Visão Geral

O ChartDB suporta importação de SQL (DDL) e exportação de SQL para múltiplos dialetos. O pipeline de import transforma DDL textual em modelos de domínio (`DBTable`, `DBRelationship`, etc). O pipeline de export faz o caminho inverso.

```
src/lib/data/
├── sql-import/           # Parsers por dialeto
│   ├── mysql/
│   ├── postgresql/
│   ├── sqlite/
│   ├── sqlserver/
│   └── oracle/
├── sql-export/           # Geradores SQL por dialeto
│   └── export-sql-script.ts  (~44KB)
├── metadata-import/      # Conversão metadados JSON → domain models
│   └── metadata-to-table.ts
└── data-types/           # Mapeamento de tipos por banco
```

---

## Import de SQL

### Interfaces Comuns

Todos os parsers produzem um `SQLParserResult`:

```typescript
interface SQLParserResult {
  tables: SQLTable[];
  relationships: SQLForeignKey[];
  types: SQLCustomType[];      // enums, composite types (PostgreSQL)
  enums: SQLEnumType[];
  warnings: string[];          // avisos de parsing não-fatal
}
```

**`SQLTable`:**
```typescript
interface SQLTable {
  id: string;
  name: string;
  schema?: string;
  columns: SQLColumn[];
  indexes: SQLIndex[];
  checkConstraints: SQLCheckConstraint[];
  comment?: string;
  order?: number;
  isView?: boolean;
}
```

**`SQLColumn`:**
```typescript
interface SQLColumn {
  name: string;
  type: string;           // nome do tipo bruto (ex: "varchar", "int4")
  nullable?: boolean;
  primaryKey?: boolean;
  unique?: boolean;
  typeArgs?: string;      // ex: "(255)" para varchar(255)
  comment?: string;
  default?: string;
  increment?: boolean;    // AUTO_INCREMENT / SERIAL
}
```

**`SQLForeignKey`:**
```typescript
interface SQLForeignKey {
  name?: string;
  sourceTable: string;
  sourceSchema?: string;
  sourceColumn: string;
  targetTable: string;
  targetSchema?: string;
  targetColumn: string;
  sourceTableId: string;
  targetTableId: string;
  sourceCardinality: Cardinality;
  targetCardinality: Cardinality;
  updateAction?: string;  // CASCADE, SET NULL, etc.
  deleteAction?: string;
}
```

### Pipeline de Import

```
1. SQL textual (arquivo ou textarea)
           ↓
2. Dialect-specific parser (node-sql-parser)
           ↓
3. SQLParserResult (estrutura normalizada)
           ↓
4. createTablesFromMetadata() — src/lib/data/metadata-import/
           ↓
5. DBTable[] + DBRelationship[] (domain models)
           ↓
6. StorageContext.addTables() + addRelationships()
           ↓
7. ChartDBContext.loadDiagram() — estado in-memory atualizado
           ↓
8. Canvas re-renderiza com auto-layout
```

### Particularidades por Dialeto

**PostgreSQL:**
- Suporta schemas (`public.users`, `auth.sessions`)
- Array types (`text[]`, `integer[]`)
- Tipos customizados (`CREATE TYPE mood AS ENUM (...)`)
- Materialized views
- Operadores JSON (`->`, `->>`) no parsing

**MySQL / MariaDB:**
- AUTO_INCREMENT
- Backtick escaping (\`table_name\`)
- Engine hints (InnoDB, MyISAM) ignorados no import

**SQL Server:**
- Schemas (`dbo.TableName`)
- `IDENTITY(1,1)` equivalente ao AUTO_INCREMENT
- `[bracket]` escaping

**SQLite:**
- Sem schemas
- Tipos de coluna são sugestivos (type affinity)
- CloudFlare D1 edition suportada

**Oracle:**
- Stored procedures parcialmente ignoradas
- Sequences detectadas e mapeadas para INCREMENT

### Validações de Import

- `validateArrayTypesForDatabase()` — garante que tipos array só sejam aceitos em bancos que os suportam (PostgreSQL, CockroachDB)
- Check constraints são validadas contra a lista de campos da tabela
- Warnings são acumulados e exibidos ao usuário após o import

---

## Export de SQL

O export é centralizado em `src/lib/data/sql-export/export-sql-script.ts` (~44KB).

### Dois Modos de Export

#### 1. Export Determinístico (`exportBaseSQL`)

Geração direta de DDL sem IA. Disponível para todos os dialetos.

```typescript
exportBaseSQL(
  diagram: Diagram,
  targetDatabaseType: DatabaseType,
  options?: ExportOptions
): string
```

**O que é gerado:**
- `CREATE SCHEMA` (quando schemas presentes)
- `CREATE TYPE` (para enums e tipos compostos — PostgreSQL)
- `CREATE TABLE` com colunas, tipos, defaults, comentários
- `CREATE INDEX` e `CREATE UNIQUE INDEX`
- `ALTER TABLE ... ADD CONSTRAINT ... FOREIGN KEY`
- Check constraints (bancos que suportam)

**Opções:**
```typescript
interface ExportOptions {
  includeComments?: boolean;
  includeIndexes?: boolean;
  includeCheckConstraints?: boolean;
  filteredDiagram?: Diagram;  // respeitada se diagram filter estiver ativo
}
```

#### 2. Export via IA (`exportSQL`)

Usa LLM (OpenAI) para converter/adaptar SQL. Útil para migrações cross-dialect não triviais.

```typescript
exportSQL(
  diagram: Diagram,
  targetDatabaseType: DatabaseType,
  options: {
    stream?: boolean;
    onResultStream?: (chunk: string) => void;
    signal?: AbortSignal;
  }
): Promise<string>
```

Usa o Vercel AI SDK com streaming — o resultado aparece progressivamente no Monaco Editor.

### Caminhos de Export Cross-Dialect

| Origem | Destino | Método |
|---|---|---|
| PostgreSQL | MySQL | `exportPostgreSQLToMySQL()` (determinístico) |
| PostgreSQL | SQL Server | `exportPostgreSQLToMSSQL()` (determinístico) |
| Qualquer | Qualquer | `exportSQL()` via IA (fallback) |

### Caching de Export

O resultado do export é cacheado no **localStorage** para evitar re-geração:

```
Chave: SHA256("${databaseType}:${sqlScript}")
Valor: SQL gerado
```

O cache é invalidado automaticamente quando o diagrama muda (o hash muda).

### Capacidades por Dialeto

| Recurso | PostgreSQL | MySQL | MariaDB | SQL Server | SQLite | Oracle | ClickHouse | CockroachDB |
|---|---|---|---|---|---|---|---|---|
| Comentários | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ | ❌ | ✅ |
| Check Constraints | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ |
| Custom Types | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| Array Types | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| Schemas | ✅ | ❌ | ❌ | ✅ | ❌ | ✅ | ❌ | ✅ |

---

## Import/Export DBML

**DBML** (Database Markup Language) é um formato alternativo de descrição de esquemas.

**`src/lib/dbml/`:**

```typescript
// Import
importDBMLToDiagram(content: string, options?): Promise<Diagram>

// Export
exportToDiagramAsDBML(diagram: Diagram): string

// Validação
verifyDBML(content: string): { valid: boolean; error?: string }
```

**Particularidades:**
- `preprocessDBML()` extrai notações de array (`type[]`) e check constraints antes do parse com `@dbml/core`
- Nomes de campo que conflitam com palavras reservadas DBML são escapados automaticamente
- `DBMLValidationError` inclui informação de posição (linha/coluna) para diagnóstico

---

## Import de Metadados de Banco

Além de importar SQL, o ChartDB pode conectar a bancos de dados e importar metadados diretamente (via `ImportDatabaseDialog`). O resultado é um JSON de metadados que passa pelo pipeline em `src/lib/data/metadata-import/metadata-to-table.ts`:

```
Metadata JSON (information_schema)
           ↓
createTablesFromMetadata(metadata, databaseType)
           ↓
{ tables: DBTable[], relationships: DBRelationship[] }
```

Esse pipeline normaliza diferenças de schema entre bancos (ex: `information_schema.columns` vs `sys.columns` do SQL Server).
