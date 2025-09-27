# 🏦 Banco Icons

Projeto moderno construído com as melhores tecnologias para desenvolvimento web.

## 🚀 Stack Tecnológico

- **[Svelte 5](https://svelte.dev/)** - Framework reativo com runes
- **[SvelteKit](https://kit.svelte.dev/)** - Framework full-stack para Svelte
- **[Tailwind CSS v4](https://tailwindcss.com/)** - Framework CSS utilitário
- **[ShadCN-Svelte](https://shadcn-svelte.com/)** - Componentes UI acessíveis
- **[Lucide Icons](https://lucide.dev/)** - Ícones modernos e limpos
- **[Vite](https://vitejs.dev/)** - Build tool rápido
- **[Vitest](https://vitest.dev/)** - Framework de testes
- **[Playwright](https://playwright.dev/)** - Testes E2E

## 📦 Instalação

```bash
# Instalar dependências
pnpm install

# ou
npm install
```

## 🛠️ Desenvolvimento

```bash
# Iniciar servidor de desenvolvimento
pnpm run dev

# Verificar tipos
pnpm run check

# Executar testes
pnpm run test

# Formatar código
pnpm run format
```

## 🏗️ Build

```bash
# Build para produção
pnpm run build

# Preview do build
pnpm run preview
```

## 🎨 Componentes Disponíveis

- Button
- Card (Header, Content, Title, Description)
- Input
- Label

### Exemplo de uso

```svelte
<script>
  import { Button } from '$lib/components/ui/button';
  import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
</script>

<Card>
  <CardHeader>
    <CardTitle>Título</CardTitle>
  </CardHeader>
  <CardContent>
    <Button>Clique aqui</Button>
  </CardContent>
</Card>
```

## 📁 Estrutura do Projeto

```text
src/
├── lib/
│   ├── components/
│   │   └── ui/          # Componentes ShadCN
│   └── utils.js         # Utilitários
├── routes/
│   └── +page.svelte     # Página principal
└── app.css              # Estilos globais
```

## 🎯 Recursos

- ✅ Tailwind CSS v4 configurado
- ✅ Componentes ShadCN prontos para uso
- ✅ **Dark Mode Global** - Tema escuro aplicado por padrão
- ✅ Testes configurados
- ✅ TypeScript/JSDoc
- ✅ Prettier + ESLint
- ✅ Deploy pronto para Vercel
