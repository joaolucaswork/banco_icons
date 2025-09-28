<script>
import { Button } from "$lib/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "$lib/components/ui/tooltip";
import { Eye, EyeOff } from "lucide-svelte";
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

<div class={cn("absolute top-3 right-14 z-20", className)} {...restProps}>
  {#if hasOriginal}
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          {#snippet child({ props })}
            <Button
              {...props}
              variant="secondary"
              size="icon"
              class="h-8 w-8 bg-background/80 backdrop-blur-sm transition-all duration-200 hover:bg-background/90"
              onclick={toggleComparison}
            >
              {#if showComparison}
                <EyeOff class="h-4 w-4" />
              {:else}
                <Eye class="h-4 w-4" />
              {/if}
            </Button>
          {/snippet}
        </TooltipTrigger>
        <TooltipContent side="left" align="center" sideOffset={8}>
          <p class="text-sm">
            {showComparison ? "Ocultar comparação" : "Comparar com original"}
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  {/if}
</div>
