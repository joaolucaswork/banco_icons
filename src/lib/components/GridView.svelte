<script lang="ts">
  import { Card, CardContent } from "$lib/components/ui/card";
  import { Slider } from "$lib/components/ui/slider";
  import { Label } from "$lib/components/ui/label";
  import { Input } from "$lib/components/ui/input";
  import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
    TooltipProvider,
  } from "$lib/components/ui/tooltip";
  import {
    Popover,
    PopoverContent,
    PopoverTrigger,
  } from "$lib/components/ui/popover";
  import { RadioGroup, RadioGroupItem } from "$lib/components/ui/radio-group";
  import LogoCard from "./LogoCard.svelte";
  import FloatingDownloadButton from "./FloatingDownloadButton.svelte";
  import { downloadSelectedLogos } from "$lib/utils/batch-download-utils.js";
  import { toast } from "svelte-sonner";
  import { getPrimaryOriginalColor } from "$lib/utils/original-colors.js";

  let {
    logosArray = [],
    loading = false,
    class: className = "",
    ...restProps
  } = $props();

  // State for global controls
  let globalColor = $state("#ffffff"); // Start with white
  let logoSize = $state([80]); // Default size for grid items (slider value) - 80 is a multiple of 4
  let colorPickerRef = $state();

  // Color option state: 'black' | 'white' | 'brand' | 'custom'
  let colorOption = $state("white"); // Start with white option selected
  let customColor = $state("#ffffff"); // Custom color for when 'custom' option is selected
  let isCustomPopoverOpen = $state(false); // Control popover visibility

  // Snapped size value that only updates in increments of 4
  let snappedLogoSize = $state(80); // This is what gets passed to LogoCard components

  // Input field values (for manual editing)
  let sizeInputValue = $state("80");

  // Canvas refs for each logo
  let canvasRefs = $state({});

  // Individual colors for each logo (starts with global color)
  let individualColors = $state({});

  // Selection state - Map of logoName to svgContent
  let selectedLogos = $state(new Map());
  // Reactive counter for selected logos (needed because Map.size isn't always reactive)
  let selectedCount = $state(0);

  // Initialize individual colors when logos change
  $effect(() => {
    logosArray.forEach(([logoName]) => {
      if (!individualColors[logoName]) {
        // Initialize with the current global color based on selected option
        if (colorOption === "black") {
          individualColors[logoName] = "#000000";
        } else if (colorOption === "white") {
          individualColors[logoName] = "#ffffff";
        } else if (colorOption === "brand") {
          individualColors[logoName] = getPrimaryOriginalColor(logoName);
        } else if (colorOption === "custom") {
          individualColors[logoName] = customColor;
        } else {
          individualColors[logoName] = globalColor;
        }
      }
    });
  });

  // Only sync custom color changes to globalColor
  $effect(() => {
    if (colorOption === "custom") {
      globalColor = customColor;
    }
  });

  $effect(() => {
    sizeInputValue = logoSize[0].toString();
  });

  // Update snapped size only when logoSize changes by 4 or more
  $effect(() => {
    const currentSize = logoSize[0];
    let snappedValue = Math.round(currentSize / 4) * 4;

    // Ensure minimum snapped size is 16 (already a multiple of 4)
    snappedValue = Math.max(16, snappedValue);

    // No cap - allow full range from 16 to 256
    // Only update if the snapped size is different from current snapped size
    if (snappedValue !== snappedLogoSize) {
      snappedLogoSize = snappedValue;
    }
  });

  // Calculate dynamic canvas size based on snapped logo size
  // Formula: canvas size scales proportionally with logo size
  // Minimum canvas: 120px (for 16px logos), Maximum canvas: 500px (for 256px logos)
  const dynamicCanvasSize = $derived(() => {
    const minLogoSize = 16;
    const maxLogoSize = 256;
    const minCanvasSize = 120;
    const maxCanvasSize = 500;

    const currentSize = snappedLogoSize;
    const sizeRange = maxLogoSize - minLogoSize;
    const canvasRange = maxCanvasSize - minCanvasSize;
    const ratio = (currentSize - minLogoSize) / sizeRange;

    return Math.round(minCanvasSize + ratio * canvasRange);
  });

  // Calculate optimal grid columns based on snapped logo size
  // Smaller logos = more columns, larger logos = fewer columns
  // Dynamically adjusts for the full size range (16-256px)
  const gridColumns = $derived(() => {
    const currentSize = snappedLogoSize;

    if (currentSize <= 30) {
      return "grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 xl:grid-cols-7";
    } else if (currentSize <= 60) {
      return "grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6";
    } else if (currentSize <= 100) {
      return "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5";
    } else if (currentSize <= 150) {
      return "grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4";
    } else {
      // For very large icons (150-256px)
      return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3";
    }
  });

  // Handle color option change
  function handleColorOptionChange(newOption) {
    // Prevent unnecessary changes if the same option is clicked
    if (colorOption === newOption && newOption !== "custom") {
      return;
    }

    colorOption = newOption;

    // Update globalColor immediately based on the selected option
    if (newOption === "black") {
      globalColor = "#000000";
    } else if (newOption === "white") {
      globalColor = "#ffffff";
    } else if (newOption === "brand") {
      // For brand option, use the first logo's brand color as global reference
      if (logosArray.length > 0) {
        const firstLogoName = logosArray[0][0];
        globalColor = getPrimaryOriginalColor(firstLogoName);
      } else {
        globalColor = "#ffffff";
      }
    } else if (newOption === "custom") {
      globalColor = customColor;
      isCustomPopoverOpen = true;
    }

    if (newOption !== "custom") {
      isCustomPopoverOpen = false;
    }

    // Apply color changes to logos immediately
    applyColorToLogos();
  }

  // Handle custom color picker input
  function handleCustomColorPickerInput(event) {
    customColor = event.target.value;
    globalColor = customColor;
    applyColorToLogos();
  }

  // Handle custom color HEX input
  function handleCustomColorInput(event) {
    const value = event.target.value.trim();
    const hexRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;

    if (hexRegex.test(value)) {
      customColor = value;
      globalColor = value;
      applyColorToLogos();
    }
  }

  // Apply current color to logos based on selection
  function applyColorToLogos() {
    if (selectedLogos.size > 0) {
      // When items are selected: update ONLY selected logos
      selectedLogos.forEach((svgContent, logoName) => {
        if (colorOption === "brand") {
          // For brand option, use each logo's original brand color
          individualColors[logoName] = getPrimaryOriginalColor(logoName);
        } else {
          // For black, white, or custom options, use the global color
          individualColors[logoName] = globalColor;
        }
      });
    } else {
      // When no items are selected: update ALL logos (global behavior)
      logosArray.forEach(([logoName]) => {
        if (colorOption === "brand") {
          // For brand option, use each logo's original brand color
          individualColors[logoName] = getPrimaryOriginalColor(logoName);
        } else {
          // For black, white, or custom options, use the global color
          individualColors[logoName] = globalColor;
        }
      });
    }
  }

  // Handle manual size input change (real-time)
  function handleSizeInputInput(event) {
    const value = parseInt(event.target.value, 10);

    // Validate size range (16-256) and ensure it's a multiple of 4
    if (!isNaN(value) && value >= 16 && value <= 256) {
      // Snap to nearest multiple of 4
      const snappedValue = Math.round(value / 4) * 4;
      logoSize = [Math.max(16, Math.min(256, snappedValue))];
    }
  }

  // Handle size input blur to ensure valid value
  function handleSizeInputBlur() {
    const value = parseInt(sizeInputValue, 10);

    if (isNaN(value) || value < 16) {
      logoSize = [16];
      sizeInputValue = "16";
    } else if (value > 256) {
      logoSize = [256];
      sizeInputValue = "256";
    } else {
      // Snap to nearest multiple of 4 and update both state and input
      const snappedValue = Math.round(value / 4) * 4;
      const finalValue = Math.max(16, Math.min(256, snappedValue));
      logoSize = [finalValue];
      sizeInputValue = finalValue.toString();
    }
  }

  // Selection functions
  function toggleLogoSelection(logoName, svgContent) {
    const newMap = new Map(selectedLogos);
    if (newMap.has(logoName)) {
      newMap.delete(logoName);
    } else {
      newMap.set(logoName, svgContent);
    }
    selectedLogos = newMap;
    // Update the reactive counter
    selectedCount = selectedLogos.size;
  }

  function clearSelection() {
    selectedLogos = new Map();
    selectedCount = 0;
  }

  // Handle batch download
  async function handleBatchDownload(format) {
    if (selectedCount === 0) {
      toast.error("Nenhum logo selecionado");
      return;
    }

    const size = logoSize[0];
    const result = await downloadSelectedLogos(selectedLogos, size, format);

    if (result.success) {
      if (result.count === 1) {
        toast.success(`Logo baixado como ${format.toUpperCase()}!`);
      } else {
        toast.success(
          `${result.count} logos baixados como ${format.toUpperCase()}!`,
        );
      }
      // Clear selection after successful download
      clearSelection();
    } else {
      toast.error("Falha ao baixar logos. Tente novamente.");
    }
  }

  // Handle batch color change
  function handleBatchColorChange(color) {
    if (selectedCount === 0) {
      toast.error("Nenhum logo selecionado");
      return;
    }

    // Update color for all selected logos
    selectedLogos.forEach((svgContent, logoName) => {
      individualColors[logoName] = color;
    });
  }

  // Get current color from first selected logo
  const currentSelectedColor = $derived(() => {
    if (selectedLogos.size === 0) return "#000000";
    const firstLogoName = Array.from(selectedLogos.keys())[0];
    return individualColors[firstLogoName] || "#000000";
  });
