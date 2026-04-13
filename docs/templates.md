# Templates

## O que são Templates

Templates são esquemas de banco de dados pré-construídos que os usuários podem usar como ponto de partida. Estão disponíveis em `/templates` na aplicação.

**Localização:** `src/templates-data/`

---

## Estrutura de um Template

```typescript
interface Template {
  slug: string;         // identificador URL-friendly, ex: "laravel-default"
  name: string;         // nome exibido, ex: "Laravel Default"
  description: string;  // descrição curta
  diagram: Diagram;     // diagrama completo com tabelas, relacionamentos, áreas, etc.
  tags: string[];       // tags para busca/filtro, ex: ["php", "laravel", "web"]
  featured?: boolean;   // exibido na seção "featured"
  image?: string;       // preview da imagem (path em /public)
}
```

O campo `diagram` é um objeto `Diagram` completo — o mesmo tipo usado internamente. Isso significa que templates são simplesmente diagramas serializados com metadados extras.

---

## Organização dos Arquivos

```
src/templates-data/
├── templates-data.ts         # lista mestre de todos os templates
├── template-utils.ts         # funções utilitárias
└── templates/
    ├── laravel-default.ts    # template individual
    ├── django-default.ts
    ├── wordpress.ts
    └── ...                   # 50+ templates
```

---

## Funções Utilitárias

**`src/templates-data/template-utils.ts`:**

```typescript
// Retorna todos os templates + lista de todas as tags únicas
getTemplatesAndAllTags(): Promise<{
  templates: Template[];
  allTags: string[];
}>

// Remove duplicatas da lista de tags
removeDups(tags: string[]): string[]

// Converte template em novo diagrama (cria cópia com novo ID)
convertTemplateToNewDiagram(template: Template): Diagram
```

`convertTemplateToNewDiagram` é chamado quando o usuário acessa `/templates/clone/:slug` — cria um diagrama independente baseado no template, sem modificar o original.

---

## Roteamento de Templates

| Rota | Comportamento |
|---|---|
| `/templates` | Lista todos os templates |
| `/templates/featured` | Filtra para `template.featured === true` |
| `/templates/tags/:tag` | Filtra por tag |
| `/templates/:slug` | Visualiza o template (somente leitura) |
| `/templates/clone/:slug` | Cria novo diagrama a partir do template e redireciona para o editor |

---

## Criando um Novo Template

1. Crie o diagrama no editor do ChartDB
2. Exporte como JSON via "Export Diagram"
3. Crie um arquivo em `src/templates-data/templates/nome-do-template.ts`:

```typescript
import { Template } from '../template-utils';
import { DatabaseType } from '@/lib/domain/database-type';

export const meuTemplate: Template = {
  slug: 'meu-template',
  name: 'Meu Template',
  description: 'Descrição do esquema',
  tags: ['tag1', 'tag2'],
  featured: false,
  diagram: {
    id: 'template-meu-template',
    name: 'Meu Template',
    databaseType: DatabaseType.POSTGRESQL,
    tables: [ /* ... */ ],
    relationships: [ /* ... */ ],
    areas: [],
    notes: [],
    customTypes: [],
    dependencies: [],
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
  }
};
```

4. Adicione à lista em `src/templates-data/templates-data.ts`:

```typescript
import { meuTemplate } from './templates/meu-template';

export const templates: Template[] = [
  // ...templates existentes,
  meuTemplate,
];
```

---

## Templates Carregados via Route Loader

A rota `/templates` usa um route loader do React Router para pré-carregar todos os templates antes da renderização da página, evitando flash de conteúdo:

```typescript
// No router.tsx
{
  path: '/templates',
  loader: async () => getTemplatesAndAllTags(),
  element: <TemplatesPage />
}
```

Os dados ficam disponíveis via `useLoaderData()` no `TemplatesPage`.
