# Guia de Localização (i18n)

Este projeto utiliza um sistema de localização personalizado baseado em um dicionário centralizado (`src/app/lib/i18n/dictionary.ts`) e um hook React (`useTranslation`).

## Estrutura do Dicionário

O arquivo `dictionary.ts` exporta um objeto `dictionary` contendo duas chaves principais: `pt` (Português) e `en` (Inglês).

```typescript
export const dictionary = {
  pt: {
    section_name: {
      key_name: "Texto em Português",
    },
  },
  en: {
    section_name: {
      key_name: "Text in English",
    },
  },
};
```

## Como Adicionar Novas Traduções

1.  **Identifique a Seção**: Escolha uma seção existente (ex: `common`, `home`, `navbar`) ou crie uma nova se o contexto for específico (ex: `new_feature`).
2.  **Adicione ao Português**: Insira a chave e o texto em `pt`.
3.  **Adicione ao Inglês**: Insira a **mesma chave** e a tradução em `en`.

> **Importante**: A estrutura de chaves (aninhamento) deve ser idêntica em ambos os idiomas.

## Como Usar no Código

Utilize o hook `useTranslation` nos seus componentes ("use client").

```tsx
"use client";
import { useTranslation } from "@/hooks/useTranslation";

export function MyComponent() {
  const t = useTranslation();

  return (
    <div>
      <h1>{t.section_name.key_name}</h1>
      <button>{t.common.save}</button>
    </div>
  );
}
```

## Testando Traduções

Acesse a página de debug para verificar o status das traduções e identificar chaves faltantes:

- Rota: `/debug/translations`
- Funcionalidades:
  - Lista chaves ausentes em EN ou PT.
  - Alerta sobre valores vazios.
  - Alerta sobre valores idênticos (potencialmente não traduzidos).
  - Permite alternar o idioma globalmente para teste visual.

## Boas Práticas

- **Evite Hardcoding**: Nunca escreva textos diretamente no JSX. Use sempre `t.section.key`.
- **Reutilize**: Use a seção `common` para verbos e termos genéricos (Salvar, Cancelar, Voltar).
- **Parâmetros**: Se precisar de interpolação (ex: "Olá {name}"), o sistema atual é simples e não suporta interpolação direta. Prefira quebrar em partes ou, se necessário, estender o hook `useTranslation` para suportar funções.
- **Datas e Números**: Utilize `Intl.DateTimeFormat` e `Intl.NumberFormat` com o locale do usuário (obtido via store `useI18nStore`) para formatar dados dinâmicos.
