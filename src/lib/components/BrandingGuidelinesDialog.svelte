<script>
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "$lib/components/ui/dialog";
import { Card, CardContent } from "$lib/components/ui/card";

import TriangleAlertIcon from "@lucide/svelte/icons/triangle-alert";
import XIcon from "@lucide/svelte/icons/x";
import AlertCircleIcon from "@lucide/svelte/icons/alert-circle";
import ExternalLinkIcon from "@lucide/svelte/icons/external-link";
import { cn } from "$lib/utils.js";

let { class: className = "", ...restProps } = $props();
let isOpen = $state(false);

function openDialog() {
  isOpen = true;
}

function closeDialog() {
  isOpen = false;
}

// Links de referência para guias de estilo oficiais dos bancos disponíveis no projeto
const brandGuidelineLinks = [
  {
    name: "Banco Itaú",
    url: "https://www.itau.com.br/feito-de-futuro",
    description: "Identidade visual e história da marca Itaú",
  },
  {
    name: "Banco Bradesco",
    url: "https://banco.bradesco/marca",
    description: "Manual de identidade visual e diretrizes da marca",
  },
  {
    name: "Banco do Brasil",
    url: "https://www.bb.com.br",
    description: "Site oficial do Banco do Brasil",
  },
  {
    name: "BTG Pactual",
    url: "https://www.btgpactual.com/mx/assets/images/our-dna/press/download/Guide.BTGPactual_PT.pdf",
    description: "Manual de marca e linguagem visual (PDF)",
  },
  {
    name: "Caixa Econômica Federal",
    url: "https://www.caixa.gov.br/Downloads/a-caixa-marcas-e-manuais/manual-de-identidade-visual-loterias-caixa.pdf",
    description: "Manual de identidade visual oficial (PDF)",
  },
  {
    name: "XP Investimentos",
    url: "https://www.xpi.com.br",
    description: "Site oficial da XP Investimentos",
  },
  {
    name: "Ágora Investimentos",
    url: "https://www.agorainvestimentos.com.br",
    description: "Site oficial da Ágora Investimentos",
  },
];
</script>

<div>
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

      <div class="space-y-6">
        <p class="text-sm text-foreground">
          Os ícones de bancos com cores personalizadas devem ser utilizados
          <strong>exclusivamente em aplicações internas</strong>. Para
          aplicações públicas, sempre utilize as cores oficiais da marca.
        </p>

        <p class="text-sm text-foreground">
          A manutenção da consistência visual é essencial para o reconhecimento
          da marca e a confiança do usuário. Alterações nas cores oficiais podem
          comprometer a identidade visual estabelecida.
        </p>

        <!-- Card de aviso com contraste adequado -->
        <Card
          class="border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950/20"
        >
          <CardContent class="p-4">
            <div class="flex items-start gap-3">
              <AlertCircleIcon
                class="mt-0.5 h-5 w-5 flex-shrink-0 text-yellow-600 dark:text-yellow-500"
              />
              <div>
                <h3
                  class="mb-2 font-medium text-yellow-900 dark:text-yellow-100"
                >
                  Aviso Importante
                </h3>
                <p class="text-sm text-yellow-800 dark:text-yellow-200">
                  Sempre consulte o manual de identidade visual oficial antes de
                  fazer alterações e mantenha um registro das aprovações para
                  uso de cores personalizadas.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <!-- Seção de links de referência -->
        <div class="space-y-4">
          <h3 class="text-lg font-semibold text-foreground">
            Guias de Estilo Oficiais
          </h3>
          <p class="text-sm text-muted-foreground">
            Consulte os manuais de identidade visual oficiais das instituições
            financeiras:
          </p>

          <div class="grid gap-3">
            {#each brandGuidelineLinks as link}
              <a
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                class="group flex items-center justify-between rounded-lg border border-border bg-card p-3 transition-colors hover:bg-accent hover:text-accent-foreground"
              >
                <div class="flex-1">
                  <div class="font-medium text-foreground">{link.name}</div>
                  <div class="text-sm text-muted-foreground">
                    {link.description}
                  </div>
                </div>
                <ExternalLinkIcon
                  class="h-4 w-4 text-muted-foreground transition-colors group-hover:text-accent-foreground"
                />
              </a>
            {/each}
          </div>
        </div>
      </div>
    </DialogContent>
  </Dialog>
</div>
