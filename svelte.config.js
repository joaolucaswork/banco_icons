import adapter from "@sveltejs/adapter-vercel";
import { injectSpeedInsights } from "@vercel/speed-insights/sveltekit";

injectSpeedInsights();

/** @type {import('@sveltejs/kit').Config} */
const config = { kit: { adapter: adapter() } };

export default config;
