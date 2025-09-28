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

async function handleCopy() {
  const success = await copyToClipboard(svgCode);
  if (success) {
    toast.success("Código SVG copiado para a área de transferência!");
  } else {
    toast.error("Falha ao copiar código. Tente novamente.");
  }
}

// Simple syntax highlighting for XML/SVG with proper formatting
function highlightXml(code) {
  // First, format the SVG with proper indentation and line breaks
  const formatted = formatSvgCode(code);

  return formatted
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(
      /(&lt;\/?)([\w-]+)/g,
      '$1<span class="text-blue-400 font-semibold">$2</span>',
    )
    .replace(/([\w-]+)(=)/g, '<span class="text-green-400">$1</span>$2')
    .replace(/="([^"]*)"/g, '="<span class="text-orange-400">$1</span>"')
    .replace(
      /(&lt;!--.*?--&gt;)/g,
      '<span class="text-gray-500 italic">$1</span>',
    );
}

// Format SVG code with proper indentation and line breaks
function formatSvgCode(code) {
  if (!code) return code;

  // Add line breaks after > and before <
  let formatted = code
    .replace(/></g, ">\n<")
    .replace(/\s+/g, " ") // Normalize whitespace
    .trim();

  // Add proper indentation
  const lines = formatted.split("\n");
  let indentLevel = 0;
  const indentSize = 2;

  return lines
    .map((line) => {
      const trimmed = line.trim();
      if (!trimmed) return "";

      // Decrease indent for closing tags
      if (trimmed.startsWith("</")) {
        indentLevel = Math.max(0, indentLevel - 1);
      }

      const indented = " ".repeat(indentLevel * indentSize) + trimmed;

      // Increase indent for opening tags (but not self-closing)
      if (
        trimmed.startsWith("<") &&
        !trimmed.startsWith("</") &&
        !trimmed.endsWith("/>")
      ) {
        indentLevel++;
      }

      return indented;
    })
    .join("\n");
}

let highlightedCode = $derived.by(() => {
  return highlightXml(svgCode);
});
</script>

<Dialog bind:open={open}>
  <DialogContent
    class="max-h-[90vh] max-w-4xl overflow-y-auto"
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
                <rect width="32" height="20" fill="white" />
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
      <div class="overflow-hidden rounded-lg border border-border bg-muted">
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
        <div class="relative">
          <pre
            class="max-h-96 overflow-x-auto overflow-y-auto bg-background p-4 text-sm leading-relaxed break-words whitespace-pre-wrap text-foreground"><code
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
              <p class="text-base text-foreground">
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
              <p class="text-base text-foreground">
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
              <p class="text-base text-foreground">
                Cole o código SVG no editor HTML Embed e salve
              </p>
            </div>
          </div>

          <!-- Divider -->
          <div class="border-t border-border"></div>

          <!-- Color tip -->
          <div class="flex items-start gap-4">
            <div
              class="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white text-sm font-bold text-white"
            >
              💡
            </div>
            <div class="flex-1 pt-1">
              <p class="text-base text-foreground">
                <strong>Para alterar cores:</strong> Use a propriedade CSS
                <code
                  class="rounded bg-muted px-2 py-1 font-mono text-sm text-foreground"
                  >fill</code
                >
                ou
                <code
                  class="rounded bg-muted px-2 py-1 font-mono text-sm text-foreground"
                  >color</code
                > no elemento pai
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
}

code {
  font-family: inherit;
}
</style>
