# Grid View e Sistema de Cores Globais - Documentação Técnica

## Índice

1. [Visão Geral do Sistema](#visão-geral-do-sistema)
2. [Modo Grid View](#modo-grid-view)
3. [Sistema de Cores Globais](#sistema-de-cores-globais)
4. [Logos Multi-Coloridos](#logos-multi-coloridos)
5. [Arquivos e Funções Principais](#arquivos-e-funções-principais)
6. [Fluxogramas](#fluxogramas)
7. [Exemplos de Uso](#exemplos-de-uso)
8. [Troubleshooting](#troubleshooting)

---

## Visão Geral do Sistema

### Propósito

O sistema oferece duas formas de visualização de logos bancários:

- **Modo Individual (Single)**: Visualização detalhada de um único logo com controles avançados, zoom, pan, comparação com original, e personalização individual de cores.
- **Modo Grid View**: Visualização simultânea de todos os logos em uma grade responsiva com controles globais de cor e tamanho.

### Arquitetura Geral

```
+page.svelte (Controlador Principal)
    ├── viewMode state ("single" | "grid")
    ├── ActionButtons (Botão de alternância)
    └── Renderização Condicional:
        ├── InteractiveCanvas (modo single)
        └── GridView (modo grid)
```

**Componentes Principais:**

- `src/routes/+page.svelte` - Página principal com estado de modo
- `src/lib/components/GridView.svelte` - Componente de visualização em grade
- `src/lib/components/ActionButtons.svelte` - Botões de ação incluindo toggle de modo
- `src/lib/components/InteractiveCanvas.svelte` - Canvas interativo para modo individual

---

## Modo Grid View

### Localização

**Arquivo:** `src/lib/components/GridView.svelte`

### Funcionalidades

#### 1. Alternância de Modo

**Estado no +page.svelte:**

```javascript
let viewMode = $state("single"); // "single" ou "grid"

function handleViewModeToggle() {
  viewMode = viewMode === "single" ? "grid" : "single";
}
```

**Botão de Alternância (ActionButtons.svelte):**

- Localizado à esquerda do botão "Webflow"
- Ícone muda dinamicamente:
  - `Grid3x3` quando em modo single (clique para ir para grid)
  - `Maximize` quando em modo grid (clique para voltar ao single)
- Props passadas: `viewMode` e `onViewModeToggle`

**Renderização Condicional (+page.svelte):**

```svelte
{#if viewMode === "single"}
  <InteractiveCanvas ... />
{:else}
  <GridView logos={storeData.logos} loading={storeData.loading} />
{/if}
```

#### 2. Estrutura do Layout

**Grade Responsiva:**

- **Mobile** (< 640px): 2 colunas
- **Tablet** (640px - 1024px): 3 colunas
- **Desktop** (≥ 1024px): 4 colunas

```css
grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4
```

**Estrutura de Cada Item:**

```
┌─────────────────┐
│   Canvas        │ ← Logo renderizado
│   (1:1 ratio)   │
├─────────────────┤
│  Nome do Banco  │ ← Label com tooltip
└─────────────────┘
```

#### 3. Renderização no Canvas

**Função Principal:** `renderLogoOnCanvas(canvas, svgContent, color, size, logoName)`

**Fluxo de Renderização:**

1. **Configuração de Alta Resolução (DPI)**

   ```javascript
   const dpr = window.devicePixelRatio || 1;
   const canvasSize = 300; // Base size
   canvas.width = canvasSize * dpr;
   canvas.height = canvasSize * dpr;
   ctx.scale(dpr, dpr);
   ```

2. **Desenho do Fundo Pontilhado**

   ```javascript
   drawDottedPattern(ctx, canvasSize, canvasSize, "#666666");
   ```

3. **Aplicação de Cor ao SVG**

   ```javascript
   svgElement.style.color = color; // Usa currentColor
   ```

4. **Contraste Automático (para logos multi-coloridos)**

   ```javascript
   if (hasMultipleColors(logoName)) {
     const config = getMultiColorConfig(logoName);
     config.elements.forEach((element) => {
       if (element.autoContrastVar) {
         const textColor = isDarkColor(color) ? "#ffffff" : "#000000";
         svgElement.style.setProperty(element.autoContrastVar, textColor);
       }
     });
   }
   ```

5. **Renderização em 2x para Qualidade**

   ```javascript
   const renderSize = size * 2; // Render at 2x
   svgElement.setAttribute("width", renderSize.toString());
   svgElement.setAttribute("height", renderSize.toString());
   ```

6. **Criação e Desenho da Imagem**

   ```javascript
   const img = new Image();
   const blob = new Blob([modifiedSvg], { type: "image/svg+xml" });
   const url = URL.createObjectURL(blob);
   
   img.onload = () => {
     ctx.imageSmoothingEnabled = true;
     ctx.imageSmoothingQuality = "high";
     ctx.drawImage(img, x, y, renderSize, renderSize);
     URL.revokeObjectURL(url);
   };
   ```

#### 4. Sistema de Alta Resolução

**Por que é necessário:**

- Canvas HTML tem tamanho físico (pixels) vs tamanho de exibição (CSS)
- Em telas de alta densidade (Retina, 4K), 1 pixel CSS = múltiplos pixels físicos
- Sem ajuste DPI, logos ficam borrados/pixelados

**Solução Implementada:**

1. Detecta `devicePixelRatio` (1x, 2x, 3x, etc.)
2. Multiplica dimensões do canvas pelo DPI
3. Escala o contexto de desenho
4. Renderiza logos em 2x do tamanho solicitado
5. CSS redimensiona para tamanho final (mantendo qualidade)

**Resultado:** Logos nítidos em qualquer resolução de tela

#### 5. Fluxo de Dados

```
Carregamento → Processamento → Renderização → Atualização
```

**Detalhamento:**

1. **Carregamento Inicial**
   - `svgStore.loadAllLogos()` carrega todos os SVGs
   - Armazenados em `Map<logoName, svgContent>`
   - Passados como prop para GridView

2. **Conversão para Array**

   ```javascript
   const logoArray = $derived(Array.from(logos.entries()));
   ```

3. **Estado Reativo**

   ```javascript
   let globalColor = $state("#808080"); // Cinza inicial
   let logoSize = $state([80]); // Tamanho inicial 80px
   let canvasRefs = $state({}); // Referências aos canvas
   ```

4. **Renderização Reativa ($effect)**

   ```javascript
   $effect(() => {
     const currentSize = logoSize[0];
     logoArray.forEach(([logoName, svgContent]) => {
       const canvas = canvasRefs[logoName];
       if (canvas) {
         renderLogoOnCanvas(canvas, svgContent, globalColor, currentSize, logoName);
       }
     });
   });
   ```

5. **Atualização em Tempo Real**
   - Mudança de cor → `$effect` detecta → Re-renderiza todos os logos
   - Mudança de tamanho → `$effect` detecta → Re-renderiza todos os logos

---

## Sistema de Cores Globais

### Controles Globais

**Localização:** Topo do GridView

1. **Seletor de Cor Global**
   - Color picker nativo do navegador
   - Abre ao clicar no botão de cor
   - Preview em tempo real durante seleção
   - Cor inicial: `#808080` (cinza)

2. **Controle de Tamanho**
   - Slider de 40px a 150px
   - Valor padrão: 80px
   - Ajusta todos os logos simultaneamente

### Aplicação de Cor

#### Logos Simples (Monocromáticos)

**Exemplos:** Banco do Brasil, Bradesco, Santander, etc.

**Mecanismo:**

```javascript
svgElement.style.color = color;
```

**Como funciona:**

- SVG usa `fill="currentColor"` ou `stroke="currentColor"`
- Propriedade CSS `color` define o valor de `currentColor`
- Todos os elementos com `currentColor` recebem a mesma cor

**Exemplo de SVG:**

```svg
<svg>
  <path fill="currentColor" d="..." />
  <circle stroke="currentColor" fill="none" />
</svg>
```

#### Logos Multi-Coloridos

**Exemplos:** Itaú, Ágora, Caixa

**Mecanismo:**

```javascript
// 1. Define cor base
svgElement.style.color = color;

// 2. Aplica CSS variables específicas
svgElement.style.setProperty("--itau-bg-color", color);
svgElement.style.setProperty("--itau-text-color", textColor);
```

**Como funciona:**

- SVG usa CSS variables: `fill: var(--itau-bg-color, currentColor)`
- Cada elemento pode ter sua própria variável
- Fallback para `currentColor` se variável não definida

**Exemplo de SVG:**

```svg
<svg>
  <style>
    .itau-bg { fill: var(--itau-bg-color, currentColor); }
    .itau-text { fill: var(--itau-text-color, white); }
  </style>
  <rect class="itau-bg" />
  <text class="itau-text">Itaú</text>
</svg>
```

### Detecção Automática de Contraste

**Problema:** Logos com elementos sobrepostos (texto sobre fundo) perdem contraste quando ambos recebem a mesma cor.

**Exemplo:** Banco Itaú

- Fundo azul com texto amarelo
- Se aplicar branco global: fundo branco + texto branco = invisível ❌

**Solução:** Contraste automático baseado em luminância

#### Função `isDarkColor(hexColor)`

**Localização:** `src/lib/utils/color-utils.js`

**Algoritmo:**

1. Converte HEX para RGB
2. Calcula luminância relativa (padrão W3C)
3. Compara com threshold de 0.179

**Fórmula de Luminância:**

```javascript
function calculateLuminance({ r, g, b }) {
  // Normaliza RGB para 0-1
  const [rs, gs, bs] = [r, g, b].map(c => c / 255);

  // Aplica correção gamma (sRGB)
  const [R, G, B] = [rs, gs, bs].map(c =>
    c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
  );

  // Calcula luminância relativa
  return 0.2126 * R + 0.7152 * G + 0.0722 * B;
}

function isDarkColor(hexColor) {
  const luminance = calculateLuminance(hexToRgb(hexColor));
  return luminance < 0.179;
}
```

**Threshold 0.179:**

- Baseado em padrões de acessibilidade WCAG
- Garante contraste mínimo de 4.5:1 para texto
- Preto (#000000) tem luminância 0 (escuro)
- Branco (#FFFFFF) tem luminância 1 (claro)

#### Aplicação no GridView

**Lógica:**

```javascript
if (hasMultipleColors(logoName)) {
  const config = getMultiColorConfig(logoName);

  config.elements.forEach((element) => {
    if (element.autoContrastVar) {
      // Determina cor do texto baseado no fundo
      const textColor = isDarkColor(color) ? "#ffffff" : "#000000";

      // Aplica via CSS variable
      svgElement.style.setProperty(element.autoContrastVar, textColor);
    }
  });
}
```

**Resultado:**

- Fundo escuro → Texto branco ✅
- Fundo claro → Texto preto ✅
- Contraste sempre legível

**Estados Reativos:**

```javascript
let globalColor = $state("#808080");
let logoSize = $state([80]);
let canvasRefs = $state({});
```

**Effect de Renderização:**

```javascript
$effect(() => {
  const currentSize = logoSize[0];
  logoArray.forEach(([logoName, svgContent]) => {
    const canvas = canvasRefs[logoName];
    if (canvas) {
      renderLogoOnCanvas(canvas, svgContent, globalColor, currentSize, logoName);
    }
  });
});
```

### 2. `src/lib/utils/multi-color-utils.js`

**Responsabilidades:**

- Configurações de logos multi-coloridos
- Detecção de logos com múltiplas cores
- Funções auxiliares para manipulação de cores

**Exports Principais:**

#### `MULTI_COLOR_CONFIGS`

Objeto com configurações de todos os logos multi-coloridos.

#### `hasMultipleColors(logoName)`

Verifica se um logo tem configuração multi-color.

```javascript
export function hasMultipleColors(logoName) {
  return logoName in MULTI_COLOR_CONFIGS;
}
```

#### `getMultiColorConfig(logoName)`

Retorna a configuração de um logo multi-colorido.

```javascript
export function getMultiColorConfig(logoName) {
  return MULTI_COLOR_CONFIGS[logoName] || null;
}
```

### 3. `src/lib/utils/color-utils.js`

**Responsabilidades:**

- Conversão de cores (HEX ↔ RGB)
- Cálculo de luminância
- Detecção de cores escuras/claras
- Geração de cores contrastantes

**Funções Principais:**

#### `hexToRgb(hex)`

Converte cor hexadecimal para RGB.

```javascript
export function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}
```

#### `calculateLuminance({ r, g, b })`

Calcula luminância relativa (padrão W3C).

#### `isDarkColor(hexColor)`

Determina se uma cor é escura (luminância < 0.179).

#### `getContrastBackground(iconColor)`

Retorna cor de fundo contrastante para um ícone.

```javascript
export function getContrastBackground(iconColor) {
  return isDarkColor(iconColor) ? "#ffffff" : "#000000";
}
```

### 4. `src/routes/+page.svelte`

**Responsabilidades:**

- Estado global da aplicação
- Alternância entre modos de visualização
- Gerenciamento do svgStore
- Renderização condicional de componentes

**Estado Principal:**

```javascript
let viewMode = $state("single"); // "single" ou "grid"
```

**Função de Toggle:**

```javascript
function handleViewModeToggle() {
  viewMode = viewMode === "single" ? "grid" : "single";
}
```

**Renderização Condicional:**

```svelte
{#if viewMode === "single"}
  <InteractiveCanvas ... />
{:else}
  <GridView logos={storeData.logos} loading={storeData.loading} />
{/if}
```

### 5. `src/lib/components/ActionButtons.svelte`

**Responsabilidades:**

- Botões de ação (Download, Copy, Webflow)
- Botão de alternância de modo
- Tooltips explicativos

**Props Relevantes:**

```javascript
let {
  viewMode = "single",
  onViewModeToggle = () => {},
  // ... outras props
} = $props();
```

**Botão de Toggle:**

```svelte
<Button onclick={onViewModeToggle}>
  {#if viewMode === "single"}
    <Grid3x3 /> <!-- Ícone para ir ao grid -->
  {:else}
    <Maximize /> <!-- Ícone para voltar ao single -->
  {/if}
</Button>
```

---

## Fluxogramas

### Fluxo de Alternância de Modo

```text
Usuário clica no botão de toggle
         ↓
ActionButtons.svelte chama onViewModeToggle()
         ↓
+page.svelte executa handleViewModeToggle()
         ↓
viewMode muda: "single" ↔ "grid"
         ↓
Svelte detecta mudança de estado
         ↓
Renderização condicional atualiza
         ↓
{#if viewMode === "single"}
  → InteractiveCanvas renderizado
{:else}
  → GridView renderizado
```

### Fluxo de Aplicação de Cor Global

```text
Usuário seleciona cor no color picker
         ↓
handleColorPickerInput() atualiza globalColor
         ↓
$effect detecta mudança em globalColor
         ↓
Para cada logo no logoArray:
  ├─ Obtém canvas do logo
  ├─ Chama renderLogoOnCanvas()
  │    ├─ Configura canvas (DPI)
  │    ├─ Desenha fundo pontilhado
  │    ├─ Parseia SVG
  │    ├─ Aplica cor: svgElement.style.color = color
  │    ├─ Verifica se é multi-color
  │    │    ├─ Se sim: aplica contraste automático
  │    │    └─ Se não: apenas cor global
  │    ├─ Serializa SVG modificado
  │    └─ Renderiza no canvas
  └─ Logo atualizado com nova cor
```

### Fluxo de Detecção e Aplicação de Contraste Automático

```text
renderLogoOnCanvas() recebe logoName
         ↓
hasMultipleColors(logoName)?
  ├─ Não → Aplica apenas cor global
  └─ Sim → Continua
         ↓
getMultiColorConfig(logoName)
         ↓
Para cada element em config.elements:
  ├─ element.autoContrastVar existe?
  │    ├─ Não → Pula elemento
  │    └─ Sim → Continua
  │         ↓
  │    isDarkColor(color)?
  │    ├─ Sim (escuro) → textColor = "#ffffff"
  │    └─ Não (claro) → textColor = "#000000"
  │         ↓
  │    svgElement.style.setProperty(
  │      element.autoContrastVar,
  │      textColor
  │    )
  └─ Elemento com contraste aplicado
```

---

## Exemplos de Uso

### Exemplo 1: Cor Escura (Preto #000000)

**Logos Simples:**

- Todos os elementos ficam pretos
- Exemplo: Bradesco, Santander, Banco do Brasil

**Banco Itaú (Multi-color com contraste):**

- Fundo: Preto (#000000)
- Texto: Branco (#FFFFFF) - contraste automático
- Resultado: Texto legível sobre fundo escuro ✅

### Exemplo 2: Cor Clara (Branco #FFFFFF)

**Logos Simples:**

- Todos os elementos ficam brancos
- Exemplo: Bradesco, Santander, Banco do Brasil

**Banco Itaú (Multi-color com contraste):**

- Fundo: Branco (#FFFFFF)
- Texto: Preto (#000000) - contraste automático
- Resultado: Texto legível sobre fundo claro ✅

### Exemplo 3: Cor Média (Cinza #808080)

**Cálculo de Luminância:**

```javascript
// #808080 = RGB(128, 128, 128)
// Luminância ≈ 0.216
// 0.216 > 0.179 → Considerado CLARO
```

**Logos Simples:**

- Todos os elementos ficam cinza

**Banco Itaú (Multi-color com contraste):**

- Fundo: Cinza (#808080)
- Texto: Preto (#000000) - contraste automático
- Resultado: Texto legível sobre fundo cinza ✅

### Exemplo 4: Caixa Econômica (Multi-color sem contraste)

**Comportamento:**

- Azul: Recebe cor global
- Laranja: Recebe cor global
- Ambos ficam com a mesma cor

**Por quê?**

- Elementos estão lado a lado (não sobrepostos)
- Não há problema de legibilidade
- `autoContrastVar: null` para ambos

### Exemplo 5: Ágora Investimentos (Multi-color sem contraste)

**Comportamento:**

- Quadrado verde: Recebe cor global
- Texto "ÁGORA": Recebe cor global
- Ambos ficam com a mesma cor

**Por quê?**

- Texto está ABAIXO do quadrado (não sobreposto)
- Não há problema de legibilidade
- `autoContrastVar: null` para ambos

---

## Troubleshooting

### Problema: Logos aparecem borrados/pixelados

**Causa:** Canvas não está usando DPI correto

**Solução:**

```javascript
const dpr = window.devicePixelRatio || 1;
canvas.width = canvasSize * dpr;
canvas.height = canvasSize * dpr;
ctx.scale(dpr, dpr);
```

### Problema: Texto invisível em logo multi-colorido

**Causa:** Contraste automático não configurado

**Solução:**

1. Verificar se logo tem `autoContrastVar` em `MULTI_COLOR_CONFIGS`
2. Adicionar CSS variable no SVG:

   ```svg
   fill: var(--logo-text-color, var(--logo-auto-text-color, white))
   ```

3. Configurar `autoContrastVar: "--logo-auto-text-color"` no config

### Problema: Cor global não aplica em logo específico

**Causa:** SVG não usa `currentColor` ou CSS variables

**Solução:**

1. Verificar SVG: deve ter `fill="currentColor"` ou `fill="var(--var-name, currentColor)"`
2. Se SVG tem cores hardcoded (`fill="#FF0000"`), substituir por `currentColor`

### Problema: GridView não atualiza ao mudar cor

**Causa:** `$effect` não está detectando mudança

**Solução:**

1. Verificar se `globalColor` é `$state`
2. Verificar se `$effect` depende de `globalColor`
3. Verificar se `canvasRefs` está populado

### Problema: Logo multi-colorido perde cores no GridView

**Causa:** Apenas `style.color` sendo aplicado, sem CSS variables

**Solução:**

1. Verificar se `hasMultipleColors(logoName)` retorna `true`
2. Verificar se configuração existe em `MULTI_COLOR_CONFIGS`
3. Verificar se SVG usa CSS variables corretas

---

## Decisões de Design

### Por que Canvas ao invés de SVG direto?

**Vantagens do Canvas:**

- Controle total sobre renderização
- Fundo pontilhado integrado
- Performance melhor com muitos logos
- Facilita aplicação de transformações

**Desvantagens:**

- Mais complexo de implementar
- Requer re-renderização em mudanças

### Por que Contraste Automático?

**Problema Real:**

- Usuários aplicam cores sem pensar em contraste
- Logos com texto sobreposto ficam ilegíveis
- Experiência ruim sem feedback visual

**Solução:**

- Automático = sem intervenção do usuário
- Baseado em ciência (luminância W3C)
- Sempre garante legibilidade

### Por que Threshold 0.179?

**Baseado em WCAG 2.0:**

- Contraste mínimo 4.5:1 para texto normal
- Threshold 0.179 garante esse contraste
- Testado e validado para acessibilidade

### Por que Renderizar em 2x?

**Qualidade Visual:**

- Evita aliasing em redimensionamento
- Mantém nitidez em diferentes tamanhos
- Compensa limitações do canvas

---

## Referências

- [WCAG 2.0 - Contrast Ratio](https://www.w3.org/TR/WCAG20/#contrast-ratiodef)
- [MDN - Canvas API](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API)
- [MDN - CSS Variables](https://developer.mozilla.org/en-US/docs/Web/CSS/Using_CSS_custom_properties)
- [Svelte 5 - Runes](https://svelte.dev/docs/svelte/$state)
- [Device Pixel Ratio](https://developer.mozilla.org/en-US/docs/Web/API/Window/devicePixelRatio)

| Logo                      | Cores Originais                      | Contraste Automático | Tipo de Sobreposição    |
| ------------------------- | ------------------------------------ | -------------------- | ----------------------- |
| **Banco Itaú**            | Azul (#003399) + Amarelo (#FFFF00)  | ✅ Sim               | Texto sobre fundo       |
| **Ágora Investimentos**   | Verde (#00C88D) + Branco (#FFFFFF)  | ❌ Não               | Texto abaixo do símbolo |
| **Caixa Econômica**       | Azul (#0070AF) + Laranja (#F6822A)  | ❌ Não               | Elementos lado a lado   |

### Configuração em `multi-color-utils.js`

**Localização:** `src/lib/utils/multi-color-utils.js`

#### Estrutura de Configuração

```javascript
export const MULTI_COLOR_CONFIGS = {
  "banco-itau": {
    elements: [
      {
        key: "bg",                              // Identificador único
        label: "Fundo",                         // Label para UI
        cssVar: "--itau-bg-color",              // CSS variable no SVG
        autoContrastVar: null,                  // Sem contraste automático
        defaultColor: "#003399",                // Cor original
        description: "Cor do fundo do logo",   // Descrição
      },
      {
        key: "text",
        label: "Texto",
        cssVar: "--itau-text-color",
        autoContrastVar: "--itau-auto-text-color", // ✅ Contraste automático
        defaultColor: "#FFFF00",
        description: "Cor do texto do logo",
      },
    ],
  },
  // ... outras configurações
};
```

#### Propriedades Importantes

- **`key`**: Identificador único do elemento (ex: "bg", "text", "blue", "orange")
- **`cssVar`**: Nome da CSS variable usada no SVG (ex: `--itau-bg-color`)
- **`autoContrastVar`**: CSS variable para contraste automático (ex: `--itau-auto-text-color`)
  - Se `null`: elemento não precisa de contraste automático
  - Se definido: elemento receberá cor contrastante automaticamente
- **`defaultColor`**: Cor original do logo (usada no modo individual)

### CSS Variables nos SVGs

#### Banco Itaú (`static/logos_bancos/banco-itau.svg`)

```svg
<svg>
  <style>
    .itau-bg {
      fill: var(--itau-bg-color, currentColor);
    }
    .itau-text {
      fill: var(--itau-text-color, var(--itau-auto-text-color, white));
      opacity: var(--itau-text-opacity, 0.9);
    }
  </style>
  <rect class="itau-bg" />
  <text class="itau-text">Itaú</text>
</svg>
```

**Cascata de Fallbacks:**

1. `--itau-text-color` (cor manual do usuário)
2. `--itau-auto-text-color` (contraste automático)
3. `white` (fallback final)

#### Caixa Econômica (`static/logos_bancos/caixa-economica.svg`)

```svg
<svg>
  <style>
    .caixa-blue {
      fill: var(--caixa-blue-color, currentColor);
    }
    .caixa-orange {
      fill: var(--caixa-orange-color, currentColor);
      opacity: 0.8;
    }
  </style>
  <path class="caixa-blue" d="..." />
  <path class="caixa-orange" d="..." />
</svg>
```

#### Ágora Investimentos (`static/logos_bancos/agora-investimentos.svg`)

```svg
<svg>
  <style>
    .agora-bg {
      fill: var(--agora-bg-color, currentColor);
    }
    .agora-text {
      fill: var(--agora-text-color, currentColor);
      opacity: 0.9;
    }
  </style>
  <rect class="agora-bg" />
  <text class="agora-text">ÁGORA</text>
</svg>
```

### Quando Usar Contraste Automático

**✅ Usar `autoContrastVar` quando:**

- Elemento de texto está SOBRE outro elemento (sobreposição)
- Ambos os elementos recebem cores do usuário
- Perda de contraste tornaria o texto invisível

**❌ NÃO usar `autoContrastVar` quando:**

- Elementos estão lado a lado (sem sobreposição)
- Elementos estão em posições separadas (acima/abaixo)
- Apenas um elemento recebe cor do usuário

**Exemplos:**

- **Itaú**: Texto amarelo DENTRO do quadrado azul → ✅ Precisa
- **Caixa**: Azul e laranja lado a lado → ❌ Não precisa
- **Ágora**: Texto branco ABAIXO do quadrado verde → ❌ Não precisa

---

## Arquivos e Funções Principais

### 1. `src/lib/components/GridView.svelte`

**Responsabilidades:**

- Renderização da grade de logos
- Controles globais (cor e tamanho)
- Renderização em canvas de alta qualidade
- Aplicação de contraste automático

**Funções Principais:**

#### `drawDottedPattern(ctx, width, height, dotColor)`

Desenha o padrão de fundo pontilhado (estilo Figma).

```javascript
function drawDottedPattern(ctx, width, height, dotColor = "#666666") {
  const dotSize = 1;
  const spacing = 15;

  ctx.fillStyle = dotColor;
  for (let x = 0; x < width; x += spacing) {
    for (let y = 0; y < height; y += spacing) {
      ctx.fillRect(x, y, dotSize, dotSize);
    }
  }
}
```

#### `renderLogoOnCanvas(canvas, svgContent, color, size, logoName)`

Renderiza um logo individual no canvas com alta qualidade.

**Parâmetros:**

- `canvas`: Elemento canvas HTML
- `svgContent`: String com conteúdo SVG
- `color`: Cor global a aplicar
- `size`: Tamanho do logo em pixels
- `logoName`: Nome do logo (para detectar multi-color)

**Fluxo:**

1. Configura canvas com DPI correto
2. Desenha fundo pontilhado
3. Parseia SVG e aplica cor
4. Aplica contraste automático (se necessário)
5. Cria imagem e renderiza no canvas

#### Aplicação no GridView

**Lógica:**

```javascript
if (hasMultipleColors(logoName)) {
  const config = getMultiColorConfig(logoName);

  config.elements.forEach((element) => {
    if (element.autoContrastVar) {
      // Determina cor do texto baseado no fundo
      const textColor = isDarkColor(color) ? "#ffffff" : "#000000";

      // Aplica via CSS variable
      svgElement.style.setProperty(element.autoContrastVar, textColor);
    }
  });
}
```

**Resultado:**

- Fundo escuro → Texto branco ✅
- Fundo claro → Texto preto ✅
- Contraste sempre legível
