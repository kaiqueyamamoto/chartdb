# Visão Geral

## O que é o ChartDB?

ChartDB é um **editor visual de esquemas de banco de dados**, open-source, que roda 100% no navegador. Permite que times de engenharia:

- Visualizem e editem esquemas de banco de dados de forma interativa
- Importem SQL existente (DDL) ou metadados de banco de dados
- Exportem DDL para múltiplos dialetos SQL
- Gerem diagramas ERD com relacionamentos, cardinalidade e dependências
- Organizem tabelas em áreas e adicionem notas visuais ao canvas
- Compartilhem diagramas via JSON/DBML
- Usem IA para migrar esquemas entre dialetos diferentes

Toda a persistência é local via **IndexedDB** — não há backend, nenhum dado é enviado a servidores externos (exceto quando a exportação via IA estiver habilitada).

---

## Stack Tecnológica

### Frontend
| Tecnologia | Versão | Uso |
|---|---|---|
| React | 18.3 | Framework UI |
| TypeScript | 5.2 | Tipagem estática |
| Vite | 7.2 | Build e dev server |
| React Router | 7.1 | Roteamento client-side com lazy loading |

### UI & Estilo
| Tecnologia | Uso |
|---|---|
| Tailwind CSS 3.4 | Estilização utility-first |
| Radix UI | Primitivos de componentes acessíveis |
| Lucide React | Ícones |
| Motion | Animações |
| React Resizable Panels | Painéis redimensionáveis |

### Canvas (Diagrama)
| Tecnologia | Uso |
|---|---|
| @xyflow/react (React Flow) | Renderização do grafo de tabelas e relacionamentos |

### Estado & Persistência
| Tecnologia | Uso |
|---|---|
| React Context API | 16+ provedores de estado |
| Dexie.js 4.0 | ORM para IndexedDB (persistência local) |
| Ahooks | Utilitários de hooks + EventEmitter |

### Parsing & Exportação SQL
| Tecnologia | Uso |
|---|---|
| node-sql-parser | Parsing de SQL multi-dialeto |
| @dbml/core + @dbml/parse | Suporte ao formato DBML |
| Monaco Editor | Editor de código embutido (SQL/scripts) |

### IA
| Tecnologia | Uso |
|---|---|
| ai SDK 5.0 (Vercel) | Streaming de respostas LLM |
| @ai-sdk/openai | Integração com OpenAI |

### Dev & Qualidade
| Tecnologia | Uso |
|---|---|
| Vitest 3.2 | Testes unitários |
| @testing-library/react | Testes de componentes |
| ESLint 9.16 | Linting (zero warnings) |
| Prettier 3.3 | Formatação |
| Husky 9.1 | Git hooks |
| Zod 3.23 | Validação de schemas em runtime |

---

## Como Rodar Localmente

### Pré-requisitos
- Node.js 24.x (versão usada no CI)
- npm

### Instalação e Dev
```bash
git clone https://github.com/chartdb/chartdb
cd chartdb
npm install
npm run dev
```

A aplicação abre em `http://localhost:5173`.

### Comandos Disponíveis
```bash
npm run dev           # Dev server com hot reload
npm run build         # Lint + tsc + Vite build (produção)
npm run preview       # Preview do build de produção
npm run lint          # ESLint (falha com warnings)
npm run lint:fix      # Auto-fix de issues de lint
npm run test          # Vitest em modo watch
npm run test:ci       # Vitest single-run (usado no CI)
npm run test:ui       # Dashboard visual do Vitest
npm run test:coverage # Relatório de cobertura
```

### Variáveis de Ambiente

| Variável | Descrição |
|---|---|
| `VITE_OPENAI_API_KEY` | Chave OpenAI para exportação via IA |
| `VITE_OPENAI_API_ENDPOINT` | Endpoint customizado de LLM |
| `VITE_LLM_MODEL_NAME` | Nome do modelo customizado |
| `VITE_DISABLE_ANALYTICS` | Desabilitar Fathom Analytics |

Crie um `.env.local` na raiz do projeto para desenvolvimento local.

### Docker

O projeto inclui `Dockerfile` e `default.conf.template` para deploy via container. O `entrypoint.sh` inicializa o servidor nginx com as variáveis de ambiente injetadas em tempo de execução.

---

## Dialetos de Banco de Dados Suportados

| Banco | Import SQL | Export SQL | Import Metadados |
|---|---|---|---|
| PostgreSQL | ✅ | ✅ | ✅ |
| MySQL | ✅ | ✅ | ✅ |
| MariaDB | ✅ | ✅ | ✅ |
| SQL Server | ✅ | ✅ | ✅ |
| SQLite | ✅ | ✅ | ✅ |
| Oracle | ✅ | ✅ | ✅ |
| ClickHouse | — | ✅ | ✅ |
| CockroachDB | — | ✅ | ✅ |
| Generic | — | ✅ | — |
