<template lang="pug">
Header(:title="username")
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { useRoute } from 'vue-router'
import Header from '../components/Header.vue'

export default defineComponent({
	name: 'Links',

	components: {
		Header
	},

	setup() {
		const { params } = useRoute()
		const { username } = params

		return {
			username
		}
	}
})
</script>
