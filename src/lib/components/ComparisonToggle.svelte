<script>
import { Button } from "$lib/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "$lib/components/ui/tooltip";
import { GitCompare, Square } from "lucide-svelte";
import { hasOriginalLogo } from "$lib/utils/original-logos.js";
import { cn } from "$lib/utils.js";

let {
  showComparison = $bindable(false),
  selectedLogo = null,
  class: className = "",
  ...restProps
} = $props();

// Check if original logo is available for the selected logo
let hasOriginal = $derived(
  selectedLogo ? hasOriginalLogo(selectedLogo) : false,
);

function toggleComparison() {
  showComparison = !showComparison;
}
</script>

{#if hasOriginal}
  <TooltipProvider delayDuration={300}>
    <Tooltip disableHoverableContent={false} disableCloseOnTriggerClick={true}>
      <TooltipTrigger asChild>
        {#snippet child({ props })}
          <Button
            {...props}
            {...restProps}
            variant="outline"
            size="icon"
            class={cn(
              "h-10 w-10 transition-all duration-200",
              className
            )}
            onclick={toggleComparison}
          >
            {#if showComparison}
              <Square class="h-5 w-5" />
            {:else}
              <GitCompare class="h-5 w-5" />
            {/if}
          </Button>
        {/snippet}
      </TooltipTrigger>
      <TooltipContent
        side="left"
        align="center"
        sideOffset={8}
        class=""
        arrowClasses=""
      >
        <p class="text-sm">
          {showComparison ? "Visualização única" : "Comparar lado a lado"}
        </p>
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
{/if}
