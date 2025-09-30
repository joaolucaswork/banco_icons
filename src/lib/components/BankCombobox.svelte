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

<div class={cn("w-fit", className)} {...restProps}>
  <Popover.Root bind:open={open}>
    <Popover.Trigger asChild class="">
      {#snippet child({ props })}
        <Button
          {...props}
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={loading}
          class="h-12 w-full justify-between px-8 py-4"
        >
          <div class="flex items-center">
            {#if selectedLogo && logos.has(selectedLogo)}
              <!-- Selected bank name only -->
              <span
                class="truncate text-left text-3xl font-bold tracking-tight"
              >
                {selectedDisplayName}
              </span>
            {:else}
              <!-- Placeholder -->
              <span
                class="text-left text-3xl font-bold tracking-tight text-muted-foreground"
              >
                {placeholder}
              </span>
            {/if}
          </div>
          <ChevronsUpDown class="ml-2 h-6 w-6 shrink-0 opacity-50" />
        </Button>
      {/snippet}
    </Popover.Trigger>
    <Popover.Content
      class="w-full p-0"
      style="width: var(--bits-popover-trigger-width);"
      side="bottom"
      align="start"
      sideOffset={4}
      portalProps={{}}
    >
      <Command.Root class="">
        <Command.Input placeholder="Buscar instituição..." class="h-9" />
        <Command.List class="">
          <Command.Empty class="">Nenhuma instituição encontrada.</Command.Empty
          >
          <Command.Group class="" heading="" value="">
            {#if loading}
              <!-- Loading state -->
              <div class="p-4 text-center text-sm text-muted-foreground">
                Carregando instituições...
              </div>
            {:else if logoOptions.length === 0}
              <!-- Empty state -->
              <div class="p-4 text-center text-sm text-muted-foreground">
                Nenhuma instituição disponível
              </div>
            {:else}
              <!-- Logo options -->
              {#each logoOptions as logoName}
                <Command.Item
                  value={logoName}
                  class=""
                  onSelect={() => {
                    closeAndFocusTrigger(logoName);
                  }}
                >
                  <div class="flex w-full items-center">
                    <span class="flex-1 text-left text-sm font-medium">
                      {getBankDisplayName(logoName)}
                    </span>
                    <Check
                      class={cn(
                        "ml-auto h-4 w-4",
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
