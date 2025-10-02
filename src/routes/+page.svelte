<script>
import { onMount } from "svelte";
import {
  Card,
  CardContent,
  CardHeader,
  // CardTitle,
} from "$lib/components/ui/card";

// import CodeBlock from "$lib/components/CodeBlock.svelte";
import PreviewControls from "$lib/components/PreviewControls.svelte";
import BrandingGuidelinesDialog from "$lib/components/BrandingGuidelinesDialog.svelte";
import BankCombobox from "$lib/components/BankCombobox.svelte";
import ActionButtons from "$lib/components/ActionButtons.svelte";
import InteractiveCanvas from "$lib/components/InteractiveCanvas.svelte";
import GridView from "$lib/components/GridView.svelte";
import BackgroundTransition from "$lib/components/BackgroundTransition.svelte";
import { svgStore } from "$lib/stores/svg-store.svelte.js";
import {
  getContrastBackground,
  getDottedPatternColor,
} from "$lib/utils/color-utils.js";
import { onThemeColorChange } from "$lib/utils/theme-colors.js";
import { Palette } from "lucide-svelte";

let sizeValue = $state([24]);
// let showCode = $state(true);

// View mode state: "single" or "grid"
let viewMode = $state("single");

// Background animation state
let currentBackgroundColor = $state("#000000");

// Reactive values from store
let storeData = $derived(svgStore.data);
let previewSvg = $derived(svgStore.previewSvg);
let formattedSvg = $derived(svgStore.formattedSvg);

// Calculate background color for optimal contrast (first canvas - dynamic or manual)
let previewBackground = $derived.by(() => {
  const manualBg = svgStore.getCurrentBackgroundColor();
  if (manualBg !== null) {
    // Use manual background color when override is active
    return manualBg;
  }
  // Use automatic contrast detection when no manual override
  // Use the current color from store data, which should be properly updated when logo changes
  return getContrastBackground(storeData.color);
});

// Calculate dot color for the dotted pattern (first canvas - dynamic or manual)
let dotColor = $derived.by(() => {
  const manualBg = svgStore.getCurrentBackgroundColor();
  if (manualBg !== null) {
    // Use dot color based on manual background
    if (manualBg === "transparent") {
      // For transparent background, always use light gray dots for visibility
      return "#666666";
    } else {
      // For solid backgrounds (like white), use dots based on background color
      return getDottedPatternColor(manualBg);
    }
  }
  // Use automatic dot color detection when no manual override
  return getDottedPatternColor(storeData.color);
});

// Static background and dot colors for original canvas (second canvas - independent)
let originalPreviewBackground = $derived("transparent"); // Always transparent for original
let originalDotColor = $derived("#666666"); // Always light gray dots for original

// Update store when slider changes
$effect(() => {
  svgStore.setSize(sizeValue[0]);
});

function handleColorChange(color) {
  svgStore.setColor(color);
}

// Multi-color handlers
function handleElementColorChange(elementKey, color) {
  svgStore.setElementColor(elementKey, color);
}

function handleElementReset(elementKey) {
  svgStore.resetElementColor(elementKey);
}

function handleLogoSelect(logoName) {
  svgStore.selectLogo(logoName);
}

function handleReset() {
  svgStore.reset();
  sizeValue = [24];
}

function handleSizeChange(newValue) {
  sizeValue = newValue;
}

function handleBackgroundToggle() {
  svgStore.toggleBackground();
}

function handleViewModeToggle() {
  viewMode = viewMode === "single" ? "grid" : "single";
}

onMount(() => {
  // Store should auto-load, but ensure it's loaded
  if (storeData.logos.size === 0 && !storeData.loading) {
    svgStore.loadAllLogos();
  }

  // Register callback for theme color changes to trigger background animation
  const unsubscribe = onThemeColorChange((newColor) => {
    console.log("Theme color change detected:", newColor);
    currentBackgroundColor = newColor;
  });

  // Cleanup callback on component destroy
  return unsubscribe;
});
</script>

<svelte:head>
  <title>LB | Logos de bancos e corretoras</title>
  <meta name="description" content="Logos de bancos e corretoras" />
</svelte:head>

<!-- Background transition animation -->
<BackgroundTransition currentColor={currentBackgroundColor} />

