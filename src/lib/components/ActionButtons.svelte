<script>
import * as Popover from "$lib/components/ui/popover";
import { Button } from "$lib/components/ui/button";
import { Input } from "$lib/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "$lib/components/ui/tooltip";
import WebflowDialog from "$lib/components/WebflowDialog.svelte";
import {
  getBankDisplayName,
  downloadSvgAsPng,
  downloadSvgAsFile,
  copyToClipboard,
  createWebflowOptimizedSvg,
} from "$lib/utils/svg-utils.js";
import { cn } from "$lib/utils.js";
import { toast } from "svelte-sonner";

import { Copy, Download, Maximize2, Grid3x3, Maximize } from "lucide-svelte";

let {
  selectedLogo = null,
  modifiedSvg = null,
  formattedSvg = null,
  size = 256,
  loading = false,
  viewMode = "single",
  onViewModeToggle = () => {},
  showOnlyToggle = false,
  class: className = "",
  ...restProps
} = $props();

// State for Webflow dialog
let isWebflowDialogOpen = $state(false);

// State for download popover
let isDownloadPopoverOpen = $state(false);

// Custom export size (defaults to the current size prop)
let customExportSize = $state(size);

// Generate optimized SVG for Webflow dialog
const webflowOptimizedSvg = $derived(
  formattedSvg ? createWebflowOptimizedSvg(formattedSvg) : "",
);

// Debug: Log the SVG content when dialog opens
$effect(() => {
  if (isWebflowDialogOpen && webflowOptimizedSvg) {
    console.log(
      "Webflow Dialog SVG Content:",
      webflowOptimizedSvg.substring(0, 200) + "...",
    );
  }
});

// Sync customExportSize with size prop when it changes
$effect(() => {
  customExportSize = size;
});

// Handle copy SVG to clipboard
async function handleCopySvg() {
  if (!formattedSvg || !selectedLogo) {
    toast.error("Nenhum logo selecionado para copiar.");
    return;
  }

  // Use Webflow-optimized SVG for better compatibility
  const optimizedSvg = createWebflowOptimizedSvg(formattedSvg);
  const success = await copyToClipboard(optimizedSvg);

  if (success) {
    toast.success("SVG copiado");
  } else {
    toast.error("Falha ao copiar código SVG. Tente novamente.");
  }
}

// Handle PNG download
async function handleDownloadPng() {
  if (!modifiedSvg || !selectedLogo) {
    return;
  }

  const exportSize = customExportSize || size;
  const filename = `${selectedLogo}-${exportSize}px`;
  const success = await downloadSvgAsPng(modifiedSvg, filename, exportSize);

  if (success) {
    const bankName = getBankDisplayName(selectedLogo);
    toast.success(`${bankName} baixado como PNG!`);
    isDownloadPopoverOpen = false;
  } else {
    toast.error("Falha ao baixar PNG. Tente novamente.");
  }
}

// Handle SVG download
async function handleDownloadSvg() {
  if (!formattedSvg || !selectedLogo) {
    return;
  }

  const exportSize = customExportSize || size;
  const filename = `${selectedLogo}-${exportSize}px`;
  const success = downloadSvgAsFile(formattedSvg, filename);

  if (success) {
    const bankName = getBankDisplayName(selectedLogo);
    toast.success(`${bankName} baixado como SVG!`);
    isDownloadPopoverOpen = false;
  } else {
    toast.error("Falha ao baixar SVG. Tente novamente.");
  }
}

// Handle open in Webflow
function handleOpenInWebflow() {
  if (!formattedSvg || !selectedLogo) {
    toast.error("Nenhum logo selecionado para integração com Webflow.");
    return;
  }

  isWebflowDialogOpen = true;
}
</script>

