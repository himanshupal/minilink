<template>
	<div class="h-screen grid gap-4 place-content-center text-center dark:bg-gray-900 dark:text-gray-100">
		<div class="text-9xl rounded border-2 bg-yellow-300 font-retro p-4">{{ count }}</div>

		<div class="flex gap-4 items-center justify-center">
			<button @click="count++" class="text-6xl text-green-600">+</button>
			<button @click="count--" class="text-6xl text-red-600">-</button>
		</div>

		<div class="font-retro">I am RETRO</div>
		<div class="font-sans">I am SANS</div>
		<div class="font-serif">I am SANS-SERIF</div>
	</div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'

export default defineComponent({
	name: 'Home',

	setup() {
		const count = ref<number>(0)

		return {
			count
		}
	}
})
</script>
