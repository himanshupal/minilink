<template lang="pug">
.loading
	.loading__message {{ loadingMessage }}
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'

export default defineComponent({
	name: 'Loading',

	props: {
		message: {
			type: String
		}
	},

	setup(props) {
		const loadingMessage = ref<string>(``)
		const initialMessage = `Please wait`

		if (!props.message) {
			loadingMessage.value = initialMessage

			const maxDots = 5
			let dots = 0

			setInterval(() => {
				if (dots === maxDots) {
					loadingMessage.value = initialMessage
					dots = 0
				} else {
					loadingMessage.value = loadingMessage.value + `.`.repeat(dots)
					dots++
				}
			}, 100)
		}

		return {
			loadingMessage
		}
	}
})
</script>
