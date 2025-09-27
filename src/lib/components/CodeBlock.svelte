<script>
import { Button } from "$lib/components/ui/button";
import { copyToClipboard } from "$lib/utils/svg-utils.js";
import { Copy } from "lucide-svelte";
import { toast } from "svelte-sonner";

let { code = "", language = "xml", title = "Code" } = $props();

async function handleCopy() {
  const success = await copyToClipboard(code);
  if (success) {
    toast.success("Code copied to clipboard!");
  } else {
    toast.error("Failed to copy code. Please try again.");
  }
}

// Simple syntax highlighting for XML/SVG
function highlightXml(code) {
  return code
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(
      /(&lt;\/?)([\w-]+)/g,
      '$1<span class="text-blue-600 font-semibold">$2</span>',
    )
    .replace(/([\w-]+)(=)/g, '<span class="text-green-600">$1</span>$2')
    .replace(/="([^"]*)"/g, '="<span class="text-orange-600">$1</span>"')
    .replace(
      /(&lt;!--.*?--&gt;)/g,
      '<span class="text-gray-500 italic">$1</span>',
    );
}

let highlightedCode = $derived.by(() => {
  if (language === "xml" || language === "svg") {
    return highlightXml(code);
  }
  return code
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
});
</script>

<div class="overflow-hidden rounded-lg border border-border bg-muted">
  <!-- Header -->
  <div
    class="flex items-center justify-between border-b border-border bg-muted/50 px-4 py-2"
  >
    <div class="flex items-center gap-2">
      <h3 class="text-sm font-medium text-foreground">{title}</h3>
      <span
        class="rounded bg-muted px-2 py-1 text-xs text-muted-foreground uppercase"
      >
        {language}
      </span>
    </div>

    <Button
      variant="ghost"
      size="sm"
      onclick={handleCopy}
      class="h-8 px-2 text-muted-foreground hover:bg-accent hover:text-foreground"
      disabled={!code}
    >
      <Copy class="mr-1 h-4 w-4" />
      Copy
    </Button>
  </div>

  <!-- Code Content -->
  <div class="relative">
    <pre
      class="max-h-96 overflow-x-auto overflow-y-auto bg-background p-4 text-sm leading-relaxed text-foreground"><code
        >{@html highlightedCode}</code
      ></pre>

    {#if !code}
      <div
        class="absolute inset-0 flex items-center justify-center bg-muted/75"
      >
        <p class="text-sm text-muted-foreground">No code to display</p>
      </div>
    {/if}
  </div>
</div>

<style>
pre {
  font-family: "Monaco", "Menlo", "Ubuntu Mono", monospace;
}

code {
  font-family: inherit;
}
</style>
