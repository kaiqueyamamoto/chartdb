# Integração com IA

## Visão Geral

O ChartDB usa IA para auxiliar na **exportação/migração de esquemas entre dialetos de banco de dados**. A integração é opcional — se as variáveis de ambiente não estiverem configuradas, o export cai para o modo determinístico.

**Stack de IA:**
- [Vercel AI SDK](https://sdk.vercel.ai/) v5.0 — abstração de streaming sobre LLMs
- `@ai-sdk/openai` — provider OpenAI
- Configurável para qualquer LLM com endpoint compatível OpenAI

---

## Configuração

```env
# .env.local
VITE_OPENAI_API_KEY=sk-...
VITE_OPENAI_API_ENDPOINT=https://api.openai.com/v1  # opcional, para custom endpoints
VITE_LLM_MODEL_NAME=gpt-4o                          # opcional, default é gpt-4o
```

Para usar modelos alternativos (Groq, Ollama, Azure OpenAI, etc.), configure `VITE_OPENAI_API_ENDPOINT` apontando para um endpoint compatível com a API OpenAI.

---

## Fluxo de Export via IA

```
1. Usuário abre ExportSQLDialog
2. Toggle "AI Export" ativado
3. exportSQL(diagram, targetDatabaseType, { stream: true, onResultStream }) chamado
4. Vercel AI SDK envia request ao LLM com:
   - Schema atual serializado como SQL base
   - Dialeto alvo
   - Instruções de conversão
5. Resposta chega em streaming
6. onResultStream(chunk) atualiza o Monaco Editor em tempo real
7. Usuário vê o SQL sendo gerado progressivamente
8. Resultado final é cacheado no localStorage
```

### Função Principal

```typescript
// src/lib/data/sql-export/export-sql-script.ts
exportSQL(
  diagram: Diagram,
  targetDatabaseType: DatabaseType,
  options: {
    stream?: boolean;
    onResultStream?: (chunk: string) => void;
    signal?: AbortSignal;   // para cancelamento
  }
): Promise<string>
```

---

## Casos de Uso da IA

### Export Cross-Dialect (sem mapeamento direto)

Quando não há um conversor determinístico implementado para um par origem → destino, a IA é usada como fallback:

```
PostgreSQL → ClickHouse   → IA
MySQL → Oracle            → IA  
SQLite → PostgreSQL       → IA
```

Conversores determinísticos existentes:
- `exportPostgreSQLToMySQL()` — sem IA
- `exportPostgreSQLToMSSQL()` — sem IA

Para todos os outros pares, a IA converte o SQL base gerado pelo export determinístico.

---

## Caching

Para evitar chamadas repetidas ao LLM (e custos), o resultado é cacheado:

```typescript
// Chave = SHA256 de "${targetDatabaseType}:${baseSQLScript}"
const cacheKey = sha256(`${targetDatabaseType}:${sqlScript}`);
localStorage.setItem(cacheKey, generatedSQL);
```

O cache é invalidado automaticamente quando o diagrama muda, pois o `baseSQLScript` (input) muda e portanto o hash também.

---

## Cancelamento

O export via IA pode ser cancelado pelo usuário:

```typescript
const controller = new AbortController();

exportSQL(diagram, targetType, {
  signal: controller.signal,
  onResultStream: (chunk) => updateEditor(chunk)
});

// Para cancelar:
controller.abort();
```

O Vercel AI SDK respeita o `AbortSignal` e interrompe o streaming.

---

## Tratamento de Erros

- **API key ausente**: Fallback para export determinístico com aviso
- **Rate limit / erro de API**: Alert exibido via `AlertContext`
- **Timeout / abort**: Stream é interrompido, SQL parcial descartado
- **Resposta inválida**: Validação básica antes de exibir o resultado

---

## Diagrama Filtrado + IA

Se o usuário tem um filtro de visibilidade ativo no canvas, o export via IA respeita o filtro — apenas tabelas visíveis são enviadas ao LLM:

```typescript
const effectiveDiagram = filter
  ? applyFilterToDiagram(diagram, filter)
  : diagram;

exportSQL(effectiveDiagram, targetType, options);
```