</script>

<div class={className} {...restProps}>
  <Card class="border-transparent bg-transparent">
    <CardContent class="p-0">
      <!-- Global Controls -->
      <div class="mb-6 flex gap-8">
        <!-- Color Control -->
        <div class="flex w-48 flex-col gap-4">
          <Label class="text-sm font-medium text-foreground">Cor</Label>

          <!-- Three Color Options -->
          <div class="flex gap-2">
            <!-- Black Option -->
            <TooltipProvider delayDuration={300}>
              <Tooltip>
                <TooltipTrigger asChild>
                  {#snippet child({ props })}
                    <button
                      {...props}
                      onclick={() => handleColorOptionChange("black")}
                      class="flex h-10 w-10 items-center justify-center rounded-lg border-2 transition-all hover:border-border/80 {colorOption ===
                      'black'
                        ? 'border-primary ring-2 ring-primary/20'
                        : 'border-border'}"
                      style="background-color: #000000; border: 1px solid rgba(255, 255, 255, 0.2);"
                      aria-label="Selecionar cor preta"
                    >
                      <span class="sr-only">Preto</span>
                    </button>
                  {/snippet}
                </TooltipTrigger>
                <TooltipContent side="top">
                  <p>Preto</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <!-- White Option -->
            <TooltipProvider delayDuration={300}>
              <Tooltip>
                <TooltipTrigger asChild>
                  {#snippet child({ props })}
                    <button
                      {...props}
                      onclick={() => handleColorOptionChange("white")}
                      class="flex h-10 w-10 items-center justify-center rounded-lg border-2 transition-all hover:border-border/80 {colorOption ===
                      'white'
                        ? 'border-primary ring-2 ring-primary/20'
                        : 'border-border'}"
                      style="background-color: #ffffff; box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.1);"
                      aria-label="Selecionar cor branca"
                    >
                      <span class="sr-only">Branco</span>
                    </button>
                  {/snippet}
                </TooltipTrigger>
                <TooltipContent side="top">
                  <p>Branco</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <!-- Brand Option -->
            <TooltipProvider delayDuration={300}>
              <Tooltip>
                <TooltipTrigger asChild>
                  {#snippet child({ props })}
                    <button
                      {...props}
                      onclick={() => handleColorOptionChange("brand")}
                      class="flex h-10 w-10 items-center justify-center rounded-lg border-2 transition-all hover:border-border/80 {colorOption ===
                      'brand'
                        ? 'border-primary ring-2 ring-primary/20'
                        : 'border-border'}"
                      style="background: linear-gradient(45deg, #003399, #E51736, #33348E, #0070AF, #FFC709, #00C88D); box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.1), 0 2px 4px rgba(0, 0, 0, 0.2);"
                      aria-label="Usar cores originais das marcas"
                    >
                      <span class="sr-only">Cores das marcas</span>
                    </button>
                  {/snippet}
                </TooltipTrigger>
                <TooltipContent side="top">
                  <p>Cores das marcas</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <!-- Custom Option with Popover -->
            <Popover bind:open={isCustomPopoverOpen}>
              <PopoverTrigger asChild>
                {#snippet child({ props })}
                  <TooltipProvider delayDuration={300}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        {#snippet child({ tooltipProps })}
                          <button
                            {...props}
                            {...tooltipProps}
                            onclick={() => handleColorOptionChange("custom")}
                            class="flex h-10 w-10 items-center justify-center rounded-lg border-2 transition-all hover:border-border/80 {colorOption ===
                              'custom' && !isCustomPopoverOpen
                              ? 'border-primary ring-2 ring-primary/20'
                              : 'border-border'}"
                            style="background: linear-gradient(135deg, {customColor} 0%, {customColor}dd 50%, {customColor}aa 100%); box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.1), 0 2px 4px rgba(0, 0, 0, 0.2);"
                            aria-label="Selecionar cor personalizada"
                          >
                            <span class="sr-only"
                              >Personalizada: {customColor}</span
                            >
                          </button>
                        {/snippet}
                      </TooltipTrigger>
                      <TooltipContent side="top">
                        <p>Personalizada</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                {/snippet}
              </PopoverTrigger>

              <PopoverContent class="w-64 p-3" side="bottom" align="start">
                <div class="space-y-3">
                  <!-- HEX Input at the top -->
                  <Input
                    type="text"
                    bind:value={customColor}
                    oninput={handleCustomColorInput}
                    placeholder="#ffffff"
                    class="w-full font-mono text-sm"
                    aria-label="Código de cor hexadecimal"
                  />

                  <!-- Native Color Picker below -->
                  <input
                    bind:this={colorPickerRef}
                    type="color"
                    bind:value={customColor}
                    oninput={handleCustomColorPickerInput}
                    class="h-10 w-full cursor-pointer rounded border border-border"
                    aria-label="Seletor de cor nativo"
                  />
                </div>
              </PopoverContent>
            </Popover>
          </div>

          <!-- Current Color Display -->
          <div class="text-xs text-muted-foreground font-mono">
            {globalColor}
          </div>
        </div>

        <!-- Size Control -->
        <div class="flex w-36 flex-col gap-4">
          <div class="flex h-5 items-center justify-between gap-4">
            <Label class="text-sm font-medium text-foreground">Tamanho</Label>
            <Input
              type="number"
              bind:value={sizeInputValue}
              oninput={handleSizeInputInput}
              onblur={handleSizeInputBlur}
              min={16}
              max={256}
              step={4}
              placeholder="80"
              class="h-7 w-16 [appearance:textfield] border-0 bg-transparent px-2 py-1 text-right font-mono text-xs [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
              aria-label="Tamanho do logo em pixels"
            />
          </div>
          <div class="flex h-7 items-center">
            <Slider
              bind:value={logoSize}
              min={16}
              max={256}
              step={4}
              class="w-full"
            />
          </div>
        </div>
      </div>

      <!-- Grid of Logos -->
      {#if loading}
        <div class="flex min-h-[400px] items-center justify-center">
          <p class="text-muted-foreground">Carregando logos...</p>
        </div>
      {:else if logosArray.length === 0}
        <div class="flex min-h-[400px] items-center justify-center">
          <div class="text-center">
            <p class="text-muted-foreground">Nenhum logo disponível</p>
          </div>
        </div>
      {:else}
        <div class="grid gap-4 {gridColumns()}">
          {#each logosArray as [logoName, svgContent] (logoName)}
            <LogoCard
              {logoName}
              {svgContent}
              bind:color={individualColors[logoName]}
              size={snappedLogoSize}
              canvasSize={dynamicCanvasSize()}
              bind:canvasRef={canvasRefs[logoName]}
              isSelected={selectedLogos.has(logoName)}
              onToggleSelection={() =>
                toggleLogoSelection(logoName, svgContent)}
              hasAnySelection={selectedCount > 0}
            />
          {/each}
        </div>
      {/if}
    </CardContent>
  </Card>

  <!-- Floating Download Button -->
  <FloatingDownloadButton
    {selectedCount}
    onDownload={handleBatchDownload}
    onColorChange={handleBatchColorChange}
    onClearSelection={clearSelection}
    currentColor={currentSelectedColor()}
  />
</div>
