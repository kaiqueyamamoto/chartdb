# Roteamento

## Configuração

O roteamento usa **React Router v7** com `createBrowserRouter` e carregamento lazy (code splitting automático via Vite).

**Arquivo:** `src/router.tsx`

---

## Rotas

| Rota | Componente | Descrição |
|---|---|---|
| `/` | `EditorPage` | Editor principal (abre diagrama padrão) |
| `/diagrams/:diagramId` | `EditorPage` | Editor com diagrama específico |
| `/examples` | `ExamplesPage` | Galeria de exemplos |
| `/templates` | `TemplatesPage` | Todos os templates |
| `/templates/featured` | `TemplatesPage` | Templates em destaque |
| `/templates/tags/:tag` | `TemplatesPage` | Templates filtrados por tag |
| `/templates/:templateSlug` | `TemplatePage` | Visualização de template individual |
| `/templates/clone/:templateSlug` | `CloneTemplatePage` | Carrega template como novo diagrama |
| `*` | `NotFoundPage` | Página 404 |

---

## Lazy Loading

Todos os componentes de página são carregados de forma lazy:

```typescript
const EditorPage = lazy(() => import('./pages/editor-page/editor-page'));
const TemplatesPage = lazy(() => import('./pages/templates-page/templates-page'));
// ...
```

O Vite divide automaticamente o bundle — cada página é um chunk separado carregado sob demanda.

---

## Loader Functions

As rotas de templates usam `loader` functions para pré-carregar dados antes da renderização:

```typescript
{
  path: '/templates',
  element: <TemplatesPage />,
  loader: async () => {
    const { templates, allTags } = await getTemplatesAndAllTags();
    return { templates, allTags };
  }
}
```

Os dados carregados ficam disponíveis via `useLoaderData()` no componente.

---

## Navegação Programática

O editor redireciona para `/diagrams/:id` após criar ou abrir um diagrama:

```typescript
const navigate = useNavigate();
navigate(`/diagrams/${newDiagramId}`);
```

A rota `/` sem `diagramId` verifica o `config.defaultDiagramId` no Dexie e redireciona automaticamente.
