<script>
	import { Button } from '$lib/components/ui/button';
	import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Heart, Star, Zap } from 'lucide-svelte';
</script>

<div class="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
	<div class="container mx-auto px-4 py-16">
		<!-- Header -->
		<div class="text-center mb-16">
			<h1 class="text-4xl font-bold text-slate-900 dark:text-slate-100 mb-4">
				🏦 Banco Icons
			</h1>
			<p class="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
				Projeto configurado com Svelte 5, SvelteKit, Tailwind CSS v4 e ShadCN-Svelte
			</p>
		</div>

		<!-- Status Cards -->
		<div class="grid md:grid-cols-3 gap-6 mb-12">
			<Card class="border-green-200 bg-green-50 dark:bg-green-950 dark:border-green-800">
				<CardHeader class="flex flex-row items-center space-y-0 pb-2">
					<CardTitle class="text-sm font-medium text-green-800 dark:text-green-200">
						Svelte 5
					</CardTitle>
					<Zap class="h-4 w-4 text-green-600 dark:text-green-400 ml-auto" />
				</CardHeader>
				<CardContent>
					<div class="text-2xl font-bold text-green-900 dark:text-green-100">✅ Configurado</div>
					<CardDescription class="text-green-700 dark:text-green-300">
						Versão mais recente com runes
					</CardDescription>
				</CardContent>
			</Card>

			<Card class="border-blue-200 bg-blue-50 dark:bg-blue-950 dark:border-blue-800">
				<CardHeader class="flex flex-row items-center space-y-0 pb-2">
					<CardTitle class="text-sm font-medium text-blue-800 dark:text-blue-200">
						Tailwind CSS v4
					</CardTitle>
					<Star class="h-4 w-4 text-blue-600 dark:text-blue-400 ml-auto" />
				</CardHeader>
				<CardContent>
					<div class="text-2xl font-bold text-blue-900 dark:text-blue-100">✅ Ativo</div>
					<CardDescription class="text-blue-700 dark:text-blue-300">
						Última versão com @theme inline
					</CardDescription>
				</CardContent>
			</Card>

			<Card class="border-purple-200 bg-purple-50 dark:bg-purple-950 dark:border-purple-800">
				<CardHeader class="flex flex-row items-center space-y-0 pb-2">
					<CardTitle class="text-sm font-medium text-purple-800 dark:text-purple-200">
						ShadCN-Svelte
					</CardTitle>
					<Heart class="h-4 w-4 text-purple-600 dark:text-purple-400 ml-auto" />
				</CardHeader>
				<CardContent>
					<div class="text-2xl font-bold text-purple-900 dark:text-purple-100">✅ Pronto</div>
					<CardDescription class="text-purple-700 dark:text-purple-300">
						Componentes instalados
					</CardDescription>
				</CardContent>
			</Card>
		</div>

		<!-- Demo Form -->
		<Card class="max-w-md mx-auto">
			<CardHeader>
				<CardTitle>Teste dos Componentes</CardTitle>
				<CardDescription>
					Exemplo de formulário usando os componentes ShadCN
				</CardDescription>
			</CardHeader>
			<CardContent class="space-y-4">
				<div class="space-y-2">
					<Label for="name">Nome</Label>
					<Input id="name" placeholder="Digite seu nome" />
				</div>
				<div class="space-y-2">
					<Label for="email">Email</Label>
					<Input id="email" type="email" placeholder="seu@email.com" />
				</div>
				<Button class="w-full">
					Enviar
				</Button>
			</CardContent>
		</Card>

		<!-- Tech Stack -->
		<div class="mt-16 text-center">
			<h2 class="text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-8">
				Stack Tecnológico
			</h2>
			<div class="flex flex-wrap justify-center gap-4">
				{#each ['Svelte 5', 'SvelteKit', 'Tailwind CSS v4', 'ShadCN-Svelte', 'Lucide Icons', 'Vite', 'TypeScript'] as tech}
					<span class="px-3 py-1 bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-full text-sm font-medium">
						{tech}
					</span>
				{/each}
			</div>
		</div>
	</div>
</div>
