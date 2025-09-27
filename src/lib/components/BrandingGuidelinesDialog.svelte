<script>
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "$lib/components/ui/dialog";

import TriangleAlertIcon from "@lucide/svelte/icons/triangle-alert";
import XIcon from "@lucide/svelte/icons/x";
import AlertCircleIcon from "@lucide/svelte/icons/alert-circle";
import { cn } from "$lib/utils.js";

let { class: className = "", ...restProps } = $props();
let isOpen = $state(false);

function openDialog() {
  isOpen = true;
}

function closeDialog() {
  isOpen = false;
}
</script>

<div class="absolute top-3 right-3 z-20">
  <Dialog bind:open={isOpen}>
    <DialogTrigger asChild>
      <button
        class={cn(
          "cursor-pointer rounded-full p-1 transition-all duration-200 hover:bg-yellow-500/20",
          "hover:scale-110",
          className
        )}
        onclick={openDialog}
        {...restProps}
      >
        <TriangleAlertIcon class="h-5 w-5 text-yellow-500 drop-shadow-sm" />
      </button>
    </DialogTrigger>

    <DialogContent
      class="max-h-[80vh] max-w-2xl overflow-y-auto"
      portalProps={{}}
      showCloseButton={false}
    >
      <DialogHeader class="relative">
        <div class="mb-4 flex items-center gap-3">
          <div
            class="flex h-10 w-10 items-center justify-center rounded-full bg-yellow-100"
          >
            <TriangleAlertIcon class="h-5 w-5 text-yellow-600" />
          </div>
          <DialogTitle class="text-xl font-semibold text-foreground">
            Diretrizes de Branding
          </DialogTitle>
        </div>
        <button
          class="absolute top-0 right-0 h-8 w-8 rounded-sm p-0 opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:outline-none disabled:pointer-events-none"
          onclick={closeDialog}
        >
          <XIcon class="h-4 w-4" />
          <span class="sr-only">Fechar</span>
        </button>
      </DialogHeader>

      <div class="space-y-4">
        <p class="text-sm text-white">
          Os ícones de bancos com cores personalizadas devem ser utilizados
          <strong>exclusivamente em aplicações internas</strong>. Para
          aplicações públicas, sempre utilize as cores oficiais da marca.
        </p>

        <p class="text-sm text-white">
          A manutenção da consistência visual é essencial para o reconhecimento
          da marca e a confiança do usuário. Alterações nas cores oficiais podem
          comprometer a identidade visual estabelecida.
        </p>

        <div class="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
          <div class="flex items-start gap-3">
            <AlertCircleIcon
              class="mt-0.5 h-5 w-5 flex-shrink-0 text-yellow-600"
            />
            <div>
              <h3 class="mb-2 font-medium text-white">Aviso Importante</h3>
              <p class="text-sm text-white">
                Sempre consulte o manual de identidade visual oficial antes de
                fazer alterações e mantenha um registro das aprovações para uso
                de cores personalizadas.
              </p>
            </div>
          </div>
        </div>
      </div>
    </DialogContent>
  </Dialog>
</div>
