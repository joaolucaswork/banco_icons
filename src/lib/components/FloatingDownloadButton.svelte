<script lang="ts">
import { Button } from "$lib/components/ui/button";
import * as Popover from "$lib/components/ui/popover";
import { Download } from "lucide-svelte";
import { animate } from "motion";

let {
  selectedCount = 0,
  onDownload = () => {},
  class: className = "",
  ...restProps
} = $props();

// Popover state for format selection
let formatPopoverOpen = $state(false);

// Animation refs
let buttonRef = $state();

// Animate button entrance/exit
$effect(() => {
  if (buttonRef && selectedCount > 0) {
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
  }
});

// Handle download with format
function handleDownload(format: "svg" | "png") {
  onDownload(format);
  formatPopoverOpen = false;
}

// Debug effect
$effect(() => {
  console.log("FloatingDownloadButton - selectedCount changed:", selectedCount);
});
</script>

{#if selectedCount > 0}
  <!-- DEBUG: Button should be visible when count > 0 -->
  <div
    style="position: fixed; top: 10px; right: 10px; background: yellow; padding: 5px; z-index: 9999;"
  >
    DEBUG: Count = {selectedCount}
  </div>
  <div
    bind:this={buttonRef}
    class="fixed bottom-8 left-1/2 z-50 -translate-x-1/2 {className}"
    {...restProps}
  >
    <Popover.Root bind:open={formatPopoverOpen}>
      <Popover.Trigger asChild>
        {#snippet child({ props })}
          <Button
            {...props}
            size="lg"
            class="gap-2 bg-primary px-6 py-6 text-base font-medium text-primary-foreground shadow-lg transition-shadow hover:bg-primary/90 hover:shadow-xl"
          >
            <Download class="h-5 w-5" />
            Download ({selectedCount})
          </Button>
        {/snippet}
      </Popover.Trigger>
      <Popover.Content
        class="w-48 p-2"
        align="center"
        side="top"
        sideOffset={8}
      >
        <div class="flex flex-col gap-1">
          <Button
            variant="ghost"
            size="sm"
            class="w-full justify-start hover:bg-accent"
            onclick={() => handleDownload("svg")}
          >
            SVG
          </Button>
          <Button
            variant="ghost"
            size="sm"
            class="w-full justify-start hover:bg-accent"
            onclick={() => handleDownload("png")}
          >
            PNG
          </Button>
        </div>
      </Popover.Content>
    </Popover.Root>
  </div>
{/if}
