# Guia de Internacionalização (i18n)

Este projeto utiliza um sistema de dicionário centralizado para suportar múltiplos idiomas (atualmente Português e Inglês).

## Estrutura

Todas as strings traduzíveis estão localizadas em:
`src/app/lib/i18n/dictionary.ts`

O objeto `dictionary` contém duas chaves principais: `pt` e `en`. Ambas devem manter EXATAMENTE a mesma estrutura de chaves aninhadas.

```typescript
export const dictionary = {
  pt: {
    home: {
      title: "Título em Português",
      // ...
    },
    // ...
  },
  en: {
    home: {
      title: "English Title",
      // ...
    },
    // ...
  }
};
```

## Como adicionar novas traduções

1. **Identifique a seção correta**:
   - `common`: Palavras ou frases usadas em vários lugares (ex: Botões Salvar, Cancelar).
   - `home`, `database`, `profile`: Específico para estas páginas.
   - `navbar`, `footer`: Componentes globais.

2. **Adicione a chave em `pt`**:
   Adicione a nova string no objeto `pt`. Use nomes de chaves descritivos (snake_case recomendado).

3. **Adicione a chave equivalente em `en`**:
   **IMPORTANTE**: Você DEVE adicionar a mesma chave no objeto `en`. Se não souber a tradução exata, coloque uma tradução provisória ou mantenha em português temporariamente, mas a chave deve existir para evitar erros de TypeScript.

## Como usar no código

### Em Client Components (`"use client"`)

1. Importe o hook `useTranslation`:
   ```tsx
   import { useTranslation } from "@/hooks/useTranslation";
   ```

2. Inicialize o hook no componente:
   ```tsx
   const t = useTranslation();
   ```

3. Acesse as strings:
   ```tsx
   <h1>{t.home.title}</h1>
   <button>{t.common.save}</button>
   ```

### Em Server Components

Atualmente, o sistema é otimizado para Client Components devido ao estado global do idioma (Zustand). Para Server Components, recomenda-se passar as strings via props de um Client Component pai ou converter o componente para Client Component se precisar de troca dinâmica de idioma.

## Verificação

Para verificar se todas as chaves estão sincronizadas entre PT e EN, acesse a página de debug (em desenvolvimento):
`/debug/translations`

Esta página lista quaisquer chaves que existam em um idioma mas faltem no outro.
