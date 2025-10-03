<script>
import { Slider as SliderPrimitive } from "bits-ui";
import { cn } from "$lib/utils.js";

let {
  ref = $bindable(null),
  value = $bindable(),
  orientation = "horizontal",
  class: className,
  ...restProps
} = $props();
</script>

<!--
Discriminated Unions + Destructing (required for bindable) do not
get along, so we shut typescript up by casting `value` to `never`.
-->
<SliderPrimitive.Root
  bind:ref={ref}
  bind:value={value}
  data-slot="slider"
  orientation={orientation}
  class={cn(
		"relative flex w-full touch-none items-center select-none data-[disabled]:opacity-50 data-[orientation=vertical]:h-full data-[orientation=vertical]:min-h-44 data-[orientation=vertical]:w-auto data-[orientation=vertical]:flex-col",
		className
	)}
  {...restProps}
>
  {#snippet children({ thumbs })}
    <span
      data-orientation={orientation}
      data-slot="slider-track"
      class={cn(
				"relative grow overflow-hidden rounded-full data-[orientation=horizontal]:h-1.5 data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full data-[orientation=vertical]:w-1.5"
			)}
      style="background-color: rgba(255, 255, 255, 0.3);"
    >
      <SliderPrimitive.Range
        data-slot="slider-range"
        data-slider-range
        class={cn(
					"absolute bg-primary transition-all duration-200 ease-out data-[orientation=horizontal]:h-full data-[orientation=vertical]:w-full"
				)}
      />
    </span>
    {#each thumbs as thumb (thumb)}
      <SliderPrimitive.Thumb
        data-slot="slider-thumb"
        index={thumb}
        class="block size-4 shrink-0 rounded-full border-2 border-primary shadow-md ring-ring/50 transition-[color,box-shadow] hover:ring-2 focus-visible:ring-2 focus-visible:outline-hidden disabled:pointer-events-none disabled:opacity-50"
        style="background-color: white;"
      />
    {/each}
  {/snippet}
</SliderPrimitive.Root>
