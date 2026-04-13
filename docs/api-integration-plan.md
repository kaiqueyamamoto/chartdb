# Plano: Integração Frontend ↔ API

## Decisão Arquitetural

**Estratégia: modificar `storage-provider.tsx` in-place (Opção A).**

- Rotas protegidas já garantem que o usuário está autenticado antes de `StorageProvider` ser montado.
- Evita dois providers paralelos com lógica duplicada.
- Dexie permanece **apenas** para `config`, `diagram_filters` e `db_dependencies` (sem endpoint na API).

---

## Passos de Implementação

### Passo 1 — `api-client.ts`: adicionar `apiPut` e `apiDelete`

Arquivo: `src/lib/api-client.ts`

Inserir após `apiPost`, antes do `export { SESSION_EXPIRED_EVENT }`:

```typescript
export function apiPut<T>(path: string, body?: unknown): Promise<T> {
    return apiFetch<T>(path, {
        method: 'PUT',
        body: body !== undefined ? JSON.stringify(body) : undefined,
    });
}

export function apiDelete<T>(path: string): Promise<T> {
    return apiFetch<T>(path, { method: 'DELETE' });
}
```

---

### Passo 2 — Criar `src/lib/api-mapper.ts`

O MongoDB retorna `{ _id, __v, ... }`. O domínio usa `{ id, ... }`.

```typescript
export function fromApi<T extends { id: string }>(raw: Record<string, unknown>): T {
    const { _id, __v, ...rest } = raw;
    return { id: _id as string, ...rest } as T;
}

export function fromApiList<T extends { id: string }>(raws: Record<string, unknown>[]): T[] {
    return raws.map(fromApi<T>);
}

// Diagram específico: converte datas ISO string → Date
export function fromApiDiagram(raw: Record<string, unknown>): Diagram {
    const base = fromApi<Diagram>(raw);
    return {
        ...base,
        createdAt: new Date(base.createdAt as unknown as string),
        updatedAt: new Date(base.updatedAt as unknown as string),
    };
}

// Remove 'id' antes de enviar para a API
export function toApiPayload<T extends { id?: string }>(obj: T): Omit<T, 'id'> {
    const { id: _id, ...rest } = obj;
    return rest as Omit<T, 'id'>;
}
```

---

### Passo 3 — `storage-provider.tsx`: trocar implementações por chamadas de API

#### Permanece no Dexie (sem mudança)
- `getConfig` / `updateConfig`
- `getDiagramFilter` / `updateDiagramFilter` / `deleteDiagramFilter`
- `addDependency` / `getDependency` / `updateDependency` / `deleteDependency` / `listDependencies` / `deleteDiagramDependencies`

#### Migram para API

| Recurso | Métodos |
|---|---|
| Diagrams | `addDiagram`, `listDiagrams`, `getDiagram`, `updateDiagram`, `deleteDiagram` |
| Tables | `addTable`, `getTable`, `updateTable`, `putTable`, `deleteTable`, `listTables`, `deleteDiagramTables` |
| Relationships | `addRelationship`, `getRelationship`, `updateRelationship`, `deleteRelationship`, `listRelationships`, `deleteDiagramRelationships` |
| Areas | `addArea`, `getArea`, `updateArea`, `deleteArea`, `listAreas`, `deleteDiagramAreas` |
| Notes | `addNote`, `getNote`, `updateNote`, `deleteNote`, `listNotes`, `deleteDiagramNotes` |
| CustomTypes | `addCustomType`, `getCustomType`, `updateCustomType`, `deleteCustomType`, `listCustomTypes`, `deleteDiagramCustomTypes` |

---

### Mapeamento de Endpoints

```
addDiagram        → POST   /api/diagrams
listDiagrams      → GET    /api/diagrams
getDiagram        → GET    /api/diagrams/:id
updateDiagram     → PUT    /api/diagrams/:id
deleteDiagram     → DELETE /api/diagrams/:id

addTable          → POST   /api/diagrams/:diagramId/tables
listTables        → GET    /api/diagrams/:diagramId/tables
getTable          → GET    /api/diagrams/:diagramId/tables/:id
updateTable/put   → PUT    /api/diagrams/:diagramId/tables/:id
deleteTable       → DELETE /api/diagrams/:diagramId/tables/:id

(mesmo padrão para relationships, areas, notes, custom-types)
```

---

### Pontos Críticos

#### A) `updateTable` sem `diagramId`
A assinatura atual é `updateTable({ id, attributes })` — sem `diagramId`. O endpoint exige `/api/diagrams/:diagramId/tables/:id`.

**Solução:** Aceitar `diagramId` como campo extra dentro de `attributes` na chamada, OU alterar a assinatura do `StorageContext` para incluir `diagramId` (exige atualizar chamadores no `chartdb-provider.tsx`).

O mesmo vale para: `updateRelationship`, `updateArea`, `updateNote`, `updateCustomType`.

#### B) `updateDiagram` com troca de `id`
O `chartdb-provider` chama `updateDiagram({ id: prevId, attributes: { id: newId } })`.
A API não suporta troca de `_id`. **Solução:** silenciosamente ignorar `attributes.id` na implementação da API.

#### C) `deleteDiagramTables` (e similares) sem endpoint de bulk delete
**Solução:** `listTables(diagramId)` + delete individual para cada item.

```typescript
const deleteDiagramTables = async (diagramId: string) => {
    const tables = await listTables(diagramId);
    await Promise.all(tables.map(t => apiDelete(`/api/diagrams/${diagramId}/tables/${t.id}`)));
};
```

#### D) `addDiagram` — sub-recursos dependem do diagrama existir primeiro
Criar o diagrama com `POST /api/diagrams`, depois criar tabelas/relationships/etc. em paralelo.

#### E) Erros 404 → retornar `undefined`
Métodos `get*` devem capturar `ApiClientError` com `status === 404` e retornar `undefined`.

#### F) Versão Dexie
Manter TODAS as versões existentes (1-13) intactas para não corromper dados de usuários existentes. As tabelas migradas para a API ficam declaradas no schema mas ociosas.

---

## Ordem de Implementação

1. `api-client.ts` — adicionar `apiPut` e `apiDelete`
2. `src/lib/api-mapper.ts` — criar arquivo com mappers
3. `storage-provider.tsx` — reescrever métodos de diagrams, tables, relationships, areas, notes, custom-types
4. Decidir sobre `diagramId` ausente no `updateTable` e similares
5. Testar fluxo principal: criar → listar → abrir diagrama
6. Testar `deleteDiagram` e `clearDiagram`

---

## Arquivos a Modificar/Criar

| Arquivo | Ação |
|---|---|
| `src/lib/api-client.ts` | Adicionar `apiPut`, `apiDelete` |
| `src/lib/api-mapper.ts` | Criar (novo) |
| `src/context/storage-context/storage-provider.tsx` | Reescrever métodos de API |
| `src/context/storage-context/storage-context.tsx` | Possível: adicionar `diagramId` em `updateTable` etc. |
| `src/context/chartdb-context/chartdb-provider.tsx` | Possível: atualizar chamadores se assinatura mudar |
