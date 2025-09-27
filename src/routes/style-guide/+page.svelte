<script>
  import { Button } from "$lib/components/ui/button";
  import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "$lib/components/ui/card";
  import { Input } from "$lib/components/ui/input";
  import { Label } from "$lib/components/ui/label";
  import { Textarea } from "$lib/components/ui/textarea";
  import { Checkbox } from "$lib/components/ui/checkbox";
  import { Switch } from "$lib/components/ui/switch";
  import { Badge } from "$lib/components/ui/badge";
  import { Alert, AlertDescription, AlertTitle } from "$lib/components/ui/alert";
  import { Progress } from "$lib/components/ui/progress";
  import { Separator } from "$lib/components/ui/separator";
  import { Skeleton } from "$lib/components/ui/skeleton";
  import { AlertCircle } from "lucide-svelte";

  let switchChecked = false;
  let checkboxChecked = false;
  let progressValue = 60;
</script>

<div class="min-h-screen">
  <div class="container mx-auto px-4 py-16">
    <!-- Header -->
    <div class="mb-16 text-center">
      <h1 class="mb-4 text-4xl text-primary">Style Guide</h1>
      <p class="mx-auto max-w-2xl text-xl text-secondary">
        Referência visual dos componentes principais do projeto
      </p>
    </div>

    <!-- Typography Section -->
    <section class="mb-16">
      <h2 class="mb-8 text-3xl text-primary">Typography</h2>
      <Card>
        <CardHeader>
          <CardTitle class="text-primary">Hierarquia de Texto</CardTitle>
          <CardDescription class="text-secondary">Fonte Satoshi Medium (500) com hierarquia por opacidade</CardDescription>
        </CardHeader>
        <CardContent class="space-y-6">
          <div class="space-y-4">
            <h1 class="text-4xl text-primary">Heading 1 - text-primary</h1>
            <h2 class="text-3xl text-primary">Heading 2 - text-primary</h2>
            <h3 class="text-2xl text-primary">Heading 3 - text-primary</h3>
            <h4 class="text-xl text-primary">Heading 4 - text-primary</h4>
          </div>
          <Separator />
          <div class="space-y-2">
            <p class="text-primary">Parágrafo principal - text-primary (opacity: 100%)</p>
            <p class="text-secondary">Parágrafo secundário - text-secondary (opacity: 80%)</p>
            <p class="text-muted">Texto auxiliar - text-muted (opacity: 60%)</p>
            <p class="text-subtle">Texto sutil - text-subtle (opacity: 40%)</p>
          </div>
        </CardContent>
      </Card>
    </section>

    <!-- Buttons Section -->
    <section class="mb-16">
      <h2 class="mb-8 text-3xl text-primary">Buttons</h2>
      <div class="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle class="text-primary">Variantes</CardTitle>
          </CardHeader>
          <CardContent>
            <div class="flex flex-wrap gap-2">
              <Button>Default</Button>
              <Button variant="destructive">Destructive</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="link">Link</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle class="text-primary">Tamanhos</CardTitle>
          </CardHeader>
          <CardContent>
            <div class="flex flex-wrap items-center gap-2">
              <Button size="sm">Small</Button>
              <Button>Default</Button>
              <Button size="lg">Large</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>

    <!-- Forms Section -->
    <section class="mb-16">
      <h2 class="mb-8 text-3xl text-primary">Forms</h2>
      <div class="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle class="text-primary">Inputs</CardTitle>
          </CardHeader>
          <CardContent class="space-y-4">
            <div class="space-y-2">
              <Label class="text-primary">Input Label</Label>
              <Input placeholder="Digite algo..." />
            </div>
            <div class="space-y-2">
              <Label class="text-primary">Textarea Label</Label>
              <Textarea placeholder="Digite uma mensagem..." />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle class="text-primary">Controles</CardTitle>
          </CardHeader>
          <CardContent class="space-y-6">
            <div class="flex items-center space-x-2">
              <Checkbox bind:checked={checkboxChecked} />
              <Label class="text-primary">Checkbox</Label>
            </div>
            
            <div class="flex items-center space-x-2">
              <Switch bind:checked={switchChecked} />
              <Label class="text-primary">Switch</Label>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>

    <!-- Feedback Section -->
    <section class="mb-16">
      <h2 class="mb-8 text-3xl text-primary">Feedback</h2>
      <div class="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle class="text-primary">Alert</CardTitle>
          </CardHeader>
          <CardContent>
            <Alert>
              <AlertCircle class="h-4 w-4" />
              <AlertTitle class="text-primary">Atenção!</AlertTitle>
              <AlertDescription class="text-secondary">
                Este é um alerta com informações importantes.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle class="text-primary">Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div class="space-y-2">
              <div class="flex justify-between">
                <span class="text-sm text-secondary">Progresso</span>
                <span class="text-sm text-muted">{progressValue}%</span>
              </div>
              <Progress value={progressValue} class="w-full" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle class="text-primary">Badges</CardTitle>
          </CardHeader>
          <CardContent>
            <div class="flex flex-wrap gap-2">
              <Badge>Default</Badge>
              <Badge variant="secondary">Secondary</Badge>
              <Badge variant="destructive">Destructive</Badge>
              <Badge variant="outline">Outline</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle class="text-primary">Skeleton</CardTitle>
          </CardHeader>
          <CardContent>
            <div class="space-y-2">
              <Skeleton class="h-4 w-full" />
              <Skeleton class="h-4 w-4/5" />
              <Skeleton class="h-4 w-3/5" />
            </div>
          </CardContent>
        </Card>
      </div>
    </section>

    <!-- Back to Home -->
    <div class="text-center">
      <Button variant="outline" on:click={() => window.location.href = '/'}>
        Voltar ao Início
      </Button>
    </div>
  </div>
</div>
