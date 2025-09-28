<script>
import * as DropdownMenu from "$lib/components/ui/dropdown-menu";
import { Button } from "$lib/components/ui/button";
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

// State for Webflow dialog
let isWebflowDialogOpen = $state(false);

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

// Handle open in Figma
async function handleOpenInFigma() {
  if (!formattedSvg || !selectedLogo) {
    toast.error("Nenhum logo selecionado para abrir no Figma.");
    return;
  }

  const bankName = getBankDisplayName(selectedLogo);

  // Copy SVG to clipboard first
  const success = await copyToClipboard(formattedSvg);

  if (success) {
    // Try to open Figma desktop app first, then fallback to web
    window.open("figma://", "_blank");

    // If desktop app doesn't open or after a short delay, open web version
    setTimeout(() => {
      window.open("https://www.figma.com/", "_blank");
    }, 500);

    toast.success(
      `SVG do ${bankName} copiado! Cole no Figma com Ctrl+V (Cmd+V no Mac)`,
      {
        duration: 5000,
        description: "O Figma foi aberto. Cole o SVG em um novo arquivo.",
      },
    );
  } else {
    toast.error("Falha ao copiar SVG. Tente novamente.");
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
{#if selectedLogo && modifiedSvg && formattedSvg}
  <TooltipProvider delayDuration={400}>
    <div
      class={cn("flex items-center gap-2 rounded-lg border border-border bg-background p-1", className)}
      {...restProps}
    >
      <!-- Open in Figma Button -->
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
              class="h-14 w-14 shrink-0 transition-all duration-200 hover:scale-105 hover:!bg-white/10 hover:!text-current active:scale-95"
              onclick={handleOpenInFigma}
              disabled={loading}
            >
              <!-- Figma Icon SVG -->
              <svg
                class="h-6 w-6"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M8 24C10.2091 24 12 22.2091 12 20V16H8C5.79086 16 4 17.7909 4 20C4 22.2091 5.79086 24 8 24Z"
                  fill="currentColor"
                />
                <path
                  d="M4 12C4 9.79086 5.79086 8 8 8H12V16H8C5.79086 16 4 14.2091 4 12Z"
                  fill="currentColor"
                />
                <path
                  d="M4 4C4 1.79086 5.79086 0 8 0H12V8H8C5.79086 8 4 6.20914 4 4Z"
                  fill="currentColor"
                />
                <path
                  d="M12 0H16C18.2091 0 20 1.79086 20 4C20 6.20914 18.2091 8 16 8H12V0Z"
                  fill="currentColor"
                />
                <path
                  d="M20 12C20 14.2091 18.2091 16 16 16C13.7909 16 12 14.2091 12 12C12 9.79086 13.7909 8 16 8C18.2091 8 20 9.79086 20 12Z"
                  fill="currentColor"
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
          <p class="text-sm">Abrir no Figma</p>
          <p class="text-xs text-muted-foreground">Copia SVG e abre o Figma</p>
        </TooltipContent>
      </Tooltip>

      <!-- Divisor Vertical -->
      <div class="h-8 w-px bg-border"></div>

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
              class="h-14 w-14 shrink-0 transition-all duration-200 hover:scale-105 hover:!bg-white/10 hover:!text-current active:scale-95"
              onclick={handleOpenInWebflow}
              disabled={loading}
            >
              <!-- Webflow Icon SVG -->
              <svg
                class="h-6 w-6"
                viewBox="0 0 32 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <g clip-path="url(#clip0_webflow_button)">
                  <path
                    fill-rule="evenodd"
                    clip-rule="evenodd"
                    d="M31.9998 0L21.789 19.9906H12.1981L16.4714 11.7057H16.2796C12.7543 16.2888 7.49436 19.3059 -0.000236511 19.9906V11.8203C-0.000236511 11.8203 4.79424 11.5367 7.61276 8.56902H-0.000236511V0.00015727H8.55596V7.04792L8.74799 7.04715L12.2443 0.00015727H18.7152V7.00323L18.9072 7.00294L22.5347 0H31.9998Z"
                    fill="currentColor"
                  />
                </g>
                <defs>
                  <clipPath id="clip0_webflow_button">
                    <rect width="32" height="20" fill="white" />
                  </clipPath>
                </defs>
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

      <!-- Divisor Vertical -->
      <div class="h-8 w-px bg-border"></div>

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
              class="h-14 w-14 shrink-0 transition-all duration-200 hover:scale-105 hover:!bg-white/10 hover:!text-current active:scale-95"
              onclick={handleCopySvg}
              disabled={loading}
            >
              <Copy class="h-6 w-6" />
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

      <!-- Divisor Vertical -->
      <div class="h-8 w-px bg-border"></div>

      <!-- Download Dropdown Button -->
      <Tooltip
        disableHoverableContent={false}
        disableCloseOnTriggerClick={true}
      >
        <TooltipTrigger asChild>
          {#snippet child({ props: tooltipProps })}
            <DropdownMenu.Root>
              <DropdownMenu.Trigger asChild>
                {#snippet child({ props })}
                  <Button
                    {...props}
                    {...tooltipProps}
                    variant="outline"
                    size="icon"
                    class="h-14 w-14 shrink-0 transition-all duration-200 hover:scale-105 hover:!bg-white/10 hover:!text-current active:scale-95"
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
          {/snippet}
        </TooltipTrigger>
        <TooltipContent
          side="top"
          align="center"
          sideOffset={8}
          class=""
          arrowClasses=""
        >
          <p class="text-sm">Baixar logo</p>
          <p class="text-xs text-muted-foreground">PNG ou SVG</p>
        </TooltipContent>
      </Tooltip>
    </div>
  </TooltipProvider>
{/if}

<!-- Webflow Dialog -->
<WebflowDialog
  bind:open={isWebflowDialogOpen}
  svgCode={formattedSvg || ""}
  bankName={selectedLogo ? getBankDisplayName(selectedLogo) : ""}
/>
