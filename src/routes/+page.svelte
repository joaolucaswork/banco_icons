<script>
import { onMount } from "svelte";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "$lib/components/ui/card";
import { Button } from "$lib/components/ui/button";
import { Skeleton } from "$lib/components/ui/skeleton";
import CodeBlock from "$lib/components/CodeBlock.svelte";
import BottomControlBar from "$lib/components/BottomControlBar.svelte";
import BrandingGuidelinesDialog from "$lib/components/BrandingGuidelinesDialog.svelte";
import BankCombobox from "$lib/components/BankCombobox.svelte";
import { svgStore } from "$lib/stores/svg-store.svelte.js";
import { copyToClipboard } from "$lib/utils/svg-utils.js";
import {
  getContrastBackground,
  getDottedPatternColor,
} from "$lib/utils/color-utils.js";
import { Copy, Palette } from "lucide-svelte";
import { toast } from "svelte-sonner";

let sizeValue = $state([24]);
let showCode = $state(true);

// Reactive values from store
let storeData = $derived(svgStore.data);
let previewSvg = $derived(svgStore.previewSvg);
let formattedSvg = $derived(svgStore.formattedSvg);

// Calculate background color for optimal contrast
let previewBackground = $derived(getContrastBackground(storeData.color));
// Calculate dot color for the dotted pattern
let dotColor = $derived(getDottedPatternColor(storeData.color));

// Update store when slider changes
$effect(() => {
  svgStore.setSize(sizeValue[0]);
});

function handleColorChange(color) {
  svgStore.setColor(color);
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

async function handleCopySvg() {
  if (formattedSvg) {
    console.log("Copiando SVG formatado:", typeof formattedSvg, formattedSvg);
    const success = await copyToClipboard(formattedSvg);
    if (success) {
      toast.success("Código SVG copiado para a área de transferência!");
    } else {
      toast.error("Falha ao copiar código SVG. Tente novamente.");
    }
  } else {
    console.log("Nenhum formattedSvg disponível");
    toast.error("Nenhum código SVG disponível para copiar.");
  }
}

onMount(() => {
  // Store should auto-load, but ensure it's loaded
  if (storeData.logos.size === 0 && !storeData.loading) {
    svgStore.loadAllLogos();
  }
});
</script>

<svelte:head>
  <title>Controlador de Ícones SVG - Banco Icons</title>
  <meta
    name="description"
    content="Controle o tamanho e cores de ícones SVG de bancos com visualização em tempo real"
  />
</svelte:head>

<div class="min-h-screen bg-background pb-20">
  <div class="container mx-auto px-4 py-8">
    <div class="grid grid-cols-1 gap-6 lg:grid-cols-4">
      <!-- Side Panel Controls -->
      <div class="space-y-6 lg:col-span-1">
        <!-- Actions -->
        <Card class="border-border bg-card">
          <CardHeader class="pb-3">
            <CardTitle class="text-lg text-card-foreground">Ações</CardTitle>
          </CardHeader>
          <CardContent class="space-y-3">
            <Button
              onclick={handleCopySvg}
              class="w-full bg-primary text-primary-foreground hover:bg-primary/90"
              disabled={!formattedSvg}
            >
              <Copy class="mr-2 h-4 w-4" />
              Copiar Código SVG
            </Button>
          </CardContent>
        </Card>
      </div>

      <!-- Main Content Area -->
      <div class="space-y-6 lg:col-span-3">
        <!-- Unified Preview Area -->
        <Card class="border-border bg-card">
          <CardHeader class="px-0">
            <div class="space-y-4">
              <!-- Bank Selection Combobox and Information Panel Container -->
              <div class="space-y-4">
                <!-- Bank Selection Combobox -->
                <div class="px-6">
                  <BankCombobox
                    bind:selectedLogo={storeData.selectedLogo}
                    logos={storeData.logos}
                    loading={storeData.loading}
                    onLogoSelect={handleLogoSelect}
                    placeholder="Selecionar uma instituição"
                    class="w-fit min-w-64"
                  />
                </div>

                <!-- Information Panel - Below combobox -->
                {#if storeData.selectedLogo}
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
            <div class="relative">
              <!-- Compact Preview Container -->
              <div
                class="relative flex min-h-[180px] items-center justify-center rounded-lg border border-border transition-colors duration-200 lg:min-h-[200px]"
                style="background-color: {previewBackground}"
              >
                <!-- Dotted background pattern overlay -->
                <div
                  class="dotted-background absolute inset-0 rounded-lg"
                  style="--dot-color: {dotColor}"
                ></div>
                <!-- Warning Icon - Inside preview, top right -->
                {#if storeData.selectedLogo}
                  <div class="absolute top-3 right-3 z-10">
                    <BrandingGuidelinesDialog />
                  </div>
                {/if}
                {#if storeData.loading}
                  <div class="relative z-10 text-center">
                    <Skeleton class="mx-auto mb-4 h-24 w-24" />
                    <p class="text-muted-foreground">Carregando logos...</p>
                  </div>
                {:else if storeData.error}
                  <div class="relative z-10 text-center text-destructive">
                    <p class="font-medium">Erro ao carregar logos</p>
                    <p class="text-sm">{storeData.error}</p>
                  </div>
                {:else if previewSvg}
                  <div class="relative z-10 text-center">
                    {@html previewSvg}
                  </div>
                {:else}
                  <div class="relative z-10 text-center text-muted-foreground">
                    <Palette class="mx-auto mb-4 h-20 w-20 opacity-50" />
                    <p class="text-lg font-medium">Nenhum logo selecionado</p>
                    <p class="text-sm">
                      Selecione uma instituição financeira acima para começar
                    </p>
                  </div>
                {/if}
              </div>
            </div>
          </CardContent>
        </Card>

        <!-- Code Display -->
        {#if showCode && formattedSvg}
          <Card class="border-border bg-card">
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
        {/if}
      </div>
    </div>
  </div>
</div>

<!-- Bottom Control Bar -->
<BottomControlBar
  sizeValue={sizeValue}
  color={storeData.color}
  onSizeChange={handleSizeChange}
  onColorChange={handleColorChange}
  onReset={handleReset}
/>
