
// this file is generated — do not edit it


declare module "svelte/elements" {
	export interface HTMLAttributes<T> {
		'data-sveltekit-keepfocus'?: true | '' | 'off' | undefined | null;
		'data-sveltekit-noscroll'?: true | '' | 'off' | undefined | null;
		'data-sveltekit-preload-code'?:
			| true
			| ''
			| 'eager'
			| 'viewport'
			| 'hover'
			| 'tap'
			| 'off'
			| undefined
			| null;
		'data-sveltekit-preload-data'?: true | '' | 'hover' | 'tap' | 'off' | undefined | null;
		'data-sveltekit-reload'?: true | '' | 'off' | undefined | null;
		'data-sveltekit-replacestate'?: true | '' | 'off' | undefined | null;
	}
}

export {};


declare module "$app/types" {
	export interface AppTypes {
		RouteId(): "/" | "/icon-controller" | "/style-guide";
		RouteParams(): {
			
		};
		LayoutParams(): {
			"/": Record<string, never>;
			"/icon-controller": Record<string, never>;
			"/style-guide": Record<string, never>
		};
		Pathname(): "/" | "/icon-controller" | "/icon-controller/" | "/style-guide" | "/style-guide/";
		ResolvedPathname(): `${"" | `/${string}`}${ReturnType<AppTypes['Pathname']>}`;
		Asset(): "/favicon.svg" | "/logo-webflow.svg" | "/logo_original/BTG.svg" | "/logo_original/Banco do brasil.svg" | "/logo_original/Bradesco.svg" | "/logo_original/Caixa.svg" | "/logo_original/Itau.svg" | "/logo_original/XP CORRETORA.svg" | "/logo_original/banco-agora.svg" | "/logos_bancos/.DS_Store" | "/logos_bancos/agora-investimentos.svg" | "/logos_bancos/banco-bradesco.svg" | "/logos_bancos/banco-brasil.svg" | "/logos_bancos/banco-itau.svg" | "/logos_bancos/btg-pactual.svg" | "/logos_bancos/caixa-economica.svg" | "/logos_bancos/index.ts" | "/logos_bancos/xp-investimentos.svg" | string & {};
	}
}