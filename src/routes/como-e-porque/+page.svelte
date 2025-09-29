<script>
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "$lib/components/ui/card";
import { Button } from "$lib/components/ui/button";
import { Badge } from "$lib/components/ui/badge";
import { Separator } from "$lib/components/ui/separator";
import { Code, Palette, Database, Zap, Target, Check } from "lucide-svelte";
</script>

<svelte:head>
  <title>Como e Porquê - Banco Icons</title>
  <meta
    name="description"
    content="Conheça o processo de desenvolvimento e a motivação por trás da criação do Banco Icons"
  />
</svelte:head>

<div class="min-h-screen bg-background">
  <div class="container mx-auto px-4 py-8">
    <!-- Header -->
    <div class="mb-12 text-center">
      <h1 class="mb-4 text-4xl font-bold text-primary">Como e Porquê</h1>
      <p class="mx-auto max-w-3xl text-xl text-muted-foreground">
        Descubra o processo de desenvolvimento e a motivação por trás da criação
        desta aplicação de ícones bancários
      </p>
    </div>

    <div class="space-y-8">
      <!-- Como (How) Section -->
      <Card class="border-border bg-card">
        <CardHeader>
          <CardTitle class="flex items-center gap-3 text-2xl">
            <Code class="h-6 w-6 text-blue-500" />
            Como
            <Badge variant="secondary">Processo Técnico</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent class="space-y-6">
          <div class="prose prose-invert max-w-none">
            <p class="text-lg leading-relaxed text-muted-foreground">
              Esta aplicação foi construída utilizando tecnologias modernas e
              uma abordagem sistemática para garantir qualidade e performance.
            </p>
          </div>

          <Separator />

          <!-- Technical Stack -->
          <div class="space-y-4">
            <h3 class="flex items-center gap-2 text-xl font-semibold">
              <Zap class="h-5 w-5 text-yellow-500" />
              Stack Tecnológico
            </h3>
            <div class="grid gap-4 md:grid-cols-2">
              <div class="space-y-3">
                <div class="flex items-center gap-3">
                  <Check class="h-4 w-4 text-green-500" />
                  <span
                    ><strong>Svelte 5</strong> - Framework reativo com runes</span
                  >
                </div>
                <div class="flex items-center gap-3">
                  <Check class="h-4 w-4 text-green-500" />
                  <span><strong>SvelteKit</strong> - Framework full-stack</span>
                </div>
                <div class="flex items-center gap-3">
                  <Check class="h-4 w-4 text-green-500" />
                  <span
                    ><strong>Tailwind CSS v4</strong> - Estilização utilitária</span
                  >
                </div>
              </div>
              <div class="space-y-3">
                <div class="flex items-center gap-3">
                  <Check class="h-4 w-4 text-green-500" />
                  <span
                    ><strong>ShadCN-Svelte</strong> - Componentes UI acessíveis</span
                  >
                </div>
                <div class="flex items-center gap-3">
                  <Check class="h-4 w-4 text-green-500" />
                  <span><strong>Vite</strong> - Build tool otimizado</span>
                </div>
                <div class="flex items-center gap-3">
                  <Check class="h-4 w-4 text-green-500" />
                  <span><strong>Lucide Icons</strong> - Ícones modernos</span>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          <!-- Development Process -->
          <div class="space-y-4">
            <h3 class="flex items-center gap-2 text-xl font-semibold">
              <Palette class="h-5 w-5 text-purple-500" />
              Processo de Conversão
            </h3>
            <div class="space-y-4">
              <div class="rounded-lg border border-border bg-muted/20 p-4">
                <h4 class="mb-2 font-semibold">1. Coleta e Padronização</h4>
                <p class="text-muted-foreground">
                  Todos os logos foram coletados de fontes oficiais e
                  convertidos para o formato SVG, garantindo máxima qualidade e
                  escalabilidade.
                </p>
              </div>
              <div class="rounded-lg border border-border bg-muted/20 p-4">
                <h4 class="mb-2 font-semibold">2. Otimização Técnica</h4>
                <p class="text-muted-foreground">
                  Cada SVG foi otimizado para reduzir o tamanho do arquivo,
                  remover elementos desnecessários e garantir compatibilidade
                  com diferentes navegadores.
                </p>
              </div>
              <div class="rounded-lg border border-border bg-muted/20 p-4">
                <h4 class="mb-2 font-semibold">
                  3. Sistema de Cores Inteligente
                </h4>
                <p class="text-muted-foreground">
                  Implementação de um sistema que permite modificação de cores
                  em tempo real, mantendo a integridade visual dos logos.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <!-- Porquê (Why) Section -->
      <Card class="border-border bg-card">
        <CardHeader>
          <CardTitle class="flex items-center gap-3 text-2xl">
            <Target class="h-6 w-6 text-green-500" />
            Porquê
            <Badge variant="secondary">Motivação</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent class="space-y-6">
          <div class="prose prose-invert max-w-none">
            <p class="text-lg leading-relaxed text-muted-foreground">
              A criação desta aplicação surgiu da necessidade de resolver um
              problema comum enfrentado por desenvolvedores e designers.
            </p>
          </div>

          <Separator />

          <!-- Problem Statement -->
          <div class="space-y-4">
            <h3 class="flex items-center gap-2 text-xl font-semibold">
              <Database class="h-5 w-5 text-red-500" />
              O Desafio
            </h3>
            <div class="space-y-4">
              <div class="rounded-lg border border-red-200/20 bg-red-500/5 p-4">
                <h4 class="mb-2 font-semibold text-red-400">
                  Dispersão de Recursos
                </h4>
                <p class="text-muted-foreground">
                  Os logos dos bancos estavam espalhados em diferentes fontes,
                  com qualidades variadas e formatos inconsistentes,
                  dificultando o uso em projetos.
                </p>
              </div>
              <div class="rounded-lg border border-red-200/20 bg-red-500/5 p-4">
                <h4 class="mb-2 font-semibold text-red-400">
                  Falta de Padronização
                </h4>
                <p class="text-muted-foreground">
                  Muitos logos necessitavam de ajustes manuais e correções para
                  manter consistência visual e técnica adequada.
                </p>
              </div>
              <div class="rounded-lg border border-red-200/20 bg-red-500/5 p-4">
                <h4 class="mb-2 font-semibold text-red-400">
                  Tempo de Desenvolvimento
                </h4>
                <p class="text-muted-foreground">
                  Desenvolvedores perdiam tempo procurando, baixando e ajustando
                  logos individualmente para cada projeto.
                </p>
              </div>
            </div>
          </div>

          <Separator />

          <!-- Solution -->
          <div class="space-y-4">
            <h3 class="flex items-center gap-2 text-xl font-semibold">
              <Check class="h-5 w-5 text-green-500" />
              A Solução
            </h3>
            <div class="space-y-4">
              <div
                class="rounded-lg border border-green-200/20 bg-green-500/5 p-4"
              >
                <h4 class="mb-2 font-semibold text-green-400">Centralização</h4>
                <p class="text-muted-foreground">
                  Todos os logos bancários em um só lugar, com acesso rápido e
                  organizado por instituição financeira.
                </p>
              </div>
              <div
                class="rounded-lg border border-green-200/20 bg-green-500/5 p-4"
              >
                <h4 class="mb-2 font-semibold text-green-400">
                  Padronização Completa
                </h4>
                <p class="text-muted-foreground">
                  Formato SVG otimizado, tamanhos consistentes e qualidade
                  garantida para uso profissional.
                </p>
              </div>
              <div
                class="rounded-lg border border-green-200/20 bg-green-500/5 p-4"
              >
                <h4 class="mb-2 font-semibold text-green-400">
                  Customização em Tempo Real
                </h4>
                <p class="text-muted-foreground">
                  Possibilidade de ajustar cores, tamanhos e visualizar mudanças
                  instantaneamente antes do download.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <!-- Call to Action -->
      <Card class="border-border bg-card">
        <CardContent class="py-8 text-center">
          <h3 class="mb-4 text-xl font-semibold">Pronto para usar?</h3>
          <p class="mb-6 text-muted-foreground">
            Explore nossa coleção completa de ícones bancários e acelere seu
            desenvolvimento.
          </p>
          <Button onclick={() => window.location.href = '/'} class="px-8">
            Começar Agora
          </Button>
        </CardContent>
      </Card>
    </div>
  </div>
</div>
