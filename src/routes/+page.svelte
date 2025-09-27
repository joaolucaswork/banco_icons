<script>
import { onMount } from "svelte";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "$lib/components/ui/card";
import { Button } from "$lib/components/ui/button";
import { Slider } from "$lib/components/ui/slider";
import { Label } from "$lib/components/ui/label";
import { Badge } from "$lib/components/ui/badge";
import { ScrollArea } from "$lib/components/ui/scroll-area";
import { Skeleton } from "$lib/components/ui/skeleton";
import SimpleColorPicker from "$lib/components/SimpleColorPicker.svelte";
import CodeBlock from "$lib/components/CodeBlock.svelte";
import { svgStore } from "$lib/stores/svg-store.svelte.js";
import { getBankDisplayName, copyToClipboard } from "$lib/utils/svg-utils.js";
import { Copy, RotateCcw, Palette, Maximize2 } from "lucide-svelte";
import { toast } from "svelte-sonner";

let sizeValue = $state([120]);
let showCode = $state(true);

// Reactive values from store
let storeData = $derived(svgStore.data);
let modifiedSvg = $derived(svgStore.modifiedSvg);
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
  sizeValue = [120];
}

async function handleCopySvg() {
  if (formattedSvg) {
    console.log("Copying formatted SVG:", typeof formattedSvg, formattedSvg);
    const success = await copyToClipboard(formattedSvg);
    if (success) {
      toast.success("SVG code copied to clipboard!");
    } else {
      toast.error("Failed to copy SVG code. Please try again.");
    }
  } else {
    console.log("No formattedSvg available");
    toast.error("No SVG code available to copy.");
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
  <title>SVG Icon Controller - Banco Icons</title>
  <meta
    name="description"
    content="Control the size and colors of SVG bank icons with real-time preview"
  />
</svelte:head>

<div class="min-h-screen bg-background">
  <div class="container mx-auto px-4 py-8">
    <!-- Header -->
    <div class="mb-8">
      <h1 class="mb-2 text-3xl font-bold text-foreground">
        SVG Icon Controller
      </h1>
      <p class="text-muted-foreground">
        Customize bank logos with real-time size and color controls
      </p>
    </div>

    <div class="grid grid-cols-1 gap-6 lg:grid-cols-4">
      <!-- Side Panel Controls -->
      <div class="space-y-6 lg:col-span-1">
        <!-- Logo Selection -->
        <Card class="border-border bg-card">
          <CardHeader class="pb-3">
            <CardTitle class="text-lg text-card-foreground"
              >Select Logo</CardTitle
            >
            <CardDescription class="text-muted-foreground"
              >Choose a bank logo to customize</CardDescription
            >
          </CardHeader>
          <CardContent class="">
            {#if storeData.loading}
              <div class="space-y-2">
                {#each Array(7) as _}
                  <Skeleton class="h-10 w-full" />
                {/each}
              </div>
            {:else}
              <ScrollArea class="h-64">
                <div class="space-y-2">
                  {#each storeData.logos.keys() as logoName}
                    <Button
                      variant={storeData.selectedLogo === logoName ? "default" : "outline"}
                      class="h-auto w-full justify-start p-3 text-left {storeData.selectedLogo === logoName ? 'bg-primary text-primary-foreground hover:bg-primary/90' : 'hover:bg-accent hover:text-accent-foreground'}"
                      disabled={false}
                      onclick={() => handleLogoSelect(logoName)}
                    >
                      <div class="flex items-center gap-3">
                        <div class="h-6 w-6 flex-shrink-0">
                          {#if storeData.logos.has(logoName)}
                            {@html storeData.logos.get(logoName).replace(/width="[^"]*"/, 'width="24"').replace(/height="[^"]*"/, 'height="24"')}
                          {/if}
                        </div>
                        <span class="text-sm font-medium"
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

        <!-- Size Control -->
        <Card class="border-border bg-card">
          <CardHeader class="pb-3">
            <CardTitle
              class="flex items-center gap-2 text-lg text-card-foreground"
            >
              <Maximize2 class="h-4 w-4" />
              Size Control
            </CardTitle>
          </CardHeader>
          <CardContent class="space-y-4">
            <div>
              <Label class="mb-2 block text-sm font-medium text-foreground"
                >Size: {sizeValue[0]}px</Label
              >
              <Slider
                bind:value={sizeValue}
                min={16}
                max={400}
                step={1}
                class="w-full"
              />
            </div>
            <div class="flex justify-between text-xs text-muted-foreground">
              <span>16px</span>
              <span>400px</span>
            </div>
          </CardContent>
        </Card>

        <!-- Color Control -->
        <Card class="border-border bg-card">
          <CardHeader class="pb-3">
            <CardTitle
              class="flex items-center gap-2 text-lg text-card-foreground"
            >
              <Palette class="h-4 w-4" />
              Color Control
            </CardTitle>
          </CardHeader>
          <CardContent class="">
            <SimpleColorPicker
              value={storeData.color}
              onValueChange={handleColorChange}
            />
          </CardContent>
        </Card>

        <!-- Actions -->
        <Card class="border-border bg-card">
          <CardHeader class="pb-3">
            <CardTitle class="text-lg text-card-foreground">Actions</CardTitle>
          </CardHeader>
          <CardContent class="space-y-3">
            <Button
              onclick={handleCopySvg}
              class="w-full bg-primary text-primary-foreground hover:bg-primary/90"
              disabled={!formattedSvg}
            >
              <Copy class="mr-2 h-4 w-4" />
              Copy SVG Code
            </Button>

            <Button
              variant="outline"
              onclick={handleReset}
              class="w-full border-border hover:bg-accent hover:text-accent-foreground"
              disabled={false}
            >
              <RotateCcw class="mr-2 h-4 w-4" />
              Reset to Defaults
            </Button>
          </CardContent>
        </Card>
      </div>

      <!-- Main Content Area -->
      <div class="space-y-6 lg:col-span-3">
        <!-- Icon Display -->
        <Card class="border-border bg-card">
          <CardHeader class="">
            <div class="flex items-center justify-between">
              <div>
                <CardTitle class="text-xl text-card-foreground">
                  {storeData.selectedLogo ? getBankDisplayName(storeData.selectedLogo) : 'Select a Logo'}
                </CardTitle>
                <CardDescription class="text-muted-foreground">
                  Real-time preview of your customized SVG icon
                </CardDescription>
              </div>
              {#if storeData.selectedLogo}
                <Badge
                  variant="secondary"
                  class="bg-secondary text-secondary-foreground"
                  href=""
                >
                  {sizeValue[0]}px × {sizeValue[0]}px
                </Badge>
              {/if}
            </div>
          </CardHeader>
          <CardContent class="">
            <div
              class="flex min-h-[300px] items-center justify-center rounded-lg border-2 border-dashed border-border bg-muted/50"
            >
              {#if storeData.loading}
                <div class="text-center">
                  <Skeleton class="mx-auto mb-4 h-32 w-32" />
                  <p class="text-muted-foreground">Loading logos...</p>
                </div>
              {:else if storeData.error}
                <div class="text-center text-destructive">
                  <p class="font-medium">Error loading logos</p>
                  <p class="text-sm">{storeData.error}</p>
                </div>
              {:else if modifiedSvg}
                <div class="text-center">
                  <div
                    class="inline-block rounded-lg border border-border bg-background p-4 shadow-sm transition-shadow hover:shadow-md"
                  >
                    {@html modifiedSvg}
                  </div>
                  <div class="mt-4 text-sm text-muted-foreground">
                    <p>Size: {sizeValue[0]}px | Color: {storeData.color}</p>
                  </div>
                </div>
              {:else}
                <div class="text-center text-muted-foreground">
                  <Palette class="mx-auto mb-4 h-16 w-16 opacity-50" />
                  <p class="font-medium">No logo selected</p>
                  <p class="text-sm">
                    Choose a bank logo from the sidebar to get started
                  </p>
                </div>
              {/if}
            </div>
          </CardContent>
        </Card>

        <!-- Code Display -->
        {#if showCode && formattedSvg}
          <Card class="border-border bg-card">
            <CardHeader class="">
              <CardTitle class="text-xl text-card-foreground"
                >SVG Code</CardTitle
              >
              <CardDescription class="text-muted-foreground">
                Copy this code to use the customized SVG in your projects
              </CardDescription>
            </CardHeader>
            <CardContent class="">
              <CodeBlock
                code={formattedSvg}
                language="xml"
                title="Customized SVG"
              />
            </CardContent>
          </Card>
        {/if}
      </div>
    </div>
  </div>
</div>
