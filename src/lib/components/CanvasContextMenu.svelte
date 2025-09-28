<script>
import * as ContextMenu from "$lib/components/ui/context-menu";
// Icons removed for more compact design
import { toast } from "svelte-sonner";
import {
  downloadSvgAsPng,
  downloadSvgAsFile,
  copyToClipboard,
  getBankDisplayName,
} from "$lib/utils/svg-utils.js";

let {
  children,
  svgContent = null,
  selectedLogo = null,
  exportSize = 24,
  exportColor = "#ffffff",
  formattedSvg = null,
  onReset = () => {},
  class: className = "",
  ...restProps
} = $props();

// Handle SVG download
async function handleDownloadSvg() {
  if (!formattedSvg || !selectedLogo) {
    toast.error("Nenhum logo selecionado para download.");
    return;
  }

  const filename = `${selectedLogo}-${exportSize}px`;
  const success = downloadSvgAsFile(formattedSvg, filename);

  if (success) {
    const bankName = getBankDisplayName(selectedLogo);
    toast.success(`${bankName} baixado como SVG!`);
  } else {
    toast.error("Falha ao baixar SVG. Tente novamente.");
  }
}

// Handle PNG download
async function handleDownloadPng() {
  if (!svgContent || !selectedLogo) {
    toast.error("Nenhum logo selecionado para download.");
    return;
  }

  const filename = `${selectedLogo}-${exportSize}px`;
  const success = await downloadSvgAsPng(svgContent, filename, exportSize);

  if (success) {
    const bankName = getBankDisplayName(selectedLogo);
    toast.success(`${bankName} baixado como PNG!`);
  } else {
    toast.error("Falha ao baixar PNG. Tente novamente.");
  }
}

// Handle copy SVG to clipboard
async function handleCopySvg() {
  if (!formattedSvg || !selectedLogo) {
    toast.error("Nenhum logo selecionado para copiar.");
    return;
  }

  const bankName = getBankDisplayName(selectedLogo);
  const success = await copyToClipboard(formattedSvg);

  if (success) {
    toast.success(`Código SVG do ${bankName} copiado!`);
  } else {
    toast.error("Falha ao copiar código SVG. Tente novamente.");
  }
}

// Handle copy PNG to clipboard
async function handleCopyPng() {
  if (!svgContent || !selectedLogo) {
    toast.error("Nenhum logo selecionado para copiar.");
    return;
  }

  try {
    // Create a canvas to convert SVG to PNG
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    canvas.width = exportSize;
    canvas.height = exportSize;

    const img = new Image();
    const svgBlob = new Blob([svgContent], {
      type: "image/svg+xml;charset=utf-8",
    });
    const svgUrl = URL.createObjectURL(svgBlob);

    img.onload = async () => {
      ctx?.drawImage(img, 0, 0, exportSize, exportSize);

      canvas.toBlob(async (blob) => {
        if (blob && navigator.clipboard && navigator.clipboard.write) {
          try {
            await navigator.clipboard.write([
              new ClipboardItem({ "image/png": blob }),
            ]);

            const bankName = getBankDisplayName(selectedLogo);
            toast.success(`Imagem PNG do ${bankName} copiada!`);
          } catch (error) {
            toast.error("Falha ao copiar PNG. Tente novamente.");
          }
        } else {
          toast.error("Cópia de imagem não suportada neste navegador.");
        }
        URL.revokeObjectURL(svgUrl);
      }, "image/png");
    };

    img.onerror = () => {
      URL.revokeObjectURL(svgUrl);
      toast.error("Falha ao processar imagem para cópia.");
    };

    img.src = svgUrl;
  } catch (error) {
    toast.error("Falha ao copiar PNG. Tente novamente.");
  }
}

// Handle reset canvas
function handleReset() {
  if (!selectedLogo) {
    toast.error("Nenhum logo selecionado para resetar.");
    return;
  }

  onReset();
  const bankName = getBankDisplayName(selectedLogo);
  toast.success(`${bankName} resetado para configurações padrão!`);
}

// Check if any logo is selected
let hasLogo = $derived(selectedLogo && (svgContent || formattedSvg));
</script>

<ContextMenu.Root>
  <ContextMenu.Trigger class={className} {...restProps}>
    {@render children()}
  </ContextMenu.Trigger>

  <ContextMenu.Content
    class="w-48 bg-background text-foreground shadow-lg"
    sideOffset={5}
    portalProps={{}}
  >
    <!-- Baixar SVG -->
    <ContextMenu.Item
      onclick={handleDownloadSvg}
      disabled={!hasLogo}
      inset={false}
      class="px-1.5 py-1.5 text-sm font-medium transition-colors hover:bg-white/15 hover:text-foreground focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
    >
      Baixar SVG
    </ContextMenu.Item>

    <!-- Baixar PNG -->
    <ContextMenu.Item
      onclick={handleDownloadPng}
      disabled={!hasLogo}
      inset={false}
      class="px-1.5 py-1.5 text-sm font-medium transition-colors hover:bg-white/15 hover:text-foreground focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
    >
      Baixar PNG
    </ContextMenu.Item>

    <ContextMenu.Separator class="my-0.5 bg-border" />

    <!-- Copiar SVG -->
    <ContextMenu.Item
      onclick={handleCopySvg}
      disabled={!hasLogo}
      inset={false}
      class="px-1.5 py-1.5 text-sm font-medium transition-colors hover:bg-white/15 hover:text-foreground focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
    >
      Copiar SVG
    </ContextMenu.Item>

    <!-- Copiar PNG -->
    <ContextMenu.Item
      onclick={handleCopyPng}
      disabled={!hasLogo}
      inset={false}
      class="px-1.5 py-1.5 text-sm font-medium transition-colors hover:bg-white/15 hover:text-foreground focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
    >
      Copiar PNG
    </ContextMenu.Item>

    <ContextMenu.Separator class="my-0.5 bg-border" />

    <!-- Resetar -->
    <ContextMenu.Item
      onclick={handleReset}
      disabled={!hasLogo}
      inset={false}
      class="px-1.5 py-1.5 text-sm font-medium transition-colors hover:bg-white/15 hover:text-foreground focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
    >
      Resetar
    </ContextMenu.Item>
  </ContextMenu.Content>
</ContextMenu.Root>
