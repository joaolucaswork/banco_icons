<script>
import InstagramIcon from "@lucide/svelte/icons/instagram";
import ActionButtons from "$lib/components/ActionButtons.svelte";
import { viewModeStore } from "$lib/stores/view-mode-store.svelte.js";

function handleViewModeToggle() {
  viewModeStore.toggle();
}
</script>

<header class="sticky top-0 z-[100] w-full border-b border-border">
  <div
    class="container mx-auto flex h-20 items-center justify-between px-6 py-6"
  >
    <!-- Logo Section with Author Info -->
    <div class="flex items-center space-x-6">
      <a
        href="/"
        class="flex items-center space-x-4 transition-opacity hover:opacity-80"
      >
        <!-- Logo -->
        <div class="flex h-10 w-10 items-center justify-center">
          <img
            src="/first_favicon.svg"
            alt="Banco Icons Logo"
            class="h-10 w-10 flex-shrink-0"
            width="40"
            height="40"
          />
        </div>
        <!-- Brand Text -->
        <div class="flex flex-col">
          <span class="text-base font-bold text-foreground">Logo de Banco</span>
          <span class="text-xs text-muted-foreground"
            >Logos de bancos e corretoras</span
          >
        </div>
      </a>

      <!-- Author Info - Moved next to logo -->
      <div class="flex items-center space-x-3 border-l border-border pl-6">
        <span class="hidden text-sm text-muted-foreground sm:block">
          Por Lucas Work
        </span>
        <a
          href="https://www.instagram.com/jlucas.wrk/"
          target="_blank"
          rel="noopener noreferrer"
          class="flex items-center justify-center rounded-md p-2 transition-colors hover:bg-muted"
          aria-label="Seguir no Instagram"
        >
          <InstagramIcon class="h-4 w-4" />
        </a>
      </div>
    </div>

    <!-- Navigation Links (placeholder for future expansion) -->
    <nav class="hidden items-center space-x-6 md:flex">
      <!-- Future navigation items can be added here -->
    </nav>

    <!-- Right Section - View Mode Toggle -->
    <div class="flex items-center">
      <ActionButtons
        selectedLogo={null}
        modifiedSvg={null}
        formattedSvg={null}
        size={256}
        loading={viewModeStore.loading}
        viewMode={viewModeStore.viewMode}
        onViewModeToggle={handleViewModeToggle}
        showOnlyToggle={true}
      />
    </div>
  </div>
</header>
