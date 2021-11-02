<template lang="pug">
router-view
footer.footer(v-if="includeFooter")
	|	Built by
	a(href="https://himanshupal.xyz" target="_blank") @himanshupal
	| using
	a(href="https://v3.vuejs.org" target="_blank") Vue3,
	a(href="https://pugjs.org" target="_blank") Pug
	| &amp;
	a(href="https://golang.org" target="_blank") Go
</template>

<script lang="ts">
import { defineComponent, onBeforeMount, ref } from 'vue'

export default defineComponent({
	name: 'Layout',

	setup() {
		const includeFooter = ref<boolean>(true)

		const hideFooterIn = [`/404`]

		onBeforeMount(() => {
			includeFooter.value = !hideFooterIn.includes(location.pathname)
		})

		return {
			includeFooter
		}
	}
})
</script>

<style lang="scss">
@import './styles/global.scss';
</style>
