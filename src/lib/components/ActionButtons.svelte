<script>
import * as DropdownMenu from "$lib/components/ui/dropdown-menu";
import { Button } from "$lib/components/ui/button";
import {
  getBankDisplayName,
  downloadSvgAsPng,
  downloadSvgAsFile,
  copyToClipboard,
} from "$lib/utils/svg-utils.js";
import { cn } from "$lib/utils.js";
import { toast } from "svelte-sonner";

import { Copy, Download } from "lucide-svelte";

let {
  selectedLogo = null,
  modifiedSvg = null,
  formattedSvg = null,
  size = 256,
  loading = false,
  class: className = "",
  ...restProps
} = $props();

// Handle copy SVG to clipboard
async function handleCopySvg() {
  if (!formattedSvg || !selectedLogo) {
    toast.error("Nenhum logo selecionado para copiar.");
    return;
  }

  const bankName = getBankDisplayName(selectedLogo);
  const success = await copyToClipboard(formattedSvg);

  if (success) {
    toast.success(`Código SVG do ${bankName} copiado!`);
  } else {
    toast.error("Falha ao copiar código SVG. Tente novamente.");
  }
}

// Handle PNG download
async function handleDownloadPng() {
  if (!modifiedSvg || !selectedLogo) {
    return;
  }

  const filename = `${selectedLogo}-${size}px`;
  await downloadSvgAsPng(modifiedSvg, filename, size);
}

// Handle SVG download
async function handleDownloadSvg() {
  if (!formattedSvg || !selectedLogo) {
    return;
  }

  const filename = `${selectedLogo}-${size}px`;
  downloadSvgAsFile(formattedSvg, filename);
}
</script>

<!-- Action Buttons -->
{#if selectedLogo && modifiedSvg && formattedSvg}
  <div
    class={cn("flex items-center gap-2 rounded-lg border border-border bg-background p-1", className)}
    {...restProps}
  >
    <!-- Copy SVG Button -->
    <Button
      variant="outline"
      size="icon"
      class="h-14 w-14 shrink-0"
      onclick={handleCopySvg}
      title="Copiar código SVG"
      disabled={loading}
    >
      <Copy class="h-6 w-6" />
    </Button>

    <!-- Divisor Vertical -->
    <div class="h-8 w-px bg-border"></div>

    <!-- Download Dropdown Button -->
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        {#snippet child({ props })}
          <Button
            {...props}
            variant="outline"
            size="icon"
            class="h-14 w-14 shrink-0"
            title="Opções de download"
            disabled={loading}
          >
            <Download class="h-6 w-6" />
          </Button>
        {/snippet}
      </DropdownMenu.Trigger>
      <DropdownMenu.Content
        align="center"
        side="bottom"
        sideOffset={8}
        alignOffset={0}
        class="w-fit min-w-[80px] p-0"
        portalProps={{}}
      >
        <DropdownMenu.Item
          onclick={handleDownloadPng}
          class="!flex w-full !items-center !justify-center !gap-0 !px-0 !py-3 !text-center !text-base !font-medium"
          inset={false}
        >
          PNG
        </DropdownMenu.Item>
        <DropdownMenu.Separator class="!mx-0 !my-1" />
        <DropdownMenu.Item
          onclick={handleDownloadSvg}
          class="!flex w-full !items-center !justify-center !gap-0 !px-0 !py-3 !text-center !text-base !font-medium"
          inset={false}
        >
          SVG
        </DropdownMenu.Item>
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  </div>
{/if}
