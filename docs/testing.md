# Testes

## Stack de Testes

| Tecnologia | Uso |
|---|---|
| **Vitest 3.2** | Test runner (compatível com API do Jest) |
| **happy-dom** | Ambiente DOM para testes unitários |
| **@testing-library/react** | Renderização e queries de componentes React |
| **@testing-library/jest-dom** | Matchers DOM customizados (`toBeInTheDocument`, etc.) |

---

## Configuração

**Arquivo:** `vitest.config.ts`

```typescript
{
  environment: 'happy-dom',
  setupFiles: ['src/test/setup.ts'],
  coverage: {
    reporter: ['text', 'json', 'html']
  }
}
```

**Setup (`src/test/setup.ts`):**
- Importa `@testing-library/jest-dom` para matchers DOM
- Limpa o DOM após cada teste (`cleanup()`)

---

## Comandos

```bash
# Watch mode (desenvolvimento)
npm run test

# Single run, para CI (bail na primeira falha)
npm run test:ci

# Dashboard visual interativo
npm run test:ui

# Relatório de cobertura
npm run test:coverage

# Rodar um arquivo específico
npm run test -- src/lib/domain/__tests__/meu-teste.test.ts

# Rodar testes por nome/pattern
npm run test -- --grep "nome do teste"

# Rodar testes em modo verbose
npm run test -- --reporter=verbose
```

---

## Onde Ficam os Testes

Os testes ficam em diretórios `__tests__/` co-localizados com o código-fonte, ou em arquivos com sufixo `.test.ts` / `.spec.ts`:

```
src/lib/domain/
├── db-table.ts
└── __tests__/
    ├── composite-pk-metadata-import.test.ts
    └── check-constraints.test.ts

src/lib/data/sql-import/
├── postgresql/
│   └── __tests__/
│       └── postgresql-import.test.ts
└── mysql/
    └── __tests__/
        └── mysql-import.test.ts
```

---

## Exemplos de Testes Existentes

O projeto tem testes principalmente para a camada de dados (import/export SQL):

- `composite-pk-metadata-import.test.ts` — import com chaves primárias compostas
- `check-constraints.test.ts` — validação de check constraints
- `postgresql-import.test.ts` — parsing de DDL PostgreSQL
- `mysql-import.test.ts` — parsing de DDL MySQL
- `sqlite-import.test.ts` — parsing de DDL SQLite
- `sql-export.test.ts` — geração de SQL cross-dialect
- `array-fields.test.ts` — campos de tipo array (PostgreSQL)

---

## Escrevendo Novos Testes

### Teste de função de domínio

```typescript
import { describe, it, expect } from 'vitest';
import { createTablesFromMetadata } from '@/lib/data/metadata-import/metadata-to-table';

describe('createTablesFromMetadata', () => {
  it('should create tables from PostgreSQL metadata', () => {
    const metadata = { /* ... */ };
    const result = createTablesFromMetadata(metadata, 'POSTGRESQL');
    
    expect(result.tables).toHaveLength(3);
    expect(result.tables[0].name).toBe('users');
  });
});
```

### Teste de componente React

```typescript
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { MyComponent } from '../my-component';

describe('MyComponent', () => {
  it('renders correctly', () => {
    render(<MyComponent label="Test" />);
    expect(screen.getByText('Test')).toBeInTheDocument();
  });
});
```

---

## CI

O GitHub Actions executa na abertura de PRs (Node 24.x):

```
1. npm run lint    (zero warnings)
2. npm run build   (tsc + Vite)
3. npm run test:ci (Vitest, bail on failure)
```

Todos os três devem passar para o PR ser mergeável.