<!-- Action Buttons -->
<TooltipProvider delayDuration={400}>
  <div
    class={cn("action-buttons-group flex flex-wrap justify-between gap-2 sm:justify-start", className)}
    {...restProps}
  >
    <!-- View Mode Toggle Button -->
    <Tooltip disableHoverableContent={false} disableCloseOnTriggerClick={true}>
      <TooltipTrigger asChild>
        {#snippet child({ props })}
          <Button
            {...props}
            variant="outline"
            size="icon"
            class="h-12 w-12 shrink-0 !text-white transition-all duration-200 hover:!bg-white/10 hover:!text-white sm:h-14 sm:w-14"
            onclick={onViewModeToggle}
            disabled={loading}
          >
            {#if viewMode === "single"}
              <Grid3x3 class="h-5 w-5 sm:h-6 sm:w-6" />
            {:else}
              <Maximize class="h-5 w-5 sm:h-6 sm:w-6" />
            {/if}
          </Button>
        {/snippet}
      </TooltipTrigger>
      <TooltipContent side="top" align="center" sideOffset={8}>
        <p class="text-sm">
          {viewMode === "single" ? "Modo Lista" : "Modo Individual"}
        </p>
        <p class="text-xs text-muted-foreground">
          {viewMode === "single" ? "Ver todos os logos" : "Ver logo único"}
        </p>
      </TooltipContent>
    </Tooltip>

    {#if !showOnlyToggle && selectedLogo && modifiedSvg && formattedSvg}
      <!-- Open in Webflow Button -->
      <Tooltip
        disableHoverableContent={false}
        disableCloseOnTriggerClick={true}
      >
        <TooltipTrigger asChild>
          {#snippet child({ props })}
            <Button
              {...props}
              variant="outline"
              size="icon"
              class="h-12 w-12 shrink-0 !text-white transition-all duration-200 hover:!bg-white/10 hover:!text-white sm:h-14 sm:w-14"
              onclick={handleOpenInWebflow}
              disabled={loading}
            >
              <!-- Webflow Icon SVG - Recreated -->
              <svg
                class="h-5 w-5 sm:h-6 sm:w-6"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
                style="fill: white !important; stroke: none !important;"
              >
                <path
                  d="M21 2L13.5 17H7.5L10.5 10.5H10.3C8 13.5 4.5 16 0 17V10C0 10 3 9.8 4.8 7.5H0V2H6V7L6.2 7L8.5 2H13V7L13.2 7L15.8 2H21Z"
                  style="fill: white !important; stroke: none !important;"
                />
              </svg>
            </Button>
          {/snippet}
        </TooltipTrigger>
        <TooltipContent
          side="top"
          align="center"
          sideOffset={8}
          class=""
          arrowClasses=""
        >
          <p class="text-sm">Integrar com Webflow</p>
          <p class="text-xs text-muted-foreground">
            Abre instruções de integração
          </p>
        </TooltipContent>
      </Tooltip>

      <!-- Copy SVG Button -->
      <Tooltip
        disableHoverableContent={false}
        disableCloseOnTriggerClick={true}
      >
        <TooltipTrigger asChild>
          {#snippet child({ props })}
            <Button
              {...props}
              variant="outline"
              size="icon"
              class="h-12 w-12 shrink-0 !text-white transition-all duration-200 hover:!bg-white/10 hover:!text-white sm:h-14 sm:w-14"
              onclick={handleCopySvg}
              disabled={loading}
            >
              <Copy class="h-5 w-5 sm:h-6 sm:w-6" />
            </Button>
          {/snippet}
        </TooltipTrigger>
        <TooltipContent
          side="top"
          align="center"
          sideOffset={8}
          class=""
          arrowClasses=""
        >
          <p class="text-sm">Copiar código SVG</p>
          <p class="text-xs text-muted-foreground">
            Copia para área de transferência
          </p>
        </TooltipContent>
      </Tooltip>

      <!-- Download Popover Button -->
      <Popover.Root bind:open={isDownloadPopoverOpen}>
        <Popover.Trigger asChild>
          {#snippet child({ props })}
            <Button
              {...props}
              variant="outline"
              size="icon"
              class="h-12 w-12 shrink-0 border-[1px] !text-white transition-colors duration-200 hover:!bg-white/10 hover:!text-white sm:h-14 sm:w-14"
              disabled={loading}
            >
              <Download class="h-5 w-5 sm:h-6 sm:w-6" />
            </Button>
          {/snippet}
        </Popover.Trigger>
        <Popover.Content
          align="end"
          side="bottom"
          sideOffset={8}
          class="z-[60] w-80 border-border/50 bg-background/95 p-4 backdrop-blur-sm"
          portalProps={{}}
        >
          <div class="flex flex-col gap-4">
            <!-- Custom Size Input -->
            <div class="relative">
              <Maximize2
                class="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground"
              />
              <Input
                id="export-size"
                type="number"
                bind:value={customExportSize}
                min={16}
                max={2048}
                step={1}
                placeholder="Tamanho (px)"
                class="h-10 w-full [appearance:textfield] border-white/20 pr-3 pl-10 font-mono [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                style="background-color: rgba(255, 255, 255, 0.15) !important;"
              />
            </div>

            <!-- Format Selection -->
            <div class="flex flex-col gap-2">
              <span
                class="text-xs font-medium tracking-wide text-muted-foreground uppercase"
                >Selecione o formato:</span
              >
              <div class="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  class="h-12 border-border/50 bg-background/50 font-semibold transition-all hover:scale-105 hover:border-foreground/30 hover:bg-accent active:scale-95"
                  onclick={handleDownloadPng}
                >
                  PNG
                </Button>
                <Button
                  variant="outline"
                  class="h-12 border-border/50 bg-background/50 font-semibold transition-all hover:scale-105 hover:border-foreground/30 hover:bg-accent active:scale-95"
                  onclick={handleDownloadSvg}
                >
                  SVG
                </Button>
              </div>
            </div>
          </div>
        </Popover.Content>
      </Popover.Root>
    {/if}
  </div>
</TooltipProvider>

<!-- Webflow Dialog -->
<WebflowDialog
  bind:open={isWebflowDialogOpen}
  svgCode={webflowOptimizedSvg}
  bankName={selectedLogo ? getBankDisplayName(selectedLogo) : ""}
/>
