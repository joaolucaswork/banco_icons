<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import * as Popover from "$lib/components/ui/popover";
  import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
    TooltipProvider,
  } from "$lib/components/ui/tooltip";
  import { Download, Palette, X } from "lucide-svelte";
  import { animate } from "motion";

  let {
    selectedCount = 0,
    onDownload = () => {},
    onColorChange = () => {},
    onClearSelection = () => {},
    currentColor = "#000000",
    class: className = "",
    ...restProps
  } = $props();

  // Popover state for format selection
  let formatPopoverOpen = $state(false);

  // Animation refs
  let buttonRef = $state();

  // Track if animation has already played
  let hasAnimated = $state(false);

  // Color picker ref
  let colorPickerRef = $state();
  let selectedColor = $state(currentColor);

  // Sync selectedColor with currentColor when it changes
  $effect(() => {
    selectedColor = currentColor;
  });

  // Animate button entrance only once
  $effect(() => {
    if (buttonRef && selectedCount > 0 && !hasAnimated) {
      // Animate in
      animate(
        buttonRef,
        {
          opacity: [0, 1],
          y: [20, 0],
          scale: [0.9, 1],
        },
        {
          duration: 0.3,
        },
      );
      hasAnimated = true;
    } else if (selectedCount === 0) {
      // Reset animation state when selection is cleared
      hasAnimated = false;
    }
  });

  // Handle download with format
  function handleDownload(format: "svg" | "png") {
    onDownload(format);
    formatPopoverOpen = false;
  }

  // Open native color picker directly
  function openColorPicker() {
    if (colorPickerRef) {
      colorPickerRef.click();
    }
  }

  // Handle color change with real-time preview
  function handleColorChange(event) {
    selectedColor = event.target.value;
    // Update in real-time
    onColorChange(selectedColor);
  }
</script>

{#if selectedCount > 0}
  <div
    bind:this={buttonRef}
    class="fixed bottom-8 left-1/2 z-50 -translate-x-1/2 {className}"
    {...restProps}
  >
    <div
      class="flex items-center gap-2 rounded-[12px] border border-white/10 bg-[#1a1a1a] px-3 py-2 shadow-2xl"
    >
      <!-- Hidden native color picker -->
      <input
        bind:this={colorPickerRef}
        type="color"
        bind:value={selectedColor}
        oninput={handleColorChange}
        class="pointer-events-none absolute opacity-0"
        aria-label="Seletor de cor para logos selecionados"
      />

      <!-- Clear Button and Counter Group -->
      <div class="flex items-center gap-2">
        <!-- Clear Selection Button -->
        <Button
          size="lg"
          onclick={onClearSelection}
          class="h-[44px] w-[44px] cursor-pointer border-0 bg-transparent p-0 transition-all hover:bg-white/10"
          aria-label="Limpar seleção"
        >
          <X class="h-4 w-4 text-white" />
        </Button>

        <!-- Selection Counter Display -->
        <div class="flex h-[44px] cursor-default items-center">
          <span class="text-sm font-semibold text-white">
            {selectedCount}
            {selectedCount === 1 ? "selecionado" : "selecionados"}
          </span>
        </div>
      </div>

      <!-- Color Picker Button (opens native picker directly) -->
      <TooltipProvider delayDuration={400}>
        <Tooltip>
          <TooltipTrigger asChild>
            {#snippet child({ props })}
              <Button
                {...props}
                size="lg"
                onclick={openColorPicker}
                class="h-[44px] w-[44px] bg-transparent p-0 text-base font-medium transition-all hover:bg-white/10"
                aria-label="Alterar cor"
              >
                <Palette class="h-4 w-4 text-white" />
              </Button>
            {/snippet}
          </TooltipTrigger>
          <TooltipContent side="top">
            <p>Alterar cor</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <!-- Download Button -->
      <Popover.Root bind:open={formatPopoverOpen}>
        <Popover.Trigger asChild>
          {#snippet child({ props })}
            <Button
              {...props}
              size="lg"
              class="h-[44px] w-[44px] bg-transparent p-0 text-base font-medium shadow-lg transition-all hover:bg-white/10 hover:shadow-xl"
              aria-label="Baixar selecionados"
            >
              <Download class="h-4 w-4 text-white" />
            </Button>
          {/snippet}
        </Popover.Trigger>
        <Popover.Content
          class="w-48 border-0 bg-gray-100 p-3"
          align="center"
          side="top"
          sideOffset={8}
          portalProps={{}}
        >
          <div class="flex flex-col gap-2">
            <p
              class="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-600"
            >
              Escolha um formato
            </p>
            <Button
              variant="ghost"
              size="sm"
              disabled={false}
              class="w-full justify-start text-gray-900 hover:bg-gray-200 hover:text-gray-900"
              onclick={() => handleDownload("svg")}
            >
              SVG
            </Button>
            <Button
              variant="ghost"
              size="sm"
              disabled={false}
              class="w-full justify-start text-gray-900 hover:bg-gray-200 hover:text-gray-900"
              onclick={() => handleDownload("png")}
            >
              PNG
            </Button>
          </div>
        </Popover.Content>
      </Popover.Root>
    </div>
  </div>
{/if}
