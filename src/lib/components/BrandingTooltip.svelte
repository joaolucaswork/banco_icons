<script>
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "$lib/components/ui/tooltip";
import TriangleAlertIcon from "@lucide/svelte/icons/triangle-alert";
import { cn } from "$lib/utils.js";

let { class: className = "", ...restProps } = $props();
let isOpen = $state(false);

function handleClick() {
  // Só abre se não estiver aberto, não fecha no clique
  if (!isOpen) {
    isOpen = true;
  }
}

function handleMouseLeave() {
  isOpen = false;
}
</script>

<div class="absolute top-3 right-3 z-20">
  <TooltipProvider>
    <Tooltip open={isOpen}>
      <TooltipTrigger
        class={cn(
          "cursor-pointer rounded-full p-1 transition-all duration-200 hover:bg-yellow-500/20",
          "hover:scale-110",
          className
        )}
        onclick={handleClick}
        onmouseleave={handleMouseLeave}
        {...restProps}
      >
        <TriangleAlertIcon class="h-5 w-5 text-yellow-500 drop-shadow-sm" />
      </TooltipTrigger>
      <TooltipContent
        side="left"
        align="center"
        class="z-50 max-w-xs border-yellow-200 bg-yellow-50 text-yellow-900 shadow-lg"
        arrowClasses="hidden"
        sideOffset={12}
      >
        {#snippet children()}
          <p class="text-sm font-medium">
            Consulte o branding do banco para verificar quais cores são
            permitidas
          </p>
        {/snippet}
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
</div>
