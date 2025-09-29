<script>
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "$lib/components/ui/dialog";
import { Button } from "$lib/components/ui/button";
import { copyToClipboard } from "$lib/utils/svg-utils.js";
import { Copy } from "lucide-svelte";
import { toast } from "svelte-sonner";

let { open = $bindable(false), svgCode = "", bankName = "" } = $props();

// Debug: Log received SVG code
$effect(() => {
  if (open && svgCode) {
    console.log(
      "WebflowDialog received SVG:",
      svgCode.substring(0, 200) + "...",
    );
    console.log("Contains CSS classes?", svgCode.includes("class="));
    console.log("Contains CSS variables?", svgCode.includes("var(--"));
    console.log(
      "Contains style attribute?",
      svgCode.includes('style="width: 100%'),
    );
  }
});

async function handleCopy() {
  const success = await copyToClipboard(svgCode);
  if (success) {
    toast.success("Código SVG otimizado copiado para a área de transferência!");
  } else {
    toast.error("Falha ao copiar código. Tente novamente.");
  }
}

// Ultra-safe syntax highlighting that avoids all regex overlap issues
function highlightXml(code) {
  if (!code) return "";

  // First escape HTML entities
  let result = code
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  // Use a token-based approach to avoid regex conflicts
  // Replace each pattern with a unique token first, then replace tokens with HTML
  const tokens = {
    TAG_START: "___TAG_START___",
    TAG_END: "___TAG_END___",
    ATTR_START: "___ATTR_START___",
    ATTR_END: "___ATTR_END___",
    VALUE_START: "___VALUE_START___",
    VALUE_END: "___VALUE_END___",
  };

  // Step 1: Mark tag names with tokens
  result = result.replace(
    /(&lt;\/?)([\w-]+)/g,
    `$1${tokens.TAG_START}$2${tokens.TAG_END}`,
  );

  // Step 2: Mark attribute names with tokens (only match attributes that are NOT inside our tokens)
  result = result.replace(
    /(\s)([\w-]+)(=)(?![^<]*___)/g,
    `$1${tokens.ATTR_START}$2${tokens.ATTR_END}$3`,
  );

  // Step 3: Mark attribute values with tokens
  result = result.replace(
    /="([^"]*)"/g,
    `="${tokens.VALUE_START}$1${tokens.VALUE_END}"`,
  );

  // Step 4: Replace tokens with actual HTML spans
  result = result
    .replace(
      new RegExp(tokens.TAG_START, "g"),
      '<span class="text-blue-400 font-semibold">',
    )
    .replace(new RegExp(tokens.TAG_END, "g"), "</span>")
    .replace(
      new RegExp(tokens.ATTR_START, "g"),
      '<span class="text-green-400">',
    )
    .replace(new RegExp(tokens.ATTR_END, "g"), "</span>")
    .replace(
      new RegExp(tokens.VALUE_START, "g"),
      '<span class="text-orange-400">',
    )
    .replace(new RegExp(tokens.VALUE_END, "g"), "</span>");

  // Step 5: Handle comments (safe since they don't contain our tokens)
  result = result.replace(
    /(&lt;!--.*?--&gt;)/g,
    '<span class="text-gray-500 italic">$1</span>',
  );

  return result;
}

let highlightedCode = $derived.by(() => {
  const highlighted = highlightXml(svgCode);
  if (open && svgCode) {
    console.log("Original SVG (first 200 chars):", svgCode.substring(0, 200));
    console.log(
      "Highlighted SVG (first 200 chars):",
      highlighted.substring(0, 200),
    );
  }
  return highlighted;
});
</script>