<div class="flex-1 overflow-y-auto bg-background">
  <div class="container mx-auto px-4 py-6">
    <div class="space-y-6">
      <!-- Main Content Area -->
      <!-- Unified Preview Area -->
      <Card class="relative z-10 border-border bg-card">
        <CardHeader class="px-0">
          <div class="space-y-4">
            <!-- Bank Selection Combobox and Information Panel Container -->
            <div class="space-y-4">
              <!-- Bank Selection Combobox and Action Buttons -->
              <div class="px-3 sm:px-6">
                <!-- Mobile: Stack vertically, Desktop: Side by side -->
                <div
                  class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-3"
                >
                  <!-- Combobox - Full width on mobile, fit-content on desktop -->
                  <div class="w-full sm:w-auto">
                    <BankCombobox
                      bind:selectedLogo={storeData.selectedLogo}
                      logos={storeData.logos}
                      loading={storeData.loading}
                      onLogoSelect={handleLogoSelect}
                      placeholder="Selecionar uma instituição"
                      class="w-full sm:w-auto"
                    />
                  </div>
                  <!-- Action Buttons - Hidden on mobile, visible on desktop -->
                  <div class="hidden w-auto sm:block">
                    <ActionButtons
                      selectedLogo={storeData.selectedLogo}
                      modifiedSvg={svgStore.modifiedSvg}
                      formattedSvg={formattedSvg}
                      size={storeData.size}
                      loading={storeData.loading}
                      viewMode={viewMode}
                      onViewModeToggle={handleViewModeToggle}
                    />
                  </div>
                </div>
              </div>

              <!-- Preview Controls - Below combobox -->
              {#if storeData.selectedLogo}
                <PreviewControls
                  sizeValue={sizeValue}
                  color={storeData.color}
                  onSizeChange={handleSizeChange}
                  onColorChange={handleColorChange}
                  onReset={handleReset}
                  isMultiColor={storeData.isMultiColor}
                  colorableElements={storeData.colorableElements}
                  colorMap={storeData.colorMap}
                  onElementColorChange={handleElementColorChange}
                  selectedLogo={storeData.selectedLogo}
                  bind:showComparison={storeData.showComparison}
                />
              {/if}

              <!-- Information Panel - Below combobox -->
              <!-- COMMENTED OUT: Visualização, Exportar, and Cor items -->
              {#if false && storeData.selectedLogo}
                <div class="flex flex-wrap gap-6 px-6 text-sm">
                  <!-- Preview Size Info -->
                  <div class="flex items-center gap-2">
                    <span class="text-muted-foreground">Visualização:</span>
                    <span class="font-medium text-foreground">120px</span>
                  </div>

                  <!-- Export Size Info -->
                  <div class="flex items-center gap-2">
                    <span class="text-muted-foreground">Exportar:</span>
                    <span class="font-medium text-foreground"
                      >{sizeValue[0]}px</span
                    >
                  </div>

                  <!-- Color Info -->
                  <div class="flex items-center gap-2">
                    <span class="text-muted-foreground">Cor:</span>
                    <div class="flex items-center gap-1.5">
                      <div
                        class="h-3 w-3 rounded border border-border"
                        style="background-color: {storeData.color}"
                      ></div>
                      <span class="font-mono font-medium text-foreground"
                        >{storeData.color}</span
                      >
                    </div>
                  </div>
                </div>
              {/if}
            </div>
          </div>
        </CardHeader>
        <CardContent class="">
          {#if viewMode === "single"}
            <div class="relative">
              <!-- Interactive Canvas Preview -->
              <InteractiveCanvas
                svgContent={previewSvg}
                previewBackground={previewBackground}
                dotColor={dotColor}
                originalPreviewBackground={originalPreviewBackground}
                originalDotColor={originalDotColor}
                loading={storeData.loading}
                error={storeData.error}
                exportSize={storeData.size}
                exportColor={storeData.color}
                showComparison={storeData.showComparison}
                selectedLogo={storeData.selectedLogo}
                formattedSvg={formattedSvg}
                onReset={handleReset}
                onBackgroundToggle={handleBackgroundToggle}
                isManualBackgroundActive={storeData.manualBackgroundOverride}
                currentBackgroundColor={storeData.manualBackgroundColor}
              />

              <!-- Controls Group - Overlay on canvas -->
              <!-- Removed BrandingGuidelinesDialog icon -->

              <!-- Empty state overlay -->
              {#if !storeData.loading && !storeData.error && !previewSvg}
                <div
                  class="absolute inset-0 flex items-center justify-center rounded-lg bg-background/50 backdrop-blur-sm"
                >
                  <div class="text-center text-muted-foreground">
                    <Palette class="mx-auto mb-4 h-20 w-20 opacity-50" />
                    <p class="text-lg font-medium">Nenhum logo selecionado</p>
                    <p class="text-sm">
                      Selecione uma instituição financeira acima para começar
                    </p>
                  </div>
                </div>
              {/if}
            </div>
          {:else}
            <!-- Grid View Mode -->
            <GridView logos={storeData.logos} loading={storeData.loading} />
          {/if}
        </CardContent>
      </Card>

      <!-- Code Display -->
      <!-- {#if showCode && formattedSvg}
        <Card class="relative z-10 border-border bg-card">
          <CardHeader class="">
            <CardTitle class="text-xl text-card-foreground"
              >Código SVG</CardTitle
            >
          </CardHeader>
          <CardContent class="">
            <CodeBlock
              code={formattedSvg}
              language="xml"
              title="SVG Personalizado"
            />
          </CardContent>
        </Card>
      {/if} -->
    </div>
  </div>
</div>
