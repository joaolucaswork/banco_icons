<script>
import { onMount } from "svelte";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "$lib/components/ui/card";
import { Button } from "$lib/components/ui/button";
import { ScrollArea } from "$lib/components/ui/scroll-area";
import { Skeleton } from "$lib/components/ui/skeleton";
import CodeBlock from "$lib/components/CodeBlock.svelte";
import BottomControlBar from "$lib/components/BottomControlBar.svelte";
import BrandingGuidelinesDialog from "$lib/components/BrandingGuidelinesDialog.svelte";
import { svgStore } from "$lib/stores/svg-store.svelte.js";
import { getBankDisplayName, copyToClipboard } from "$lib/utils/svg-utils.js";
import { Copy, Palette } from "lucide-svelte";
import { toast } from "svelte-sonner";

let sizeValue = $state([24]);
let showCode = $state(true);

// Reactive values from store
let storeData = $derived(svgStore.data);
let previewSvg = $derived(svgStore.previewSvg);
let formattedSvg = $derived(svgStore.formattedSvg);

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
    <!-- Header -->
    <div class="mb-8">
      <h1 class="mb-2 text-3xl font-bold text-foreground">
        Controlador de Ícones SVG
      </h1>
    </div>

    <div class="grid grid-cols-1 gap-6 lg:grid-cols-4">
      <!-- Side Panel Controls -->
      <div class="space-y-6 lg:col-span-1">
        <!-- Logo Selection -->
        <Card class="border-border bg-card">
          <CardHeader class="px-4 py-1">
            <CardTitle class="text-left text-lg text-card-foreground"
              >Instituições</CardTitle
            >
          </CardHeader>
          <CardContent class="p-0">
            {#if storeData.loading}
              <div class="space-y-2 px-4 pt-2 pb-4">
                {#each Array(7) as _}
                  <Skeleton class="h-10 w-full" />
                {/each}
              </div>
            {:else}
              <ScrollArea class="h-64">
                <div class="w-full space-y-2 px-4 pt-2 pb-4">
                  {#each storeData.logos.keys() as logoName}
                    <Button
                      variant="outline"
                      class="h-auto w-full justify-start px-2 py-2 text-left {storeData.selectedLogo === logoName ? '!border-white/30 !bg-white/20 hover:!bg-white/30' : 'hover:bg-accent hover:text-accent-foreground'}"
                      disabled={false}
                      onclick={() => handleLogoSelect(logoName)}
                    >
                      <div class="flex w-full items-center gap-2">
                        <div
                          class="flex h-6 w-6 flex-shrink-0 items-center justify-start"
                        >
                          {#if storeData.logos.has(logoName)}
                            {@html storeData.logos.get(logoName).replace(/width="[^"]*"/, 'width="24"').replace(/height="[^"]*"/, 'height="24"')}
                          {/if}
                        </div>
                        <span class="text-sm leading-tight font-medium"
                          >{getBankDisplayName(logoName)}</span
                        >
                      </div>
                    </Button>
                  {/each}
                </div>
              </ScrollArea>
            {/if}
          </CardContent>
        </Card>

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
          <CardHeader class="">
            <div class="flex items-start gap-4">
              <!-- Left side: Title and Info -->
              <div class="flex-1 space-y-2">
                <CardTitle class="text-xl text-card-foreground">
                  {storeData.selectedLogo ? getBankDisplayName(storeData.selectedLogo) : 'Selecionar um Logo'}
                </CardTitle>

                <!-- Information Panel - Below title -->
                {#if storeData.selectedLogo}
                  <div class="flex flex-wrap gap-6 text-sm">
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
                class="flex min-h-[180px] items-center justify-center rounded-lg border border-border bg-muted/50 lg:min-h-[200px]"
              >
                <!-- Warning Icon - Inside preview, top right -->
                {#if storeData.selectedLogo}
                  <div class="absolute top-3 right-3 z-10">
                    <BrandingGuidelinesDialog />
                  </div>
                {/if}
                {#if storeData.loading}
                  <div class="text-center">
                    <Skeleton class="mx-auto mb-4 h-24 w-24" />
                    <p class="text-muted-foreground">Carregando logos...</p>
                  </div>
                {:else if storeData.error}
                  <div class="text-center text-destructive">
                    <p class="font-medium">Erro ao carregar logos</p>
                    <p class="text-sm">{storeData.error}</p>
                  </div>
                {:else if previewSvg}
                  <div class="text-center">
                    {@html previewSvg}
                  </div>
                {:else}
                  <div class="text-center text-muted-foreground">
                    <Palette class="mx-auto mb-4 h-20 w-20 opacity-50" />
                    <p class="text-lg font-medium">Nenhum logo selecionado</p>
                    <p class="text-sm">
                      Escolha um logo de banco na barra lateral para começar
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
