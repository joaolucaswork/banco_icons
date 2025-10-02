<script>
import * as Command from "$lib/components/ui/command";
import * as Popover from "$lib/components/ui/popover";
import { Button } from "$lib/components/ui/button";
import { getBankDisplayName } from "$lib/utils/svg-utils.js";
import { cn } from "$lib/utils.js";

import { Check, ChevronsUpDown } from "lucide-svelte";

let {
  selectedLogo = $bindable(),
  logos = new Map(),
  loading = false,
  onLogoSelect = () => {},
  class: className = "",
  placeholder = "Selecionar Instituição",
  ...restProps
} = $props();

// Convert logos Map to array for easier handling
let logoOptions = $derived(Array.from(logos.keys()));

let open = $state(false);
// Get the display value for the selected logo
let selectedDisplayName = $derived(
  selectedLogo ? getBankDisplayName(selectedLogo) : "",
);

// We want to close the popover when the user selects an item
function closeAndFocusTrigger(selectedValue) {
  open = false;
  if (selectedValue && logos.has(selectedValue)) {
    selectedLogo = selectedValue;
    onLogoSelect(selectedValue);
  }
}
</script>

<div class={cn("w-full sm:w-auto", className)} {...restProps}>
  <Popover.Root bind:open={open}>
    <Popover.Trigger asChild class="w-full sm:w-auto">
      {#snippet child({ props })}
        <Button
          {...props}
          variant="ghost"
          role="combobox"
          aria-expanded={open}
          disabled={loading}
          class="h-14 w-full justify-between border-0 bg-transparent px-4 py-4 hover:bg-transparent sm:h-12 sm:w-auto sm:px-12 sm:py-6"
        >
          <div class="flex items-center">
            {#if selectedLogo && logos.has(selectedLogo)}
              <!-- Selected bank name only -->
              <span
                class="text-left text-xl font-bold tracking-tight whitespace-nowrap sm:text-2xl md:text-3xl"
              >
                {selectedDisplayName}
              </span>
            {:else}
              <!-- Placeholder -->
              <span
                class="text-left text-xl font-bold tracking-tight whitespace-nowrap text-muted-foreground sm:text-2xl md:text-3xl"
              >
                {placeholder}
              </span>
            {/if}
          </div>
          <ChevronsUpDown
            class="ml-2 h-5 w-5 shrink-0 opacity-50 sm:h-6 sm:w-6"
          />
        </Button>
      {/snippet}
    </Popover.Trigger>
    <Popover.Content
      class="bg-background p-0"
      style="width: var(--bits-popover-trigger-width) !important; min-width: var(--bits-popover-trigger-width) !important; max-width: var(--bits-popover-trigger-width) !important; border: 1px solid #ffffff !important; box-sizing: border-box !important; border-radius: 0.5rem !important;"
      side="bottom"
      align="start"
      sideOffset={4}
      portalProps={{}}
    >
      <Command.Root class="border-0 bg-background">
        <Command.List class="border-0 bg-background py-2">
          <Command.Empty class="bg-background px-4 py-3"
            >Nenhuma instituição encontrada.</Command.Empty
          >
          <Command.Group class="bg-background px-2" heading="" value="">
            {#if loading}
              <!-- Loading state -->
              <div class="px-2 py-4 text-center text-sm text-muted-foreground">
                Carregando instituições...
              </div>
            {:else if logoOptions.length === 0}
              <!-- Empty state -->
              <div class="px-2 py-4 text-center text-sm text-muted-foreground">
                Nenhuma instituição disponível
              </div>
            {:else}
              <!-- Logo options -->
              {#each logoOptions as logoName}
                <Command.Item
                  value={logoName}
                  class="mb-1 px-4 py-3 last:mb-0 hover:bg-accent/30 aria-selected:bg-accent/50"
                  onSelect={() => {
                    closeAndFocusTrigger(logoName);
                  }}
                >
                  <div class="flex w-full items-center gap-3">
                    <span class="flex-1 text-left text-sm font-medium">
                      {getBankDisplayName(logoName)}
                    </span>
                    <Check
                      class={cn(
                        "ml-auto h-4 w-4 shrink-0",
                        selectedLogo === logoName ? "opacity-100" : "opacity-0"
                      )}
                    />
                  </div>
                </Command.Item>
              {/each}
            {/if}
          </Command.Group>
        </Command.List>
      </Command.Root>
    </Popover.Content>
  </Popover.Root>
</div>