<Dialog bind:open={open}>
  <DialogContent
    class="max-h-[90vh] w-[95vw] max-w-4xl overflow-x-hidden overflow-y-auto"
    portalProps={{}}
    showCloseButton={true}
  >
    <DialogHeader class="">
      <div class="flex items-center gap-3">
        <!-- Webflow Icon -->
        <div
          class="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100"
        >
          <svg
            class="h-6 w-6"
            viewBox="0 0 32 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <g clip-path="url(#clip0_4_21)">
              <path
                fill-rule="evenodd"
                clip-rule="evenodd"
                d="M31.9998 0L21.789 19.9906H12.1981L16.4714 11.7057H16.2796C12.7543 16.2888 7.49436 19.3059 -0.000236511 19.9906V11.8203C-0.000236511 11.8203 4.79424 11.5367 7.61276 8.56902H-0.000236511V0.00015727H8.55596V7.04792L8.74799 7.04715L12.2443 0.00015727H18.7152V7.00323L18.9072 7.00294L22.5347 0H31.9998Z"
                fill="#146EF5"
              />
            </g>
            <defs>
              <clipPath id="clip0_4_21">
                <rect width="32" height="20" />
              </clipPath>
            </defs>
          </svg>
        </div>
        <DialogTitle class="text-xl font-semibold text-foreground">
          Integração com Webflow
        </DialogTitle>
      </div>
    </DialogHeader>

    <div class="space-y-6">
      <!-- Code Block -->
      <div
        class="max-w-full overflow-hidden rounded-lg border border-border bg-muted"
      >
        <!-- Header -->
        <div
          class="flex items-center justify-between border-b border-border bg-muted/50 px-4 py-2"
        >
          <div class="flex items-center gap-2">
            <h3 class="text-sm font-medium text-foreground">
              Código SVG - {bankName}
            </h3>
            <span
              class="rounded bg-muted px-2 py-1 text-xs text-muted-foreground uppercase"
            >
              SVG
            </span>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onclick={handleCopy}
            class="h-8 px-2 text-muted-foreground hover:bg-accent hover:text-foreground"
            disabled={!svgCode}
          >
            <Copy class="mr-1 h-4 w-4" />
            Copiar
          </Button>
        </div>

        <!-- Code Content -->
        <div class="relative max-w-full overflow-hidden">
          <pre
            class="max-h-96 overflow-y-auto bg-background p-4 text-sm leading-relaxed text-foreground"
            style="overflow-x: hidden; word-wrap: break-word; white-space: pre-wrap; overflow-wrap: anywhere;"><code
              class="block w-full"
              style="word-wrap: break-word; white-space: pre-wrap; overflow-wrap: anywhere;"
              >{@html highlightedCode}</code
            ></pre>

          {#if !svgCode}
            <div
              class="absolute inset-0 flex items-center justify-center bg-muted/75"
            >
              <p class="text-sm text-muted-foreground">
                Nenhum código para exibir
              </p>
            </div>
          {/if}
        </div>
      </div>

      <!-- Instructions -->
      <div class="space-y-6">
        <h3 class="text-xl font-semibold text-foreground">
          Como usar no Webflow
        </h3>

        <div class="space-y-6">
          <!-- Step 1 -->
          <div class="flex items-start gap-4">
            <div
              class="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white text-sm font-bold text-white"
            >
              1
            </div>
            <div class="flex-1 pt-1">
              <p class="text-base break-words text-foreground">
                Copie o código SVG usando o botão acima
              </p>
            </div>
          </div>

          <!-- Divider -->
          <div class="border-t border-border"></div>

          <!-- Step 2 -->
          <div class="flex items-start gap-4">
            <div
              class="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white text-sm font-bold text-white"
            >
              2
            </div>
            <div class="flex-1 pt-1">
              <p class="text-base break-words text-foreground">
                No Webflow Designer, adicione um elemento "HTML Embed" onde
                deseja o ícone
              </p>
            </div>
          </div>

          <!-- Divider -->
          <div class="border-t border-border"></div>

          <!-- Step 3 -->
          <div class="flex items-start gap-4">
            <div
              class="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white text-sm font-bold text-white"
            >
              3
            </div>
            <div class="flex-1 pt-1">
              <p class="text-base break-words text-foreground">
                Cole o código SVG no editor HTML Embed e salve
              </p>
            </div>
          </div>

          <!-- Divider -->
          <div class="border-t border-border"></div>

          <!-- Step 4 - Sizing Control -->
          <div class="flex items-start gap-4">
            <div
              class="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white text-sm font-bold text-white"
            >
              4
            </div>
            <div class="flex-1 pt-1">
              <p class="text-base break-words text-foreground">
                <strong>Controle o tamanho:</strong> Use os controles de largura
                e altura do Webflow para redimensionar o logo. O SVG se ajustará
                automaticamente mantendo as proporções.
              </p>
            </div>
          </div>

          <!-- Divider -->
          <div class="border-t border-border"></div>

          <!-- Compatibility tip -->
          <div class="flex items-start gap-4">
            <div
              class="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white text-sm font-bold text-white"
            >
              ✅
            </div>
            <div class="flex-1 pt-1">
              <p class="text-base break-words text-foreground">
                <strong>Código responsivo:</strong> Este SVG foi otimizado para Webflow
                com dimensões responsivas. Todas as cores são hard-coded e não há
                dependências CSS.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </DialogContent>
</Dialog>

<style>
pre {
  font-family: "Monaco", "Menlo", "Ubuntu Mono", monospace;
  /* Force text wrapping and prevent horizontal scroll */
  word-wrap: break-word !important;
  white-space: pre-wrap !important;
  overflow-wrap: anywhere !important;
  max-width: 100% !important;
  box-sizing: border-box !important;
}

code {
  font-family: inherit;
  /* Ensure code also wraps properly */
  word-wrap: break-word !important;
  white-space: pre-wrap !important;
  overflow-wrap: anywhere !important;
  display: block !important;
  max-width: 100% !important;
  box-sizing: border-box !important;
}

/* Ensure dialog content doesn't overflow */
:global(.dialog-content) {
  max-width: 100vw !important;
  overflow-x: hidden !important;
}

/* Ensure all text content wraps properly */
.space-y-6 p,
.space-y-6 code {
  word-wrap: break-word !important;
  overflow-wrap: anywhere !important;
  max-width: 100% !important;
}
</style>
